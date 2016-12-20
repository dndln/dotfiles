(function() {
  var CompositeDisposable, Emitter, getEditorState, _ref;

  _ref = require('atom'), Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  getEditorState = null;

  module.exports = {
    activate: function() {
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])', {
        'vim-mode-plus-ex-mode:open': (function(_this) {
          return function() {
            return _this.toggle('normalCommands');
          };
        })(this),
        'vim-mode-plus-ex-mode:toggle-setting': (function(_this) {
          return function() {
            return _this.toggle('toggleCommands');
          };
        })(this)
      }));
    },
    toggle: function(commandKind) {
      var editor;
      editor = atom.workspace.getActiveTextEditor();
      return this.getEditorState(editor).then((function(_this) {
        return function(vimState) {
          return _this.getView().toggle(vimState, commandKind);
        };
      })(this));
    },
    getEditorState: function(editor) {
      if (getEditorState != null) {
        return Promise.resolve(getEditorState(editor));
      } else {
        return new Promise((function(_this) {
          return function(resolve) {
            return _this.onDidConsumeVim(function() {
              return resolve(getEditorState(editor));
            });
          };
        })(this));
      }
    },
    deactivate: function() {
      var _ref1, _ref2;
      this.subscriptions.dispose();
      if ((_ref1 = this.view) != null) {
        if (typeof _ref1.destroy === "function") {
          _ref1.destroy();
        }
      }
      return _ref2 = {}, this.subscriptions = _ref2.subscriptions, this.view = _ref2.view, _ref2;
    },
    getView: function() {
      return this.view != null ? this.view : this.view = new (require('./view'));
    },
    onDidConsumeVim: function(fn) {
      return this.emitter.on('did-consume-vim', fn);
    },
    consumeVim: function(service) {
      getEditorState = service.getEditorState;
      return this.emitter.emit('did-consume-vim');
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzLWV4LW1vZGUvbGliL21haW4uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtEQUFBOztBQUFBLEVBQUEsT0FBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQyxlQUFBLE9BQUQsRUFBVSwyQkFBQSxtQkFBVixDQUFBOztBQUFBLEVBQ0EsY0FBQSxHQUFpQixJQURqQixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsUUFBQSxFQUFVLFNBQUEsR0FBQTtBQUNSLE1BQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUFBLENBQUEsT0FBWCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBRGpCLENBQUE7YUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLDhCQUFsQixFQUNqQjtBQUFBLFFBQUEsNEJBQUEsRUFBOEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBUSxnQkFBUixFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUI7QUFBQSxRQUNBLHNDQUFBLEVBQXdDLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxNQUFELENBQVEsZ0JBQVIsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRHhDO09BRGlCLENBQW5CLEVBSFE7SUFBQSxDQUFWO0FBQUEsSUFPQSxNQUFBLEVBQVEsU0FBQyxXQUFELEdBQUE7QUFDTixVQUFBLE1BQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBVCxDQUFBO2FBQ0EsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsTUFBaEIsQ0FBdUIsQ0FBQyxJQUF4QixDQUE2QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxRQUFELEdBQUE7aUJBQzNCLEtBQUMsQ0FBQSxPQUFELENBQUEsQ0FBVSxDQUFDLE1BQVgsQ0FBa0IsUUFBbEIsRUFBNEIsV0FBNUIsRUFEMkI7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QixFQUZNO0lBQUEsQ0FQUjtBQUFBLElBWUEsY0FBQSxFQUFnQixTQUFDLE1BQUQsR0FBQTtBQUNkLE1BQUEsSUFBRyxzQkFBSDtlQUNFLE9BQU8sQ0FBQyxPQUFSLENBQWdCLGNBQUEsQ0FBZSxNQUFmLENBQWhCLEVBREY7T0FBQSxNQUFBO2VBR00sSUFBQSxPQUFBLENBQVEsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFDLE9BQUQsR0FBQTttQkFDVixLQUFDLENBQUEsZUFBRCxDQUFpQixTQUFBLEdBQUE7cUJBQ2YsT0FBQSxDQUFRLGNBQUEsQ0FBZSxNQUFmLENBQVIsRUFEZTtZQUFBLENBQWpCLEVBRFU7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFSLEVBSE47T0FEYztJQUFBLENBWmhCO0FBQUEsSUFvQkEsVUFBQSxFQUFZLFNBQUEsR0FBQTtBQUNWLFVBQUEsWUFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUEsQ0FBQSxDQUFBOzs7ZUFDSyxDQUFFOztPQURQO2FBRUEsUUFBMEIsRUFBMUIsRUFBQyxJQUFDLENBQUEsc0JBQUEsYUFBRixFQUFpQixJQUFDLENBQUEsYUFBQSxJQUFsQixFQUFBLE1BSFU7SUFBQSxDQXBCWjtBQUFBLElBeUJBLE9BQUEsRUFBUyxTQUFBLEdBQUE7aUNBQ1AsSUFBQyxDQUFBLE9BQUQsSUFBQyxDQUFBLE9BQVEsR0FBQSxDQUFBLENBQUssT0FBQSxDQUFRLFFBQVIsQ0FBRCxFQUROO0lBQUEsQ0F6QlQ7QUFBQSxJQTRCQSxlQUFBLEVBQWlCLFNBQUMsRUFBRCxHQUFBO2FBQ2YsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksaUJBQVosRUFBK0IsRUFBL0IsRUFEZTtJQUFBLENBNUJqQjtBQUFBLElBK0JBLFVBQUEsRUFBWSxTQUFDLE9BQUQsR0FBQTtBQUNWLE1BQUMsaUJBQWtCLFFBQWxCLGNBQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGlCQUFkLEVBRlU7SUFBQSxDQS9CWjtHQUpGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus-ex-mode/lib/main.coffee
