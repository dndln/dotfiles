(function() {
  var TextData, dispatch, getVimState, settings, _ref;

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, dispatch = _ref.dispatch, TextData = _ref.TextData;

  settings = require('../lib/settings');

  describe("Motion Find", function() {
    var editor, editorElement, ensure, keystroke, set, vimState, _ref1;
    _ref1 = [], set = _ref1[0], ensure = _ref1[1], keystroke = _ref1[2], editor = _ref1[3], editorElement = _ref1[4], vimState = _ref1[5];
    beforeEach(function() {
      settings.set('useExperimentalFasterInput', true);
      return getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, keystroke = _vim.keystroke, _vim;
      });
    });
    afterEach(function() {
      if (!vimState.destroyed) {
        return vimState.resetNormalMode();
      }
    });
    describe('the f/F keybindings', function() {
      beforeEach(function() {
        return set({
          text: "abcabcabcabc\n",
          cursor: [0, 0]
        });
      });
      it('moves to the first specified character it finds', function() {
        return ensure([
          'f', {
            input: 'c'
          }
        ], {
          cursor: [0, 2]
        });
      });
      it('extends visual selection in visual-mode and repetable', function() {
        ensure('v', {
          mode: ['visual', 'characterwise']
        });
        ensure([
          'f', {
            input: 'c'
          }
        ], {
          selectedText: 'abc',
          cursor: [0, 3]
        });
        ensure(';', {
          selectedText: 'abcabc',
          cursor: [0, 6]
        });
        return ensure(',', {
          selectedText: 'abc',
          cursor: [0, 3]
        });
      });
      it('moves backwards to the first specified character it finds', function() {
        set({
          cursor: [0, 2]
        });
        return ensure([
          'F', {
            input: 'a'
          }
        ], {
          cursor: [0, 0]
        });
      });
      it('respects count forward', function() {
        return ensure([
          '2 f', {
            input: 'a'
          }
        ], {
          cursor: [0, 6]
        });
      });
      it('respects count backward', function() {
        ({
          cursor: [0, 6]
        });
        return ensure([
          '2 F', {
            input: 'a'
          }
        ], {
          cursor: [0, 0]
        });
      });
      it("doesn't move if the character specified isn't found", function() {
        return ensure([
          'f', {
            input: 'd'
          }
        ], {
          cursor: [0, 0]
        });
      });
      it("doesn't move if there aren't the specified count of the specified character", function() {
        ensure([
          '1 0 f', {
            input: 'a'
          }
        ], {
          cursor: [0, 0]
        });
        ensure([
          '1 1 f', {
            input: 'a'
          }
        ], {
          cursor: [0, 0]
        });
        set({
          cursor: [0, 6]
        });
        ensure([
          '1 0 F', {
            input: 'a'
          }
        ], {
          cursor: [0, 6]
        });
        return ensure([
          '1 1 F', {
            input: 'a'
          }
        ], {
          cursor: [0, 6]
        });
      });
      it("composes with d", function() {
        set({
          cursor: [0, 3]
        });
        return ensure([
          'd 2 f', {
            input: 'a'
          }
        ], {
          text: 'abcbc\n'
        });
      });
      return it("F behaves exclusively when composes with operator", function() {
        set({
          cursor: [0, 3]
        });
        return ensure([
          'd F', {
            input: 'a'
          }
        ], {
          text: 'abcabcabc\n'
        });
      });
    });
    describe('the t/T keybindings', function() {
      beforeEach(function() {
        return set({
          text: "abcabcabcabc\n",
          cursor: [0, 0]
        });
      });
      it('moves to the character previous to the first specified character it finds', function() {
        ensure([
          't', {
            input: 'a'
          }
        ], {
          cursor: [0, 2]
        });
        return ensure([
          't', {
            input: 'a'
          }
        ], {
          cursor: [0, 2]
        });
      });
      it('moves backwards to the character after the first specified character it finds', function() {
        set({
          cursor: [0, 2]
        });
        return ensure([
          'T', {
            input: 'a'
          }
        ], {
          cursor: [0, 1]
        });
      });
      it('respects count forward', function() {
        return ensure([
          '2 t', {
            input: 'a'
          }
        ], {
          cursor: [0, 5]
        });
      });
      it('respects count backward', function() {
        set({
          cursor: [0, 6]
        });
        return ensure([
          '2 T', {
            input: 'a'
          }
        ], {
          cursor: [0, 1]
        });
      });
      it("doesn't move if the character specified isn't found", function() {
        return ensure([
          't', {
            input: 'd'
          }
        ], {
          cursor: [0, 0]
        });
      });
      it("doesn't move if there aren't the specified count of the specified character", function() {
        ensure([
          '1 0 t', {
            input: 'd'
          }
        ], {
          cursor: [0, 0]
        });
        ensure([
          '1 1 t', {
            input: 'a'
          }
        ], {
          cursor: [0, 0]
        });
        set({
          cursor: [0, 6]
        });
        ensure([
          '1 0 T', {
            input: 'a'
          }
        ], {
          cursor: [0, 6]
        });
        return ensure([
          '1 1 T', {
            input: 'a'
          }
        ], {
          cursor: [0, 6]
        });
      });
      it("composes with d", function() {
        set({
          cursor: [0, 3]
        });
        return ensure([
          'd 2 t', {
            input: 'b'
          }
        ], {
          text: 'abcbcabc\n'
        });
      });
      it("selects character under cursor even when no movement happens", function() {
        set({
          cursor: [0, 0]
        });
        return ensure([
          'd t', {
            input: 'b'
          }
        ], {
          text: 'bcabcabcabc\n'
        });
      });
      it("T behaves exclusively when composes with operator", function() {
        set({
          cursor: [0, 3]
        });
        return ensure([
          'd T', {
            input: 'b'
          }
        ], {
          text: 'ababcabcabc\n'
        });
      });
      return it("T don't delete character under cursor even when no movement happens", function() {
        set({
          cursor: [0, 3]
        });
        return ensure([
          'd T', {
            input: 'c'
          }
        ], {
          text: 'abcabcabcabc\n'
        });
      });
    });
    describe('the ; and , keybindings', function() {
      beforeEach(function() {
        return set({
          text: "abcabcabcabc\n",
          cursor: [0, 0]
        });
      });
      it("repeat f in same direction", function() {
        ensure([
          'f', {
            input: 'c'
          }
        ], {
          cursor: [0, 2]
        });
        ensure(';', {
          cursor: [0, 5]
        });
        return ensure(';', {
          cursor: [0, 8]
        });
      });
      it("repeat F in same direction", function() {
        set({
          cursor: [0, 10]
        });
        ensure([
          'F', {
            input: 'c'
          }
        ], {
          cursor: [0, 8]
        });
        ensure(';', {
          cursor: [0, 5]
        });
        return ensure(';', {
          cursor: [0, 2]
        });
      });
      it("repeat f in opposite direction", function() {
        set({
          cursor: [0, 6]
        });
        ensure([
          'f', {
            input: 'c'
          }
        ], {
          cursor: [0, 8]
        });
        ensure(',', {
          cursor: [0, 5]
        });
        return ensure(',', {
          cursor: [0, 2]
        });
      });
      it("repeat F in opposite direction", function() {
        set({
          cursor: [0, 4]
        });
        ensure([
          'F', {
            input: 'c'
          }
        ], {
          cursor: [0, 2]
        });
        ensure(',', {
          cursor: [0, 5]
        });
        return ensure(',', {
          cursor: [0, 8]
        });
      });
      it("alternate repeat f in same direction and reverse", function() {
        ensure([
          'f', {
            input: 'c'
          }
        ], {
          cursor: [0, 2]
        });
        ensure(';', {
          cursor: [0, 5]
        });
        return ensure(',', {
          cursor: [0, 2]
        });
      });
      it("alternate repeat F in same direction and reverse", function() {
        set({
          cursor: [0, 10]
        });
        ensure([
          'F', {
            input: 'c'
          }
        ], {
          cursor: [0, 8]
        });
        ensure(';', {
          cursor: [0, 5]
        });
        return ensure(',', {
          cursor: [0, 8]
        });
      });
      it("repeat t in same direction", function() {
        ensure([
          't', {
            input: 'c'
          }
        ], {
          cursor: [0, 1]
        });
        return ensure(';', {
          cursor: [0, 4]
        });
      });
      it("repeat T in same direction", function() {
        set({
          cursor: [0, 10]
        });
        ensure([
          'T', {
            input: 'c'
          }
        ], {
          cursor: [0, 9]
        });
        return ensure(';', {
          cursor: [0, 6]
        });
      });
      it("repeat t in opposite direction first, and then reverse", function() {
        set({
          cursor: [0, 3]
        });
        ensure([
          't', {
            input: 'c'
          }
        ], {
          cursor: [0, 4]
        });
        ensure(',', {
          cursor: [0, 3]
        });
        return ensure(';', {
          cursor: [0, 4]
        });
      });
      it("repeat T in opposite direction first, and then reverse", function() {
        set({
          cursor: [0, 4]
        });
        ensure([
          'T', {
            input: 'c'
          }
        ], {
          cursor: [0, 3]
        });
        ensure(',', {
          cursor: [0, 4]
        });
        return ensure(';', {
          cursor: [0, 3]
        });
      });
      it("repeat with count in same direction", function() {
        set({
          cursor: [0, 0]
        });
        ensure([
          'f', {
            input: 'c'
          }
        ], {
          cursor: [0, 2]
        });
        return ensure('2 ;', {
          cursor: [0, 8]
        });
      });
      return it("repeat with count in reverse direction", function() {
        set({
          cursor: [0, 6]
        });
        ensure([
          'f', {
            input: 'c'
          }
        ], {
          cursor: [0, 8]
        });
        return ensure('2 ,', {
          cursor: [0, 2]
        });
      });
    });
    return describe("last find/till is repeatable on other editor", function() {
      var other, otherEditor, pane, _ref2;
      _ref2 = [], other = _ref2[0], otherEditor = _ref2[1], pane = _ref2[2];
      beforeEach(function() {
        return getVimState(function(otherVimState, _other) {
          set({
            text: "a baz bar\n",
            cursor: [0, 0]
          });
          other = _other;
          other.set({
            text: "foo bar baz",
            cursor: [0, 0]
          });
          otherEditor = otherVimState.editor;
          pane = atom.workspace.getActivePane();
          return pane.activateItem(editor);
        });
      });
      it("shares the most recent find/till command with other editors", function() {
        ensure([
          'f', {
            input: 'b'
          }
        ], {
          cursor: [0, 2]
        });
        other.ensure({
          cursor: [0, 0]
        });
        pane.activateItem(otherEditor);
        other.keystroke(';');
        ensure({
          cursor: [0, 2]
        });
        other.ensure({
          cursor: [0, 4]
        });
        other.keystroke([
          't', {
            input: 'r'
          }
        ]);
        ensure({
          cursor: [0, 2]
        });
        other.ensure({
          cursor: [0, 5]
        });
        pane.activateItem(editor);
        ensure(';', {
          cursor: [0, 7]
        });
        return other.ensure({
          cursor: [0, 5]
        });
      });
      return it("is still repeatable after original editor was destroyed", function() {
        ensure([
          'f', {
            input: 'b'
          }
        ], {
          cursor: [0, 2]
        });
        other.ensure({
          cursor: [0, 0]
        });
        pane.activateItem(otherEditor);
        editor.destroy();
        expect(editor.isAlive()).toBe(false);
        other.ensure(';', {
          cursor: [0, 4]
        });
        other.ensure(';', {
          cursor: [0, 8]
        });
        return other.ensure(',', {
          cursor: [0, 4]
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvbW90aW9uLWZpbmQtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsK0NBQUE7O0FBQUEsRUFBQSxPQUFvQyxPQUFBLENBQVEsZUFBUixDQUFwQyxFQUFDLG1CQUFBLFdBQUQsRUFBYyxnQkFBQSxRQUFkLEVBQXdCLGdCQUFBLFFBQXhCLENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSLENBRFgsQ0FBQTs7QUFBQSxFQUdBLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUEsR0FBQTtBQUN0QixRQUFBLDhEQUFBO0FBQUEsSUFBQSxRQUE0RCxFQUE1RCxFQUFDLGNBQUQsRUFBTSxpQkFBTixFQUFjLG9CQUFkLEVBQXlCLGlCQUF6QixFQUFpQyx3QkFBakMsRUFBZ0QsbUJBQWhELENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLFFBQVEsQ0FBQyxHQUFULENBQWEsNEJBQWIsRUFBMkMsSUFBM0MsQ0FBQSxDQUFBO2FBQ0EsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLElBQVIsR0FBQTtBQUNWLFFBQUEsUUFBQSxHQUFXLEtBQVgsQ0FBQTtBQUFBLFFBQ0Msa0JBQUEsTUFBRCxFQUFTLHlCQUFBLGFBRFQsQ0FBQTtlQUVDLFdBQUEsR0FBRCxFQUFNLGNBQUEsTUFBTixFQUFjLGlCQUFBLFNBQWQsRUFBMkIsS0FIakI7TUFBQSxDQUFaLEVBRlM7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBU0EsU0FBQSxDQUFVLFNBQUEsR0FBQTtBQUNSLE1BQUEsSUFBQSxDQUFBLFFBQWUsQ0FBQyxTQUFoQjtlQUNFLFFBQVEsQ0FBQyxlQUFULENBQUEsRUFERjtPQURRO0lBQUEsQ0FBVixD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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/spec/motion-find-spec.coffee
