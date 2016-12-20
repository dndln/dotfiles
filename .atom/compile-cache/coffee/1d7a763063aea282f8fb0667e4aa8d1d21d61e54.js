(function() {
  var Base, CompositeDisposable, Disposable, MoveToRelativeLine, OperationAbortedError, OperationStack, Select, moveCursorLeft, settings, swrap, _ref, _ref1;

  _ref = require('atom'), Disposable = _ref.Disposable, CompositeDisposable = _ref.CompositeDisposable;

  Base = require('./base');

  moveCursorLeft = require('./utils').moveCursorLeft;

  settings = require('./settings');

  _ref1 = {}, Select = _ref1.Select, MoveToRelativeLine = _ref1.MoveToRelativeLine;

  OperationAbortedError = require('./errors').OperationAbortedError;

  swrap = require('./selection-wrapper');

  OperationStack = (function() {
    Object.defineProperty(OperationStack.prototype, 'mode', {
      get: function() {
        return this.modeManager.mode;
      }
    });

    Object.defineProperty(OperationStack.prototype, 'submode', {
      get: function() {
        return this.modeManager.submode;
      }
    });

    function OperationStack(vimState) {
      var _ref2;
      this.vimState = vimState;
      _ref2 = this.vimState, this.editor = _ref2.editor, this.editorElement = _ref2.editorElement, this.modeManager = _ref2.modeManager;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      if (Select == null) {
        Select = Base.getClass('Select');
      }
      if (MoveToRelativeLine == null) {
        MoveToRelativeLine = Base.getClass('MoveToRelativeLine');
      }
      this.reset();
    }

    OperationStack.prototype.subscribe = function(handler) {
      this.operationSubscriptions.add(handler);
      return handler;
    };

    OperationStack.prototype.reset = function() {
      var _ref2;
      this.resetCount();
      this.stack = [];
      this.processing = false;
      this.vimState.emitDidResetOperationStack();
      if ((_ref2 = this.operationSubscriptions) != null) {
        _ref2.dispose();
      }
      return this.operationSubscriptions = new CompositeDisposable;
    };

    OperationStack.prototype.destroy = function() {
      var _ref2, _ref3;
      this.subscriptions.dispose();
      if ((_ref2 = this.operationSubscriptions) != null) {
        _ref2.dispose();
      }
      return _ref3 = {}, this.stack = _ref3.stack, this.operationSubscriptions = _ref3.operationSubscriptions, _ref3;
    };

    OperationStack.prototype.peekTop = function() {
      return this.stack[this.stack.length - 1];
    };

    OperationStack.prototype.isEmpty = function() {
      return this.stack.length === 0;
    };

    OperationStack.prototype.run = function(klass, properties) {
      var error, operation, type, _ref2;
      try {
        type = typeof klass;
        if (type === 'object') {
          operation = klass;
        } else {
          if (type === 'string') {
            klass = Base.getClass(klass);
          }
          if (((_ref2 = this.peekTop()) != null ? _ref2.constructor : void 0) === klass) {
            operation = new MoveToRelativeLine(this.vimState);
          } else {
            operation = new klass(this.vimState, properties);
          }
        }
        if (operation.isTextObject() && this.mode !== 'operator-pending' || operation.isMotion() && this.mode === 'visual') {
          operation = new Select(this.vimState).setTarget(operation);
        }
        if (this.isEmpty() || (this.peekTop().isOperator() && operation.isTarget())) {
          this.stack.push(operation);
          return this.process();
        } else {
          if (this.peekTop().isOperator()) {
            this.vimState.emitDidFailToSetTarget();
          }
          return this.vimState.resetNormalMode();
        }
      } catch (_error) {
        error = _error;
        return this.handleError(error);
      }
    };

    OperationStack.prototype.runRecorded = function() {
      var count, operation, _ref2;
      if (operation = this.recordedOperation) {
        operation.setRepeated();
        if (this.hasCount()) {
          count = this.getCount();
          operation.count = count;
          if ((_ref2 = operation.target) != null) {
            _ref2.count = count;
          }
        }
        return this.editor.transact((function(_this) {
          return function() {
            return _this.run(operation);
          };
        })(this));
      }
    };

    OperationStack.prototype.runRecordedMotion = function(key, _arg) {
      var operation, reverse;
      reverse = (_arg != null ? _arg : {}).reverse;
      if (!(operation = this.vimState.globalState.get(key))) {
        return;
      }
      operation = operation.clone(this.vimState);
      operation.setRepeated();
      operation.resetCount();
      if (reverse) {
        operation.backwards = !operation.backwards;
      }
      return this.run(operation);
    };

    OperationStack.prototype.runCurrentFind = function(options) {
      return this.runRecordedMotion('currentFind', options);
    };

    OperationStack.prototype.runCurrentSearch = function(options) {
      return this.runRecordedMotion('currentSearch', options);
    };

    OperationStack.prototype.handleError = function(error) {
      this.vimState.reset();
      if (!(error instanceof OperationAbortedError)) {
        throw error;
      }
    };

    OperationStack.prototype.isProcessing = function() {
      return this.processing;
    };

    OperationStack.prototype.process = function() {
      var commandName, operation, top, _base;
      this.processing = true;
      if (this.stack.length === 2) {
        if (!this.peekTop().isComplete()) {
          return;
        }
        operation = this.stack.pop();
        this.peekTop().setTarget(operation);
      }
      top = this.peekTop();
      if (top.isComplete()) {
        return this.execute(this.stack.pop());
      } else {
        if (this.mode === 'normal' && top.isOperator()) {
          this.modeManager.activate('operator-pending');
        }
        if (commandName = typeof (_base = top.constructor).getCommandNameWithoutPrefix === "function" ? _base.getCommandNameWithoutPrefix() : void 0) {
          return this.addToClassList(commandName + "-pending");
        }
      }
    };

    OperationStack.prototype.execute = function(operation) {
      var execution;
      if (this.mode === 'visual') {
        this.vimState.updatePreviousSelection();
      }
      execution = operation.execute();
      if (execution instanceof Promise) {
        return execution.then((function(_this) {
          return function() {
            return _this.finish(operation);
          };
        })(this))["catch"]((function(_this) {
          return function() {
            return _this.handleError();
          };
        })(this));
      } else {
        return this.finish(operation);
      }
    };

    OperationStack.prototype.cancel = function() {
      var _ref2;
      if ((_ref2 = this.mode) !== 'visual' && _ref2 !== 'insert') {
        this.vimState.resetNormalMode();
      }
      return this.finish();
    };

    OperationStack.prototype.finish = function(operation) {
      if (operation == null) {
        operation = null;
      }
      if (operation != null ? operation.isRecordable() : void 0) {
        this.recordedOperation = operation;
      }
      this.vimState.emitter.emit('did-finish-operation');
      if (this.mode === 'normal') {
        this.ensureAllSelectionsAreEmpty(operation);
        this.ensureAllCursorsAreNotAtEndOfLine();
      } else if (this.mode === 'visual') {
        this.modeManager.updateNarrowedState();
        this.vimState.updatePreviousSelection();
      }
      this.vimState.updateCursorsVisibility();
      return this.vimState.reset();
    };

    OperationStack.prototype.ensureAllSelectionsAreEmpty = function(operation) {
      if (!this.editor.getLastSelection().isEmpty()) {
        if (settings.get('throwErrorOnNonEmptySelectionInNormalMode')) {
          throw new Error("Selection is not empty in normal-mode: " + (operation.toString()));
        } else {
          return this.editor.clearSelections();
        }
      }
    };

    OperationStack.prototype.ensureAllCursorsAreNotAtEndOfLine = function() {
      var cursor, _i, _len, _ref2, _results;
      _ref2 = this.editor.getCursors();
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        cursor = _ref2[_i];
        if (cursor.isAtEndOfLine()) {
          _results.push(moveCursorLeft(cursor, {
            preserveGoalColumn: true
          }));
        }
      }
      return _results;
    };

    OperationStack.prototype.addToClassList = function(className) {
      this.editorElement.classList.add(className);
      return this.subscribe(new Disposable((function(_this) {
        return function() {
          return _this.editorElement.classList.remove(className);
        };
      })(this)));
    };

    OperationStack.prototype.hasCount = function() {
      return (this.count['normal'] != null) || (this.count['operator-pending'] != null);
    };

    OperationStack.prototype.getCount = function() {
      var _ref2, _ref3;
      if (this.hasCount()) {
        return ((_ref2 = this.count['normal']) != null ? _ref2 : 1) * ((_ref3 = this.count['operator-pending']) != null ? _ref3 : 1);
      } else {
        return null;
      }
    };

    OperationStack.prototype.setCount = function(number) {
      var mode, _base;
      if (this.mode === 'operator-pending') {
        mode = this.mode;
      } else {
        mode = 'normal';
      }
      if ((_base = this.count)[mode] == null) {
        _base[mode] = 0;
      }
      this.count[mode] = (this.count[mode] * 10) + number;
      this.vimState.hover.add(number);
      return this.vimState.toggleClassList('with-count', true);
    };

    OperationStack.prototype.resetCount = function() {
      this.count = {};
      return this.vimState.toggleClassList('with-count', false);
    };

    return OperationStack;

  })();

  module.exports = OperationStack;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9vcGVyYXRpb24tc3RhY2suY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNKQUFBOztBQUFBLEVBQUEsT0FBb0MsT0FBQSxDQUFRLE1BQVIsQ0FBcEMsRUFBQyxrQkFBQSxVQUFELEVBQWEsMkJBQUEsbUJBQWIsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUixDQURQLENBQUE7O0FBQUEsRUFFQyxpQkFBa0IsT0FBQSxDQUFRLFNBQVIsRUFBbEIsY0FGRCxDQUFBOztBQUFBLEVBR0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBSFgsQ0FBQTs7QUFBQSxFQUlBLFFBQStCLEVBQS9CLEVBQUMsZUFBQSxNQUFELEVBQVMsMkJBQUEsa0JBSlQsQ0FBQTs7QUFBQSxFQUtDLHdCQUF5QixPQUFBLENBQVEsVUFBUixFQUF6QixxQkFMRCxDQUFBOztBQUFBLEVBTUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUixDQU5SLENBQUE7O0FBQUEsRUFrQk07QUFDSixJQUFBLE1BQU0sQ0FBQyxjQUFQLENBQXNCLGNBQUMsQ0FBQSxTQUF2QixFQUFrQyxNQUFsQyxFQUEwQztBQUFBLE1BQUEsR0FBQSxFQUFLLFNBQUEsR0FBQTtlQUFHLElBQUMsQ0FBQSxXQUFXLENBQUMsS0FBaEI7TUFBQSxDQUFMO0tBQTFDLENBQUEsQ0FBQTs7QUFBQSxJQUNBLE1BQU0sQ0FBQyxjQUFQLENBQXNCLGNBQUMsQ0FBQSxTQUF2QixFQUFrQyxTQUFsQyxFQUE2QztBQUFBLE1BQUEsR0FBQSxFQUFLLFNBQUEsR0FBQTtlQUFHLElBQUMsQ0FBQSxXQUFXLENBQUMsUUFBaEI7TUFBQSxDQUFMO0tBQTdDLENBREEsQ0FBQTs7QUFHYSxJQUFBLHdC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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/operation-stack.coffee
