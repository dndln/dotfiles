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

  vimStateMethods = ["onDidChangeInput", "onDidConfirmInput", "onDidCancelInput", "onDidUnfocusInput", "onDidCommandInput", "onDidChangeSearch", "onDidConfirmSearch", "onDidCancelSearch", "onDidUnfocusSearch", "onDidCommandSearch", "onDidSetTarget", "onWillSelectTarget", "onDidSelectTarget", "preemptWillSelectTarget", "preemptDidSelectTarget", "onDidRestoreCursorPositions", "onDidSetOperatorModifier", "onWillActivateMode", "onDidActivateMode", "onWillDeactivateMode", "preemptWillDeactivateMode", "onDidDeactivateMode", "onDidFinishOperation", "onDidCancelSelectList", "subscribe", "isMode", "getBlockwiseSelections", "updateSelectionProperties", "addToClassList"];

  Base = (function() {
    var registries;

    Delegato.includeInto(Base);

    Base.delegatesMethods.apply(Base, __slice.call(vimStateMethods).concat([{
      toProperty: 'vimState'
    }]));

    function Base(vimState, properties) {
      var hover, _ref1, _ref2;
      this.vimState = vimState;
      _ref1 = this.vimState, this.editor = _ref1.editor, this.editorElement = _ref1.editorElement, this.globalState = _ref1.globalState;
      _.extend(this, properties);
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

    Base.prototype.getDefaultCount = function() {
      return this.defaultCount;
    };

    Base.prototype.getCount = function() {
      var _ref1;
      return this.count != null ? this.count : this.count = (_ref1 = this.vimState.getCount()) != null ? _ref1 : this.getDefaultCount();
    };

    Base.prototype.resetCount = function() {
      return this.count = null;
    };

    Base.prototype.isDefaultCount = function() {
      return this.count === this.getDefaultCount();
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
      if (properties == null) {
        properties = {};
      }
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

    Base.prototype.focusInput = function(options) {
      var replace;
      if (options == null) {
        options = {};
      }
      if (options.charsMax == null) {
        options.charsMax = 1;
      }
      this.onDidConfirmInput((function(_this) {
        return function(input) {
          _this.input = input;
          return _this.processOperation();
        };
      })(this));
      replace = false;
      this.onDidChangeInput((function(_this) {
        return function(input) {
          _this.addHover(input, {
            replace: replace
          });
          return replace = true;
        };
      })(this));
      this.onDidCancelInput((function(_this) {
        return function() {
          return _this.cancelOperation();
        };
      })(this));
      return this.vimState.input.focus(options);
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
        return [this.editor.getLastSelection()].map(this.getCursorPositionForSelection.bind(this))[0];
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
      ['./operator', './operator-insert', './operator-transform-string', './motion', './text-object', './insert-mode', './misc-command'].forEach(require);
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
          vimState.domEvent = event;
          vimState.operationStack.run(klass);
        }
        return event.stopPropagation();
      });
    };

    return Base;

  })();

  module.exports = Base;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9iYXNlLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwrT0FBQTtJQUFBOzt5SkFBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSLENBRFgsQ0FBQTs7QUFBQSxFQUVDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFGRCxDQUFBOztBQUFBLEVBR0EsT0FLSSxPQUFBLENBQVEsU0FBUixDQUxKLEVBQ0UsK0JBQUEsdUJBREYsRUFFRSwyQkFBQSxtQkFGRixFQUdFLDJCQUFBLG1CQUhGLEVBSUUsaURBQUEseUNBUEYsQ0FBQTs7QUFBQSxFQVNBLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVIsQ0FUUixDQUFBOztBQUFBLEVBV0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBWFgsQ0FBQTs7QUFBQSxFQVlBLFVBQUEsR0FBYSxJQVpiLENBQUE7O0FBQUEsRUFhQSxjQUFBLEdBQWlCLElBYmpCLENBQUE7O0FBQUEsRUFjQyx3QkFBeUIsT0FBQSxDQUFRLFVBQVIsRUFBekIscUJBZEQsQ0FBQTs7QUFBQSxFQWdCQSxlQUFBLEdBQWtCLENBQ2hCLGtCQURnQixFQUVoQixtQkFGZ0IsRUFHaEIsa0JBSGdCLEVBSWhCLG1CQUpnQixFQUtoQixtQkFMZ0IsRUFNaEIsbUJBTmdCLEVBT2hCLG9CQVBnQixFQVFoQixtQkFSZ0IsRUFTaEIsb0JBVGdCLEVBVWhCLG9CQVZnQixFQVloQixnQkFaZ0IsRUFhaEIsb0JBYmdCLEVBY2hCLG1CQWRnQixFQWVoQix5QkFmZ0IsRUFnQmhCLHdCQWhCZ0IsRUFpQmhCLDZCQWpCZ0IsRUFrQmhCLDBC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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/base.coffee
