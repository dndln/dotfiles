(function() {
  var TextData, dispatch, getVimState, _ref;

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, dispatch = _ref.dispatch, TextData = _ref.TextData;

  describe("TextObject", function() {
    var editor, editorElement, ensure, getCheckFunctionFor, keystroke, set, vimState, _ref1;
    _ref1 = [], set = _ref1[0], ensure = _ref1[1], keystroke = _ref1[2], editor = _ref1[3], editorElement = _ref1[4], vimState = _ref1[5];
    getCheckFunctionFor = function(textObject) {
      return function(initialPoint, keystroke, options) {
        set({
          cursor: initialPoint
        });
        return ensure("" + keystroke + " " + textObject, options);
      };
    };
    beforeEach(function() {
      return getVimState(function(state, vimEditor) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vimEditor.set, ensure = vimEditor.ensure, keystroke = vimEditor.keystroke, vimEditor;
      });
    });
    afterEach(function() {
      return vimState.resetNormalMode();
    });
    describe("TextObject", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        return getVimState('sample.coffee', function(state, vimEditor) {
          editor = state.editor, editorElement = state.editorElement;
          return set = vimEditor.set, ensure = vimEditor.ensure, keystroke = vimEditor.keystroke, vimEditor;
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage('language-coffee-script');
      });
      return describe("when TextObject is excuted directly", function() {
        return it("select that TextObject", function() {
          set({
            cursor: [8, 7]
          });
          dispatch(editorElement, 'vim-mode-plus:inner-word');
          return ensure({
            selectedText: 'QuickSort'
          });
        });
      });
    });
    describe("Word", function() {
      describe("inner-word", function() {
        beforeEach(function() {
          return set({
            text: "12345 abcde ABCDE",
            cursor: [0, 9]
          });
        });
        it("applies operators inside the current word in operator-pending mode", function() {
          return ensure('d i w', {
            text: "12345  ABCDE",
            cursor: [0, 6],
            register: {
              '"': {
                text: 'abcde'
              }
            },
            mode: 'normal'
          });
        });
        it("selects inside the current word in visual mode", function() {
          return ensure('v i w', {
            selectedScreenRange: [[0, 6], [0, 11]]
          });
        });
        it("works with multiple cursors", function() {
          set({
            addCursor: [0, 1]
          });
          return ensure('v i w', {
            selectedBufferRange: [[[0, 6], [0, 11]], [[0, 0], [0, 5]]]
          });
        });
        describe("cursor is on next to NonWordCharacter", function() {
          beforeEach(function() {
            return set({
              text: "abc(def)",
              cursor: [0, 4]
            });
          });
          it("change inside word", function() {
            return ensure('c i w', {
              text: "abc()",
              mode: "insert"
            });
          });
          return it("delete inside word", function() {
            return ensure('d i w', {
              text: "abc()",
              mode: "normal"
            });
          });
        });
        return describe("cursor's next char is NonWordCharacter", function() {
          beforeEach(function() {
            return set({
              text: "abc(def)",
              cursor: [0, 6]
            });
          });
          it("change inside word", function() {
            return ensure('c i w', {
              text: "abc()",
              mode: "insert"
            });
          });
          return it("delete inside word", function() {
            return ensure('d i w', {
              text: "abc()",
              mode: "normal"
            });
          });
        });
      });
      return describe("a-word", function() {
        beforeEach(function() {
          return set({
            text: "12345 abcde ABCDE",
            cursor: [0, 9]
          });
        });
        it("select current-word and trailing white space", function() {
          return ensure('d a w', {
            text: "12345 ABCDE",
            cursor: [0, 6],
            register: {
              '"': {
                text: "abcde "
              }
            }
          });
        });
        it("select current-word and leading white space in case trailing white space wasn't there", function() {
          set({
            cursor: [0, 15]
          });
          return ensure('d a w', {
            text: "12345 abcde",
            cursor: [0, 10],
            register: {
              '"': {
                text: " ABCDE"
              }
            }
          });
        });
        it("selects from the start of the current word to the start of the next word in visual mode", function() {
          return ensure('v a w', {
            selectedScreenRange: [[0, 6], [0, 12]]
          });
        });
        it("doesn't span newlines", function() {
          set({
            text: "12345\nabcde ABCDE",
            cursor: [0, 3]
          });
          return ensure('v a w', {
            selectedBufferRange: [[0, 0], [0, 5]]
          });
        });
        return it("doesn't span special characters", function() {
          set({
            text: "1(345\nabcde ABCDE",
            cursor: [0, 3]
          });
          return ensure('v a w', {
            selectedBufferRange: [[0, 2], [0, 5]]
          });
        });
      });
    });
    describe("WholeWord", function() {
      describe("inner-whole-word", function() {
        beforeEach(function() {
          return set({
            text: "12(45 ab'de ABCDE",
            cursor: [0, 9]
          });
        });
        it("applies operators inside the current whole word in operator-pending mode", function() {
          return ensure('d i W', {
            text: "12(45  ABCDE",
            cursor: [0, 6],
            register: {
              '"': {
                text: "ab'de"
              }
            }
          });
        });
        return it("selects inside the current whole word in visual mode", function() {
          return ensure('v i W', {
            selectedScreenRange: [[0, 6], [0, 11]]
          });
        });
      });
      return describe("a-whole-word", function() {
        beforeEach(function() {
          return set({
            text: "12(45 ab'de ABCDE",
            cursor: [0, 9]
          });
        });
        it("select whole-word and trailing white space", function() {
          return ensure('d a W', {
            text: "12(45 ABCDE",
            cursor: [0, 6],
            register: {
              '"': {
                text: "ab'de "
              }
            },
            mode: 'normal'
          });
        });
        it("select whole-word and leading white space in case trailing white space wasn't there", function() {
          set({
            cursor: [0, 15]
          });
          return ensure('d a w', {
            text: "12(45 ab'de",
            cursor: [0, 10],
            register: {
              '"': {
                text: " ABCDE"
              }
            }
          });
        });
        it("selects from the start of the current whole word to the start of the next whole word in visual mode", function() {
          return ensure('v a W', {
            selectedScreenRange: [[0, 6], [0, 12]]
          });
        });
        return it("doesn't span newlines", function() {
          set({
            text: "12(45\nab'de ABCDE",
            cursor: [0, 4]
          });
          return ensure('v a W', {
            selectedBufferRange: [[0, 0], [0, 5]]
          });
        });
      });
    });
    describe("AnyPair", function() {
      var complexText, simpleText, _ref2;
      _ref2 = {}, simpleText = _ref2.simpleText, complexText = _ref2.complexText;
      beforeEach(function() {
        simpleText = ".... \"abc\" ....\n.... 'abc' ....\n.... `abc` ....\n.... {abc} ....\n.... <abc> ....\n.... [abc] ....\n.... (abc) ....";
        complexText = "[4s\n--{3s\n----\"2s(1s-1e)2e\"\n---3e}-4e\n]";
        return set({
          text: simpleText,
          cursor: [0, 7]
        });
      });
      describe("inner-any-pair", function() {
        it("applies operators any inner-pair and repeatable", function() {
          ensure('d i s', {
            text: ".... \"\" ....\n.... 'abc' ....\n.... `abc` ....\n.... {abc} ....\n.... <abc> ....\n.... [abc] ....\n.... (abc) ...."
          });
          return ensure('j . j . j . j . j . j . j .', {
            text: ".... \"\" ....\n.... '' ....\n.... `` ....\n.... {} ....\n.... <> ....\n.... [] ....\n.... () ...."
          });
        });
        return it("can expand selection", function() {
          set({
            text: complexText,
            cursor: [2, 8]
          });
          keystroke('v');
          ensure('i s', {
            selectedText: "1s-1e"
          });
          ensure('i s', {
            selectedText: "2s(1s-1e)2e"
          });
          ensure('i s', {
            selectedText: "3s\n----\"2s(1s-1e)2e\"\n---3e"
          });
          return ensure('i s', {
            selectedText: "4s\n--{3s\n----\"2s(1s-1e)2e\"\n---3e}-4e"
          });
        });
      });
      return describe("a-any-pair", function() {
        it("applies operators any a-pair and repeatable", function() {
          ensure('d a s', {
            text: "....  ....\n.... 'abc' ....\n.... `abc` ....\n.... {abc} ....\n.... <abc> ....\n.... [abc] ....\n.... (abc) ...."
          });
          return ensure('j . j . j . j . j . j . j .', {
            text: "....  ....\n....  ....\n....  ....\n....  ....\n....  ....\n....  ....\n....  ...."
          });
        });
        return it("can expand selection", function() {
          set({
            text: complexText,
            cursor: [2, 8]
          });
          keystroke('v');
          ensure('a s', {
            selectedText: "(1s-1e)"
          });
          ensure('a s', {
            selectedText: "\"2s(1s-1e)2e\""
          });
          ensure('a s', {
            selectedText: "{3s\n----\"2s(1s-1e)2e\"\n---3e}"
          });
          return ensure('a s', {
            selectedText: "[4s\n--{3s\n----\"2s(1s-1e)2e\"\n---3e}-4e\n]"
          });
        });
      });
    });
    describe("AnyQuote", function() {
      beforeEach(function() {
        return set({
          text: "--\"abc\" `def`  'efg'--",
          cursor: [0, 0]
        });
      });
      describe("inner-any-quote", function() {
        it("applies operators any inner-pair and repeatable", function() {
          ensure('d i q', {
            text: "--\"\" `def`  'efg'--"
          });
          ensure('.', {
            text: "--\"\" ``  'efg'--"
          });
          return ensure('.', {
            text: "--\"\" ``  ''--"
          });
        });
        return it("can select next quote", function() {
          keystroke('v');
          ensure('i q', {
            selectedText: 'abc'
          });
          ensure('i q', {
            selectedText: 'def'
          });
          return ensure('i q', {
            selectedText: 'efg'
          });
        });
      });
      return describe("a-any-quote", function() {
        it("applies operators any a-quote and repeatable", function() {
          ensure('d a q', {
            text: "-- `def`  'efg'--"
          });
          ensure('.', {
            text: "--   'efg'--"
          });
          ensure('.', {
            text: "--   --"
          });
          return ensure('.');
        });
        return it("can select next quote", function() {
          keystroke('v');
          ensure('a q', {
            selectedText: '"abc"'
          });
          ensure('a q', {
            selectedText: '`def`'
          });
          return ensure('a q', {
            selectedText: "'efg'"
          });
        });
      });
    });
    describe("DoubleQuote", function() {
      describe("inner-double-quote", function() {
        beforeEach(function() {
          return set({
            text: '" something in here and in "here" " and over here',
            cursor: [0, 9]
          });
        });
        it("applies operators inside the current string in operator-pending mode", function() {
          return ensure('d i "', {
            text: '""here" " and over here',
            cursor: [0, 1]
          });
        });
        it("skip non-string area and operate forwarding string whithin line", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d i "', {
            text: '" something in here and in "here"" and over here',
            cursor: [0, 33]
          });
        });
        it("makes no change if past the last string on a line", function() {
          set({
            cursor: [0, 39]
          });
          return ensure('d i "', {
            text: '" something in here and in "here" " and over here',
            cursor: [0, 39]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i "');
          text = '-"+"-';
          textFinal = '-""-';
          selectedText = '+';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
      return describe("a-double-quote", function() {
        var originalText;
        originalText = '" something in here and in "here" "';
        beforeEach(function() {
          return set({
            text: originalText,
            cursor: [0, 9]
          });
        });
        it("applies operators around the current double quotes in operator-pending mode", function() {
          return ensure('d a "', {
            text: 'here" "',
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("skip non-string area and operate forwarding string whithin line", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d a "', {
            text: '" something in here and in "here',
            cursor: [0, 31],
            mode: 'normal'
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('a "');
          text = '-"+"-';
          textFinal = '--';
          selectedText = '"+"';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
    });
    describe("SingleQuote", function() {
      describe("inner-single-quote", function() {
        beforeEach(function() {
          return set({
            text: "' something in here and in 'here' ' and over here",
            cursor: [0, 9]
          });
        });
        describe("don't treat literal backslash(double backslash) as escape char", function() {
          beforeEach(function() {
            return set({
              text: "'some-key-here\\\\': 'here-is-the-val'"
            });
          });
          it("case-1", function() {
            set({
              cursor: [0, 2]
            });
            return ensure("d i '", {
              text: "'': 'here-is-the-val'",
              cursor: [0, 1]
            });
          });
          return it("case-2", function() {
            set({
              cursor: [0, 19]
            });
            return ensure("d i '", {
              text: "'some-key-here\\\\': ''",
              cursor: [0, 20]
            });
          });
        });
        describe("treat backslash(single backslash) as escape char", function() {
          beforeEach(function() {
            return set({
              text: "'some-key-here\\'': 'here-is-the-val'"
            });
          });
          it("case-1", function() {
            set({
              cursor: [0, 2]
            });
            return ensure("d i '", {
              text: "'': 'here-is-the-val'",
              cursor: [0, 1]
            });
          });
          return it("case-2", function() {
            set({
              cursor: [0, 17]
            });
            return ensure("d i '", {
              text: "'some-key-here\\'': ''",
              cursor: [0, 20]
            });
          });
        });
        it("applies operators inside the current string in operator-pending mode", function() {
          return ensure("d i '", {
            text: "''here' ' and over here",
            cursor: [0, 1]
          });
        });
        it("applies operators inside the next string in operator-pending mode (if not in a string)", function() {
          set({
            cursor: [0, 26]
          });
          return ensure("d i '", {
            text: "''here' ' and over here",
            cursor: [0, 1]
          });
        });
        it("makes no change if past the last string on a line", function() {
          set({
            cursor: [0, 39]
          });
          return ensure("d i '", {
            text: "' something in here and in 'here' ' and over here",
            cursor: [0, 39]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor("i '");
          text = "-'+'-";
          textFinal = "-''-";
          selectedText = '+';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
      return describe("a-single-quote", function() {
        var originalText;
        originalText = "' something in here and in 'here' '";
        beforeEach(function() {
          return set({
            text: originalText,
            cursor: [0, 9]
          });
        });
        it("applies operators around the current single quotes in operator-pending mode", function() {
          return ensure("d a '", {
            text: "here' '",
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("applies operators inside the next string in operator-pending mode (if not in a string)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure("d a '", {
            text: "' something in here and in 'here",
            cursor: [0, 31],
            mode: 'normal'
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor("a '");
          text = "-'+'-";
          textFinal = "--";
          selectedText = "'+'";
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
    });
    describe("BackTick", function() {
      var originalText;
      originalText = "this is `sample` text.";
      beforeEach(function() {
        return set({
          text: originalText,
          cursor: [0, 9]
        });
      });
      describe("inner-back-tick", function() {
        it("applies operators inner-area", function() {
          return ensure("d i `", {
            text: "this is `` text.",
            cursor: [0, 9]
          });
        });
        it("do nothing when pair range is not under cursor", function() {
          set({
            cursor: [0, 16]
          });
          return ensure("d i `", {
            text: originalText,
            cursor: [0, 16]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i `');
          text = '-`+`-';
          textFinal = '-``-';
          selectedText = '+';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
      return describe("a-back-tick", function() {
        it("applies operators inner-area", function() {
          return ensure("d a `", {
            text: "this is  text.",
            cursor: [0, 8]
          });
        });
        it("do nothing when pair range is not under cursor", function() {
          set({
            cursor: [0, 16]
          });
          return ensure("d a `", {
            text: originalText,
            cursor: [0, 16]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor("a `");
          text = "-`+`-";
          textFinal = "--";
          selectedText = "`+`";
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
    });
    describe("CurlyBracket", function() {
      describe("inner-curly-bracket", function() {
        beforeEach(function() {
          return set({
            text: "{ something in here and in {here} }",
            cursor: [0, 9]
          });
        });
        it("applies operators to inner-area in operator-pending mode", function() {
          return ensure('d i {', {
            text: "{}",
            cursor: [0, 1]
          });
        });
        it("applies operators to inner-area in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d i {', {
            text: "{ something in here and in {} }",
            cursor: [0, 28]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i {');
          text = '-{+}-';
          textFinal = '-{}-';
          selectedText = '+';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
      return describe("a-curly-bracket", function() {
        beforeEach(function() {
          return set({
            text: "{ something in here and in {here} }",
            cursor: [0, 9]
          });
        });
        it("applies operators to a-area in operator-pending mode", function() {
          return ensure('d a {', {
            text: '',
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("applies operators to a-area in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d a {', {
            text: "{ something in here and in  }",
            cursor: [0, 27],
            mode: 'normal'
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor("a {");
          text = "-{+}-";
          textFinal = "--";
          selectedText = "{+}";
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
    });
    describe("AngleBracket", function() {
      describe("inner-angle-bracket", function() {
        beforeEach(function() {
          return set({
            text: "< something in here and in <here> >",
            cursor: [0, 9]
          });
        });
        it("applies operators inside the current word in operator-pending mode", function() {
          return ensure('d i <', {
            text: "<>",
            cursor: [0, 1]
          });
        });
        it("applies operators inside the current word in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d i <', {
            text: "< something in here and in <> >",
            cursor: [0, 28]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i <');
          text = '-<+>-';
          textFinal = '-<>-';
          selectedText = '+';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
      return describe("a-angle-bracket", function() {
        beforeEach(function() {
          return set({
            text: "< something in here and in <here> >",
            cursor: [0, 9]
          });
        });
        it("applies operators around the current angle brackets in operator-pending mode", function() {
          return ensure('d a <', {
            text: '',
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("applies operators around the current angle brackets in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d a <', {
            text: "< something in here and in  >",
            cursor: [0, 27],
            mode: 'normal'
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor("a <");
          text = "-<+>-";
          textFinal = "--";
          selectedText = "<+>";
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
    });
    describe("AllowForwarding family", function() {
      beforeEach(function() {
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus.operator-pending-mode, atom-text-editor.vim-mode-plus.visual-mode': {
            'i }': 'vim-mode-plus:inner-curly-bracket-allow-forwarding',
            'i >': 'vim-mode-plus:inner-angle-bracket-allow-forwarding',
            'i ]': 'vim-mode-plus:inner-square-bracket-allow-forwarding',
            'i )': 'vim-mode-plus:inner-parenthesis-allow-forwarding',
            'a }': 'vim-mode-plus:a-curly-bracket-allow-forwarding',
            'a >': 'vim-mode-plus:a-angle-bracket-allow-forwarding',
            'a ]': 'vim-mode-plus:a-square-bracket-allow-forwarding',
            'a )': 'vim-mode-plus:a-parenthesis-allow-forwarding'
          }
        });
        return set({
          text: "__{000}__\n__<111>__\n__[222]__\n__(333)__"
        });
      });
      describe("inner", function() {
        return it("select forwarding range", function() {
          set({
            cursor: [0, 0]
          });
          ensure('escape v i }', {
            selectedText: "000"
          });
          set({
            cursor: [1, 0]
          });
          ensure('escape v i >', {
            selectedText: "111"
          });
          set({
            cursor: [2, 0]
          });
          ensure('escape v i ]', {
            selectedText: "222"
          });
          set({
            cursor: [3, 0]
          });
          return ensure('escape v i )', {
            selectedText: "333"
          });
        });
      });
      describe("a", function() {
        return it("select forwarding range", function() {
          set({
            cursor: [0, 0]
          });
          ensure('escape v a }', {
            selectedText: "{000}"
          });
          set({
            cursor: [1, 0]
          });
          ensure('escape v a >', {
            selectedText: "<111>"
          });
          set({
            cursor: [2, 0]
          });
          ensure('escape v a ]', {
            selectedText: "[222]"
          });
          set({
            cursor: [3, 0]
          });
          return ensure('escape v a )', {
            selectedText: "(333)"
          });
        });
      });
      return describe("multi line text", function() {
        var textOneA, textOneInner, _ref2;
        _ref2 = [], textOneInner = _ref2[0], textOneA = _ref2[1];
        beforeEach(function() {
          set({
            text: "000\n000{11\n111{22}\n111\n111}"
          });
          textOneInner = "11\n111{22}\n111\n111";
          return textOneA = "{11\n111{22}\n111\n111}";
        });
        describe("forwarding inner", function() {
          it("select forwarding range", function() {
            set({
              cursor: [1, 0]
            });
            return ensure("v i }", {
              selectedText: textOneInner
            });
          });
          it("select forwarding range", function() {
            set({
              cursor: [2, 0]
            });
            return ensure("v i }", {
              selectedText: "22"
            });
          });
          it("[case-1] no forwarding open pair, fail to find", function() {
            set({
              cursor: [0, 0]
            });
            return ensure("v i }", {
              selectedText: '0',
              cursor: [0, 1]
            });
          });
          it("[case-2] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [1, 4]
            });
            return ensure("v i }", {
              selectedText: textOneInner
            });
          });
          it("[case-3] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [3, 0]
            });
            return ensure("v i }", {
              selectedText: textOneInner
            });
          });
          return it("[case-3] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [4, 0]
            });
            return ensure("v i }", {
              selectedText: textOneInner
            });
          });
        });
        return describe("forwarding a", function() {
          it("select forwarding range", function() {
            set({
              cursor: [1, 0]
            });
            return ensure("v a }", {
              selectedText: textOneA
            });
          });
          it("select forwarding range", function() {
            set({
              cursor: [2, 0]
            });
            return ensure("v a }", {
              selectedText: "{22}"
            });
          });
          it("[case-1] no forwarding open pair, fail to find", function() {
            set({
              cursor: [0, 0]
            });
            return ensure("v a }", {
              selectedText: '0',
              cursor: [0, 1]
            });
          });
          it("[case-2] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [1, 4]
            });
            return ensure("v a }", {
              selectedText: textOneA
            });
          });
          it("[case-3] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [3, 0]
            });
            return ensure("v a }", {
              selectedText: textOneA
            });
          });
          return it("[case-3] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [4, 0]
            });
            return ensure("v a }", {
              selectedText: textOneA
            });
          });
        });
      });
    });
    describe("AnyPairAllowForwarding", function() {
      beforeEach(function() {
        atom.keymaps.add("text", {
          'atom-text-editor.vim-mode-plus.operator-pending-mode, atom-text-editor.vim-mode-plus.visual-mode': {
            ";": 'vim-mode-plus:inner-any-pair-allow-forwarding',
            ":": 'vim-mode-plus:a-any-pair-allow-forwarding'
          }
        });
        return set({
          text: "00\n00[11\n11\"222\"11{333}11(\n444()444\n)\n111]00{555}"
        });
      });
      describe("inner", function() {
        return it("select forwarding range within enclosed range(if exists)", function() {
          set({
            cursor: [2, 0]
          });
          keystroke('v');
          ensure(';', {
            selectedText: "222"
          });
          ensure(';', {
            selectedText: "333"
          });
          ensure(';', {
            selectedText: "444()444\n"
          });
          return ensure(';', {
            selectedText: "",
            selectedBufferRange: [[3, 4], [3, 4]]
          });
        });
      });
      return describe("a", function() {
        return it("select forwarding range within enclosed range(if exists)", function() {
          set({
            cursor: [2, 0]
          });
          keystroke('v');
          ensure(':', {
            selectedText: '"222"'
          });
          ensure(':', {
            selectedText: "{333}"
          });
          ensure(':', {
            selectedText: "(\n444()444\n)"
          });
          return ensure(':', {
            selectedText: "[11\n11\"222\"11{333}11(\n444()444\n)\n111]"
          });
        });
      });
    });
    describe("Tag", function() {
      var ensureSelectedText;
      ensureSelectedText = [][0];
      ensureSelectedText = function(start, keystroke, selectedText) {
        set({
          cursor: start
        });
        return ensure(keystroke, {
          selectedText: selectedText
        });
      };
      describe("inner-tag", function() {
        describe("pricisely select inner", function() {
          var check, deletedText, innerABC, selectedText, text;
          check = getCheckFunctionFor('i t');
          text = "<abc>  <title>TITLE</title> </abc>";
          deletedText = "<abc>  <title></title> </abc>";
          selectedText = "TITLE";
          innerABC = "  <title>TITLE</title> ";
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("[1] forwarding", function() {
            return check([0, 5], 'v', {
              selectedText: selectedText
            });
          });
          it("[2] openTag leftmost", function() {
            return check([0, 7], 'v', {
              selectedText: selectedText
            });
          });
          it("[3] openTag rightmost", function() {
            return check([0, 13], 'v', {
              selectedText: selectedText
            });
          });
          it("[4] Inner text", function() {
            return check([0, 16], 'v', {
              selectedText: selectedText
            });
          });
          it("[5] closeTag leftmost", function() {
            return check([0, 19], 'v', {
              selectedText: selectedText
            });
          });
          it("[6] closeTag rightmost", function() {
            return check([0, 26], 'v', {
              selectedText: selectedText
            });
          });
          it("[7] right of closeTag", function() {
            return check([0, 27], 'v', {
              selectedText: innerABC
            });
          });
          it("[8] forwarding", function() {
            return check([0, 5], 'd', {
              text: deletedText
            });
          });
          it("[9] openTag leftmost", function() {
            return check([0, 7], 'd', {
              text: deletedText
            });
          });
          it("[10] openTag rightmost", function() {
            return check([0, 13], 'd', {
              text: deletedText
            });
          });
          it("[11] Inner text", function() {
            return check([0, 16], 'd', {
              text: deletedText
            });
          });
          it("[12] closeTag leftmost", function() {
            return check([0, 19], 'd', {
              text: deletedText
            });
          });
          it("[13] closeTag rightmost", function() {
            return check([0, 26], 'd', {
              text: deletedText
            });
          });
          return it("[14] right of closeTag", function() {
            return check([0, 27], 'd', {
              text: "<abc></abc>"
            });
          });
        });
        return describe("expansion and deletion", function() {
          beforeEach(function() {
            var htmlLikeText;
            htmlLikeText = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n__<meta charset=\"UTF-8\" />\n__<title>Document</title>\n</head>\n<body>\n__<div>\n____<div>\n______<div>\n________<p><a>\n______</div>\n____</div>\n__</div>\n</body>\n</html>\n";
            return set({
              text: htmlLikeText
            });
          });
          it("can expand selection when repeated", function() {
            set({
              cursor: [9, 0]
            });
            ensure('v i t', {
              selectedText: "\n________<p><a>\n______"
            });
            ensure('i t', {
              selectedText: "\n______<div>\n________<p><a>\n______</div>\n____"
            });
            ensure('i t', {
              selectedText: "\n____<div>\n______<div>\n________<p><a>\n______</div>\n____</div>\n__"
            });
            ensure('i t', {
              selectedText: "\n__<div>\n____<div>\n______<div>\n________<p><a>\n______</div>\n____</div>\n__</div>\n"
            });
            return ensure('i t', {
              selectedText: "\n<head>\n__<meta charset=\"UTF-8\" />\n__<title>Document</title>\n</head>\n<body>\n__<div>\n____<div>\n______<div>\n________<p><a>\n______</div>\n____</div>\n__</div>\n</body>\n"
            });
          });
          return it('delete inner-tag and repatable', function() {
            set({
              cursor: [9, 0]
            });
            ensure("d i t", {
              text: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n__<meta charset=\"UTF-8\" />\n__<title>Document</title>\n</head>\n<body>\n__<div>\n____<div>\n______<div></div>\n____</div>\n__</div>\n</body>\n</html>\n"
            });
            ensure("3 .", {
              text: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n__<meta charset=\"UTF-8\" />\n__<title>Document</title>\n</head>\n<body></body>\n</html>\n"
            });
            return ensure(".", {
              text: "<!DOCTYPE html>\n<html lang=\"en\"></html>\n"
            });
          });
        });
      });
      return describe("a-tag", function() {
        return describe("pricisely select a", function() {
          var aABC, check, deletedText, selectedText, text;
          check = getCheckFunctionFor('a t');
          text = "<abc>  <title>TITLE</title> </abc>";
          deletedText = "<abc>   </abc>";
          selectedText = "<title>TITLE</title>";
          aABC = "<abc>  <title>TITLE</title> </abc>";
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("[1] forwarding", function() {
            return check([0, 5], 'v', {
              selectedText: selectedText
            });
          });
          it("[2] openTag leftmost", function() {
            return check([0, 7], 'v', {
              selectedText: selectedText
            });
          });
          it("[3] openTag rightmost", function() {
            return check([0, 13], 'v', {
              selectedText: selectedText
            });
          });
          it("[4] Inner text", function() {
            return check([0, 16], 'v', {
              selectedText: selectedText
            });
          });
          it("[5] closeTag leftmost", function() {
            return check([0, 19], 'v', {
              selectedText: selectedText
            });
          });
          it("[6] closeTag rightmost", function() {
            return check([0, 26], 'v', {
              selectedText: selectedText
            });
          });
          it("[7] right of closeTag", function() {
            return check([0, 27], 'v', {
              selectedText: aABC
            });
          });
          it("[8] forwarding", function() {
            return check([0, 5], 'd', {
              text: deletedText
            });
          });
          it("[9] openTag leftmost", function() {
            return check([0, 7], 'd', {
              text: deletedText
            });
          });
          it("[10] openTag rightmost", function() {
            return check([0, 13], 'd', {
              text: deletedText
            });
          });
          it("[11] Inner text", function() {
            return check([0, 16], 'd', {
              text: deletedText
            });
          });
          it("[12] closeTag leftmost", function() {
            return check([0, 19], 'd', {
              text: deletedText
            });
          });
          it("[13] closeTag rightmost", function() {
            return check([0, 26], 'd', {
              text: deletedText
            });
          });
          return it("[14] right of closeTag", function() {
            return check([0, 27], 'd', {
              text: ""
            });
          });
        });
      });
    });
    describe("SquareBracket", function() {
      describe("inner-square-bracket", function() {
        beforeEach(function() {
          return set({
            text: "[ something in here and in [here] ]",
            cursor: [0, 9]
          });
        });
        it("applies operators inside the current word in operator-pending mode", function() {
          return ensure('d i [', {
            text: "[]",
            cursor: [0, 1]
          });
        });
        return it("applies operators inside the current word in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d i [', {
            text: "[ something in here and in [] ]",
            cursor: [0, 28]
          });
        });
      });
      return describe("a-square-bracket", function() {
        beforeEach(function() {
          return set({
            text: "[ something in here and in [here] ]",
            cursor: [0, 9]
          });
        });
        it("applies operators around the current square brackets in operator-pending mode", function() {
          return ensure('d a [', {
            text: '',
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("applies operators around the current square brackets in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d a [', {
            text: "[ something in here and in  ]",
            cursor: [0, 27],
            mode: 'normal'
          });
        });
        describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i [');
          text = '-[+]-';
          textFinal = '-[]-';
          selectedText = '+';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('a [');
          text = '-[+]-';
          textFinal = '--';
          selectedText = '[+]';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
    });
    describe("Parenthesis", function() {
      describe("inner-parenthesis", function() {
        beforeEach(function() {
          return set({
            text: "( something in here and in (here) )",
            cursor: [0, 9]
          });
        });
        it("applies operators inside the current word in operator-pending mode", function() {
          return ensure('d i (', {
            text: "()",
            cursor: [0, 1]
          });
        });
        it("applies operators inside the current word in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d i (', {
            text: "( something in here and in () )",
            cursor: [0, 28]
          });
        });
        it("select inner () by skipping nesting pair", function() {
          set({
            text: 'expect(editor.getScrollTop())',
            cursor: [0, 7]
          });
          return ensure('v i (', {
            selectedText: 'editor.getScrollTop()'
          });
        });
        it("skip escaped pair case-1", function() {
          set({
            text: 'expect(editor.g\\(etScrollTp())',
            cursor: [0, 20]
          });
          return ensure('v i (', {
            selectedText: 'editor.g\\(etScrollTp()'
          });
        });
        it("dont skip literal backslash", function() {
          set({
            text: 'expect(editor.g\\\\(etScrollTp())',
            cursor: [0, 20]
          });
          return ensure('v i (', {
            selectedText: 'etScrollTp()'
          });
        });
        it("skip escaped pair case-2", function() {
          set({
            text: 'expect(editor.getSc\\)rollTp())',
            cursor: [0, 7]
          });
          return ensure('v i (', {
            selectedText: 'editor.getSc\\)rollTp()'
          });
        });
        it("skip escaped pair case-3", function() {
          set({
            text: 'expect(editor.ge\\(tSc\\)rollTp())',
            cursor: [0, 7]
          });
          return ensure('v i (', {
            selectedText: 'editor.ge\\(tSc\\)rollTp()'
          });
        });
        it("works with multiple cursors", function() {
          set({
            text: "( a b ) cde ( f g h ) ijk",
            cursor: [[0, 2], [0, 18]]
          });
          return ensure('v i (', {
            selectedBufferRange: [[[0, 1], [0, 6]], [[0, 13], [0, 20]]]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i (');
          text = '-(+)-';
          textFinal = '-()-';
          selectedText = '+';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
      return describe("a-parenthesis", function() {
        beforeEach(function() {
          return set({
            text: "( something in here and in (here) )",
            cursor: [0, 9]
          });
        });
        it("applies operators around the current parentheses in operator-pending mode", function() {
          return ensure('d a (', {
            text: '',
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("applies operators around the current parentheses in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d a (', {
            text: "( something in here and in  )",
            cursor: [0, 27]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('a (');
          text = '-(+)-';
          textFinal = '--';
          selectedText = '(+)';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
    });
    describe("Paragraph", function() {
      var text;
      text = null;
      beforeEach(function() {
        text = new TextData("\n1: P-1\n\n3: P-2\n4: P-2\n\n\n7: P-3\n8: P-3\n9: P-3\n\n");
        return set({
          cursor: [1, 0],
          text: text.getRaw()
        });
      });
      describe("inner-paragraph", function() {
        it("select consequtive blank rows", function() {
          set({
            cursor: [0, 0]
          });
          ensure('v i p', {
            selectedText: text.getLines([0])
          });
          set({
            cursor: [2, 0]
          });
          ensure('v i p', {
            selectedText: text.getLines([2])
          });
          set({
            cursor: [5, 0]
          });
          return ensure('v i p', {
            selectedText: text.getLines([5, 6])
          });
        });
        it("select consequtive non-blank rows", function() {
          set({
            cursor: [1, 0]
          });
          ensure('v i p', {
            selectedText: text.getLines([1])
          });
          set({
            cursor: [3, 0]
          });
          ensure('v i p', {
            selectedText: text.getLines([3, 4])
          });
          set({
            cursor: [7, 0]
          });
          return ensure('v i p', {
            selectedText: text.getLines([7, 8, 9])
          });
        });
        return it("operate on inner paragraph", function() {
          set({
            cursor: [7, 0]
          });
          return ensure('y i p', {
            cursor: [7, 0],
            register: {
              '"': {
                text: text.getLines([7, 8, 9])
              }
            }
          });
        });
      });
      return describe("a-paragraph", function() {
        it("select two paragraph as one operation", function() {
          set({
            cursor: [0, 0]
          });
          ensure('v a p', {
            selectedText: text.getLines([0, 1])
          });
          set({
            cursor: [2, 0]
          });
          ensure('v a p', {
            selectedText: text.getLines([2, 3, 4])
          });
          set({
            cursor: [5, 0]
          });
          return ensure('v a p', {
            selectedText: text.getLines([5, 6, 7, 8, 9])
          });
        });
        it("select two paragraph as one operation", function() {
          set({
            cursor: [1, 0]
          });
          ensure('v a p', {
            selectedText: text.getLines([1, 2])
          });
          set({
            cursor: [3, 0]
          });
          ensure('v a p', {
            selectedText: text.getLines([3, 4, 5, 6])
          });
          set({
            cursor: [7, 0]
          });
          return ensure('v a p', {
            selectedText: text.getLines([7, 8, 9, 10])
          });
        });
        return it("operate on a paragraph", function() {
          set({
            cursor: [3, 0]
          });
          return ensure('y a p', {
            cursor: [3, 0],
            register: {
              '"': {
                text: text.getLines([3, 4, 5, 6])
              }
            }
          });
        });
      });
    });
    describe('Comment', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        return runs(function() {
          return set({
            grammar: 'source.coffee',
            text: "###\nmultiline comment\n###\n\n# One line comment\n\n# Comment\n# border\nclass QuickSort"
          });
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage('language-coffee-script');
      });
      return describe('inner-comment', function() {
        it('select inner comment block', function() {
          set({
            cursor: [0, 0]
          });
          return ensure('v i /', {
            selectedText: '###\nmultiline comment\n###\n',
            selectedBufferRange: [[0, 0], [3, 0]]
          });
        });
        it('select one line comment', function() {
          set({
            cursor: [4, 0]
          });
          return ensure('v i /', {
            selectedText: '# One line comment\n',
            selectedBufferRange: [[4, 0], [5, 0]]
          });
        });
        return it('not select non-comment line', function() {
          set({
            cursor: [6, 0]
          });
          return ensure('v i /', {
            selectedText: '# Comment\n# border\n',
            selectedBufferRange: [[6, 0], [8, 0]]
          });
        });
      });
    });
    describe('Indentation', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        return getVimState('sample.coffee', function(vimState, vim) {
          editor = vimState.editor, editorElement = vimState.editorElement;
          return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage('language-coffee-script');
      });
      describe('inner-indentation', function() {
        return it('select lines with deeper indent-level', function() {
          set({
            cursor: [12, 0]
          });
          return ensure('v i i', {
            selectedBufferRange: [[12, 0], [15, 0]]
          });
        });
      });
      return describe('a-indentation', function() {
        return it('wont stop on blank line when selecting indent', function() {
          set({
            cursor: [12, 0]
          });
          return ensure('v a i', {
            selectedBufferRange: [[10, 0], [27, 0]]
          });
        });
      });
    });
    describe('Fold', function() {
      var rangeForRows;
      rangeForRows = function(startRow, endRow) {
        return [[startRow, 0], [endRow + 1, 0]];
      };
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        return getVimState('sample.coffee', function(vimState, vim) {
          editor = vimState.editor, editorElement = vimState.editorElement;
          return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage('language-coffee-script');
      });
      describe('inner-fold', function() {
        it("select inner range of fold", function() {
          set({
            cursor: [13, 0]
          });
          return ensure('v i z', {
            selectedBufferRange: rangeForRows(10, 25)
          });
        });
        it("select inner range of fold", function() {
          set({
            cursor: [19, 0]
          });
          return ensure('v i z', {
            selectedBufferRange: rangeForRows(19, 23)
          });
        });
        it("can expand selection", function() {
          set({
            cursor: [23, 0]
          });
          keystroke('v');
          ensure('i z', {
            selectedBufferRange: rangeForRows(23, 23)
          });
          ensure('i z', {
            selectedBufferRange: rangeForRows(19, 23)
          });
          ensure('i z', {
            selectedBufferRange: rangeForRows(10, 25)
          });
          return ensure('i z', {
            selectedBufferRange: rangeForRows(9, 28)
          });
        });
        describe("when startRow of selection is on fold startRow", function() {
          return it('select outer fold(skip)', function() {
            set({
              cursor: [20, 7]
            });
            return ensure('v i z', {
              selectedBufferRange: rangeForRows(19, 23)
            });
          });
        });
        describe("when endRow of selection exceeds fold endRow", function() {
          return it("doesn't matter, select fold based on startRow of selection", function() {
            set({
              cursor: [20, 0]
            });
            ensure('V G', {
              selectedBufferRange: rangeForRows(20, 30)
            });
            return ensure('i z', {
              selectedBufferRange: rangeForRows(19, 23)
            });
          });
        });
        return describe("when indent level of fold startRow and endRow is same", function() {
          beforeEach(function() {
            waitsForPromise(function() {
              return atom.packages.activatePackage('language-javascript');
            });
            return getVimState('sample.js', function(state, vimEditor) {
              editor = state.editor, editorElement = state.editorElement;
              return set = vimEditor.set, ensure = vimEditor.ensure, keystroke = vimEditor.keystroke, vimEditor;
            });
          });
          afterEach(function() {
            return atom.packages.deactivatePackage('language-javascript');
          });
          return it("doesn't select fold endRow", function() {
            set({
              cursor: [5, 0]
            });
            ensure('v i z', {
              selectedBufferRange: rangeForRows(5, 6)
            });
            return ensure('a z', {
              selectedBufferRange: rangeForRows(4, 7)
            });
          });
        });
      });
      return describe('a-fold', function() {
        it('select fold row range', function() {
          set({
            cursor: [13, 0]
          });
          return ensure('v a z', {
            selectedBufferRange: rangeForRows(9, 25)
          });
        });
        it('select fold row range', function() {
          set({
            cursor: [19, 0]
          });
          return ensure('v a z', {
            selectedBufferRange: rangeForRows(18, 23)
          });
        });
        it('can expand selection', function() {
          set({
            cursor: [23, 0]
          });
          keystroke('v');
          ensure('a z', {
            selectedBufferRange: rangeForRows(22, 23)
          });
          ensure('a z', {
            selectedBufferRange: rangeForRows(18, 23)
          });
          ensure('a z', {
            selectedBufferRange: rangeForRows(9, 25)
          });
          return ensure('a z', {
            selectedBufferRange: rangeForRows(8, 28)
          });
        });
        describe("when startRow of selection is on fold startRow", function() {
          return it('select outer fold(skip)', function() {
            set({
              cursor: [20, 7]
            });
            return ensure('v a z', {
              selectedBufferRange: rangeForRows(18, 23)
            });
          });
        });
        return describe("when endRow of selection exceeds fold endRow", function() {
          return it("doesn't matter, select fold based on startRow of selection", function() {
            set({
              cursor: [20, 0]
            });
            ensure('V G', {
              selectedBufferRange: rangeForRows(20, 30)
            });
            return ensure('a z', {
              selectedBufferRange: rangeForRows(18, 23)
            });
          });
        });
      });
    });
    describe('Function', function() {
      describe('coffee', function() {
        var pack, scope;
        pack = 'language-coffee-script';
        scope = 'source.coffee';
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage(pack);
          });
          set({
            text: "# Commment\n\nhello = ->\n  a = 1\n  b = 2\n  c = 3\n\n# Commment",
            cursor: [3, 0]
          });
          return runs(function() {
            var grammar;
            grammar = atom.grammars.grammarForScopeName(scope);
            return editor.setGrammar(grammar);
          });
        });
        afterEach(function() {
          return atom.packages.deactivatePackage(pack);
        });
        describe('inner-function for coffee', function() {
          return it('select except start row', function() {
            return ensure('v i f', {
              selectedBufferRange: [[3, 0], [6, 0]]
            });
          });
        });
        return describe('a-function for coffee', function() {
          return it('select function', function() {
            return ensure('v a f', {
              selectedBufferRange: [[2, 0], [6, 0]]
            });
          });
        });
      });
      describe('ruby', function() {
        var pack, scope;
        pack = 'language-ruby';
        scope = 'source.ruby';
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage(pack);
          });
          set({
            text: "# Commment\n\ndef hello\n  a = 1\n  b = 2\n  c = 3\nend\n\n# Commment",
            cursor: [3, 0]
          });
          return runs(function() {
            var grammar;
            grammar = atom.grammars.grammarForScopeName(scope);
            return editor.setGrammar(grammar);
          });
        });
        afterEach(function() {
          return atom.packages.deactivatePackage(pack);
        });
        describe('inner-function for ruby', function() {
          return it('select except start row', function() {
            return ensure('v i f', {
              selectedBufferRange: [[3, 0], [6, 0]]
            });
          });
        });
        return describe('a-function for ruby', function() {
          return it('select function', function() {
            return ensure('v a f', {
              selectedBufferRange: [[2, 0], [7, 0]]
            });
          });
        });
      });
      return describe('go', function() {
        var pack, scope;
        pack = 'language-go';
        scope = 'source.go';
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage(pack);
          });
          set({
            text: "// Commment\n\nfunc main() {\n  a := 1\n  b := 2\n  c := 3\n}\n\n// Commment",
            cursor: [3, 0]
          });
          return runs(function() {
            var grammar;
            grammar = atom.grammars.grammarForScopeName(scope);
            return editor.setGrammar(grammar);
          });
        });
        afterEach(function() {
          return atom.packages.deactivatePackage(pack);
        });
        describe('inner-function for go', function() {
          return it('select except start row', function() {
            return ensure('v i f', {
              selectedBufferRange: [[3, 0], [6, 0]]
            });
          });
        });
        return describe('a-function for go', function() {
          return it('select function', function() {
            return ensure('v a f', {
              selectedBufferRange: [[2, 0], [7, 0]]
            });
          });
        });
      });
    });
    describe('CurrentLine', function() {
      beforeEach(function() {
        return set({
          text: "This is\n  multi line\ntext"
        });
      });
      describe('inner-current-line', function() {
        it('select current line without including last newline', function() {
          set({
            cursor: [0, 0]
          });
          return ensure('v i l', {
            selectedText: 'This is'
          });
        });
        return it('also skip leading white space', function() {
          set({
            cursor: [1, 0]
          });
          return ensure('v i l', {
            selectedText: 'multi line'
          });
        });
      });
      return describe('a-current-line', function() {
        it('select current line without including last newline as like `vil`', function() {
          set({
            cursor: [0, 0]
          });
          return ensure('v a l', {
            selectedText: 'This is'
          });
        });
        return it('wont skip leading white space not like `vil`', function() {
          set({
            cursor: [1, 0]
          });
          return ensure('v a l', {
            selectedText: '  multi line'
          });
        });
      });
    });
    describe('Entire', function() {
      var text;
      text = "This is\n  multi line\ntext";
      beforeEach(function() {
        return set({
          text: text,
          cursor: [0, 0]
        });
      });
      describe('inner-entire', function() {
        return it('select entire buffer', function() {
          ensure('escape', {
            selectedText: ''
          });
          ensure('v i e', {
            selectedText: text
          });
          ensure('escape', {
            selectedText: ''
          });
          return ensure('j j v i e', {
            selectedText: text
          });
        });
      });
      return describe('a-entire', function() {
        return it('select entire buffer', function() {
          ensure('escape', {
            selectedText: ''
          });
          ensure('v a e', {
            selectedText: text
          });
          ensure('escape', {
            selectedText: ''
          });
          return ensure('j j v a e', {
            selectedText: text
          });
        });
      });
    });
    return describe('SearchMatchForward, SearchBackwards', function() {
      var text;
      text = "0 xxx\n1 abc xxx\n2   xxx yyy\n3 xxx abc\n4 abc\n";
      beforeEach(function() {
        set({
          text: text,
          cursor: [0, 0]
        });
        ensure([
          '/', {
            search: 'abc'
          }
        ], {
          cursor: [1, 2],
          mode: 'normal'
        });
        return expect(vimState.globalState.get('lastSearchPattern')).toEqual(/abc/g);
      });
      describe('gn from normal mode', function() {
        return it('select ranges matches to last search pattern and extend selection', function() {
          ensure('g n', {
            cursor: [1, 5],
            mode: ['visual', 'characterwise'],
            selectionIsReversed: false,
            selectedText: 'abc'
          });
          ensure('g n', {
            selectionIsReversed: false,
            mode: ['visual', 'characterwise'],
            selectedText: "abc xxx\n2   xxx yyy\n3 xxx abc"
          });
          ensure('g n', {
            selectionIsReversed: false,
            mode: ['visual', 'characterwise'],
            selectedText: "abc xxx\n2   xxx yyy\n3 xxx abc\n4 abc"
          });
          return ensure('g n', {
            selectionIsReversed: false,
            mode: ['visual', 'characterwise'],
            selectedText: "abc xxx\n2   xxx yyy\n3 xxx abc\n4 abc"
          });
        });
      });
      describe('gN from normal mode', function() {
        beforeEach(function() {
          return set({
            cursor: [4, 3]
          });
        });
        return it('select ranges matches to last search pattern and extend selection', function() {
          ensure('g N', {
            cursor: [4, 2],
            mode: ['visual', 'characterwise'],
            selectionIsReversed: true,
            selectedText: 'abc'
          });
          ensure('g N', {
            selectionIsReversed: true,
            mode: ['visual', 'characterwise'],
            selectedText: "abc\n4 abc"
          });
          ensure('g N', {
            selectionIsReversed: true,
            mode: ['visual', 'characterwise'],
            selectedText: "abc xxx\n2   xxx yyy\n3 xxx abc\n4 abc"
          });
          return ensure('g N', {
            selectionIsReversed: true,
            mode: ['visual', 'characterwise'],
            selectedText: "abc xxx\n2   xxx yyy\n3 xxx abc\n4 abc"
          });
        });
      });
      return describe('as operator target', function() {
        it('delete next occurrence of last search pattern', function() {
          ensure('d g n', {
            cursor: [1, 2],
            mode: 'normal',
            text: "0 xxx\n1  xxx\n2   xxx yyy\n3 xxx abc\n4 abc\n"
          });
          ensure('.', {
            cursor: [3, 5],
            mode: 'normal',
            text_: "0 xxx\n1  xxx\n2   xxx yyy\n3 xxx_\n4 abc\n"
          });
          return ensure('.', {
            cursor: [4, 1],
            mode: 'normal',
            text_: "0 xxx\n1  xxx\n2   xxx yyy\n3 xxx_\n4 \n"
          });
        });
        return it('change next occurrence of last search pattern', function() {
          ensure('c g n', {
            cursor: [1, 2],
            mode: 'insert',
            text: "0 xxx\n1  xxx\n2   xxx yyy\n3 xxx abc\n4 abc\n"
          });
          keystroke('escape');
          set({
            cursor: [4, 0]
          });
          return ensure('c g N', {
            cursor: [3, 6],
            mode: 'insert',
            text_: "0 xxx\n1  xxx\n2   xxx yyy\n3 xxx_\n4 abc\n"
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvdGV4dC1vYmplY3Qtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEscUNBQUE7O0FBQUEsRUFBQSxPQUFvQyxPQUFBLENBQVEsZUFBUixDQUFwQyxFQUFDLG1CQUFBLFdBQUQsRUFBYyxnQkFBQSxRQUFkLEVBQXdCLGdCQUFBLFFBQXhCLENBQUE7O0FBQUEsRUFFQSxRQUFBLENBQVMsWUFBVCxFQUF1QixTQUFBLEdBQUE7QUFDckIsUUFBQSxtRkFBQTtBQUFBLElBQUEsUUFBNEQsRUFBNUQsRUFBQyxjQUFELEVBQU0saUJBQU4sRUFBYyxvQkFBZCxFQUF5QixpQkFBekIsRUFBaUMsd0JBQWpDLEVBQWdELG1CQUFoRCxDQUFBO0FBQUEsSUFFQSxtQkFBQSxHQUFzQixTQUFDLFVBQUQsR0FBQTthQUNwQixTQUFDLFlBQUQsRUFBZSxTQUFmLEVBQTBCLE9BQTFCLEdBQUE7QUFDRSxRQUFBLEdBQUEsQ0FBSTtBQUFBLFVBQUEsTUFBQSxFQUFRLFlBQVI7U0FBSixDQUFBLENBQUE7ZUFDQSxNQUFBLENBQU8sRUFBQSxHQUFHLFNBQUgsR0FBYSxHQUFiLEdBQWdCLFVBQXZCLEVBQXFDLE9BQXJDLEVBRkY7TUFBQSxFQURvQjtJQUFBLENBRnRCLENBQUE7QUFBQSxJQU9BLFVBQUEsQ0FBVyxTQUFBLEdBQUE7YUFDVCxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsU0FBUixHQUFBO0FBQ1YsUUFBQSxRQUFBLEdBQVcsS0FBWCxDQUFBO0FBQUEsUUFDQyxrQkFBQSxNQUFELEVBQVMseUJBQUEsYUFEVCxDQUFBO2VBRUMsZ0JBQUEsR0FBRCxFQUFNLG1CQUFBLE1BQU4sRUFBYyxzQkFBQSxTQUFkLEVBQTJCLFVBSGpCO01BQUEsQ0FBWixFQURT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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/spec/text-object-spec.coffee
