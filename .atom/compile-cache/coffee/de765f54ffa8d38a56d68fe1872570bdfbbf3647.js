(function() {
  var TextData, dispatch, getVimState, settings, _ref,
    __slice = [].slice;

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, dispatch = _ref.dispatch, TextData = _ref.TextData;

  settings = require('../lib/settings');

  describe("Operator general", function() {
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
    describe("cancelling operations", function() {
      return it("clear pending operation", function() {
        keystroke('/');
        expect(vimState.operationStack.isEmpty()).toBe(false);
        vimState.searchInput.cancel();
        expect(vimState.operationStack.isEmpty()).toBe(true);
        return expect(function() {
          return vimState.searchInput.cancel();
        }).not.toThrow();
      });
    });
    describe("the x keybinding", function() {
      describe("on a line with content", function() {
        describe("without vim-mode-plus.wrapLeftRightMotion", function() {
          beforeEach(function() {
            return set({
              text: "abc\n012345\n\nxyz",
              cursor: [1, 4]
            });
          });
          it("deletes a character", function() {
            ensure('x', {
              text: 'abc\n01235\n\nxyz',
              cursor: [1, 4],
              register: {
                '"': {
                  text: '4'
                }
              }
            });
            ensure('x', {
              text: 'abc\n0123\n\nxyz',
              cursor: [1, 3],
              register: {
                '"': {
                  text: '5'
                }
              }
            });
            ensure('x', {
              text: 'abc\n012\n\nxyz',
              cursor: [1, 2],
              register: {
                '"': {
                  text: '3'
                }
              }
            });
            ensure('x', {
              text: 'abc\n01\n\nxyz',
              cursor: [1, 1],
              register: {
                '"': {
                  text: '2'
                }
              }
            });
            ensure('x', {
              text: 'abc\n0\n\nxyz',
              cursor: [1, 0],
              register: {
                '"': {
                  text: '1'
                }
              }
            });
            return ensure('x', {
              text: 'abc\n\n\nxyz',
              cursor: [1, 0],
              register: {
                '"': {
                  text: '0'
                }
              }
            });
          });
          return it("deletes multiple characters with a count", function() {
            ensure('2 x', {
              text: 'abc\n0123\n\nxyz',
              cursor: [1, 3],
              register: {
                '"': {
                  text: '45'
                }
              }
            });
            set({
              cursor: [0, 1]
            });
            return ensure('3 x', {
              text: 'a\n0123\n\nxyz',
              cursor: [0, 0],
              register: {
                '"': {
                  text: 'bc'
                }
              }
            });
          });
        });
        describe("with multiple cursors", function() {
          beforeEach(function() {
            return set({
              text: "abc\n012345\n\nxyz",
              cursor: [[1, 4], [0, 1]]
            });
          });
          return it("is undone as one operation", function() {
            ensure('x', {
              text: "ac\n01235\n\nxyz"
            });
            return ensure('u', {
              text: 'abc\n012345\n\nxyz'
            });
          });
        });
        return describe("with vim-mode-plus.wrapLeftRightMotion", function() {
          beforeEach(function() {
            set({
              text: 'abc\n012345\n\nxyz',
              cursor: [1, 4]
            });
            return settings.set('wrapLeftRightMotion', true);
          });
          it("deletes a character", function() {
            ensure('x', {
              text: 'abc\n01235\n\nxyz',
              cursor: [1, 4],
              register: {
                '"': {
                  text: '4'
                }
              }
            });
            ensure('x', {
              text: 'abc\n0123\n\nxyz',
              cursor: [1, 3],
              register: {
                '"': {
                  text: '5'
                }
              }
            });
            ensure('x', {
              text: 'abc\n012\n\nxyz',
              cursor: [1, 2],
              register: {
                '"': {
                  text: '3'
                }
              }
            });
            ensure('x', {
              text: 'abc\n01\n\nxyz',
              cursor: [1, 1],
              register: {
                '"': {
                  text: '2'
                }
              }
            });
            ensure('x', {
              text: 'abc\n0\n\nxyz',
              cursor: [1, 0],
              register: {
                '"': {
                  text: '1'
                }
              }
            });
            return ensure('x', {
              text: 'abc\n\n\nxyz',
              cursor: [1, 0],
              register: {
                '"': {
                  text: '0'
                }
              }
            });
          });
          return it("deletes multiple characters and newlines with a count", function() {
            settings.set('wrapLeftRightMotion', true);
            ensure('2 x', {
              text: 'abc\n0123\n\nxyz',
              cursor: [1, 3],
              register: {
                '"': {
                  text: '45'
                }
              }
            });
            set({
              cursor: [0, 1]
            });
            ensure('3 x', {
              text: 'a0123\n\nxyz',
              cursor: [0, 1],
              register: {
                '"': {
                  text: 'bc\n'
                }
              }
            });
            return ensure('7 x', {
              text: 'ayz',
              cursor: [0, 1],
              register: {
                '"': {
                  text: '0123\n\nx'
                }
              }
            });
          });
        });
      });
      return describe("on an empty line", function() {
        beforeEach(function() {
          return set({
            text: "abc\n012345\n\nxyz",
            cursor: [2, 0]
          });
        });
        it("deletes nothing on an empty line when vim-mode-plus.wrapLeftRightMotion is false", function() {
          settings.set('wrapLeftRightMotion', false);
          return ensure('x', {
            text: "abc\n012345\n\nxyz",
            cursor: [2, 0]
          });
        });
        return it("deletes an empty line when vim-mode-plus.wrapLeftRightMotion is true", function() {
          settings.set('wrapLeftRightMotion', true);
          return ensure('x', {
            text: "abc\n012345\nxyz",
            cursor: [2, 0]
          });
        });
      });
    });
    describe("the X keybinding", function() {
      describe("on a line with content", function() {
        beforeEach(function() {
          return set({
            text: "ab\n012345",
            cursor: [1, 2]
          });
        });
        return it("deletes a character", function() {
          ensure('X', {
            text: 'ab\n02345',
            cursor: [1, 1],
            register: {
              '"': {
                text: '1'
              }
            }
          });
          ensure('X', {
            text: 'ab\n2345',
            cursor: [1, 0],
            register: {
              '"': {
                text: '0'
              }
            }
          });
          ensure('X', {
            text: 'ab\n2345',
            cursor: [1, 0],
            register: {
              '"': {
                text: '0'
              }
            }
          });
          settings.set('wrapLeftRightMotion', true);
          return ensure('X', {
            text: 'ab2345',
            cursor: [0, 2],
            register: {
              '"': {
                text: '\n'
              }
            }
          });
        });
      });
      return describe("on an empty line", function() {
        beforeEach(function() {
          return set({
            text: "012345\n\nabcdef",
            cursor: [1, 0]
          });
        });
        it("deletes nothing when vim-mode-plus.wrapLeftRightMotion is false", function() {
          settings.set('wrapLeftRightMotion', false);
          return ensure('X', {
            text: "012345\n\nabcdef",
            cursor: [1, 0]
          });
        });
        return it("deletes the newline when wrapLeftRightMotion is true", function() {
          settings.set('wrapLeftRightMotion', true);
          return ensure('X', {
            text: "012345\nabcdef",
            cursor: [0, 5]
          });
        });
      });
    });
    describe("the d keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12345\nabcde\n\nABCDE\n",
          cursor: [1, 1]
        });
      });
      it("enters operator-pending mode", function() {
        return ensure('d', {
          mode: 'operator-pending'
        });
      });
      describe("when followed by a d", function() {
        it("deletes the current line and exits operator-pending mode", function() {
          set({
            cursor: [1, 1]
          });
          return ensure('d d', {
            text: "12345\n\nABCDE\n",
            cursor: [1, 0],
            register: {
              '"': {
                text: "abcde\n"
              }
            },
            mode: 'normal'
          });
        });
        it("deletes the last line and always make non-blank-line last line", function() {
          set({
            cursor: [2, 0]
          });
          return ensure('2 d d', {
            text: "12345\nabcde\n",
            cursor: [1, 0]
          });
        });
        return it("leaves the cursor on the first nonblank character", function() {
          set({
            text: "12345\n  abcde\n",
            cursor: [0, 4]
          });
          return ensure('d d', {
            text: "  abcde\n",
            cursor: [0, 2]
          });
        });
      });
      describe("undo behavior", function() {
        var originalText;
        originalText = "12345\nabcde\nABCDE\nQWERT";
        beforeEach(function() {
          return set({
            text: originalText,
            cursor: [1, 1]
          });
        });
        it("undoes both lines", function() {
          return ensure('d 2 d u', {
            text: originalText,
            selectedText: ''
          });
        });
        return describe("with multiple cursors", function() {
          beforeEach(function() {
            return set({
              cursor: [[1, 1], [0, 0]]
            });
          });
          describe("setCursorToStartOfChangeOnUndoRedo is true(default)", function() {
            return it("is undone as one operation and clear cursors", function() {
              return ensure('d l u', {
                text: originalText,
                selectedText: [''],
                numCursors: 1
              });
            });
          });
          return describe("setCursorToStartOfChangeOnUndoRedo is false", function() {
            beforeEach(function() {
              return settings.set('setCursorToStartOfChangeOnUndoRedo', false);
            });
            return it("is undone as one operation", function() {
              return ensure('d l u', {
                text: originalText,
                selectedText: ['', ''],
                numCursors: 2
              });
            });
          });
        });
      });
      describe("when followed by a w", function() {
        it("deletes the next word until the end of the line and exits operator-pending mode", function() {
          set({
            text: 'abcd efg\nabc',
            cursor: [0, 5]
          });
          return ensure('d w', {
            text: "abcd \nabc",
            cursor: [0, 4],
            mode: 'normal'
          });
        });
        return it("deletes to the beginning of the next word", function() {
          set({
            text: 'abcd efg',
            cursor: [0, 2]
          });
          ensure('d w', {
            text: 'abefg',
            cursor: [0, 2]
          });
          set({
            text: 'one two three four',
            cursor: [0, 0]
          });
          return ensure('d 3 w', {
            text: 'four',
            cursor: [0, 0]
          });
        });
      });
      describe("when followed by an iw", function() {
        return it("deletes the containing word", function() {
          set({
            text: "12345 abcde ABCDE",
            cursor: [0, 9]
          });
          ensure('d', {
            mode: 'operator-pending'
          });
          return ensure('i w', {
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
      });
      describe("when followed by a j", function() {
        var originalText;
        originalText = "12345\nabcde\nABCDE\n";
        beforeEach(function() {
          return set({
            text: originalText
          });
        });
        describe("on the beginning of the file", function() {
          return it("deletes the next two lines", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('d j', {
              text: 'ABCDE\n'
            });
          });
        });
        describe("on the middle of second line", function() {
          return it("deletes the last two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('d j', {
              text: '12345\n'
            });
          });
        });
        return describe("when cursor is on blank line", function() {
          beforeEach(function() {
            return set({
              text: "a\n\n\nb\n",
              cursor: [1, 0]
            });
          });
          return it("deletes both lines", function() {
            return ensure('d j', {
              text: "a\nb\n",
              cursor: [1, 0]
            });
          });
        });
      });
      describe("when followed by an k", function() {
        var originalText;
        originalText = "12345\nabcde\nABCDE";
        beforeEach(function() {
          return set({
            text: originalText
          });
        });
        describe("on the end of the file", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [2, 4]
            });
            return ensure('d k', {
              text: '12345\n'
            });
          });
        });
        describe("on the beginning of the file", function() {
          return xit("deletes nothing", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('d k', {
              text: originalText
            });
          });
        });
        describe("when on the middle of second line", function() {
          return it("deletes the first two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('d k', {
              text: 'ABCDE'
            });
          });
        });
        describe("when cursor is on blank line", function() {
          beforeEach(function() {
            return set({
              text: "a\n\n\nb\n",
              cursor: [2, 0]
            });
          });
          return it("deletes both lines", function() {
            return ensure('d k', {
              text: "a\nb\n",
              cursor: [1, 0]
            });
          });
        });
        return xdescribe("when it can't move", function() {
          var cursorOriginal, textOriginal;
          textOriginal = "a\nb\n";
          cursorOriginal = [0, 0];
          return it("deletes delete nothing", function() {
            set({
              text: textOriginal,
              cursor: cursorOriginal
            });
            return ensure('d k', {
              text: textOriginal,
              cursor: cursorOriginal
            });
          });
        });
      });
      describe("when followed by a G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE";
          return set({
            text: originalText
          });
        });
        describe("on the beginning of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('d G', {
              text: '12345\n'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('d G', {
              text: '12345\n'
            });
          });
        });
      });
      describe("when followed by a goto line G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE";
          return set({
            text: originalText
          });
        });
        describe("on the beginning of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('d 2 G', {
              text: '12345\nABCDE'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('d 2 G', {
              text: '12345\nABCDE'
            });
          });
        });
      });
      describe("when followed by a t)", function() {
        return describe("with the entire line yanked before", function() {
          beforeEach(function() {
            return set({
              text: "test (xyz)",
              cursor: [0, 6]
            });
          });
          return it("deletes until the closing parenthesis", function() {
            return ensure([
              'y y d t', {
                input: ')'
              }
            ], {
              text: 'test ()',
              cursor: [0, 6]
            });
          });
        });
      });
      describe("with multiple cursors", function() {
        it("deletes each selection", function() {
          set({
            text: "abcd\n1234\nABCD\n",
            cursorBuffer: [[0, 1], [1, 2], [2, 3]]
          });
          return ensure('d e', {
            text: "a\n12\nABC",
            cursorBuffer: [[0, 0], [1, 1], [2, 2]]
          });
        });
        return it("doesn't delete empty selections", function() {
          set({
            text: "abcd\nabc\nabd",
            cursorBuffer: [[0, 0], [1, 0], [2, 0]]
          });
          return ensure([
            'd t', {
              input: 'd'
            }
          ], {
            text: "d\nabc\nd",
            cursorBuffer: [[0, 0], [1, 0], [2, 0]]
          });
        });
      });
      return describe("stayOnDelete setting", function() {
        beforeEach(function() {
          settings.set('stayOnDelete', true);
          return set({
            text_: "___3333\n__2222\n_1111\n__2222\n___3333\n",
            cursor: [0, 3]
          });
        });
        describe("target range is linewise range", function() {
          it("keep original column after delete", function() {
            ensure("d d", {
              cursor: [0, 3],
              text_: "__2222\n_1111\n__2222\n___3333\n"
            });
            ensure(".", {
              cursor: [0, 3],
              text_: "_1111\n__2222\n___3333\n"
            });
            ensure(".", {
              cursor: [0, 3],
              text_: "__2222\n___3333\n"
            });
            return ensure(".", {
              cursor: [0, 3],
              text_: "___3333\n"
            });
          });
          return it("v_D also keep original column after delete", function() {
            return ensure("v 2 j D", {
              cursor: [0, 3],
              text_: "__2222\n___3333\n"
            });
          });
        });
        return describe("target range is text object", function() {
          describe("target is indent", function() {
            var indentText, textData;
            indentText = "0000000000000000\n  22222222222222\n  22222222222222\n  22222222222222\n0000000000000000\n";
            textData = new TextData(indentText);
            beforeEach(function() {
              return set({
                text: textData.getRaw()
              });
            });
            it("[from top] keep column", function() {
              set({
                cursor: [1, 10]
              });
              return ensure('d i i', {
                cursor: [1, 10],
                text: textData.getLines([0, 4])
              });
            });
            it("[from middle] keep column", function() {
              set({
                cursor: [2, 10]
              });
              return ensure('d i i', {
                cursor: [1, 10],
                text: textData.getLines([0, 4])
              });
            });
            return it("[from bottom] keep column", function() {
              set({
                cursor: [3, 10]
              });
              return ensure('d i i', {
                cursor: [1, 10],
                text: textData.getLines([0, 4])
              });
            });
          });
          return describe("target is paragraph", function() {
            var B1, B2, B3, P1, P2, P3, paragraphText, textData;
            paragraphText = "p1---------------\np1---------------\np1---------------\n\np2---------------\np2---------------\np2---------------\n\np3---------------\np3---------------\np3---------------\n";
            textData = new TextData(paragraphText);
            P1 = [0, 1, 2];
            B1 = 3;
            P2 = [4, 5, 6];
            B2 = 7;
            P3 = [8, 9, 10];
            B3 = 11;
            beforeEach(function() {
              return set({
                text: textData.getRaw()
              });
            });
            it("set cursor to start of deletion after delete [from bottom of paragraph]", function() {
              var _i, _results;
              set({
                cursor: [0, 0]
              });
              ensure('d i p', {
                cursor: [0, 0],
                text: textData.getLines((function() {
                  _results = [];
                  for (var _i = B1; B1 <= B3 ? _i <= B3 : _i >= B3; B1 <= B3 ? _i++ : _i--){ _results.push(_i); }
                  return _results;
                }).apply(this), {
                  chomp: true
                })
              });
              ensure('j .', {
                cursor: [1, 0],
                text: textData.getLines([B1, B2].concat(__slice.call(P3), [B3]), {
                  chomp: true
                })
              });
              return ensure('j .', {
                cursor: [1, 0],
                text: textData.getLines([B1, B2, B3], {
                  chomp: true
                })
              });
            });
            it("set cursor to start of deletion after delete [from middle of paragraph]", function() {
              var _i, _results;
              set({
                cursor: [1, 0]
              });
              ensure('d i p', {
                cursor: [0, 0],
                text: textData.getLines((function() {
                  _results = [];
                  for (var _i = B1; B1 <= B3 ? _i <= B3 : _i >= B3; B1 <= B3 ? _i++ : _i--){ _results.push(_i); }
                  return _results;
                }).apply(this), {
                  chomp: true
                })
              });
              ensure('2 j .', {
                cursor: [1, 0],
                text: textData.getLines([B1, B2].concat(__slice.call(P3), [B3]), {
                  chomp: true
                })
              });
              return ensure('2 j .', {
                cursor: [1, 0],
                text: textData.getLines([B1, B2, B3], {
                  chomp: true
                })
              });
            });
            return it("set cursor to start of deletion after delete [from bottom of paragraph]", function() {
              var _i, _results;
              set({
                cursor: [1, 0]
              });
              ensure('d i p', {
                cursor: [0, 0],
                text: textData.getLines((function() {
                  _results = [];
                  for (var _i = B1; B1 <= B3 ? _i <= B3 : _i >= B3; B1 <= B3 ? _i++ : _i--){ _results.push(_i); }
                  return _results;
                }).apply(this), {
                  chomp: true
                })
              });
              ensure('3 j .', {
                cursor: [1, 0],
                text: textData.getLines([B1, B2].concat(__slice.call(P3), [B3]), {
                  chomp: true
                })
              });
              return ensure('3 j .', {
                cursor: [1, 0],
                text: textData.getLines([B1, B2, B3], {
                  chomp: true
                })
              });
            });
          });
        });
      });
    });
    describe("the D keybinding", function() {
      beforeEach(function() {
        return set({
          text: "0000\n1111\n2222\n3333",
          cursor: [0, 1]
        });
      });
      it("deletes the contents until the end of the line", function() {
        return ensure('D', {
          text: "0\n1111\n2222\n3333"
        });
      });
      return it("in visual-mode, it delete whole line", function() {
        ensure('v D', {
          text: "1111\n2222\n3333"
        });
        return ensure("v j D", {
          text: "3333"
        });
      });
    });
    describe("the y keybinding", function() {
      beforeEach(function() {
        return set({
          text: "012 345\nabc\n",
          cursor: [0, 4]
        });
      });
      describe("when selected lines in visual linewise mode", function() {
        beforeEach(function() {
          return keystroke('V j y');
        });
        it("is in linewise motion", function() {
          return ensure({
            register: {
              '"': {
                type: 'linewise'
              }
            }
          });
        });
        it("saves the lines to the default register", function() {
          return ensure({
            register: {
              '"': {
                text: "012 345\nabc\n"
              }
            }
          });
        });
        return it("places the cursor at the beginning of the selection", function() {
          return ensure({
            cursorBuffer: [0, 0]
          });
        });
      });
      describe("when followed by a second y ", function() {
        beforeEach(function() {
          return keystroke('y y');
        });
        it("saves the line to the default register", function() {
          return ensure({
            register: {
              '"': {
                text: "012 345\n"
              }
            }
          });
        });
        return it("leaves the cursor at the starting position", function() {
          return ensure({
            cursor: [0, 4]
          });
        });
      });
      describe("when useClipboardAsDefaultRegister enabled", function() {
        return it("writes to clipboard", function() {
          settings.set('useClipboardAsDefaultRegister', true);
          keystroke('y y');
          return expect(atom.clipboard.read()).toBe('012 345\n');
        });
      });
      describe("when followed with a repeated y", function() {
        beforeEach(function() {
          return keystroke('y 2 y');
        });
        it("copies n lines, starting from the current", function() {
          return ensure({
            register: {
              '"': {
                text: "012 345\nabc\n"
              }
            }
          });
        });
        return it("leaves the cursor at the starting position", function() {
          return ensure({
            cursor: [0, 4]
          });
        });
      });
      describe("with a register", function() {
        beforeEach(function() {
          return keystroke([
            '"', {
              input: 'a'
            }, 'y y'
          ]);
        });
        it("saves the line to the a register", function() {
          return ensure({
            register: {
              a: {
                text: "012 345\n"
              }
            }
          });
        });
        return it("appends the line to the A register", function() {
          return ensure([
            '"', {
              input: 'A'
            }, 'y y'
          ], {
            register: {
              a: {
                text: "012 345\n012 345\n"
              }
            }
          });
        });
      });
      describe("with a forward motion", function() {
        beforeEach(function() {
          return keystroke('y e');
        });
        it("saves the selected text to the default register", function() {
          return ensure({
            register: {
              '"': {
                text: '345'
              }
            }
          });
        });
        it("leaves the cursor at the starting position", function() {
          return ensure({
            cursor: [0, 4]
          });
        });
        return it("does not yank when motion fails", function() {
          return ensure([
            'y t', {
              input: 'x'
            }
          ], {
            register: {
              '"': {
                text: '345'
              }
            }
          });
        });
      });
      describe("with a text object", function() {
        return it("moves the cursor to the beginning of the text object", function() {
          set({
            cursorBuffer: [0, 5]
          });
          return ensure('y i w', {
            cursorBuffer: [0, 4]
          });
        });
      });
      describe("with a left motion", function() {
        beforeEach(function() {
          return keystroke('y h');
        });
        it("saves the left letter to the default register", function() {
          return ensure({
            register: {
              '"': {
                text: ' '
              }
            }
          });
        });
        return it("moves the cursor position to the left", function() {
          return ensure({
            cursor: [0, 3]
          });
        });
      });
      describe("with a down motion", function() {
        beforeEach(function() {
          return keystroke('y j');
        });
        it("saves both full lines to the default register", function() {
          return ensure({
            register: {
              '"': {
                text: "012 345\nabc\n"
              }
            }
          });
        });
        return it("leaves the cursor at the starting position", function() {
          return ensure({
            cursor: [0, 4]
          });
        });
      });
      describe("when followed by a G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE";
          return set({
            text: originalText
          });
        });
        describe("on the beginning of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('y G P', {
              text: '12345\nabcde\nABCDE\nabcde\nABCDE'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('y G P', {
              text: '12345\nabcde\nABCDE\nabcde\nABCDE'
            });
          });
        });
      });
      describe("when followed by a goto line G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE";
          return set({
            text: originalText
          });
        });
        describe("on the beginning of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('y 2 G P', {
              text: '12345\nabcde\nabcde\nABCDE'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('y 2 G P', {
              text: '12345\nabcde\nabcde\nABCDE'
            });
          });
        });
      });
      describe("with multiple cursors", function() {
        return it("moves each cursor and copies the last selection's text", function() {
          set({
            text: "  abcd\n  1234",
            cursorBuffer: [[0, 0], [1, 5]]
          });
          return ensure('y ^', {
            register: {
              '"': {
                text: '123'
              }
            },
            cursorBuffer: [[0, 0], [1, 2]]
          });
        });
      });
      return describe("stayOnYank setting", function() {
        var text;
        text = null;
        beforeEach(function() {
          settings.set('stayOnYank', true);
          text = new TextData("0_234567\n1_234567\n2_234567\n\n4_234567\n");
          return set({
            text: text.getRaw(),
            cursor: [1, 2]
          });
        });
        it("don't move cursor after yank from normal-mode", function() {
          ensure("y i p", {
            cursorBuffer: [1, 2],
            register: {
              '"': {
                text: text.getLines([0, 1, 2])
              }
            }
          });
          ensure("j y y", {
            cursorBuffer: [2, 2],
            register: {
              '"': {
                text: text.getLines([2])
              }
            }
          });
          return ensure("k .", {
            cursorBuffer: [1, 2],
            register: {
              '"': {
                text: text.getLines([1])
              }
            }
          });
        });
        it("don't move cursor after yank from visual-linewise", function() {
          ensure("V y", {
            cursorBuffer: [1, 2],
            register: {
              '"': {
                text: text.getLines([1])
              }
            }
          });
          return ensure("V j y", {
            cursorBuffer: [2, 2],
            register: {
              '"': {
                text: text.getLines([1, 2])
              }
            }
          });
        });
        return it("don't move cursor after yank from visual-characterwise", function() {
          ensure("v l l y", {
            cursorBuffer: [1, 4],
            register: {
              '"': {
                text: "234"
              }
            }
          });
          ensure("v h h y", {
            cursorBuffer: [1, 2],
            register: {
              '"': {
                text: "234"
              }
            }
          });
          ensure("v j y", {
            cursorBuffer: [2, 2],
            register: {
              '"': {
                text: "234567\n2_2"
              }
            }
          });
          return ensure("v 2 k y", {
            cursorBuffer: [0, 2],
            register: {
              '"': {
                text: "234567\n1_234567\n2_2"
              }
            }
          });
        });
      });
    });
    describe("the yy keybinding", function() {
      describe("on a single line file", function() {
        beforeEach(function() {
          return set({
            text: "exclamation!\n",
            cursor: [0, 0]
          });
        });
        return it("copies the entire line and pastes it correctly", function() {
          return ensure('y y p', {
            register: {
              '"': {
                text: "exclamation!\n"
              }
            },
            text: "exclamation!\nexclamation!\n"
          });
        });
      });
      return describe("on a single line file with no newline", function() {
        beforeEach(function() {
          return set({
            text: "no newline!",
            cursor: [0, 0]
          });
        });
        it("copies the entire line and pastes it correctly", function() {
          return ensure('y y p', {
            register: {
              '"': {
                text: "no newline!\n"
              }
            },
            text: "no newline!\nno newline!"
          });
        });
        return it("copies the entire line and pastes it respecting count and new lines", function() {
          return ensure('y y 2 p', {
            register: {
              '"': {
                text: "no newline!\n"
              }
            },
            text: "no newline!\nno newline!\nno newline!"
          });
        });
      });
    });
    describe("the Y keybinding", function() {
      var text;
      text = "012 345\nabc\n";
      beforeEach(function() {
        return set({
          text: text,
          cursor: [0, 4]
        });
      });
      it("saves the line to the default register", function() {
        return ensure('Y', {
          cursor: [0, 4],
          register: {
            '"': {
              text: "012 345\n"
            }
          }
        });
      });
      return it("yank the whole lines to the default register", function() {
        return ensure('v j Y', {
          cursor: [0, 0],
          register: {
            '"': {
              text: text
            }
          }
        });
      });
    });
    describe("the p keybinding", function() {
      describe("with character contents", function() {
        beforeEach(function() {
          set({
            text: "012\n",
            cursor: [0, 0]
          });
          set({
            register: {
              '"': {
                text: '345'
              }
            }
          });
          set({
            register: {
              'a': {
                text: 'a'
              }
            }
          });
          return atom.clipboard.write("clip");
        });
        describe("from the default register", function() {
          beforeEach(function() {
            return keystroke('p');
          });
          return it("inserts the contents", function() {
            return ensure({
              text: "034512\n",
              cursor: [0, 3]
            });
          });
        });
        describe("at the end of a line", function() {
          beforeEach(function() {
            set({
              cursor: [0, 2]
            });
            return keystroke('p');
          });
          return it("positions cursor correctly", function() {
            return ensure({
              text: "012345\n",
              cursor: [0, 5]
            });
          });
        });
        describe("paste to empty line", function() {
          return it("paste content to that empty line", function() {
            set({
              text: "1st\n\n3rd",
              cursor: [1, 0],
              register: {
                '"': {
                  text: '2nd'
                }
              }
            });
            return ensure('p', {
              text: "1st\n2nd\n3rd"
            });
          });
        });
        describe("when useClipboardAsDefaultRegister enabled", function() {
          return it("inserts contents from clipboard", function() {
            settings.set('useClipboardAsDefaultRegister', true);
            return ensure('p', {
              text: "0clip12\n"
            });
          });
        });
        describe("from a specified register", function() {
          beforeEach(function() {
            return keystroke([
              '"', {
                input: 'a'
              }, 'p'
            ]);
          });
          return it("inserts the contents of the 'a' register", function() {
            return ensure({
              text: "0a12\n",
              cursor: [0, 1]
            });
          });
        });
        return describe("at the end of a line", function() {
          return it("inserts before the current line's newline", function() {
            set({
              text: "abcde\none two three",
              cursor: [1, 4]
            });
            return ensure('d $ k $ p', {
              text: "abcdetwo three\none "
            });
          });
        });
      });
      describe("with linewise contents", function() {
        describe("on a single line", function() {
          beforeEach(function() {
            return set({
              text: '012',
              cursor: [0, 1],
              register: {
                '"': {
                  text: " 345\n",
                  type: 'linewise'
                }
              }
            });
          });
          it("inserts the contents of the default register", function() {
            return ensure('p', {
              text: "012\n 345",
              cursor: [1, 1]
            });
          });
          return it("replaces the current selection and put cursor to the first char of line", function() {
            return ensure('v p', {
              text: "0\n 345\n2",
              cursor: [1, 1]
            });
          });
        });
        return describe("on multiple lines", function() {
          beforeEach(function() {
            return set({
              text: "012\n 345",
              register: {
                '"': {
                  text: " 456\n",
                  type: 'linewise'
                }
              }
            });
          });
          it("inserts the contents of the default register at middle line", function() {
            set({
              cursor: [0, 1]
            });
            keystroke('p');
            return ensure({
              text: "012\n 456\n 345",
              cursor: [1, 1]
            });
          });
          return it("inserts the contents of the default register at end of line", function() {
            set({
              cursor: [1, 1]
            });
            return ensure('p', {
              text: "012\n 345\n 456",
              cursor: [2, 1]
            });
          });
        });
      });
      describe("with multiple linewise contents", function() {
        beforeEach(function() {
          set({
            text: "012\nabc",
            cursor: [1, 0],
            register: {
              '"': {
                text: " 345\n 678\n",
                type: 'linewise'
              }
            }
          });
          return keystroke('p');
        });
        return it("inserts the contents of the default register", function() {
          return ensure({
            text: "012\nabc\n 345\n 678",
            cursor: [2, 1]
          });
        });
      });
      describe("pasting twice", function() {
        beforeEach(function() {
          set({
            text: "12345\nabcde\nABCDE\nQWERT",
            cursor: [1, 1],
            register: {
              '"': {
                text: '123'
              }
            }
          });
          return keystroke('2 p');
        });
        it("inserts the same line twice", function() {
          return ensure({
            text: "12345\nab123123cde\nABCDE\nQWERT"
          });
        });
        return describe("when undone", function() {
          return it("removes both lines", function() {
            return ensure('u', {
              text: "12345\nabcde\nABCDE\nQWERT"
            });
          });
        });
      });
      describe("support multiple cursors", function() {
        return it("paste text for each cursors", function() {
          set({
            text: "12345\nabcde\nABCDE\nQWERT",
            cursor: [[1, 0], [2, 0]],
            register: {
              '"': {
                text: 'ZZZ'
              }
            }
          });
          return ensure('p', {
            text: "12345\naZZZbcde\nAZZZBCDE\nQWERT",
            cursor: [[1, 3], [2, 3]]
          });
        });
      });
      return describe("with a selection", function() {
        beforeEach(function() {
          return set({
            text: '012\n',
            cursor: [0, 1]
          });
        });
        describe("with characterwise selection", function() {
          it("replaces selection with charwise content", function() {
            set({
              register: {
                '"': {
                  text: "345"
                }
              }
            });
            return ensure('v p', {
              text: "03452\n",
              cursor: [0, 3]
            });
          });
          return it("replaces selection with linewise content", function() {
            set({
              register: {
                '"': {
                  text: "345\n"
                }
              }
            });
            return ensure('v p', {
              text: "0\n345\n2\n",
              cursor: [1, 0]
            });
          });
        });
        return describe("with linewise selection", function() {
          it("replaces selection with charwise content", function() {
            set({
              text: "012\nabc",
              cursor: [0, 1]
            });
            set({
              register: {
                '"': {
                  text: "345"
                }
              }
            });
            return ensure('V p', {
              text: "345\nabc",
              cursor: [0, 0]
            });
          });
          return it("replaces selection with linewise content", function() {
            set({
              register: {
                '"': {
                  text: "345\n"
                }
              }
            });
            return ensure('V p', {
              text: "345\n",
              cursor: [0, 0]
            });
          });
        });
      });
    });
    describe("the P keybinding", function() {
      return describe("with character contents", function() {
        beforeEach(function() {
          set({
            text: "012\n",
            cursor: [0, 0]
          });
          set({
            register: {
              '"': {
                text: '345'
              }
            }
          });
          set({
            register: {
              a: {
                text: 'a'
              }
            }
          });
          return keystroke('P');
        });
        return it("inserts the contents of the default register above", function() {
          return ensure({
            text: "345012\n",
            cursor: [0, 2]
          });
        });
      });
    });
    describe("PutAfterAndSelect and PutBeforeAndSelect", function() {
      beforeEach(function() {
        atom.keymaps.add("text", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g p': 'vim-mode-plus:put-after-and-select',
            'g P': 'vim-mode-plus:put-before-and-select'
          }
        });
        return set({
          text: "111\n222\n333\n",
          cursor: [1, 0]
        });
      });
      describe("in visual-mode", function() {
        describe("linewise register", function() {
          beforeEach(function() {
            return set({
              register: {
                '"': {
                  text: "AAA\n"
                }
              }
            });
          });
          it("paste and select: [selection:linewise]", function() {
            return ensure('V g p', {
              text: "111\nAAA\n333\n",
              selectedText: "AAA\n",
              mode: ['visual', 'linewise']
            });
          });
          return it("paste and select: [selection:charwise, register:linewise]", function() {
            return ensure('v g P', {
              text: "111\n\nAAA\n22\n333\n",
              selectedText: "AAA\n",
              mode: ['visual', 'linewise']
            });
          });
        });
        return describe("characterwise register", function() {
          beforeEach(function() {
            return set({
              register: {
                '"': {
                  text: "AAA"
                }
              }
            });
          });
          it("paste and select: [selection:linewise, register:charwise]", function() {
            return ensure('V g p', {
              text: "111\nAAA\n333\n",
              selectedText: "AAA\n",
              mode: ['visual', 'linewise']
            });
          });
          return it("paste and select: [selection:charwise, register:charwise]", function() {
            return ensure('v g P', {
              text: "111\nAAA22\n333\n",
              selectedText: "AAA",
              mode: ['visual', 'characterwise']
            });
          });
        });
      });
      return describe("in normal", function() {
        describe("linewise register", function() {
          beforeEach(function() {
            return set({
              register: {
                '"': {
                  text: "AAA\n"
                }
              }
            });
          });
          it("putAfter and select", function() {
            return ensure('g p', {
              text: "111\n222\nAAA\n333\n",
              selectedText: "AAA\n",
              mode: ['visual', 'linewise']
            });
          });
          return it("putBefore and select", function() {
            return ensure('g P', {
              text: "111\nAAA\n222\n333\n",
              selectedText: "AAA\n",
              mode: ['visual', 'linewise']
            });
          });
        });
        return describe("characterwise register", function() {
          beforeEach(function() {
            return set({
              register: {
                '"': {
                  text: "AAA"
                }
              }
            });
          });
          it("putAfter and select", function() {
            return ensure('g p', {
              text: "111\n2AAA22\n333\n",
              selectedText: "AAA",
              mode: ['visual', 'characterwise']
            });
          });
          return it("putAfter and select", function() {
            return ensure('g P', {
              text: "111\nAAA222\n333\n",
              selectedText: "AAA",
              mode: ['visual', 'characterwise']
            });
          });
        });
      });
    });
    describe("the J keybinding", function() {
      beforeEach(function() {
        return set({
          text: "012\n    456\n",
          cursor: [0, 1]
        });
      });
      describe("without repeating", function() {
        beforeEach(function() {
          return keystroke('J');
        });
        return it("joins the contents of the current line with the one below it", function() {
          return ensure({
            text: "012 456\n"
          });
        });
      });
      return describe("with repeating", function() {
        beforeEach(function() {
          set({
            text: "12345\nabcde\nABCDE\nQWERT",
            cursor: [1, 1]
          });
          return keystroke('2 J');
        });
        return describe("undo behavior", function() {
          beforeEach(function() {
            return keystroke('u');
          });
          return it("handles repeats", function() {
            return ensure({
              text: "12345\nabcde\nABCDE\nQWERT"
            });
          });
        });
      });
    });
    describe("the . keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12\n34\n56\n78",
          cursor: [0, 0]
        });
      });
      it("repeats the last operation", function() {
        return ensure('2 d d .', {
          text: ""
        });
      });
      return it("composes with motions", function() {
        return ensure('d d 2 .', {
          text: "78"
        });
      });
    });
    describe("the r keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12\n34\n\n",
          cursorBuffer: [[0, 0], [1, 0]]
        });
      });
      it("replaces a single character", function() {
        return ensure([
          'r', {
            input: 'x'
          }
        ], {
          text: 'x2\nx4\n\n'
        });
      });
      it("does nothing when cancelled", function() {
        ensure('r', {
          mode: 'operator-pending'
        });
        vimState.input.cancel();
        return ensure({
          text: '12\n34\n\n',
          mode: 'normal'
        });
      });
      it("remain visual-mode when cancelled", function() {
        keystroke('v r');
        vimState.input.cancel();
        return ensure({
          text: '12\n34\n\n',
          mode: ['visual', 'characterwise']
        });
      });
      it("replaces a single character with a line break", function() {
        var inputEditorElement;
        inputEditorElement = vimState.input.editorElement;
        keystroke('r');
        dispatch(inputEditorElement, 'core:confirm');
        return ensure({
          text: '\n2\n\n4\n\n',
          cursorBuffer: [[1, 0], [3, 0]]
        });
      });
      it("composes properly with motions", function() {
        return ensure([
          '2 r', {
            input: 'x'
          }
        ], {
          text: 'xx\nxx\n\n'
        });
      });
      it("does nothing on an empty line", function() {
        set({
          cursorBuffer: [2, 0]
        });
        return ensure([
          'r', {
            input: 'x'
          }
        ], {
          text: '12\n34\n\n'
        });
      });
      it("does nothing if asked to replace more characters than there are on a line", function() {
        return ensure([
          '3 r', {
            input: 'x'
          }
        ], {
          text: '12\n34\n\n'
        });
      });
      describe("when in visual mode", function() {
        beforeEach(function() {
          return keystroke('v e');
        });
        it("replaces the entire selection with the given character", function() {
          return ensure([
            'r', {
              input: 'x'
            }
          ], {
            text: 'xx\nxx\n\n'
          });
        });
        return it("leaves the cursor at the beginning of the selection", function() {
          return ensure([
            'r', {
              input: 'x'
            }
          ], {
            cursorBuffer: [[0, 0], [1, 0]]
          });
        });
      });
      return describe("when in visual-block mode", function() {
        var textOriginal, textRepeated, textReplaced;
        textOriginal = "0:2345\n1: o11o\n2: o22o\n3: o33o\n4: o44o\n";
        textReplaced = "0:2345\n1: oxxo\n2: oxxo\n3: oxxo\n4: oxxo\n";
        textRepeated = "0:2345\nxx oxxo\nxx oxxo\nxx oxxo\nxx oxxo\n";
        beforeEach(function() {
          set({
            text: textOriginal,
            cursor: [1, 4]
          });
          return ensure('ctrl-v l 3 j', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['11', '22', '33', '44']
          });
        });
        return xit("replaces each selection and put cursor on start of top selection", function() {
          ensure([
            'r', {
              input: 'x'
            }
          ], {
            mode: 'normal',
            text: textReplaced,
            cursor: [1, 4]
          });
          set({
            cursor: [1, 0]
          });
          return ensure('.', {
            mode: 'normal',
            text: textRepeated,
            cursor: [1, 0]
          });
        });
      });
    });
    describe('the m keybinding', function() {
      beforeEach(function() {
        return set({
          text: '12\n34\n56\n',
          cursorBuffer: [0, 1]
        });
      });
      return it('marks a position', function() {
        keystroke('m a');
        return expect(vimState.mark.get('a')).toEqual([0, 1]);
      });
    });
    return describe('the R keybinding', function() {
      beforeEach(function() {
        return set({
          text: "12345\n67890",
          cursorBuffer: [0, 2]
        });
      });
      it("enters replace mode and replaces characters", function() {
        ensure('R', {
          mode: ['insert', 'replace']
        });
        editor.insertText("ab");
        return ensure('escape', {
          text: "12ab5\n67890",
          cursor: [0, 3],
          mode: 'normal'
        });
      });
      it("continues beyond end of line as insert", function() {
        ensure('R', {
          mode: ['insert', 'replace']
        });
        editor.insertText("abcde");
        return ensure('escape', {
          text: '12abcde\n67890'
        });
      });
      it('treats backspace as undo', function() {
        editor.insertText("foo");
        keystroke('R');
        editor.insertText("a");
        editor.insertText("b");
        ensure({
          text: "12fooab5\n67890"
        });
        ensure('backspace', {
          text: "12fooa45\n67890"
        });
        editor.insertText("c");
        ensure({
          text: "12fooac5\n67890"
        });
        ensure('backspace backspace', {
          text: "12foo345\n67890",
          selectedText: ''
        });
        return ensure('backspace', {
          text: "12foo345\n67890",
          selectedText: ''
        });
      });
      it("can be repeated", function() {
        keystroke('R');
        editor.insertText("ab");
        keystroke('escape');
        set({
          cursorBuffer: [1, 2]
        });
        ensure('.', {
          text: "12ab5\n67ab0",
          cursor: [1, 3]
        });
        set({
          cursorBuffer: [0, 4]
        });
        return ensure('.', {
          text: "12abab\n67ab0",
          cursor: [0, 5]
        });
      });
      it("can be interrupted by arrow keys and behave as insert for repeat", function() {});
      it("repeats correctly when backspace was used in the text", function() {
        keystroke('R');
        editor.insertText("a");
        keystroke('backspace');
        editor.insertText("b");
        keystroke('escape');
        set({
          cursorBuffer: [1, 2]
        });
        ensure('.', {
          text: "12b45\n67b90",
          cursor: [1, 2]
        });
        set({
          cursorBuffer: [0, 4]
        });
        return ensure('.', {
          text: "12b4b\n67b90",
          cursor: [0, 4]
        });
      });
      it("doesn't replace a character if newline is entered", function() {
        ensure('R', {
          mode: ['insert', 'replace']
        });
        editor.insertText("\n");
        return ensure('escape', {
          text: "12\n345\n67890"
        });
      });
      return describe("multiline situation", function() {
        var textOriginal;
        textOriginal = "01234\n56789";
        beforeEach(function() {
          return set({
            text: textOriginal,
            cursor: [0, 0]
          });
        });
        it("replace character unless input isnt new line(\\n)", function() {
          ensure('R', {
            mode: ['insert', 'replace']
          });
          editor.insertText("a\nb\nc");
          return ensure({
            text: "a\nb\nc34\n56789",
            cursor: [2, 1]
          });
        });
        it("handle backspace", function() {
          ensure('R', {
            mode: ['insert', 'replace']
          });
          set({
            cursor: [0, 1]
          });
          editor.insertText("a\nb\nc");
          ensure({
            text: "0a\nb\nc4\n56789",
            cursor: [2, 1]
          });
          ensure('backspace', {
            text: "0a\nb\n34\n56789",
            cursor: [2, 0]
          });
          ensure('backspace', {
            text: "0a\nb34\n56789",
            cursor: [1, 1]
          });
          ensure('backspace', {
            text: "0a\n234\n56789",
            cursor: [1, 0]
          });
          ensure('backspace', {
            text: "0a234\n56789",
            cursor: [0, 2]
          });
          ensure('backspace', {
            text: "01234\n56789",
            cursor: [0, 1]
          });
          ensure('backspace', {
            text: "01234\n56789",
            cursor: [0, 1]
          });
          return ensure('escape', {
            text: "01234\n56789",
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("repeate multiline text case-1", function() {
          ensure('R', {
            mode: ['insert', 'replace']
          });
          editor.insertText("abc\ndef");
          ensure({
            text: "abc\ndef\n56789",
            cursor: [1, 3]
          });
          ensure('escape', {
            cursor: [1, 2],
            mode: 'normal'
          });
          ensure('u', {
            text: textOriginal
          });
          ensure('.', {
            text: "abc\ndef\n56789",
            cursor: [1, 2],
            mode: 'normal'
          });
          return ensure('j .', {
            text: "abc\ndef\n56abc\ndef",
            cursor: [3, 2],
            mode: 'normal'
          });
        });
        return it("repeate multiline text case-2", function() {
          ensure('R', {
            mode: ['insert', 'replace']
          });
          editor.insertText("abc\nd");
          ensure({
            text: "abc\nd4\n56789",
            cursor: [1, 1]
          });
          ensure('escape', {
            cursor: [1, 0],
            mode: 'normal'
          });
          return ensure('j .', {
            text: "abc\nd4\nabc\nd9",
            cursor: [3, 0],
            mode: 'normal'
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvb3BlcmF0b3ItZ2VuZXJhbC1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwrQ0FBQTtJQUFBLGtCQUFBOztBQUFBLEVBQUEsT0FBb0MsT0FBQSxDQUFRLGVBQVIsQ0FBcEMsRUFBQyxtQkFBQSxXQUFELEVBQWMsZ0JBQUEsUUFBZCxFQUF3QixnQkFBQSxRQUF4QixDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUixDQURYLENBQUE7O0FBQUEsRUFHQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQSxHQUFBO0FBQzNCLFFBQUEsOERBQUE7QUFBQSxJQUFBLFFBQTRELEVBQTVELEVBQUMsY0FBRCxFQUFNLGlCQUFOLEVBQWMsb0JBQWQsRUFBeUIsaUJBQXpCLEVBQWlDLHdCQUFqQyxFQUFnRCxtQkFBaEQsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxHQUFSLEdBQUE7QUFDVixRQUFBLFFBQUEsR0FBVyxLQUFYLENBQUE7QUFBQSxRQUNDLGtCQUFBLE1BQUQsRUFBUyx5QkFBQSxhQURULENBQUE7ZUFFQyxVQUFBLEdBQUQsRUFBTSxhQUFBLE1BQU4sRUFBYyxnQkFBQSxTQUFkLEVBQTJCLElBSGpCO01BQUEsQ0FBWixFQURTO0lBQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxJQVFBLFNBQUEsQ0FBVSxTQUFBLEdBQUE7YUFDUixRQUFRLENBQUMsZUFBVCxDQUFBLEVBRFE7SUFBQSxDQUFWLENBUkEsQ0FBQTtBQUFBLElBV0EsUUFBQSxDQUFTLHVCQUFULEVBQWtDLFNBQUEsR0FBQTthQUNoQyxFQUFBLENBQUcseUJBQUgsRUFBOEIsU0FB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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/spec/operator-general-spec.coffee
