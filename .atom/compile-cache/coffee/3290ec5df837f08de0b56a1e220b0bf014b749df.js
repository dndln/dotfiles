(function() {
  var REGISTERS, RegisterManager, settings,
    __slice = [].slice;

  settings = require('./settings');

  REGISTERS = /(?:[a-zA-Z*+%_".])/;

  RegisterManager = (function() {
    function RegisterManager(vimState) {
      var _ref;
      this.vimState = vimState;
      _ref = this.vimState, this.editor = _ref.editor, this.editorElement = _ref.editorElement, this.globalState = _ref.globalState;
      this.data = this.globalState.get('register');
      this.subscriptionBySelection = new Map;
      this.clipboardBySelection = new Map;
    }

    RegisterManager.prototype.reset = function() {
      this.name = null;
      return this.vimState.toggleClassList('with-register', this.hasName());
    };

    RegisterManager.prototype.destroy = function() {
      var _ref;
      this.subscriptionBySelection.forEach(function(disposable) {
        return disposable.dispose();
      });
      this.subscriptionBySelection.clear();
      this.clipboardBySelection.clear();
      return _ref = {}, this.subscriptionBySelection = _ref.subscriptionBySelection, this.clipboardBySelection = _ref.clipboardBySelection, _ref;
    };

    RegisterManager.prototype.isValidName = function(name) {
      return REGISTERS.test(name);
    };

    RegisterManager.prototype.getText = function(name, selection) {
      var _ref;
      return (_ref = this.get(name, selection).text) != null ? _ref : '';
    };

    RegisterManager.prototype.readClipboard = function(selection) {
      if (selection == null) {
        selection = null;
      }
      if ((selection != null ? selection.editor.hasMultipleCursors() : void 0) && this.clipboardBySelection.has(selection)) {
        return this.clipboardBySelection.get(selection);
      } else {
        return atom.clipboard.read();
      }
    };

    RegisterManager.prototype.writeClipboard = function(selection, text) {
      var disposable;
      if (selection == null) {
        selection = null;
      }
      if ((selection != null ? selection.editor.hasMultipleCursors() : void 0) && !this.clipboardBySelection.has(selection)) {
        disposable = selection.onDidDestroy((function(_this) {
          return function() {
            _this.subscriptionBySelection["delete"](selection);
            return _this.clipboardBySelection["delete"](selection);
          };
        })(this));
        this.subscriptionBySelection.set(selection, disposable);
      }
      if ((selection === null) || selection.isLastSelection()) {
        atom.clipboard.write(text);
      }
      if (selection != null) {
        return this.clipboardBySelection.set(selection, text);
      }
    };

    RegisterManager.prototype.get = function(name, selection) {
      var text, type, _ref, _ref1;
      if (name == null) {
        name = this.getName();
      }
      if (name === '"') {
        name = settings.get('defaultRegister');
      }
      switch (name) {
        case '*':
        case '+':
          text = this.readClipboard(selection);
          break;
        case '%':
          text = this.editor.getURI();
          break;
        case '_':
          text = '';
          break;
        default:
          _ref1 = (_ref = this.data[name.toLowerCase()]) != null ? _ref : {}, text = _ref1.text, type = _ref1.type;
      }
      if (type == null) {
        type = this.getCopyType(text != null ? text : '');
      }
      return {
        text: text,
        type: type
      };
    };

    RegisterManager.prototype.set = function() {
      var args, name, selection, value, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _ref = [], name = _ref[0], value = _ref[1];
      switch (args.length) {
        case 1:
          value = args[0];
          break;
        case 2:
          name = args[0], value = args[1];
      }
      if (name == null) {
        name = this.getName();
      }
      if (!this.isValidName(name)) {
        return;
      }
      if (name === '"') {
        name = settings.get('defaultRegister');
      }
      if (value.type == null) {
        value.type = this.getCopyType(value.text);
      }
      selection = value.selection;
      delete value.selection;
      switch (name) {
        case '*':
        case '+':
          return this.writeClipboard(selection, value.text);
        case '_':
        case '%':
          return null;
        default:
          if (/^[A-Z]$/.test(name)) {
            return this.append(name.toLowerCase(), value);
          } else {
            return this.data[name] = value;
          }
      }
    };

    RegisterManager.prototype.append = function(name, value) {
      var register;
      if (!(register = this.data[name])) {
        this.data[name] = value;
        return;
      }
      if ('linewise' === register.type || 'linewise' === value.type) {
        if (register.type !== 'linewise') {
          register.text += '\n';
          register.type = 'linewise';
        }
        if (value.type !== 'linewise') {
          value.text += '\n';
        }
      }
      return register.text += value.text;
    };

    RegisterManager.prototype.getName = function() {
      var _ref;
      return (_ref = this.name) != null ? _ref : settings.get('defaultRegister');
    };

    RegisterManager.prototype.isDefaultName = function() {
      return this.getName() === settings.get('defaultRegister');
    };

    RegisterManager.prototype.hasName = function() {
      return this.name != null;
    };

    RegisterManager.prototype.setName = function(name) {
      if (name == null) {
        name = null;
      }
      if (name != null) {
        if (this.isValidName(name)) {
          return this.name = name;
        }
      } else {
        this.vimState.hover.add('"');
        this.vimState.onDidConfirmInput((function(_this) {
          return function(name) {
            _this.name = name;
            _this.vimState.toggleClassList('with-register', _this.hasName());
            return _this.vimState.hover.add(_this.name);
          };
        })(this));
        this.vimState.onDidCancelInput((function(_this) {
          return function() {
            return _this.vimState.hover.reset();
          };
        })(this));
        return this.vimState.input.focus(1);
      }
    };

    RegisterManager.prototype.getCopyType = function(text) {
      if (text.lastIndexOf("\n") === text.length - 1) {
        return 'linewise';
      } else if (text.lastIndexOf("\r") === text.length - 1) {
        return 'linewise';
      } else {
        return 'character';
      }
    };

    return RegisterManager;

  })();

  module.exports = RegisterManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9yZWdpc3Rlci1tYW5hZ2VyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxvQ0FBQTtJQUFBLGtCQUFBOztBQUFBLEVBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBQVgsQ0FBQTs7QUFBQSxFQUVBLFNBQUEsR0FBWSxvQkFGWixDQUFBOztBQUFBLEVBbUJNO0FBQ1MsSUFBQSx5QkFBRSxRQUFGLEdBQUE7QUFDWCxVQUFBLElBQUE7QUFBQSxNQURZLElBQUMsQ0FBQSxXQUFBLFFBQ2IsQ0FBQTtBQUFBLE1BQUEsT0FBMEMsSUFBQyxDQUFBLFFBQTNDLEVBQUMsSUFBQyxDQUFBLGNBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxxQkFBQSxhQUFYLEVBQTBCLElBQUMsQ0FBQSxtQkFBQSxXQUEzQixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixVQUFqQixDQURSLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSx1QkFBRCxHQUEyQixHQUFBLENBQUEsR0FGM0IsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLG9CQUFELEdBQXdCLEdBQUEsQ0FBQSxHQUh4QixDQURXO0lBQUEsQ0FBYjs7QUFBQSw4QkFNQSxLQUFBLEdBQU8sU0FBQSxHQUFBO0FBQ0wsTUFBQSxJQUFDLENBQUEsSUFBRCxHQUFRLElBQVIsQ0FBQTthQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsZUFBVixDQUEwQixlQUExQixFQUEyQyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQTNDLEVBRks7SUFBQSxDQU5QLENBQUE7O0FBQUEsOEJBVUEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLFVBQUEsSUFBQTtBQUFB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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/register-manager.coffee
