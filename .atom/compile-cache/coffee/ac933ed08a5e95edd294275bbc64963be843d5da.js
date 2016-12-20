(function() {
  var BlockwiseSelection, CompositeDisposable, CursorStyleManager, Delegato, Disposable, Emitter, HighlightSearchManager, HoverElement, InputElement, MarkManager, ModeManager, MutationTracker, OccurrenceManager, OperationStack, PersistentSelectionManager, Range, RegisterManager, SearchHistoryManager, SearchInputElement, VimState, debug, getVisibleEditors, haveSomeSelection, highlightRanges, jQuery, matchScopes, packageScope, settings, swrap, _, _ref, _ref1, _ref2,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Delegato = require('delegato');

  jQuery = require('atom-space-pen-views').jQuery;

  _ = require('underscore-plus');

  _ref = require('atom'), Emitter = _ref.Emitter, Disposable = _ref.Disposable, CompositeDisposable = _ref.CompositeDisposable, Range = _ref.Range;

  settings = require('./settings');

  HoverElement = require('./hover').HoverElement;

  _ref1 = require('./input'), InputElement = _ref1.InputElement, SearchInputElement = _ref1.SearchInputElement;

  _ref2 = require('./utils'), haveSomeSelection = _ref2.haveSomeSelection, highlightRanges = _ref2.highlightRanges, getVisibleEditors = _ref2.getVisibleEditors, matchScopes = _ref2.matchScopes, debug = _ref2.debug;

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

  MutationTracker = require('./mutation-tracker');

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
      this.mutationTracker = new MutationTracker(this);
      this.input = new InputElement().initialize(this);
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
      this.editorElement.classList.add(packageScope);
      if (settings.get('startInInsertMode') || matchScopes(this.editorElement, settings.get('startInInsertModeScopes'))) {
        this.activate('insert');
      } else {
        this.activate('normal');
      }
    }

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
      var selection, _i, _len, _ref3;
      _ref3 = this.editor.getSelections();
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        selection = _ref3[_i];
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

    VimState.prototype.startCharInput = function(charInputAction) {
      this.charInputAction = charInputAction;
      this.inputCharSubscriptions = new CompositeDisposable();
      this.inputCharSubscriptions.add(this.swapClassName('vim-mode-plus-input-char-waiting'));
      return this.inputCharSubscriptions.add(atom.commands.add(this.editorElement, {
        'core:cancel': (function(_this) {
          return function() {
            return _this.resetCharInput();
          };
        })(this)
      }));
    };

    VimState.prototype.setInputChar = function(char) {
      switch (this.charInputAction) {
        case 'save-mark':
          this.mark.set(char, this.editor.getCursorBufferPosition());
          break;
        case 'move-to-mark':
          this.operationStack.run("MoveToMark", {
            input: char
          });
          break;
        case 'move-to-mark-line':
          this.operationStack.run("MoveToMarkLine", {
            input: char
          });
      }
      return this.resetCharInput();
    };

    VimState.prototype.resetCharInput = function() {
      var _ref3;
      return (_ref3 = this.inputCharSubscriptions) != null ? _ref3.dispose() : void 0;
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
          return _this.editorElement.className = oldClassName;
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

    VimState.prototype.onDidUnfocusInput = function(fn) {
      return this.subscribe(this.input.onDidUnfocus(fn));
    };

    VimState.prototype.onDidCommandInput = function(fn) {
      return this.subscribe(this.input.onDidCommand(fn));
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

    VimState.prototype.onDidUnfocusSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidUnfocus(fn));
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

    VimState.prototype.destroy = function() {
      var _ref10, _ref11, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      if (this.destroyed) {
        return;
      }
      this.destroyed = true;
      this.subscriptions.dispose();
      if (this.editor.isAlive()) {
        this.resetNormalMode();
        this.reset();
        if ((_ref3 = this.editorElement.component) != null) {
          _ref3.setInputEnabled(true);
        }
        this.editorElement.classList.remove(packageScope, 'normal-mode');
      }
      if ((_ref4 = this.hover) != null) {
        if (typeof _ref4.destroy === "function") {
          _ref4.destroy();
        }
      }
      if ((_ref5 = this.hoverSearchCounter) != null) {
        if (typeof _ref5.destroy === "function") {
          _ref5.destroy();
        }
      }
      if ((_ref6 = this.searchHistory) != null) {
        if (typeof _ref6.destroy === "function") {
          _ref6.destroy();
        }
      }
      if ((_ref7 = this.cursorStyleManager) != null) {
        if (typeof _ref7.destroy === "function") {
          _ref7.destroy();
        }
      }
      if ((_ref8 = this.input) != null) {
        if (typeof _ref8.destroy === "function") {
          _ref8.destroy();
        }
      }
      if ((_ref9 = this.search) != null) {
        if (typeof _ref9.destroy === "function") {
          _ref9.destroy();
        }
      }
      ((_ref10 = this.register) != null ? _ref10.destroy : void 0) != null;
      _ref11 = {}, this.hover = _ref11.hover, this.hoverSearchCounter = _ref11.hoverSearchCounter, this.operationStack = _ref11.operationStack, this.searchHistory = _ref11.searchHistory, this.cursorStyleManager = _ref11.cursorStyleManager, this.input = _ref11.input, this.search = _ref11.search, this.modeManager = _ref11.modeManager, this.register = _ref11.register, this.editor = _ref11.editor, this.editorElement = _ref11.editorElement, this.subscriptions = _ref11.subscriptions, this.inputCharSubscriptions = _ref11.inputCharSubscriptions, this.occurrenceManager = _ref11.occurrenceManager, this.previousSelection = _ref11.previousSelection, this.persistentSelection = _ref11.persistentSelection;
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
          if (haveSomeSelection(_this.editor)) {
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
          var selection, _i, _len, _ref3, _results;
          _ref3 = _this.editor.getSelections();
          _results = [];
          for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
            selection = _ref3[_i];
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
      this.resetCharInput();
      this.register.reset();
      this.searchHistory.reset();
      this.hover.reset();
      this.operationStack.reset();
      return this.mutationTracker.reset();
    };

    VimState.prototype.isVisible = function() {
      var _ref3;
      return _ref3 = this.editor, __indexOf.call(getVisibleEditors(), _ref3) >= 0;
    };

    VimState.prototype.updateCursorsVisibility = function() {
      return this.cursorStyleManager.refresh();
    };

    VimState.prototype.updatePreviousSelection = function() {
      var head, properties, tail, _ref3;
      if (this.isMode('visual', 'blockwise')) {
        properties = (_ref3 = this.getLastBlockwiseSelection()) != null ? _ref3.getCharacterwiseProperties() : void 0;
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
      var _ref3;
      if ((_ref3 = this.scrollAnimationEffect) != null) {
        _ref3.finish();
      }
      return this.scrollAnimationEffect = null;
    };

    return VimState;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi92aW0tc3RhdGUuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZjQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVIsQ0FBWCxDQUFBOztBQUFBLEVBQ0MsU0FBVSxPQUFBLENBQVEsc0JBQVIsRUFBVixNQURELENBQUE7O0FBQUEsRUFHQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBSEosQ0FBQTs7QUFBQSxFQUlBLE9BQW9ELE9BQUEsQ0FBUSxNQUFSLENBQXBELEVBQUMsZUFBQSxPQUFELEVBQVUsa0JBQUEsVUFBVixFQUFzQiwyQkFBQSxtQkFBdEIsRUFBMkMsYUFBQSxLQUozQyxDQUFBOztBQUFBLEVBTUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBTlgsQ0FBQTs7QUFBQSxFQU9DLGVBQWdCLE9BQUEsQ0FBUSxTQUFSLEVBQWhCLFlBUEQsQ0FBQTs7QUFBQSxFQVFBLFFBQXFDLE9BQUEsQ0FBUSxTQUFSLENBQXJDLEVBQUMscUJBQUEsWUFBRCxFQUFlLDJCQUFBLGtCQVJmLENBQUE7O0FBQUEsRUFTQSxRQU9JLE9BQUEsQ0FBUSxTQUFSLENBUEosRUFDRSwwQkFBQSxpQkFERixFQUVFLHdCQUFBLGVBRkYsRUFHRSwwQkFBQSxpQkFIRixFQUlFLG9CQUFBLFdBSkYsRUFNRSxjQUFBLEtBZkYsQ0FBQTs7QUFBQSxFQWlCQSxLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSLENBakJSLENBQUE7O0FBQUEsRUFtQkEsY0FBQSxHQUFpQixPQUFBLENBQVEsbUJBQVIsQ0FuQmpCLENBQUE7O0FBQUEsRUFvQkEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQXBCZCxDQUFBOztBQUFBLEVB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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/vim-state.coffee
