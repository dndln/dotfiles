(function() {
  var TextData, getVimState, settings, withMockPlatform, _, _ref;

  _ = require('underscore-plus');

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, TextData = _ref.TextData, withMockPlatform = _ref.withMockPlatform;

  settings = require('../lib/settings');

  describe("VimState", function() {
    var editor, editorElement, ensure, keystroke, set, vimState, _ref1;
    _ref1 = [], set = _ref1[0], ensure = _ref1[1], keystroke = _ref1[2], editor = _ref1[3], editorElement = _ref1[4], vimState = _ref1[5];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
      });
    });
    beforeEach(function() {
      return vimState.resetNormalMode();
    });
    describe("initialization", function() {
      it("puts the editor in normal-mode initially by default", function() {
        return ensure({
          mode: 'normal'
        });
      });
      return it("puts the editor in insert-mode if startInInsertMode is true", function() {
        settings.set('startInInsertMode', true);
        return getVimState(function(state, vim) {
          return vim.ensure({
            mode: 'insert'
          });
        });
      });
    });
    describe("::destroy", function() {
      it("re-enables text input on the editor", function() {
        expect(editorElement.component.isInputEnabled()).toBeFalsy();
        vimState.destroy();
        return expect(editorElement.component.isInputEnabled()).toBeTruthy();
      });
      it("removes the mode classes from the editor", function() {
        ensure({
          mode: 'normal'
        });
        vimState.destroy();
        return expect(editorElement.classList.contains("normal-mode")).toBeFalsy();
      });
      return it("is a noop when the editor is already destroyed", function() {
        editorElement.getModel().destroy();
        return vimState.destroy();
      });
    });
    describe("normal-mode", function() {
      describe("when entering an insertable character", function() {
        beforeEach(function() {
          return keystroke('\\');
        });
        return it("stops propagation", function() {
          return ensure({
            text: ''
          });
        });
      });
      describe("when entering an operator", function() {
        beforeEach(function() {
          return keystroke('d');
        });
        describe("with an operator that can't be composed", function() {
          beforeEach(function() {
            return keystroke('x');
          });
          return it("clears the operator stack", function() {
            return expect(vimState.operationStack.isEmpty()).toBe(true);
          });
        });
        describe("the escape keybinding", function() {
          beforeEach(function() {
            return keystroke('escape');
          });
          return it("clears the operator stack", function() {
            return expect(vimState.operationStack.isEmpty()).toBe(true);
          });
        });
        return describe("the ctrl-c keybinding", function() {
          beforeEach(function() {
            return keystroke('ctrl-c');
          });
          return it("clears the operator stack", function() {
            return expect(vimState.operationStack.isEmpty()).toBe(true);
          });
        });
      });
      describe("the escape keybinding", function() {
        return it("clears any extra cursors", function() {
          set({
            text: "one-two-three",
            addCursor: [0, 3]
          });
          ensure({
            numCursors: 2
          });
          return ensure('escape', {
            numCursors: 1
          });
        });
      });
      describe("the v keybinding", function() {
        beforeEach(function() {
          set({
            text: "abc",
            cursor: [0, 0]
          });
          return keystroke('v');
        });
        return it("puts the editor into visual characterwise mode", function() {
          return ensure({
            mode: ['visual', 'characterwise']
          });
        });
      });
      describe("the V keybinding", function() {
        beforeEach(function() {
          return set({
            text: "012345\nabcdef",
            cursor: [0, 0]
          });
        });
        it("puts the editor into visual linewise mode", function() {
          return ensure('V', {
            mode: ['visual', 'linewise']
          });
        });
        return it("selects the current line", function() {
          return ensure('V', {
            selectedText: '012345\n'
          });
        });
      });
      describe("the ctrl-v keybinding", function() {
        return it("puts the editor into visual blockwise mode", function() {
          set({
            text: "012345\n\nabcdef",
            cursor: [0, 0]
          });
          return ensure('ctrl-v', {
            mode: ['visual', 'blockwise']
          });
        });
      });
      describe("selecting text", function() {
        beforeEach(function() {
          spyOn(_._, "now").andCallFake(function() {
            return window.now;
          });
          return set({
            text: "abc def",
            cursor: [0, 0]
          });
        });
        it("puts the editor into visual mode", function() {
          ensure({
            mode: 'normal'
          });
          advanceClock(200);
          atom.commands.dispatch(editorElement, "core:select-right");
          return ensure({
            mode: ['visual', 'characterwise'],
            selectedBufferRange: [[0, 0], [0, 1]]
          });
        });
        it("handles the editor being destroyed shortly after selecting text", function() {
          set({
            selectedBufferRange: [[0, 0], [0, 3]]
          });
          editor.destroy();
          vimState.destroy();
          return advanceClock(100);
        });
        return it('handles native selection such as core:select-all', function() {
          atom.commands.dispatch(editorElement, 'core:select-all');
          return ensure({
            selectedBufferRange: [[0, 0], [0, 7]]
          });
        });
      });
      describe("the i keybinding", function() {
        return it("puts the editor into insert mode", function() {
          return ensure('i', {
            mode: 'insert'
          });
        });
      });
      describe("the R keybinding", function() {
        return it("puts the editor into replace mode", function() {
          return ensure('R', {
            mode: ['insert', 'replace']
          });
        });
      });
      describe("with content", function() {
        beforeEach(function() {
          return set({
            text: "012345\n\nabcdef",
            cursor: [0, 0]
          });
        });
        describe("on a line with content", function() {
          return it("[Changed] won't adjust cursor position if outer command place the cursor on end of line('\\n') character", function() {
            ensure({
              mode: 'normal'
            });
            atom.commands.dispatch(editorElement, "editor:move-to-end-of-line");
            return ensure({
              cursor: [0, 6]
            });
          });
        });
        return describe("on an empty line", function() {
          return it("allows the cursor to be placed on the \n character", function() {
            set({
              cursor: [1, 0]
            });
            return ensure({
              cursor: [1, 0]
            });
          });
        });
      });
      return describe('with character-input operations', function() {
        beforeEach(function() {
          return set({
            text: '012345\nabcdef'
          });
        });
        return it('properly clears the operations', function() {
          var target;
          ensure('d r', {
            mode: 'normal'
          });
          expect(vimState.operationStack.isEmpty()).toBe(true);
          target = vimState.input.editorElement;
          keystroke('d');
          atom.commands.dispatch(target, 'core:cancel');
          return ensure({
            text: '012345\nabcdef'
          });
        });
      });
    });
    describe("activate-normal-mode-once command", function() {
      beforeEach(function() {
        set({
          text: "0 23456\n1 23456",
          cursor: [0, 2]
        });
        return ensure('i', {
          mode: 'insert',
          cursor: [0, 2]
        });
      });
      return it("activate normal mode without moving cursors left, then back to insert-mode once some command executed", function() {
        ensure('ctrl-o', {
          cursor: [0, 2],
          mode: 'normal'
        });
        return ensure('l', {
          cursor: [0, 3],
          mode: 'insert'
        });
      });
    });
    describe("insert-mode", function() {
      beforeEach(function() {
        return keystroke('i');
      });
      describe("with content", function() {
        beforeEach(function() {
          return set({
            text: "012345\n\nabcdef"
          });
        });
        describe("when cursor is in the middle of the line", function() {
          return it("moves the cursor to the left when exiting insert mode", function() {
            set({
              cursor: [0, 3]
            });
            return ensure('escape', {
              cursor: [0, 2]
            });
          });
        });
        describe("when cursor is at the beginning of line", function() {
          return it("leaves the cursor at the beginning of line", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('escape', {
              cursor: [1, 0]
            });
          });
        });
        return describe("on a line with content", function() {
          return it("allows the cursor to be placed on the \n character", function() {
            set({
              cursor: [0, 6]
            });
            return ensure({
              cursor: [0, 6]
            });
          });
        });
      });
      it("puts the editor into normal mode when <escape> is pressed", function() {
        return escape('escape', {
          mode: 'normal'
        });
      });
      it("puts the editor into normal mode when <ctrl-c> is pressed", function() {
        return withMockPlatform(editorElement, 'platform-darwin', function() {
          return ensure('ctrl-c', {
            mode: 'normal'
          });
        });
      });
      return describe("clearMultipleCursorsOnEscapeInsertMode setting", function() {
        beforeEach(function() {
          return set({
            text: 'abc',
            cursor: [[0, 0], [0, 1]]
          });
        });
        describe("when enabled", function() {
          beforeEach(function() {
            return settings.set('clearMultipleCursorsOnEscapeInsertMode', true);
          });
          return it("clear multiple cursor on escape", function() {
            return ensure('escape', {
              mode: 'normal',
              numCursors: 1
            });
          });
        });
        return describe("when disabled", function() {
          beforeEach(function() {
            return settings.set('clearMultipleCursorsOnEscapeInsertMode', false);
          });
          return it("clear multiple cursor on escape", function() {
            return ensure('escape', {
              mode: 'normal',
              numCursors: 2
            });
          });
        });
      });
    });
    describe("replace-mode", function() {
      describe("with content", function() {
        beforeEach(function() {
          return set({
            text: "012345\n\nabcdef"
          });
        });
        describe("when cursor is in the middle of the line", function() {
          return it("moves the cursor to the left when exiting replace mode", function() {
            set({
              cursor: [0, 3]
            });
            return ensure('R escape', {
              cursor: [0, 2]
            });
          });
        });
        describe("when cursor is at the beginning of line", function() {
          beforeEach(function() {});
          return it("leaves the cursor at the beginning of line", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('R escape', {
              cursor: [1, 0]
            });
          });
        });
        return describe("on a line with content", function() {
          return it("allows the cursor to be placed on the \n character", function() {
            keystroke('R');
            set({
              cursor: [0, 6]
            });
            return ensure({
              cursor: [0, 6]
            });
          });
        });
      });
      it("puts the editor into normal mode when <escape> is pressed", function() {
        return ensure('R escape', {
          mode: 'normal'
        });
      });
      return it("puts the editor into normal mode when <ctrl-c> is pressed", function() {
        return withMockPlatform(editorElement, 'platform-darwin', function() {
          return ensure('R ctrl-c', {
            mode: 'normal'
          });
        });
      });
    });
    describe("visual-mode", function() {
      beforeEach(function() {
        set({
          text: "one two three",
          cursorBuffer: [0, 4]
        });
        return keystroke('v');
      });
      it("selects the character under the cursor", function() {
        return ensure({
          selectedBufferRange: [[0, 4], [0, 5]],
          selectedText: 't'
        });
      });
      it("puts the editor into normal mode when <escape> is pressed", function() {
        return ensure('escape', {
          cursorBuffer: [0, 4],
          mode: 'normal'
        });
      });
      it("puts the editor into normal mode when <escape> is pressed on selection is reversed", function() {
        ensure({
          selectedText: 't'
        });
        ensure('h h', {
          selectedText: 'e t',
          selectionIsReversed: true
        });
        return ensure('escape', {
          mode: 'normal',
          cursorBuffer: [0, 2]
        });
      });
      describe("motions", function() {
        it("transforms the selection", function() {
          return ensure('w', {
            selectedText: 'two t'
          });
        });
        return it("always leaves the initially selected character selected", function() {
          ensure('h', {
            selectedText: ' t'
          });
          ensure('l', {
            selectedText: 't'
          });
          return ensure('l', {
            selectedText: 'tw'
          });
        });
      });
      describe("operators", function() {
        return it("operate on the current selection", function() {
          set({
            text: "012345\n\nabcdef",
            cursor: [0, 0]
          });
          return ensure('V d', {
            text: "\nabcdef"
          });
        });
      });
      describe("returning to normal-mode", function() {
        return it("operate on the current selection", function() {
          set({
            text: "012345\n\nabcdef"
          });
          return ensure('V escape', {
            selectedText: ''
          });
        });
      });
      describe("the o keybinding", function() {
        it("reversed each selection", function() {
          set({
            addCursor: [0, 12]
          });
          ensure('i w', {
            selectedText: ["two", "three"],
            selectionIsReversed: false
          });
          return ensure('o', {
            selectionIsReversed: true
          });
        });
        return xit("harmonizes selection directions", function() {
          set({
            cursorBuffer: [0, 0]
          });
          keystroke('e e');
          set({
            addCursor: [0, Infinity]
          });
          ensure('h h', {
            selectedBufferRange: [[[0, 0], [0, 5]], [[0, 11], [0, 13]]],
            cursorBuffer: [[0, 5], [0, 11]]
          });
          return ensure('o', {
            selectedBufferRange: [[[0, 0], [0, 5]], [[0, 11], [0, 13]]],
            cursorBuffer: [[0, 5], [0, 13]]
          });
        });
      });
      describe("activate visualmode within visualmode", function() {
        var cursorPosition;
        cursorPosition = null;
        beforeEach(function() {
          cursorPosition = [0, 4];
          set({
            text: "line one\nline two\nline three\n",
            cursor: cursorPosition
          });
          return ensure('escape', {
            mode: 'normal'
          });
        });
        describe("activateVisualMode with same type puts the editor into normal mode", function() {
          describe("characterwise: vv", function() {
            return it("activating twice make editor return to normal mode ", function() {
              ensure('v', {
                mode: ['visual', 'characterwise']
              });
              return ensure('v', {
                mode: 'normal',
                cursor: cursorPosition
              });
            });
          });
          describe("linewise: VV", function() {
            return it("activating twice make editor return to normal mode ", function() {
              ensure('V', {
                mode: ['visual', 'linewise']
              });
              return ensure('V', {
                mode: 'normal',
                cursor: cursorPosition
              });
            });
          });
          return describe("blockwise: ctrl-v twice", function() {
            return it("activating twice make editor return to normal mode ", function() {
              ensure('ctrl-v', {
                mode: ['visual', 'blockwise']
              });
              return ensure('ctrl-v', {
                mode: 'normal',
                cursor: cursorPosition
              });
            });
          });
        });
        describe("change submode within visualmode", function() {
          beforeEach(function() {
            return set({
              text: "line one\nline two\nline three\n",
              cursorBuffer: [[0, 5], [2, 5]]
            });
          });
          it("can change submode within visual mode", function() {
            ensure('v', {
              mode: ['visual', 'characterwise']
            });
            ensure('V', {
              mode: ['visual', 'linewise']
            });
            ensure('ctrl-v', {
              mode: ['visual', 'blockwise']
            });
            return ensure('v', {
              mode: ['visual', 'characterwise']
            });
          });
          return it("recover original range when shift from linewise to characterwise", function() {
            ensure('v i w', {
              selectedText: ['one', 'three']
            });
            ensure('V', {
              selectedText: ["line one\n", "line three\n"]
            });
            return ensure('v', {
              selectedText: ["one", "three"]
            });
          });
        });
        return describe("keep goalColum when submode change in visual-mode", function() {
          var text;
          text = null;
          beforeEach(function() {
            text = new TextData("0_34567890ABCDEF\n1_34567890\n2_34567\n3_34567890A\n4_34567890ABCDEF\n");
            return set({
              text: text.getRaw(),
              cursor: [0, 0]
            });
          });
          return it("keep goalColumn when shift linewise to characterwise", function() {
            ensure('V', {
              selectedText: text.getLines([0]),
              characterwiseHead: [0, 0],
              mode: ['visual', 'linewise']
            });
            ensure('$', {
              selectedText: text.getLines([0]),
              characterwiseHead: [0, 15],
              mode: ['visual', 'linewise']
            });
            ensure('j', {
              selectedText: text.getLines([0, 1]),
              characterwiseHead: [1, 9],
              mode: ['visual', 'linewise']
            });
            ensure('j', {
              selectedText: text.getLines([0, 1, 2]),
              characterwiseHead: [2, 6],
              mode: ['visual', 'linewise']
            });
            ensure('v', {
              selectedText: text.getLines([0, 1, 2], {
                chomp: true
              }),
              characterwiseHead: [2, 6],
              mode: ['visual', 'characterwise']
            });
            ensure('j', {
              selectedText: text.getLines([0, 1, 2, 3], {
                chomp: true
              }),
              cursor: [3, 11],
              mode: ['visual', 'characterwise']
            });
            ensure('v', {
              cursor: [3, 10],
              mode: 'normal'
            });
            return ensure('j', {
              cursor: [4, 15],
              mode: 'normal'
            });
          });
        });
      });
      describe("deactivating visual mode", function() {
        beforeEach(function() {
          ensure('escape', {
            mode: 'normal'
          });
          return set({
            text: "line one\nline two\nline three\n",
            cursor: [0, 7]
          });
        });
        it("can put cursor at in visual char mode", function() {
          return ensure('v', {
            mode: ['visual', 'characterwise'],
            cursor: [0, 8]
          });
        });
        it("adjust cursor position 1 column left when deactivated", function() {
          return ensure('v escape', {
            mode: 'normal',
            cursor: [0, 7]
          });
        });
        return it("[CHANGED from vim-mode] can not select new line in characterwise visual mode", function() {
          ensure('v l l', {
            cursor: [0, 8]
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [0, 7]
          });
        });
      });
      return describe("deactivating visual mode on blank line", function() {
        beforeEach(function() {
          ensure('escape', {
            mode: 'normal'
          });
          return set({
            text: "0: abc\n\n2: abc",
            cursor: [1, 0]
          });
        });
        it("v case-1", function() {
          ensure('v', {
            mode: ['visual', 'characterwise'],
            cursor: [2, 0]
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [1, 0]
          });
        });
        it("v case-2 selection head is blank line", function() {
          set({
            cursor: [0, 1]
          });
          ensure('v j', {
            mode: ['visual', 'characterwise'],
            cursor: [2, 0],
            selectedText: ": abc\n\n"
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [1, 0]
          });
        });
        it("V case-1", function() {
          ensure('V', {
            mode: ['visual', 'linewise'],
            cursor: [2, 0]
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [1, 0]
          });
        });
        it("V case-2 selection head is blank line", function() {
          set({
            cursor: [0, 1]
          });
          ensure('V j', {
            mode: ['visual', 'linewise'],
            cursor: [2, 0],
            selectedText: "0: abc\n\n"
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [1, 0]
          });
        });
        it("ctrl-v", function() {
          ensure('ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedBufferRange: [[1, 0], [1, 0]]
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [1, 0]
          });
        });
        return it("ctrl-v and move over empty line", function() {
          ensure('ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedBufferRangeOrdered: [[1, 0], [1, 0]]
          });
          ensure('k', {
            mode: ['visual', 'blockwise'],
            selectedBufferRangeOrdered: [[[0, 0], [0, 1]], [[1, 0], [1, 0]]]
          });
          ensure('j', {
            mode: ['visual', 'blockwise'],
            selectedBufferRangeOrdered: [[1, 0], [1, 0]]
          });
          return ensure('j', {
            mode: ['visual', 'blockwise'],
            selectedBufferRangeOrdered: [[[1, 0], [1, 0]], [[2, 0], [2, 1]]]
          });
        });
      });
    });
    describe("marks", function() {
      beforeEach(function() {
        return set({
          text: "text in line 1\ntext in line 2\ntext in line 3"
        });
      });
      it("basic marking functionality", function() {
        set({
          cursor: [1, 1]
        });
        keystroke('m t');
        set({
          cursor: [2, 2]
        });
        return ensure('` t', {
          cursor: [1, 1]
        });
      });
      it("real (tracking) marking functionality", function() {
        set({
          cursor: [2, 2]
        });
        keystroke('m q');
        set({
          cursor: [1, 2]
        });
        return ensure('o escape ` q', {
          cursor: [3, 2]
        });
      });
      return it("real (tracking) marking functionality", function() {
        set({
          cursor: [2, 2]
        });
        keystroke('m q');
        set({
          cursor: [1, 2]
        });
        return ensure('d d escape ` q', {
          cursor: [1, 2]
        });
      });
    });
    return describe("is-narrowed attribute", function() {
      var ensureNormalModeState;
      ensureNormalModeState = function() {
        return ensure("escape", {
          mode: 'normal',
          selectedText: '',
          selectionIsNarrowed: false
        });
      };
      beforeEach(function() {
        return set({
          text: "1:-----\n2:-----\n3:-----\n4:-----",
          cursor: [0, 0]
        });
      });
      describe("normal-mode", function() {
        return it("is not narrowed", function() {
          return ensure({
            mode: ['normal'],
            selectionIsNarrowed: false
          });
        });
      });
      describe("visual-mode.characterwise", function() {
        it("[single row] is narrowed", function() {
          ensure('v $', {
            selectedText: '1:-----',
            mode: ['visual', 'characterwise'],
            selectionIsNarrowed: false
          });
          return ensureNormalModeState();
        });
        return it("[multi-row] is narrowed", function() {
          ensure('v j', {
            selectedText: "1:-----\n2",
            mode: ['visual', 'characterwise'],
            selectionIsNarrowed: true
          });
          return ensureNormalModeState();
        });
      });
      describe("visual-mode.linewise", function() {
        it("[single row] is narrowed", function() {
          ensure('V', {
            selectedText: "1:-----\n",
            mode: ['visual', 'linewise'],
            selectionIsNarrowed: false
          });
          return ensureNormalModeState();
        });
        return it("[multi-row] is narrowed", function() {
          ensure('V j', {
            selectedText: "1:-----\n2:-----\n",
            mode: ['visual', 'linewise'],
            selectionIsNarrowed: true
          });
          return ensureNormalModeState();
        });
      });
      return describe("visual-mode.blockwise", function() {
        it("[single row] is narrowed", function() {
          ensure('ctrl-v l', {
            selectedText: "1:",
            mode: ['visual', 'blockwise'],
            selectionIsNarrowed: false
          });
          return ensureNormalModeState();
        });
        return it("[multi-row] is narrowed", function() {
          ensure('ctrl-v l j', {
            selectedText: ["1:", "2:"],
            mode: ['visual', 'blockwise'],
            selectionIsNarrowed: true
          });
          return ensureNormalModeState();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvdmltLXN0YXRlLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBEQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxPQUE0QyxPQUFBLENBQVEsZUFBUixDQUE1QyxFQUFDLG1CQUFBLFdBQUQsRUFBYyxnQkFBQSxRQUFkLEVBQXdCLHdCQUFBLGdCQUR4QixDQUFBOztBQUFBLEVBRUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUixDQUZYLENBQUE7O0FBQUEsRUFJQSxRQUFBLENBQVMsVUFBVCxFQUFxQixTQUFBLEdBQUE7QUFDbkIsUUFBQSw4REFBQTtBQUFBLElBQUEsUUFBNEQsRUFBNUQsRUFBQyxjQUFELEVBQU0saUJBQU4sRUFBYyxvQkFBZCxFQUF5QixpQkFBekIsRUFBaUMsd0JBQWpDLEVBQWdELG1CQUFoRCxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLEdBQVIsR0FBQTtBQUNWLFFBQUEsUUFBQSxHQUFXLEtBQVgsQ0FBQTtBQUFBLFFBQ0Msa0JBQUEsTUFBRCxFQUFTLHlCQUFBLGFBRFQsQ0FBQTtlQUVDLFVBQUEsR0FBRCxFQUFNLGFBQUEsTUFBTixFQUFjLGdCQUFBLFNBQWQsRUFBMkIsSUFIakI7TUFBQSxDQUFaLEVBRFM7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBUUEsVUFBQSxDQUFXLFNBQUEsR0FBQTthQUNULFFBQVEsQ0FBQyxlQUFULENBQUEsRUFEUztJQUFBLENBQVgsQ0FSQSxDQUFBO0FBQUEsSUFXQSxRQUFBLENBQVMsZ0JBQVQsRUFBMkIsU0FBQSxHQUFBO0FB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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/spec/vim-state-spec.coffee
