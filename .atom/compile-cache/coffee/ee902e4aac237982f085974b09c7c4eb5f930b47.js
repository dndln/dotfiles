(function() {
  var Base, CompositeDisposable, Disposable, Emitter, ModeManager, Range, moveCursorLeft, settings, swrap, _, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  _ref = require('atom'), Emitter = _ref.Emitter, Range = _ref.Range, CompositeDisposable = _ref.CompositeDisposable, Disposable = _ref.Disposable;

  Base = require('./base');

  swrap = require('./selection-wrapper');

  moveCursorLeft = require('./utils').moveCursorLeft;

  settings = require('./settings');

  ModeManager = (function() {
    ModeManager.prototype.mode = 'insert';

    ModeManager.prototype.submode = null;

    ModeManager.prototype.replacedCharsBySelection = null;

    function ModeManager(vimState) {
      var _ref1;
      this.vimState = vimState;
      _ref1 = this.vimState, this.editor = _ref1.editor, this.editorElement = _ref1.editorElement;
      this.mode = 'insert';
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
    }

    ModeManager.prototype.destroy = function() {
      return this.subscriptions.dispose();
    };

    ModeManager.prototype.isMode = function(mode, submodes) {
      var _ref1;
      if (submodes != null) {
        return (this.mode === mode) && (_ref1 = this.submode, __indexOf.call([].concat(submodes), _ref1) >= 0);
      } else {
        return this.mode === mode;
      }
    };

    ModeManager.prototype.onWillActivateMode = function(fn) {
      return this.emitter.on('will-activate-mode', fn);
    };

    ModeManager.prototype.onDidActivateMode = function(fn) {
      return this.emitter.on('did-activate-mode', fn);
    };

    ModeManager.prototype.onWillDeactivateMode = function(fn) {
      return this.emitter.on('will-deactivate-mode', fn);
    };

    ModeManager.prototype.preemptWillDeactivateMode = function(fn) {
      return this.emitter.preempt('will-deactivate-mode', fn);
    };

    ModeManager.prototype.onDidDeactivateMode = function(fn) {
      return this.emitter.on('did-deactivate-mode', fn);
    };

    ModeManager.prototype.activate = function(mode, submode) {
      var _ref1, _ref2;
      if (submode == null) {
        submode = null;
      }
      if ((mode === 'visual') && this.editor.isEmpty()) {
        return;
      }
      this.emitter.emit('will-activate-mode', {
        mode: mode,
        submode: submode
      });
      if ((mode === 'visual') && (submode === this.submode)) {
        _ref1 = ['normal', null], mode = _ref1[0], submode = _ref1[1];
      }
      if (mode !== this.mode) {
        this.deactivate();
      }
      this.deactivator = (function() {
        switch (mode) {
          case 'normal':
            return this.activateNormalMode();
          case 'operator-pending':
            return this.activateOperatorPendingMode();
          case 'insert':
            return this.activateInsertMode(submode);
          case 'visual':
            return this.activateVisualMode(submode);
        }
      }).call(this);
      this.editorElement.classList.remove("" + this.mode + "-mode");
      this.editorElement.classList.remove(this.submode);
      _ref2 = [mode, submode], this.mode = _ref2[0], this.submode = _ref2[1];
      this.editorElement.classList.add("" + this.mode + "-mode");
      if (this.submode != null) {
        this.editorElement.classList.add(this.submode);
      }
      if (this.mode === 'visual') {
        this.updateNarrowedState();
        this.vimState.updatePreviousSelection();
      }
      this.vimState.statusBarManager.update(this.mode, this.submode);
      this.vimState.updateCursorsVisibility();
      return this.emitter.emit('did-activate-mode', {
        mode: this.mode,
        submode: this.submode
      });
    };

    ModeManager.prototype.deactivate = function() {
      var _ref1, _ref2;
      if (!((_ref1 = this.deactivator) != null ? _ref1.disposed : void 0)) {
        this.emitter.emit('will-deactivate-mode', {
          mode: this.mode,
          submode: this.submode
        });
        if ((_ref2 = this.deactivator) != null) {
          _ref2.dispose();
        }
        return this.emitter.emit('did-deactivate-mode', {
          mode: this.mode,
          submode: this.submode
        });
      }
    };

    ModeManager.prototype.activateNormalMode = function() {
      var _ref1;
      this.vimState.reset();
      if ((_ref1 = this.editorElement.component) != null) {
        _ref1.setInputEnabled(false);
      }
      return new Disposable;
    };

    ModeManager.prototype.activateOperatorPendingMode = function() {
      return new Disposable;
    };

    ModeManager.prototype.activateInsertMode = function(submode) {
      var replaceModeDeactivator;
      if (submode == null) {
        submode = null;
      }
      this.editorElement.component.setInputEnabled(true);
      if (submode === 'replace') {
        replaceModeDeactivator = this.activateReplaceMode();
      }
      return new Disposable((function(_this) {
        return function() {
          var cursor, needSpecialCareToPreventWrapLine, _i, _len, _ref1, _ref2, _results;
          if (replaceModeDeactivator != null) {
            replaceModeDeactivator.dispose();
          }
          replaceModeDeactivator = null;
          if (settings.get('clearMultipleCursorsOnEscapeInsertMode')) {
            _this.editor.clearSelections();
          }
          needSpecialCareToPreventWrapLine = (_ref1 = atom.config.get('editor.atomicSoftTabs')) != null ? _ref1 : true;
          _ref2 = _this.editor.getCursors();
          _results = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            cursor = _ref2[_i];
            _results.push(moveCursorLeft(cursor, {
              needSpecialCareToPreventWrapLine: needSpecialCareToPreventWrapLine
            }));
          }
          return _results;
        };
      })(this));
    };

    ModeManager.prototype.activateReplaceMode = function() {
      var subs;
      this.replacedCharsBySelection = {};
      subs = new CompositeDisposable;
      subs.add(this.editor.onWillInsertText((function(_this) {
        return function(_arg) {
          var cancel, text;
          text = _arg.text, cancel = _arg.cancel;
          cancel();
          return _this.editor.getSelections().forEach(function(selection) {
            var char, _base, _i, _len, _name, _ref1, _ref2, _results;
            _ref2 = (_ref1 = text.split('')) != null ? _ref1 : [];
            _results = [];
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              char = _ref2[_i];
              if ((char !== "\n") && (!selection.cursor.isAtEndOfLine())) {
                selection.selectRight();
              }
              if ((_base = _this.replacedCharsBySelection)[_name = selection.id] == null) {
                _base[_name] = [];
              }
              _results.push(_this.replacedCharsBySelection[selection.id].push(swrap(selection).replace(char)));
            }
            return _results;
          });
        };
      })(this)));
      subs.add(new Disposable((function(_this) {
        return function() {
          return _this.replacedCharsBySelection = null;
        };
      })(this)));
      return subs;
    };

    ModeManager.prototype.getReplacedCharForSelection = function(selection) {
      var _ref1;
      return (_ref1 = this.replacedCharsBySelection[selection.id]) != null ? _ref1.pop() : void 0;
    };

    ModeManager.prototype.activateVisualMode = function(submode) {
      var selection, _i, _len, _ref1;
      if (this.submode != null) {
        this.normalizeSelections();
      }
      _ref1 = this.editor.getSelections();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        selection = _ref1[_i];
        if ((this.submode != null) || selection.isEmpty()) {
          swrap(selection).translateSelectionEndAndClip('forward');
        }
      }
      this.vimState.updateSelectionProperties();
      switch (submode) {
        case 'linewise':
          this.vimState.selectLinewise();
          break;
        case 'blockwise':
          if (!swrap(this.editor.getLastSelection()).isLinewise()) {
            this.vimState.selectBlockwise();
          }
      }
      return new Disposable((function(_this) {
        return function() {
          var _j, _len1, _ref2;
          _this.normalizeSelections();
          _ref2 = _this.editor.getSelections();
          for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
            selection = _ref2[_j];
            selection.clear({
              autoscroll: false
            });
          }
          return _this.updateNarrowedState(false);
        };
      })(this));
    };

    ModeManager.prototype.normalizeSelections = function() {
      var bs, selection, _i, _j, _k, _len, _len1, _len2, _ref1, _ref2, _ref3, _results;
      switch (this.submode) {
        case 'characterwise':
          null;
          break;
        case 'linewise':
          _ref1 = this.editor.getSelections();
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            selection = _ref1[_i];
            if (!(!selection.isEmpty())) {
              continue;
            }
            swrap(selection).restoreColumnFromProperties();
            swrap(selection).translateSelectionEndAndClip('forward');
          }
          break;
        case 'blockwise':
          _ref2 = this.vimState.getBlockwiseSelections();
          for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
            bs = _ref2[_j];
            bs.restoreCharacterwise();
          }
          this.vimState.clearBlockwiseSelections();
      }
      swrap.clearProperties(this.editor);
      _ref3 = this.editor.getSelections();
      _results = [];
      for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
        selection = _ref3[_k];
        if (!selection.isEmpty()) {
          _results.push(swrap(selection).translateSelectionEndAndClip('backward'));
        }
      }
      return _results;
    };

    ModeManager.prototype.hasMultiLineSelection = function() {
      var _ref1;
      if (this.isMode('visual', 'blockwise')) {
        return !((_ref1 = this.vimState.getLastBlockwiseSelection()) != null ? _ref1.isSingleRow() : void 0);
      } else {
        return !swrap(this.editor.getLastSelection()).isSingleRow();
      }
    };

    ModeManager.prototype.updateNarrowedState = function(value) {
      if (value == null) {
        value = null;
      }
      return this.editorElement.classList.toggle('is-narrowed', value != null ? value : this.hasMultiLineSelection());
    };

    ModeManager.prototype.isNarrowed = function() {
      return this.editorElement.classList.contains('is-narrowed');
    };

    return ModeManager;

  })();

  module.exports = ModeManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9tb2RlLW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRHQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLE9BQW9ELE9BQUEsQ0FBUSxNQUFSLENBQXBELEVBQUMsZUFBQSxPQUFELEVBQVUsYUFBQSxLQUFWLEVBQWlCLDJCQUFBLG1CQUFqQixFQUFzQyxrQkFBQSxVQUR0QyxDQUFBOztBQUFBLEVBRUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSLENBRlAsQ0FBQTs7QUFBQSxFQUdBLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVIsQ0FIUixDQUFBOztBQUFBLEVBSUMsaUJBQWtCLE9BQUEsQ0FBUSxTQUFSLEVBQWxCLGNBSkQsQ0FBQTs7QUFBQSxFQUtBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQUxYLENBQUE7O0FBQUEsRUFPTTtBQUNKLDBCQUFBLElBQUEsR0FBTSxRQUFOLENBQUE7O0FBQUEsMEJBQ0EsT0FBQSxHQUFTLElBRFQsQ0FBQTs7QUFBQSwwQkFFQSx3QkFBQSxHQUEwQixJQUYxQixDQUFBOztBQUlhLElBQUEscUJBQUUsUUFBRixHQUFBO0FBQ1gsVUFBQSxLQUFBO0FBQUEsTUFEWSxJQUFDLENBQUEsV0FBQSxRQUNiLENBQUE7QUFBQSxNQUFBLFFBQTRCLElBQUMsQ0FBQSxRQUE3QixFQUFDLElBQUMsQ0FBQSxlQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEsc0JBQUEsYUFBWCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsSUFBRCxHQUFRLFFBRFIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUFBLENB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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/mode-manager.coffee
