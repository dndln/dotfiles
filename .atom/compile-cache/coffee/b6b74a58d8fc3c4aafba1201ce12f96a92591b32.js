(function() {
  var BlockwiseSelection, CompositeDisposable, CursorStyleManager, Delegato, Disposable, Emitter, HighlightSearchManager, HoverElement, Input, MarkManager, ModeManager, MutationManager, OccurrenceManager, OperationStack, PersistentSelectionManager, Range, RegisterManager, SearchHistoryManager, SearchInputElement, VimState, debug, getVisibleEditors, haveSomeNonEmptySelection, highlightRanges, jQuery, matchScopes, packageScope, semver, settings, swrap, _, _ref, _ref1,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  semver = require('semver');

  Delegato = require('delegato');

  jQuery = require('atom-space-pen-views').jQuery;

  _ = require('underscore-plus');

  _ref = require('atom'), Emitter = _ref.Emitter, Disposable = _ref.Disposable, CompositeDisposable = _ref.CompositeDisposable, Range = _ref.Range;

  settings = require('./settings');

  HoverElement = require('./hover').HoverElement;

  Input = require('./input');

  SearchInputElement = require('./search-input');

  _ref1 = require('./utils'), haveSomeNonEmptySelection = _ref1.haveSomeNonEmptySelection, highlightRanges = _ref1.highlightRanges, getVisibleEditors = _ref1.getVisibleEditors, matchScopes = _ref1.matchScopes, debug = _ref1.debug;

  swrap = require('./selection-wrapper');

  OperationStack = require('./operation-stack');

  MarkManager = require('./mark-manager');

  ModeManager = require('./mode-manager');

  RegisterManager = require('./register-manager');

  SearchHistoryManager = require('./search-history-manager');

  CursorStyleManager = require('./cursor-style-manager');

  BlockwiseSelection = require('./blockwise-selection');

  OccurrenceManager = require('./occurrence-manager');

  HighlightSearchManager = require('./highlight-search-manager');

  MutationManager = require('./mutation-manager');

  PersistentSelectionManager = require('./persistent-selection-manager');

  packageScope = 'vim-mode-plus';

  module.exports = VimState = (function() {
    Delegato.includeInto(VimState);

    VimState.prototype.destroyed = false;

    VimState.delegatesProperty('mode', 'submode', {
      toProperty: 'modeManager'
    });

    VimState.delegatesMethods('isMode', 'activate', {
      toProperty: 'modeManager'
    });

    VimState.delegatesMethods('subscribe', 'getCount', 'setCount', 'hasCount', 'addToClassList', {
      toProperty: 'operationStack'
    });

    function VimState(editor, statusBarManager, globalState) {
      var refreshHighlightSearch;
      this.editor = editor;
      this.statusBarManager = statusBarManager;
      this.globalState = globalState;
      this.editorElement = this.editor.element;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.modeManager = new ModeManager(this);
      this.mark = new MarkManager(this);
      this.register = new RegisterManager(this);
      this.hover = new HoverElement().initialize(this);
      this.hoverSearchCounter = new HoverElement().initialize(this);
      this.searchHistory = new SearchHistoryManager(this);
      this.highlightSearch = new HighlightSearchManager(this);
      this.persistentSelection = new PersistentSelectionManager(this);
      this.occurrenceManager = new OccurrenceManager(this);
      this.mutationManager = new MutationManager(this);
      this.input = new Input(this);
      this.searchInput = new SearchInputElement().initialize(this);
      this.operationStack = new OperationStack(this);
      this.cursorStyleManager = new CursorStyleManager(this);
      this.blockwiseSelections = [];
      this.previousSelection = {};
      this.observeSelection();
      refreshHighlightSearch = (function(_this) {
        return function() {
          return _this.highlightSearch.refresh();
        };
      })(this);
      this.subscriptions.add(this.editor.onDidStopChanging(refreshHighlightSearch));
      this.subscriptions.add(this.editor.observeSelections((function(_this) {
        return function(selection) {
          if (_this.operationStack.isProcessing()) {
            return;
          }
          if (!swrap(selection).hasProperties()) {
            swrap(selection).saveProperties();
            _this.updateCursorsVisibility();
            return _this.editorElement.component.updateSync();
          }
        };
      })(this)));
      this.editorElement.classList.add(packageScope);
      if (settings.get('startInInsertMode') || matchScopes(this.editorElement, settings.get('startInInsertModeScopes'))) {
        this.activate('insert');
      } else {
        this.activate('normal');
      }
    }

    VimState.prototype.isNewInput = function() {
      return this.input instanceof Input;
    };

    VimState.prototype.getBlockwiseSelections = function() {
      return this.blockwiseSelections;
    };

    VimState.prototype.getLastBlockwiseSelection = function() {
      return _.last(this.blockwiseSelections);
    };

    VimState.prototype.getBlockwiseSelectionsOrderedByBufferPosition = function() {
      return this.getBlockwiseSelections().sort(function(a, b) {
        return a.getStartSelection().compare(b.getStartSelection());
      });
    };

    VimState.prototype.clearBlockwiseSelections = function() {
      return this.blockwiseSelections = [];
    };

    VimState.prototype.selectBlockwise = function() {
      var selection, _i, _len, _ref2;
      _ref2 = this.editor.getSelections();
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        selection = _ref2[_i];
        this.blockwiseSelections.push(new BlockwiseSelection(selection));
      }
      return this.updateSelectionProperties();
    };

    VimState.prototype.selectLinewise = function() {
      return swrap.expandOverLine(this.editor, {
        preserveGoalColumn: true
      });
    };

    VimState.prototype.updateSelectionProperties = function(options) {
      return swrap.updateSelectionProperties(this.editor, options);
    };

    VimState.prototype.toggleClassList = function(className, bool) {
      if (bool == null) {
        bool = void 0;
      }
      return this.editorElement.classList.toggle(className, bool);
    };

    VimState.prototype.swapClassName = function(className) {
      var oldClassName;
      oldClassName = this.editorElement.className;
      this.editorElement.className = className;
      return new Disposable((function(_this) {
        return function() {
          _this.editorElement.className = oldClassName;
          return _this.editorElement.classList.add('is-focused');
        };
      })(this));
    };

    VimState.prototype.onDidChangeInput = function(fn) {
      return this.subscribe(this.input.onDidChange(fn));
    };

    VimState.prototype.onDidConfirmInput = function(fn) {
      return this.subscribe(this.input.onDidConfirm(fn));
    };

    VimState.prototype.onDidCancelInput = function(fn) {
      return this.subscribe(this.input.onDidCancel(fn));
    };

    VimState.prototype.onDidChangeSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidChange(fn));
    };

    VimState.prototype.onDidConfirmSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidConfirm(fn));
    };

    VimState.prototype.onDidCancelSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidCancel(fn));
    };

    VimState.prototype.onDidCommandSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidCommand(fn));
    };

    VimState.prototype.onDidSetTarget = function(fn) {
      return this.subscribe(this.emitter.on('did-set-target', fn));
    };

    VimState.prototype.onWillSelectTarget = function(fn) {
      return this.subscribe(this.emitter.on('will-select-target', fn));
    };

    VimState.prototype.onDidSelectTarget = function(fn) {
      return this.subscribe(this.emitter.on('did-select-target', fn));
    };

    VimState.prototype.preemptWillSelectTarget = function(fn) {
      return this.subscribe(this.emitter.preempt('will-select-target', fn));
    };

    VimState.prototype.preemptDidSelectTarget = function(fn) {
      return this.subscribe(this.emitter.preempt('did-select-target', fn));
    };

    VimState.prototype.onDidRestoreCursorPositions = function(fn) {
      return this.subscribe(this.emitter.on('did-restore-cursor-positions', fn));
    };

    VimState.prototype.onDidSetOperatorModifier = function(fn) {
      return this.subscribe(this.emitter.on('did-set-operator-modifier', fn));
    };

    VimState.prototype.emitDidSetOperatorModifier = function(options) {
      return this.emitter.emit('did-set-operator-modifier', options);
    };

    VimState.prototype.onDidFinishOperation = function(fn) {
      return this.subscribe(this.emitter.on('did-finish-operation', fn));
    };

    VimState.prototype.onDidResetOperationStack = function(fn) {
      return this.subscribe(this.emitter.on('did-reset-operation-stack', fn));
    };

    VimState.prototype.emitDidResetOperationStack = function() {
      return this.emitter.emit('did-reset-operation-stack');
    };

    VimState.prototype.onDidConfirmSelectList = function(fn) {
      return this.subscribe(this.emitter.on('did-confirm-select-list', fn));
    };

    VimState.prototype.onDidCancelSelectList = function(fn) {
      return this.subscribe(this.emitter.on('did-cancel-select-list', fn));
    };

    VimState.prototype.onWillActivateMode = function(fn) {
      return this.subscribe(this.modeManager.onWillActivateMode(fn));
    };

    VimState.prototype.onDidActivateMode = function(fn) {
      return this.subscribe(this.modeManager.onDidActivateMode(fn));
    };

    VimState.prototype.onWillDeactivateMode = function(fn) {
      return this.subscribe(this.modeManager.onWillDeactivateMode(fn));
    };

    VimState.prototype.preemptWillDeactivateMode = function(fn) {
      return this.subscribe(this.modeManager.preemptWillDeactivateMode(fn));
    };

    VimState.prototype.onDidDeactivateMode = function(fn) {
      return this.subscribe(this.modeManager.onDidDeactivateMode(fn));
    };

    VimState.prototype.onDidFailToSetTarget = function(fn) {
      return this.emitter.on('did-fail-to-set-target', fn);
    };

    VimState.prototype.emitDidFailToSetTarget = function() {
      return this.emitter.emit('did-fail-to-set-target');
    };

    VimState.prototype.onDidDestroy = function(fn) {
      return this.emitter.on('did-destroy', fn);
    };

    VimState.prototype.onDidSetMark = function(fn) {
      return this.emitter.on('did-set-mark', fn);
    };

    VimState.prototype.onDidSetInputChar = function(fn) {
      return this.emitter.on('did-set-input-char', fn);
    };

    VimState.prototype.emitDidSetInputChar = function(char) {
      return this.emitter.emit('did-set-input-char', char);
    };

    VimState.prototype.destroy = function() {
      var _ref10, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      if (this.destroyed) {
        return;
      }
      this.destroyed = true;
      this.subscriptions.dispose();
      if (this.editor.isAlive()) {
        this.resetNormalMode();
        this.reset();
        if ((_ref2 = this.editorElement.component) != null) {
          _ref2.setInputEnabled(true);
        }
        this.editorElement.classList.remove(packageScope, 'normal-mode');
      }
      if ((_ref3 = this.hover) != null) {
        if (typeof _ref3.destroy === "function") {
          _ref3.destroy();
        }
      }
      if ((_ref4 = this.hoverSearchCounter) != null) {
        if (typeof _ref4.destroy === "function") {
          _ref4.destroy();
        }
      }
      if ((_ref5 = this.searchHistory) != null) {
        if (typeof _ref5.destroy === "function") {
          _ref5.destroy();
        }
      }
      if ((_ref6 = this.cursorStyleManager) != null) {
        if (typeof _ref6.destroy === "function") {
          _ref6.destroy();
        }
      }
      if ((_ref7 = this.input) != null) {
        if (typeof _ref7.destroy === "function") {
          _ref7.destroy();
        }
      }
      if ((_ref8 = this.search) != null) {
        if (typeof _ref8.destroy === "function") {
          _ref8.destroy();
        }
      }
      ((_ref9 = this.register) != null ? _ref9.destroy : void 0) != null;
      _ref10 = {}, this.hover = _ref10.hover, this.hoverSearchCounter = _ref10.hoverSearchCounter, this.operationStack = _ref10.operationStack, this.searchHistory = _ref10.searchHistory, this.cursorStyleManager = _ref10.cursorStyleManager, this.input = _ref10.input, this.search = _ref10.search, this.modeManager = _ref10.modeManager, this.register = _ref10.register, this.editor = _ref10.editor, this.editorElement = _ref10.editorElement, this.subscriptions = _ref10.subscriptions, this.inputCharSubscriptions = _ref10.inputCharSubscriptions, this.occurrenceManager = _ref10.occurrenceManager, this.previousSelection = _ref10.previousSelection, this.persistentSelection = _ref10.persistentSelection;
      return this.emitter.emit('did-destroy');
    };

    VimState.prototype.observeSelection = function() {
      var checkSelection, isInterestingEvent, onInterestingEvent, saveProperties, _checkSelection, _saveProperties;
      isInterestingEvent = (function(_this) {
        return function(_arg) {
          var target, type;
          target = _arg.target, type = _arg.type;
          if (_this.mode === 'insert') {
            return false;
          } else {
            return (_this.editor != null) && target === _this.editorElement && !_this.isMode('visual', 'blockwise') && !type.startsWith('vim-mode-plus:');
          }
        };
      })(this);
      onInterestingEvent = function(fn) {
        return function(event) {
          if (isInterestingEvent(event)) {
            return fn();
          }
        };
      };
      _checkSelection = (function(_this) {
        return function() {
          var submode;
          if (_this.operationStack.isProcessing()) {
            return;
          }
          if (haveSomeNonEmptySelection(_this.editor)) {
            submode = swrap.detectVisualModeSubmode(_this.editor);
            if (_this.isMode('visual', submode)) {
              return _this.updateCursorsVisibility();
            } else {
              return _this.activate('visual', submode);
            }
          } else {
            if (_this.isMode('visual')) {
              return _this.activate('normal');
            }
          }
        };
      })(this);
      _saveProperties = (function(_this) {
        return function() {
          var selection, _i, _len, _ref2, _results;
          _ref2 = _this.editor.getSelections();
          _results = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            selection = _ref2[_i];
            _results.push(swrap(selection).saveProperties());
          }
          return _results;
        };
      })(this);
      checkSelection = onInterestingEvent(_checkSelection);
      saveProperties = onInterestingEvent(_saveProperties);
      this.editorElement.addEventListener('mouseup', checkSelection);
      this.subscriptions.add(new Disposable((function(_this) {
        return function() {
          return _this.editorElement.removeEventListener('mouseup', checkSelection);
        };
      })(this)));
      return this.subscriptions.add(atom.commands.onDidDispatch(checkSelection));
    };

    VimState.prototype.resetNormalMode = function(_arg) {
      var userInvocation;
      userInvocation = (_arg != null ? _arg : {}).userInvocation;
      if (userInvocation != null ? userInvocation : false) {
        if (this.editor.hasMultipleCursors()) {
          this.editor.clearSelections();
        } else if (this.hasPersistentSelections() && settings.get('clearPersistentSelectionOnResetNormalMode')) {
          this.clearPersistentSelections();
        } else if (this.occurrenceManager.hasPatterns()) {
          this.occurrenceManager.resetPatterns();
        }
        if (settings.get('clearHighlightSearchOnResetNormalMode')) {
          this.globalState.set('highlightSearchPattern', null);
        }
      } else {
        this.editor.clearSelections();
      }
      return this.activate('normal');
    };

    VimState.prototype.reset = function() {
      this.register.reset();
      this.searchHistory.reset();
      this.hover.reset();
      this.operationStack.reset();
      return this.mutationManager.reset();
    };

    VimState.prototype.isVisible = function() {
      var _ref2;
      return _ref2 = this.editor, __indexOf.call(getVisibleEditors(), _ref2) >= 0;
    };

    VimState.prototype.updateCursorsVisibility = function() {
      return this.cursorStyleManager.refresh();
    };

    VimState.prototype.updatePreviousSelection = function() {
      var head, properties, tail, _ref2;
      if (this.isMode('visual', 'blockwise')) {
        properties = (_ref2 = this.getLastBlockwiseSelection()) != null ? _ref2.getCharacterwiseProperties() : void 0;
      } else {
        properties = swrap(this.editor.getLastSelection()).captureProperties();
      }
      if (properties == null) {
        return;
      }
      head = properties.head, tail = properties.tail;
      if (head.isGreaterThan(tail)) {
        this.mark.setRange('<', '>', [tail, head]);
      } else {
        this.mark.setRange('<', '>', [head, tail]);
      }
      return this.previousSelection = {
        properties: properties,
        submode: this.submode
      };
    };

    VimState.prototype.hasPersistentSelections = function() {
      return this.persistentSelection.hasMarkers();
    };

    VimState.prototype.getPersistentSelectionBuffferRanges = function() {
      return this.persistentSelection.getMarkerBufferRanges();
    };

    VimState.prototype.clearPersistentSelections = function() {
      return this.persistentSelection.clearMarkers();
    };

    VimState.prototype.scrollAnimationEffect = null;

    VimState.prototype.requestScrollAnimation = function(from, to, options) {
      return this.scrollAnimationEffect = jQuery(from).animate(to, options);
    };

    VimState.prototype.finishScrollAnimation = function() {
      var _ref2;
      if ((_ref2 = this.scrollAnimationEffect) != null) {
        _ref2.finish();
      }
      return this.scrollAnimationEffect = null;
    };

    return VimState;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi92aW0tc3RhdGUuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtjQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVIsQ0FBVCxDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSLENBRFgsQ0FBQTs7QUFBQSxFQUVDLFNBQVUsT0FBQSxDQUFRLHNCQUFSLEVBQVYsTUFGRCxDQUFBOztBQUFBLEVBSUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUpKLENBQUE7O0FBQUEsRUFLQSxPQUFvRCxPQUFBLENBQVEsTUFBUixDQUFwRCxFQUFDLGVBQUEsT0FBRCxFQUFVLGtCQUFBLFVBQVYsRUFBc0IsMkJBQUEsbUJBQXRCLEVBQTJDLGFBQUEsS0FMM0MsQ0FBQTs7QUFBQSxFQU9BLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQVBYLENBQUE7O0FBQUEsRUFRQyxlQUFnQixPQUFBLENBQVEsU0FBUixFQUFoQixZQVJELENBQUE7O0FBQUEsRUFTQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVIsQ0FUUixDQUFBOztBQUFBLEVBVUEsa0JBQUEsR0FBcUIsT0FBQSxDQUFRLGdCQUFSLENBVnJCLENBQUE7O0FBQUEsRUFXQSxRQU9JLE9BQUEsQ0FBUSxTQUFSLENBUEosRUFDRSxrQ0FBQSx5QkFERixFQUVFLHdCQUFBLGVBRkYsRUFHRSwwQkFBQSxpQkFIRixFQUlFLG9CQUFBLFdBSkYsRUFNRSxjQUFBLEtBakJGLENBQUE7O0FBQUEsRUFtQkEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUixDQW5CUixDQUFBOztBQUFBLEVBcUJBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG1CQUFSLENB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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/vim-state.coffee
