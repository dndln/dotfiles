(function() {
  var CompositeDisposable, Disposable, ElementBuilder, Emitter, Input, InputElement, SearchInput, SearchInputElement, getCharacterForEvent, packageScope, registerElement, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('atom'), Emitter = _ref.Emitter, Disposable = _ref.Disposable, CompositeDisposable = _ref.CompositeDisposable;

  _ref1 = require('./utils'), registerElement = _ref1.registerElement, getCharacterForEvent = _ref1.getCharacterForEvent, ElementBuilder = _ref1.ElementBuilder;

  packageScope = 'vim-mode-plus';

  Input = (function(_super) {
    __extends(Input, _super);

    function Input() {
      return Input.__super__.constructor.apply(this, arguments);
    }

    ElementBuilder.includeInto(Input);

    Input.prototype.klass = "vim-mode-plus-input";

    Input.prototype.onDidChange = function(fn) {
      return this.emitter.on('did-change', fn);
    };

    Input.prototype.onDidConfirm = function(fn) {
      return this.emitter.on('did-confirm', fn);
    };

    Input.prototype.onDidCancel = function(fn) {
      return this.emitter.on('did-cancel', fn);
    };

    Input.prototype.onDidUnfocus = function(fn) {
      return this.emitter.on('did-unfocus', fn);
    };

    Input.prototype.onDidCommand = function(fn) {
      return this.emitter.on('did-command', fn);
    };

    Input.prototype.createdCallback = function() {
      this.className = this.klass;
      this.buildElements();
      this.editor = this.editorElement.getModel();
      this.editor.setMini(true);
      this.emitter = new Emitter;
      this.editor.onDidChange((function(_this) {
        return function() {
          var charsMax, text, _ref2;
          if (_this.finished) {
            return;
          }
          text = _this.editor.getText();
          _this.emitter.emit('did-change', text);
          if ((charsMax = (_ref2 = _this.options) != null ? _ref2.charsMax : void 0) && text.length >= _this.options.charsMax) {
            return _this.confirm();
          }
        };
      })(this));
      this.panel = atom.workspace.addBottomPanel({
        item: this,
        visible: false
      });
      return this;
    };

    Input.prototype.buildElements = function() {
      this.innerHTML = "<atom-text-editor mini class='editor vim-mode-plus-input'></atom-text-editor>";
      return this.editorElement = this.firstElementChild;
    };

    Input.prototype.initialize = function(vimState) {
      this.vimState = vimState;
      this.vimState.onDidFailToSetTarget((function(_this) {
        return function() {
          return _this.cancel();
        };
      })(this));
      return this;
    };

    Input.prototype.destroy = function() {
      var _ref2, _ref3;
      this.editor.destroy();
      if ((_ref2 = this.panel) != null) {
        _ref2.destroy();
      }
      _ref3 = {}, this.editor = _ref3.editor, this.panel = _ref3.panel, this.editorElement = _ref3.editorElement, this.vimState = _ref3.vimState;
      return this.remove();
    };

    Input.prototype.handleEvents = function() {
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

    Input.prototype.focus = function(options) {
      var disposable;
      this.options = options != null ? options : {};
      this.finished = false;
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

    Input.prototype.unfocus = function() {
      var _ref2, _ref3;
      if ((_ref2 = this.commandSubscriptions) != null) {
        _ref2.dispose();
      }
      this.finished = true;
      atom.workspace.getActivePane().activate();
      this.editor.setText('');
      if ((_ref3 = this.panel) != null) {
        _ref3.hide();
      }
      return this.emitter.emit('did-unfocus');
    };

    Input.prototype.isVisible = function() {
      var _ref2;
      return (_ref2 = this.panel) != null ? _ref2.isVisible() : void 0;
    };

    Input.prototype.cancel = function() {
      this.emitter.emit('did-cancel');
      return this.unfocus();
    };

    Input.prototype.confirm = function() {
      this.emitter.emit('did-confirm', this.editor.getText());
      return this.unfocus();
    };

    return Input;

  })(HTMLElement);

  SearchInput = (function(_super) {
    __extends(SearchInput, _super);

    function SearchInput() {
      return SearchInput.__super__.constructor.apply(this, arguments);
    }

    SearchInput.prototype.klass = "vim-mode-plus-search-container";

    SearchInput.prototype.literalModeDeactivator = null;

    SearchInput.prototype.buildElements = function() {
      var _ref2;
      this.innerHTML = "<div class='options-container'>\n  <span class='inline-block-tight btn btn-primary'>.*</span>\n</div>\n<div class='editor-container'>\n  <atom-text-editor mini class='editor vim-mode-plus-search'></atom-text-editor>\n</div>";
      _ref2 = this.getElementsByTagName('div'), this.optionsContainer = _ref2[0], this.editorContainer = _ref2[1];
      this.regexSearchStatus = this.optionsContainer.firstElementChild;
      return this.editorElement = this.editorContainer.firstElementChild;
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
      SearchInput.__super__.initialize.apply(this, arguments);
      this.options = {};
      atom.commands.add(this.editorElement, this.stopPropagation({
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
      return this;
    };

    SearchInput.prototype.confirm = function(landingPoint) {
      var searchConfirmEvent;
      if (landingPoint == null) {
        landingPoint = null;
      }
      searchConfirmEvent = {
        input: this.editor.getText(),
        landingPoint: landingPoint
      };
      this.emitter.emit('did-confirm', searchConfirmEvent);
      return this.unfocus();
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

    SearchInput.prototype.updateOptionSettings = function(_arg) {
      var useRegexp;
      useRegexp = (_arg != null ? _arg : {}).useRegexp;
      return this.regexSearchStatus.classList.toggle('btn-primary', useRegexp);
    };

    SearchInput.prototype.focus = function(_arg) {
      var backwards;
      backwards = _arg.backwards;
      if (backwards) {
        this.editorElement.classList.add('backwards');
      }
      return SearchInput.__super__.focus.call(this, {});
    };

    SearchInput.prototype.unfocus = function() {
      var _ref2;
      this.editorElement.classList.remove('backwards');
      this.regexSearchStatus.classList.add('btn-primary');
      if ((_ref2 = this.literalModeDeactivator) != null) {
        _ref2.dispose();
      }
      return SearchInput.__super__.unfocus.apply(this, arguments);
    };

    return SearchInput;

  })(Input);

  InputElement = registerElement('vim-mode-plus-input', {
    prototype: Input.prototype
  });

  SearchInputElement = registerElement('vim-mode-plus-search-input', {
    prototype: SearchInput.prototype
  });

  module.exports = {
    InputElement: InputElement,
    SearchInputElement: SearchInputElement
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9pbnB1dC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZ0xBQUE7SUFBQTs7eUpBQUE7O0FBQUEsRUFBQSxPQUE2QyxPQUFBLENBQVEsTUFBUixDQUE3QyxFQUFDLGVBQUEsT0FBRCxFQUFVLGtCQUFBLFVBQVYsRUFBc0IsMkJBQUEsbUJBQXRCLENBQUE7O0FBQUEsRUFDQSxRQUEwRCxPQUFBLENBQVEsU0FBUixDQUExRCxFQUFDLHdCQUFBLGVBQUQsRUFBa0IsNkJBQUEsb0JBQWxCLEVBQXdDLHVCQUFBLGNBRHhDLENBQUE7O0FBQUEsRUFFQSxZQUFBLEdBQWUsZUFGZixDQUFBOztBQUFBLEVBTU07QUFDSiw0QkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxjQUFjLENBQUMsV0FBZixDQUEyQixLQUEzQixDQUFBLENBQUE7O0FBQUEsb0JBQ0EsS0FBQSxHQUFPLHFCQURQLENBQUE7O0FBQUEsb0JBR0EsV0FBQSxHQUFhLFNBQUMsRUFBRCxHQUFBO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksWUFBWixFQUEwQixFQUExQixFQUFSO0lBQUEsQ0FIYixDQUFBOztBQUFBLG9CQUlBLFlBQUEsR0FBYyxTQUFDLEVBQUQsR0FBQTthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGFBQVosRUFBMkIsRUFBM0IsRUFBUjtJQUFBLENBSmQsQ0FBQTs7QUFBQSxvQkFLQSxXQUFBLEdBQWEsU0FBQyxFQUFELEdBQUE7YUFBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxZQUFaLEVBQTBCLEVBQTFCLEVBQVI7SUFBQSxDQUxiLENBQUE7O0FBQUEsb0JBTUEsWUFBQSxHQUFjLFNBQUMsRUFBRCxHQUFBO2FB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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/input.coffee
