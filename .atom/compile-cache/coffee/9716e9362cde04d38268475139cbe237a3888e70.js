(function() {
  var Base, BufferedProcess, CompositeDisposable, DevEnvironment, Developer, Disposable, Emitter, debug, fs, generateIntrospectionReport, getAncestors, getEditorState, getKeyBindingForCommand, getParent, packageScope, path, settings, _, _ref, _ref1;

  _ = require('underscore-plus');

  path = require('path');

  fs = require('fs-plus');

  _ref = require('atom'), Emitter = _ref.Emitter, Disposable = _ref.Disposable, BufferedProcess = _ref.BufferedProcess, CompositeDisposable = _ref.CompositeDisposable;

  Base = require('./base');

  generateIntrospectionReport = require('./introspection').generateIntrospectionReport;

  settings = require('./settings');

  _ref1 = require('./utils'), debug = _ref1.debug, getParent = _ref1.getParent, getAncestors = _ref1.getAncestors, getKeyBindingForCommand = _ref1.getKeyBindingForCommand;

  packageScope = 'vim-mode-plus';

  getEditorState = null;

  Developer = (function() {
    var kinds, modifierKeyMap, selectorMap;

    function Developer() {}

    Developer.prototype.init = function(service) {
      var commands, fn, name, subscriptions;
      getEditorState = service.getEditorState;
      this.devEnvironmentByBuffer = new Map;
      this.reloadSubscriptionByBuffer = new Map;
      commands = {
        'toggle-debug': (function(_this) {
          return function() {
            return _this.toggleDebug();
          };
        })(this),
        'open-in-vim': (function(_this) {
          return function() {
            return _this.openInVim();
          };
        })(this),
        'generate-introspection-report': (function(_this) {
          return function() {
            return _this.generateIntrospectionReport();
          };
        })(this),
        'generate-command-summary-table': (function(_this) {
          return function() {
            return _this.generateCommandSummaryTable();
          };
        })(this),
        'toggle-dev-environment': (function(_this) {
          return function() {
            return _this.toggleDevEnvironment();
          };
        })(this),
        'clear-debug-output': (function(_this) {
          return function() {
            return _this.clearDebugOutput();
          };
        })(this),
        'reload-packages': (function(_this) {
          return function() {
            return _this.reloadPackages();
          };
        })(this),
        'toggle-reload-packages-on-save': (function(_this) {
          return function() {
            return _this.toggleReloadPackagesOnSave();
          };
        })(this)
      };
      subscriptions = new CompositeDisposable;
      for (name in commands) {
        fn = commands[name];
        subscriptions.add(this.addCommand(name, fn));
      }
      return subscriptions;
    };

    Developer.prototype.reloadPackages = function() {
      var pack, packName, packPath, packages, _i, _len, _ref2, _results;
      packages = (_ref2 = settings.get('devReloadPackages')) != null ? _ref2 : [];
      packages.push('vim-mode-plus');
      _results = [];
      for (_i = 0, _len = packages.length; _i < _len; _i++) {
        packName = packages[_i];
        pack = atom.packages.getLoadedPackage(packName);
        if (pack != null) {
          console.log("deactivating " + packName);
          atom.packages.deactivatePackage(packName);
          atom.packages.unloadPackage(packName);
          packPath = pack.path;
          Object.keys(require.cache).filter(function(p) {
            return p.indexOf(packPath + path.sep) === 0;
          }).forEach(function(p) {
            return delete require.cache[p];
          });
          atom.packages.loadPackage(packName);
          _results.push(atom.packages.activatePackage(packName));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Developer.prototype.toggleReloadPackagesOnSave = function() {
      var buffer, editor, fileName, subscription;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      buffer = editor.getBuffer();
      fileName = path.basename(editor.getPath());
      if (subscription = this.reloadSubscriptionByBuffer.get(buffer)) {
        subscription.dispose();
        this.reloadSubscriptionByBuffer["delete"](buffer);
        return console.log("disposed reloadPackagesOnSave for " + fileName);
      } else {
        this.reloadSubscriptionByBuffer.set(buffer, buffer.onDidSave((function(_this) {
          return function() {
            console.clear();
            return _this.reloadPackages();
          };
        })(this)));
        return console.log("activated reloadPackagesOnSave for " + fileName);
      }
    };

    Developer.prototype.toggleDevEnvironment = function() {
      var buffer, editor, fileName;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      buffer = editor.getBuffer();
      fileName = path.basename(editor.getPath());
      if (this.devEnvironmentByBuffer.has(buffer)) {
        this.devEnvironmentByBuffer.get(buffer).dispose();
        this.devEnvironmentByBuffer["delete"](buffer);
        return console.log("disposed dev env " + fileName);
      } else {
        this.devEnvironmentByBuffer.set(buffer, new DevEnvironment(editor));
        return console.log("activated dev env " + fileName);
      }
    };

    Developer.prototype.addCommand = function(name, fn) {
      return atom.commands.add('atom-text-editor', "" + packageScope + ":" + name, fn);
    };

    Developer.prototype.clearDebugOutput = function(name, fn) {
      var filePath, options;
      filePath = fs.normalize(settings.get('debugOutputFilePath'));
      options = {
        searchAllPanes: true,
        activatePane: false
      };
      return atom.workspace.open(filePath, options).then(function(editor) {
        editor.setText('');
        return editor.save();
      });
    };

    Developer.prototype.toggleDebug = function() {
      settings.set('debug', !settings.get('debug'));
      return console.log("" + settings.scope + " debug:", settings.get('debug'));
    };

    modifierKeyMap = {
      "ctrl-cmd-": '\u2303\u2318',
      "cmd-": '\u2318',
      "ctrl-": '\u2303',
      alt: '\u2325',
      option: '\u2325',
      enter: '\u23ce',
      left: '\u2190',
      right: '\u2192',
      up: '\u2191',
      down: '\u2193',
      backspace: 'BS',
      space: 'SPC'
    };

    selectorMap = {
      "atom-text-editor.vim-mode-plus": '',
      ".normal-mode": 'n',
      ".insert-mode": 'i',
      ".replace": 'R',
      ".visual-mode": 'v',
      ".characterwise": 'C',
      ".blockwise": 'B',
      ".linewise": 'L',
      ".operator-pending-mode": 'o',
      ".with-count": '#',
      ".has-persistent-selection": '%'
    };

    Developer.prototype.getCommandSpecs = function() {
      var commandName, commands, compactKeystrokes, compactSelector, description, keymap, keymaps, kind, klass, name;
      compactSelector = function(selector) {
        var pattern;
        pattern = RegExp("(" + (_.keys(selectorMap).map(_.escapeRegExp).join('|')) + ")", "g");
        return selector.split(/,\s*/g).map(function(scope) {
          return scope.replace(/:not\((.*)\)/, '!$1').replace(pattern, function(s) {
            return selectorMap[s];
          });
        }).join(",");
      };
      compactKeystrokes = function(keystrokes) {
        var modifierKeyRegexp, specialChars, specialCharsRegexp;
        specialChars = '\\`*_{}[]()#+-.!';
        specialCharsRegexp = RegExp("" + (specialChars.split('').map(_.escapeRegExp).join('|')), "g");
        modifierKeyRegexp = RegExp("(" + (_.keys(modifierKeyMap).map(_.escapeRegExp).join('|')) + ")");
        return keystrokes.replace(modifierKeyRegexp, function(s) {
          return modifierKeyMap[s];
        }).replace(RegExp("(" + specialCharsRegexp + ")", "g"), "\\$1").replace(/\|/g, '&#124;').replace(/\s+/, '');
      };
      commands = (function() {
        var _ref2, _ref3, _results;
        _ref2 = Base.getRegistries();
        _results = [];
        for (name in _ref2) {
          klass = _ref2[name];
          if (!(klass.isCommand())) {
            continue;
          }
          kind = getAncestors(klass).map(function(k) {
            return k.name;
          }).slice(-2, -1)[0];
          commandName = klass.getCommandName();
          description = (_ref3 = klass.getDesctiption()) != null ? _ref3.replace(/\n/g, '<br/>') : void 0;
          keymap = null;
          if (keymaps = getKeyBindingForCommand(commandName, {
            packageName: "vim-mode-plus"
          })) {
            keymap = keymaps.map(function(_arg) {
              var keystrokes, selector;
              keystrokes = _arg.keystrokes, selector = _arg.selector;
              return "`" + (compactSelector(selector)) + "` <code>" + (compactKeystrokes(keystrokes)) + "</code>";
            }).join("<br/>");
          }
          _results.push({
            name: name,
            commandName: commandName,
            kind: kind,
            description: description,
            keymap: keymap
          });
        }
        return _results;
      })();
      return commands;
    };

    kinds = ["Operator", "Motion", "TextObject", "InsertMode", "MiscCommand", "Scroll"];

    Developer.prototype.generateSummaryTableForCommandSpecs = function(specs, _arg) {
      var commandName, description, grouped, header, keymap, kind, report, str, _i, _j, _len, _len1, _ref2;
      header = (_arg != null ? _arg : {}).header;
      grouped = _.groupBy(specs, 'kind');
      str = "";
      for (_i = 0, _len = kinds.length; _i < _len; _i++) {
        kind = kinds[_i];
        if (!(specs = grouped[kind])) {
          continue;
        }
        report = ["## " + kind, "", "| Keymap | Command | Description |", "|:-------|:--------|:------------|"];
        for (_j = 0, _len1 = specs.length; _j < _len1; _j++) {
          _ref2 = specs[_j], keymap = _ref2.keymap, commandName = _ref2.commandName, description = _ref2.description;
          commandName = commandName.replace(/vim-mode-plus:/, '');
          if (description == null) {
            description = "";
          }
          if (keymap == null) {
            keymap = "";
          }
          report.push("| " + keymap + " | `" + commandName + "` | " + description + " |");
        }
        str += report.join("\n") + "\n\n";
      }
      return atom.workspace.open().then(function(editor) {
        if (header != null) {
          editor.insertText(header + "\n");
        }
        return editor.insertText(str);
      });
    };

    Developer.prototype.generateCommandSummaryTable = function() {
      var header;
      header = "## Keymap selector abbreviations\n\nIn this document, following abbreviations are used for shortness.\n\n| Abbrev | Selector                     | Description                         |\n|:-------|:-----------------------------|:------------------------------------|\n| `!i`   | `:not(.insert-mode)`         | except insert-mode                  |\n| `i`    | `.insert-mode`               |                                     |\n| `o`    | `.operator-pending-mode`     |                                     |\n| `n`    | `.normal-mode`               |                                     |\n| `v`    | `.visual-mode`               |                                     |\n| `vB`   | `.visual-mode.blockwise`     |                                     |\n| `vL`   | `.visual-mode.linewise`      |                                     |\n| `vC`   | `.visual-mode.characterwise` |                                     |\n| `iR`   | `.insert-mode.replace`       |                                     |\n| `#`    | `.with-count`                | when count is specified             |\n| `%`    | `.has-persistent-selection` | when persistent-selection is exists |\n";
      return this.generateSummaryTableForCommandSpecs(this.getCommandSpecs(), {
        header: header
      });
    };

    Developer.prototype.openInVim = function() {
      var editor, row;
      editor = atom.workspace.getActiveTextEditor();
      row = editor.getCursorBufferPosition().row;
      return new BufferedProcess({
        command: "/Applications/MacVim.app/Contents/MacOS/mvim",
        args: [editor.getPath(), "+" + (row + 1)]
      });
    };

    Developer.prototype.generateIntrospectionReport = function() {
      return generateIntrospectionReport(_.values(Base.getRegistries()), {
        excludeProperties: ['run', 'getCommandNameWithoutPrefix', 'getClass', 'extend', 'getParent', 'getAncestors', 'isCommand', 'getRegistries', 'command', 'reset', 'getDesctiption', 'description', 'init', 'getCommandName', 'getCommandScope', 'registerCommand', 'delegatesProperties', 'subscriptions', 'commandPrefix', 'commandScope', 'delegatesMethods', 'delegatesProperty', 'delegatesMethod'],
        recursiveInspect: Base
      });
    };

    return Developer;

  })();

  DevEnvironment = (function() {
    function DevEnvironment(editor) {
      var fileName;
      this.editor = editor;
      this.editorElement = this.editor.element;
      this.emitter = new Emitter;
      fileName = path.basename(this.editor.getPath());
      this.disposable = this.editor.onDidSave((function(_this) {
        return function() {
          console.clear();
          Base.suppressWarning = true;
          _this.reload();
          Base.suppressWarning = false;
          Base.reset();
          _this.emitter.emit('did-reload');
          return console.log("reloaded " + fileName);
        };
      })(this));
    }

    DevEnvironment.prototype.dispose = function() {
      var _ref2;
      return (_ref2 = this.disposable) != null ? _ref2.dispose() : void 0;
    };

    DevEnvironment.prototype.onDidReload = function(fn) {
      return this.emitter.on('did-reload', fn);
    };

    DevEnvironment.prototype.reload = function() {
      var originalRequire, packPath;
      packPath = atom.packages.resolvePackagePath('vim-mode-plus');
      originalRequire = global.require;
      global.require = function(libPath) {
        if (libPath.startsWith('./')) {
          return originalRequire("" + packPath + "/lib/" + libPath);
        } else {
          return originalRequire(libPath);
        }
      };
      atom.commands.dispatch(this.editorElement, 'run-in-atom:run-in-atom');
      return global.require = originalRequire;
    };

    return DevEnvironment;

  })();

  module.exports = Developer;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9kZXZlbG9wZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtQQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FEUCxDQUFBOztBQUFBLEVBRUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBRkwsQ0FBQTs7QUFBQSxFQUdBLE9BQThELE9BQUEsQ0FBUSxNQUFSLENBQTlELEVBQUMsZUFBQSxPQUFELEVBQVUsa0JBQUEsVUFBVixFQUFzQix1QkFBQSxlQUF0QixFQUF1QywyQkFBQSxtQkFIdkMsQ0FBQTs7QUFBQSxFQUtBLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUixDQUxQLENBQUE7O0FBQUEsRUFNQyw4QkFBK0IsT0FBQSxDQUFRLGlCQUFSLEVBQS9CLDJCQU5ELENBQUE7O0FBQUEsRUFPQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FQWCxDQUFBOztBQUFBLEVBUUEsUUFBNEQsT0FBQSxDQUFRLFNBQVIsQ0FBNUQsRUFBQyxjQUFBLEtBQUQsRUFBUSxrQkFBQSxTQUFSLEVBQW1CLHFCQUFBLFlBQW5CLEVBQWlDLGdDQUFBLHVCQVJqQyxDQUFBOztBQUFBLEVBVUEsWUFBQSxHQUFlLGVBVmYsQ0FBQTs7QUFBQSxFQVdBLGNBQUEsR0FBaUIsSUFYakIsQ0FBQTs7QUFBQSxFQWFNO0FBQ0osUUFBQSxrQ0FBQTs7MkJBQUE7O0FBQUEsd0JBQUEsSUFBQSxHQUFNLFNBQUMsT0FBRCxHQUFBO0FBQ0osVUFBQSxpQ0FBQTtBQUFBLE1BQUMsaUJBQWtCLFFBQWxCLGNBQUQsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLHNC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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/developer.coffee
