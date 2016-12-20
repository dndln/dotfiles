(function() {
  var TextData, dispatch, getView, getVimState, rawKeystroke, settings, withMockPlatform, _ref;

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, dispatch = _ref.dispatch, TextData = _ref.TextData, getView = _ref.getView, withMockPlatform = _ref.withMockPlatform, rawKeystroke = _ref.rawKeystroke;

  settings = require('../lib/settings');

  describe("Operator modifier", function() {
    var editor, editorElement, ensure, keystroke, set, vimState, _ref1;
    _ref1 = [], set = _ref1[0], ensure = _ref1[1], keystroke = _ref1[2], editor = _ref1[3], editorElement = _ref1[4], vimState = _ref1[5];
    beforeEach(function() {
      getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
      });
      return runs(function() {
        return jasmine.attachToDOM(editorElement);
      });
    });
    afterEach(function() {
      return vimState.resetNormalMode();
    });
    return describe("operator-modifier to force wise", function() {
      beforeEach(function() {
        return set({
          text: "012345 789\nABCDEF EFG"
        });
      });
      describe("operator-modifier-characterwise", function() {
        describe("when target is linewise", function() {
          return it("operate characterwisely and exclusively", function() {
            set({
              cursor: [0, 1]
            });
            return ensure("d v j", {
              text: "0BCDEF EFG"
            });
          });
        });
        return describe("when target is characterwise", function() {
          it("operate inclusively for exclusive target", function() {
            set({
              cursor: [0, 9]
            });
            return ensure("d v b", {
              cursor: [0, 6],
              text_: "012345_\nABCDEF EFG"
            });
          });
          return it("operate exclusively for inclusive target", function() {
            set({
              cursor: [0, 0]
            });
            return ensure("d v e", {
              cursor: [0, 0],
              text: "5 789\nABCDEF EFG"
            });
          });
        });
      });
      return describe("operator-modifier-linewise", function() {
        return it("operate linewisely for characterwise target", function() {
          set({
            cursor: [0, 1]
          });
          return ensure([
            'd V /', {
              search: 'DEF'
            }
          ], {
            cursor: [0, 0],
            text: ""
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvb3BlcmF0b3ItbW9kaWZpZXItc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0ZBQUE7O0FBQUEsRUFBQSxPQUE2RSxPQUFBLENBQVEsZUFBUixDQUE3RSxFQUFDLG1CQUFBLFdBQUQsRUFBYyxnQkFBQSxRQUFkLEVBQXdCLGdCQUFBLFFBQXhCLEVBQWtDLGVBQUEsT0FBbEMsRUFBMkMsd0JBQUEsZ0JBQTNDLEVBQTZELG9CQUFBLFlBQTdELENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSLENBRFgsQ0FBQTs7QUFBQSxFQUdBLFFBQUEsQ0FBUyxtQkFBVCxFQUE4QixTQUFBLEdBQUE7QUFDNUIsUUFBQSw4REFBQTtBQUFBLElBQUEsUUFBNEQsRUFBNUQsRUFBQyxjQUFELEVBQU0saUJBQU4sRUFBYyxvQkFBZCxFQUF5QixpQkFBekIsRUFBaUMsd0JBQWpDLEVBQWdELG1CQUFoRCxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsR0FBUixHQUFBO0FBQ1YsUUFBQSxRQUFBLEdBQVcsS0FBWCxDQUFBO0FBQUEsUUFDQyxrQkFBQSxNQUFELEVBQVMseUJBQUEsYUFEVCxDQUFBO2VBRUMsVUFBQSxHQUFELEVBQU0sYUFBQSxNQUFOLEVBQWMsZ0JBQUEsU0FBZCxFQUEyQixJQUhqQjtNQUFBLENBQVosQ0FBQSxDQUFBO2FBS0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtlQUNILE9BQU8sQ0FBQyxXQUFSLENBQW9CLGFBQXBCLEVBREc7TUFBQSxDQUFMLEVBTlM7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBV0EsU0FBQSxDQUFVLFNBQUEsR0FBQTthQUNSLFFBQVEsQ0FBQyxlQUFULENBQUEsRUFEUTtJQUFBLENBQVYsQ0FYQSxDQUFBO1dBY0EsUUFBQSxDQUFTLGlDQUFULEVBQTRDLFNBQUEsR0FBQTtBQUMxQyxNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7ZUFDVCxHQUFBLENBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSx3QkFBTjtTQURGLEVBRFM7TUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLE1BTUEsUUFBQSxDQUFTLGlDQUFULEVBQTRDLFNBQUEsR0FBQTtBQUMxQyxRQUFBLFFBQUEsQ0FBUyx5QkFBVCxFQUFvQyxTQUFBLEdBQUE7aUJBQ2xDLEVBQUEsQ0FBRyx5Q0FBSCxFQUE4QyxTQUFBLEdBQUE7QUFDNUMsWUFBQSxHQUFBLENBQUk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7YUFBSixDQUFBLENBQUE7bUJBQ0EsTUFBQSxDQUFPLE9BQVAsRUFDRTtBQUFBLGNBQUEsSUFBQSxFQUFNLFlBQU47YUFERixFQUY0QztVQUFBLENBQTlDLEVBRGtDO1FBQUEsQ0FBcEMsQ0FBQSxDQUFBO2VBT0EsUUFBQSxDQUFTLDhCQUFULEVBQXlDLFNBQUEsR0FBQTtBQUN2QyxVQUFBLEVBQUEsQ0FBRywwQ0FBSCxFQUErQyxTQUFBLEdBQUE7QUFDN0MsWUFBQSxHQUFBLENBQUk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7YUFBSixDQUFBLENBQUE7bUJBQ0EsTUFBQSxDQUFPLE9BQVAsRUFDRTtBQUFBLGNBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtBQUFBLGNBQ0EsS0FBQSxFQUFPLHFCQURQO2FBREYsRUFGNkM7VUFBQSxDQUEvQyxDQUFBLENBQUE7aUJBUUEsRUFBQSxDQUFHLDBDQUFILEVBQStDLFNBQUEsR0FBQTtBQUM3QyxZQUFBLEdBQUEsQ0FBSTtBQUFBLGNBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKLENBQUEsQ0FBQTttQkFDQSxNQUFBLENBQU8sT0FBUCxFQUNFO0FBQUEsY0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO0FBQUEsY0FDQSxJQUFBLEVBQU0sbUJBRE47YUFERixFQUY2QztVQUFBLENBQS9DLEVBVHVDO1FBQUEsQ0FBekMsRUFSMEM7TUFBQSxDQUE1QyxDQU5BLENBQUE7YUErQkEsUUFBQSxDQUFTLDRCQUFULEVBQXVDLFNBQUEsR0FBQTtlQUNyQyxFQUFBLENBQUcsNkNBQUgsRUFBa0QsU0FBQSxHQUFBO0FBQ2hELFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQUosQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTztZQUFDLE9BQUQsRUFBVTtBQUFBLGNBQUEsTUFBQSxFQUFRLEtBQVI7YUFBVjtXQUFQLEVBQ0U7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7QUFBQSxZQUNBLElBQUEsRUFBTSxFQUROO1dBREYsRUFGZ0Q7UUFBQSxDQUFsRCxFQURxQztNQUFBLENBQXZDLEVBaEMwQztJQUFBLENBQTVDLEVBZjRCO0VBQUEsQ0FBOUIsQ0FIQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/spec/operator-modifier-spec.coffee
