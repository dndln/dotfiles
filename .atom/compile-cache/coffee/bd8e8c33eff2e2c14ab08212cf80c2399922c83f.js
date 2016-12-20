(function() {
  var Base, CompositeDisposable, Delegato, Disposable, MoveToRelativeLine, OperationAbortedError, OperationStack, Select, moveCursorLeft, settings, swrap, _, _ref, _ref1;

  Delegato = require('delegato');

  _ = require('underscore-plus');

  _ref = require('atom'), Disposable = _ref.Disposable, CompositeDisposable = _ref.CompositeDisposable;

  Base = require('./base');

  moveCursorLeft = require('./utils').moveCursorLeft;

  settings = require('./settings');

  _ref1 = {}, Select = _ref1.Select, MoveToRelativeLine = _ref1.MoveToRelativeLine;

  OperationAbortedError = require('./errors').OperationAbortedError;

  swrap = require('./selection-wrapper');

  OperationStack = (function() {
    Delegato.includeInto(OperationStack);

    OperationStack.delegatesProperty('mode', 'submode', {
      toProperty: 'modeManager'
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

    OperationStack.prototype.push = function(operation) {
      return this.stack.push(operation);
    };

    OperationStack.prototype.pop = function() {
      return this.stack.pop();
    };

    OperationStack.prototype.peekTop = function() {
      return _.last(this.stack);
    };

    OperationStack.prototype.peekBottom = function() {
      return this.stack[0];
    };

    OperationStack.prototype.isEmpty = function() {
      return this.stack.length === 0;
    };

    OperationStack.prototype.isFull = function() {
      return this.stack.length === 2;
    };

    OperationStack.prototype.hasPending = function() {
      return this.stack.length === 1;
    };

    OperationStack.prototype.run = function(klass, properties) {
      var error, operation, type, _ref2;
      if (properties == null) {
        properties = {};
      }
      try {
        type = typeof klass;
        if (type !== 'string' && type !== 'function' && type !== 'object') {
          throw new Error('Unsupported type of operation');
        }
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
          this.push(operation);
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

    OperationStack.prototype.runCurrentFind = function(_arg) {
      var operation, reverse;
      reverse = (_arg != null ? _arg : {}).reverse;
      if (operation = this.vimState.globalState.get('currentFind')) {
        operation = operation.clone(this.vimState);
        operation.setRepeated();
        operation.resetCount();
        if (reverse) {
          operation.backwards = !operation.backwards;
        }
        return this.run(operation);
      }
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
      if (this.isFull()) {
        operation = this.pop();
        this.peekTop().setTarget(operation);
      }
      top = this.peekTop();
      if (top.isComplete()) {
        return this.execute(this.pop());
      } else {
        if (this.mode === 'normal' && top.isOperator()) {
          this.vimState.activate('operator-pending');
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
      }
      if (this.mode === 'visual') {
        this.vimState.modeManager.updateNarrowedState();
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9vcGVyYXRpb24tc3RhY2suY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1LQUFBOztBQUFBLEVBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSLENBQVgsQ0FBQTs7QUFBQSxFQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FESixDQUFBOztBQUFBLEVBR0EsT0FBb0MsT0FBQSxDQUFRLE1BQVIsQ0FBcEMsRUFBQyxrQkFBQSxVQUFELEVBQWEsMkJBQUEsbUJBSGIsQ0FBQTs7QUFBQSxFQUlBLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUixDQUpQLENBQUE7O0FBQUEsRUFLQyxpQkFBa0IsT0FBQSxDQUFRLFNBQVIsRUFBbEIsY0FMRCxDQUFBOztBQUFBLEVBTUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBTlgsQ0FBQTs7QUFBQSxFQU9BLFFBQStCLEVBQS9CLEVBQUMsZUFBQSxNQUFELEVBQVMsMkJBQUEsa0JBUFQsQ0FBQTs7QUFBQSxFQVFDLHdCQUF5QixPQUFBLENBQVEsVUFBUixFQUF6QixxQkFSRCxDQUFBOztBQUFBLEVBU0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUixDQVRSLENBQUE7O0FBQUEsRUFxQk07QUFDSixJQUFBLFFBQVEsQ0FBQyxXQUFULENBQXFCLGNBQXJCLENBQUEsQ0FBQTs7QUFBQSxJQUNBLGNBQUMsQ0FBQSxpQkFBRCxDQUFtQixNQUFuQixFQUEyQixTQUEzQixFQUFzQztBQUFBLE1BQUEsVUFBQSxFQUFZLGFBQVo7S0FBdEMsQ0FEQSxDQUFBOztBQUdhLElBQUEsd0JBQUUsUUFBRixHQUFBO0FBQ1gsVUFBQSxLQUFBO0FBQUEsTUFEWSxJQUFDLENBQUEsV0FBQSxRQUNiLENBQUE7QUFB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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/operation-stack.coffee
