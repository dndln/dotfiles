(function() {
  var dispatch, getVimState, settings, _ref;

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, dispatch = _ref.dispatch;

  settings = require('../lib/settings');

  describe("Operator TransformString", function() {
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
    describe('the ~ keybinding', function() {
      beforeEach(function() {
        return set({
          text: 'aBc\nXyZ',
          cursorBuffer: [[0, 0], [1, 0]]
        });
      });
      it('toggles the case and moves right', function() {
        ensure('~', {
          text: 'ABc\nxyZ',
          cursor: [[0, 1], [1, 1]]
        });
        ensure('~', {
          text: 'Abc\nxYZ',
          cursor: [[0, 2], [1, 2]]
        });
        return ensure('~', {
          text: 'AbC\nxYz',
          cursor: [[0, 2], [1, 2]]
        });
      });
      it('takes a count', function() {
        return ensure('4 ~', {
          text: 'AbC\nxYz',
          cursor: [[0, 2], [1, 2]]
        });
      });
      describe("in visual mode", function() {
        return it("toggles the case of the selected text", function() {
          set({
            cursorBuffer: [0, 0]
          });
          return ensure('V ~', {
            text: 'AbC\nXyZ'
          });
        });
      });
      return describe("with g and motion", function() {
        it("toggles the case of text, won't move cursor", function() {
          set({
            cursorBuffer: [0, 0]
          });
          return ensure('g ~ 2 l', {
            text: 'Abc\nXyZ',
            cursor: [0, 0]
          });
        });
        it("g~~ toggles the line of text, won't move cursor", function() {
          set({
            cursorBuffer: [0, 1]
          });
          return ensure('g ~ ~', {
            text: 'AbC\nXyZ',
            cursor: [0, 1]
          });
        });
        return it("g~g~ toggles the line of text, won't move cursor", function() {
          set({
            cursorBuffer: [0, 1]
          });
          return ensure('g ~ g ~', {
            text: 'AbC\nXyZ',
            cursor: [0, 1]
          });
        });
      });
    });
    describe('the U keybinding', function() {
      beforeEach(function() {
        return set({
          text: 'aBc\nXyZ',
          cursorBuffer: [0, 0]
        });
      });
      it("makes text uppercase with g and motion, and won't move cursor", function() {
        ensure('g U l', {
          text: 'ABc\nXyZ',
          cursor: [0, 0]
        });
        ensure('g U e', {
          text: 'ABC\nXyZ',
          cursor: [0, 0]
        });
        set({
          cursorBuffer: [1, 0]
        });
        return ensure('g U $', {
          text: 'ABC\nXYZ',
          cursor: [1, 0]
        });
      });
      it("makes the selected text uppercase in visual mode", function() {
        return ensure('V U', {
          text: 'ABC\nXyZ'
        });
      });
      it("gUU upcase the line of text, won't move cursor", function() {
        set({
          cursorBuffer: [0, 1]
        });
        return ensure('g U U', {
          text: 'ABC\nXyZ',
          cursor: [0, 1]
        });
      });
      return it("gUgU upcase the line of text, won't move cursor", function() {
        set({
          cursorBuffer: [0, 1]
        });
        return ensure('g U g U', {
          text: 'ABC\nXyZ',
          cursor: [0, 1]
        });
      });
    });
    describe('the u keybinding', function() {
      beforeEach(function() {
        return set({
          text: 'aBc\nXyZ',
          cursorBuffer: [0, 0]
        });
      });
      it("makes text lowercase with g and motion, and won't move cursor", function() {
        return ensure('g u $', {
          text: 'abc\nXyZ',
          cursor: [0, 0]
        });
      });
      it("makes the selected text lowercase in visual mode", function() {
        return ensure('V u', {
          text: 'abc\nXyZ'
        });
      });
      it("guu downcase the line of text, won't move cursor", function() {
        set({
          cursorBuffer: [0, 1]
        });
        return ensure('g u u', {
          text: 'abc\nXyZ',
          cursor: [0, 1]
        });
      });
      return it("gugu downcase the line of text, won't move cursor", function() {
        set({
          cursorBuffer: [0, 1]
        });
        return ensure('g u g u', {
          text: 'abc\nXyZ',
          cursor: [0, 1]
        });
      });
    });
    describe("the > keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12345\nabcde\nABCDE"
        });
      });
      describe("on the last line", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 0]
          });
        });
        return describe("when followed by a >", function() {
          return it("indents the current line", function() {
            return ensure('> >', {
              text: "12345\nabcde\n  ABCDE",
              cursor: [2, 2]
            });
          });
        });
      });
      describe("on the first line", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        describe("when followed by a >", function() {
          return it("indents the current line", function() {
            return ensure('> >', {
              text: "  12345\nabcde\nABCDE",
              cursor: [0, 2]
            });
          });
        });
        return describe("when followed by a repeating >", function() {
          beforeEach(function() {
            return keystroke('3 > >');
          });
          it("indents multiple lines at once", function() {
            return ensure({
              text: "  12345\n  abcde\n  ABCDE",
              cursor: [0, 2]
            });
          });
          return describe("undo behavior", function() {
            return it("outdents all three lines", function() {
              return ensure('u', {
                text: "12345\nabcde\nABCDE"
              });
            });
          });
        });
      });
      describe("in visual mode", function() {
        beforeEach(function() {
          set({
            cursor: [0, 0]
          });
          return keystroke('V >');
        });
        it("indents the current line and exits visual mode", function() {
          return ensure({
            mode: 'normal',
            text: "  12345\nabcde\nABCDE",
            selectedBufferRange: [[0, 2], [0, 2]]
          });
        });
        return it("allows repeating the operation", function() {
          return ensure('.', {
            text: "    12345\nabcde\nABCDE"
          });
        });
      });
      return describe("in visual mode and stayOnTransformString enabled", function() {
        beforeEach(function() {
          settings.set('stayOnTransformString', true);
          return set({
            cursor: [0, 0]
          });
        });
        it("indents the currrent selection and exits visual mode", function() {
          return ensure('v j >', {
            mode: 'normal',
            cursor: [1, 2],
            text: "  12345\n  abcde\nABCDE"
          });
        });
        it("when repeated, operate on same range when cursor was not moved", function() {
          ensure('v j >', {
            mode: 'normal',
            cursor: [1, 2],
            text: "  12345\n  abcde\nABCDE"
          });
          return ensure('.', {
            mode: 'normal',
            cursor: [1, 4],
            text: "    12345\n    abcde\nABCDE"
          });
        });
        return it("when repeated, operate on relative range from cursor position with same extent when cursor was moved", function() {
          ensure('v j >', {
            mode: 'normal',
            cursor: [1, 2],
            text: "  12345\n  abcde\nABCDE"
          });
          return ensure('l .', {
            mode: 'normal',
            cursor: [1, 5],
            text_: "__12345\n____abcde\n__ABCDE"
          });
        });
      });
    });
    describe("the < keybinding", function() {
      beforeEach(function() {
        return set({
          text: "  12345\n  abcde\nABCDE",
          cursor: [0, 0]
        });
      });
      describe("when followed by a <", function() {
        return it("indents the current line", function() {
          return ensure('< <', {
            text: "12345\n  abcde\nABCDE",
            cursor: [0, 0]
          });
        });
      });
      describe("when followed by a repeating <", function() {
        beforeEach(function() {
          return keystroke('2 < <');
        });
        it("indents multiple lines at once", function() {
          return ensure({
            text: "12345\nabcde\nABCDE",
            cursor: [0, 0]
          });
        });
        return describe("undo behavior", function() {
          return it("indents both lines", function() {
            return ensure('u', {
              text: "  12345\n  abcde\nABCDE"
            });
          });
        });
      });
      return describe("in visual mode", function() {
        return it("indents the current line and exits visual mode", function() {
          return ensure('V <', {
            mode: 'normal',
            text: "12345\n  abcde\nABCDE",
            selectedBufferRange: [[0, 0], [0, 0]]
          });
        });
      });
    });
    describe("the = keybinding", function() {
      var oldGrammar;
      oldGrammar = [];
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-javascript');
        });
        oldGrammar = editor.getGrammar();
        return set({
          text: "foo\n  bar\n  baz",
          cursor: [1, 0]
        });
      });
      return describe("when used in a scope that supports auto-indent", function() {
        beforeEach(function() {
          var jsGrammar;
          jsGrammar = atom.grammars.grammarForScopeName('source.js');
          return editor.setGrammar(jsGrammar);
        });
        afterEach(function() {
          return editor.setGrammar(oldGrammar);
        });
        describe("when followed by a =", function() {
          beforeEach(function() {
            return keystroke('= =');
          });
          return it("indents the current line", function() {
            return expect(editor.indentationForBufferRow(1)).toBe(0);
          });
        });
        return describe("when followed by a repeating =", function() {
          beforeEach(function() {
            return keystroke('2 = =');
          });
          it("autoindents multiple lines at once", function() {
            return ensure({
              text: "foo\nbar\nbaz",
              cursor: [1, 0]
            });
          });
          return describe("undo behavior", function() {
            return it("indents both lines", function() {
              return ensure('u', {
                text: "foo\n  bar\n  baz"
              });
            });
          });
        });
      });
    });
    describe('CamelCase', function() {
      beforeEach(function() {
        return set({
          text: 'vim-mode\natom-text-editor\n',
          cursorBuffer: [0, 0]
        });
      });
      it("transform text by motion and repeatable", function() {
        ensure('g c $', {
          text: 'vimMode\natom-text-editor\n',
          cursor: [0, 0]
        });
        return ensure('j .', {
          text: 'vimMode\natomTextEditor\n',
          cursor: [1, 0]
        });
      });
      it("transform selection", function() {
        return ensure('V j g c', {
          text: 'vimMode\natomTextEditor\n',
          cursor: [0, 0]
        });
      });
      return it("repeating twice works on current-line and won't move cursor", function() {
        return ensure('l g c g c', {
          text: 'vimMode\natom-text-editor\n',
          cursor: [0, 1]
        });
      });
    });
    describe('PascalCase', function() {
      beforeEach(function() {
        return set({
          text: 'vim-mode\natom-text-editor\n',
          cursorBuffer: [0, 0]
        });
      });
      it("transform text by motion and repeatable", function() {
        ensure('g C $', {
          text: 'VimMode\natom-text-editor\n',
          cursor: [0, 0]
        });
        return ensure('j .', {
          text: 'VimMode\nAtomTextEditor\n',
          cursor: [1, 0]
        });
      });
      it("transform selection", function() {
        return ensure('V j g C', {
          text: 'VimMode\natomTextEditor\n',
          cursor: [0, 0]
        });
      });
      return it("repeating twice works on current-line and won't move cursor", function() {
        return ensure('l g C g C', {
          text: 'VimMode\natom-text-editor\n',
          cursor: [0, 1]
        });
      });
    });
    describe('SnakeCase', function() {
      beforeEach(function() {
        set({
          text: 'vim-mode\natom-text-editor\n',
          cursorBuffer: [0, 0]
        });
        return atom.keymaps.add("g_", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g _': 'vim-mode-plus:snake-case'
          }
        });
      });
      it("transform text by motion and repeatable", function() {
        ensure('g _ $', {
          text: 'vim_mode\natom-text-editor\n',
          cursor: [0, 0]
        });
        return ensure('j .', {
          text: 'vim_mode\natom_text_editor\n',
          cursor: [1, 0]
        });
      });
      it("transform selection", function() {
        return ensure('V j g _', {
          text: 'vim_mode\natom_text_editor\n',
          cursor: [0, 0]
        });
      });
      return it("repeating twice works on current-line and won't move cursor", function() {
        return ensure('l g _ g _', {
          text: 'vim_mode\natom-text-editor\n',
          cursor: [0, 1]
        });
      });
    });
    describe('DashCase', function() {
      beforeEach(function() {
        return set({
          text: 'vimMode\natom_text_editor\n',
          cursorBuffer: [0, 0]
        });
      });
      it("transform text by motion and repeatable", function() {
        ensure('g - $', {
          text: 'vim-mode\natom_text_editor\n',
          cursor: [0, 0]
        });
        return ensure('j .', {
          text: 'vim-mode\natom-text-editor\n',
          cursor: [1, 0]
        });
      });
      it("transform selection", function() {
        return ensure('V j g -', {
          text: 'vim-mode\natom-text-editor\n',
          cursor: [0, 0]
        });
      });
      return it("repeating twice works on current-line and won't move cursor", function() {
        return ensure('l g - g -', {
          text: 'vim-mode\natom_text_editor\n',
          cursor: [0, 1]
        });
      });
    });
    describe('ConvertToSoftTab', function() {
      beforeEach(function() {
        return atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g tab': 'vim-mode-plus:convert-to-soft-tab'
          }
        });
      });
      return describe("basic behavior", function() {
        return it("convert tabs to spaces", function() {
          expect(editor.getTabLength()).toBe(2);
          set({
            text: "\tvar10 =\t\t0;",
            cursor: [0, 0]
          });
          return ensure('g tab $', {
            text: "  var10 =   0;"
          });
        });
      });
    });
    describe('ConvertToHardTab', function() {
      beforeEach(function() {
        return atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g shift-tab': 'vim-mode-plus:convert-to-hard-tab'
          }
        });
      });
      return describe("basic behavior", function() {
        return it("convert spaces to tabs", function() {
          expect(editor.getTabLength()).toBe(2);
          set({
            text: "  var10 =    0;",
            cursor: [0, 0]
          });
          return ensure('g shift-tab $', {
            text: "\tvar10\t=\t\t 0;"
          });
        });
      });
    });
    describe('CompactSpaces', function() {
      beforeEach(function() {
        return set({
          cursorBuffer: [0, 0]
        });
      });
      return describe("basic behavior", function() {
        it("compats multiple space into one", function() {
          set({
            text: 'var0   =   0; var10   =   10',
            cursor: [0, 0]
          });
          return ensure('g space $', {
            text: 'var0 = 0; var10 = 10'
          });
        });
        it("don't apply compaction for leading and trailing space", function() {
          set({
            text_: "___var0   =   0; var10   =   10___\n___var1   =   1; var11   =   11___\n___var2   =   2; var12   =   12___\n\n___var4   =   4; var14   =   14___",
            cursor: [0, 0]
          });
          return ensure('g space i p', {
            text_: "___var0 = 0; var10 = 10___\n___var1 = 1; var11 = 11___\n___var2 = 2; var12 = 12___\n\n___var4   =   4; var14   =   14___"
          });
        });
        return it("but it compact spaces when target all text is spaces", function() {
          set({
            text: '01234    90',
            cursor: [0, 5]
          });
          return ensure('g space w', {
            text: '01234 90'
          });
        });
      });
    });
    describe('TrimString', function() {
      beforeEach(function() {
        return set({
          text: " text = @getNewText( selection.getText(), selection )  ",
          cursor: [0, 42]
        });
      });
      return describe("basic behavior", function() {
        it("trim string for a-line text object", function() {
          set({
            text_: "___abc___\n___def___",
            cursor: [0, 0]
          });
          ensure('g | a l', {
            text_: "abc\n___def___"
          });
          return ensure('j .', {
            text_: "abc\ndef"
          });
        });
        it("trim string for inner-parenthesis text object", function() {
          set({
            text_: "(  abc  )\n(  def  )",
            cursor: [0, 0]
          });
          ensure('g | i (', {
            text_: "(abc)\n(  def  )"
          });
          return ensure('j .', {
            text_: "(abc)\n(def)"
          });
        });
        return it("trim string for inner-any-pair text object", function() {
          atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus.operator-pending-mode, atom-text-editor.vim-mode-plus.visual-mode': {
              'i ;': 'vim-mode-plus:inner-any-pair'
            }
          });
          set({
            text_: "( [ {  abc  } ] )",
            cursor: [0, 8]
          });
          ensure('g | i ;', {
            text_: "( [ {abc} ] )"
          });
          ensure('2 h .', {
            text_: "( [{abc}] )"
          });
          return ensure('2 h .', {
            text_: "([{abc}])"
          });
        });
      });
    });
    describe('surround', function() {
      beforeEach(function() {
        return set({
          text: "apple\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )",
          cursorBuffer: [0, 0]
        });
      });
      describe('surround', function() {
        beforeEach(function() {
          return atom.keymaps.add("surround-test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'y s': 'vim-mode-plus:surround'
            }
          }, 100);
        });
        it("surround text object with ( and repeatable", function() {
          ensure([
            'y s i w', {
              input: '('
            }
          ], {
            text: "(apple)\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )",
            cursor: [0, 0]
          });
          return ensure('j .', {
            text: "(apple)\n(pairs): [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
        });
        it("surround text object with { and repeatable", function() {
          ensure([
            'y s i w', {
              input: '{'
            }
          ], {
            text: "{apple}\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )",
            cursor: [0, 0]
          });
          return ensure('j .', {
            text: "{apple}\n{pairs}: [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
        });
        it("surround linewise", function() {
          ensure([
            'y s y s', {
              input: '{'
            }
          ], {
            text: "{\napple\n}\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )",
            cursor: [0, 0]
          });
          return ensure('3 j .', {
            text: "{\napple\n}\n{\npairs: [brackets]\n}\npairs: [brackets]\n( multi\n  line )"
          });
        });
        describe('with motion which aloso taking user-iinput', function() {
          beforeEach(function() {
            return set({
              text: "s _____ e",
              cursor: [0, 0]
            });
          });
          describe("with 'f' motion", function() {
            return it("surround with 'f' motion", function() {
              return ensure([
                'y s f', {
                  input: 'e('
                }
              ], {
                text: "(s _____ e)",
                cursor: [0, 0]
              });
            });
          });
          return describe("with '`' motion", function() {
            beforeEach(function() {
              set({
                cursor: [0, 8]
              });
              ensure('m a', {
                mark: {
                  'a': [0, 8]
                }
              });
              return set({
                cursor: [0, 0]
              });
            });
            return it("surround with '`' motion", function() {
              return ensure([
                'y s `', {
                  input: 'a('
                }
              ], {
                text: "(s _____ )e",
                cursor: [0, 0]
              });
            });
          });
        });
        return describe('charactersToAddSpaceOnSurround setting', function() {
          beforeEach(function() {
            settings.set('charactersToAddSpaceOnSurround', ['(', '{', '[']);
            return set({
              text: "apple\norange\nlemmon",
              cursorBuffer: [0, 0]
            });
          });
          describe("char is in charactersToAddSpaceOnSurround", function() {
            return it("add additional space inside pair char when surround", function() {
              ensure([
                'y s i w', {
                  input: '('
                }
              ], {
                text: "( apple )\norange\nlemmon"
              });
              keystroke('j');
              ensure([
                'y s i w', {
                  input: '{'
                }
              ], {
                text: "( apple )\n{ orange }\nlemmon"
              });
              keystroke('j');
              return ensure([
                'y s i w', {
                  input: '['
                }
              ], {
                text: "( apple )\n{ orange }\n[ lemmon ]"
              });
            });
          });
          return describe("char is not in charactersToAddSpaceOnSurround", function() {
            return it("add additional space inside pair char when surround", function() {
              ensure([
                'y s i w', {
                  input: ')'
                }
              ], {
                text: "(apple)\norange\nlemmon"
              });
              keystroke('j');
              ensure([
                'y s i w', {
                  input: '}'
                }
              ], {
                text: "(apple)\n{orange}\nlemmon"
              });
              keystroke('j');
              return ensure([
                'y s i w', {
                  input: ']'
                }
              ], {
                text: "(apple)\n{orange}\n[lemmon]"
              });
            });
          });
        });
      });
      describe('map-surround', function() {
        beforeEach(function() {
          jasmine.attachToDOM(editorElement);
          set({
            text: "\napple\npairs tomato\norange\nmilk\n",
            cursorBuffer: [1, 0]
          });
          return atom.keymaps.add("ms", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'm s': 'vim-mode-plus:map-surround'
            },
            'atom-text-editor.vim-mode-plus.visual-mode': {
              'm s': 'vim-mode-plus:map-surround'
            }
          });
        });
        it("surround text for each word in target case-1", function() {
          return ensure([
            'm s i p', {
              input: '('
            }
          ], {
            text: "\n(apple)\n(pairs) (tomato)\n(orange)\n(milk)\n",
            cursor: [1, 0]
          });
        });
        it("surround text for each word in target case-2", function() {
          set({
            cursor: [2, 1]
          });
          return ensure([
            'm s i l', {
              input: '<'
            }
          ], {
            text: '\napple\n<pairs> <tomato>\norange\nmilk\n',
            cursor: [2, 0]
          });
        });
        return it("surround text for each word in visual selection", function() {
          return ensure([
            'v i p m s', {
              input: '"'
            }
          ], {
            text: '\n"apple"\n"pairs" "tomato"\n"orange"\n"milk"\n',
            cursor: [1, 0]
          });
        });
      });
      describe('delete surround', function() {
        beforeEach(function() {
          atom.keymaps.add("surround-test", {
            'atom-text-editor.vim-mode-plus.normal-mode': {
              'd s': 'vim-mode-plus:delete-surround'
            }
          });
          return set({
            cursor: [1, 8]
          });
        });
        it("delete surrounded chars and repeatable", function() {
          ensure([
            'd s', {
              input: '['
            }
          ], {
            text: "apple\npairs: brackets\npairs: [brackets]\n( multi\n  line )"
          });
          return ensure('j l .', {
            text: "apple\npairs: brackets\npairs: brackets\n( multi\n  line )"
          });
        });
        it("delete surrounded chars expanded to multi-line", function() {
          set({
            cursor: [3, 1]
          });
          return ensure([
            'd s', {
              input: '('
            }
          ], {
            text: "apple\npairs: [brackets]\npairs: [brackets]\n multi\n  line "
          });
        });
        it("delete surrounded chars and trim padding spaces for non-identical pair-char", function() {
          set({
            text: "( apple )\n{  orange   }\n",
            cursor: [0, 0]
          });
          ensure([
            'd s', {
              input: '('
            }
          ], {
            text: "apple\n{  orange   }\n"
          });
          return ensure([
            'j d s', {
              input: '{'
            }
          ], {
            text: "apple\norange\n"
          });
        });
        it("delete surrounded chars and NOT trim padding spaces for identical pair-char", function() {
          set({
            text: "` apple `\n\"  orange   \"\n",
            cursor: [0, 0]
          });
          ensure([
            'd s', {
              input: '`'
            }
          ], {
            text_: '_apple_\n"__orange___"\n'
          });
          return ensure([
            'j d s', {
              input: '"'
            }
          ], {
            text_: "_apple_\n__orange___\n"
          });
        });
        return it("delete surrounded for multi-line but dont affect code layout", function() {
          set({
            cursor: [0, 34],
            text: "highlightRanges @editor, range, {\n  timeout: timeout\n  hello: world\n}"
          });
          return ensure([
            'd s', {
              input: '{'
            }
          ], {
            text: ["highlightRanges @editor, range, ", "  timeout: timeout", "  hello: world", ""].join("\n")
          });
        });
      });
      describe('change surround', function() {
        beforeEach(function() {
          atom.keymaps.add("surround-test", {
            'atom-text-editor.vim-mode-plus.normal-mode': {
              'c s': 'vim-mode-plus:change-surround'
            }
          });
          return set({
            text: "(apple)\n(grape)\n<lemmon>\n{orange}",
            cursorBuffer: [0, 1]
          });
        });
        it("change surrounded chars and repeatable", function() {
          ensure([
            'c s', {
              input: '(['
            }
          ], {
            text: "[apple]\n(grape)\n<lemmon>\n{orange}"
          });
          return ensure('j l .', {
            text: "[apple]\n[grape]\n<lemmon>\n{orange}"
          });
        });
        it("change surrounded chars", function() {
          ensure([
            'j j c s', {
              input: '<"'
            }
          ], {
            text: "(apple)\n(grape)\n\"lemmon\"\n{orange}"
          });
          return ensure([
            'j l c s', {
              input: '{!'
            }
          ], {
            text: "(apple)\n(grape)\n\"lemmon\"\n!orange!"
          });
        });
        it("change surrounded for multi-line but dont affect code layout", function() {
          set({
            cursor: [0, 34],
            text: "highlightRanges @editor, range, {\n  timeout: timeout\n  hello: world\n}"
          });
          return ensure([
            'c s', {
              input: '{('
            }
          ], {
            text: "highlightRanges @editor, range, (\n  timeout: timeout\n  hello: world\n)"
          });
        });
        return describe('charactersToAddSpaceOnSurround setting', function() {
          var ensureChangeSurround;
          ensureChangeSurround = function(inputKeystrokes, options) {
            var keystrokes;
            set({
              text: options.initialText,
              cursorBuffer: [0, 0]
            });
            delete options.initialText;
            keystrokes = ['c s'].concat({
              input: inputKeystrokes
            });
            return ensure(keystrokes, options);
          };
          beforeEach(function() {
            return settings.set('charactersToAddSpaceOnSurround', ['(', '{', '[']);
          });
          describe('when input char is in charactersToAddSpaceOnSurround', function() {
            describe('single line text', function() {
              return it("add single space around pair regardless of exsiting inner text", function() {
                ensureChangeSurround('({', {
                  initialText: "(apple)",
                  text: "{ apple }"
                });
                ensureChangeSurround('({', {
                  initialText: "( apple )",
                  text: "{ apple }"
                });
                return ensureChangeSurround('({', {
                  initialText: "(  apple  )",
                  text: "{ apple }"
                });
              });
            });
            return describe('multi line text', function() {
              return it("don't sadd single space around pair", function() {
                return ensureChangeSurround('({', {
                  initialText: "(\napple\n)",
                  text: "{\napple\n}"
                });
              });
            });
          });
          return describe('when first input char is not in charactersToAddSpaceOnSurround', function() {
            it("remove surrounding space of inner text for identical pair-char", function() {
              ensureChangeSurround('(}', {
                initialText: "(apple)",
                text: "{apple}"
              });
              ensureChangeSurround('(}', {
                initialText: "( apple )",
                text: "{apple}"
              });
              return ensureChangeSurround('(}', {
                initialText: "(  apple  )",
                text: "{apple}"
              });
            });
            return it("doesn't remove surrounding space of inner text for non-identical pair-char", function() {
              ensureChangeSurround('"`', {
                initialText: '"apple"',
                text: "`apple`"
              });
              ensureChangeSurround('"`', {
                initialText: '"  apple  "',
                text: "`  apple  `"
              });
              return ensureChangeSurround("\"'", {
                initialText: '"  apple  "',
                text: "'  apple  '"
              });
            });
          });
        });
      });
      describe('surround-word', function() {
        beforeEach(function() {
          return atom.keymaps.add("surround-test", {
            'atom-text-editor.vim-mode-plus.normal-mode': {
              'y s w': 'vim-mode-plus:surround-word'
            }
          });
        });
        it("surround a word with ( and repeatable", function() {
          ensure([
            'y s w', {
              input: '('
            }
          ], {
            text: "(apple)\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )",
            cursor: [0, 0]
          });
          return ensure('j .', {
            text: "(apple)\n(pairs): [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
        });
        return it("surround a word with { and repeatable", function() {
          ensure([
            'y s w', {
              input: '{'
            }
          ], {
            text: "{apple}\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )",
            cursor: [0, 0]
          });
          return ensure('j .', {
            text: "{apple}\n{pairs}: [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
        });
      });
      describe('delete-surround-any-pair', function() {
        beforeEach(function() {
          set({
            text: "apple\n(pairs: [brackets])\n{pairs \"s\" [brackets]}\n( multi\n  line )",
            cursor: [1, 9]
          });
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'd s': 'vim-mode-plus:delete-surround-any-pair'
            }
          });
        });
        it("delete surrounded any pair found and repeatable", function() {
          ensure('d s', {
            text: 'apple\n(pairs: brackets)\n{pairs "s" [brackets]}\n( multi\n  line )'
          });
          return ensure('.', {
            text: 'apple\npairs: brackets\n{pairs "s" [brackets]}\n( multi\n  line )'
          });
        });
        it("delete surrounded any pair found with skip pair out of cursor and repeatable", function() {
          set({
            cursor: [2, 14]
          });
          ensure('d s', {
            text: 'apple\n(pairs: [brackets])\n{pairs "s" brackets}\n( multi\n  line )'
          });
          ensure('.', {
            text: 'apple\n(pairs: [brackets])\npairs "s" brackets\n( multi\n  line )'
          });
          return ensure('.', {
            text: 'apple\n(pairs: [brackets])\npairs "s" brackets\n( multi\n  line )'
          });
        });
        return it("delete surrounded chars expanded to multi-line", function() {
          set({
            cursor: [3, 1]
          });
          return ensure('d s', {
            text: 'apple\n(pairs: [brackets])\n{pairs "s" [brackets]}\n multi\n  line '
          });
        });
      });
      describe('delete-surround-any-pair-allow-forwarding', function() {
        beforeEach(function() {
          settings.set('stayOnTransformString', true);
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'd s': 'vim-mode-plus:delete-surround-any-pair-allow-forwarding'
            }
          });
        });
        return it("[1] single line", function() {
          set({
            cursor: [0, 0],
            text: "___(inner)\n___(inner)"
          });
          ensure('d s', {
            text: "___inner\n___(inner)",
            cursor: [0, 0]
          });
          return ensure('j .', {
            text: "___inner\n___inner",
            cursor: [1, 0]
          });
        });
      });
      describe('change-surround-any-pair', function() {
        beforeEach(function() {
          set({
            text: "(apple)\n(grape)\n<lemmon>\n{orange}",
            cursor: [0, 1]
          });
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'c s': 'vim-mode-plus:change-surround-any-pair'
            }
          });
        });
        return it("change any surrounded pair found and repeatable", function() {
          ensure([
            'c s', {
              input: '<'
            }
          ], {
            text: "<apple>\n(grape)\n<lemmon>\n{orange}"
          });
          ensure('j .', {
            text: "<apple>\n<grape>\n<lemmon>\n{orange}"
          });
          return ensure('j j .', {
            text: "<apple>\n<grape>\n<lemmon>\n<orange>"
          });
        });
      });
      return describe('change-surround-any-pair-allow-forwarding', function() {
        beforeEach(function() {
          settings.set('stayOnTransformString', true);
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'c s': 'vim-mode-plus:change-surround-any-pair-allow-forwarding'
            }
          });
        });
        return it("[1] single line", function() {
          set({
            cursor: [0, 0],
            text: "___(inner)\n___(inner)"
          });
          ensure([
            'c s', {
              input: '<'
            }
          ], {
            text: "___<inner>\n___(inner)",
            cursor: [0, 0]
          });
          return ensure('j .', {
            text: "___<inner>\n___<inner>",
            cursor: [1, 0]
          });
        });
      });
    });
    describe('ReplaceWithRegister', function() {
      var originalText;
      originalText = null;
      beforeEach(function() {
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            '_': 'vim-mode-plus:replace-with-register'
          }
        });
        originalText = "abc def 'aaa'\nhere (parenthesis)\nhere (parenthesis)";
        set({
          text: originalText,
          cursor: [0, 9]
        });
        set({
          register: {
            '"': {
              text: 'default register',
              type: 'character'
            }
          }
        });
        return set({
          register: {
            'a': {
              text: 'A register',
              type: 'character'
            }
          }
        });
      });
      it("replace selection with regisgter's content", function() {
        ensure('v i w', {
          selectedText: 'aaa'
        });
        return ensure('_', {
          mode: 'normal',
          text: originalText.replace('aaa', 'default register')
        });
      });
      it("replace text object with regisgter's content", function() {
        set({
          cursor: [1, 6]
        });
        return ensure('_ i (', {
          mode: 'normal',
          text: originalText.replace('parenthesis', 'default register')
        });
      });
      it("can repeat", function() {
        set({
          cursor: [1, 6]
        });
        return ensure('_ i ( j .', {
          mode: 'normal',
          text: originalText.replace(/parenthesis/g, 'default register')
        });
      });
      return it("can use specified register to replace with", function() {
        set({
          cursor: [1, 6]
        });
        return ensure([
          '"', {
            input: 'a'
          }, '_ i ('
        ], {
          mode: 'normal',
          text: originalText.replace('parenthesis', 'A register')
        });
      });
    });
    describe('SwapWithRegister', function() {
      var originalText;
      originalText = null;
      beforeEach(function() {
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g p': 'vim-mode-plus:swap-with-register'
          }
        });
        originalText = "abc def 'aaa'\nhere (111)\nhere (222)";
        set({
          text: originalText,
          cursor: [0, 9]
        });
        set({
          register: {
            '"': {
              text: 'default register',
              type: 'character'
            }
          }
        });
        return set({
          register: {
            'a': {
              text: 'A register',
              type: 'character'
            }
          }
        });
      });
      it("swap selection with regisgter's content", function() {
        ensure('v i w', {
          selectedText: 'aaa'
        });
        return ensure('g p', {
          mode: 'normal',
          text: originalText.replace('aaa', 'default register'),
          register: {
            '"': {
              text: 'aaa'
            }
          }
        });
      });
      it("swap text object with regisgter's content", function() {
        set({
          cursor: [1, 6]
        });
        return ensure('g p i (', {
          mode: 'normal',
          text: originalText.replace('111', 'default register'),
          register: {
            '"': {
              text: '111'
            }
          }
        });
      });
      it("can repeat", function() {
        var updatedText;
        set({
          cursor: [1, 6]
        });
        updatedText = "abc def 'aaa'\nhere (default register)\nhere (111)";
        return ensure('g p i ( j .', {
          mode: 'normal',
          text: updatedText,
          register: {
            '"': {
              text: '222'
            }
          }
        });
      });
      return it("can use specified register to swap with", function() {
        set({
          cursor: [1, 6]
        });
        return ensure([
          '"', {
            input: 'a'
          }, 'g p i ('
        ], {
          mode: 'normal',
          text: originalText.replace('111', 'A register'),
          register: {
            'a': {
              text: '111'
            }
          }
        });
      });
    });
    describe('Reverse and Sort', function() {
      beforeEach(function() {
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g r': 'vim-mode-plus:reverse',
            'g s': 'vim-mode-plus:sort'
          }
        });
        return set({
          text: "a\n2\nc\n3\n1\nb\n",
          cursor: [2, 0]
        });
      });
      return it('sort rows, reverse rows', function() {
        ensure("g s i p", function() {
          return {
            text: "1\n2\n3\na\nb\nc\n"
          };
        });
        return ensure("g r i p", function() {
          return {
            text: "c\nb\na\n3\n2\n1\n"
          };
        });
      });
    });
    return describe('ToggleLineComments', function() {
      var oldGrammar, originalText, _ref2;
      _ref2 = [], oldGrammar = _ref2[0], originalText = _ref2[1];
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        return runs(function() {
          var grammar;
          oldGrammar = editor.getGrammar();
          grammar = atom.grammars.grammarForScopeName('source.coffee');
          editor.setGrammar(grammar);
          originalText = "class Base\n  constructor: (args) ->\n    pivot = items.shift()\n    left = []\n    right = []\n\nconsole.log \"hello\"";
          return set({
            text: originalText
          });
        });
      });
      afterEach(function() {
        return editor.setGrammar(oldGrammar);
      });
      it('toggle comment for textobject for indent and repeatable', function() {
        set({
          cursor: [2, 0]
        });
        ensure('g / i i', {
          text: "class Base\n  constructor: (args) ->\n    # pivot = items.shift()\n    # left = []\n    # right = []\n\nconsole.log \"hello\""
        });
        return ensure('.', {
          text: originalText
        });
      });
      return it('toggle comment for textobject for paragraph and repeatable', function() {
        set({
          cursor: [2, 0]
        });
        ensure('g / i p', {
          text: "# class Base\n#   constructor: (args) ->\n#     pivot = items.shift()\n#     left = []\n#     right = []\n\nconsole.log \"hello\""
        });
        return ensure('.', {
          text: originalText
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvb3BlcmF0b3ItdHJhbnNmb3JtLXN0cmluZy1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxxQ0FBQTs7QUFBQSxFQUFBLE9BQTBCLE9BQUEsQ0FBUSxlQUFSLENBQTFCLEVBQUMsbUJBQUEsV0FBRCxFQUFjLGdCQUFBLFFBQWQsQ0FBQTs7QUFBQSxFQUNBLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVIsQ0FEWCxDQUFBOztBQUFBLEVBR0EsUUFBQSxDQUFTLDBCQUFULEVBQXFDLFNBQUEsR0FBQTtBQUNuQyxRQUFBLDhEQUFBO0FBQUEsSUFBQSxRQUE0RCxFQUE1RCxFQUFDLGNBQUQsRUFBTSxpQkFBTixFQUFjLG9CQUFkLEVBQXlCLGlCQUF6QixFQUFpQyx3QkFBakMsRUFBZ0QsbUJBQWhELENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7YUFDVCxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsR0FBUixHQUFBO0FBQ1YsUUFBQSxRQUFBLEdBQVcsS0FBWCxDQUFBO0FBQUEsUUFDQyxrQkFBQSxNQUFELEVBQVMseUJBQUEsYUFEVCxDQUFBO2VBRUMsVUFBQSxHQUFELEVBQU0sYUFBQSxNQUFOLEVBQWMsZ0JBQUEsU0FBZCxFQUEyQixJQUhqQjtNQUFBLENBQVosRUFEUztJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUFRQSxTQUFBLENBQVUsU0FBQSxHQUFBO2FBQ1IsUUFBUSxDQUFDLGVBQVQsQ0FBQSxFQURRO0lBQUEsQ0FBVixDQVJBLENBQUE7QUFBQSxJQVdBLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBLEdBQUE7QUFDM0IsTUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2VBQ1QsR0FBQSxDQUNFO0FBQUEs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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/spec/operator-transform-string-spec.coffee
