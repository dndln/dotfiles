(function() {
  var TextData, dispatch, getView, getVimState, rawKeystroke, settings, withMockPlatform, _ref;

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, dispatch = _ref.dispatch, TextData = _ref.TextData, getView = _ref.getView, withMockPlatform = _ref.withMockPlatform, rawKeystroke = _ref.rawKeystroke;

  settings = require('../lib/settings');

  describe("Occurrence", function() {
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
    describe("operator-modifier-occurrence", function() {
      beforeEach(function() {
        return set({
          text: "\nooo: xxx: ooo:\n|||: ooo: xxx: ooo:\nooo: xxx: |||: xxx: ooo:\nxxx: |||: ooo: ooo:\n\nooo: xxx: ooo:\n|||: ooo: xxx: ooo:\nooo: xxx: |||: xxx: ooo:\nxxx: |||: ooo: ooo:\n"
        });
      });
      describe("operator-modifier-characterwise", function() {
        return it("change occurrence of cursor word in inner-paragraph", function() {
          set({
            cursor: [1, 0]
          });
          ensure("c o i p", {
            mode: 'insert',
            numCursors: 8,
            text: "\n: xxx: :\n|||: : xxx: :\n: xxx: |||: xxx: :\nxxx: |||: : :\n\nooo: xxx: ooo:\n|||: ooo: xxx: ooo:\nooo: xxx: |||: xxx: ooo:\nxxx: |||: ooo: ooo:\n"
          });
          editor.insertText('!!!');
          ensure("escape", {
            mode: 'normal',
            numCursors: 8,
            text: "\n!!!: xxx: !!!:\n|||: !!!: xxx: !!!:\n!!!: xxx: |||: xxx: !!!:\nxxx: |||: !!!: !!!:\n\nooo: xxx: ooo:\n|||: ooo: xxx: ooo:\nooo: xxx: |||: xxx: ooo:\nxxx: |||: ooo: ooo:\n"
          });
          return ensure("} j .", {
            mode: 'normal',
            numCursors: 8,
            text: "\n!!!: xxx: !!!:\n|||: !!!: xxx: !!!:\n!!!: xxx: |||: xxx: !!!:\nxxx: |||: !!!: !!!:\n\n!!!: xxx: !!!:\n|||: !!!: xxx: !!!:\n!!!: xxx: |||: xxx: !!!:\nxxx: |||: !!!: !!!:\n"
          });
        });
      });
      describe("apply various operator to occurrence in various target", function() {
        beforeEach(function() {
          return set({
            text: "ooo: xxx: ooo:\n|||: ooo: xxx: ooo:\nooo: xxx: |||: xxx: ooo:\nxxx: |||: ooo: ooo:"
          });
        });
        it("upper case inner-word", function() {
          set({
            cursor: [0, 11]
          });
          ensure("g U o i l", function() {
            return {
              text: "OOO: xxx: OOO:\n|||: ooo: xxx: ooo:\nooo: xxx: |||: xxx: ooo:\nxxx: |||: ooo: ooo:",
              cursor: [0, 0]
            };
          });
          ensure("2 j .", function() {
            return {
              text: "OOO: xxx: OOO:\n|||: ooo: xxx: ooo:\nOOO: xxx: |||: xxx: OOO:\nxxx: |||: ooo: ooo:",
              cursor: [2, 0]
            };
          });
          return ensure("j .", function() {
            return {
              text: "OOO: xxx: OOO:\n|||: ooo: xxx: ooo:\nOOO: xxx: |||: xxx: OOO:\nxxx: |||: OOO: OOO:",
              cursor: [2, 0]
            };
          });
        });
        return it("lower case with motion", function() {
          set({
            text: "OOO: XXX: OOO:\n|||: OOO: XXX: OOO:\nOOO: XXX: |||: XXX: OOO:\nXXX: |||: OOO: OOO:",
            cursor: [0, 6]
          });
          return ensure("g u o 2 j", {
            text: "OOO: xxx: OOO:\n|||: OOO: xxx: OOO:\nOOO: xxx: |||: xxx: OOO:\nXXX: |||: OOO: OOO:"
          });
        });
      });
      describe("auto extend target range to include occurrence", function() {
        var textFinal, textOriginal;
        textOriginal = "This text have 3 instance of 'text' in the whole text.\n";
        textFinal = textOriginal.replace(/text/g, '');
        beforeEach(function() {
          return set({
            text: textOriginal
          });
        });
        it("[from start of 1st]", function() {
          set({
            cursor: [0, 5]
          });
          return ensure('d o $', {
            text: textFinal
          });
        });
        it("[from middle of 1st]", function() {
          set({
            cursor: [0, 7]
          });
          return ensure('d o $', {
            text: textFinal
          });
        });
        it("[from end of last]", function() {
          set({
            cursor: [0, 52]
          });
          return ensure('d o 0', {
            text: textFinal
          });
        });
        return it("[from middle of last]", function() {
          set({
            cursor: [0, 51]
          });
          return ensure('d o 0', {
            text: textFinal
          });
        });
      });
      return describe("select-occurrence", function() {
        beforeEach(function() {
          return set({
            text: "vim-mode-plus vim-mode-plus"
          });
        });
        return describe("what the cursor-word", function() {
          var ensureCursorWord;
          ensureCursorWord = function(initialPoint, _arg) {
            var selectedText;
            selectedText = _arg.selectedText;
            set({
              cursor: initialPoint
            });
            ensure("g cmd-d i p", {
              selectedText: selectedText,
              mode: ['visual', 'characterwise']
            });
            return ensure("escape", {
              mode: "normal"
            });
          };
          describe("cursor is on normal word", function() {
            return it("pick word but not pick partially matched one [by select]", function() {
              ensureCursorWord([0, 0], {
                selectedText: ['vim', 'vim']
              });
              ensureCursorWord([0, 3], {
                selectedText: ['-', '-', '-', '-']
              });
              ensureCursorWord([0, 4], {
                selectedText: ['mode', 'mode']
              });
              return ensureCursorWord([0, 9], {
                selectedText: ['plus', 'plus']
              });
            });
          });
          describe("cursor is at single white space [by delete]", function() {
            return it("pick single white space only", function() {
              set({
                text: "ooo ooo ooo\n ooo ooo ooo",
                cursor: [0, 3]
              });
              return ensure("d o i p", {
                text: "ooooooooo\nooooooooo"
              });
            });
          });
          return describe("cursor is at sequnce of space [by delete]", function() {
            return it("select sequnce of white spaces including partially mached one", function() {
              set({
                cursor: [0, 3],
                text_: "ooo___ooo ooo\n ooo ooo____ooo________ooo"
              });
              return ensure("d o i p", {
                text_: "oooooo ooo\n ooo ooo ooo  ooo"
              });
            });
          });
        });
      });
    });
    describe("from visual-mode.is-narrowed", function() {
      beforeEach(function() {
        return set({
          text: "ooo: xxx: ooo:\n|||: ooo: xxx: ooo:\nooo: xxx: |||: xxx: ooo:\nxxx: |||: ooo: ooo:",
          cursor: [0, 0]
        });
      });
      describe("[vC] select-occurrence", function() {
        return it("select cursor-word which intersecting selection then apply upper-case", function() {
          return ensure("v 2 j cmd-d U", {
            text: "OOO: xxx: OOO:\n|||: OOO: xxx: OOO:\nOOO: xxx: |||: xxx: ooo:\nxxx: |||: ooo: ooo:",
            numCursors: 5
          });
        });
      });
      describe("[vL] select-occurrence", function() {
        return it("select cursor-word which intersecting selection then apply upper-case", function() {
          return ensure("5 l V 2 j cmd-d U", {
            text: "ooo: XXX: ooo:\n|||: ooo: XXX: ooo:\nooo: XXX: |||: XXX: ooo:\nxxx: |||: ooo: ooo:",
            numCursors: 4
          });
        });
      });
      return describe("[vB] select-occurrence", function() {
        it("select cursor-word which intersecting selection then apply upper-case", function() {
          return ensure("W ctrl-v 2 j $ h cmd-d U", {
            text: "ooo: xxx: OOO:\n|||: OOO: xxx: OOO:\nooo: xxx: |||: xxx: OOO:\nxxx: |||: ooo: ooo:",
            numCursors: 4
          });
        });
        return it("pick cursor-word from vB range", function() {
          return ensure("ctrl-v 7 l 2 j o cmd-d U", {
            text: "OOO: xxx: ooo:\n|||: OOO: xxx: ooo:\nOOO: xxx: |||: xxx: ooo:\nxxx: |||: ooo: ooo:",
            numCursors: 3
          });
        });
      });
    });
    describe("incremental search integration: change-occurrence-from-search, select-occurrence-from-search", function() {
      var searchEditor, searchEditorElement, _ref2;
      _ref2 = [], searchEditor = _ref2[0], searchEditorElement = _ref2[1];
      beforeEach(function() {
        searchEditor = vimState.searchInput.editor;
        searchEditorElement = searchEditor.element;
        jasmine.attachToDOM(getView(atom.workspace));
        settings.set('incrementalSearch', true);
        return set({
          text: "ooo: xxx: ooo: 0000\n1: ooo: 22: ooo:\nooo: xxx: |||: xxx: 3333:\n444: |||: ooo: ooo:",
          cursor: [0, 0]
        });
      });
      describe("from normal mode", function() {
        it("select occurrence by pattern match", function() {
          keystroke('/');
          searchEditor.insertText('\\d{3,4}');
          return withMockPlatform(searchEditorElement, 'platform-darwin', function() {
            rawKeystroke('cmd-d', document.activeElement);
            return ensure('i e', {
              selectedText: ['0000', '3333', '444'],
              mode: ['visual', 'characterwise']
            });
          });
        });
        return it("change occurrence by pattern match", function() {
          keystroke('/');
          searchEditor.insertText('^\\w+:');
          return withMockPlatform(searchEditorElement, 'platform-darwin', function() {
            rawKeystroke('ctrl-cmd-c', document.activeElement);
            ensure('i e', {
              mode: 'insert'
            });
            editor.insertText('hello');
            return ensure({
              text: "hello xxx: ooo: 0000\nhello ooo: 22: ooo:\nhello xxx: |||: xxx: 3333:\nhello |||: ooo: ooo:"
            });
          });
        });
      });
      describe("from visual mode", function() {
        describe("visual characterwise", function() {
          return it("change occurrence in narrowed selection", function() {
            keystroke('v j /');
            searchEditor.insertText('o+');
            return withMockPlatform(searchEditorElement, 'platform-darwin', function() {
              rawKeystroke('cmd-d', document.activeElement);
              return ensure('U', {
                text: "OOO: xxx: OOO: 0000\n1: ooo: 22: ooo:\nooo: xxx: |||: xxx: 3333:\n444: |||: ooo: ooo:"
              });
            });
          });
        });
        describe("visual linewise", function() {
          return it("change occurrence in narrowed selection", function() {
            keystroke('V j /');
            searchEditor.insertText('o+');
            return withMockPlatform(searchEditorElement, 'platform-darwin', function() {
              rawKeystroke('cmd-d', document.activeElement);
              return ensure('U', {
                text: "OOO: xxx: OOO: 0000\n1: OOO: 22: OOO:\nooo: xxx: |||: xxx: 3333:\n444: |||: ooo: ooo:"
              });
            });
          });
        });
        return describe("visual blockwise", function() {
          return it("change occurrence in narrowed selection", function() {
            set({
              cursor: [0, 5]
            });
            keystroke('ctrl-v 2 j 1 0 l /');
            searchEditor.insertText('o+');
            return withMockPlatform(searchEditorElement, 'platform-darwin', function() {
              rawKeystroke('cmd-d', document.activeElement);
              return ensure('U', {
                text: "ooo: xxx: OOO: 0000\n1: OOO: 22: OOO:\nooo: xxx: |||: xxx: 3333:\n444: |||: ooo: ooo:"
              });
            });
          });
        });
      });
      describe("persistent-selection is exists", function() {
        var persistentSelectionBufferRange;
        persistentSelectionBufferRange = null;
        beforeEach(function() {
          atom.keymaps.add("create-persistent-selection", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'm': 'vim-mode-plus:create-persistent-selection'
            }
          });
          set({
            text: "ooo: xxx: ooo:\n|||: ooo: xxx: ooo:\nooo: xxx: |||: xxx: ooo:\nxxx: |||: ooo: ooo:\n",
            cursor: [0, 0]
          });
          persistentSelectionBufferRange = [[[0, 0], [2, 0]], [[3, 0], [4, 0]]];
          return ensure('V j m G m m', {
            persistentSelectionBufferRange: persistentSelectionBufferRange
          });
        });
        describe("when no selection is exists", function() {
          return it("select occurrence in all persistent-selection", function() {
            set({
              cursor: [0, 0]
            });
            keystroke('/');
            searchEditor.insertText('xxx');
            return withMockPlatform(searchEditorElement, 'platform-darwin', function() {
              rawKeystroke('cmd-d', document.activeElement);
              return ensure('U', {
                text: "ooo: XXX: ooo:\n|||: ooo: XXX: ooo:\nooo: xxx: |||: xxx: ooo:\nXXX: |||: ooo: ooo:\n",
                persistentSelectionCount: 0
              });
            });
          });
        });
        return describe("when both exits, operator applied to both", function() {
          return it("select all occurrence in selection", function() {
            set({
              cursor: [0, 0]
            });
            keystroke('V 2 j /');
            searchEditor.insertText('xxx');
            return withMockPlatform(searchEditorElement, 'platform-darwin', function() {
              rawKeystroke('cmd-d', document.activeElement);
              return ensure('U', {
                text: "ooo: XXX: ooo:\n|||: ooo: XXX: ooo:\nooo: XXX: |||: XXX: ooo:\nXXX: |||: ooo: ooo:\n",
                persistentSelectionCount: 0
              });
            });
          });
        });
      });
      return describe("demonstrate persistent-selection's practical scenario", function() {
        var oldGrammar;
        oldGrammar = [][0];
        afterEach(function() {
          return editor.setGrammar(oldGrammar);
        });
        beforeEach(function() {
          atom.keymaps.add("create-persistent-selection", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'm': 'vim-mode-plus:toggle-persistent-selection'
            }
          });
          waitsForPromise(function() {
            return atom.packages.activatePackage('language-coffee-script');
          });
          runs(function() {
            oldGrammar = editor.getGrammar();
            return editor.setGrammar(atom.grammars.grammarForScopeName('source.coffee'));
          });
          return set({
            text: "constructor: (@main, @editor, @statusBarManager) ->\n  @editorElement = @editor.element\n  @emitter = new Emitter\n  @subscriptions = new CompositeDisposable\n  @modeManager = new ModeManager(this)\n  @mark = new MarkManager(this)\n  @register = new RegisterManager(this)\n  @persistentSelections = []\n\n  @highlightSearchSubscription = @editorElement.onDidChangeScrollTop =>\n    @refreshHighlightSearch()\n\n  @operationStack = new OperationStack(this)\n  @cursorStyleManager = new CursorStyleManager(this)\n\nanotherFunc: ->\n  @hello = []"
          });
        });
        return it('change all assignment("=") of current-function to "?="', function() {
          set({
            cursor: [0, 0]
          });
          ensure([
            'j f', {
              input: '='
            }
          ], {
            cursor: [1, 17]
          });
          runs(function() {
            return withMockPlatform(searchEditorElement, 'platform-darwin', function() {
              var textsInBufferRange, textsInBufferRangeIsAllEqualChar;
              keystroke(['g cmd-d', 'i f', 'm'].join(" "));
              textsInBufferRange = vimState.persistentSelection.getMarkerBufferRanges().map(function(range) {
                return editor.getTextInBufferRange(range);
              });
              textsInBufferRangeIsAllEqualChar = textsInBufferRange.every(function(text) {
                return text === '=';
              });
              expect(textsInBufferRangeIsAllEqualChar).toBe(true);
              expect(vimState.persistentSelection.getMarkers()).toHaveLength(11);
              keystroke('2 l');
              ensure([
                '/', {
                  search: '=>'
                }
              ], {
                cursor: [9, 69]
              });
              keystroke("m");
              return expect(vimState.persistentSelection.getMarkers()).toHaveLength(10);
            });
          });
          waitsFor(function() {
            return editorElement.classList.contains('has-persistent-selection');
          });
          return runs(function() {
            return withMockPlatform(searchEditorElement, 'platform-darwin', function() {
              keystroke(['ctrl-cmd-g', 'I']);
              editor.insertText('?');
              return ensure('escape', {
                text: "constructor: (@main, @editor, @statusBarManager) ->\n  @editorElement ?= @editor.element\n  @emitter ?= new Emitter\n  @subscriptions ?= new CompositeDisposable\n  @modeManager ?= new ModeManager(this)\n  @mark ?= new MarkManager(this)\n  @register ?= new RegisterManager(this)\n  @persistentSelections ?= []\n\n  @highlightSearchSubscription ?= @editorElement.onDidChangeScrollTop =>\n    @refreshHighlightSearch()\n\n  @operationStack ?= new OperationStack(this)\n  @cursorStyleManager ?= new CursorStyleManager(this)\n\nanotherFunc: ->\n  @hello = []"
              });
            });
          });
        });
      });
    });
    return describe("preset occurrence marker", function() {
      beforeEach(function() {
        jasmine.attachToDOM(getView(atom.workspace));
        return set({
          text: "This text have 3 instance of 'text' in the whole text",
          cursor: [0, 0]
        });
      });
      describe("toggle-preset-occurrence commands", function() {
        describe("in normal-mode", function() {
          describe("add preset occurrence", function() {
            return it('set cursor-ward as preset occurrence marker and not move cursor', function() {
              ensure('g o', {
                occurrenceCount: 1,
                occurrenceText: 'This',
                cursor: [0, 0]
              });
              ensure('w', {
                cursor: [0, 5]
              });
              return ensure('g o', {
                occurrenceCount: 4,
                occurrenceText: ['This', 'text', 'text', 'text'],
                cursor: [0, 5]
              });
            });
          });
          describe("remove preset occurrence", function() {
            it('removes occurrence one by one separately', function() {
              ensure('g o', {
                occurrenceCount: 1,
                occurrenceText: 'This',
                cursor: [0, 0]
              });
              ensure('w', {
                cursor: [0, 5]
              });
              ensure('g o', {
                occurrenceCount: 4,
                occurrenceText: ['This', 'text', 'text', 'text'],
                cursor: [0, 5]
              });
              ensure('g o', {
                occurrenceCount: 3,
                occurrenceText: ['This', 'text', 'text'],
                cursor: [0, 5]
              });
              return ensure('b g o', {
                occurrenceCount: 2,
                occurrenceText: ['text', 'text'],
                cursor: [0, 0]
              });
            });
            return it('removes all occurrence in this editor by escape', function() {
              ensure('g o', {
                occurrenceCount: 1,
                occurrenceText: 'This',
                cursor: [0, 0]
              });
              ensure('w', {
                cursor: [0, 5]
              });
              ensure('g o', {
                occurrenceCount: 4,
                occurrenceText: ['This', 'text', 'text', 'text'],
                cursor: [0, 5]
              });
              return ensure('escape', {
                occurrenceCount: 0
              });
            });
          });
          return describe("css class has-occurrence", function() {
            var classList, update, _ref2;
            _ref2 = [], classList = _ref2[0], update = _ref2[1];
            beforeEach(function() {
              return vimState.occurrenceManager.markerLayer.onDidUpdate(update = jasmine.createSpy());
            });
            return it('is auto-set/unset wheter at least one preset-occurrence was exists or not', function() {
              runs(function() {
                expect(editorElement.classList.contains('has-occurrence')).toBe(false);
                return ensure('g o', {
                  occurrenceCount: 1,
                  occurrenceText: 'This',
                  cursor: [0, 0]
                });
              });
              waitsFor(function() {
                return update.callCount === 1;
              });
              runs(function() {
                expect(editorElement.classList.contains('has-occurrence')).toBe(true);
                return ensure('g o', {
                  occurrenceCount: 0,
                  cursor: [0, 0]
                });
              });
              waitsFor(function() {
                return update.callCount === 2;
              });
              return runs(function() {
                return expect(editorElement.classList.contains('has-occurrence')).toBe(false);
              });
            });
          });
        });
        describe("in visual-mode", function() {
          describe("add preset occurrence", function() {
            return it('set selected-text as preset occurrence marker and not move cursor', function() {
              ensure('w v l', {
                mode: ['visual', 'characterwise'],
                selectedText: 'te'
              });
              return ensure('g o', {
                mode: 'normal',
                occurrenceText: ['te', 'te', 'te']
              });
            });
          });
          return describe("is-narrowed selection", function() {
            var textOriginal;
            textOriginal = [][0];
            beforeEach(function() {
              textOriginal = "This text have 3 instance of 'text' in the whole text\nThis text have 3 instance of 'text' in the whole text\n";
              return set({
                cursor: [0, 0],
                text: textOriginal
              });
            });
            return it("pick ocurrence-word from cursor position and continue visual-mode", function() {
              ensure('w V j', {
                mode: ['visual', 'linewise'],
                selectedText: textOriginal
              });
              ensure('g o', {
                mode: ['visual', 'linewise'],
                selectedText: textOriginal,
                occurrenceText: ['text', 'text', 'text', 'text', 'text', 'text']
              });
              return ensure([
                'r', {
                  input: '!'
                }
              ], {
                mode: 'normal',
                text: "This !!!! have 3 instance of '!!!!' in the whole !!!!\nThis !!!! have 3 instance of '!!!!' in the whole !!!!\n"
              });
            });
          });
        });
        return describe("in incremental-search", function() {
          var searchEditor, searchEditorElement, _ref2;
          _ref2 = [], searchEditor = _ref2[0], searchEditorElement = _ref2[1];
          beforeEach(function() {
            searchEditor = vimState.searchInput.editor;
            searchEditorElement = searchEditor.element;
            jasmine.attachToDOM(getView(atom.workspace));
            return settings.set('incrementalSearch', true);
          });
          return describe("add-occurrence-pattern-from-search", function() {
            return it('mark as occurrence which matches regex entered in search-ui', function() {
              keystroke('/');
              searchEditor.insertText('\\bt\\w+');
              return withMockPlatform(searchEditorElement, 'platform-darwin', function() {
                rawKeystroke('cmd-o', document.activeElement);
                return ensure({
                  occurrenceText: ['text', 'text', 'the', 'text']
                });
              });
            });
          });
        });
      });
      describe("mutate preset occurence", function() {
        beforeEach(function() {
          set({
            text: "ooo: xxx: ooo xxx: ooo:\n!!!: ooo: xxx: ooo xxx: ooo:"
          });
          ({
            cursor: [0, 0]
          });
          return jasmine.attachToDOM(getView(atom.workspace));
        });
        describe("normal-mode", function() {
          it('[delete] apply operation to preset-marker intersecting selected target', function() {
            return ensure('l g o D', {
              text: ": xxx:  xxx: :\n!!!: ooo: xxx: ooo xxx: ooo:"
            });
          });
          it('[upcase] apply operation to preset-marker intersecting selected target', function() {
            set({
              cursor: [0, 6]
            });
            return ensure('l g o g U j', {
              text: "ooo: XXX: ooo XXX: ooo:\n!!!: ooo: XXX: ooo XXX: ooo:"
            });
          });
          it('[upcase exclude] won\'t mutate removed marker', function() {
            set({
              cursor: [0, 0]
            });
            ensure('g o', {
              occurrenceCount: 6
            });
            ensure('g o', {
              occurrenceCount: 5
            });
            return ensure('g U j', {
              text: "ooo: xxx: OOO xxx: OOO:\n!!!: OOO: xxx: OOO xxx: OOO:"
            });
          });
          it('[delete] apply operation to preset-marker intersecting selected target', function() {
            set({
              cursor: [0, 10]
            });
            return ensure('g o g U $', {
              text: "ooo: xxx: OOO xxx: OOO:\n!!!: ooo: xxx: ooo xxx: ooo:"
            });
          });
          it('[change] apply operation to preset-marker intersecting selected target', function() {
            ensure('l g o C', {
              mode: 'insert',
              text: ": xxx:  xxx: :\n!!!: ooo: xxx: ooo xxx: ooo:"
            });
            editor.insertText('YYY');
            return ensure('l g o C', {
              mode: 'insert',
              text: "YYY: xxx: YYY xxx: YYY:\n!!!: ooo: xxx: ooo xxx: ooo:",
              numCursors: 3
            });
          });
          return describe("predefined keymap on when has-occurrence", function() {
            beforeEach(function() {
              return set({
                text: "Vim is editor I used before\nVim is editor I used before\nVim is editor I used before\nVim is editor I used before"
              });
            });
            it('[insert-at-start] apply operation to preset-marker intersecting selected target', function() {
              set({
                cursor: [1, 1]
              });
              runs(function() {
                return ensure('g o', {
                  occurrenceText: ['Vim', 'Vim', 'Vim', 'Vim']
                });
              });
              waitsFor(function() {
                return editorElement.classList.contains('has-occurrence');
              });
              return runs(function() {
                ensure('I k', {
                  mode: 'insert',
                  numCursors: 2
                });
                editor.insertText("pure-");
                return ensure('escape', {
                  mode: 'normal',
                  text: "pure-Vim is editor I used before\npure-Vim is editor I used before\nVim is editor I used before\nVim is editor I used before"
                });
              });
            });
            return it('[insert-after-start] apply operation to preset-marker intersecting selected target', function() {
              set({
                cursor: [1, 1]
              });
              runs(function() {
                return ensure('g o', {
                  occurrenceText: ['Vim', 'Vim', 'Vim', 'Vim']
                });
              });
              waitsFor(function() {
                return editorElement.classList.contains('has-occurrence');
              });
              return runs(function() {
                ensure('A j', {
                  mode: 'insert',
                  numCursors: 2
                });
                editor.insertText(" and Emacs");
                return ensure('escape', {
                  mode: 'normal',
                  text: "Vim is editor I used before\nVim and Emacs is editor I used before\nVim and Emacs is editor I used before\nVim is editor I used before"
                });
              });
            });
          });
        });
        describe("visual-mode", function() {
          return it('[upcase] apply to preset-marker as long as it intersects selection', function() {
            set({
              cursor: [0, 6],
              text: "ooo: xxx: ooo xxx: ooo:\nxxx: ooo: xxx: ooo xxx: ooo:"
            });
            ensure('g o', {
              occurrenceCount: 5
            });
            return ensure('v j U', {
              text: "ooo: XXX: ooo XXX: ooo:\nXXX: ooo: xxx: ooo xxx: ooo:"
            });
          });
        });
        describe("visual-linewise-mode", function() {
          return it('[upcase] apply to preset-marker as long as it intersects selection', function() {
            set({
              cursor: [0, 6],
              text: "ooo: xxx: ooo xxx: ooo:\nxxx: ooo: xxx: ooo xxx: ooo:"
            });
            ensure('g o', {
              occurrenceCount: 5
            });
            return ensure('V U', {
              text: "ooo: XXX: ooo XXX: ooo:\nxxx: ooo: xxx: ooo xxx: ooo:"
            });
          });
        });
        return describe("visual-blockwise-mode", function() {
          return it('[upcase] apply to preset-marker as long as it intersects selection', function() {
            set({
              cursor: [0, 6],
              text: "ooo: xxx: ooo xxx: ooo:\nxxx: ooo: xxx: ooo xxx: ooo:"
            });
            ensure('g o', {
              occurrenceCount: 5
            });
            return ensure('ctrl-v j 2 w U', {
              text: "ooo: XXX: ooo xxx: ooo:\nxxx: ooo: XXX: ooo xxx: ooo:"
            });
          });
        });
      });
      return describe("explict operator-modifier o and preset-marker", function() {
        beforeEach(function() {
          return set({
            text: "ooo: xxx: ooo xxx: ooo:\n!!!: ooo: xxx: ooo xxx: ooo:",
            cursor: [0, 0]
          }, jasmine.attachToDOM(getView(atom.workspace)));
        });
        describe("'o' modifier when preset occurrence already exists", function() {
          return it("'o' always pick cursor-word and overwrite existing preset marker)", function() {
            ensure("g o", {
              occurrenceText: ["ooo", "ooo", "ooo", "ooo", "ooo", "ooo"]
            });
            ensure("2 w d o", {
              occurrenceText: ["xxx", "xxx", "xxx", "xxx"],
              mode: 'operator-pending'
            });
            return ensure("j", {
              text: "ooo: : ooo : ooo:\n!!!: ooo: : ooo : ooo:",
              mode: 'normal'
            });
          });
        });
        return describe("occurrence bound operator don't overwite pre-existing preset marker", function() {
          return it("'o' always pick cursor-word and clear existing preset marker", function() {
            ensure("g o", {
              occurrenceText: ["ooo", "ooo", "ooo", "ooo", "ooo", "ooo"]
            });
            ensure("2 w g cmd-d", {
              occurrenceText: ["ooo", "ooo", "ooo", "ooo", "ooo", "ooo"],
              mode: 'operator-pending'
            });
            return ensure("j", {
              selectedText: ["ooo", "ooo", "ooo", "ooo", "ooo", "ooo"]
            });
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvb2NjdXJyZW5jZS1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx3RkFBQTs7QUFBQSxFQUFBLE9BQTZFLE9BQUEsQ0FBUSxlQUFSLENBQTdFLEVBQUMsbUJBQUEsV0FBRCxFQUFjLGdCQUFBLFFBQWQsRUFBd0IsZ0JBQUEsUUFBeEIsRUFBa0MsZUFBQSxPQUFsQyxFQUEyQyx3QkFBQSxnQkFBM0MsRUFBNkQsb0JBQUEsWUFBN0QsQ0FBQTs7QUFBQSxFQUNBLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVIsQ0FEWCxDQUFBOztBQUFBLEVBR0EsUUFBQSxDQUFTLFlBQVQsRUFBdUIsU0FBQSxHQUFBO0FBQ3JCLFFBQUEsOERBQUE7QUFBQSxJQUFBLFFBQTRELEVBQTVELEVBQUMsY0FBRCxFQUFNLGlCQUFOLEVBQWMsb0JBQWQsRUFBeUIsaUJBQXpCLEVBQWlDLHdCQUFqQyxFQUFnRCxtQkFBaEQsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLEdBQVIsR0FBQTtBQUNWLFFBQUEsUUFBQSxHQUFXLEtBQVgsQ0FBQTtBQUFBLFFBQ0Msa0JBQUEsTUFBRCxFQUFTLHlCQUFBLGFBRFQsQ0FBQTtlQUVDLFVBQUEsR0FBRCxFQUFNLGFBQUEsTUFBTixFQUFjLGdCQUFBLFNBQWQsRUFBMkIsSUFIakI7TUFBQSxDQUFaLENBQUEsQ0FBQTthQUtBLElBQUEsQ0FBSyxTQUFBLEdBQUE7ZUFDSCxPQUFPLENBQUMsV0FBUixDQUFvQixhQUFwQixFQURHO01BQUEsQ0FBTCxFQU5TO0lBQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxJQVdBLFNBQUEsQ0FBVSxTQUFBLEdBQUE7YUFDUixRQUFRLENBQUMsZUFBVCxDQUFBLEVBRFE7SUFBQSxDQUFWLENBWEEsQ0FBQTtBQUFBLElBY0EsUUFBQSxDQUFTLDhCQUFULEVBQXlDLFNBQUEsR0FBQTtBQUN2QyxNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7ZUFDVCxHQUFBLENBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSw4S0FBTjtTQURGLEVBRFM7TUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLE1BZ0JBLFFBQUEsQ0FBUyxpQ0FBVCxFQUE0QyxTQUFBLEdBQUE7ZUFDMUMsRUFBQSxDQUFHLHFEQUFILEVBQTBELFNBQUEsR0FBQTtBQUN4RCxVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPLFNBQVAsRUFDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxZQUNBLFVBQUEsRUFBWSxDQURaO0FBQUEsWUFFQSxJQUFBLEVBQU0sc0pBRk47V0FERixDQURBLENBQUE7QUFBQSxVQWlCQSxNQUFNLENBQUMsVUFBUCxDQUFrQixLQUFsQixDQWpCQSxDQUFBO0FBQUEsVUFrQkEsTUFBQSxDQUFPLFFBQVAsRUFDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxZQUNBLFVBQUEsRUFBWSxDQURaO0FBQUEsWUFFQSxJQUFBLEVBQU0sOEtBRk47V0FERixDQWxCQSxDQUFBO2lCQWtDQSxNQUFBLENBQU8sT0FBUCxFQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFlBQ0EsVUFBQSxFQUFZLENBRFo7QUFBQSxZQUVBLElBQUEsRUFBTSw4S0FGTjtXQURGLEVBbkN3RDtRQUFBLENBQTFELEVBRDBDO01BQUEsQ0FBNUMsQ0FoQkEsQ0FBQTtBQUFBLE1BcUVBLFFBQUEsQ0FBUyx3REFBVCxFQUFtRSxTQUFBLEdBQUE7QUFDakUsUUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2lCQUNULEdBQUEsQ0FDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLG9GQUFOO1dBREYsRUFEUztRQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsUUFRQSxFQUFBLENBQUcsdUJBQUgsRUFBNEIsU0FBQSxHQUFBO0FBQzFCLFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksRUFBSixDQUFSO1dBQUosQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFBLENBQU8sV0FBUCxFQUFvQixTQUFBLEdBQUE7bUJBQ2xCO0FBQUEsY0FBQSxJQUFBLEVBQU0sb0ZBQU47QUFBQSxjQU1BLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBTlI7Y0FEa0I7VUFBQSxDQUFwQixDQURBLENBQUE7QUFBQSxVQVNBLE1BQUEsQ0FBTyxPQUFQLEVBQWdCLFNBQUEsR0FBQTttQkFDZDtBQUFBLGNBQUEsSUFBQSxFQUFNLG9GQUFOO0FBQUEsY0FNQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQU5SO2NBRGM7VUFBQSxDQUFoQixDQVRBLENBQUE7aUJBaUJBLE1BQUEsQ0FBTyxLQUFQLEVBQWMsU0FBQSxHQUFBO21CQUNaO0FBQUEsY0FBQSxJQUFBLEVBQU0sb0ZBQU47QUFBQSxjQU1BLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBTlI7Y0FEWTtVQUFBLENBQWQsRUFsQjBCO1FBQUEsQ0FBNUIsQ0FSQSxDQUFBO2VBa0NBLEVBQUEsQ0FBRyx3QkFBSCxFQUE2QixTQUFBLEdBQUE7QUFDM0IsVUFBQSxHQUFBLENBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSxvRkFBTjtBQUFBLFlBTUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FOUjtXQURGLENBQUEsQ0FBQTtpQkFRQSxNQUFBLENBQU8sV0FBUCxFQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sb0ZBQU47V0FERixFQVQyQjtRQUFBLENBQTdCLEVBbkNpRTtNQUFBLENBQW5FLENBckVBLENBQUE7QUFBQSxNQXlIQSxRQUFBLENBQVMsZ0RBQVQsRUFBMkQsU0FBQSxHQUFBO0FBQ3pELFlBQUEsdUJBQUE7QUFBQSxRQUFBLFlBQUEsR0FBZSwwREFBZixDQUFBO0FBQUEsUUFDQSxTQUFBLEdBQVksWUFBWSxDQUFDLE9BQWIsQ0FBcUIsT0FBckIsRUFBOEIsRUFBOUIsQ0FEWixDQUFBO0FBQUEsUUFHQSxVQUFBLENBQVcsU0FBQSxHQUFBO2lCQUNULEdBQUEsQ0FBSTtBQUFBLFlBQUEsSUFBQSxFQUFNLFlBQU47V0FBSixFQURTO1FBQUEsQ0FBWCxDQUhBLENBQUE7QUFBQSxRQU1BLEVBQUEsQ0FBRyxxQkFBSCxFQUEwQixTQUFBLEdBQUE7QUFBRyxVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKLENBQUEsQ0FBQTtpQkFBb0IsTUFBQSxDQUFPLE9BQVAsRUFBZ0I7QUFBQSxZQUFBLElBQUEsRUFBTSxTQUFOO1dBQWhCLEVBQXZCO1FBQUEsQ0FBMUIsQ0FOQSxDQUFBO0FBQUEsUUFPQSxFQUFBLENBQUcsc0JBQUgsRUFBMkIsU0FBQSxHQUFBO0FBQUcsVUFBQSxHQUFBLENBQUk7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7V0FBSixDQUFBLENBQUE7aUJBQW9CLE1BQUEsQ0FBTyxPQUFQLEVBQWdCO0FBQUEsWUFBQSxJQUFBLEVBQU0sU0FBTjtXQUFoQixFQUF2QjtRQUFBLENBQTNCLENBUEEsQ0FBQTtBQUFBLFFBUUEsRUFBQSxDQUFHLG9CQUFILEVBQXlCLFNBQUEsR0FBQTtBQUFHLFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksRUFBSixDQUFSO1dBQUosQ0FBQSxDQUFBO2lCQUFxQixNQUFBLENBQU8sT0FBUCxFQUFnQjtBQUFBLFlBQUEsSUFBQSxFQUFNLFNBQU47V0FBaEIsRUFBeEI7UUFBQSxDQUF6QixDQVJBLENBQUE7ZUFTQSxFQUFBLENBQUcsdUJBQUgsRUFBNEIsU0FBQSxHQUFBO0FBQUcsVUFBQSxHQUFBLENBQUk7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVI7V0FBSixDQUFBLENBQUE7aUJBQXFCLE1BQUEsQ0FBTyxPQUFQLEVBQWdCO0FBQUEsWUFBQSxJQUFBLEVBQU0sU0FBTjtXQUFoQixFQUF4QjtRQUFBLENBQTVCLEVBVnlEO01BQUEsQ0FBM0QsQ0F6SEEsQ0FBQTthQXFJQSxRQUFBLENBQVMsbUJBQVQsRUFBOEIsU0FBQSxHQUFBO0FBQzVCLFFBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtpQkFDVCxHQUFBLENBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSw2QkFBTjtXQURGLEVBRFM7UUFBQSxDQUFYLENBQUEsQ0FBQTtlQUtBLFFBQUEsQ0FBUyxzQkFBVCxFQUFpQyxTQUFBLEdBQUE7QUFDL0IsY0FBQSxnQkFBQTtBQUFBLFVBQUEsZ0JBQUEsR0FBbUIsU0FBQyxZQUFELEVBQWUsSUFBZixHQUFBO0FBQ2pCLGdCQUFBLFlBQUE7QUFBQSxZQURpQyxlQUFELEtBQUMsWUFDakMsQ0FBQTtBQUFBLFlBQUEsR0FBQSxDQUFJO0FBQUEsY0FBQSxNQUFBLEVBQVEsWUFBUjthQUFKLENBQUEsQ0FBQTtBQUFBLFlBQ0EsTUFBQSxDQUFPLGFBQVAsRUFDRTtBQUFBLGNBQUEsWUFBQSxFQUFjLFlBQWQ7QUFBQSxjQUNBLElBQUEsRUFBTSxDQUFDLFFBQUQsRUFBVyxlQUFYLENBRE47YUFERixDQURBLENBQUE7bUJBSUEsTUFBQSxDQUFPLFFBQVAsRUFBaUI7QUFBQSxjQUFBLElBQUEsRUFBTSxRQUFOO2FBQWpCLEVBTGlCO1VBQUEsQ0FBbkIsQ0FBQTtBQUFBLFVBT0EsUUFBQSxDQUFTLDBCQUFULEVBQXFDLFNBQUEsR0FBQTttQkFDbkMsRUFBQSxDQUFHLDBEQUFILEVBQStELFNBQUEsR0FBQTtBQUM3RCxjQUFBLGdCQUFBLENBQWlCLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBakIsRUFBeUI7QUFBQSxnQkFBQSxZQUFBLEVBQWMsQ0FBQyxLQUFELEVBQVEsS0FBUixDQUFkO2VBQXpCLENBQUEsQ0FBQTtBQUFBLGNBQ0EsZ0JBQUEsQ0FBaUIsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFqQixFQUF5QjtBQUFBLGdCQUFBLFlBQUEsRUFBYyxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxFQUFnQixHQUFoQixDQUFkO2VBQXpCLENBREEsQ0FBQTtBQUFBLGNBRUEsZ0JBQUEsQ0FBaUIsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFqQixFQUF5QjtBQUFBLGdCQUFBLFlBQUEsRUFBYyxDQUFDLE1BQUQsRUFBUyxNQUFULENBQWQ7ZUFBekIsQ0FGQSxDQUFBO3FCQUdBLGdCQUFBLENBQWlCLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBakIsRUFBeUI7QUFBQSxnQkFBQSxZQUFBLEVBQWMsQ0FBQyxNQUFELEVBQVMsTUFBVCxDQUFkO2VBQXpCLEVBSjZEO1lBQUEsQ0FBL0QsRUFEbUM7VUFBQSxDQUFyQyxDQVBBLENBQUE7QUFBQSxVQWNBLFFBQUEsQ0FBUyw2Q0FBVCxFQUF3RCxTQUFBLEdBQUE7bUJBQ3RELEVBQUEsQ0FBRyw4QkFBSCxFQUFtQyxTQUFBLEdBQUE7QUFDakMsY0FBQSxHQUFBLENBQ0U7QUFBQSxnQkFBQSxJQUFBLEVBQU0sMkJBQU47QUFBQSxnQkFJQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUpSO2VBREYsQ0FBQSxDQUFBO3FCQU1BLE1BQUEsQ0FBTyxTQUFQLEVBQ0U7QUFBQSxnQkFBQSxJQUFBLEVBQU0sc0JBQU47ZUFERixFQVBpQztZQUFBLENBQW5DLEVBRHNEO1VBQUEsQ0FBeEQsQ0FkQSxDQUFBO2lCQTRCQSxRQUFBLENBQVMsMkNBQVQsRUFBc0QsU0FBQSxHQUFBO21CQUNwRCxFQUFBLENBQUcsK0RBQUgsRUFBb0UsU0FBQSxHQUFBO0FBQ2xFLGNBQUEsR0FBQSxDQUNFO0FBQUEsZ0JBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtBQUFBLGdCQUNBLEtBQUEsRUFBTywyQ0FEUDtlQURGLENBQUEsQ0FBQTtxQkFNQSxNQUFBLENBQU8sU0FBUCxFQUNFO0FBQUEsZ0JBQUEsS0FBQSxFQUFPLCtCQUFQO2VBREYsRUFQa0U7WUFBQSxDQUFwRSxFQURvRDtVQUFBLENBQXRELEVBN0IrQjtRQUFBLENBQWpDLEVBTjRCO01BQUEsQ0FBOUIsRUF0SXVDO0lBQUEsQ0FBekMsQ0FkQSxDQUFBO0FBQUEsSUFxTUEsUUFBQSxDQUFTLDhCQUFULEVBQXlDLFNBQUEsR0FBQTtBQUN2QyxNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7ZUFDVCxHQUFBLENBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSxvRkFBTjtBQUFBLFVBTUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FOUjtTQURGLEVBRFM7TUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLE1BVUEsUUFBQSxDQUFTLHdCQUFULEVBQW1DLFNBQUEsR0FBQTtlQUNqQyxFQUFBLENBQUcsdUVBQUgsRUFBNEUsU0FBQSxHQUFBO2lCQUMxRSxNQUFBLENBQU8sZUFBUCxFQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sb0ZBQU47QUFBQSxZQU1BLFVBQUEsRUFBWSxDQU5aO1dBREYsRUFEMEU7UUFBQSxDQUE1RSxFQURpQztNQUFBLENBQW5DLENBVkEsQ0FBQTtBQUFBLE1BcUJBLFFBQUEsQ0FBUyx3QkFBVCxFQUFtQyxTQUFBLEdBQUE7ZUFDakMsRUFBQSxDQUFHLHVFQUFILEVBQTRFLFNBQUEsR0FBQTtpQkFDMUUsTUFBQSxDQUFPLG1CQUFQLEVBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSxvRkFBTjtBQUFBLFlBTUEsVUFBQSxFQUFZLENBTlo7V0FERixFQUQwRTtRQUFBLENBQTVFLEVBRGlDO01BQUEsQ0FBbkMsQ0FyQkEsQ0FBQTthQWdDQSxRQUFBLENBQVMsd0JBQVQsRUFBbUMsU0FBQSxHQUFBO0FBQ2pDLFFBQUEsRUFBQSxDQUFHLHVFQUFILEVBQTRFLFNBQUEsR0FBQTtpQkFDMUUsTUFBQSxDQUFPLDBCQUFQLEVBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSxvRkFBTjtBQUFBLFlBTUEsVUFBQSxFQUFZLENBTlo7V0FERixFQUQwRTtRQUFBLENBQTVFLENBQUEsQ0FBQTtlQVVBLEVBQUEsQ0FBRyxnQ0FBSCxFQUFxQyxTQUFBLEdBQUE7aUJBQ25DLE1BQUEsQ0FBTywwQkFBUCxFQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sb0ZBQU47QUFBQSxZQU1BLFVBQUEsRUFBWSxDQU5aO1dBREYsRUFEbUM7UUFBQSxDQUFyQyxFQVhpQztNQUFBLENBQW5DLEVBakN1QztJQUFBLENBQXpDLENBck1BLENBQUE7QUFBQSxJQTJQQSxRQUFBLENBQVMsOEZBQVQsRUFBeUcsU0FBQSxHQUFBO0FBQ3ZHLFVBQUEsd0NBQUE7QUFBQSxNQUFBLFFBQXNDLEVBQXRDLEVBQUMsdUJBQUQsRUFBZSw4QkFBZixDQUFBO0FBQUEsTUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsUUFBQSxZQUFBLEdBQWUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUFwQyxDQUFBO0FBQUEsUUFDQSxtQkFBQSxHQUFzQixZQUFZLENBQUMsT0FEbkMsQ0FBQTtBQUFBLFFBRUEsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsT0FBQSxDQUFRLElBQUksQ0FBQyxTQUFiLENBQXBCLENBRkEsQ0FBQTtBQUFBLFFBR0EsUUFBUSxDQUFDLEdBQVQsQ0FBYSxtQkFBYixFQUFrQyxJQUFsQyxDQUhBLENBQUE7ZUFJQSxHQUFBLENBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSx1RkFBTjtBQUFBLFVBTUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FOUjtTQURGLEVBTFM7TUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLE1BZ0JBLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBLEdBQUE7QUFDM0IsUUFBQSxFQUFBLENBQUcsb0NBQUgsRUFBeUMsU0FBQSxHQUFBO0FBQ3ZDLFVBQUEsU0FBQSxDQUFVLEdBQVYsQ0FBQSxDQUFBO0FBQUEsVUFDQSxZQUFZLENBQUMsVUFBYixDQUF3QixVQUF4QixDQURBLENBQUE7aUJBRUEsZ0JBQUEsQ0FBaUIsbUJBQWpCLEVBQXNDLGlCQUF0QyxFQUEwRCxTQUFBLEdBQUE7QUFDeEQsWUFBQSxZQUFBLENBQWEsT0FBYixFQUFzQixRQUFRLENBQUMsYUFBL0IsQ0FBQSxDQUFBO21CQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQ0U7QUFBQSxjQUFBLFlBQUEsRUFBYyxDQUFDLE1BQUQsRUFBUyxNQUFULEVBQWlCLEtBQWpCLENBQWQ7QUFBQSxjQUNBLElBQUEsRUFBTSxDQUFDLFFBQUQsRUFBVyxlQUFYLENBRE47YUFERixFQUZ3RDtVQUFBLENBQTFELEVBSHVDO1FBQUEsQ0FBekMsQ0FBQSxDQUFBO2VBU0EsRUFBQSxDQUFHLG9DQUFILEVBQXlDLFNBQUEsR0FBQTtBQUN2QyxVQUFBLFNBQUEsQ0FBVSxHQUFWLENBQUEsQ0FBQTtBQUFBLFVBQ0EsWUFBWSxDQUFDLFVBQWIsQ0FBd0IsUUFBeEIsQ0FEQSxDQUFBO2lCQUVBLGdCQUFBLENBQWlCLG1CQUFqQixFQUFzQyxpQkFBdEMsRUFBMEQsU0FBQSxHQUFBO0FBQ3hELFlBQUEsWUFBQSxDQUFhLFlBQWIsRUFBMkIsUUFBUSxDQUFDLGFBQXBDLENBQUEsQ0FBQTtBQUFBLFlBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLGNBQUEsSUFBQSxFQUFNLFFBQU47YUFBZCxDQURBLENBQUE7QUFBQSxZQUVBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLE9BQWxCLENBRkEsQ0FBQTttQkFHQSxNQUFBLENBQ0U7QUFBQSxjQUFBLElBQUEsRUFBTSw2RkFBTjthQURGLEVBSndEO1VBQUEsQ0FBMUQsRUFIdUM7UUFBQSxDQUF6QyxFQVYyQjtNQUFBLENBQTdCLENBaEJBLENBQUE7QUFBQSxNQXlDQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQSxHQUFBO0FBQzNCLFFBQUEsUUFBQSxDQUFTLHNCQUFULEVBQWlDLFNBQUEsR0FBQTtpQkFDL0IsRUFBQSxDQUFHLHlDQUFILEVBQThDLFNBQUEsR0FBQTtBQUM1QyxZQUFBLFNBQUEsQ0FBVSxPQUFWLENBQUEsQ0FBQTtBQUFBLFlBQ0EsWUFBWSxDQUFDLFVBQWIsQ0FBd0IsSUFBeEIsQ0FEQSxDQUFBO21CQUVBLGdCQUFBLENBQWlCLG1CQUFqQixFQUFzQyxpQkFBdEMsRUFBMEQsU0FBQSxHQUFBO0FBQ3hELGNBQUEsWUFBQSxDQUFhLE9BQWIsRUFBc0IsUUFBUSxDQUFDLGFBQS9CLENBQUEsQ0FBQTtxQkFDQSxNQUFBLENBQU8sR0FBUCxFQUNFO0FBQUEsZ0JBQUEsSUFBQSxFQUFNLHVGQUFOO2VBREYsRUFGd0Q7WUFBQSxDQUExRCxFQUg0QztVQUFBLENBQTlDLEVBRCtCO1FBQUEsQ0FBakMsQ0FBQSxDQUFBO0FBQUEsUUFjQSxRQUFBLENBQVMsaUJBQVQsRUFBNEIsU0FBQSxHQUFBO2lCQUMxQixFQUFBLENBQUcseUNBQUgsRUFBOEMsU0FBQSxHQUFBO0FBQzVDLFlBQUEsU0FBQSxDQUFVLE9BQVYsQ0FBQSxDQUFBO0FBQUEsWUFDQSxZQUFZLENBQUMsVUFBYixDQUF3QixJQUF4QixDQURBLENBQUE7bUJBRUEsZ0JBQUEsQ0FBaUIsbUJBQWpCLEVBQXNDLGlCQUF0QyxFQUEwRCxTQUFBLEdBQUE7QUFDeEQsY0FBQSxZQUFBLENBQWEsT0FBYixFQUFzQixRQUFRLENBQUMsYUFBL0IsQ0FBQSxDQUFBO3FCQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQ0U7QUFBQSxnQkFBQSxJQUFBLEVBQU0sdUZBQU47ZUFERixFQUZ3RDtZQUFBLENBQTFELEVBSDRDO1VBQUEsQ0FBOUMsRUFEMEI7UUFBQSxDQUE1QixDQWRBLENBQUE7ZUE0QkEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUEsR0FBQTtpQkFDM0IsRUFBQSxDQUFHLHlDQUFILEVBQThDLFNBQUEsR0FBQTtBQUM1QyxZQUFBLEdBQUEsQ0FBSTtBQUFBLGNBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKLENBQUEsQ0FBQTtBQUFBLFlBQ0EsU0FBQSxDQUFVLG9CQUFWLENBREEsQ0FBQTtBQUFBLFlBRUEsWUFBWSxDQUFDLFVBQWIsQ0FBd0IsSUFBeEIsQ0FGQSxDQUFBO21CQUlBLGdCQUFBLENBQWlCLG1CQUFqQixFQUFzQyxpQkFBdEMsRUFBMEQsU0FBQSxHQUFBO0FBQ3hELGNBQUEsWUFBQSxDQUFhLE9BQWIsRUFBc0IsUUFBUSxDQUFDLGFBQS9CLENBQUEsQ0FBQTtxQkFDQSxNQUFBLENBQU8sR0FBUCxFQUNFO0FBQUEsZ0JBQUEsSUFBQSxFQUFNLHVGQUFOO2VBREYsRUFGd0Q7WUFBQSxDQUExRCxFQUw0QztVQUFBLENBQTlDLEVBRDJCO1FBQUEsQ0FBN0IsRUE3QjJCO01BQUEsQ0FBN0IsQ0F6Q0EsQ0FBQTtBQUFBLE1Bc0ZBLFFBQUEsQ0FBUyxnQ0FBVCxFQUEyQyxTQUFBLEdBQUE7QUFDekMsWUFBQSw4QkFBQTtBQUFBLFFBQUEsOEJBQUEsR0FBaUMsSUFBakMsQ0FBQTtBQUFBLFFBQ0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFVBQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFiLENBQWlCLDZCQUFqQixFQUNFO0FBQUEsWUFBQSxrREFBQSxFQUNFO0FBQUEsY0FBQSxHQUFBLEVBQUssMkNBQUw7YUFERjtXQURGLENBQUEsQ0FBQTtBQUFBLFVBSUEsR0FBQSxDQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sc0ZBQU47QUFBQSxZQU1BLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBTlI7V0FERixDQUpBLENBQUE7QUFBQSxVQWFBLDhCQUFBLEdBQWlDLENBQy9CLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFELEVBQVMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFULENBRCtCLEVBRS9CLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFELEVBQVMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFULENBRitCLENBYmpDLENBQUE7aUJBaUJBLE1BQUEsQ0FBTyxhQUFQLEVBQ0U7QUFBQSxZQUFBLDhCQUFBLEVBQWdDLDhCQUFoQztXQURGLEVBbEJTO1FBQUEsQ0FBWCxDQURBLENBQUE7QUFBQSxRQXNCQSxRQUFBLENBQVMsNkJBQVQsRUFBd0MsU0FBQSxHQUFBO2lCQUN0QyxFQUFBLENBQUcsK0NBQUgsRUFBb0QsU0FBQSxHQUFBO0FBQ2xELFlBQUEsR0FBQSxDQUFJO0FBQUEsY0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2FBQUosQ0FBQSxDQUFBO0FBQUEsWUFDQSxTQUFBLENBQVUsR0FBVixDQURBLENBQUE7QUFBQSxZQUVBLFlBQVksQ0FBQyxVQUFiLENBQXdCLEtBQXhCLENBRkEsQ0FBQTttQkFHQSxnQkFBQSxDQUFpQixtQkFBakIsRUFBc0MsaUJBQXRDLEVBQTBELFNBQUEsR0FBQTtBQUN4RCxjQUFBLFlBQUEsQ0FBYSxPQUFiLEVBQXNCLFFBQVEsQ0FBQyxhQUEvQixDQUFBLENBQUE7cUJBQ0EsTUFBQSxDQUFPLEdBQVAsRUFDRTtBQUFBLGdCQUFBLElBQUEsRUFBTSxzRkFBTjtBQUFBLGdCQU1BLHdCQUFBLEVBQTBCLENBTjFCO2VBREYsRUFGd0Q7WUFBQSxDQUExRCxFQUprRDtVQUFBLENBQXBELEVBRHNDO1FBQUEsQ0FBeEMsQ0F0QkEsQ0FBQTtlQXNDQSxRQUFBLENBQVMsMkNBQVQsRUFBc0QsU0FBQSxHQUFBO2lCQUNwRCxFQUFBLENBQUcsb0NBQUgsRUFBeUMsU0FBQSxHQUFBO0FBQ3ZDLFlBQUEsR0FBQSxDQUFJO0FBQUEsY0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2FBQUosQ0FBQSxDQUFBO0FBQUEsWUFDQSxTQUFBLENBQVUsU0FBVixDQURBLENBQUE7QUFBQSxZQUVBLFlBQVksQ0FBQyxVQUFiLENBQXdCLEtBQXhCLENBRkEsQ0FBQTttQkFHQSxnQkFBQSxDQUFpQixtQkFBakIsRUFBc0MsaUJBQXRDLEVBQTBELFNBQUEsR0FBQTtBQUN4RCxjQUFBLFlBQUEsQ0FBYSxPQUFiLEVBQXNCLFFBQVEsQ0FBQyxhQUEvQixDQUFBLENBQUE7cUJBQ0EsTUFBQSxDQUFPLEdBQVAsRUFDRTtBQUFBLGdCQUFBLElBQUEsRUFBTSxzRkFBTjtBQUFBLGdCQU1BLHdCQUFBLEVBQTBCLENBTjFCO2VBREYsRUFGd0Q7WUFBQSxDQUExRCxFQUp1QztVQUFBLENBQXpDLEVBRG9EO1FBQUEsQ0FBdEQsRUF2Q3lDO01BQUEsQ0FBM0MsQ0F0RkEsQ0FBQTthQTZJQSxRQUFBLENBQVMsdURBQVQsRUFBa0UsU0FBQSxHQUFBO0FBQ2hFLFlBQUEsVUFBQTtBQUFBLFFBQUMsYUFBYyxLQUFmLENBQUE7QUFBQSxRQUNBLFNBQUEsQ0FBVSxTQUFBLEdBQUE7aUJBQ1IsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsVUFBbEIsRUFEUTtRQUFBLENBQVYsQ0FEQSxDQUFBO0FBQUEsUUFJQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQWIsQ0FBaUIsNkJBQWpCLEVBQ0U7QUFBQSxZQUFBLGtEQUFBLEVBQ0U7QUFBQSxjQUFBLEdBQUEsRUFBSywyQ0FBTDthQURGO1dBREYsQ0FBQSxDQUFBO0FBQUEsVUFJQSxlQUFBLENBQWdCLFNBQUEsR0FBQTttQkFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsd0JBQTlCLEVBRGM7VUFBQSxDQUFoQixDQUpBLENBQUE7QUFBQSxVQU9BLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxZQUFBLFVBQUEsR0FBYSxNQUFNLENBQUMsVUFBUCxDQUFBLENBQWIsQ0FBQTttQkFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFkLENBQWtDLGVBQWxDLENBQWxCLEVBRkc7VUFBQSxDQUFMLENBUEEsQ0FBQTtpQkFXQSxHQUFBLENBQUk7QUFBQSxZQUFBLElBQUEsRUFBTSxpaUJBQU47V0FBSixFQVpTO1FBQUEsQ0FBWCxDQUpBLENBQUE7ZUFvQ0EsRUFBQSxDQUFHLHdEQUFILEVBQTZELFNBQUEsR0FBQTtBQUMzRCxVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPO1lBQUMsS0FBRCxFQUFRO0FBQUEsY0FBQSxLQUFBLEVBQU8sR0FBUDthQUFSO1dBQVAsRUFBNEI7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVI7V0FBNUIsQ0FEQSxDQUFBO0FBQUEsVUFHQSxJQUFBLENBQUssU0FBQSxHQUFBO21CQUNILGdCQUFBLENBQWlCLG1CQUFqQixFQUFzQyxpQkFBdEMsRUFBMEQsU0FBQSxHQUFBO0FBQ3hELGtCQUFBLG9EQUFBO0FBQUEsY0FBQSxTQUFBLENBQVUsQ0FDUixTQURRLEVBRVIsS0FGUSxFQUdSLEdBSFEsQ0FJVCxDQUFDLElBSlEsQ0FJSCxHQUpHLENBQVYsQ0FBQSxDQUFBO0FBQUEsY0FNQSxrQkFBQSxHQUFxQixRQUFRLENBQUMsbUJBQW1CLENBQUMscUJBQTdCLENBQUEsQ0FBb0QsQ0FBQyxHQUFyRCxDQUF5RCxTQUFDLEtBQUQsR0FBQTt1QkFDNUUsTUFBTSxDQUFDLG9CQUFQLENBQTRCLEtBQTVCLEVBRDRFO2NBQUEsQ0FBekQsQ0FOckIsQ0FBQTtBQUFBLGNBUUEsZ0NBQUEsR0FBbUMsa0JBQWtCLENBQUMsS0FBbkIsQ0FBeUIsU0FBQyxJQUFELEdBQUE7dUJBQVUsSUFBQSxLQUFRLElBQWxCO2NBQUEsQ0FBekIsQ0FSbkMsQ0FBQTtBQUFBLGNBU0EsTUFBQSxDQUFPLGdDQUFQLENBQXdDLENBQUMsSUFBekMsQ0FBOEMsSUFBOUMsQ0FUQSxDQUFBO0FBQUEsY0FVQSxNQUFBLENBQU8sUUFBUSxDQUFDLG1CQUFtQixDQUFDLFVBQTdCLENBQUEsQ0FBUCxDQUFpRCxDQUFDLFlBQWxELENBQStELEVBQS9ELENBVkEsQ0FBQTtBQUFBLGNBWUEsU0FBQSxDQUFVLEtBQVYsQ0FaQSxDQUFBO0FBQUEsY0FhQSxNQUFBLENBQU87Z0JBQUMsR0FBRCxFQUFNO0FBQUEsa0JBQUEsTUFBQSxFQUFRLElBQVI7aUJBQU47ZUFBUCxFQUE0QjtBQUFBLGdCQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVI7ZUFBNUIsQ0FiQSxDQUFBO0FBQUEsY0FjQSxTQUFBLENBQVUsR0FBVixDQWRBLENBQUE7cUJBZUEsTUFBQSxDQUFPLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxVQUE3QixDQUFBLENBQVAsQ0FBaUQsQ0FBQyxZQUFsRCxDQUErRCxFQUEvRCxFQWhCd0Q7WUFBQSxDQUExRCxFQURHO1VBQUEsQ0FBTCxDQUhBLENBQUE7QUFBQSxVQXNCQSxRQUFBLENBQVMsU0FBQSxHQUFBO21CQUNQLGFBQWEsQ0FBQyxTQUFTLENBQUMsUUFBeEIsQ0FBaUMsMEJBQWpDLEVBRE87VUFBQSxDQUFULENBdEJBLENBQUE7aUJBeUJBLElBQUEsQ0FBSyxTQUFBLEdBQUE7bUJBQ0gsZ0JBQUEsQ0FBaUIsbUJBQWpCLEVBQXNDLGlCQUF0QyxFQUEwRCxTQUFBLEdBQUE7QUFDeEQsY0FBQSxTQUFBLENBQVUsQ0FDUixZQURRLEVBRVIsR0FGUSxDQUFWLENBQUEsQ0FBQTtBQUFBLGNBSUEsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsR0FBbEIsQ0FKQSxDQUFBO3FCQUtBLE1BQUEsQ0FBTyxRQUFQLEVBQ0U7QUFBQSxnQkFBQSxJQUFBLEVBQU0sMmlCQUFOO2VBREYsRUFOd0Q7WUFBQSxDQUExRCxFQURHO1VBQUEsQ0FBTCxFQTFCMkQ7UUFBQSxDQUE3RCxFQXJDZ0U7TUFBQSxDQUFsRSxFQTlJdUc7SUFBQSxDQUF6RyxDQTNQQSxDQUFBO1dBb2VBLFFBQUEsQ0FBUywwQkFBVCxFQUFxQyxTQUFBLEdBQUE7QUFDbkMsTUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsUUFBQSxPQUFPLENBQUMsV0FBUixDQUFvQixPQUFBLENBQVEsSUFBSSxDQUFDLFNBQWIsQ0FBcEIsQ0FBQSxDQUFBO2VBQ0EsR0FBQSxDQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU0sdURBQU47QUFBQSxVQUdBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBSFI7U0FERixFQUZTO01BQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxNQVFBLFFBQUEsQ0FBUyxtQ0FBVCxFQUE4QyxTQUFBLEdBQUE7QUFDNUMsUUFBQSxRQUFBLENBQVMsZ0JBQVQsRUFBMkIsU0FBQSxHQUFBO0FBQ3pCLFVBQUEsUUFBQSxDQUFTLHVCQUFULEVBQWtDLFNBQUEsR0FBQTttQkFDaEMsRUFBQSxDQUFHLGlFQUFILEVBQXNFLFNBQUEsR0FBQTtBQUNwRSxjQUFBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxnQkFBQSxlQUFBLEVBQWlCLENBQWpCO0FBQUEsZ0JBQW9CLGNBQUEsRUFBZ0IsTUFBcEM7QUFBQSxnQkFBNEMsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBcEQ7ZUFBZCxDQUFBLENBQUE7QUFBQSxjQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxnQkFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2VBQVosQ0FEQSxDQUFBO3FCQUVBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxnQkFBQSxlQUFBLEVBQWlCLENBQWpCO0FBQUEsZ0JBQW9CLGNBQUEsRUFBZ0IsQ0FBQyxNQUFELEVBQVMsTUFBVCxFQUFpQixNQUFqQixFQUF5QixNQUF6QixDQUFwQztBQUFBLGdCQUFzRSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUE5RTtlQUFkLEVBSG9FO1lBQUEsQ0FBdEUsRUFEZ0M7VUFBQSxDQUFsQyxDQUFBLENBQUE7QUFBQSxVQU1BLFFBQUEsQ0FBUywwQkFBVCxFQUFxQyxTQUFBLEdBQUE7QUFDbkMsWUFBQSxFQUFBLENBQUcsMENBQUgsRUFBK0MsU0FBQSxHQUFBO0FBQzdDLGNBQUEsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLGdCQUFBLGVBQUEsRUFBaUIsQ0FBakI7QUFBQSxnQkFBb0IsY0FBQSxFQUFnQixNQUFwQztBQUFBLGdCQUE0QyxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFwRDtlQUFkLENBQUEsQ0FBQTtBQUFBLGNBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLGdCQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7ZUFBWixDQURBLENBQUE7QUFBQSxjQUVBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxnQkFBQSxlQUFBLEVBQWlCLENBQWpCO0FBQUEsZ0JBQW9CLGNBQUEsRUFBZ0IsQ0FBQyxNQUFELEVBQVMsTUFBVCxFQUFpQixNQUFqQixFQUF5QixNQUF6QixDQUFwQztBQUFBLGdCQUFzRSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUE5RTtlQUFkLENBRkEsQ0FBQTtBQUFBLGNBR0EsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLGdCQUFBLGVBQUEsRUFBaUIsQ0FBakI7QUFBQSxnQkFBb0IsY0FBQSxFQUFnQixDQUFDLE1BQUQsRUFBUyxNQUFULEVBQWlCLE1BQWpCLENBQXBDO0FBQUEsZ0JBQThELE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQXRFO2VBQWQsQ0FIQSxDQUFBO3FCQUlBLE1BQUEsQ0FBTyxPQUFQLEVBQWdCO0FBQUEsZ0JBQUEsZUFBQSxFQUFpQixDQUFqQjtBQUFBLGdCQUFvQixjQUFBLEVBQWdCLENBQUMsTUFBRCxFQUFTLE1BQVQsQ0FBcEM7QUFBQSxnQkFBc0QsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBOUQ7ZUFBaEIsRUFMNkM7WUFBQSxDQUEvQyxDQUFBLENBQUE7bUJBTUEsRUFBQSxDQUFHLGlEQUFILEVBQXNELFNBQUEsR0FBQTtBQUNwRCxjQUFBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxnQkFBQSxlQUFBLEVBQWlCLENBQWpCO0FBQUEsZ0JBQW9CLGNBQUEsRUFBZ0IsTUFBcEM7QUFBQSxnQkFBNEMsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBcEQ7ZUFBZCxDQUFBLENBQUE7QUFBQSxjQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxnQkFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2VBQVosQ0FEQSxDQUFBO0FBQUEsY0FFQSxNQUFBLENBQU8sS0FBUCxFQUFjO0FBQUEsZ0JBQUEsZUFBQSxFQUFpQixDQUFqQjtBQUFBLGdCQUFvQixjQUFBLEVBQWdCLENBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsTUFBakIsRUFBeUIsTUFBekIsQ0FBcEM7QUFBQSxnQkFBc0UsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBOUU7ZUFBZCxDQUZBLENBQUE7cUJBR0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7QUFBQSxnQkFBQSxlQUFBLEVBQWlCLENBQWpCO2VBQWpCLEVBSm9EO1lBQUEsQ0FBdEQsRUFQbUM7VUFBQSxDQUFyQyxDQU5BLENBQUE7aUJBbUJBLFFBQUEsQ0FBUywwQkFBVCxFQUFxQyxTQUFBLEdBQUE7QUFDbkMsZ0JBQUEsd0JBQUE7QUFBQSxZQUFBLFFBQXNCLEVBQXRCLEVBQUMsb0JBQUQsRUFBWSxpQkFBWixDQUFBO0FBQUEsWUFDQSxVQUFBLENBQVcsU0FBQSxHQUFBO3FCQUNULFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsV0FBdkMsQ0FBbUQsTUFBQSxHQUFTLE9BQU8sQ0FBQyxTQUFSLENBQUEsQ0FBNUQsRUFEUztZQUFBLENBQVgsQ0FEQSxDQUFBO21CQUdBLEVBQUEsQ0FBRywyRUFBSCxFQUFnRixTQUFBLEdBQUE7QUFDOUUsY0FBQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsZ0JBQUEsTUFBQSxDQUFPLGFBQWEsQ0FBQyxTQUFTLENBQUMsUUFBeEIsQ0FBaUMsZ0JBQWpDLENBQVAsQ0FBMEQsQ0FBQyxJQUEzRCxDQUFnRSxLQUFoRSxDQUFBLENBQUE7dUJBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLGtCQUFBLGVBQUEsRUFBaUIsQ0FBakI7QUFBQSxrQkFBb0IsY0FBQSxFQUFnQixNQUFwQztBQUFBLGtCQUE0QyxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFwRDtpQkFBZCxFQUZHO2NBQUEsQ0FBTCxDQUFBLENBQUE7QUFBQSxjQUdBLFFBQUEsQ0FBUyxTQUFBLEdBQUE7dUJBQ1AsTUFBTSxDQUFDLFNBQVAsS0FBb0IsRUFEYjtjQUFBLENBQVQsQ0FIQSxDQUFBO0FBQUEsY0FLQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsZ0JBQUEsTUFBQSxDQUFPLGFBQWEsQ0FBQyxTQUFTLENBQUMsUUFBeEIsQ0FBaUMsZ0JBQWpDLENBQVAsQ0FBMEQsQ0FBQyxJQUEzRCxDQUFnRSxJQUFoRSxDQUFBLENBQUE7dUJBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLGtCQUFBLGVBQUEsRUFBaUIsQ0FBakI7QUFBQSxrQkFBb0IsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBNUI7aUJBQWQsRUFGRztjQUFBLENBQUwsQ0FMQSxDQUFBO0FBQUEsY0FRQSxRQUFBLENBQVMsU0FBQSxHQUFBO3VCQUNQLE1BQU0sQ0FBQyxTQUFQLEtBQW9CLEVBRGI7Y0FBQSxDQUFULENBUkEsQ0FBQTtxQkFVQSxJQUFBLENBQUssU0FBQSxHQUFBO3VCQUNILE1BQUEsQ0FBTyxhQUFhLENBQUMsU0FBUyxDQUFDLFFBQXhCLENBQWlDLGdCQUFqQyxDQUFQLENBQTBELENBQUMsSUFBM0QsQ0FBZ0UsS0FBaEUsRUFERztjQUFBLENBQUwsRUFYOEU7WUFBQSxDQUFoRixFQUptQztVQUFBLENBQXJDLEVBcEJ5QjtRQUFBLENBQTNCLENBQUEsQ0FBQTtBQUFBLFFBc0NBLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBLEdBQUE7QUFDekIsVUFBQSxRQUFBLENBQVMsdUJBQVQsRUFBa0MsU0FBQSxHQUFBO21CQUNoQyxFQUFBLENBQUcsbUVBQUgsRUFBd0UsU0FBQSxHQUFBO0FBQ3RFLGNBQUEsTUFBQSxDQUFPLE9BQVAsRUFBZ0I7QUFBQSxnQkFBQSxJQUFBLEVBQU0sQ0FBQyxRQUFELEVBQVcsZUFBWCxDQUFOO0FBQUEsZ0JBQW1DLFlBQUEsRUFBYyxJQUFqRDtlQUFoQixDQUFBLENBQUE7cUJBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLGdCQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsZ0JBQWdCLGNBQUEsRUFBZ0IsQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLElBQWIsQ0FBaEM7ZUFBZCxFQUZzRTtZQUFBLENBQXhFLEVBRGdDO1VBQUEsQ0FBbEMsQ0FBQSxDQUFBO2lCQUlBLFFBQUEsQ0FBUyx1QkFBVCxFQUFrQyxTQUFBLEdBQUE7QUFDaEMsZ0JBQUEsWUFBQTtBQUFBLFlBQUMsZUFBZ0IsS0FBakIsQ0FBQTtBQUFBLFlBQ0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULGNBQUEsWUFBQSxHQUFlLGdIQUFmLENBQUE7cUJBSUEsR0FBQSxDQUNFO0FBQUEsZ0JBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtBQUFBLGdCQUNBLElBQUEsRUFBTSxZQUROO2VBREYsRUFMUztZQUFBLENBQVgsQ0FEQSxDQUFBO21CQVNBLEVBQUEsQ0FBRyxtRUFBSCxFQUF3RSxTQUFBLEdBQUE7QUFFdEUsY0FBQSxNQUFBLENBQU8sT0FBUCxFQUFnQjtBQUFBLGdCQUFBLElBQUEsRUFBTSxDQUFDLFFBQUQsRUFBVyxVQUFYLENBQU47QUFBQSxnQkFBOEIsWUFBQSxFQUFjLFlBQTVDO2VBQWhCLENBQUEsQ0FBQTtBQUFBLGNBQ0EsTUFBQSxDQUFPLEtBQVAsRUFDRTtBQUFBLGdCQUFBLElBQUEsRUFBTSxDQUFDLFFBQUQsRUFBVyxVQUFYLENBQU47QUFBQSxnQkFDQSxZQUFBLEVBQWMsWUFEZDtBQUFBLGdCQUVBLGNBQUEsRUFBZ0IsQ0FBQyxNQUFELEVBQVMsTUFBVCxFQUFpQixNQUFqQixFQUF5QixNQUF6QixFQUFpQyxNQUFqQyxFQUF5QyxNQUF6QyxDQUZoQjtlQURGLENBREEsQ0FBQTtxQkFLQSxNQUFBLENBQU87Z0JBQUMsR0FBRCxFQUFNO0FBQUEsa0JBQUEsS0FBQSxFQUFPLEdBQVA7aUJBQU47ZUFBUCxFQUNFO0FBQUEsZ0JBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxnQkFDQSxJQUFBLEVBQU0sZ0hBRE47ZUFERixFQVBzRTtZQUFBLENBQXhFLEVBVmdDO1VBQUEsQ0FBbEMsRUFMeUI7UUFBQSxDQUEzQixDQXRDQSxDQUFBO2VBbUVBLFFBQUEsQ0FBUyx1QkFBVCxFQUFrQyxTQUFBLEdBQUE7QUFDaEMsY0FBQSx3Q0FBQTtBQUFBLFVBQUEsUUFBc0MsRUFBdEMsRUFBQyx1QkFBRCxFQUFlLDhCQUFmLENBQUE7QUFBQSxVQUNBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxZQUFBLFlBQUEsR0FBZSxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQXBDLENBQUE7QUFBQSxZQUNBLG1CQUFBLEdBQXNCLFlBQVksQ0FBQyxPQURuQyxDQUFBO0FBQUEsWUFFQSxPQUFPLENBQUMsV0FBUixDQUFvQixPQUFBLENBQVEsSUFBSSxDQUFDLFNBQWIsQ0FBcEIsQ0FGQSxDQUFBO21CQUdBLFFBQVEsQ0FBQyxHQUFULENBQWEsbUJBQWIsRUFBa0MsSUFBbEMsRUFKUztVQUFBLENBQVgsQ0FEQSxDQUFBO2lCQU9BLFFBQUEsQ0FBUyxvQ0FBVCxFQUErQyxTQUFBLEdBQUE7bUJBQzdDLEVBQUEsQ0FBRyw2REFBSCxFQUFrRSxTQUFBLEdBQUE7QUFDaEUsY0FBQSxTQUFBLENBQVUsR0FBVixDQUFBLENBQUE7QUFBQSxjQUNBLFlBQVksQ0FBQyxVQUFiLENBQXdCLFVBQXhCLENBREEsQ0FBQTtxQkFFQSxnQkFBQSxDQUFpQixtQkFBakIsRUFBc0MsaUJBQXRDLEVBQTBELFNBQUEsR0FBQTtBQUN4RCxnQkFBQSxZQUFBLENBQWEsT0FBYixFQUFzQixRQUFRLENBQUMsYUFBL0IsQ0FBQSxDQUFBO3VCQUNBLE1BQUEsQ0FDRTtBQUFBLGtCQUFBLGNBQUEsRUFBZ0IsQ0FBQyxNQUFELEVBQVMsTUFBVCxFQUFpQixLQUFqQixFQUF3QixNQUF4QixDQUFoQjtpQkFERixFQUZ3RDtjQUFBLENBQTFELEVBSGdFO1lBQUEsQ0FBbEUsRUFENkM7VUFBQSxDQUEvQyxFQVJnQztRQUFBLENBQWxDLEVBcEU0QztNQUFBLENBQTlDLENBUkEsQ0FBQTtBQUFBLE1BNkZBLFFBQUEsQ0FBUyx5QkFBVCxFQUFvQyxTQUFBLEdBQUE7QUFDbEMsUUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxHQUFBLENBQUk7QUFBQSxZQUFBLElBQUEsRUFBTSx1REFBTjtXQUFKLENBQUEsQ0FBQTtBQUFBLFVBSUEsQ0FBQTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFBLENBSkEsQ0FBQTtpQkFLQSxPQUFPLENBQUMsV0FBUixDQUFvQixPQUFBLENBQVEsSUFBSSxDQUFDLFNBQWIsQ0FBcEIsRUFOUztRQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsUUFRQSxRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBLEdBQUE7QUFDdEIsVUFBQSxFQUFBLENBQUcsd0VBQUgsRUFBNkUsU0FBQSxHQUFBO21CQUMzRSxNQUFBLENBQU8sU0FBUCxFQUNFO0FBQUEsY0FBQSxJQUFBLEVBQU0sOENBQU47YUFERixFQUQyRTtVQUFBLENBQTdFLENBQUEsQ0FBQTtBQUFBLFVBTUEsRUFBQSxDQUFHLHdFQUFILEVBQTZFLFNBQUEsR0FBQTtBQUMzRSxZQUFBLEdBQUEsQ0FBSTtBQUFBLGNBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKLENBQUEsQ0FBQTttQkFDQSxNQUFBLENBQU8sYUFBUCxFQUNFO0FBQUEsY0FBQSxJQUFBLEVBQU0sdURBQU47YUFERixFQUYyRTtVQUFBLENBQTdFLENBTkEsQ0FBQTtBQUFBLFVBYUEsRUFBQSxDQUFHLCtDQUFILEVBQW9ELFNBQUEsR0FBQTtBQUNsRCxZQUFBLEdBQUEsQ0FBSTtBQUFBLGNBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKLENBQUEsQ0FBQTtBQUFBLFlBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLGNBQUEsZUFBQSxFQUFpQixDQUFqQjthQUFkLENBREEsQ0FBQTtBQUFBLFlBRUEsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLGNBQUEsZUFBQSxFQUFpQixDQUFqQjthQUFkLENBRkEsQ0FBQTttQkFHQSxNQUFBLENBQU8sT0FBUCxFQUNFO0FBQUEsY0FBQSxJQUFBLEVBQU0sdURBQU47YUFERixFQUprRDtVQUFBLENBQXBELENBYkEsQ0FBQTtBQUFBLFVBc0JBLEVBQUEsQ0FBRyx3RUFBSCxFQUE2RSxTQUFBLEdBQUE7QUFDM0UsWUFBQSxHQUFBLENBQUk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVI7YUFBSixDQUFBLENBQUE7bUJBQ0EsTUFBQSxDQUFPLFdBQVAsRUFDRTtBQUFBLGNBQUEsSUFBQSxFQUFNLHVEQUFOO2FBREYsRUFGMkU7VUFBQSxDQUE3RSxDQXRCQSxDQUFBO0FBQUEsVUE2QkEsRUFBQSxDQUFHLHdFQUFILEVBQTZFLFNBQUEsR0FBQTtBQUMzRSxZQUFBLE1BQUEsQ0FBTyxTQUFQLEVBQ0U7QUFBQSxjQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsY0FDQSxJQUFBLEVBQU0sOENBRE47YUFERixDQUFBLENBQUE7QUFBQSxZQU1BLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEtBQWxCLENBTkEsQ0FBQTttQkFPQSxNQUFBLENBQU8sU0FBUCxFQUNFO0FBQUEsY0FBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLGNBQ0EsSUFBQSxFQUFNLHVEQUROO0FBQUEsY0FLQSxVQUFBLEVBQVksQ0FMWjthQURGLEVBUjJFO1VBQUEsQ0FBN0UsQ0E3QkEsQ0FBQTtpQkE0Q0EsUUFBQSxDQUFTLDBDQUFULEVBQXFELFNBQUEsR0FBQTtBQUNuRCxZQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7cUJBQ1QsR0FBQSxDQUNFO0FBQUEsZ0JBQUEsSUFBQSxFQUFNLG9IQUFOO2VBREYsRUFEUztZQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsWUFTQSxFQUFBLENBQUcsaUZBQUgsRUFBc0YsU0FBQSxHQUFBO0FBQ3BGLGNBQUEsR0FBQSxDQUFJO0FBQUEsZ0JBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtlQUFKLENBQUEsQ0FBQTtBQUFBLGNBQ0EsSUFBQSxDQUFLLFNBQUEsR0FBQTt1QkFDSCxNQUFBLENBQU8sS0FBUCxFQUFjO0FBQUEsa0JBQUEsY0FBQSxFQUFnQixDQUFDLEtBQUQsRUFBUSxLQUFSLEVBQWUsS0FBZixFQUFzQixLQUF0QixDQUFoQjtpQkFBZCxFQURHO2NBQUEsQ0FBTCxDQURBLENBQUE7QUFBQSxjQUdBLFFBQUEsQ0FBUyxTQUFBLEdBQUE7dUJBQ1AsYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUF4QixDQUFpQyxnQkFBakMsRUFETztjQUFBLENBQVQsQ0FIQSxDQUFBO3FCQUtBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxnQkFBQSxNQUFBLENBQU8sS0FBUCxFQUNFO0FBQUEsa0JBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxrQkFDQSxVQUFBLEVBQVksQ0FEWjtpQkFERixDQUFBLENBQUE7QUFBQSxnQkFHQSxNQUFNLENBQUMsVUFBUCxDQUFrQixPQUFsQixDQUhBLENBQUE7dUJBSUEsTUFBQSxDQUFPLFFBQVAsRUFDRTtBQUFBLGtCQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsa0JBQ0EsSUFBQSxFQUFNLDhIQUROO2lCQURGLEVBTEc7Y0FBQSxDQUFMLEVBTm9GO1lBQUEsQ0FBdEYsQ0FUQSxDQUFBO21CQTRCQSxFQUFBLENBQUcsb0ZBQUgsRUFBeUYsU0FBQSxHQUFBO0FBQ3ZGLGNBQUEsR0FBQSxDQUFJO0FBQUEsZ0JBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtlQUFKLENBQUEsQ0FBQTtBQUFBLGNBQ0EsSUFBQSxDQUFLLFNBQUEsR0FBQTt1QkFDSCxNQUFBLENBQU8sS0FBUCxFQUFjO0FBQUEsa0JBQUEsY0FBQSxFQUFnQixDQUFDLEtBQUQsRUFBUSxLQUFSLEVBQWUsS0FBZixFQUFzQixLQUF0QixDQUFoQjtpQkFBZCxFQURHO2NBQUEsQ0FBTCxDQURBLENBQUE7QUFBQSxjQUdBLFFBQUEsQ0FBUyxTQUFBLEdBQUE7dUJBQ1AsYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUF4QixDQUFpQyxnQkFBakMsRUFETztjQUFBLENBQVQsQ0FIQSxDQUFBO3FCQUtBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxnQkFBQSxNQUFBLENBQU8sS0FBUCxFQUNFO0FBQUEsa0JBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxrQkFDQSxVQUFBLEVBQVksQ0FEWjtpQkFERixDQUFBLENBQUE7QUFBQSxnQkFHQSxNQUFNLENBQUMsVUFBUCxDQUFrQixZQUFsQixDQUhBLENBQUE7dUJBSUEsTUFBQSxDQUFPLFFBQVAsRUFDRTtBQUFBLGtCQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsa0JBQ0EsSUFBQSxFQUFNLHdJQUROO2lCQURGLEVBTEc7Y0FBQSxDQUFMLEVBTnVGO1lBQUEsQ0FBekYsRUE3Qm1EO1VBQUEsQ0FBckQsRUE3Q3NCO1FBQUEsQ0FBeEIsQ0FSQSxDQUFBO0FBQUEsUUFzR0EsUUFBQSxDQUFTLGFBQVQsRUFBd0IsU0FBQSxHQUFBO2lCQUN0QixFQUFBLENBQUcsb0VBQUgsRUFBeUUsU0FBQSxHQUFBO0FBQ3ZFLFlBQUEsR0FBQSxDQUNFO0FBQUEsY0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO0FBQUEsY0FDQSxJQUFBLEVBQU0sdURBRE47YUFERixDQUFBLENBQUE7QUFBQSxZQU1BLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxjQUFBLGVBQUEsRUFBaUIsQ0FBakI7YUFBZCxDQU5BLENBQUE7bUJBT0EsTUFBQSxDQUFPLE9BQVAsRUFDRTtBQUFBLGNBQUEsSUFBQSxFQUFNLHVEQUFOO2FBREYsRUFSdUU7VUFBQSxDQUF6RSxFQURzQjtRQUFBLENBQXhCLENBdEdBLENBQUE7QUFBQSxRQXFIQSxRQUFBLENBQVMsc0JBQVQsRUFBaUMsU0FBQSxHQUFBO2lCQUMvQixFQUFBLENBQUcsb0VBQUgsRUFBeUUsU0FBQSxHQUFBO0FBQ3ZFLFlBQUEsR0FBQSxDQUNFO0FBQUEsY0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO0FBQUEsY0FDQSxJQUFBLEVBQU0sdURBRE47YUFERixDQUFBLENBQUE7QUFBQSxZQU1BLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxjQUFBLGVBQUEsRUFBaUIsQ0FBakI7YUFBZCxDQU5BLENBQUE7bUJBT0EsTUFBQSxDQUFPLEtBQVAsRUFDRTtBQUFBLGNBQUEsSUFBQSxFQUFNLHVEQUFOO2FBREYsRUFSdUU7VUFBQSxDQUF6RSxFQUQrQjtRQUFBLENBQWpDLENBckhBLENBQUE7ZUFvSUEsUUFBQSxDQUFTLHVCQUFULEVBQWtDLFNBQUEsR0FBQTtpQkFDaEMsRUFBQSxDQUFHLG9FQUFILEVBQXlFLFNBQUEsR0FBQTtBQUN2RSxZQUFBLEdBQUEsQ0FDRTtBQUFBLGNBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtBQUFBLGNBQ0EsSUFBQSxFQUFNLHVEQUROO2FBREYsQ0FBQSxDQUFBO0FBQUEsWUFNQSxNQUFBLENBQU8sS0FBUCxFQUFjO0FBQUEsY0FBQSxlQUFBLEVBQWlCLENBQWpCO2FBQWQsQ0FOQSxDQUFBO21CQU9BLE1BQUEsQ0FBTyxnQkFBUCxFQUNFO0FBQUEsY0FBQSxJQUFBLEVBQU0sdURBQU47YUFERixFQVJ1RTtVQUFBLENBQXpFLEVBRGdDO1FBQUEsQ0FBbEMsRUFySWtDO01BQUEsQ0FBcEMsQ0E3RkEsQ0FBQTthQWlQQSxRQUFBLENBQVMsK0NBQVQsRUFBMEQsU0FBQSxHQUFBO0FBQ3hELFFBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtpQkFDVCxHQUFBLENBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSx1REFBTjtBQUFBLFlBSUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FKUjtXQURGLEVBTUUsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsT0FBQSxDQUFRLElBQUksQ0FBQyxTQUFiLENBQXBCLENBTkYsRUFEUztRQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsUUFTQSxRQUFBLENBQVMsb0RBQVQsRUFBK0QsU0FBQSxHQUFBO2lCQUM3RCxFQUFBLENBQUcsbUVBQUgsRUFBd0UsU0FBQSxHQUFBO0FBQ3RFLFlBQUEsTUFBQSxDQUFPLEtBQVAsRUFDRTtBQUFBLGNBQUEsY0FBQSxFQUFnQixDQUFDLEtBQUQsRUFBUSxLQUFSLEVBQWUsS0FBZixFQUFzQixLQUF0QixFQUE2QixLQUE3QixFQUFvQyxLQUFwQyxDQUFoQjthQURGLENBQUEsQ0FBQTtBQUFBLFlBRUEsTUFBQSxDQUFPLFNBQVAsRUFDRTtBQUFBLGNBQUEsY0FBQSxFQUFnQixDQUFDLEtBQUQsRUFBUSxLQUFSLEVBQWUsS0FBZixFQUFzQixLQUF0QixDQUFoQjtBQUFBLGNBQ0EsSUFBQSxFQUFNLGtCQUROO2FBREYsQ0FGQSxDQUFBO21CQUtBLE1BQUEsQ0FBTyxHQUFQLEVBQ0U7QUFBQSxjQUFBLElBQUEsRUFBTSwyQ0FBTjtBQUFBLGNBSUEsSUFBQSxFQUFNLFFBSk47YUFERixFQU5zRTtVQUFBLENBQXhFLEVBRDZEO1FBQUEsQ0FBL0QsQ0FUQSxDQUFBO2VBdUJBLFFBQUEsQ0FBUyxxRUFBVCxFQUFnRixTQUFBLEdBQUE7aUJBQzlFLEVBQUEsQ0FBRyw4REFBSCxFQUFtRSxTQUFBLEdBQUE7QUFDakUsWUFBQSxNQUFBLENBQU8sS0FBUCxFQUNFO0FBQUEsY0FBQSxjQUFBLEVBQWdCLENBQUMsS0FBRCxFQUFRLEtBQVIsRUFBZSxLQUFmLEVBQXNCLEtBQXRCLEVBQTZCLEtBQTdCLEVBQW9DLEtBQXBDLENBQWhCO2FBREYsQ0FBQSxDQUFBO0FBQUEsWUFFQSxNQUFBLENBQU8sYUFBUCxFQUNFO0FBQUEsY0FBQSxjQUFBLEVBQWdCLENBQUMsS0FBRCxFQUFRLEtBQVIsRUFBZSxLQUFmLEVBQXNCLEtBQXRCLEVBQTZCLEtBQTdCLEVBQW9DLEtBQXBDLENBQWhCO0FBQUEsY0FDQSxJQUFBLEVBQU0sa0JBRE47YUFERixDQUZBLENBQUE7bUJBS0EsTUFBQSxDQUFPLEdBQVAsRUFDRTtBQUFBLGNBQUEsWUFBQSxFQUFjLENBQUMsS0FBRCxFQUFRLEtBQVIsRUFBZSxLQUFmLEVBQXNCLEtBQXRCLEVBQTZCLEtBQTdCLEVBQW9DLEtBQXBDLENBQWQ7YUFERixFQU5pRTtVQUFBLENBQW5FLEVBRDhFO1FBQUEsQ0FBaEYsRUF4QndEO01BQUEsQ0FBMUQsRUFsUG1DO0lBQUEsQ0FBckMsRUFyZXFCO0VBQUEsQ0FBdkIsQ0FIQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/spec/occurrence-spec.coffee
