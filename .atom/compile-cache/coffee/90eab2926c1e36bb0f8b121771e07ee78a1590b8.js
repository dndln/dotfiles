(function() {
  var helpers;

  helpers = require('./spec-helper');

  describe("the input element", function() {
    var editor, editorElement, exState, getCommandEditor, getVisibility, vimState, _ref;
    _ref = [], editor = _ref[0], editorElement = _ref[1], vimState = _ref[2], exState = _ref[3];
    beforeEach(function() {
      var exMode, vimMode;
      vimMode = atom.packages.loadPackage('vim-mode');
      exMode = atom.packages.loadPackage('ex-mode');
      waitsForPromise(function() {
        var activationPromise;
        activationPromise = exMode.activate();
        helpers.activateExMode();
        return activationPromise;
      });
      runs(function() {
        return spyOn(exMode.mainModule.globalExState, 'setVim').andCallThrough();
      });
      waitsForPromise(function() {
        return vimMode.activate();
      });
      waitsFor(function() {
        return exMode.mainModule.globalExState.setVim.calls.length > 0;
      });
      return runs(function() {
        return helpers.getEditorElement(function(element) {
          atom.commands.dispatch(element, "ex-mode:open");
          editorElement = element;
          editor = editorElement.getModel();
          atom.commands.dispatch(getCommandEditor(), "core:cancel");
          vimState = vimMode.mainModule.getEditorState(editor);
          exState = exMode.mainModule.exStates.get(editor);
          vimState.activateNormalMode();
          vimState.resetNormalMode();
          return editor.setText("abc\ndef\nabc\ndef");
        });
      });
    });
    afterEach(function() {
      return atom.commands.dispatch(getCommandEditor(), "core:cancel");
    });
    getVisibility = function() {
      return editor.normalModeInputView.panel.visible;
    };
    getCommandEditor = function() {
      return editor.normalModeInputView.editorElement;
    };
    it("opens with 'ex-mode:open'", function() {
      atom.commands.dispatch(editorElement, "ex-mode:open");
      return expect(getVisibility()).toBe(true);
    });
    it("closes with 'core:cancel'", function() {
      atom.commands.dispatch(editorElement, "ex-mode:open");
      expect(getVisibility()).toBe(true);
      atom.commands.dispatch(getCommandEditor(), "core:cancel");
      return expect(getVisibility()).toBe(false);
    });
    it("closes when opening and then pressing backspace", function() {
      atom.commands.dispatch(editorElement, "ex-mode:open");
      expect(getVisibility()).toBe(true);
      atom.commands.dispatch(getCommandEditor(), "core:backspace");
      return expect(getVisibility()).toBe(false);
    });
    it("doesn't close when there is text and pressing backspace", function() {
      var commandEditor, model;
      atom.commands.dispatch(editorElement, "ex-mode:open");
      expect(getVisibility()).toBe(true);
      commandEditor = getCommandEditor();
      model = commandEditor.getModel();
      model.setText('abc');
      atom.commands.dispatch(commandEditor, "core:backspace");
      expect(getVisibility()).toBe(true);
      return expect(model.getText()).toBe('ab');
    });
    it("closes when there is text and pressing backspace multiple times", function() {
      var commandEditor, model;
      atom.commands.dispatch(editorElement, "ex-mode:open");
      expect(getVisibility()).toBe(true);
      commandEditor = getCommandEditor();
      model = commandEditor.getModel();
      expect(model.getText()).toBe('');
      model.setText('abc');
      atom.commands.dispatch(commandEditor, "core:backspace");
      expect(getVisibility()).toBe(true);
      expect(model.getText()).toBe('ab');
      atom.commands.dispatch(commandEditor, "core:backspace");
      expect(getVisibility()).toBe(true);
      expect(model.getText()).toBe('a');
      atom.commands.dispatch(commandEditor, "core:backspace");
      expect(getVisibility()).toBe(true);
      expect(model.getText()).toBe('');
      atom.commands.dispatch(commandEditor, "core:backspace");
      return expect(getVisibility()).toBe(false);
    });
    return it("contains '<,'> when opened while there are selections", function() {
      editor.setCursorBufferPosition([0, 0]);
      editor.selectToBufferPosition([0, 1]);
      editor.addCursorAtBufferPosition([2, 0]);
      editor.selectToBufferPosition([2, 1]);
      atom.commands.dispatch(editorElement, "ex-mode:open");
      return expect(getCommandEditor().getModel().getText()).toBe("'<,'>");
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy9leC1tb2RlL3NwZWMvZXgtaW5wdXQtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsT0FBQTs7QUFBQSxFQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsZUFBUixDQUFWLENBQUE7O0FBQUEsRUFDQSxRQUFBLENBQVMsbUJBQVQsRUFBOEIsU0FBQSxHQUFBO0FBQzVCLFFBQUEsK0VBQUE7QUFBQSxJQUFBLE9BQTZDLEVBQTdDLEVBQUMsZ0JBQUQsRUFBUyx1QkFBVCxFQUF3QixrQkFBeEIsRUFBa0MsaUJBQWxDLENBQUE7QUFBQSxJQUNBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxVQUFBLGVBQUE7QUFBQSxNQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQWQsQ0FBMEIsVUFBMUIsQ0FBVixDQUFBO0FBQUEsTUFDQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFkLENBQTBCLFNBQTFCLENBRFQsQ0FBQTtBQUFBLE1BRUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7QUFDZCxZQUFBLGlCQUFBO0FBQUEsUUFBQSxpQkFBQSxHQUFvQixNQUFNLENBQUMsUUFBUCxDQUFBLENBQXBCLENBQUE7QUFBQSxRQUNBLE9BQU8sQ0FBQyxjQUFSLENBQUEsQ0FEQSxDQUFBO2VBRUEsa0JBSGM7TUFBQSxDQUFoQixDQUZBLENBQUE7QUFBQSxNQU9BLElBQUEsQ0FBSyxTQUFBLEdBQUE7ZUFDSCxLQUFBLENBQU0sTUFBTSxDQUFDLFVBQVUsQ0FBQyxhQUF4QixFQUF1QyxRQUF2QyxDQUFnRCxDQUFDLGNBQWpELENBQUEsRUFERztNQUFBLENBQUwsQ0FQQSxDQUFBO0FBQUEsTUFVQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUNkLE9BQU8sQ0FBQyxRQUFS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

//# sourceURL=/home/andy/.atom/packages/ex-mode/spec/ex-input-spec.coffee