(function() {
  var dispatch, getVimState, inspect, settings, _ref;

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, dispatch = _ref.dispatch;

  settings = require('../lib/settings');

  inspect = require('util').inspect;

  describe("Operator ActivateInsertMode family", function() {
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
    describe("the s keybinding", function() {
      beforeEach(function() {
        return set({
          text: '012345',
          cursor: [0, 1]
        });
      });
      it("deletes the character to the right and enters insert mode", function() {
        return ensure('s', {
          mode: 'insert',
          text: '02345',
          cursor: [0, 1],
          register: {
            '"': {
              text: '1'
            }
          }
        });
      });
      it("is repeatable", function() {
        set({
          cursor: [0, 0]
        });
        keystroke('3 s');
        editor.insertText('ab');
        ensure('escape', {
          text: 'ab345'
        });
        set({
          cursor: [0, 2]
        });
        return ensure('.', {
          text: 'abab'
        });
      });
      it("is undoable", function() {
        set({
          cursor: [0, 0]
        });
        keystroke('3 s');
        editor.insertText('ab');
        ensure('escape', {
          text: 'ab345'
        });
        return ensure('u', {
          text: '012345',
          selectedText: ''
        });
      });
      return describe("in visual mode", function() {
        beforeEach(function() {
          return keystroke('v l s');
        });
        return it("deletes the selected characters and enters insert mode", function() {
          return ensure({
            mode: 'insert',
            text: '0345',
            cursor: [0, 1],
            register: {
              '"': {
                text: '12'
              }
            }
          });
        });
      });
    });
    describe("the S keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12345\nabcde\nABCDE",
          cursor: [1, 3]
        });
      });
      it("deletes the entire line and enters insert mode", function() {
        return ensure('S', {
          mode: 'insert',
          text: "12345\n\nABCDE",
          register: {
            '"': {
              text: 'abcde\n',
              type: 'linewise'
            }
          }
        });
      });
      it("is repeatable", function() {
        keystroke('S');
        editor.insertText('abc');
        ensure('escape', {
          text: '12345\nabc\nABCDE'
        });
        set({
          cursor: [2, 3]
        });
        return ensure('.', {
          text: '12345\nabc\nabc'
        });
      });
      it("is undoable", function() {
        keystroke('S');
        editor.insertText('abc');
        ensure('escape', {
          text: '12345\nabc\nABCDE'
        });
        return ensure('u', {
          text: "12345\nabcde\nABCDE",
          selectedText: ''
        });
      });
      it("works when the cursor's goal column is greater than its current column", function() {
        set({
          text: "\n12345",
          cursor: [1, Infinity]
        });
        return ensure('k S', {
          text: '\n12345'
        });
      });
      return xit("respects indentation", function() {});
    });
    describe("the c keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12345\nabcde\nABCDE"
        });
      });
      describe("when followed by a c", function() {
        describe("with autoindent", function() {
          beforeEach(function() {
            set({
              text: "12345\n  abcde\nABCDE\n"
            });
            set({
              cursor: [1, 1]
            });
            spyOn(editor, 'shouldAutoIndent').andReturn(true);
            spyOn(editor, 'autoIndentBufferRow').andCallFake(function(line) {
              return editor.indent();
            });
            return spyOn(editor.languageMode, 'suggestedIndentForLineAtBufferRow').andCallFake(function() {
              return 1;
            });
          });
          it("deletes the current line and enters insert mode", function() {
            set({
              cursor: [1, 1]
            });
            return ensure('c c', {
              text: "12345\n  \nABCDE\n",
              cursor: [1, 2],
              mode: 'insert'
            });
          });
          it("is repeatable", function() {
            keystroke('c c');
            editor.insertText("abc");
            ensure('escape', {
              text: "12345\n  abc\nABCDE\n"
            });
            set({
              cursor: [2, 3]
            });
            return ensure('.', {
              text: "12345\n  abc\n  abc\n"
            });
          });
          return it("is undoable", function() {
            keystroke('c c');
            editor.insertText("abc");
            ensure('escape', {
              text: "12345\n  abc\nABCDE\n"
            });
            return ensure('u', {
              text: "12345\n  abcde\nABCDE\n",
              selectedText: ''
            });
          });
        });
        describe("when the cursor is on the last line", function() {
          return it("deletes the line's content and enters insert mode on the last line", function() {
            set({
              cursor: [2, 1]
            });
            return ensure('c c', {
              text: "12345\nabcde\n",
              cursor: [2, 0],
              mode: 'insert'
            });
          });
        });
        return describe("when the cursor is on the only line", function() {
          return it("deletes the line's content and enters insert mode", function() {
            set({
              text: "12345",
              cursor: [0, 2]
            });
            return ensure('c c', {
              text: "",
              cursor: [0, 0],
              mode: 'insert'
            });
          });
        });
      });
      describe("when followed by i w", function() {
        it("undo's and redo's completely", function() {
          set({
            cursor: [1, 1]
          });
          ensure('c i w', {
            text: "12345\n\nABCDE",
            cursor: [1, 0],
            mode: 'insert'
          });
          set({
            text: "12345\nfg\nABCDE"
          });
          ensure('escape', {
            text: "12345\nfg\nABCDE",
            mode: 'normal'
          });
          ensure('u', {
            text: "12345\nabcde\nABCDE"
          });
          return ensure('ctrl-r', {
            text: "12345\nfg\nABCDE"
          });
        });
        return it("repeatable", function() {
          set({
            cursor: [1, 1]
          });
          ensure('c i w', {
            text: "12345\n\nABCDE",
            cursor: [1, 0],
            mode: 'insert'
          });
          return ensure('escape j .', {
            text: "12345\n\n",
            cursor: [2, 0],
            mode: 'normal'
          });
        });
      });
      describe("when followed by a w", function() {
        return it("changes the word", function() {
          set({
            text: "word1 word2 word3",
            cursorBuffer: [0, 7]
          });
          return ensure('c w escape', {
            text: "word1 w word3"
          });
        });
      });
      describe("when followed by a G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE\n";
          return set({
            text: originalText
          });
        });
        describe("on the beginning of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('c G escape', {
              text: '12345\n\n'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('c G escape', {
              text: '12345\n\n'
            });
          });
        });
      });
      return describe("when followed by a goto line G", function() {
        beforeEach(function() {
          return set({
            text: "12345\nabcde\nABCDE"
          });
        });
        describe("on the beginning of the second line", function() {
          return it("deletes all the text on the line", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('c 2 G escape', {
              text: '12345\n\nABCDE'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes all the text on the line", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('c 2 G escape', {
              text: '12345\n\nABCDE'
            });
          });
        });
      });
    });
    describe("the C keybinding", function() {
      beforeEach(function() {
        set({
          text: "012\n",
          cursor: [0, 1]
        });
        return keystroke('C');
      });
      return it("deletes the contents until the end of the line and enters insert mode", function() {
        return ensure({
          text: "0\n",
          cursor: [0, 1],
          mode: 'insert'
        });
      });
    });
    describe("the O keybinding", function() {
      beforeEach(function() {
        spyOn(editor, 'shouldAutoIndent').andReturn(true);
        spyOn(editor, 'autoIndentBufferRow').andCallFake(function(line) {
          return editor.indent();
        });
        return set({
          text: "  abc\n  012\n",
          cursor: [1, 1]
        });
      });
      it("switches to insert and adds a newline above the current one", function() {
        keystroke('O');
        return ensure({
          text: "  abc\n  \n  012\n",
          cursor: [1, 2],
          mode: 'insert'
        });
      });
      it("is repeatable", function() {
        set({
          text: "  abc\n  012\n    4spaces\n",
          cursor: [1, 1]
        });
        keystroke('O');
        editor.insertText("def");
        ensure('escape', {
          text: "  abc\n  def\n  012\n    4spaces\n"
        });
        set({
          cursor: [1, 1]
        });
        ensure('.', {
          text: "  abc\n  def\n  def\n  012\n    4spaces\n"
        });
        set({
          cursor: [4, 1]
        });
        return ensure('.', {
          text: "  abc\n  def\n  def\n  012\n    def\n    4spaces\n"
        });
      });
      return it("is undoable", function() {
        keystroke('O');
        editor.insertText("def");
        ensure('escape', {
          text: "  abc\n  def\n  012\n"
        });
        return ensure('u', {
          text: "  abc\n  012\n"
        });
      });
    });
    describe("the o keybinding", function() {
      beforeEach(function() {
        spyOn(editor, 'shouldAutoIndent').andReturn(true);
        spyOn(editor, 'autoIndentBufferRow').andCallFake(function(line) {
          return editor.indent();
        });
        return set({
          text: "abc\n  012\n",
          cursor: [1, 2]
        });
      });
      it("switches to insert and adds a newline above the current one", function() {
        return ensure('o', {
          text: "abc\n  012\n  \n",
          mode: 'insert',
          cursor: [2, 2]
        });
      });
      xit("is repeatable", function() {
        set({
          text: "  abc\n  012\n    4spaces\n",
          cursor: [1, 1]
        });
        keystroke('o');
        editor.insertText("def");
        ensure('escape', {
          text: "  abc\n  012\n  def\n    4spaces\n"
        });
        ensure('.', {
          text: "  abc\n  012\n  def\n  def\n    4spaces\n"
        });
        set({
          cursor: [4, 1]
        });
        return ensure('.', {
          text: "  abc\n  def\n  def\n  012\n    4spaces\n    def\n"
        });
      });
      return it("is undoable", function() {
        keystroke('o');
        editor.insertText("def");
        ensure('escape', {
          text: "abc\n  012\n  def\n"
        });
        return ensure('u', {
          text: "abc\n  012\n"
        });
      });
    });
    describe("the a keybinding", function() {
      beforeEach(function() {
        return set({
          text: "012\n"
        });
      });
      describe("at the beginning of the line", function() {
        beforeEach(function() {
          set({
            cursor: [0, 0]
          });
          return keystroke('a');
        });
        return it("switches to insert mode and shifts to the right", function() {
          return ensure({
            cursor: [0, 1],
            mode: 'insert'
          });
        });
      });
      return describe("at the end of the line", function() {
        beforeEach(function() {
          set({
            cursor: [0, 3]
          });
          return keystroke('a');
        });
        return it("doesn't linewrap", function() {
          return ensure({
            cursor: [0, 3]
          });
        });
      });
    });
    describe("the A keybinding", function() {
      beforeEach(function() {
        return set({
          text: "11\n22\n"
        });
      });
      return describe("at the beginning of a line", function() {
        it("switches to insert mode at the end of the line", function() {
          set({
            cursor: [0, 0]
          });
          return ensure('A', {
            mode: 'insert',
            cursor: [0, 2]
          });
        });
        return it("repeats always as insert at the end of the line", function() {
          set({
            cursor: [0, 0]
          });
          keystroke('A');
          editor.insertText("abc");
          keystroke('escape');
          set({
            cursor: [1, 0]
          });
          return ensure('.', {
            text: "11abc\n22abc\n",
            mode: 'normal',
            cursor: [1, 4]
          });
        });
      });
    });
    describe("the I keybinding", function() {
      beforeEach(function() {
        return set({
          text: "11\n  22\n"
        });
      });
      describe("at the end of a line", function() {
        it("switches to insert mode at the beginning of the line", function() {
          set({
            cursor: [0, 2]
          });
          return ensure('I', {
            cursor: [0, 0],
            mode: 'insert'
          });
        });
        it("switches to insert mode after leading whitespace", function() {
          set({
            cursor: [1, 4]
          });
          return ensure('I', {
            cursor: [1, 2],
            mode: 'insert'
          });
        });
        return it("repeats always as insert at the first character of the line", function() {
          set({
            cursor: [0, 2]
          });
          keystroke('I');
          editor.insertText("abc");
          ensure('escape', {
            cursor: [0, 2]
          });
          set({
            cursor: [1, 4]
          });
          return ensure('.', {
            text: "abc11\n  abc22\n",
            cursor: [1, 4],
            mode: 'normal'
          });
        });
      });
      describe("in visual-characterwise mode", function() {
        beforeEach(function() {
          return set({
            text: "012 456 890"
          });
        });
        describe("selection is not reversed", function() {
          beforeEach(function() {
            set({
              cursor: [0, 4]
            });
            return ensure("v l l", {
              selectedText: "456",
              selectionIsReversed: false
            });
          });
          it("insert at start of selection", function() {
            return ensure("I", {
              cursor: [0, 4],
              mode: "insert"
            });
          });
          return it("insert at end of selection", function() {
            return ensure("A", {
              cursor: [0, 7],
              mode: "insert"
            });
          });
        });
        return describe("selection is reversed", function() {
          beforeEach(function() {
            set({
              cursor: [0, 6]
            });
            return ensure("v h h", {
              selectedText: "456",
              selectionIsReversed: true
            });
          });
          it("insert at start of selection", function() {
            return ensure("I", {
              cursor: [0, 4],
              mode: "insert"
            });
          });
          return it("insert at end of selection", function() {
            return ensure("A", {
              cursor: [0, 7],
              mode: "insert"
            });
          });
        });
      });
      return describe("in visual-linewise mode", function() {
        beforeEach(function() {
          return set({
            text: "0: 3456 890\n1: 3456 890\n2: 3456 890\n3: 3456 890"
          });
        });
        describe("selection is not reversed", function() {
          beforeEach(function() {
            set({
              cursor: [1, 3]
            });
            return ensure("V j", {
              selectedText: "1: 3456 890\n2: 3456 890\n",
              selectionIsReversed: false
            });
          });
          it("insert at start of selection", function() {
            return ensure("I", {
              cursor: [1, 0],
              mode: "insert"
            });
          });
          return it("insert at end of selection", function() {
            return ensure("A", {
              cursor: [3, 0],
              mode: "insert"
            });
          });
        });
        return describe("selection is reversed", function() {
          beforeEach(function() {
            set({
              cursor: [2, 3]
            });
            return ensure("V k", {
              selectedText: "1: 3456 890\n2: 3456 890\n",
              selectionIsReversed: true
            });
          });
          it("insert at start of selection", function() {
            return ensure("I", {
              cursor: [1, 0],
              mode: "insert"
            });
          });
          return it("insert at end of selection", function() {
            return ensure("A", {
              cursor: [3, 0],
              mode: "insert"
            });
          });
        });
      });
    });
    describe("InsertAtPreviousFoldStart and Next", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        getVimState('sample.coffee', function(state, vim) {
          editor = state.editor, editorElement = state.editorElement;
          return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
        });
        return runs(function() {
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus.normal-mode': {
              'g [': 'vim-mode-plus:insert-at-previous-fold-start',
              'g ]': 'vim-mode-plus:insert-at-next-fold-start'
            }
          });
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage('language-coffee-script');
      });
      describe("when cursor is not at fold start row", function() {
        beforeEach(function() {
          return set({
            cursor: [16, 0]
          });
        });
        it("insert at previous fold start row", function() {
          return ensure('g [', {
            cursor: [9, 2],
            mode: 'insert'
          });
        });
        return it("insert at next fold start row", function() {
          return ensure('g ]', {
            cursor: [18, 4],
            mode: 'insert'
          });
        });
      });
      return describe("when cursor is at fold start row", function() {
        beforeEach(function() {
          return set({
            cursor: [20, 6]
          });
        });
        it("insert at previous fold start row", function() {
          return ensure('g [', {
            cursor: [18, 4],
            mode: 'insert'
          });
        });
        return it("insert at next fold start row", function() {
          return ensure('g ]', {
            cursor: [22, 6],
            mode: 'insert'
          });
        });
      });
    });
    describe("the i keybinding", function() {
      beforeEach(function() {
        return set({
          text: "123\n4567",
          cursorBuffer: [[0, 0], [1, 0]]
        });
      });
      it("allows undoing an entire batch of typing", function() {
        keystroke('i');
        editor.insertText("abcXX");
        editor.backspace();
        editor.backspace();
        ensure('escape', {
          text: "abc123\nabc4567"
        });
        keystroke('i');
        editor.insertText("d");
        editor.insertText("e");
        editor.insertText("f");
        ensure('escape', {
          text: "abdefc123\nabdefc4567"
        });
        ensure('u', {
          text: "abc123\nabc4567"
        });
        return ensure('u', {
          text: "123\n4567"
        });
      });
      it("allows repeating typing", function() {
        keystroke('i');
        editor.insertText("abcXX");
        editor.backspace();
        editor.backspace();
        ensure('escape', {
          text: "abc123\nabc4567"
        });
        ensure('.', {
          text: "ababcc123\nababcc4567"
        });
        return ensure('.', {
          text: "abababccc123\nabababccc4567"
        });
      });
      return describe('with nonlinear input', function() {
        beforeEach(function() {
          return set({
            text: '',
            cursorBuffer: [0, 0]
          });
        });
        it('deals with auto-matched brackets', function() {
          keystroke('i');
          editor.insertText('()');
          editor.moveLeft();
          editor.insertText('a');
          editor.moveRight();
          editor.insertText('b\n');
          ensure('escape', {
            cursor: [1, 0]
          });
          return ensure('.', {
            text: '(a)b\n(a)b\n',
            cursor: [2, 0]
          });
        });
        return it('deals with autocomplete', function() {
          keystroke('i');
          editor.insertText('a');
          editor.insertText('d');
          editor.insertText('d');
          editor.setTextInBufferRange([[0, 0], [0, 3]], 'addFoo');
          ensure('escape', {
            cursor: [0, 5],
            text: 'addFoo'
          });
          return ensure('.', {
            text: 'addFoaddFooo',
            cursor: [0, 10]
          });
        });
      });
    });
    describe('the a keybinding', function() {
      beforeEach(function() {
        return set({
          text: '',
          cursorBuffer: [0, 0]
        });
      });
      it("can be undone in one go", function() {
        keystroke('a');
        editor.insertText("abc");
        ensure('escape', {
          text: "abc"
        });
        return ensure('u', {
          text: ""
        });
      });
      return it("repeats correctly", function() {
        keystroke('a');
        editor.insertText("abc");
        ensure('escape', {
          text: "abc",
          cursor: [0, 2]
        });
        return ensure('.', {
          text: "abcabc",
          cursor: [0, 5]
        });
      });
    });
    describe('preserve inserted text', function() {
      beforeEach(function() {
        return set({
          text: "\n\n",
          cursorBuffer: [0, 0]
        });
      });
      return describe("save inserted text to '.' register", function() {
        var ensureDotRegister;
        ensureDotRegister = function(key, _arg) {
          var text;
          text = _arg.text;
          keystroke(key);
          editor.insertText(text);
          return ensure("escape", {
            register: {
              '.': {
                text: text
              }
            }
          });
        };
        it("[case-i]", function() {
          return ensureDotRegister('i', {
            text: 'abc'
          });
        });
        it("[case-o]", function() {
          return ensureDotRegister('o', {
            text: 'abc'
          });
        });
        it("[case-c]", function() {
          return ensureDotRegister('c', {
            text: 'abc'
          });
        });
        it("[case-C]", function() {
          return ensureDotRegister('C', {
            text: 'abc'
          });
        });
        return it("[case-s]", function() {
          return ensureDotRegister('s', {
            text: 'abc'
          });
        });
      });
    });
    describe("repeat backspace/delete happened in insert-mode", function() {
      describe("single cursor operation", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0],
            text: "123\n123"
          });
        });
        it("can repeat backspace only mutation: case-i", function() {
          set({
            cursor: [0, 1]
          });
          keystroke('i');
          editor.backspace();
          ensure('escape', {
            text: "23\n123",
            cursor: [0, 0]
          });
          ensure('j .', {
            text: "23\n123"
          });
          return ensure('l .', {
            text: "23\n23"
          });
        });
        it("can repeat backspace only mutation: case-a", function() {
          keystroke('a');
          editor.backspace();
          ensure('escape', {
            text: "23\n123",
            cursor: [0, 0]
          });
          ensure('.', {
            text: "3\n123",
            cursor: [0, 0]
          });
          return ensure('j . .', {
            text: "3\n3"
          });
        });
        it("can repeat delete only mutation: case-i", function() {
          keystroke('i');
          editor["delete"]();
          ensure('escape', {
            text: "23\n123"
          });
          return ensure('j .', {
            text: "23\n23"
          });
        });
        it("can repeat delete only mutation: case-a", function() {
          keystroke('a');
          editor["delete"]();
          ensure('escape', {
            text: "13\n123"
          });
          return ensure('j .', {
            text: "13\n13"
          });
        });
        it("can repeat backspace and insert mutation: case-i", function() {
          set({
            cursor: [0, 1]
          });
          keystroke('i');
          editor.backspace();
          editor.insertText("!!!");
          ensure('escape', {
            text: "!!!23\n123"
          });
          set({
            cursor: [1, 1]
          });
          return ensure('.', {
            text: "!!!23\n!!!23"
          });
        });
        it("can repeat backspace and insert mutation: case-a", function() {
          keystroke('a');
          editor.backspace();
          editor.insertText("!!!");
          ensure('escape', {
            text: "!!!23\n123"
          });
          return ensure('j 0 .', {
            text: "!!!23\n!!!23"
          });
        });
        it("can repeat delete and insert mutation: case-i", function() {
          keystroke('i');
          editor["delete"]();
          editor.insertText("!!!");
          ensure('escape', {
            text: "!!!23\n123"
          });
          return ensure('j 0 .', {
            text: "!!!23\n!!!23"
          });
        });
        return it("can repeat delete and insert mutation: case-a", function() {
          keystroke('a');
          editor["delete"]();
          editor.insertText("!!!");
          ensure('escape', {
            text: "1!!!3\n123"
          });
          return ensure('j 0 .', {
            text: "1!!!3\n1!!!3"
          });
        });
      });
      return describe("multi-cursors operation", function() {
        beforeEach(function() {
          return set({
            text: "123\n\n1234\n\n12345",
            cursor: [[0, 0], [2, 0], [4, 0]]
          });
        });
        it("can repeat backspace only mutation: case-multi-cursors", function() {
          ensure('A', {
            cursor: [[0, 3], [2, 4], [4, 5]],
            mode: 'insert'
          });
          editor.backspace();
          ensure('escape', {
            text: "12\n\n123\n\n1234",
            cursor: [[0, 1], [2, 2], [4, 3]]
          });
          return ensure('.', {
            text: "1\n\n12\n\n123",
            cursor: [[0, 0], [2, 1], [4, 2]]
          });
        });
        return it("can repeat delete only mutation: case-multi-cursors", function() {
          var cursors;
          ensure('I', {
            mode: 'insert'
          });
          editor["delete"]();
          cursors = [[0, 0], [2, 0], [4, 0]];
          ensure('escape', {
            text: "23\n\n234\n\n2345",
            cursor: cursors
          });
          ensure('.', {
            text: "3\n\n34\n\n345",
            cursor: cursors
          });
          ensure('.', {
            text: "\n\n4\n\n45",
            cursor: cursors
          });
          ensure('.', {
            text: "\n\n\n\n5",
            cursor: cursors
          });
          return ensure('.', {
            text: "\n\n\n\n",
            cursor: cursors
          });
        });
      });
    });
    return describe('specify insertion count', function() {
      var ensureInsertionCount;
      ensureInsertionCount = function(key, _arg) {
        var cursor, insert, text;
        insert = _arg.insert, text = _arg.text, cursor = _arg.cursor;
        keystroke(key);
        editor.insertText(insert);
        return ensure("escape", {
          text: text,
          cursor: cursor
        });
      };
      beforeEach(function() {
        var initialText;
        initialText = "*\n*\n";
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
      return describe("repeat insertion count times", function() {
        it("[case-i]", function() {
          return ensureInsertionCount('3 i', {
            insert: '=',
            text: "===*\n*\n",
            cursor: [0, 2]
          });
        });
        it("[case-o]", function() {
          return ensureInsertionCount('3 o', {
            insert: '=',
            text: "*\n=\n=\n=\n*\n",
            cursor: [3, 0]
          });
        });
        it("[case-O]", function() {
          return ensureInsertionCount('3 O', {
            insert: '=',
            text: "=\n=\n=\n*\n*\n",
            cursor: [2, 0]
          });
        });
        return describe("children of Change operation won't repeate insertion count times", function() {
          beforeEach(function() {
            set({
              text: "",
              cursor: [0, 0]
            });
            keystroke('i');
            editor.insertText('*');
            return ensure('escape g g', {
              text: '*',
              cursor: [0, 0]
            });
          });
          it("[case-c]", function() {
            return ensureInsertionCount('3 c w', {
              insert: '=',
              text: "=",
              cursor: [0, 0]
            });
          });
          it("[case-C]", function() {
            return ensureInsertionCount('3 C', {
              insert: '=',
              text: "=",
              cursor: [0, 0]
            });
          });
          it("[case-s]", function() {
            return ensureInsertionCount('3 s', {
              insert: '=',
              text: "=",
              cursor: [0, 0]
            });
          });
          return it("[case-S]", function() {
            return ensureInsertionCount('3 S', {
              insert: '=',
              text: "=",
              cursor: [0, 0]
            });
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvb3BlcmF0b3ItYWN0aXZhdGUtaW5zZXJ0LW1vZGUtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsOENBQUE7O0FBQUEsRUFBQSxPQUEwQixPQUFBLENBQVEsZUFBUixDQUExQixFQUFDLG1CQUFBLFdBQUQsRUFBYyxnQkFBQSxRQUFkLENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSLENBRFgsQ0FBQTs7QUFBQSxFQUVDLFVBQVcsT0FBQSxDQUFRLE1BQVIsRUFBWCxPQUZELENBQUE7O0FBQUEsRUFJQSxRQUFBLENBQVMsb0NBQVQsRUFBK0MsU0FBQSxHQUFBO0FBQzdDLFFBQUEsOERBQUE7QUFBQSxJQUFBLFFBQTRELEVBQTVELEVBQUMsY0FBRCxFQUFNLGlCQUFOLEVBQWMsb0JBQWQsRUFBeUIsaUJBQXpCLEVBQWlDLHdCQUFqQyxFQUFnRCxtQkFBaEQsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxHQUFSLEdBQUE7QUFDVixRQUFBLFFBQUEsR0FBVyxLQUFYLENBQUE7QUFBQSxRQUNDLGtCQUFBLE1BQUQsRUFBUyx5QkFBQSxhQURULENBQUE7ZUFFQyxVQUFBLEdBQUQsRUFBTSxhQUFBLE1BQU4sRUFBYyxnQkFBQSxTQUFkLEVBQTJCLElBSGpCO01BQUEsQ0FBWixFQURTO0lBQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxJQVFBLFNBQUEsQ0FBVSxTQUFBLEdBQUE7YUFDUixRQUFRLENBQUMsZUFBVCxDQUFBLEVBRFE7SUFBQSxDQUFWLENBUkEsQ0FBQTtBQUFBLElBV0EsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUEsR0FBQTtBQUMzQixNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7ZUFDVCxHQUFBLENBQUk7QUFBQSxVQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsVUFBZ0IsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBeEI7U0FBSixFQURTO01BQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxNQUdBLEVBQUEsQ0FBRywyREFBSCxFQUFnRSxTQUFBLEdBQUE7ZUFDOUQsTUFBQSxDQUFPLEdBQVAsRUFDRTtBQUFBLFVBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxVQUNBLElBQUEsRUFBTSxPQUROO0FBQUEsVUFFQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUZSO0FBQUEsVUFHQSxRQUFBLEVBQVU7QUFBQSxZQUFBLEdBQUEsRUFBSztBQUFBLGNBQUEsSUFBQSxFQUFNLEdBQU47YUFBTDtXQUhWO1NBREYsRUFEOEQ7TUFBQSxDQUFoRSxDQUhBLENBQUE7QUFBQSxNQVVBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLFNBQUEsR0FBQTtBQUNsQixRQUFBLEdBQUEsQ0FBSTtBQUFBLFVBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFKLENBQUEsQ0FBQTtBQUFBLFFBQ0EsU0FBQSxDQUFVLEtBQVYsQ0FEQSxDQUFBO0FBQUEsUUFFQSxNQUFNLENBQUMsVUFBUCxDQUFrQixJQUFsQixDQUZBLENBQUE7QUFBQSxRQUdBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO0FBQUEsVUFBQSxJQUFBLEVBQU0sT0FBTjtTQUFqQixDQUhBLENBQUE7QUFBQSxRQUlBLEdBQUEsQ0FBSTtBQUFBLFVBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFKLENBSkEsQ0FBQTtlQUtBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxVQUFBLElBQUEsRUFBTSxNQUFOO1NBQVosRUFOa0I7TUFBQSxDQUFwQixDQVZBLENBQUE7QUFBQSxNQWtCQSxFQUFBLENBQUcsYUFBSCxFQUFrQixTQUFBLEdBQUE7QUFDaEIsUUFBQSxHQUFBLENBQUk7QUFBQSxVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBSixDQUFBLENBQUE7QUFBQSxRQUNBLFNBQUEsQ0FBVSxLQUFWLENBREEsQ0FBQTtBQUFBLFFBRUEsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsSUFBbEIsQ0FGQSxDQUFBO0FBQUEsUUFHQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtBQUFBLFVBQUEsSUFBQSxFQUFNLE9BQU47U0FBakIsQ0FIQSxDQUFBO2VBSUEsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLFVBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxVQUFnQixZQUFBLEVBQWMsRUFBOUI7U0FBWixFQUxnQjtNQUFBLENBQWxCLENBbEJBLENBQUE7YUF5QkEsUUFBQSxDQUFTLGdCQUFULEVBQTJCLFNBQUEsR0FBQTtBQUN6QixRQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7aUJBQ1QsU0FBQSxDQUFVLE9BQVYsRUFEUztRQUFBLENBQVgsQ0FBQSxDQUFBO2VBR0EsRUFBQSxDQUFHLHdEQUFILEVBQTZELFNBQUEsR0FBQTtpQkFDM0QsTUFBQSxDQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFlBQ0EsSUFBQSxFQUFNLE1BRE47QUFBQSxZQUVBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRlI7QUFBQSxZQUdBLFFBQUEsRUFBVTtBQUFBLGNBQUEsR0FBQSxFQUFLO0FBQUEsZ0JBQUEsSUFBQSxFQUFNLElBQU47ZUFBTDthQUhWO1dBREYsRUFEMkQ7UUFBQSxDQUE3RCxFQUp5QjtNQUFBLENBQTNCLEVBMUIyQjtJQUFBLENBQTdCLENBWEEsQ0FBQTtBQUFBLElBZ0RBLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBLEdBQUE7QUFDM0IsTUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2VBQ1QsR0FBQSxDQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU0scUJBQU47QUFBQSxVQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRFI7U0FERixFQURTO01BQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxNQUtBLEVBQUEsQ0FBRyxnREFBSCxFQUFxRCxTQUFBLEdBQUE7ZUFDbkQsTUFBQSxDQUFPLEdBQVAsRUFDRTtBQUFBLFVBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxVQUNBLElBQUEsRUFBTSxnQkFETjtBQUFBLFVBRUEsUUFBQSxFQUFVO0FBQUEsWUFBQyxHQUFBLEVBQUs7QUFBQSxjQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsY0FBaUIsSUFBQSxFQUFNLFVBQXZCO2FBQU47V0FGVjtTQURGLEVBRG1EO01BQUEsQ0FBckQsQ0FMQSxDQUFBO0FBQUEsTUFXQSxFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBLEdBQUE7QUFDbEIsUUFBQSxTQUFBLENBQVUsR0FBVixDQUFBLENBQUE7QUFBQSxRQUNBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEtBQWxCLENBREEsQ0FBQTtBQUFBLFFBRUEsTUFBQSxDQUFPLFFBQVAsRUFBaUI7QUFBQSxVQUFBLElBQUEsRUFBTSxtQkFBTjtTQUFqQixDQUZBLENBQUE7QUFBQSxRQUdBLEdBQUEsQ0FBSTtBQUFBLFVBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFKLENBSEEsQ0FBQTtlQUlBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxVQUFBLElBQUEsRUFBTSxpQkFBTjtTQUFaLEVBTGtCO01BQUEsQ0FBcEIsQ0FYQSxDQUFBO0FBQUEsTUFrQkEsRUFBQSxDQUFHLGFBQUgsRUFBa0IsU0FBQSxHQUFBO0FBQ2hCLFFBQUEsU0FBQSxDQUFVLEdBQVYsQ0FBQSxDQUFBO0FBQUEsUUFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixLQUFsQixDQURBLENBQUE7QUFBQSxRQUVBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO0FBQUEsVUFBQSxJQUFBLEVBQU0sbUJBQU47U0FBakIsQ0FGQSxDQUFBO2VBR0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLFVBQUEsSUFBQSxFQUFNLHFCQUFOO0FBQUEsVUFBNkIsWUFBQSxFQUFjLEVBQTNDO1NBQVosRUFKZ0I7TUFBQSxDQUFsQixDQWxCQSxDQUFBO0FBQUEsTUFtQ0EsRUFBQSxDQUFHLHdFQUFILEVBQTZFLFNBQUEsR0FBQTtBQUMzRSxRQUFBLEdBQUEsQ0FBSTtBQUFBLFVBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxVQUFpQixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksUUFBSixDQUF6QjtTQUFKLENBQUEsQ0FBQTtlQUlBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxVQUFBLElBQUEsRUFBTSxTQUFOO1NBQWQsRUFMMkU7TUFBQSxDQUE3RSxDQW5DQSxDQUFBO2FBMENBLEdBQUEsQ0FBSSxzQkFBSixFQUE0QixTQUFBLEdBQUEsQ0FBNUIsRUEzQzJCO0lBQUEsQ0FBN0IsQ0FoREEsQ0FBQTtBQUFBLElBNkZBLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBLEdBQUE7QUFDM0IsTUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2VBQ1QsR0FBQSxDQUFJO0FBQUEsVUFBQSxJQUFBLEVBQU0scUJBQU47U0FBSixFQURTO01BQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxNQU9BLFFBQUEsQ0FBUyxzQkFBVCxFQUFpQyxTQUFBLEdBQUE7QUFDL0IsUUFBQSxRQUFBLENBQVMsaUJBQVQsRUFBNEIsU0FBQSxHQUFBO0FBQzFCLFVBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFlBQUEsR0FBQSxDQUFJO0FBQUEsY0FBQSxJQUFBLEVBQU0seUJBQU47YUFBSixDQUFBLENBQUE7QUFBQSxZQUNBLEdBQUEsQ0FBSTtBQUFBLGNBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKLENBREEsQ0FBQTtBQUFBLFlBRUEsS0FBQSxDQUFNLE1BQU4sRUFBYyxrQkFBZCxDQUFpQyxDQUFDLFNBQWxDLENBQTRDLElBQTVDLENBRkEsQ0FBQTtBQUFBLFlBR0EsS0FBQSxDQUFNLE1BQU4sRUFBYyxxQkFBZCxDQUFvQyxDQUFDLFdBQXJDLENBQWlELFNBQUMsSUFBRCxHQUFBO3FCQUMvQyxNQUFNLENBQUMsTUFBUCxDQUFBLEVBRCtDO1lBQUEsQ0FBakQsQ0FIQSxDQUFBO21CQUtBLEtBQUEsQ0FBTSxNQUFNLENBQUMsWUFBYixFQUEyQixtQ0FBM0IsQ0FBK0QsQ0FBQyxXQUFoRSxDQUE0RSxTQUFBLEdBQUE7cUJBQUcsRUFBSDtZQUFBLENBQTVFLEVBTlM7VUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFVBUUEsRUFBQSxDQUFHLGlEQUFILEVBQXNELFNBQUEsR0FBQTtBQUNwRCxZQUFBLEdBQUEsQ0FBSTtBQUFBLGNBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKLENBQUEsQ0FBQTttQkFDQSxNQUFBLENBQU8sS0FBUCxFQUNFO0FBQUEsY0FBQSxJQUFBLEVBQU0sb0JBQU47QUFBQSxjQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRFI7QUFBQSxjQUVBLElBQUEsRUFBTSxRQUZOO2FBREYsRUFGb0Q7VUFBQSxDQUF0RCxDQVJBLENBQUE7QUFBQSxVQWVBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLFNBQUEsR0FBQTtBQUNsQixZQUFBLFNBQUEsQ0FBVSxLQUFWLENBQUEsQ0FBQTtBQUFBLFlBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsS0FBbEIsQ0FEQSxDQUFBO0FBQUEsWUFFQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtBQUFBLGNBQUEsSUFBQSxFQUFNLHVCQUFOO2FBQWpCLENBRkEsQ0FBQTtBQUFBLFlBR0EsR0FBQSxDQUFJO0FBQUEsY0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2FBQUosQ0FIQSxDQUFBO21CQUlBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxjQUFBLElBQUEsRUFBTSx1QkFBTjthQUFaLEVBTGtCO1VBQUEsQ0FBcEIsQ0FmQSxDQUFBO2lCQXNCQSxFQUFBLENBQUcsYUFBSCxFQUFrQixTQUFBLEdBQUE7QUFDaEIsWUFBQSxTQUFBLENBQVUsS0FBVixDQUFBLENBQUE7QUFBQSxZQUNBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEtBQWxCLENBREEsQ0FBQTtBQUFBLFlBRUEsTUFBQSxDQUFPLFFBQVAsRUFBaUI7QUFBQSxjQUFBLElBQUEsRUFBTSx1QkFBTjthQUFqQixDQUZBLENBQUE7bUJBR0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLGNBQUEsSUFBQSxFQUFNLHlCQUFOO0FBQUEsY0FBaUMsWUFBQSxFQUFjLEVBQS9DO2FBQVosRUFKZ0I7VUFBQSxDQUFsQixFQXZCMEI7UUFBQSxDQUE1QixDQUFBLENBQUE7QUFBQSxRQTZCQSxRQUFBLENBQVMscUNBQVQsRUFBZ0QsU0FBQSxHQUFBO2lCQUM5QyxFQUFBLENBQUcsb0VBQUgsRUFBeUUsU0FBQSxHQUFBO0FBQ3ZFLFlBQUEsR0FBQSxDQUFJO0FBQUEsY0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2FBQUosQ0FBQSxDQUFBO21CQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQ0U7QUFBQSxjQUFBLElBQUEsRUFBTSxnQkFBTjtBQUFBLGNBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEUjtBQUFBLGNBRUEsSUFBQSxFQUFNLFFBRk47YUFERixFQUZ1RTtVQUFBLENBQXpFLEVBRDhDO1FBQUEsQ0FBaEQsQ0E3QkEsQ0FBQTtlQXFDQSxRQUFBLENBQVMscUNBQVQsRUFBZ0QsU0FBQSxHQUFBO2lCQUM5QyxFQUFBLENBQUcsbURBQUgsRUFBd0QsU0FBQSxHQUFBO0FBQ3RELFlBQUEsR0FBQSxDQUFJO0FBQUEsY0FBQSxJQUFBLEVBQU0sT0FBTjtBQUFBLGNBQWUsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBdkI7YUFBSixDQUFBLENBQUE7bUJBQ0EsTUFBQSxDQUFPLEtBQVAsRUFDRTtBQUFBLGNBQUEsSUFBQSxFQUFNLEVBQU47QUFBQSxjQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRFI7QUFBQSxjQUVBLElBQUEsRUFBTSxRQUZOO2FBREYsRUFGc0Q7VUFBQSxDQUF4RCxFQUQ4QztRQUFBLENBQWhELEVBdEMrQjtNQUFBLENBQWpDLENBUEEsQ0FBQTtBQUFBLE1BcURBLFFBQUEsQ0FBUyxzQkFBVCxFQUFpQyxTQUFBLEdBQUE7QUFDL0IsUUFBQSxFQUFBLENBQUcsOEJBQUgsRUFBbUMsU0FBQSxHQUFBO0FBQ2pDLFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQUosQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFBLENBQU8sT0FBUCxFQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sZ0JBQU47QUFBQSxZQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRFI7QUFBQSxZQUVBLElBQUEsRUFBTSxRQUZOO1dBREYsQ0FEQSxDQUFBO0FBQUEsVUFPQSxHQUFBLENBQUk7QUFBQSxZQUFBLElBQUEsRUFBTSxrQkFBTjtXQUFKLENBUEEsQ0FBQTtBQUFBLFVBUUEsTUFBQSxDQUFPLFFBQVAsRUFDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLGtCQUFOO0FBQUEsWUFDQSxJQUFBLEVBQU0sUUFETjtXQURGLENBUkEsQ0FBQTtBQUFBLFVBV0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLFlBQUEsSUFBQSxFQUFNLHFCQUFOO1dBQVosQ0FYQSxDQUFBO2lCQVlBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO0FBQUEsWUFBQSxJQUFBLEVBQU0sa0JBQU47V0FBakIsRUFiaUM7UUFBQSxDQUFuQyxDQUFBLENBQUE7ZUFlQSxFQUFBLENBQUcsWUFBSCxFQUFpQixTQUFBLEdBQUE7QUFDZixVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPLE9BQVAsRUFDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLGdCQUFOO0FBQUEsWUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO0FBQUEsWUFFQSxJQUFBLEVBQU0sUUFGTjtXQURGLENBREEsQ0FBQTtpQkFNQSxNQUFBLENBQU8sWUFBUCxFQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sV0FBTjtBQUFBLFlBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEUjtBQUFBLFlBRUEsSUFBQSxFQUFNLFFBRk47V0FERixFQVBlO1FBQUEsQ0FBakIsRUFoQitCO01BQUEsQ0FBakMsQ0FyREEsQ0FBQTtBQUFBLE1BaUZBLFFBQUEsQ0FBUyxzQkFBVCxFQUFpQyxTQUFBLEdBQUE7ZUFDL0IsRUFBQSxDQUFHLGtCQUFILEVBQXVCLFNBQUEsR0FBQTtBQUNyQixVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsSUFBQSxFQUFNLG1CQUFOO0FBQUEsWUFBMkIsWUFBQSxFQUFjLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBekM7V0FBSixDQUFBLENBQUE7aUJBQ0EsTUFBQSxDQUFPLFlBQVAsRUFBcUI7QUFBQSxZQUFBLElBQUEsRUFBTSxlQUFOO1dBQXJCLEVBRnFCO1FBQUEsQ0FBdkIsRUFEK0I7TUFBQSxDQUFqQyxDQWpGQSxDQUFBO0FBQUEsTUFzRkEsUUFBQSxDQUFTLHNCQUFULEVBQWlDLFNBQUEsR0FBQTtBQUMvQixRQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxjQUFBLFlBQUE7QUFBQSxVQUFBLFlBQUEsR0FBZSx1QkFBZixDQUFBO2lCQUNBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsSUFBQSxFQUFNLFlBQU47V0FBSixFQUZTO1FBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxRQUlBLFFBQUEsQ0FBUyxxQ0FBVCxFQUFnRCxTQUFBLEdBQUE7aUJBQzlDLEVBQUEsQ0FBRyw4QkFBSCxFQUFtQyxTQUFBLEdBQUE7QUFDakMsWUFBQSxHQUFBLENBQUk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7YUFBSixDQUFBLENBQUE7bUJBQ0EsTUFBQSxDQUFPLFlBQVAsRUFBcUI7QUFBQSxjQUFBLElBQUEsRUFBTSxXQUFOO2FBQXJCLEVBRmlDO1VBQUEsQ0FBbkMsRUFEOEM7UUFBQSxDQUFoRCxDQUpBLENBQUE7ZUFTQSxRQUFBLENBQVMsa0NBQVQsRUFBNkMsU0FBQSxHQUFBO2lCQUMzQyxFQUFBLENBQUcsOEJBQUgsRUFBbUMsU0FBQSxHQUFBO0FBQ2pDLFlBQUEsR0FBQSxDQUFJO0FBQUEsY0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2FBQUosQ0FBQSxDQUFBO21CQUNBLE1BQUEsQ0FBTyxZQUFQLEVBQXFCO0FBQUEsY0FBQSxJQUFBLEVBQU0sV0FBTjthQUFyQixFQUZpQztVQUFBLENBQW5DLEVBRDJDO1FBQUEsQ0FBN0MsRUFWK0I7TUFBQSxDQUFqQyxDQXRGQSxDQUFBO2FBcUdBLFFBQUEsQ0FBUyxnQ0FBVCxFQUEyQyxTQUFBLEdBQUE7QUFDekMsUUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2lCQUNULEdBQUEsQ0FBSTtBQUFBLFlBQUEsSUFBQSxFQUFNLHFCQUFOO1dBQUosRUFEUztRQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsUUFHQSxRQUFBLENBQVMscUNBQVQsRUFBZ0QsU0FBQSxHQUFBO2lCQUM5QyxFQUFBLENBQUcsa0NBQUgsRUFBdUMsU0FBQSxHQUFBO0FBQ3JDLFlBQUEsR0FBQSxDQUFJO0FBQUEsY0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2FBQUosQ0FBQSxDQUFBO21CQUNBLE1BQUEsQ0FBTyxjQUFQLEVBQXVCO0FBQUEsY0FBQSxJQUFBLEVBQU0sZ0JBQU47YUFBdkIsRUFGcUM7VUFBQSxDQUF2QyxFQUQ4QztRQUFBLENBQWhELENBSEEsQ0FBQTtlQVFBLFFBQUEsQ0FBUyxrQ0FBVCxFQUE2QyxTQUFBLEdBQUE7aUJBQzNDLEVBQUEsQ0FBRyxrQ0FBSCxFQUF1QyxTQUFBLEdBQUE7QUFDckMsWUFBQSxHQUFBLENBQUk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7YUFBSixDQUFBLENBQUE7bUJBQ0EsTUFBQSxDQUFPLGNBQVAsRUFBdUI7QUFBQSxjQUFBLElBQUEsRUFBTSxnQkFBTjthQUF2QixFQUZxQztVQUFBLENBQXZDLEVBRDJDO1FBQUEsQ0FBN0MsRUFUeUM7TUFBQSxDQUEzQyxFQXRHMkI7SUFBQSxDQUE3QixDQTdGQSxDQUFBO0FBQUEsSUFpTkEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUEsR0FBQTtBQUMzQixNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxRQUFBLEdBQUEsQ0FBSTtBQUFBLFVBQUEsSUFBQSxFQUFNLE9BQU47QUFBQSxVQUFlLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQXZCO1NBQUosQ0FBQSxDQUFBO2VBQ0EsU0FBQSxDQUFVLEdBQVYsRUFGUztNQUFBLENBQVgsQ0FBQSxDQUFBO2FBSUEsRUFBQSxDQUFHLHVFQUFILEVBQTRFLFNBQUEsR0FBQTtlQUMxRSxNQUFBLENBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSxLQUFOO0FBQUEsVUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO0FBQUEsVUFFQSxJQUFBLEVBQU0sUUFGTjtTQURGLEVBRDBFO01BQUEsQ0FBNUUsRUFMMkI7SUFBQSxDQUE3QixDQWpOQSxDQUFBO0FBQUEsSUE0TkEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUEsR0FBQTtBQUMzQixNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxRQUFBLEtBQUEsQ0FBTSxNQUFOLEVBQWMsa0JBQWQsQ0FBaUMsQ0FBQyxTQUFsQyxDQUE0QyxJQUE1QyxDQUFBLENBQUE7QUFBQSxRQUNBLEtBQUEsQ0FBTSxNQUFOLEVBQWMscUJBQWQsQ0FBb0MsQ0FBQyxXQUFyQyxDQUFpRCxTQUFDLElBQUQsR0FBQTtpQkFDL0MsTUFBTSxDQUFDLE1BQVAsQ0FBQSxFQUQrQztRQUFBLENBQWpELENBREEsQ0FBQTtlQUlBLEdBQUEsQ0FBSTtBQUFBLFVBQUEsSUFBQSxFQUFNLGdCQUFOO0FBQUEsVUFBd0IsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBaEM7U0FBSixFQUxTO01BQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxNQU9BLEVBQUEsQ0FBRyw2REFBSCxFQUFrRSxTQUFBLEdBQUE7QUFDaEUsUUFBQSxTQUFBLENBQVUsR0FBVixDQUFBLENBQUE7ZUFDQSxNQUFBLENBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSxvQkFBTjtBQUFBLFVBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEUjtBQUFBLFVBRUEsSUFBQSxFQUFNLFFBRk47U0FERixFQUZnRTtNQUFBLENBQWxFLENBUEEsQ0FBQTtBQUFBLE1BY0EsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQSxHQUFBO0FBQ2xCLFFBQUEsR0FBQSxDQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU0sNkJBQU47QUFBQSxVQUFxQyxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUE3QztTQURGLENBQUEsQ0FBQTtBQUFBLFFBRUEsU0FBQSxDQUFVLEdBQVYsQ0FGQSxDQUFBO0FBQUEsUUFHQSxNQUFNLENBQUMsVUFBUCxDQUFrQixLQUFsQixDQUhBLENBQUE7QUFBQSxRQUlBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO0FBQUEsVUFBQSxJQUFBLEVBQU0sb0NBQU47U0FBakIsQ0FKQSxDQUFBO0FBQUEsUUFLQSxHQUFBLENBQUk7QUFBQSxVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBSixDQUxBLENBQUE7QUFBQSxRQU1BLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxVQUFBLElBQUEsRUFBTSwyQ0FBTjtTQUFaLENBTkEsQ0FBQTtBQUFBLFFBT0EsR0FBQSxDQUFJO0FBQUEsVUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQUosQ0FQQSxDQUFBO2VBUUEsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLFVBQUEsSUFBQSxFQUFNLG9EQUFOO1NBQVosRUFUa0I7TUFBQSxDQUFwQixDQWRBLENBQUE7YUF5QkEsRUFBQSxDQUFHLGFBQUgsRUFBa0IsU0FBQSxHQUFBO0FBQ2hCLFFBQUEsU0FBQSxDQUFVLEdBQVYsQ0FBQSxDQUFBO0FBQUEsUUFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixLQUFsQixDQURBLENBQUE7QUFBQSxRQUVBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO0FBQUEsVUFBQSxJQUFBLEVBQU0sdUJBQU47U0FBakIsQ0FGQSxDQUFBO2VBR0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLFVBQUEsSUFBQSxFQUFNLGdCQUFOO1NBQVosRUFKZ0I7TUFBQSxDQUFsQixFQTFCMkI7SUFBQSxDQUE3QixDQTVOQSxDQUFBO0FBQUEsSUE0UEEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUEsR0FBQTtBQUMzQixNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxRQUFBLEtBQUEsQ0FBTSxNQUFOLEVBQWMsa0JBQWQsQ0FBaUMsQ0FBQyxTQUFsQyxDQUE0QyxJQUE1QyxDQUFBLENBQUE7QUFBQSxRQUNBLEtBQUEsQ0FBTSxNQUFOLEVBQWMscUJBQWQsQ0FBb0MsQ0FBQyxXQUFyQyxDQUFpRCxTQUFDLElBQUQsR0FBQTtpQkFDL0MsTUFBTSxDQUFDLE1BQVAsQ0FBQSxFQUQrQztRQUFBLENBQWpELENBREEsQ0FBQTtlQUlBLEdBQUEsQ0FBSTtBQUFBLFVBQUEsSUFBQSxFQUFNLGNBQU47QUFBQSxVQUFzQixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUE5QjtTQUFKLEVBTFM7TUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLE1BT0EsRUFBQSxDQUFHLDZEQUFILEVBQWtFLFNBQUEsR0FBQTtlQUNoRSxNQUFBLENBQU8sR0FBUCxFQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU0sa0JBQU47QUFBQSxVQUNBLElBQUEsRUFBTSxRQUROO0FBQUEsVUFFQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUZSO1NBREYsRUFEZ0U7TUFBQSxDQUFsRSxDQVBBLENBQUE7QUFBQSxNQWdCQSxHQUFBLENBQUksZUFBSixFQUFxQixTQUFBLEdBQUE7QUFDbkIsUUFBQSxHQUFBLENBQUk7QUFBQSxVQUFBLElBQUEsRUFBTSw2QkFBTjtBQUFBLFVBQXFDLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQTdDO1NBQUosQ0FBQSxDQUFBO0FBQUEsUUFDQSxTQUFBLENBQVUsR0FBVixDQURBLENBQUE7QUFBQSxRQUVBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEtBQWxCLENBRkEsQ0FBQTtBQUFBLFFBR0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7QUFBQSxVQUFBLElBQUEsRUFBTSxvQ0FBTjtTQUFqQixDQUhBLENBQUE7QUFBQSxRQUlBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxVQUFBLElBQUEsRUFBTSwyQ0FBTjtTQUFaLENBSkEsQ0FBQTtBQUFBLFFBS0EsR0FBQSxDQUFJO0FBQUEsVUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQUosQ0FMQSxDQUFBO2VBTUEsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLFVBQUEsSUFBQSxFQUFNLG9EQUFOO1NBQVosRUFQbUI7TUFBQSxDQUFyQixDQWhCQSxDQUFBO2FBeUJBLEVBQUEsQ0FBRyxhQUFILEVBQWtCLFNBQUEsR0FBQTtBQUNoQixRQUFBLFNBQUEsQ0FBVSxHQUFWLENBQUEsQ0FBQTtBQUFBLFFBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsS0FBbEIsQ0FEQSxDQUFBO0FBQUEsUUFFQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtBQUFBLFVBQUEsSUFBQSxFQUFNLHFCQUFOO1NBQWpCLENBRkEsQ0FBQTtlQUdBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxVQUFBLElBQUEsRUFBTSxjQUFOO1NBQVosRUFKZ0I7TUFBQSxDQUFsQixFQTFCMkI7SUFBQSxDQUE3QixDQTVQQSxDQUFBO0FBQUEsSUE0UkEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUEsR0FBQTtBQUMzQixNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7ZUFDVCxHQUFBLENBQUk7QUFBQSxVQUFBLElBQUEsRUFBTSxPQUFOO1NBQUosRUFEUztNQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsTUFHQSxRQUFBLENBQVMsOEJBQVQsRUFBeUMsU0FBQSxHQUFBO0FBQ3ZDLFFBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQUosQ0FBQSxDQUFBO2lCQUNBLFNBQUEsQ0FBVSxHQUFWLEVBRlM7UUFBQSxDQUFYLENBQUEsQ0FBQTtlQUlBLEVBQUEsQ0FBRyxpREFBSCxFQUFzRCxTQUFBLEdBQUE7aUJBQ3BELE1BQUEsQ0FBTztBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtBQUFBLFlBQWdCLElBQUEsRUFBTSxRQUF0QjtXQUFQLEVBRG9EO1FBQUEsQ0FBdEQsRUFMdUM7TUFBQSxDQUF6QyxDQUhBLENBQUE7YUFXQSxRQUFBLENBQVMsd0JBQVQsRUFBbUMsU0FBQSxHQUFBO0FBQ2pDLFFBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQUosQ0FBQSxDQUFBO2lCQUNBLFNBQUEsQ0FBVSxHQUFWLEVBRlM7UUFBQSxDQUFYLENBQUEsQ0FBQTtlQUlBLEVBQUEsQ0FBRyxrQkFBSCxFQUF1QixTQUFBLEdBQUE7aUJBQ3JCLE1BQUEsQ0FBTztBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFQLEVBRHFCO1FBQUEsQ0FBdkIsRUFMaUM7TUFBQSxDQUFuQyxFQVoyQjtJQUFBLENBQTdCLENBNVJBLENBQUE7QUFBQSxJQWdUQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQSxHQUFBO0FBQzNCLE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtlQUNULEdBQUEsQ0FBSTtBQUFBLFVBQUEsSUFBQSxFQUFNLFVBQU47U0FBSixFQURTO01BQUEsQ0FBWCxDQUFBLENBQUE7YUFHQSxRQUFBLENBQVMsNEJBQVQsRUFBdUMsU0FBQSxHQUFBO0FBQ3JDLFFBQUEsRUFBQSxDQUFHLGdEQUFILEVBQXFELFNBQUEsR0FBQTtBQUNuRCxVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKLENBQUEsQ0FBQTtpQkFDQSxNQUFBLENBQU8sR0FBUCxFQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFlBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEUjtXQURGLEVBRm1EO1FBQUEsQ0FBckQsQ0FBQSxDQUFBO2VBTUEsRUFBQSxDQUFHLGlEQUFILEVBQXNELFNBQUEsR0FBQTtBQUNwRCxVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKLENBQUEsQ0FBQTtBQUFBLFVBQ0EsU0FBQSxDQUFVLEdBQVYsQ0FEQSxDQUFBO0FBQUEsVUFFQSxNQUFNLENBQUMsVUFBUCxDQUFrQixLQUFsQixDQUZBLENBQUE7QUFBQSxVQUdBLFNBQUEsQ0FBVSxRQUFWLENBSEEsQ0FBQTtBQUFBLFVBSUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQUosQ0FKQSxDQUFBO2lCQU1BLE1BQUEsQ0FBTyxHQUFQLEVBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSxnQkFBTjtBQUFBLFlBQ0EsSUFBQSxFQUFNLFFBRE47QUFBQSxZQUVBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRlI7V0FERixFQVBvRDtRQUFBLENBQXRELEVBUHFDO01BQUEsQ0FBdkMsRUFKMkI7SUFBQSxDQUE3QixDQWhUQSxDQUFBO0FBQUEsSUF1VUEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUEsR0FBQTtBQUMzQixNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7ZUFDVCxHQUFBLENBQUk7QUFBQSxVQUFBLElBQUEsRUFBTSxZQUFOO1NBQUosRUFEUztNQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsTUFHQSxRQUFBLENBQVMsc0JBQVQsRUFBaUMsU0FBQSxHQUFBO0FBQy9CLFFBQUEsRUFBQSxDQUFHLHNEQUFILEVBQTJELFNBQUEsR0FBQTtBQUN6RCxVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKLENBQUEsQ0FBQTtpQkFDQSxNQUFBLENBQU8sR0FBUCxFQUNFO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO0FBQUEsWUFDQSxJQUFBLEVBQU0sUUFETjtXQURGLEVBRnlEO1FBQUEsQ0FBM0QsQ0FBQSxDQUFBO0FBQUEsUUFNQSxFQUFBLENBQUcsa0RBQUgsRUFBdUQsU0FBQSxHQUFBO0FBQ3JELFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQUosQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQ0U7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7QUFBQSxZQUNBLElBQUEsRUFBTSxRQUROO1dBREYsRUFGcUQ7UUFBQSxDQUF2RCxDQU5BLENBQUE7ZUFZQSxFQUFBLENBQUcsNkRBQUgsRUFBa0UsU0FBQSxHQUFBO0FBQ2hFLFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQUosQ0FBQSxDQUFBO0FBQUEsVUFDQSxTQUFBLENBQVUsR0FBVixDQURBLENBQUE7QUFBQSxVQUVBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEtBQWxCLENBRkEsQ0FBQTtBQUFBLFVBR0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7V0FBakIsQ0FIQSxDQUFBO0FBQUEsVUFJQSxHQUFBLENBQUk7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7V0FBSixDQUpBLENBQUE7aUJBS0EsTUFBQSxDQUFPLEdBQVAsRUFDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLGtCQUFOO0FBQUEsWUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO0FBQUEsWUFFQSxJQUFBLEVBQU0sUUFGTjtXQURGLEVBTmdFO1FBQUEsQ0FBbEUsRUFiK0I7TUFBQSxDQUFqQyxDQUhBLENBQUE7QUFBQSxNQTJCQSxRQUFBLENBQVMsOEJBQVQsRUFBeUMsU0FBQSxHQUFBO0FBQ3ZDLFFBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtpQkFDVCxHQUFBLENBQUk7QUFBQSxZQUFBLElBQUEsRUFBTSxhQUFOO1dBQUosRUFEUztRQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsUUFHQSxRQUFBLENBQVMsMkJBQVQsRUFBc0MsU0FBQSxHQUFBO0FBQ3BDLFVBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFlBQUEsR0FBQSxDQUFJO0FBQUEsY0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2FBQUosQ0FBQSxDQUFBO21CQUNBLE1BQUEsQ0FBTyxPQUFQLEVBQWdCO0FBQUEsY0FBQSxZQUFBLEVBQWMsS0FBZDtBQUFBLGNBQXFCLG1CQUFBLEVBQXFCLEtBQTFDO2FBQWhCLEVBRlM7VUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFVBSUEsRUFBQSxDQUFHLDhCQUFILEVBQW1DLFNBQUEsR0FBQTttQkFDakMsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLGNBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtBQUFBLGNBQWdCLElBQUEsRUFBTSxRQUF0QjthQUFaLEVBRGlDO1VBQUEsQ0FBbkMsQ0FKQSxDQUFBO2lCQU1BLEVBQUEsQ0FBRyw0QkFBSCxFQUFpQyxTQUFBLEdBQUE7bUJBQy9CLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7QUFBQSxjQUFnQixJQUFBLEVBQU0sUUFBdEI7YUFBWixFQUQrQjtVQUFBLENBQWpDLEVBUG9DO1FBQUEsQ0FBdEMsQ0FIQSxDQUFBO2VBYUEsUUFBQSxDQUFTLHVCQUFULEVBQWtDLFNBQUEsR0FBQTtBQUNoQyxVQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxZQUFBLEdBQUEsQ0FBSTtBQUFBLGNBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKLENBQUEsQ0FBQTttQkFDQSxNQUFBLENBQU8sT0FBUCxFQUFnQjtBQUFBLGNBQUEsWUFBQSxFQUFjLEtBQWQ7QUFBQSxjQUFxQixtQkFBQSxFQUFxQixJQUExQzthQUFoQixFQUZTO1VBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxVQUlBLEVBQUEsQ0FBRyw4QkFBSCxFQUFtQyxTQUFBLEdBQUE7bUJBQ2pDLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7QUFBQSxjQUFnQixJQUFBLEVBQU0sUUFBdEI7YUFBWixFQURpQztVQUFBLENBQW5DLENBSkEsQ0FBQTtpQkFNQSxFQUFBLENBQUcsNEJBQUgsRUFBaUMsU0FBQSxHQUFBO21CQUMvQixNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsY0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO0FBQUEsY0FBZ0IsSUFBQSxFQUFNLFFBQXRCO2FBQVosRUFEK0I7VUFBQSxDQUFqQyxFQVBnQztRQUFBLENBQWxDLEVBZHVDO01BQUEsQ0FBekMsQ0EzQkEsQ0FBQTthQW1EQSxRQUFBLENBQVMseUJBQVQsRUFBb0MsU0FBQSxHQUFBO0FBQ2xDLFFBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtpQkFDVCxHQUFBLENBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSxvREFBTjtXQURGLEVBRFM7UUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFFBUUEsUUFBQSxDQUFTLDJCQUFULEVBQXNDLFNBQUEsR0FBQTtBQUNwQyxVQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxZQUFBLEdBQUEsQ0FBSTtBQUFBLGNBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKLENBQUEsQ0FBQTttQkFDQSxNQUFBLENBQU8sS0FBUCxFQUFjO0FBQUEsY0FBQSxZQUFBLEVBQWMsNEJBQWQ7QUFBQSxjQUE0QyxtQkFBQSxFQUFxQixLQUFqRTthQUFkLEVBRlM7VUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFVBSUEsRUFBQSxDQUFHLDhCQUFILEVBQW1DLFNBQUEsR0FBQTttQkFDakMsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLGNBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtBQUFBLGNBQWdCLElBQUEsRUFBTSxRQUF0QjthQUFaLEVBRGlDO1VBQUEsQ0FBbkMsQ0FKQSxDQUFBO2lCQU1BLEVBQUEsQ0FBRyw0QkFBSCxFQUFpQyxTQUFBLEdBQUE7bUJBQy9CLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7QUFBQSxjQUFnQixJQUFBLEVBQU0sUUFBdEI7YUFBWixFQUQrQjtVQUFBLENBQWpDLEVBUG9DO1FBQUEsQ0FBdEMsQ0FSQSxDQUFBO2VBa0JBLFFBQUEsQ0FBUyx1QkFBVCxFQUFrQyxTQUFBLEdBQUE7QUFDaEMsVUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsWUFBQSxHQUFBLENBQUk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7YUFBSixDQUFBLENBQUE7bUJBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLGNBQUEsWUFBQSxFQUFjLDRCQUFkO0FBQUEsY0FBNEMsbUJBQUEsRUFBcUIsSUFBakU7YUFBZCxFQUZTO1VBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxVQUlBLEVBQUEsQ0FBRyw4QkFBSCxFQUFtQyxTQUFBLEdBQUE7bUJBQ2pDLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7QUFBQSxjQUFnQixJQUFBLEVBQU0sUUFBdEI7YUFBWixFQURpQztVQUFBLENBQW5DLENBSkEsQ0FBQTtpQkFNQSxFQUFBLENBQUcsNEJBQUgsRUFBaUMsU0FBQSxHQUFBO21CQUMvQixNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsY0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO0FBQUEsY0FBZ0IsSUFBQSxFQUFNLFFBQXRCO2FBQVosRUFEK0I7VUFBQSxDQUFqQyxFQVBnQztRQUFBLENBQWxDLEVBbkJrQztNQUFBLENBQXBDLEVBcEQyQjtJQUFBLENBQTdCLENBdlVBLENBQUE7QUFBQSxJQXdaQSxRQUFBLENBQVMsb0NBQVQsRUFBK0MsU0FBQSxHQUFBO0FBQzdDLE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLHdCQUE5QixFQURjO1FBQUEsQ0FBaEIsQ0FBQSxDQUFBO0FBQUEsUUFFQSxXQUFBLENBQVksZUFBWixFQUE2QixTQUFDLEtBQUQsRUFBUSxHQUFSLEdBQUE7QUFDM0IsVUFBQyxlQUFBLE1BQUQsRUFBUyxzQkFBQSxhQUFULENBQUE7aUJBQ0MsVUFBQSxHQUFELEVBQU0sYUFBQSxNQUFOLEVBQWMsZ0JBQUEsU0FBZCxFQUEyQixJQUZBO1FBQUEsQ0FBN0IsQ0FGQSxDQUFBO2VBTUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtpQkFDSCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQWIsQ0FBaUIsTUFBakIsRUFDRTtBQUFBLFlBQUEsNENBQUEsRUFDRTtBQUFBLGNBQUEsS0FBQSxFQUFPLDZDQUFQO0FBQUEsY0FDQSxLQUFBLEVBQU8seUNBRFA7YUFERjtXQURGLEVBREc7UUFBQSxDQUFMLEVBUFM7TUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLE1BYUEsU0FBQSxDQUFVLFNBQUEsR0FBQTtlQUNSLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWQsQ0FBZ0Msd0JBQWhDLEVBRFE7TUFBQSxDQUFWLENBYkEsQ0FBQTtBQUFBLE1BZ0JBLFFBQUEsQ0FBUyxzQ0FBVCxFQUFpRCxTQUFBLEdBQUE7QUFDL0MsUUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2lCQUNULEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsRUFBRCxFQUFLLENBQUwsQ0FBUjtXQUFKLEVBRFM7UUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFFBRUEsRUFBQSxDQUFHLG1DQUFILEVBQXdDLFNBQUEsR0FBQTtpQkFDdEMsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtBQUFBLFlBQWdCLElBQUEsRUFBTSxRQUF0QjtXQUFkLEVBRHNDO1FBQUEsQ0FBeEMsQ0FGQSxDQUFBO2VBSUEsRUFBQSxDQUFHLCtCQUFILEVBQW9DLFNBQUEsR0FBQTtpQkFDbEMsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsRUFBRCxFQUFLLENBQUwsQ0FBUjtBQUFBLFlBQWlCLElBQUEsRUFBTSxRQUF2QjtXQUFkLEVBRGtDO1FBQUEsQ0FBcEMsRUFMK0M7TUFBQSxDQUFqRCxDQWhCQSxDQUFBO2FBd0JBLFFBQUEsQ0FBUyxrQ0FBVCxFQUE2QyxTQUFBLEdBQUE7QUFHM0MsUUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2lCQUNULEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsRUFBRCxFQUFLLENBQUwsQ0FBUjtXQUFKLEVBRFM7UUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFFBRUEsRUFBQSxDQUFHLG1DQUFILEVBQXdDLFNBQUEsR0FBQTtpQkFDdEMsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsRUFBRCxFQUFLLENBQUwsQ0FBUjtBQUFBLFlBQWlCLElBQUEsRUFBTSxRQUF2QjtXQUFkLEVBRHNDO1FBQUEsQ0FBeEMsQ0FGQSxDQUFBO2VBSUEsRUFBQSxDQUFHLCtCQUFILEVBQW9DLFNBQUEsR0FBQTtpQkFDbEMsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsRUFBRCxFQUFLLENBQUwsQ0FBUjtBQUFBLFlBQWlCLElBQUEsRUFBTSxRQUF2QjtXQUFkLEVBRGtDO1FBQUEsQ0FBcEMsRUFQMkM7TUFBQSxDQUE3QyxFQXpCNkM7SUFBQSxDQUEvQyxDQXhaQSxDQUFBO0FBQUEsSUEyYkEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUEsR0FBQTtBQUMzQixNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7ZUFDVCxHQUFBLENBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSxXQUFOO0FBQUEsVUFJQSxZQUFBLEVBQWMsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVQsQ0FKZDtTQURGLEVBRFM7TUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLE1BUUEsRUFBQSxDQUFHLDBDQUFILEVBQStDLFNBQUEsR0FBQTtBQUM3QyxRQUFBLFNBQUEsQ0FBVSxHQUFWLENBQUEsQ0FBQTtBQUFBLFFBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsT0FBbEIsQ0FEQSxDQUFBO0FBQUEsUUFFQSxNQUFNLENBQUMsU0FBUCxDQUFBLENBRkEsQ0FBQTtBQUFBLFFBR0EsTUFBTSxDQUFDLFNBQVAsQ0FBQSxDQUhBLENBQUE7QUFBQSxRQUlBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO0FBQUEsVUFBQSxJQUFBLEVBQU0saUJBQU47U0FBakIsQ0FKQSxDQUFBO0FBQUEsUUFNQSxTQUFBLENBQVUsR0FBVixDQU5BLENBQUE7QUFBQSxRQU9BLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEdBQWxCLENBUEEsQ0FBQTtBQUFBLFFBUUEsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsR0FBbEIsQ0FSQSxDQUFBO0FBQUEsUUFTQSxNQUFNLENBQUMsVUFBUCxDQUFrQixHQUFsQixDQVRBLENBQUE7QUFBQSxRQVVBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO0FBQUEsVUFBQSxJQUFBLEVBQU0sdUJBQU47U0FBakIsQ0FWQSxDQUFBO0FBQUEsUUFXQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsVUFBQSxJQUFBLEVBQU0saUJBQU47U0FBWixDQVhBLENBQUE7ZUFZQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsVUFBQSxJQUFBLEVBQU0sV0FBTjtTQUFaLEVBYjZDO01BQUEsQ0FBL0MsQ0FSQSxDQUFBO0FBQUEsTUF1QkEsRUFBQSxDQUFHLHlCQUFILEVBQThCLFNBQUEsR0FBQTtBQUM1QixRQUFBLFNBQUEsQ0FBVSxHQUFWLENBQUEsQ0FBQTtBQUFBLFFBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsT0FBbEIsQ0FEQSxDQUFBO0FBQUEsUUFFQSxNQUFNLENBQUMsU0FBUCxDQUFBLENBRkEsQ0FBQTtBQUFBLFFBR0EsTUFBTSxDQUFDLFNBQVAsQ0FBQSxDQUhBLENBQUE7QUFBQSxRQUlBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO0FBQUEsVUFBQSxJQUFBLEVBQU0saUJBQU47U0FBakIsQ0FKQSxDQUFBO0FBQUEsUUFLQSxNQUFBLENBQU8sR0FBUCxFQUFpQjtBQUFBLFVBQUEsSUFBQSxFQUFNLHVCQUFOO1NBQWpCLENBTEEsQ0FBQTtlQU1BLE1BQUEsQ0FBTyxHQUFQLEVBQWlCO0FBQUEsVUFBQSxJQUFBLEVBQU0sNkJBQU47U0FBakIsRUFQNEI7TUFBQSxDQUE5QixDQXZCQSxDQUFBO2FBZ0NBLFFBQUEsQ0FBUyxzQkFBVCxFQUFpQyxTQUFBLEdBQUE7QUFDL0IsUUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2lCQUNULEdBQUEsQ0FBSTtBQUFBLFlBQUEsSUFBQSxFQUFNLEVBQU47QUFBQSxZQUFVLFlBQUEsRUFBYyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQXhCO1dBQUosRUFEUztRQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsUUFHQSxFQUFBLENBQUcsa0NBQUgsRUFBdUMsU0FBQSxHQUFBO0FBQ3JDLFVBQUEsU0FBQSxDQUFVLEdBQVYsQ0FBQSxDQUFBO0FBQUEsVUFHQSxNQUFNLENBQUMsVUFBUCxDQUFrQixJQUFsQixDQUhBLENBQUE7QUFBQSxVQUlBLE1BQU0sQ0FBQyxRQUFQLENBQUEsQ0FKQSxDQUFBO0FBQUEsVUFLQSxNQUFNLENBQUMsVUFBUCxDQUFrQixHQUFsQixDQUxBLENBQUE7QUFBQSxVQU1BLE1BQU0sQ0FBQyxTQUFQLENBQUEsQ0FOQSxDQUFBO0FBQUEsVUFPQSxNQUFNLENBQUMsVUFBUCxDQUFrQixLQUFsQixDQVBBLENBQUE7QUFBQSxVQVFBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUssQ0FBTCxDQUFSO1dBQWpCLENBUkEsQ0FBQTtpQkFTQSxNQUFBLENBQU8sR0FBUCxFQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sY0FBTjtBQUFBLFlBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFLLENBQUwsQ0FEUjtXQURGLEVBVnFDO1FBQUEsQ0FBdkMsQ0FIQSxDQUFBO2VBaUJBLEVBQUEsQ0FBRyx5QkFBSCxFQUE4QixTQUFBLEdBQUE7QUFDNUIsVUFBQSxTQUFBLENBQVUsR0FBVixDQUFBLENBQUE7QUFBQSxVQUVBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEdBQWxCLENBRkEsQ0FBQTtBQUFBLFVBR0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsR0FBbEIsQ0FIQSxDQUFBO0FBQUEsVUFJQSxNQUFNLENBQUMsVUFBUCxDQUFrQixHQUFsQixDQUpBLENBQUE7QUFBQSxVQUtBLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBRCxFQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBVCxDQUE1QixFQUE4QyxRQUE5QyxDQUxBLENBQUE7QUFBQSxVQU1BLE1BQUEsQ0FBTyxRQUFQLEVBQ0U7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSyxDQUFMLENBQVI7QUFBQSxZQUNBLElBQUEsRUFBTSxRQUROO1dBREYsQ0FOQSxDQUFBO2lCQVNBLE1BQUEsQ0FBTyxHQUFQLEVBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSxjQUFOO0FBQUEsWUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUssRUFBTCxDQURSO1dBREYsRUFWNEI7UUFBQSxDQUE5QixFQWxCK0I7TUFBQSxDQUFqQyxFQWpDMkI7SUFBQSxDQUE3QixDQTNiQSxDQUFBO0FBQUEsSUE0ZkEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUEsR0FBQTtBQUMzQixNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7ZUFDVCxHQUFBLENBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSxFQUFOO0FBQUEsVUFDQSxZQUFBLEVBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURkO1NBREYsRUFEUztNQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsTUFLQSxFQUFBLENBQUcseUJBQUgsRUFBOEIsU0FBQSxHQUFBO0FBQzVCLFFBQUEsU0FBQSxDQUFVLEdBQVYsQ0FBQSxDQUFBO0FBQUEsUUFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixLQUFsQixDQURBLENBQUE7QUFBQSxRQUVBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO0FBQUEsVUFBQSxJQUFBLEVBQU0sS0FBTjtTQUFqQixDQUZBLENBQUE7ZUFHQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsVUFBQSxJQUFBLEVBQU0sRUFBTjtTQUFaLEVBSjRCO01BQUEsQ0FBOUIsQ0FMQSxDQUFBO2FBV0EsRUFBQSxDQUFHLG1CQUFILEVBQXdCLFNBQUEsR0FBQTtBQUN0QixRQUFBLFNBQUEsQ0FBVSxHQUFWLENBQUEsQ0FBQTtBQUFBLFFBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsS0FBbEIsQ0FEQSxDQUFBO0FBQUEsUUFFQSxNQUFBLENBQU8sUUFBUCxFQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU0sS0FBTjtBQUFBLFVBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEUjtTQURGLENBRkEsQ0FBQTtlQUtBLE1BQUEsQ0FBTyxHQUFQLEVBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsVUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO1NBREYsRUFOc0I7TUFBQSxDQUF4QixFQVoyQjtJQUFBLENBQTdCLENBNWZBLENBQUE7QUFBQSxJQWtoQkEsUUFBQSxDQUFTLHdCQUFULEVBQW1DLFNBQUEsR0FBQTtBQUNqQyxNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7ZUFDVCxHQUFBLENBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSxNQUFOO0FBQUEsVUFDQSxZQUFBLEVBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURkO1NBREYsRUFEUztNQUFBLENBQVgsQ0FBQSxDQUFBO2FBS0EsUUFBQSxDQUFTLG9DQUFULEVBQStDLFNBQUEsR0FBQTtBQUM3QyxZQUFBLGlCQUFBO0FBQUEsUUFBQSxpQkFBQSxHQUFvQixTQUFDLEdBQUQsRUFBTSxJQUFOLEdBQUE7QUFDbEIsY0FBQSxJQUFBO0FBQUEsVUFEeUIsT0FBRCxLQUFDLElBQ3pCLENBQUE7QUFBQSxVQUFBLFNBQUEsQ0FBVSxHQUFWLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsSUFBbEIsQ0FEQSxDQUFBO2lCQUVBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO0FBQUEsWUFBQSxRQUFBLEVBQVU7QUFBQSxjQUFBLEdBQUEsRUFBSztBQUFBLGdCQUFBLElBQUEsRUFBTSxJQUFOO2VBQUw7YUFBVjtXQUFqQixFQUhrQjtRQUFBLENBQXBCLENBQUE7QUFBQSxRQUlBLEVBQUEsQ0FBRyxVQUFILEVBQWUsU0FBQSxHQUFBO2lCQUFHLGlCQUFBLENBQWtCLEdBQWxCLEVBQXVCO0FBQUEsWUFBQSxJQUFBLEVBQU0sS0FBTjtXQUF2QixFQUFIO1FBQUEsQ0FBZixDQUpBLENBQUE7QUFBQSxRQUtBLEVBQUEsQ0FBRyxVQUFILEVBQWUsU0FBQSxHQUFBO2lCQUFHLGlCQUFBLENBQWtCLEdBQWxCLEVBQXVCO0FBQUEsWUFBQSxJQUFBLEVBQU0sS0FBTjtXQUF2QixFQUFIO1FBQUEsQ0FBZixDQUxBLENBQUE7QUFBQSxRQU1BLEVBQUEsQ0FBRyxVQUFILEVBQWUsU0FBQSxHQUFBO2lCQUFHLGlCQUFBLENBQWtCLEdBQWxCLEVBQXVCO0FBQUEsWUFBQSxJQUFBLEVBQU0sS0FBTjtXQUF2QixFQUFIO1FBQUEsQ0FBZixDQU5BLENBQUE7QUFBQSxRQU9BLEVBQUEsQ0FBRyxVQUFILEVBQWUsU0FBQSxHQUFBO2lCQUFHLGlCQUFBLENBQWtCLEdBQWxCLEVBQXVCO0FBQUEsWUFBQSxJQUFBLEVBQU0sS0FBTjtXQUF2QixFQUFIO1FBQUEsQ0FBZixDQVBBLENBQUE7ZUFRQSxFQUFBLENBQUcsVUFBSCxFQUFlLFNBQUEsR0FBQTtpQkFBRyxpQkFBQSxDQUFrQixHQUFsQixFQUF1QjtBQUFBLFlBQUEsSUFBQSxFQUFNLEtBQU47V0FBdkIsRUFBSDtRQUFBLENBQWYsRUFUNkM7TUFBQSxDQUEvQyxFQU5pQztJQUFBLENBQW5DLENBbGhCQSxDQUFBO0FBQUEsSUFtaUJBLFFBQUEsQ0FBUyxpREFBVCxFQUE0RCxTQUFBLEdBQUE7QUFDMUQsTUFBQSxRQUFBLENBQVMseUJBQVQsRUFBb0MsU0FBQSxHQUFBO0FBQ2xDLFFBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtpQkFDVCxHQUFBLENBQ0U7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7QUFBQSxZQUNBLElBQUEsRUFBTSxVQUROO1dBREYsRUFEUztRQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsUUFRQSxFQUFBLENBQUcsNENBQUgsRUFBaUQsU0FBQSxHQUFBO0FBQy9DLFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQUosQ0FBQSxDQUFBO0FBQUEsVUFDQSxTQUFBLENBQVUsR0FBVixDQURBLENBQUE7QUFBQSxVQUVBLE1BQU0sQ0FBQyxTQUFQLENBQUEsQ0FGQSxDQUFBO0FBQUEsVUFHQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtBQUFBLFlBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxZQUFpQixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUF6QjtXQUFqQixDQUhBLENBQUE7QUFBQSxVQUlBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxZQUFBLElBQUEsRUFBTSxTQUFOO1dBQWQsQ0FKQSxDQUFBO2lCQUtBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxZQUFBLElBQUEsRUFBTSxRQUFOO1dBQWQsRUFOK0M7UUFBQSxDQUFqRCxDQVJBLENBQUE7QUFBQSxRQWdCQSxFQUFBLENBQUcsNENBQUgsRUFBaUQsU0FBQSxHQUFBO0FBQy9DLFVBQUEsU0FBQSxDQUFVLEdBQVYsQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFNLENBQUMsU0FBUCxDQUFBLENBREEsQ0FBQTtBQUFBLFVBRUEsTUFBQSxDQUFPLFFBQVAsRUFBaUI7QUFBQSxZQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsWUFBaUIsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBekI7V0FBakIsQ0FGQSxDQUFBO0FBQUEsVUFHQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsWUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFlBQWdCLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQXhCO1dBQVosQ0FIQSxDQUFBO2lCQUlBLE1BQUEsQ0FBTyxPQUFQLEVBQWdCO0FBQUEsWUFBQSxJQUFBLEVBQU0sTUFBTjtXQUFoQixFQUwrQztRQUFBLENBQWpELENBaEJBLENBQUE7QUFBQSxRQXVCQSxFQUFBLENBQUcseUNBQUgsRUFBOEMsU0FBQSxHQUFBO0FBQzVDLFVBQUEsU0FBQSxDQUFVLEdBQVYsQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFNLENBQUMsUUFBRCxDQUFOLENBQUEsQ0FEQSxDQUFBO0FBQUEsVUFFQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtBQUFBLFlBQUEsSUFBQSxFQUFNLFNBQU47V0FBakIsQ0FGQSxDQUFBO2lCQUdBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxZQUFBLElBQUEsRUFBTSxRQUFOO1dBQWQsRUFKNEM7UUFBQSxDQUE5QyxDQXZCQSxDQUFBO0FBQUEsUUE2QkEsRUFBQSxDQUFHLHlDQUFILEVBQThDLFNBQUEsR0FBQTtBQUM1QyxVQUFBLFNBQUEsQ0FBVSxHQUFWLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBTSxDQUFDLFFBQUQsQ0FBTixDQUFBLENBREEsQ0FBQTtBQUFBLFVBRUEsTUFBQSxDQUFPLFFBQVAsRUFBaUI7QUFBQSxZQUFBLElBQUEsRUFBTSxTQUFOO1dBQWpCLENBRkEsQ0FBQTtpQkFHQSxNQUFBLENBQU8sS0FBUCxFQUFjO0FBQUEsWUFBQSxJQUFBLEVBQU0sUUFBTjtXQUFkLEVBSjRDO1FBQUEsQ0FBOUMsQ0E3QkEsQ0FBQTtBQUFBLFFBbUNBLEVBQUEsQ0FBRyxrREFBSCxFQUF1RCxTQUFBLEdBQUE7QUFDckQsVUFBQSxHQUFBLENBQUk7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7V0FBSixDQUFBLENBQUE7QUFBQSxVQUNBLFNBQUEsQ0FBVSxHQUFWLENBREEsQ0FBQTtBQUFBLFVBRUEsTUFBTSxDQUFDLFNBQVAsQ0FBQSxDQUZBLENBQUE7QUFBQSxVQUdBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEtBQWxCLENBSEEsQ0FBQTtBQUFBLFVBSUEsTUFBQSxDQUFPLFFBQVAsRUFBaUI7QUFBQSxZQUFBLElBQUEsRUFBTSxZQUFOO1dBQWpCLENBSkEsQ0FBQTtBQUFBLFVBS0EsR0FBQSxDQUFJO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQUosQ0FMQSxDQUFBO2lCQU1BLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxZQUFBLElBQUEsRUFBTSxjQUFOO1dBQVosRUFQcUQ7UUFBQSxDQUF2RCxDQW5DQSxDQUFBO0FBQUEsUUE0Q0EsRUFBQSxDQUFHLGtEQUFILEVBQXVELFNBQUEsR0FBQTtBQUNyRCxVQUFBLFNBQUEsQ0FBVSxHQUFWLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBTSxDQUFDLFNBQVAsQ0FBQSxDQURBLENBQUE7QUFBQSxVQUVBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEtBQWxCLENBRkEsQ0FBQTtBQUFBLFVBR0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7QUFBQSxZQUFBLElBQUEsRUFBTSxZQUFOO1dBQWpCLENBSEEsQ0FBQTtpQkFJQSxNQUFBLENBQU8sT0FBUCxFQUFnQjtBQUFBLFlBQUEsSUFBQSxFQUFNLGNBQU47V0FBaEIsRUFMcUQ7UUFBQSxDQUF2RCxDQTVDQSxDQUFBO0FBQUEsUUFtREEsRUFBQSxDQUFHLCtDQUFILEVBQW9ELFNBQUEsR0FBQTtBQUNsRCxVQUFBLFNBQUEsQ0FBVSxHQUFWLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBTSxDQUFDLFFBQUQsQ0FBTixDQUFBLENBREEsQ0FBQTtBQUFBLFVBRUEsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsS0FBbEIsQ0FGQSxDQUFBO0FBQUEsVUFHQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtBQUFBLFlBQUEsSUFBQSxFQUFNLFlBQU47V0FBakIsQ0FIQSxDQUFBO2lCQUlBLE1BQUEsQ0FBTyxPQUFQLEVBQWdCO0FBQUEsWUFBQSxJQUFBLEVBQU0sY0FBTjtXQUFoQixFQUxrRDtRQUFBLENBQXBELENBbkRBLENBQUE7ZUEwREEsRUFBQSxDQUFHLCtDQUFILEVBQW9ELFNBQUEsR0FBQTtBQUNsRCxVQUFBLFNBQUEsQ0FBVSxHQUFWLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBTSxDQUFDLFFBQUQsQ0FBTixDQUFBLENBREEsQ0FBQTtBQUFBLFVBRUEsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsS0FBbEIsQ0FGQSxDQUFBO0FBQUEsVUFHQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtBQUFBLFlBQUEsSUFBQSxFQUFNLFlBQU47V0FBakIsQ0FIQSxDQUFBO2lCQUlBLE1BQUEsQ0FBTyxPQUFQLEVBQWdCO0FBQUEsWUFBQSxJQUFBLEVBQU0sY0FBTjtXQUFoQixFQUxrRDtRQUFBLENBQXBELEVBM0RrQztNQUFBLENBQXBDLENBQUEsQ0FBQTthQWtFQSxRQUFBLENBQVMseUJBQVQsRUFBb0MsU0FBQSxHQUFBO0FBQ2xDLFFBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtpQkFDVCxHQUFBLENBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSxzQkFBTjtBQUFBLFlBT0EsTUFBQSxFQUFRLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFELEVBQVMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFULEVBQWlCLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBakIsQ0FQUjtXQURGLEVBRFM7UUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFFBV0EsRUFBQSxDQUFHLHdEQUFILEVBQTZELFNBQUEsR0FBQTtBQUMzRCxVQUFBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBRCxFQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBVCxFQUFpQixDQUFDLENBQUQsRUFBSSxDQUFKLENBQWpCLENBQVI7QUFBQSxZQUFrQyxJQUFBLEVBQU0sUUFBeEM7V0FBWixDQUFBLENBQUE7QUFBQSxVQUNBLE1BQU0sQ0FBQyxTQUFQLENBQUEsQ0FEQSxDQUFBO0FBQUEsVUFFQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtBQUFBLFlBQUEsSUFBQSxFQUFNLG1CQUFOO0FBQUEsWUFBMkIsTUFBQSxFQUFRLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFELEVBQVMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFULEVBQWlCLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBakIsQ0FBbkM7V0FBakIsQ0FGQSxDQUFBO2lCQUdBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxZQUFBLElBQUEsRUFBTSxnQkFBTjtBQUFBLFlBQXdCLE1BQUEsRUFBUSxDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBRCxFQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBVCxFQUFpQixDQUFDLENBQUQsRUFBSSxDQUFKLENBQWpCLENBQWhDO1dBQVosRUFKMkQ7UUFBQSxDQUE3RCxDQVhBLENBQUE7ZUFpQkEsRUFBQSxDQUFHLHFEQUFILEVBQTBELFNBQUEsR0FBQTtBQUN4RCxjQUFBLE9BQUE7QUFBQSxVQUFBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxZQUFBLElBQUEsRUFBTSxRQUFOO1dBQVosQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFNLENBQUMsUUFBRCxDQUFOLENBQUEsQ0FEQSxDQUFBO0FBQUEsVUFFQSxPQUFBLEdBQVUsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVQsRUFBaUIsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFqQixDQUZWLENBQUE7QUFBQSxVQUdBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO0FBQUEsWUFBQSxJQUFBLEVBQU0sbUJBQU47QUFBQSxZQUEyQixNQUFBLEVBQVEsT0FBbkM7V0FBakIsQ0FIQSxDQUFBO0FBQUEsVUFJQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsWUFBQSxJQUFBLEVBQU0sZ0JBQU47QUFBQSxZQUF3QixNQUFBLEVBQVEsT0FBaEM7V0FBWixDQUpBLENBQUE7QUFBQSxVQUtBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxZQUFBLElBQUEsRUFBTSxhQUFOO0FBQUEsWUFBcUIsTUFBQSxFQUFRLE9BQTdCO1dBQVosQ0FMQSxDQUFBO0FBQUEsVUFNQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsWUFBQSxJQUFBLEVBQU0sV0FBTjtBQUFBLFlBQW1CLE1BQUEsRUFBUSxPQUEzQjtXQUFaLENBTkEsQ0FBQTtpQkFPQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsWUFBQSxJQUFBLEVBQU0sVUFBTjtBQUFBLFlBQWtCLE1BQUEsRUFBUSxPQUExQjtXQUFaLEVBUndEO1FBQUEsQ0FBMUQsRUFsQmtDO01BQUEsQ0FBcEMsRUFuRTBEO0lBQUEsQ0FBNUQsQ0FuaUJBLENBQUE7V0Frb0JBLFFBQUEsQ0FBUyx5QkFBVCxFQUFvQyxTQUFBLEdBQUE7QUFDbEMsVUFBQSxvQkFBQTtBQUFBLE1BQUEsb0JBQUEsR0FBdUIsU0FBQyxHQUFELEVBQU0sSUFBTixHQUFBO0FBQ3JCLFlBQUEsb0JBQUE7QUFBQSxRQUQ0QixjQUFBLFFBQVEsWUFBQSxNQUFNLGNBQUEsTUFDMUMsQ0FBQTtBQUFBLFFBQUEsU0FBQSxDQUFVLEdBQVYsQ0FBQSxDQUFBO0FBQUEsUUFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixNQUFsQixDQURBLENBQUE7ZUFFQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtBQUFBLFVBQUEsSUFBQSxFQUFNLElBQU47QUFBQSxVQUFZLE1BQUEsRUFBUSxNQUFwQjtTQUFqQixFQUhxQjtNQUFBLENBQXZCLENBQUE7QUFBQSxNQUtBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxZQUFBLFdBQUE7QUFBQSxRQUFBLFdBQUEsR0FBYyxRQUFkLENBQUE7QUFBQSxRQUNBLEdBQUEsQ0FBSTtBQUFBLFVBQUEsSUFBQSxFQUFNLEVBQU47QUFBQSxVQUFVLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQWxCO1NBQUosQ0FEQSxDQUFBO0FBQUEsUUFFQSxTQUFBLENBQVUsR0FBVixDQUZBLENBQUE7QUFBQSxRQUdBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLFdBQWxCLENBSEEsQ0FBQTtlQUlBLE1BQUEsQ0FBTyxZQUFQLEVBQXFCO0FBQUEsVUFBQSxJQUFBLEVBQU0sV0FBTjtBQUFBLFVBQW1CLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQTNCO1NBQXJCLEVBTFM7TUFBQSxDQUFYLENBTEEsQ0FBQTthQVlBLFFBQUEsQ0FBUyw4QkFBVCxFQUF5QyxTQUFBLEdBQUE7QUFDdkMsUUFBQSxFQUFBLENBQUcsVUFBSCxFQUFlLFNBQUEsR0FBQTtpQkFBRyxvQkFBQSxDQUFxQixLQUFyQixFQUE0QjtBQUFBLFlBQUEsTUFBQSxFQUFRLEdBQVI7QUFBQSxZQUFhLElBQUEsRUFBTSxXQUFuQjtBQUFBLFlBQWdDLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQXhDO1dBQTVCLEVBQUg7UUFBQSxDQUFmLENBQUEsQ0FBQTtBQUFBLFFBQ0EsRUFBQSxDQUFHLFVBQUgsRUFBZSxTQUFBLEdBQUE7aUJBQUcsb0JBQUEsQ0FBcUIsS0FBckIsRUFBNEI7QUFBQSxZQUFBLE1BQUEsRUFBUSxHQUFSO0FBQUEsWUFBYSxJQUFBLEVBQU0saUJBQW5CO0FBQUEsWUFBc0MsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBOUM7V0FBNUIsRUFBSDtRQUFBLENBQWYsQ0FEQSxDQUFBO0FBQUEsUUFFQSxFQUFBLENBQUcsVUFBSCxFQUFlLFNBQUEsR0FBQTtpQkFBRyxvQkFBQSxDQUFxQixLQUFyQixFQUE0QjtBQUFBLFlBQUEsTUFBQSxFQUFRLEdBQVI7QUFBQSxZQUFhLElBQUEsRUFBTSxpQkFBbkI7QUFBQSxZQUFzQyxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUE5QztXQUE1QixFQUFIO1FBQUEsQ0FBZixDQUZBLENBQUE7ZUFJQSxRQUFBLENBQVMsa0VBQVQsRUFBNkUsU0FBQSxHQUFBO0FBQzNFLFVBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFlBQUEsR0FBQSxDQUFJO0FBQUEsY0FBQSxJQUFBLEVBQU0sRUFBTjtBQUFBLGNBQVUsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBbEI7YUFBSixDQUFBLENBQUE7QUFBQSxZQUNBLFNBQUEsQ0FBVSxHQUFWLENBREEsQ0FBQTtBQUFBLFlBRUEsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsR0FBbEIsQ0FGQSxDQUFBO21CQUdBLE1BQUEsQ0FBTyxZQUFQLEVBQXFCO0FBQUEsY0FBQSxJQUFBLEVBQU0sR0FBTjtBQUFBLGNBQVcsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBbkI7YUFBckIsRUFKUztVQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsVUFNQSxFQUFBLENBQUcsVUFBSCxFQUFlLFNBQUEsR0FBQTttQkFBRyxvQkFBQSxDQUFxQixPQUFyQixFQUE4QjtBQUFBLGNBQUEsTUFBQSxFQUFRLEdBQVI7QUFBQSxjQUFhLElBQUEsRUFBTSxHQUFuQjtBQUFBLGNBQXdCLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQWhDO2FBQTlCLEVBQUg7VUFBQSxDQUFmLENBTkEsQ0FBQTtBQUFBLFVBT0EsRUFBQSxDQUFHLFVBQUgsRUFBZSxTQUFBLEdBQUE7bUJBQUcsb0JBQUEsQ0FBcUIsS0FBckIsRUFBNEI7QUFBQSxjQUFBLE1BQUEsRUFBUSxHQUFSO0FBQUEsY0FBYSxJQUFBLEVBQU0sR0FBbkI7QUFBQSxjQUF3QixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFoQzthQUE1QixFQUFIO1VBQUEsQ0FBZixDQVBBLENBQUE7QUFBQSxVQVFBLEVBQUEsQ0FBRyxVQUFILEVBQWUsU0FBQSxHQUFBO21CQUFHLG9CQUFBLENBQXFCLEtBQXJCLEVBQTRCO0FBQUEsY0FBQSxNQUFBLEVBQVEsR0FBUjtBQUFBLGNBQWEsSUFBQSxFQUFNLEdBQW5CO0FBQUEsY0FBd0IsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBaEM7YUFBNUIsRUFBSDtVQUFBLENBQWYsQ0FSQSxDQUFBO2lCQVNBLEVBQUEsQ0FBRyxVQUFILEVBQWUsU0FBQSxHQUFBO21CQUFHLG9CQUFBLENBQXFCLEtBQXJCLEVBQTRCO0FBQUEsY0FBQSxNQUFBLEVBQVEsR0FBUjtBQUFBLGNBQWEsSUFBQSxFQUFNLEdBQW5CO0FBQUEsY0FBd0IsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBaEM7YUFBNUIsRUFBSDtVQUFBLENBQWYsRUFWMkU7UUFBQSxDQUE3RSxFQUx1QztNQUFBLENBQXpDLEVBYmtDO0lBQUEsQ0FBcEMsRUFub0I2QztFQUFBLENBQS9DLENBSkEsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/spec/operator-activate-insert-mode-spec.coffee
