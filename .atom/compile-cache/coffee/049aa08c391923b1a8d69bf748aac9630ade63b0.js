(function() {
  var Base, CompositeDisposable, Delegato, OperationAbortedError, getEditorState, getVimEofBufferPosition, getVimLastBufferRow, getVimLastScreenRow, getWordBufferRangeAndKindAtBufferPosition, selectList, settings, swrap, vimStateMethods, _, _ref,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  Delegato = require('delegato');

  CompositeDisposable = require('atom').CompositeDisposable;

  _ref = require('./utils'), getVimEofBufferPosition = _ref.getVimEofBufferPosition, getVimLastBufferRow = _ref.getVimLastBufferRow, getVimLastScreenRow = _ref.getVimLastScreenRow, getWordBufferRangeAndKindAtBufferPosition = _ref.getWordBufferRangeAndKindAtBufferPosition;

  swrap = require('./selection-wrapper');

  settings = require('./settings');

  selectList = null;

  getEditorState = null;

  OperationAbortedError = require('./errors').OperationAbortedError;

  vimStateMethods = ["onDidChangeInput", "onDidConfirmInput", "onDidCancelInput", "onDidChangeSearch", "onDidConfirmSearch", "onDidCancelSearch", "onDidCommandSearch", "onDidSetTarget", "onWillSelectTarget", "onDidSelectTarget", "preemptWillSelectTarget", "preemptDidSelectTarget", "onDidRestoreCursorPositions", "onDidSetOperatorModifier", "onDidResetOperationStack", "onWillActivateMode", "onDidActivateMode", "onWillDeactivateMode", "preemptWillDeactivateMode", "onDidDeactivateMode", "onDidFinishOperation", "onDidCancelSelectList", "subscribe", "isMode", "getBlockwiseSelections", "updateSelectionProperties", "addToClassList"];

  Base = (function() {
    var registries;

    Delegato.includeInto(Base);

    Base.delegatesMethods.apply(Base, __slice.call(vimStateMethods).concat([{
      toProperty: 'vimState'
    }]));

    function Base(vimState, properties) {
      var hover, _ref1, _ref2;
      this.vimState = vimState;
      if (properties == null) {
        properties = null;
      }
      _ref1 = this.vimState, this.editor = _ref1.editor, this.editorElement = _ref1.editorElement, this.globalState = _ref1.globalState;
      if (properties != null) {
        _.extend(this, properties);
      }
      if (settings.get('showHoverOnOperate')) {
        hover = (_ref2 = this.hover) != null ? _ref2[settings.get('showHoverOnOperateIcon')] : void 0;
        if ((hover != null) && !this.isComplete()) {
          this.addHover(hover);
        }
      }
    }

    Base.prototype.initialize = function() {};

    Base.prototype.isComplete = function() {
      var _ref1;
      if (this.isRequireInput() && !this.hasInput()) {
        return false;
      } else if (this.isRequireTarget()) {
        return (_ref1 = this.getTarget()) != null ? typeof _ref1.isComplete === "function" ? _ref1.isComplete() : void 0 : void 0;
      } else {
        return true;
      }
    };

    Base.prototype.target = null;

    Base.prototype.hasTarget = function() {
      return this.target != null;
    };

    Base.prototype.getTarget = function() {
      return this.target;
    };

    Base.prototype.requireTarget = false;

    Base.prototype.isRequireTarget = function() {
      return this.requireTarget;
    };

    Base.prototype.requireInput = false;

    Base.prototype.isRequireInput = function() {
      return this.requireInput;
    };

    Base.prototype.recordable = false;

    Base.prototype.isRecordable = function() {
      return this.recordable;
    };

    Base.prototype.repeated = false;

    Base.prototype.isRepeated = function() {
      return this.repeated;
    };

    Base.prototype.setRepeated = function() {
      return this.repeated = true;
    };

    Base.prototype.operator = null;

    Base.prototype.hasOperator = function() {
      return this.operator != null;
    };

    Base.prototype.getOperator = function() {
      return this.operator;
    };

    Base.prototype.setOperator = function(operator) {
      this.operator = operator;
      return this.operator;
    };

    Base.prototype.isAsOperatorTarget = function() {
      return this.hasOperator() && !this.getOperator()["instanceof"]('Select');
    };

    Base.prototype.abort = function() {
      throw new OperationAbortedError('aborted');
    };

    Base.prototype.count = null;

    Base.prototype.defaultCount = 1;

    Base.prototype.getCount = function() {
      var _ref1;
      return this.count != null ? this.count : this.count = (_ref1 = this.vimState.getCount()) != null ? _ref1 : this.defaultCount;
    };

    Base.prototype.resetCount = function() {
      return this.count = null;
    };

    Base.prototype.isDefaultCount = function() {
      return this.count === this.defaultCount;
    };

    Base.prototype.register = null;

    Base.prototype.getRegisterName = function() {
      var text;
      this.vimState.register.getName();
      return text = this.vimState.register.getText(this.getInput(), selection);
    };

    Base.prototype.getRegisterValueAsText = function(name, selection) {
      if (name == null) {
        name = null;
      }
      return this.vimState.register.getText(name, selection);
    };

    Base.prototype.isDefaultRegisterName = function() {
      return this.vimState.register.isDefaultName();
    };

    Base.prototype.countTimes = function(fn) {
      var count, isFinal, last, stop, stopped, _i, _results;
      if ((last = this.getCount()) < 1) {
        return;
      }
      stopped = false;
      stop = function() {
        return stopped = true;
      };
      _results = [];
      for (count = _i = 1; 1 <= last ? _i <= last : _i >= last; count = 1 <= last ? ++_i : --_i) {
        isFinal = count === last;
        fn({
          count: count,
          isFinal: isFinal,
          stop: stop
        });
        if (stopped) {
          break;
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Base.prototype.activateMode = function(mode, submode) {
      return this.onDidFinishOperation((function(_this) {
        return function() {
          return _this.vimState.activate(mode, submode);
        };
      })(this));
    };

    Base.prototype.activateModeIfNecessary = function(mode, submode) {
      if (!this.vimState.isMode(mode, submode)) {
        return this.activateMode(mode, submode);
      }
    };

    Base.prototype.addHover = function(text, _arg, point) {
      var replace;
      replace = (_arg != null ? _arg : {}).replace;
      if (point == null) {
        point = null;
      }
      if (replace != null ? replace : false) {
        return this.vimState.hover.replaceLastSection(text, point);
      } else {
        return this.vimState.hover.add(text, point);
      }
    };

    Base.prototype["new"] = function(name, properties) {
      var klass;
      klass = Base.getClass(name);
      return new klass(this.vimState, properties);
    };

    Base.prototype.clone = function(vimState) {
      var excludeProperties, key, klass, properties, value;
      properties = {};
      excludeProperties = ['editor', 'editorElement', 'globalState', 'vimState'];
      for (key in this) {
        if (!__hasProp.call(this, key)) continue;
        value = this[key];
        if (__indexOf.call(excludeProperties, key) < 0) {
          properties[key] = value;
        }
      }
      klass = this.constructor;
      return new klass(vimState, properties);
    };

    Base.prototype.cancelOperation = function() {
      return this.vimState.operationStack.cancel();
    };

    Base.prototype.processOperation = function() {
      return this.vimState.operationStack.process();
    };

    Base.prototype.focusSelectList = function(options) {
      if (options == null) {
        options = {};
      }
      this.onDidCancelSelectList((function(_this) {
        return function() {
          return _this.cancelOperation();
        };
      })(this));
      if (selectList == null) {
        selectList = require('./select-list');
      }
      return selectList.show(this.vimState, options);
    };

    Base.prototype.input = null;

    Base.prototype.hasInput = function() {
      return this.input != null;
    };

    Base.prototype.getInput = function() {
      return this.input;
    };

    Base.prototype.focusInput = function(charsMax) {
      var replace;
      this.onDidConfirmInput((function(_this) {
        return function(input) {
          if (_this.input == null) {
            _this.input = input;
            return _this.processOperation();
          }
        };
      })(this));
      if (charsMax !== 1) {
        replace = false;
        this.onDidChangeInput((function(_this) {
          return function(input) {
            _this.addHover(input, {
              replace: replace
            });
            return replace = true;
          };
        })(this));
      }
      this.onDidCancelInput((function(_this) {
        return function() {
          return _this.cancelOperation();
        };
      })(this));
      return this.vimState.input.focus(charsMax);
    };

    Base.prototype.getVimEofBufferPosition = function() {
      return getVimEofBufferPosition(this.editor);
    };

    Base.prototype.getVimLastBufferRow = function() {
      return getVimLastBufferRow(this.editor);
    };

    Base.prototype.getVimLastScreenRow = function() {
      return getVimLastScreenRow(this.editor);
    };

    Base.prototype.getWordBufferRangeAndKindAtBufferPosition = function(point, options) {
      return getWordBufferRangeAndKindAtBufferPosition(this.editor, point, options);
    };

    Base.prototype["instanceof"] = function(klassName) {
      return this instanceof Base.getClass(klassName);
    };

    Base.prototype.is = function(klassName) {
      return this.constructor === Base.getClass(klassName);
    };

    Base.prototype.isOperator = function() {
      return this["instanceof"]('Operator');
    };

    Base.prototype.isMotion = function() {
      return this["instanceof"]('Motion');
    };

    Base.prototype.isTextObject = function() {
      return this["instanceof"]('TextObject');
    };

    Base.prototype.isTarget = function() {
      return this.isMotion() || this.isTextObject();
    };

    Base.prototype.getName = function() {
      return this.constructor.name;
    };

    Base.prototype.getCursorBufferPosition = function() {
      if (this.isMode('visual')) {
        return this.getCursorPositionForSelection(this.editor.getLastSelection());
      } else {
        return this.editor.getCursorBufferPosition();
      }
    };

    Base.prototype.getCursorBufferPositions = function() {
      if (this.isMode('visual')) {
        return this.editor.getSelections().map(this.getCursorPositionForSelection.bind(this));
      } else {
        return this.editor.getCursorBufferPositions();
      }
    };

    Base.prototype.getBufferPositionForCursor = function(cursor) {
      if (this.isMode('visual')) {
        return this.getCursorPositionForSelection(cursor.selection);
      } else {
        return cursor.getBufferPosition();
      }
    };

    Base.prototype.getCursorPositionForSelection = function(selection) {
      var options;
      options = {
        fromProperty: true,
        allowFallback: true
      };
      return swrap(selection).getBufferPositionFor('head', options);
    };

    Base.prototype.toString = function() {
      var str;
      str = this.getName();
      if (this.hasTarget()) {
        str += ", target=" + (this.getTarget().toString());
      }
      return str;
    };

    Base.prototype.emitWillSelectTarget = function() {
      return this.vimState.emitter.emit('will-select-target');
    };

    Base.prototype.emitDidSelectTarget = function() {
      return this.vimState.emitter.emit('did-select-target');
    };

    Base.prototype.emitDidSetTarget = function(operator) {
      return this.vimState.emitter.emit('did-set-target', operator);
    };

    Base.prototype.emitDidRestoreCursorPositions = function() {
      return this.vimState.emitter.emit('did-restore-cursor-positions');
    };

    Base.init = function(service) {
      var klass, __, _ref1;
      getEditorState = service.getEditorState;
      this.subscriptions = new CompositeDisposable();
      ['./operator', './operator-insert', './operator-transform-string', './motion', './motion-search', './text-object', './insert-mode', './misc-command'].forEach(require);
      _ref1 = this.getRegistries();
      for (__ in _ref1) {
        klass = _ref1[__];
        if (klass.isCommand()) {
          this.subscriptions.add(klass.registerCommand());
        }
      }
      return this.subscriptions;
    };

    Base.reset = function() {
      var klass, __, _ref1, _results;
      this.subscriptions.dispose();
      this.subscriptions = new CompositeDisposable();
      _ref1 = this.getRegistries();
      _results = [];
      for (__ in _ref1) {
        klass = _ref1[__];
        if (klass.isCommand()) {
          _results.push(this.subscriptions.add(klass.registerCommand()));
        }
      }
      return _results;
    };

    registries = {
      Base: Base
    };

    Base.extend = function(command) {
      this.command = command != null ? command : true;
      if ((name in registries) && (!this.suppressWarning)) {
        console.warn("Duplicate constructor " + this.name);
      }
      return registries[this.name] = this;
    };

    Base.getClass = function(name) {
      var klass;
      if ((klass = registries[name]) != null) {
        return klass;
      } else {
        throw new Error("class '" + name + "' not found");
      }
    };

    Base.getRegistries = function() {
      return registries;
    };

    Base.isCommand = function() {
      return this.command;
    };

    Base.commandPrefix = 'vim-mode-plus';

    Base.getCommandName = function() {
      return this.commandPrefix + ':' + _.dasherize(this.name);
    };

    Base.getCommandNameWithoutPrefix = function() {
      return _.dasherize(this.name);
    };

    Base.commandScope = 'atom-text-editor';

    Base.getCommandScope = function() {
      return this.commandScope;
    };

    Base.getDesctiption = function() {
      if (this.hasOwnProperty("description")) {
        return this.description;
      } else {
        return null;
      }
    };

    Base.registerCommand = function() {
      var klass;
      klass = this;
      return atom.commands.add(this.getCommandScope(), this.getCommandName(), function(event) {
        var vimState, _ref1;
        vimState = (_ref1 = getEditorState(this.getModel())) != null ? _ref1 : getEditorState(atom.workspace.getActiveTextEditor());
        if (vimState != null) {
          vimState.operationStack.run(klass);
        }
        return event.stopPropagation();
      });
    };

    return Base;

  })();

  module.exports = Base;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9iYXNlLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwrT0FBQTtJQUFBOzt5SkFBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSLENBRFgsQ0FBQTs7QUFBQSxFQUVDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFGRCxDQUFBOztBQUFBLEVBR0EsT0FLSSxPQUFBLENBQVEsU0FBUixDQUxKLEVBQ0UsK0JBQUEsdUJBREYsRUFFRSwyQkFBQSxtQkFGRixFQUdFLDJCQUFBLG1CQUhGLEVBSUUsaURBQUEseUNBUEYsQ0FBQTs7QUFBQSxFQVNBLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVIsQ0FUUixDQUFBOztBQUFBLEVBV0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBWFgsQ0FBQTs7QUFBQSxFQVlBLFVBQUEsR0FBYSxJQVpiLENBQUE7O0FBQUEsRUFhQSxjQUFBLEdBQWlCLElBYmpCLENBQUE7O0FBQUEsRUFjQyx3QkFBeUIsT0FBQSxDQUFRLFVBQVIsRUFBekIscUJBZEQsQ0FBQTs7QUFBQSxFQWdCQSxlQUFBLEdBQWtCLENBQ2hCLGtCQURnQixFQUVoQixtQkFGZ0IsRUFHaEIsa0JBSGdCLEVBS2hCLG1CQUxnQixFQU1oQixvQkFOZ0IsRUFPaEIsbUJBUGdCLEVBUWhCLG9CQVJnQixFQVVoQixnQkFWZ0IsRUFXaEIsb0JBWGdCLEVBWWhCLG1CQVpnQixFQWFoQix5QkFiZ0IsRUFjaEIsd0JBZGdCLEVBZWhCLDZCQWZnQixFQWdCaEIsMEJBaEJnQixFQWlCaEIsMEJBakJnQixFQW1CaEIsb0JBbkJnQixFQW9CaEIs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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/base.coffee
