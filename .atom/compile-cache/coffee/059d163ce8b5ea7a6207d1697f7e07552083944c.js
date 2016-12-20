(function() {
  var getVimState;

  getVimState = require('./spec-helper').getVimState;

  describe("Insert mode commands", function() {
    var editor, editorElement, ensure, keystroke, set, vimState, _ref;
    _ref = [], set = _ref[0], ensure = _ref[1], keystroke = _ref[2], editor = _ref[3], editorElement = _ref[4], vimState = _ref[5];
    beforeEach(function() {
      return getVimState(function(_vimState, vim) {
        vimState = _vimState;
        editor = _vimState.editor, editorElement = _vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
      });
    });
    afterEach(function() {
      return vimState.resetNormalMode();
    });
    return describe("Copy from line above/below", function() {
      beforeEach(function() {
        set({
          text: "12345\n\nabcd\nefghi",
          cursorBuffer: [[1, 0], [3, 0]]
        });
        return keystroke('i');
      });
      describe("the ctrl-y command", function() {
        it("copies from the line above", function() {
          ensure('ctrl-y', {
            text: "12345\n1\nabcd\naefghi"
          });
          editor.insertText(' ');
          return ensure('ctrl-y', {
            text: "12345\n1 3\nabcd\na cefghi"
          });
        });
        it("does nothing if there's nothing above the cursor", function() {
          editor.insertText('fill');
          ensure('ctrl-y', {
            text: "12345\nfill5\nabcd\nfillefghi"
          });
          return ensure('ctrl-y', {
            text: "12345\nfill5\nabcd\nfillefghi"
          });
        });
        return it("does nothing on the first line", function() {
          set({
            cursorBuffer: [[0, 2], [3, 2]]
          });
          editor.insertText('a');
          ensure({
            text: "12a345\n\nabcd\nefaghi"
          });
          return ensure('ctrl-y', {
            text: "12a345\n\nabcd\nefadghi"
          });
        });
      });
      describe("the ctrl-e command", function() {
        beforeEach(function() {
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus.insert-mode': {
              'ctrl-e': 'vim-mode-plus:copy-from-line-below'
            }
          });
        });
        it("copies from the line below", function() {
          ensure('ctrl-e', {
            text: "12345\na\nabcd\nefghi"
          });
          editor.insertText(' ');
          return ensure('ctrl-e', {
            text: "12345\na c\nabcd\n efghi"
          });
        });
        return it("does nothing if there's nothing below the cursor", function() {
          editor.insertText('foo');
          ensure('ctrl-e', {
            text: "12345\nfood\nabcd\nfooefghi"
          });
          return ensure('ctrl-e', {
            text: "12345\nfood\nabcd\nfooefghi"
          });
        });
      });
      return describe("InsertLastInserted", function() {
        var ensureInsertLastInserted;
        ensureInsertLastInserted = function(key, options) {
          var finalText, insert, text;
          insert = options.insert, text = options.text, finalText = options.finalText;
          keystroke(key);
          editor.insertText(insert);
          ensure("escape", {
            text: text
          });
          return ensure("G I ctrl-a", {
            text: finalText
          });
        };
        beforeEach(function() {
          var initialText;
          atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus.insert-mode': {
              'ctrl-a': 'vim-mode-plus:insert-last-inserted'
            }
          });
          initialText = "abc\ndef\n";
          set({
            text: "",
            cursor: [0, 0]
          });
          keystroke('i');
          editor.insertText(initialText);
          return ensure("escape g g", {
            text: initialText,
            cursor: [0, 0]
          });
        });
        it("case-i: single-line", function() {
          return ensureInsertLastInserted('i', {
            insert: 'xxx',
            text: "xxxabc\ndef\n",
            finalText: "xxxabc\nxxxdef\n"
          });
        });
        it("case-o: single-line", function() {
          return ensureInsertLastInserted('o', {
            insert: 'xxx',
            text: "abc\nxxx\ndef\n",
            finalText: "abc\nxxx\nxxxdef\n"
          });
        });
        it("case-O: single-line", function() {
          return ensureInsertLastInserted('O', {
            insert: 'xxx',
            text: "xxx\nabc\ndef\n",
            finalText: "xxx\nabc\nxxxdef\n"
          });
        });
        it("case-i: multi-line", function() {
          return ensureInsertLastInserted('i', {
            insert: 'xxx\nyyy\n',
            text: "xxx\nyyy\nabc\ndef\n",
            finalText: "xxx\nyyy\nabc\nxxx\nyyy\ndef\n"
          });
        });
        it("case-o: multi-line", function() {
          return ensureInsertLastInserted('o', {
            insert: 'xxx\nyyy\n',
            text: "abc\nxxx\nyyy\n\ndef\n",
            finalText: "abc\nxxx\nyyy\n\nxxx\nyyy\ndef\n"
          });
        });
        return it("case-O: multi-line", function() {
          return ensureInsertLastInserted('O', {
            insert: 'xxx\nyyy\n',
            text: "xxx\nyyy\n\nabc\ndef\n",
            finalText: "xxx\nyyy\n\nabc\nxxx\nyyy\ndef\n"
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvaW5zZXJ0LW1vZGUtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsV0FBQTs7QUFBQSxFQUFDLGNBQWUsT0FBQSxDQUFRLGVBQVIsRUFBZixXQUFELENBQUE7O0FBQUEsRUFFQSxRQUFBLENBQVMsc0JBQVQsRUFBaUMsU0FBQSxHQUFBO0FBQy9CLFFBQUEsNkRBQUE7QUFBQSxJQUFBLE9BQTRELEVBQTVELEVBQUMsYUFBRCxFQUFNLGdCQUFOLEVBQWMsbUJBQWQsRUFBeUIsZ0JBQXpCLEVBQWlDLHVCQUFqQyxFQUFnRCxrQkFBaEQsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLFNBQUQsRUFBWSxHQUFaLEdBQUE7QUFDVixRQUFBLFFBQUEsR0FBVyxTQUFYLENBQUE7QUFBQSxRQUNDLG1CQUFBLE1BQUQsRUFBUywwQkFBQSxhQURULENBQUE7ZUFFQyxVQUFBLEdBQUQsRUFBTSxhQUFBLE1BQU4sRUFBYyxnQkFBQSxTQUFkLEVBQTJCLElBSGpCO01BQUEsQ0FBWixFQURTO0lBQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxJQVFBLFNBQUEsQ0FBVSxTQUFBLEdBQUE7YUFDUixRQUFRLENBQUMsZUFBVCxDQUFBLEVBRFE7SUFBQSxDQUFWLENBUkEsQ0FBQTtXQVdBLFFBQUEsQ0FBUyw0QkFBVCxFQUF1QyxTQUFBLEdBQUE7QUFDckMsTUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsUUFBQSxHQUFBLENBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSxzQkFBTjtBQUFBLFVBTUEsWUFBQSxFQUFjLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFELEVBQVMsQ0FBQyxDQUFELEVBQUks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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/spec/insert-mode-spec.coffee
