(function() {
  var CompositeDisposable, Disposable, Emitter, SearchInput, registerElement, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('atom'), Emitter = _ref.Emitter, Disposable = _ref.Disposable, CompositeDisposable = _ref.CompositeDisposable;

  registerElement = require('./utils').registerElement;

  SearchInput = (function(_super) {
    __extends(SearchInput, _super);

    function SearchInput() {
      return SearchInput.__super__.constructor.apply(this, arguments);
    }

    SearchInput.prototype.literalModeDeactivator = null;

    SearchInput.prototype.onDidChange = function(fn) {
      return this.emitter.on('did-change', fn);
    };

    SearchInput.prototype.onDidConfirm = function(fn) {
      return this.emitter.on('did-confirm', fn);
    };

    SearchInput.prototype.onDidCancel = function(fn) {
      return this.emitter.on('did-cancel', fn);
    };

    SearchInput.prototype.onDidCommand = function(fn) {
      return this.emitter.on('did-command', fn);
    };

    SearchInput.prototype.createdCallback = function() {
      var editorContainer, optionsContainer, _ref1;
      this.className = "vim-mode-plus-search-container";
      this.emitter = new Emitter;
      this.innerHTML = "<div class='options-container'>\n  <span class='inline-block-tight btn btn-primary'>.*</span>\n</div>\n<div class='editor-container'>\n  <atom-text-editor mini class='editor vim-mode-plus-search'></atom-text-editor>\n</div>";
      _ref1 = this.getElementsByTagName('div'), optionsContainer = _ref1[0], editorContainer = _ref1[1];
      this.regexSearchStatus = optionsContainer.firstElementChild;
      this.editorElement = editorContainer.firstElementChild;
      this.editor = this.editorElement.getModel();
      this.editor.setMini(true);
      this.editor.onDidChange((function(_this) {
        return function() {
          if (_this.finished) {
            return;
          }
          return _this.emitter.emit('did-change', _this.editor.getText());
        };
      })(this));
      this.panel = atom.workspace.addBottomPanel({
        item: this,
        visible: false
      });
      return this;
    };

    SearchInput.prototype.destroy = function() {
      var _ref1, _ref2;
      this.disposables.dispose();
      this.editor.destroy();
      if ((_ref1 = this.panel) != null) {
        _ref1.destroy();
      }
      _ref2 = {}, this.editor = _ref2.editor, this.panel = _ref2.panel, this.editorElement = _ref2.editorElement, this.vimState = _ref2.vimState;
      return this.remove();
    };

    SearchInput.prototype.handleEvents = function() {
      return atom.commands.add(this.editorElement, {
        'core:confirm': (function(_this) {
          return function() {
            return _this.confirm();
          };
        })(this),
        'core:cancel': (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this),
        'blur': (function(_this) {
          return function() {
            if (!_this.finished) {
              return _this.cancel();
            }
          };
        })(this),
        'vim-mode-plus:input-cancel': (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this)
      });
    };

    SearchInput.prototype.focus = function(options) {
      var disposable;
      this.options = options != null ? options : {};
      this.finished = false;
      if (this.options.backwards) {
        this.editorElement.classList.add('backwards');
      }
      this.panel.show();
      this.editorElement.focus();
      this.commandSubscriptions = this.handleEvents();
      return disposable = atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function() {
          disposable.dispose();
          if (!_this.finished) {
            return _this.cancel();
          }
        };
      })(this));
    };

    SearchInput.prototype.unfocus = function() {
      var _ref1, _ref2, _ref3;
      this.editorElement.classList.remove('backwards');
      this.regexSearchStatus.classList.add('btn-primary');
      if ((_ref1 = this.literalModeDeactivator) != null) {
        _ref1.dispose();
      }
      if ((_ref2 = this.commandSubscriptions) != null) {
        _ref2.dispose();
      }
      this.finished = true;
      atom.workspace.getActivePane().activate();
      this.editor.setText('');
      return (_ref3 = this.panel) != null ? _ref3.hide() : void 0;
    };

    SearchInput.prototype.updateOptionSettings = function(_arg) {
      var useRegexp;
      useRegexp = (_arg != null ? _arg : {}).useRegexp;
      return this.regexSearchStatus.classList.toggle('btn-primary', useRegexp);
    };

    SearchInput.prototype.setCursorWord = function() {
      return this.editor.insertText(this.vimState.editor.getWordUnderCursor());
    };

    SearchInput.prototype.activateLiteralMode = function() {
      if (this.literalModeDeactivator != null) {
        return this.literalModeDeactivator.dispose();
      } else {
        this.literalModeDeactivator = new CompositeDisposable();
        this.editorElement.classList.add('literal-mode');
        return this.literalModeDeactivator.add(new Disposable((function(_this) {
          return function() {
            _this.editorElement.classList.remove('literal-mode');
            return _this.literalModeDeactivator = null;
          };
        })(this)));
      }
    };

    SearchInput.prototype.isVisible = function() {
      var _ref1;
      return (_ref1 = this.panel) != null ? _ref1.isVisible() : void 0;
    };

    SearchInput.prototype.cancel = function() {
      this.emitter.emit('did-cancel');
      return this.unfocus();
    };

    SearchInput.prototype.confirm = function(landingPoint) {
      if (landingPoint == null) {
        landingPoint = null;
      }
      this.emitter.emit('did-confirm', {
        input: this.editor.getText(),
        landingPoint: landingPoint
      });
      return this.unfocus();
    };

    SearchInput.prototype.stopPropagation = function(oldCommands) {
      var fn, name, newCommands, _fn;
      newCommands = {};
      _fn = function(fn) {
        var commandName;
        if (__indexOf.call(name, ':') >= 0) {
          commandName = name;
        } else {
          commandName = "vim-mode-plus:" + name;
        }
        return newCommands[commandName] = function(event) {
          event.stopImmediatePropagation();
          return fn(event);
        };
      };
      for (name in oldCommands) {
        fn = oldCommands[name];
        _fn(fn);
      }
      return newCommands;
    };

    SearchInput.prototype.initialize = function(vimState) {
      this.vimState = vimState;
      this.vimState.onDidFailToSetTarget((function(_this) {
        return function() {
          return _this.cancel();
        };
      })(this));
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.registerCommands();
      return this;
    };

    SearchInput.prototype.registerCommands = function() {
      return atom.commands.add(this.editorElement, this.stopPropagation({
        "search-confirm": (function(_this) {
          return function() {
            return _this.confirm();
          };
        })(this),
        "search-land-to-start": (function(_this) {
          return function() {
            return _this.confirm();
          };
        })(this),
        "search-land-to-end": (function(_this) {
          return function() {
            return _this.confirm('end');
          };
        })(this),
        "search-cancel": (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this),
        "search-visit-next": (function(_this) {
          return function() {
            return _this.emitter.emit('did-command', {
              name: 'visit',
              direction: 'next'
            });
          };
        })(this),
        "search-visit-prev": (function(_this) {
          return function() {
            return _this.emitter.emit('did-command', {
              name: 'visit',
              direction: 'prev'
            });
          };
        })(this),
        "select-occurrence-from-search": (function(_this) {
          return function() {
            return _this.emitter.emit('did-command', {
              name: 'occurrence',
              operation: 'SelectOccurrence'
            });
          };
        })(this),
        "change-occurrence-from-search": (function(_this) {
          return function() {
            return _this.emitter.emit('did-command', {
              name: 'occurrence',
              operation: 'ChangeOccurrence'
            });
          };
        })(this),
        "add-occurrence-pattern-from-search": (function(_this) {
          return function() {
            return _this.emitter.emit('did-command', {
              name: 'occurrence'
            });
          };
        })(this),
        "search-insert-wild-pattern": (function(_this) {
          return function() {
            return _this.editor.insertText('.*?');
          };
        })(this),
        "search-activate-literal-mode": (function(_this) {
          return function() {
            return _this.activateLiteralMode();
          };
        })(this),
        "search-set-cursor-word": (function(_this) {
          return function() {
            return _this.setCursorWord();
          };
        })(this),
        'core:move-up': (function(_this) {
          return function() {
            return _this.editor.setText(_this.vimState.searchHistory.get('prev'));
          };
        })(this),
        'core:move-down': (function(_this) {
          return function() {
            return _this.editor.setText(_this.vimState.searchHistory.get('next'));
          };
        })(this)
      }));
    };

    return SearchInput;

  })(HTMLElement);

  module.exports = registerElement('vim-mode-plus-search-input', {
    prototype: SearchInput.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9zZWFyY2gtaW5wdXQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRFQUFBO0lBQUE7O3lKQUFBOztBQUFBLEVBQUEsT0FBNkMsT0FBQSxDQUFRLE1BQVIsQ0FBN0MsRUFBQyxlQUFBLE9BQUQsRUFBVSxrQkFBQSxVQUFWLEVBQXNCLDJCQUFBLG1CQUF0QixDQUFBOztBQUFBLEVBQ0Msa0JBQW1CLE9BQUEsQ0FBUSxTQUFSLEVBQW5CLGVBREQsQ0FBQTs7QUFBQSxFQUdNO0FBQ0osa0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLDBCQUFBLHNCQUFBLEdBQXdCLElBQXhCLENBQUE7O0FBQUEsMEJBRUEsV0FBQSxHQUFhLFNBQUMsRUFBRCxHQUFBO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksWUFBWixFQUEwQixFQUExQixFQUFSO0lBQUEsQ0FGYixDQUFBOztBQUFBLDBCQUdBLFlBQUEsR0FBYyxTQUFDLEVBQUQsR0FBQTthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGFBQVosRUFBMkIsRUFBM0IsRUFBUjtJQUFBLENBSGQsQ0FBQTs7QUFBQSwwQkFJQSxXQUFBLEdBQWEsU0FBQyxFQUFELEdBQUE7YUFBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxZQUFaLEVBQTBCLEVBQTFCLEVBQVI7SUFBQSxDQUpiLENBQUE7O0FBQUEsMEJBS0EsWUFBQSxHQUFjLFNBQUMsRUFBRCxHQUFBO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksYUFBWixFQUEyQixFQUEzQixFQUFSO0lBQUEsQ0FMZCxDQUFBOztBQUFBLDBCQU9BLGVBQUEsR0FBaUIsU0FBQSxHQUFBO0FBQ2YsVUFBQSx3Q0FB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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/search-input.coffee
