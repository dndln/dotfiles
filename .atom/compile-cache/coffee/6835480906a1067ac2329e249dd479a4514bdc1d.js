(function() {
  var Base, CompositeDisposable, Disposable, Emitter, StatusBarManager, VimState, globalState, settings, _, _ref;

  _ = require('underscore-plus');

  _ref = require('atom'), Disposable = _ref.Disposable, Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  Base = require('./base');

  StatusBarManager = require('./status-bar-manager');

  globalState = require('./global-state');

  settings = require('./settings');

  VimState = require('./vim-state');

  module.exports = {
    config: settings.config,
    activate: function(state) {
      var developer, service, workspaceClassList;
      this.subscriptions = new CompositeDisposable;
      this.statusBarManager = new StatusBarManager;
      this.vimStatesByEditor = new Map;
      this.emitter = new Emitter;
      service = this.provideVimModePlus();
      this.subscribe(Base.init(service));
      this.registerCommands();
      this.registerVimStateCommands();
      if (atom.inDevMode()) {
        developer = new (require('./developer'));
        this.subscribe(developer.init(service));
      }
      this.subscribe(this.observeVimMode(function() {
        var message;
        message = "## Message by vim-mode-plus: vim-mode detected!\nTo use vim-mode-plus, you must **disable vim-mode** manually.".replace(/_/g, ' ');
        return atom.notifications.addWarning(message, {
          dismissable: true
        });
      }));
      this.subscribe(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var vimState;
          if (editor.isMini()) {
            return;
          }
          vimState = new VimState(editor, _this.statusBarManager, globalState);
          _this.vimStatesByEditor.set(editor, vimState);
          _this.subscribe(editor.onDidDestroy(function() {
            vimState.destroy();
            return _this.vimStatesByEditor["delete"](editor);
          }));
          return _this.emitter.emit('did-add-vim-state', vimState);
        };
      })(this)));
      workspaceClassList = atom.views.getView(atom.workspace).classList;
      this.subscribe(atom.workspace.onDidChangeActivePane(function() {
        return workspaceClassList.remove('vim-mode-plus-pane-maximized', 'hide-tab-bar');
      }));
      this.subscribe(atom.workspace.onDidStopChangingActivePaneItem((function(_this) {
        return function(item) {
          var _ref1;
          if (atom.workspace.isTextEditor(item)) {
            return (_ref1 = _this.getEditorState(item)) != null ? _ref1.highlightSearch.refresh() : void 0;
          }
        };
      })(this)));
      return this.subscribe(settings.observe('highlightSearch', function(newValue) {
        var value;
        if (newValue) {
          value = globalState.get('highlightSearchPattern');
          return globalState.set('highlightSearchPattern', value);
        } else {
          return globalState.set('highlightSearchPattern', null);
        }
      }));
    },
    observeVimMode: function(fn) {
      if (atom.packages.isPackageActive('vim-mode')) {
        fn();
      }
      return atom.packages.onDidActivatePackage(function(pack) {
        if (pack.name === 'vim-mode') {
          return fn();
        }
      });
    },
    onDidAddVimState: function(fn) {
      return this.emitter.on('did-add-vim-state', fn);
    },
    observeVimStates: function(fn) {
      this.vimStatesByEditor.forEach(fn);
      return this.onDidAddVimState(fn);
    },
    clearPersistentSelectionForEditors: function() {
      var editor, _i, _len, _ref1, _results;
      _ref1 = atom.workspace.getTextEditors();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        editor = _ref1[_i];
        _results.push(this.getEditorState(editor).clearPersistentSelections());
      }
      return _results;
    },
    deactivate: function() {
      this.subscriptions.dispose();
      return this.vimStatesByEditor.forEach(function(vimState) {
        return vimState.destroy();
      });
    },
    subscribe: function(arg) {
      return this.subscriptions.add(arg);
    },
    unsubscribe: function(arg) {
      return this.subscriptions.remove(arg);
    },
    registerCommands: function() {
      this.subscribe(atom.commands.add('atom-text-editor:not([mini])', {
        'vim-mode-plus:clear-highlight-search': function() {
          return globalState.set('highlightSearchPattern', null);
        },
        'vim-mode-plus:toggle-highlight-search': function() {
          return settings.toggle('highlightSearch');
        },
        'vim-mode-plus:clear-persistent-selection': (function(_this) {
          return function() {
            return _this.clearPersistentSelectionForEditors();
          };
        })(this)
      }));
      return this.subscribe(atom.commands.add('atom-workspace', {
        'vim-mode-plus:maximize-pane': (function(_this) {
          return function() {
            return _this.maximizePane();
          };
        })(this)
      }));
    },
    maximizePane: function() {
      var classList, selector;
      selector = 'vim-mode-plus-pane-maximized';
      classList = atom.views.getView(atom.workspace).classList;
      classList.toggle(selector);
      if (classList.contains(selector)) {
        if (settings.get('hideTabBarOnMaximizePane')) {
          return classList.add('hide-tab-bar');
        }
      } else {
        return classList.remove('hide-tab-bar');
      }
    },
    registerVimStateCommands: function() {
      var bindToVimState, char, chars, commands, getEditorState, _fn, _i, _j, _len, _results;
      commands = {
        'activate-normal-mode': function() {
          return this.activate('normal');
        },
        'activate-linewise-visual-mode': function() {
          return this.activate('visual', 'linewise');
        },
        'activate-characterwise-visual-mode': function() {
          return this.activate('visual', 'characterwise');
        },
        'activate-blockwise-visual-mode': function() {
          return this.activate('visual', 'blockwise');
        },
        'reset-normal-mode': function() {
          return this.resetNormalMode({
            userInvocation: true
          });
        },
        'set-register-name': function() {
          return this.register.setName();
        },
        'set-register-name-to-_': function() {
          return this.register.setName('_');
        },
        'set-register-name-to-*': function() {
          return this.register.setName('*');
        },
        'operator-modifier-characterwise': function() {
          return this.emitDidSetOperatorModifier({
            wise: 'characterwise'
          });
        },
        'operator-modifier-linewise': function() {
          return this.emitDidSetOperatorModifier({
            wise: 'linewise'
          });
        },
        'operator-modifier-occurrence': function() {
          return this.emitDidSetOperatorModifier({
            occurrence: true
          });
        },
        'repeat': function() {
          return this.operationStack.runRecorded();
        },
        'repeat-find': function() {
          return this.operationStack.runCurrentFind();
        },
        'repeat-find-reverse': function() {
          return this.operationStack.runCurrentFind({
            reverse: true
          });
        },
        'repeat-search': function() {
          return this.operationStack.runCurrentSearch();
        },
        'repeat-search-reverse': function() {
          return this.operationStack.runCurrentSearch({
            reverse: true
          });
        },
        'set-count-0': function() {
          return this.setCount(0);
        },
        'set-count-1': function() {
          return this.setCount(1);
        },
        'set-count-2': function() {
          return this.setCount(2);
        },
        'set-count-3': function() {
          return this.setCount(3);
        },
        'set-count-4': function() {
          return this.setCount(4);
        },
        'set-count-5': function() {
          return this.setCount(5);
        },
        'set-count-6': function() {
          return this.setCount(6);
        },
        'set-count-7': function() {
          return this.setCount(7);
        },
        'set-count-8': function() {
          return this.setCount(8);
        },
        'set-count-9': function() {
          return this.setCount(9);
        }
      };
      chars = (function() {
        _results = [];
        for (_i = 32; _i <= 126; _i++){ _results.push(_i); }
        return _results;
      }).apply(this).map(function(code) {
        return String.fromCharCode(code);
      });
      _fn = function(char) {
        var charForKeymap;
        charForKeymap = char === ' ' ? 'space' : char;
        return commands["set-input-char-" + charForKeymap] = function() {
          return this.emitDidSetInputChar(char);
        };
      };
      for (_j = 0, _len = chars.length; _j < _len; _j++) {
        char = chars[_j];
        _fn(char);
      }
      getEditorState = this.getEditorState.bind(this);
      bindToVimState = function(oldCommands) {
        var fn, name, newCommands, _fn1;
        newCommands = {};
        _fn1 = function(fn) {
          return newCommands["vim-mode-plus:" + name] = function(event) {
            var vimState;
            event.stopPropagation();
            if (vimState = getEditorState(this.getModel())) {
              return fn.call(vimState, event);
            }
          };
        };
        for (name in oldCommands) {
          fn = oldCommands[name];
          _fn1(fn);
        }
        return newCommands;
      };
      return this.subscribe(atom.commands.add('atom-text-editor:not([mini])', bindToVimState(commands)));
    },
    consumeStatusBar: function(statusBar) {
      this.statusBarManager.initialize(statusBar);
      this.statusBarManager.attach();
      return this.subscribe(new Disposable((function(_this) {
        return function() {
          return _this.statusBarManager.detach();
        };
      })(this)));
    },
    getGlobalState: function() {
      return globalState;
    },
    getEditorState: function(editor) {
      return this.vimStatesByEditor.get(editor);
    },
    provideVimModePlus: function() {
      return {
        Base: Base,
        getGlobalState: this.getGlobalState.bind(this),
        getEditorState: this.getEditorState.bind(this),
        observeVimStates: this.observeVimStates.bind(this),
        onDidAddVimState: this.onDidAddVimState.bind(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9tYWluLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwwR0FBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBRUEsT0FBNkMsT0FBQSxDQUFRLE1BQVIsQ0FBN0MsRUFBQyxrQkFBQSxVQUFELEVBQWEsZUFBQSxPQUFiLEVBQXNCLDJCQUFBLG1CQUZ0QixDQUFBOztBQUFBLEVBSUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSLENBSlAsQ0FBQTs7QUFBQSxFQUtBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxzQkFBUixDQUxuQixDQUFBOztBQUFBLEVBTUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQU5kLENBQUE7O0FBQUEsRUFPQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FQWCxDQUFBOztBQUFBLEVBUUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSLENBUlgsQ0FBQTs7QUFBQSxFQVVBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFBUSxRQUFRLENBQUMsTUFBakI7QUFBQSxJQUVBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTtBQUNSLFVBQUEsc0NBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFBakIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGdCQUFELEdBQW9CLEdBQUEsQ0FBQSxnQkFEcEIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGlCQUFELEdBQXFCLEdBQUEsQ0FBQSxHQUZyQixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBQSxPQUhYLENBQUE7QUFBQSxNQUtBLE9B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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/main.coffee
