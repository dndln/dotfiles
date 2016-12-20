(function() {
  var TextData, dispatch, getView, getVimState, settings, _ref;

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, dispatch = _ref.dispatch, TextData = _ref.TextData, getView = _ref.getView;

  settings = require('../lib/settings');

  describe("Motion Search", function() {
    var editor, editorElement, ensure, keystroke, set, vimState, _ref1;
    _ref1 = [], set = _ref1[0], ensure = _ref1[1], keystroke = _ref1[2], editor = _ref1[3], editorElement = _ref1[4], vimState = _ref1[5];
    beforeEach(function() {
      return getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, keystroke = _vim.keystroke, _vim;
      });
    });
    afterEach(function() {
      return vimState.resetNormalMode();
    });
    describe("the / keybinding", function() {
      var pane;
      pane = null;
      beforeEach(function() {
        pane = {
          activate: jasmine.createSpy("activate")
        };
        set({
          text: "abc\ndef\nabc\ndef\n",
          cursor: [0, 0]
        });
        spyOn(atom.workspace, 'getActivePane').andReturn(pane);
        vimState.searchHistory.clear();
        return vimState.globalState.set('currentSearch', null);
      });
      describe("as a motion", function() {
        it("moves the cursor to the specified search pattern", function() {
          ensure([
            '/', {
              search: 'def'
            }
          ], {
            cursor: [1, 0]
          });
          return expect(pane.activate).toHaveBeenCalled();
        });
        it("loops back around", function() {
          set({
            cursor: [3, 0]
          });
          return ensure([
            '/', {
              search: 'def'
            }
          ], {
            cursor: [1, 0]
          });
        });
        it("uses a valid regex as a regex", function() {
          ensure([
            '/', {
              search: '[abc]'
            }
          ], {
            cursor: [0, 1]
          });
          return ensure('n', {
            cursor: [0, 2]
          });
        });
        it("uses an invalid regex as a literal string", function() {
          set({
            text: "abc\n[abc]\n"
          });
          ensure([
            '/', {
              search: '[abc'
            }
          ], {
            cursor: [1, 0]
          });
          return ensure('n', {
            cursor: [1, 0]
          });
        });
        it("uses ? as a literal string", function() {
          set({
            text: "abc\n[a?c?\n"
          });
          ensure([
            '/', {
              search: '?'
            }
          ], {
            cursor: [1, 2]
          });
          return ensure('n', {
            cursor: [1, 4]
          });
        });
        it('works with selection in visual mode', function() {
          set({
            text: 'one two three'
          });
          ensure([
            'v /', {
              search: 'th'
            }
          ], {
            cursor: [0, 9]
          });
          return ensure('d', {
            text: 'hree'
          });
        });
        it('extends selection when repeating search in visual mode', function() {
          set({
            text: "line1\nline2\nline3"
          });
          ensure([
            'v /', {
              search: 'line'
            }
          ], {
            selectedBufferRange: [[0, 0], [1, 1]]
          });
          return ensure('n', {
            selectedBufferRange: [[0, 0], [2, 1]]
          });
        });
        it('searches to the correct column in visual linewise mode', function() {
          return ensure([
            'V /', {
              search: 'ef'
            }
          ], {
            selectedText: "abc\ndef\n",
            characterwiseHead: [1, 1],
            cursor: [2, 0],
            mode: ['visual', 'linewise']
          });
        });
        it('not extend linwise selection if search matches on same line', function() {
          set({
            text: "abc def\ndef\n"
          });
          return ensure([
            'V /', {
              search: 'ef'
            }
          ], {
            selectedText: "abc def\n"
          });
        });
        describe("case sensitivity", function() {
          beforeEach(function() {
            return set({
              text: "\nabc\nABC\n",
              cursor: [0, 0]
            });
          });
          it("works in case sensitive mode", function() {
            ensure([
              '/', {
                search: 'ABC'
              }
            ], {
              cursor: [2, 0]
            });
            return ensure('n', {
              cursor: [2, 0]
            });
          });
          it("works in case insensitive mode", function() {
            ensure([
              '/', {
                search: '\\cAbC'
              }
            ], {
              cursor: [1, 0]
            });
            return ensure('n', {
              cursor: [2, 0]
            });
          });
          it("works in case insensitive mode wherever \\c is", function() {
            ensure([
              '/', {
                search: 'AbC\\c'
              }
            ], {
              cursor: [1, 0]
            });
            return ensure('n', {
              cursor: [2, 0]
            });
          });
          describe("when ignoreCaseForSearch is enabled", function() {
            beforeEach(function() {
              return settings.set('ignoreCaseForSearch', true);
            });
            it("ignore case when search [case-1]", function() {
              ensure([
                '/', {
                  search: 'abc'
                }
              ], {
                cursor: [1, 0]
              });
              return ensure('n', {
                cursor: [2, 0]
              });
            });
            return it("ignore case when search [case-2]", function() {
              ensure([
                '/', {
                  search: 'ABC'
                }
              ], {
                cursor: [1, 0]
              });
              return ensure('n', {
                cursor: [2, 0]
              });
            });
          });
          return describe("when useSmartcaseForSearch is enabled", function() {
            beforeEach(function() {
              return settings.set('useSmartcaseForSearch', true);
            });
            it("ignore case when searh term includes A-Z", function() {
              ensure([
                '/', {
                  search: 'ABC'
                }
              ], {
                cursor: [2, 0]
              });
              return ensure('n', {
                cursor: [2, 0]
              });
            });
            it("ignore case when searh term NOT includes A-Z regardress of `ignoreCaseForSearch`", function() {
              settings.set('ignoreCaseForSearch', false);
              ensure([
                '/', {
                  search: 'abc'
                }
              ], {
                cursor: [1, 0]
              });
              return ensure('n', {
                cursor: [2, 0]
              });
            });
            return it("ignore case when searh term NOT includes A-Z regardress of `ignoreCaseForSearch`", function() {
              settings.set('ignoreCaseForSearch', true);
              ensure([
                '/', {
                  search: 'abc'
                }
              ], {
                cursor: [1, 0]
              });
              return ensure('n', {
                cursor: [2, 0]
              });
            });
          });
        });
        describe("repeating", function() {
          return it("does nothing with no search history", function() {
            set({
              cursor: [0, 0]
            });
            ensure('n', {
              cursor: [0, 0]
            });
            set({
              cursor: [1, 1]
            });
            return ensure('n', {
              cursor: [1, 1]
            });
          });
        });
        describe("repeating with search history", function() {
          beforeEach(function() {
            return keystroke([
              '/', {
                search: 'def'
              }
            ]);
          });
          it("repeats previous search with /<enter>", function() {
            return ensure([
              '/', {
                search: ''
              }
            ], {
              cursor: [3, 0]
            });
          });
          it("repeats previous search with //", function() {
            return ensure([
              '/', {
                search: '/'
              }
            ], {
              cursor: [3, 0]
            });
          });
          describe("the n keybinding", function() {
            return it("repeats the last search", function() {
              return ensure('n', {
                cursor: [3, 0]
              });
            });
          });
          return describe("the N keybinding", function() {
            return it("repeats the last search backwards", function() {
              set({
                cursor: [0, 0]
              });
              ensure('N', {
                cursor: [3, 0]
              });
              return ensure('N', {
                cursor: [1, 0]
              });
            });
          });
        });
        return describe("composing", function() {
          it("composes with operators", function() {
            return ensure([
              'd /', {
                search: 'def'
              }
            ], {
              text: "def\nabc\ndef\n"
            });
          });
          return it("repeats correctly with operators", function() {
            return ensure([
              'd /', {
                search: 'def'
              }, '.'
            ], {
              text: "def\n"
            });
          });
        });
      });
      describe("when reversed as ?", function() {
        it("moves the cursor backwards to the specified search pattern", function() {
          return ensure([
            '?', {
              search: 'def'
            }
          ], {
            cursor: [3, 0]
          });
        });
        it("accepts / as a literal search pattern", function() {
          set({
            text: "abc\nd/f\nabc\nd/f\n",
            cursor: [0, 0]
          });
          ensure([
            '?', {
              search: '/'
            }
          ], {
            cursor: [3, 1]
          });
          return ensure([
            '?', {
              search: '/'
            }
          ], {
            cursor: [1, 1]
          });
        });
        return describe("repeating", function() {
          beforeEach(function() {
            return keystroke([
              '?', {
                search: 'def'
              }
            ]);
          });
          it("repeats previous search as reversed with ?<enter>", function() {
            return ensure([
              '?', {
                search: ''
              }
            ], {
              cursor: [1, 0]
            });
          });
          it("repeats previous search as reversed with ??", function() {
            return ensure([
              '?', {
                search: '?'
              }
            ], {
              cursor: [1, 0]
            });
          });
          describe('the n keybinding', function() {
            return it("repeats the last search backwards", function() {
              set({
                cursor: [0, 0]
              });
              return ensure('n', {
                cursor: [3, 0]
              });
            });
          });
          return describe('the N keybinding', function() {
            return it("repeats the last search forwards", function() {
              set({
                cursor: [0, 0]
              });
              return ensure('N', {
                cursor: [1, 0]
              });
            });
          });
        });
      });
      describe("using search history", function() {
        var ensureInputEditor, inputEditor;
        inputEditor = null;
        ensureInputEditor = function(command, _arg) {
          var text;
          text = _arg.text;
          dispatch(inputEditor, command);
          return expect(inputEditor.getModel().getText()).toEqual(text);
        };
        beforeEach(function() {
          ensure([
            '/', {
              search: 'def'
            }
          ], {
            cursor: [1, 0]
          });
          ensure([
            '/', {
              search: 'abc'
            }
          ], {
            cursor: [2, 0]
          });
          return inputEditor = vimState.searchInput.editorElement;
        });
        it("allows searching history in the search field", function() {
          keystroke('/');
          ensureInputEditor('core:move-up', {
            text: 'abc'
          });
          ensureInputEditor('core:move-up', {
            text: 'def'
          });
          return ensureInputEditor('core:move-up', {
            text: 'def'
          });
        });
        return it("resets the search field to empty when scrolling back", function() {
          keystroke('/');
          ensureInputEditor('core:move-up', {
            text: 'abc'
          });
          ensureInputEditor('core:move-up', {
            text: 'def'
          });
          ensureInputEditor('core:move-down', {
            text: 'abc'
          });
          return ensureInputEditor('core:move-down', {
            text: ''
          });
        });
      });
      return describe("highlightSearch", function() {
        var ensureHightlightSearch, textForMarker;
        textForMarker = function(marker) {
          return editor.getTextInBufferRange(marker.getBufferRange());
        };
        ensureHightlightSearch = function(options) {
          var markers, text;
          markers = vimState.highlightSearch.getMarkers();
          if (options.length != null) {
            expect(markers).toHaveLength(options.length);
          }
          if (options.text != null) {
            text = markers.map(function(marker) {
              return textForMarker(marker);
            });
            expect(text).toEqual(options.text);
          }
          if (options.mode != null) {
            return ensure({
              mode: options.mode
            });
          }
        };
        beforeEach(function() {
          jasmine.attachToDOM(getView(atom.workspace));
          settings.set('highlightSearch', true);
          expect(vimState.highlightSearch.hasMarkers()).toBe(false);
          return ensure([
            '/', {
              search: 'def'
            }
          ], {
            cursor: [1, 0]
          });
        });
        describe("clearHighlightSearch command", function() {
          return it("clear highlightSearch marker", function() {
            ensureHightlightSearch({
              length: 2,
              text: ["def", "def"],
              mode: 'normal'
            });
            dispatch(editorElement, 'vim-mode-plus:clear-highlight-search');
            return expect(vimState.highlightSearch.hasMarkers()).toBe(false);
          });
        });
        return describe("clearHighlightSearchOnResetNormalMode", function() {
          describe("default setting", function() {
            return it("it won't clear highlightSearch", function() {
              ensureHightlightSearch({
                length: 2,
                text: ["def", "def"],
                mode: 'normal'
              });
              dispatch(editorElement, 'vim-mode-plus:reset-normal-mode');
              return ensureHightlightSearch({
                length: 2,
                text: ["def", "def"],
                mode: 'normal'
              });
            });
          });
          return describe("when enabled", function() {
            return it("it clear highlightSearch on reset-normal-mode", function() {
              settings.set('clearHighlightSearchOnResetNormalMode', true);
              ensureHightlightSearch({
                length: 2,
                text: ["def", "def"],
                mode: 'normal'
              });
              dispatch(editorElement, 'vim-mode-plus:reset-normal-mode');
              expect(vimState.highlightSearch.hasMarkers()).toBe(false);
              return ensure({
                mode: 'normal'
              });
            });
          });
        });
      });
    });
    describe("the * keybinding", function() {
      beforeEach(function() {
        return set({
          text: "abd\n@def\nabd\ndef\n",
          cursorBuffer: [0, 0]
        });
      });
      describe("as a motion", function() {
        it("moves cursor to next occurrence of word under cursor", function() {
          return ensure('*', {
            cursorBuffer: [2, 0]
          });
        });
        it("repeats with the n key", function() {
          ensure('*', {
            cursorBuffer: [2, 0]
          });
          return ensure('n', {
            cursorBuffer: [0, 0]
          });
        });
        it("doesn't move cursor unless next occurrence is the exact word (no partial matches)", function() {
          set({
            text: "abc\ndef\nghiabc\njkl\nabcdef",
            cursorBuffer: [0, 0]
          });
          return ensure('*', {
            cursorBuffer: [0, 0]
          });
        });
        describe("with words that contain 'non-word' characters", function() {
          it("moves cursor to next occurrence of word under cursor", function() {
            set({
              text: "abc\n@def\nabc\n@def\n",
              cursorBuffer: [1, 0]
            });
            return ensure('*', {
              cursorBuffer: [3, 0]
            });
          });
          it("doesn't move cursor unless next match has exact word ending", function() {
            set({
              text: "abc\n@def\nabc\n@def1\n",
              cursorBuffer: [1, 1]
            });
            return ensure('*', {
              cursorBuffer: [1, 1]
            });
          });
          return it("moves cursor to the start of valid word char", function() {
            set({
              text: "abc\ndef\nabc\n@def\n",
              cursorBuffer: [1, 0]
            });
            return ensure('*', {
              cursorBuffer: [3, 1]
            });
          });
        });
        describe("when cursor is on non-word char column", function() {
          return it("matches only the non-word char", function() {
            set({
              text: "abc\n@def\nabc\n@def\n",
              cursorBuffer: [1, 0]
            });
            return ensure('*', {
              cursorBuffer: [3, 0]
            });
          });
        });
        describe("when cursor is not on a word", function() {
          return it("does a match with the next word", function() {
            set({
              text: "abc\na  @def\n abc\n @def",
              cursorBuffer: [1, 1]
            });
            return ensure('*', {
              cursorBuffer: [3, 1]
            });
          });
        });
        return describe("when cursor is at EOF", function() {
          return it("doesn't try to do any match", function() {
            set({
              text: "abc\n@def\nabc\n ",
              cursorBuffer: [3, 0]
            });
            return ensure('*', {
              cursorBuffer: [3, 0]
            });
          });
        });
      });
      return describe("caseSensitivity setting", function() {
        beforeEach(function() {
          return set({
            text: "abc\nABC\nabC\nabc\nABC",
            cursor: [0, 0]
          });
        });
        it("search case sensitively when `ignoreCaseForSearchCurrentWord` is false(=default)", function() {
          expect(settings.get('ignoreCaseForSearchCurrentWord')).toBe(false);
          ensure('*', {
            cursorBuffer: [3, 0]
          });
          return ensure('n', {
            cursorBuffer: [0, 0]
          });
        });
        it("search case insensitively when `ignoreCaseForSearchCurrentWord` true", function() {
          settings.set('ignoreCaseForSearchCurrentWord', true);
          ensure('*', {
            cursorBuffer: [1, 0]
          });
          ensure('n', {
            cursorBuffer: [2, 0]
          });
          ensure('n', {
            cursorBuffer: [3, 0]
          });
          return ensure('n', {
            cursorBuffer: [4, 0]
          });
        });
        return describe("useSmartcaseForSearchCurrentWord is enabled", function() {
          beforeEach(function() {
            return settings.set('useSmartcaseForSearchCurrentWord', true);
          });
          it("search case sensitively when enable and search term includes uppercase", function() {
            set({
              cursor: [1, 0]
            });
            ensure('*', {
              cursorBuffer: [4, 0]
            });
            return ensure('n', {
              cursorBuffer: [1, 0]
            });
          });
          return it("search case insensitively when enable and search term NOT includes uppercase", function() {
            set({
              cursor: [0, 0]
            });
            ensure('*', {
              cursorBuffer: [1, 0]
            });
            ensure('n', {
              cursorBuffer: [2, 0]
            });
            ensure('n', {
              cursorBuffer: [3, 0]
            });
            return ensure('n', {
              cursorBuffer: [4, 0]
            });
          });
        });
      });
    });
    describe("the hash keybinding", function() {
      describe("as a motion", function() {
        it("moves cursor to previous occurrence of word under cursor", function() {
          set({
            text: "abc\n@def\nabc\ndef\n",
            cursorBuffer: [2, 1]
          });
          return ensure('#', {
            cursorBuffer: [0, 0]
          });
        });
        it("repeats with n", function() {
          set({
            text: "abc\n@def\nabc\ndef\nabc\n",
            cursorBuffer: [2, 1]
          });
          ensure('#', {
            cursorBuffer: [0, 0]
          });
          ensure('n', {
            cursorBuffer: [4, 0]
          });
          return ensure('n', {
            cursorBuffer: [2, 0]
          });
        });
        it("doesn't move cursor unless next occurrence is the exact word (no partial matches)", function() {
          set({
            text: "abc\ndef\nghiabc\njkl\nabcdef",
            cursorBuffer: [0, 0]
          });
          return ensure('#', {
            cursorBuffer: [0, 0]
          });
        });
        describe("with words that containt 'non-word' characters", function() {
          it("moves cursor to next occurrence of word under cursor", function() {
            set({
              text: "abc\n@def\nabc\n@def\n",
              cursorBuffer: [3, 0]
            });
            return ensure('#', {
              cursorBuffer: [1, 0]
            });
          });
          return it("moves cursor to the start of valid word char", function() {
            set({
              text: "abc\n@def\nabc\ndef\n",
              cursorBuffer: [3, 0]
            });
            return ensure('#', {
              cursorBuffer: [1, 1]
            });
          });
        });
        return describe("when cursor is on non-word char column", function() {
          return it("matches only the non-word char", function() {
            set({
              text: "abc\n@def\nabc\n@def\n",
              cursorBuffer: [1, 0]
            });
            return ensure('*', {
              cursorBuffer: [3, 0]
            });
          });
        });
      });
      return describe("caseSensitivity setting", function() {
        beforeEach(function() {
          return set({
            text: "abc\nABC\nabC\nabc\nABC",
            cursor: [4, 0]
          });
        });
        it("search case sensitively when `ignoreCaseForSearchCurrentWord` is false(=default)", function() {
          expect(settings.get('ignoreCaseForSearchCurrentWord')).toBe(false);
          ensure('#', {
            cursorBuffer: [1, 0]
          });
          return ensure('n', {
            cursorBuffer: [4, 0]
          });
        });
        it("search case insensitively when `ignoreCaseForSearchCurrentWord` true", function() {
          settings.set('ignoreCaseForSearchCurrentWord', true);
          ensure('#', {
            cursorBuffer: [3, 0]
          });
          ensure('n', {
            cursorBuffer: [2, 0]
          });
          ensure('n', {
            cursorBuffer: [1, 0]
          });
          return ensure('n', {
            cursorBuffer: [0, 0]
          });
        });
        return describe("useSmartcaseForSearchCurrentWord is enabled", function() {
          beforeEach(function() {
            return settings.set('useSmartcaseForSearchCurrentWord', true);
          });
          it("search case sensitively when enable and search term includes uppercase", function() {
            set({
              cursor: [4, 0]
            });
            ensure('#', {
              cursorBuffer: [1, 0]
            });
            return ensure('n', {
              cursorBuffer: [4, 0]
            });
          });
          return it("search case insensitively when enable and search term NOT includes uppercase", function() {
            set({
              cursor: [0, 0]
            });
            ensure('#', {
              cursorBuffer: [4, 0]
            });
            ensure('n', {
              cursorBuffer: [3, 0]
            });
            ensure('n', {
              cursorBuffer: [2, 0]
            });
            ensure('n', {
              cursorBuffer: [1, 0]
            });
            return ensure('n', {
              cursorBuffer: [0, 0]
            });
          });
        });
      });
    });
    return describe('the % motion', function() {
      describe("Parenthesis", function() {
        beforeEach(function() {
          return set({
            text: "(___)"
          });
        });
        describe("as operator target", function() {
          beforeEach(function() {
            return set({
              text: "(_(_)_)"
            });
          });
          it('behave inclusively when is at open pair', function() {
            set({
              cursor: [0, 2]
            });
            return ensure('d %', {
              text: "(__)"
            });
          });
          return it('behave inclusively when is at open pair', function() {
            set({
              cursor: [0, 4]
            });
            return ensure('d %', {
              text: "(__)"
            });
          });
        });
        describe("cursor is at pair char", function() {
          it("cursor is at open pair, it move to closing pair", function() {
            set({
              cursor: [0, 0]
            });
            ensure('%', {
              cursor: [0, 4]
            });
            return ensure('%', {
              cursor: [0, 0]
            });
          });
          return it("cursor is at close pair, it move to open pair", function() {
            set({
              cursor: [0, 4]
            });
            ensure('%', {
              cursor: [0, 0]
            });
            return ensure('%', {
              cursor: [0, 4]
            });
          });
        });
        describe("cursor is enclosed by pair", function() {
          beforeEach(function() {
            return set({
              text: "(___)",
              cursor: [0, 2]
            });
          });
          return it("move to open pair", function() {
            return ensure('%', {
              cursor: [0, 0]
            });
          });
        });
        describe("cursor is bofore open pair", function() {
          beforeEach(function() {
            return set({
              text: "__(___)",
              cursor: [0, 0]
            });
          });
          return it("move to open pair", function() {
            return ensure('%', {
              cursor: [0, 6]
            });
          });
        });
        describe("cursor is after close pair", function() {
          beforeEach(function() {
            return set({
              text: "__(___)__",
              cursor: [0, 7]
            });
          });
          return it("fail to move", function() {
            return ensure('%', {
              cursor: [0, 7]
            });
          });
        });
        return describe("multi line", function() {
          beforeEach(function() {
            return set({
              text: "___\n___(__\n___\n___)"
            });
          });
          describe("when open and close pair is not at cursor line", function() {
            it("fail to move", function() {
              set({
                cursor: [0, 0]
              });
              return ensure('%', {
                cursor: [0, 0]
              });
            });
            return it("fail to move", function() {
              set({
                cursor: [2, 0]
              });
              return ensure('%', {
                cursor: [2, 0]
              });
            });
          });
          describe("when open pair is forwarding to cursor in same row", function() {
            return it("move to closing pair", function() {
              set({
                cursor: [1, 0]
              });
              return ensure('%', {
                cursor: [3, 3]
              });
            });
          });
          describe("when cursor position is greater than open pair", function() {
            return it("fail to move", function() {
              set({
                cursor: [1, 4]
              });
              return ensure('%', {
                cursor: [1, 4]
              });
            });
          });
          return describe("when close pair is forwarding to cursor in same row", function() {
            return it("move to closing pair", function() {
              set({
                cursor: [3, 0]
              });
              return ensure('%', {
                cursor: [1, 3]
              });
            });
          });
        });
      });
      describe("CurlyBracket", function() {
        beforeEach(function() {
          return set({
            text: "{___}"
          });
        });
        it("cursor is at open pair, it move to closing pair", function() {
          set({
            cursor: [0, 0]
          });
          ensure('%', {
            cursor: [0, 4]
          });
          return ensure('%', {
            cursor: [0, 0]
          });
        });
        return it("cursor is at close pair, it move to open pair", function() {
          set({
            cursor: [0, 4]
          });
          ensure('%', {
            cursor: [0, 0]
          });
          return ensure('%', {
            cursor: [0, 4]
          });
        });
      });
      describe("SquareBracket", function() {
        beforeEach(function() {
          return set({
            text: "[___]"
          });
        });
        it("cursor is at open pair, it move to closing pair", function() {
          set({
            cursor: [0, 0]
          });
          ensure('%', {
            cursor: [0, 4]
          });
          return ensure('%', {
            cursor: [0, 0]
          });
        });
        return it("cursor is at close pair, it move to open pair", function() {
          set({
            cursor: [0, 4]
          });
          ensure('%', {
            cursor: [0, 0]
          });
          return ensure('%', {
            cursor: [0, 4]
          });
        });
      });
      describe("complex situation", function() {
        beforeEach(function() {
          return set({
            text: "(_____)__{__[___]__}\n_"
          });
        });
        it('move to closing pair which open pair come first', function() {
          set({
            cursor: [0, 7]
          });
          ensure('%', {
            cursor: [0, 19]
          });
          set({
            cursor: [0, 10]
          });
          return ensure('%', {
            cursor: [0, 16]
          });
        });
        return it('enclosing pair is prioritized over forwarding range', function() {
          set({
            cursor: [0, 2]
          });
          return ensure('%', {
            cursor: [0, 0]
          });
        });
      });
      return describe("complex situation with html tag", function() {
        beforeEach(function() {
          return set({
            text: "<div>\n  <span>\n    some text\n  </span>\n</div>"
          });
        });
        it('when cursor is on AngleBracket(<, >), it moves to opposite AngleBracket', function() {
          set({
            cursor: [0, 0]
          });
          ensure('%', {
            cursor: [0, 4]
          });
          return ensure('%', {
            cursor: [0, 0]
          });
        });
        it('can find forwarding range of AngleBracket', function() {
          set({
            cursor: [1, 0]
          });
          ensure('%', {
            cursor: [1, 7]
          });
          return ensure('%', {
            cursor: [1, 2]
          });
        });
        return it('move to pair tag only when cursor is on open or close tag but not on AngleBracket(<, >)', function() {
          set({
            cursor: [0, 0]
          });
          ensure('%', {
            cursor: [0, 4]
          });
          set({
            cursor: [0, 1]
          });
          ensure('%', {
            cursor: [4, 1]
          });
          set({
            cursor: [0, 2]
          });
          ensure('%', {
            cursor: [4, 1]
          });
          set({
            cursor: [0, 3]
          });
          ensure('%', {
            cursor: [4, 1]
          });
          set({
            cursor: [0, 4]
          });
          ensure('%', {
            cursor: [0, 0]
          });
          set({
            cursor: [4, 0]
          });
          ensure('%', {
            cursor: [4, 5]
          });
          set({
            cursor: [4, 1]
          });
          ensure('%', {
            cursor: [0, 1]
          });
          set({
            cursor: [4, 2]
          });
          ensure('%', {
            cursor: [0, 1]
          });
          set({
            cursor: [4, 3]
          });
          ensure('%', {
            cursor: [0, 1]
          });
          set({
            cursor: [4, 4]
          });
          ensure('%', {
            cursor: [0, 1]
          });
          set({
            cursor: [4, 5]
          });
          return ensure('%', {
            cursor: [4, 0]
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvbW90aW9uLXNlYXJjaC1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx3REFBQTs7QUFBQSxFQUFBLE9BQTZDLE9BQUEsQ0FBUSxlQUFSLENBQTdDLEVBQUMsbUJBQUEsV0FBRCxFQUFjLGdCQUFBLFFBQWQsRUFBd0IsZ0JBQUEsUUFBeEIsRUFBa0MsZUFBQSxPQUFsQyxDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUixDQURYLENBQUE7O0FBQUEsRUFHQSxRQUFBLENBQVMsZUFBVCxFQUEwQixTQUFBLEdBQUE7QUFDeEIsUUFBQSw4REFBQTtBQUFBLElBQUEsUUFBNEQsRUFBNUQsRUFBQyxjQUFELEVBQU0saUJBQU4sRUFBYyxvQkFBZCxFQUF5QixpQkFBekIsRUFBaUMsd0JBQWpDLEVBQWdELG1CQUFoRCxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLElBQVIsR0FBQTtBQUNWLFFBQUEsUUFBQSxHQUFXLEtBQVgsQ0FBQTtBQUFBLFFBQ0Msa0JBQUEsTUFBRCxFQUFTLHlCQUFBLGFBRFQsQ0FBQTtlQUVDLFdBQUEsR0FBRCxFQUFNLGNBQUEsTUFBTixFQUFjLGlCQUFBLFNBQWQsRUFBMkIsS0FIakI7TUFBQSxDQUFaLEVBRFM7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBUUEsU0FBQSxDQUFVLFNBQUEsR0FBQTthQUNSLFFBQVEsQ0FBQyxlQUFULENBQUEsRUFEUTtJQUFBLENBQVYsQ0FSQSxDQUFBO0FBQUEsSUFXQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQSxHQUFBO0FBQzNCLFVBQUEsSUFBQTtBQUFBLE1BQUEsSUFB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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/spec/motion-search-spec.coffee
