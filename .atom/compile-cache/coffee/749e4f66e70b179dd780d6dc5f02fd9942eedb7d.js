(function() {
  var dispatch, getVimState, settings, _ref;

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, dispatch = _ref.dispatch;

  settings = require('../lib/settings');

  describe("Operator Increase", function() {
    var editor, editorElement, ensure, keystroke, set, vimState, _ref1;
    _ref1 = [], set = _ref1[0], ensure = _ref1[1], keystroke = _ref1[2], editor = _ref1[3], editorElement = _ref1[4], vimState = _ref1[5];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
      });
    });
    afterEach(function() {
      return vimState.resetNormalMode();
    });
    describe("the ctrl-a/ctrl-x keybindings", function() {
      beforeEach(function() {
        return set({
          text: "123\nab45\ncd-67ef\nab-5\na-bcdef",
          cursorBuffer: [[0, 0], [1, 0], [2, 0], [3, 3], [4, 0]]
        });
      });
      describe("increasing numbers", function() {
        describe("normal-mode", function() {
          it("increases the next number", function() {
            return ensure('ctrl-a', {
              text: '124\nab46\ncd-66ef\nab-4\na-bcdef',
              cursorBuffer: [[0, 2], [1, 3], [2, 4], [3, 3], [4, 0]]
            });
          });
          it("repeats with .", function() {
            return ensure('ctrl-a .', {
              text: '125\nab47\ncd-65ef\nab-3\na-bcdef',
              cursorBuffer: [[0, 2], [1, 3], [2, 4], [3, 3], [4, 0]]
            });
          });
          it("can have a count", function() {
            return ensure('5 ctrl-a', {
              cursorBuffer: [[0, 2], [1, 3], [2, 4], [3, 2], [4, 0]],
              text: '128\nab50\ncd-62ef\nab0\na-bcdef'
            });
          });
          it("can make a negative number positive, change number of digits", function() {
            return ensure('9 9 ctrl-a', {
              text: '222\nab144\ncd32ef\nab94\na-bcdef',
              cursorBuffer: [[0, 2], [1, 4], [2, 3], [3, 3], [4, 0]]
            });
          });
          it("does nothing when cursor is after the number", function() {
            set({
              cursorBuffer: [2, 5]
            });
            return ensure('ctrl-a', {
              text: '123\nab45\ncd-67ef\nab-5\na-bcdef',
              cursorBuffer: [[2, 5]]
            });
          });
          it("does nothing on an empty line", function() {
            set({
              text: '\n',
              cursorBuffer: [[0, 0], [1, 0]]
            });
            return ensure('ctrl-a', {
              text: '\n',
              cursorBuffer: [[0, 0], [1, 0]]
            });
          });
          return it("honours the vim-mode-plus.numberRegex setting", function() {
            set({
              text: '123\nab45\ncd -67ef\nab-5\na-bcdef',
              cursorBuffer: [[0, 0], [1, 0], [2, 0], [3, 3], [4, 0]]
            });
            settings.set('numberRegex', '(?:\\B-)?[0-9]+');
            return ensure('ctrl-a', {
              cursorBuffer: [[0, 2], [1, 3], [2, 5], [3, 3], [4, 0]],
              text: '124\nab46\ncd -66ef\nab-6\na-bcdef'
            });
          });
        });
        return describe("visual-mode", function() {
          beforeEach(function() {
            return set({
              text: "1 2 3\n1 2 3\n1 2 3\n1 2 3"
            });
          });
          it("increase number in characterwise selected range", function() {
            set({
              cursor: [0, 2]
            });
            return ensure('v 2 j ctrl-a', {
              text: "1 3 4\n2 3 4\n2 3 3\n1 2 3",
              selectedText: "3 4\n2 3 4\n2 3",
              cursor: [2, 3]
            });
          });
          it("increase number in characterwise selected range when multiple cursors", function() {
            set({
              cursor: [0, 2],
              addCursor: [2, 2]
            });
            return ensure('v 1 0 ctrl-a', {
              text: "1 12 3\n1 2 3\n1 12 3\n1 2 3",
              selectedTextOrdered: ["12", "12"],
              selectedBufferRangeOrdered: [[[0, 2], [0, 4]], [[2, 2], [2, 4]]]
            });
          });
          it("increase number in linewise selected range", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('V 2 j ctrl-a', {
              text: "2 3 4\n2 3 4\n2 3 4\n1 2 3",
              selectedText: "2 3 4\n2 3 4\n2 3 4\n",
              cursor: [3, 0]
            });
          });
          return it("increase number in blockwise selected range", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('ctrl-v 2 l 2 j ctrl-a', {
              text: "1 2 3\n1 3 4\n1 3 4\n1 3 4",
              selectedTextOrdered: ["3 4", "3 4", "3 4"],
              selectedBufferRangeOrdered: [[[1, 2], [1, 5]], [[2, 2], [2, 5]], [[3, 2], [3, 5]]]
            });
          });
        });
      });
      return describe("decreasing numbers", function() {
        describe("normal-mode", function() {
          it("decreases the next number", function() {
            return ensure('ctrl-x', {
              text: '122\nab44\ncd-68ef\nab-6\na-bcdef',
              cursorBuffer: [[0, 2], [1, 3], [2, 4], [3, 3], [4, 0]]
            });
          });
          it("repeats with .", function() {
            return ensure('ctrl-x .', {
              text: '121\nab43\ncd-69ef\nab-7\na-bcdef',
              cursorBuffer: [[0, 2], [1, 3], [2, 4], [3, 3], [4, 0]]
            });
          });
          it("can have a count", function() {
            return ensure('5 ctrl-x', {
              text: '118\nab40\ncd-72ef\nab-10\na-bcdef',
              cursorBuffer: [[0, 2], [1, 3], [2, 4], [3, 4], [4, 0]]
            });
          });
          it("can make a positive number negative, change number of digits", function() {
            return ensure('9 9 ctrl-x', {
              text: '24\nab-54\ncd-166ef\nab-104\na-bcdef',
              cursorBuffer: [[0, 1], [1, 4], [2, 5], [3, 5], [4, 0]]
            });
          });
          it("does nothing when cursor is after the number", function() {
            set({
              cursorBuffer: [2, 5]
            });
            return ensure('ctrl-x', {
              text: '123\nab45\ncd-67ef\nab-5\na-bcdef',
              cursorBuffer: [[2, 5]]
            });
          });
          it("does nothing on an empty line", function() {
            set({
              text: '\n',
              cursorBuffer: [[0, 0], [1, 0]]
            });
            return ensure('ctrl-x', {
              text: '\n',
              cursorBuffer: [[0, 0], [1, 0]]
            });
          });
          return it("honours the vim-mode-plus.numberRegex setting", function() {
            set({
              text: '123\nab45\ncd -67ef\nab-5\na-bcdef',
              cursorBuffer: [[0, 0], [1, 0], [2, 0], [3, 3], [4, 0]]
            });
            settings.set('numberRegex', '(?:\\B-)?[0-9]+');
            return ensure('ctrl-x', {
              text: '122\nab44\ncd -68ef\nab-4\na-bcdef',
              cursorBuffer: [[0, 2], [1, 3], [2, 5], [3, 3], [4, 0]]
            });
          });
        });
        return describe("visual-mode", function() {
          beforeEach(function() {
            return set({
              text: "1 2 3\n1 2 3\n1 2 3\n1 2 3"
            });
          });
          it("decrease number in characterwise selected range", function() {
            set({
              cursor: [0, 2]
            });
            return ensure('v 2 j ctrl-x', {
              text: "1 1 2\n0 1 2\n0 1 3\n1 2 3",
              selectedText: "1 2\n0 1 2\n0 1",
              cursor: [2, 3]
            });
          });
          it("decrease number in characterwise selected range when multiple cursors", function() {
            set({
              cursor: [0, 2],
              addCursor: [2, 2]
            });
            return ensure('v 5 ctrl-x', {
              text: "1 -3 3\n1 2 3\n1 -3 3\n1 2 3",
              selectedTextOrdered: ["-3", "-3"],
              selectedBufferRangeOrdered: [[[0, 2], [0, 4]], [[2, 2], [2, 4]]]
            });
          });
          it("decrease number in linewise selected range", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('V 2 j ctrl-x', {
              text: "0 1 2\n0 1 2\n0 1 2\n1 2 3",
              selectedText: "0 1 2\n0 1 2\n0 1 2\n",
              cursor: [3, 0]
            });
          });
          return it("decrease number in blockwise selected rage", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('ctrl-v 2 l 2 j ctrl-x', {
              text: "1 2 3\n1 1 2\n1 1 2\n1 1 2",
              selectedTextOrdered: ["1 2", "1 2", "1 2"],
              selectedBufferRangeOrdered: [[[1, 2], [1, 5]], [[2, 2], [2, 5]], [[3, 2], [3, 5]]]
            });
          });
        });
      });
    });
    return describe("the 'g ctrl-a', 'g ctrl-x' increment-number, decrement-number", function() {
      describe("increment", function() {
        beforeEach(function() {
          return set({
            text: "1 10 0\n0 7 0\n0 0 3",
            cursor: [0, 0]
          });
        });
        it("use first number as base number case-1", function() {
          set({
            text: "1 1 1",
            cursor: [0, 0]
          });
          return ensure('g ctrl-a $', {
            text: "1 2 3",
            mode: 'normal',
            cursor: [0, 0]
          });
        });
        it("use first number as base number case-2", function() {
          set({
            text: "99 1 1",
            cursor: [0, 0]
          });
          return ensure('g ctrl-a $', {
            text: "99 100 101",
            mode: 'normal',
            cursor: [0, 0]
          });
        });
        it("can take count, and used as step to each increment", function() {
          set({
            text: "5 0 0",
            cursor: [0, 0]
          });
          return ensure('5 g ctrl-a $', {
            text: "5 10 15",
            mode: 'normal',
            cursor: [0, 0]
          });
        });
        it("only increment number in target range", function() {
          set({
            cursor: [1, 2]
          });
          return ensure('g ctrl-a j', {
            text: "1 10 0\n0 1 2\n3 4 5",
            mode: 'normal'
          });
        });
        it("works in characterwise visual-mode", function() {
          set({
            cursor: [1, 2]
          });
          return ensure('v j g ctrl-a', {
            text: "1 10 0\n0 7 8\n9 10 3",
            mode: 'normal'
          });
        });
        it("works in blockwise visual-mode", function() {
          set({
            cursor: [0, 2]
          });
          return ensure('ctrl-v 2 j $ g ctrl-a', {
            text: "1 10 11\n0 12 13\n0 14 15",
            mode: 'normal'
          });
        });
        return describe("point when finished and repeatable", function() {
          beforeEach(function() {
            set({
              text: "1 0 0 0 0",
              cursor: [0, 0]
            });
            return ensure("v $", {
              selectedText: '1 0 0 0 0'
            });
          });
          it("put cursor on start position when finished and repeatable (case: selection is not reversed)", function() {
            ensure({
              selectionIsReversed: false
            });
            ensure('g ctrl-a', {
              text: "1 2 3 4 5",
              cursor: [0, 0],
              mode: 'normal'
            });
            return ensure('.', {
              text: "6 7 8 9 10",
              cursor: [0, 0]
            });
          });
          return it("put cursor on start position when finished and repeatable (case: selection is reversed)", function() {
            ensure('o', {
              selectionIsReversed: true
            });
            ensure('g ctrl-a', {
              text: "1 2 3 4 5",
              cursor: [0, 0],
              mode: 'normal'
            });
            return ensure('.', {
              text: "6 7 8 9 10",
              cursor: [0, 0]
            });
          });
        });
      });
      return describe("decrement", function() {
        beforeEach(function() {
          return set({
            text: "14 23 13\n10 20 13\n13 13 16",
            cursor: [0, 0]
          });
        });
        it("use first number as base number case-1", function() {
          set({
            text: "10 1 1"
          });
          return ensure('g ctrl-x $', {
            text: "10 9 8",
            mode: 'normal',
            cursor: [0, 0]
          });
        });
        it("use first number as base number case-2", function() {
          set({
            text: "99 1 1"
          });
          return ensure('g ctrl-x $', {
            text: "99 98 97",
            mode: 'normal',
            cursor: [0, 0]
          });
        });
        it("can take count, and used as step to each increment", function() {
          set({
            text: "5 0 0",
            cursor: [0, 0]
          });
          return ensure('5 g ctrl-x $', {
            text: "5 0 -5",
            mode: 'normal',
            cursor: [0, 0]
          });
        });
        it("only decrement number in target range", function() {
          set({
            cursor: [1, 3]
          });
          return ensure('g ctrl-x j', {
            text: "14 23 13\n10 9 8\n7 6 5",
            mode: 'normal'
          });
        });
        it("works in characterwise visual-mode", function() {
          set({
            cursor: [1, 3]
          });
          return ensure('v j l g ctrl-x', {
            text: "14 23 13\n10 20 19\n18 17 16",
            mode: 'normal'
          });
        });
        return it("works in blockwise visual-mode", function() {
          set({
            cursor: [0, 3]
          });
          return ensure('ctrl-v 2 j l g ctrl-x', {
            text: "14 23 13\n10 22 13\n13 21 16",
            mode: 'normal'
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvb3BlcmF0b3ItaW5jcmVhc2Utc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEscUNBQUE7O0FBQUEsRUFBQSxPQUEwQixPQUFBLENBQVEsZUFBUixDQUExQixFQUFDLG1CQUFBLFdBQUQsRUFBYyxnQkFBQSxRQUFkLENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSLENBRFgsQ0FBQTs7QUFBQSxFQUdBLFFBQUEsQ0FBUyxtQkFBVCxFQUE4QixTQUFBLEdBQUE7QUFDNUIsUUFBQSw4REFBQTtBQUFBLElBQUEsUUFBNEQsRUFBNUQsRUFBQyxjQUFELEVBQU0saUJBQU4sRUFBYyxvQkFBZCxFQUF5QixpQkFBekIsRUFBaUMsd0JBQWpDLEVBQWdELG1CQUFoRCxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLEdBQVIsR0FBQTtBQUNWLFFBQUEsUUFBQSxHQUFXLEtBQVgsQ0FBQTtBQUFBLFFBQ0Msa0JBQUEsTUFBRCxFQUFTLHlCQUFBLGFBRFQsQ0FBQTtlQUVDLFVBQUEsR0FBRCxFQUFNLGFBQUEsTUFBTixFQUFjLGdCQUFBLFNBQWQsRUFBMkIsSUFIakI7TUFBQSxDQUFaLEVBRFM7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBUUEsU0FBQSxDQUFVLFNBQUEsR0FBQTthQUNSLFFBQVEsQ0FBQyxlQUFULENBQUEsRUFEUTtJQUFBLENBQVYsQ0FSQSxDQUFBO0FBQUEsSUFXQSxRQUFBLENBQVMsK0JBQVQsRUFBMEMsU0FBQSxHQUFBO0FBQ3hDLE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtlQUNULEdBQUEsQ0FDRTtBQUFBLFVBQUEsSUFB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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/spec/operator-increase-spec.coffee