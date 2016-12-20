(function() {
  var getView, getVimState, packageName, _ref;

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, getView = _ref.getView;

  packageName = 'vim-mode-plus';

  describe("vim-mode-plus", function() {
    var editor, editorElement, ensure, keystroke, set, vimState, workspaceElement, _ref1;
    _ref1 = [], set = _ref1[0], ensure = _ref1[1], keystroke = _ref1[2], editor = _ref1[3], editorElement = _ref1[4], vimState = _ref1[5], workspaceElement = _ref1[6];
    beforeEach(function() {
      getVimState(function(_vimState, vim) {
        vimState = _vimState;
        editor = _vimState.editor, editorElement = _vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
      });
      workspaceElement = getView(atom.workspace);
      return waitsForPromise(function() {
        return atom.packages.activatePackage('status-bar');
      });
    });
    afterEach(function() {
      if (!vimState.destroyed) {
        return vimState.resetNormalMode();
      }
    });
    describe(".activate", function() {
      it("puts the editor in normal-mode initially by default", function() {
        return ensure({
          mode: 'normal'
        });
      });
      it("shows the current vim mode in the status bar", function() {
        var statusBarTile;
        statusBarTile = null;
        waitsFor(function() {
          return statusBarTile = workspaceElement.querySelector("#status-bar-vim-mode-plus");
        });
        return runs(function() {
          expect(statusBarTile.textContent).toBe("Normal");
          ensure('i', {
            mode: 'insert'
          });
          return expect(statusBarTile.textContent).toBe("Insert");
        });
      });
      return it("doesn't register duplicate command listeners for editors", function() {
        var newPane, pane;
        set({
          text: '12345',
          cursorBuffer: [0, 0]
        });
        pane = atom.workspace.getActivePane();
        newPane = pane.splitRight();
        pane.removeItem(editor);
        newPane.addItem(editor);
        return ensure('l', {
          cursorBuffer: [0, 1]
        });
      });
    });
    return describe(".deactivate", function() {
      it("removes the vim classes from the editor", function() {
        atom.packages.deactivatePackage(packageName);
        expect(editorElement.classList.contains("vim-mode-plus")).toBe(false);
        return expect(editorElement.classList.contains("normal-mode")).toBe(false);
      });
      return it("removes the vim commands from the editor element", function() {
        var vimCommands;
        vimCommands = function() {
          return atom.commands.findCommands({
            target: editorElement
          }).filter(function(cmd) {
            return cmd.name.startsWith("vim-mode-plus:");
          });
        };
        expect(vimCommands().length).toBeGreaterThan(0);
        atom.packages.deactivatePackage(packageName);
        return expect(vimCommands().length).toBe(0);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvdmltLW1vZGUtcGx1cy1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx1Q0FBQTs7QUFBQSxFQUFBLE9BQXlCLE9BQUEsQ0FBUSxlQUFSLENBQXpCLEVBQUMsbUJBQUEsV0FBRCxFQUFjLGVBQUEsT0FBZCxDQUFBOztBQUFBLEVBRUEsV0FBQSxHQUFjLGVBRmQsQ0FBQTs7QUFBQSxFQUdBLFFBQUEsQ0FBUyxlQUFULEVBQTBCLFNBQUEsR0FBQTtBQUN4QixRQUFBLGdGQUFBO0FBQUEsSUFBQSxRQUE4RSxFQUE5RSxFQUFDLGNBQUQsRUFBTSxpQkFBTixFQUFjLG9CQUFkLEVBQXlCLGlCQUF6QixFQUFpQyx3QkFBakMsRUFBZ0QsbUJBQWhELEVBQTBELDJCQUExRCxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxXQUFBLENBQVksU0FBQyxTQUFELEVBQVksR0FBWixHQUFBO0FBQ1YsUUFBQSxRQUFBLEdBQVcsU0FBWCxDQUFBO0FBQUEsUUFDQyxtQkFBQSxNQUFELEVBQVMsMEJBQUEsYUFEVCxDQUFBO2VBRUMsVUFBQSxHQUFELEVBQU0sYUFBQSxNQUFOLEVBQWMsZ0JBQUEsU0FBZCxFQUEyQixJQUhqQjtNQUFBLENBQVosQ0FBQSxDQUFBO0FBQUEsTUFLQSxnQkFBQSxHQUFtQixPQUFBLENBQVEsSUFBSSxDQUFDLFNBQWIsQ0FMbkIsQ0FBQTthQU9BLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLFlBQTlCLEVBRGM7TUFBQSxDQUFoQixFQVJTO0lBQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxJQWFBLFNBQUEsQ0FBVSxTQUFBLEdBQUE7QUFD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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/spec/vim-mode-plus-spec.coffee
