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
      return it("shows the current vim mode in the status bar", function() {
        var statusBarTile;
        statusBarTile = null;
        waitsFor(function() {
          return statusBarTile = workspaceElement.querySelector("#status-bar-vim-mode-plus");
        });
        return runs(function() {
          expect(statusBarTile.textContent).toBe("N");
          ensure('i', {
            mode: 'insert'
          });
          return expect(statusBarTile.textContent).toBe("I");
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
