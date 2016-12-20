(function() {
  var getVimState, settings,
    __slice = [].slice;

  getVimState = require('./spec-helper').getVimState;

  settings = require('../lib/settings');

  describe("Prefixes", function() {
    var editor, editorElement, ensure, keystroke, set, vimState, _ref;
    _ref = [], set = _ref[0], ensure = _ref[1], keystroke = _ref[2], editor = _ref[3], editorElement = _ref[4], vimState = _ref[5];
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
    describe("Repeat", function() {
      describe("with operations", function() {
        beforeEach(function() {
          return set({
            text: "123456789abc",
            cursor: [0, 0]
          });
        });
        it("repeats N times", function() {
          return ensure('3 x', {
            text: '456789abc'
          });
        });
        return it("repeats NN times", function() {
          return ensure('1 0 x', {
            text: 'bc'
          });
        });
      });
      describe("with motions", function() {
        beforeEach(function() {
          return set({
            text: 'one two three',
            cursor: [0, 0]
          });
        });
        return it("repeats N times", function() {
          return ensure('d 2 w', {
            text: 'three'
          });
        });
      });
      return describe("in visual mode", function() {
        beforeEach(function() {
          return set({
            text: 'one two three',
            cursor: [0, 0]
          });
        });
        return it("repeats movements in visual mode", function() {
          return ensure('v 2 w', {
            cursor: [0, 9]
          });
        });
      });
    });
    describe("Register", function() {
      describe("the a register", function() {
        it("saves a value for future reading", function() {
          set({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
          return ensure({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
        });
        return it("overwrites a value previously in the register", function() {
          set({
            register: {
              a: {
                text: 'content'
              }
            }
          });
          set({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
          return ensure({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
        });
      });
      describe("the B register", function() {
        it("saves a value for future reading", function() {
          set({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
          ensure({
            register: {
              b: {
                text: 'new content'
              }
            }
          });
          return ensure({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
        });
        it("appends to a value previously in the register", function() {
          set({
            register: {
              b: {
                text: 'content'
              }
            }
          });
          set({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
          return ensure({
            register: {
              b: {
                text: 'contentnew content'
              }
            }
          });
        });
        it("appends linewise to a linewise value previously in the register", function() {
          set({
            register: {
              b: {
                text: 'content\n',
                type: 'linewise'
              }
            }
          });
          set({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
          return ensure({
            register: {
              b: {
                text: 'content\nnew content\n'
              }
            }
          });
        });
        return it("appends linewise to a character value previously in the register", function() {
          set({
            register: {
              b: {
                text: 'content'
              }
            }
          });
          set({
            register: {
              B: {
                text: 'new content\n',
                type: 'linewise'
              }
            }
          });
          return ensure({
            register: {
              b: {
                text: 'content\nnew content\n'
              }
            }
          });
        });
      });
      describe("the * register", function() {
        describe("reading", function() {
          return it("is the same the system clipboard", function() {
            return ensure({
              register: {
                '*': {
                  text: 'initial clipboard content',
                  type: 'character'
                }
              }
            });
          });
        });
        return describe("writing", function() {
          beforeEach(function() {
            return set({
              register: {
                '*': {
                  text: 'new content'
                }
              }
            });
          });
          return it("overwrites the contents of the system clipboard", function() {
            return expect(atom.clipboard.read()).toEqual('new content');
          });
        });
      });
      describe("the + register", function() {
        describe("reading", function() {
          return it("is the same the system clipboard", function() {
            return ensure({
              register: {
                '*': {
                  text: 'initial clipboard content',
                  type: 'character'
                }
              }
            });
          });
        });
        return describe("writing", function() {
          beforeEach(function() {
            return set({
              register: {
                '*': {
                  text: 'new content'
                }
              }
            });
          });
          return it("overwrites the contents of the system clipboard", function() {
            return expect(atom.clipboard.read()).toEqual('new content');
          });
        });
      });
      describe("the _ register", function() {
        describe("reading", function() {
          return it("is always the empty string", function() {
            return ensure({
              register: {
                '_': {
                  text: ''
                }
              }
            });
          });
        });
        return describe("writing", function() {
          return it("throws away anything written to it", function() {
            set({
              register: {
                '_': {
                  text: 'new content'
                }
              }
            });
            return ensure({
              register: {
                '_': {
                  text: ''
                }
              }
            });
          });
        });
      });
      describe("the % register", function() {
        beforeEach(function() {
          return spyOn(editor, 'getURI').andReturn('/Users/atom/known_value.txt');
        });
        describe("reading", function() {
          return it("returns the filename of the current editor", function() {
            return ensure({
              register: {
                '%': {
                  text: '/Users/atom/known_value.txt'
                }
              }
            });
          });
        });
        return describe("writing", function() {
          return it("throws away anything written to it", function() {
            set({
              register: {
                '%': {
                  text: 'new content'
                }
              }
            });
            return ensure({
              register: {
                '%': {
                  text: '/Users/atom/known_value.txt'
                }
              }
            });
          });
        });
      });
      describe("the ctrl-r command in insert mode", function() {
        beforeEach(function() {
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
                text: 'abc'
              }
            }
          });
          atom.clipboard.write("clip");
          set({
            text: "012\n",
            cursor: [0, 2]
          });
          return ensure('i', {
            mode: 'insert'
          });
        });
        it("inserts contents of the unnamed register with \"", function() {
          return ensure([
            'ctrl-r', {
              input: '"'
            }
          ], {
            text: '013452\n'
          });
        });
        describe("when useClipboardAsDefaultRegister enabled", function() {
          return it("inserts contents from clipboard with \"", function() {
            settings.set('useClipboardAsDefaultRegister', true);
            return ensure([
              'ctrl-r', {
                input: '"'
              }
            ], {
              text: '01clip2\n'
            });
          });
        });
        it("inserts contents of the 'a' register", function() {
          return ensure([
            'ctrl-r', {
              input: 'a'
            }
          ], {
            text: '01abc2\n'
          });
        });
        return it("is cancelled with the escape key", function() {
          keystroke('ctrl-r');
          atom.commands.dispatch(vimState.input.editorElement, 'core:cancel');
          return ensure({
            text: '012\n',
            mode: 'insert',
            cursor: [0, 2]
          });
        });
      });
      return describe("per selection clipboard", function() {
        var ensurePerSelectionRegister;
        ensurePerSelectionRegister = function() {
          var i, selection, texts, _i, _len, _ref1, _results;
          texts = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          _ref1 = editor.getSelections();
          _results = [];
          for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
            selection = _ref1[i];
            _results.push(ensure({
              register: {
                '*': {
                  text: texts[i],
                  selection: selection
                }
              }
            }));
          }
          return _results;
        };
        beforeEach(function() {
          settings.set('useClipboardAsDefaultRegister', true);
          return set({
            text: "012:\nabc:\ndef:\n",
            cursor: [[0, 1], [1, 1], [2, 1]]
          });
        });
        describe("on selection destroye", function() {
          return it("remove corresponding subscriptin and clipboard entry", function() {
            var clipboardBySelection, selection, subscriptionBySelection, _i, _len, _ref1, _ref2;
            _ref1 = vimState.register, clipboardBySelection = _ref1.clipboardBySelection, subscriptionBySelection = _ref1.subscriptionBySelection;
            expect(clipboardBySelection.size).toBe(0);
            expect(subscriptionBySelection.size).toBe(0);
            keystroke("y i w");
            ensurePerSelectionRegister('012', 'abc', 'def');
            expect(clipboardBySelection.size).toBe(3);
            expect(subscriptionBySelection.size).toBe(3);
            _ref2 = editor.getSelections();
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              selection = _ref2[_i];
              selection.destroy();
            }
            expect(clipboardBySelection.size).toBe(0);
            return expect(subscriptionBySelection.size).toBe(0);
          });
        });
        describe("Yank", function() {
          return it("save text to per selection register", function() {
            keystroke("y i w");
            return ensurePerSelectionRegister('012', 'abc', 'def');
          });
        });
        describe("Delete family", function() {
          it("d", function() {
            ensure("d i w", {
              text: ":\n:\n:\n"
            });
            return ensurePerSelectionRegister('012', 'abc', 'def');
          });
          it("x", function() {
            ensure("x", {
              text: "02:\nac:\ndf:\n"
            });
            return ensurePerSelectionRegister('1', 'b', 'e');
          });
          it("X", function() {
            ensure("X", {
              text: "12:\nbc:\nef:\n"
            });
            return ensurePerSelectionRegister('0', 'a', 'd');
          });
          return it("D", function() {
            ensure("D", {
              text: "0\na\nd\n"
            });
            return ensurePerSelectionRegister('12:', 'bc:', 'ef:');
          });
        });
        describe("Put family", function() {
          it("p paste text from per selection register", function() {
            return ensure("y i w $ p", {
              text: "012:012\nabc:abc\ndef:def\n"
            });
          });
          return it("P paste text from per selection register", function() {
            return ensure("y i w $ P", {
              text: "012012:\nabcabc:\ndefdef:\n"
            });
          });
        });
        return describe("ctrl-r in insert mode", function() {
          return it("insert from per selection registe", function() {
            ensure("d i w", {
              text: ":\n:\n:\n"
            });
            ensure('a', {
              mode: 'insert'
            });
            return ensure([
              'ctrl-r', {
                input: '"'
              }
            ], {
              text: ":012\n:abc\n:def\n"
            });
          });
        });
      });
    });
    return describe("Count modifier", function() {
      beforeEach(function() {
        return set({
          text: "000 111 222 333 444 555 666 777 888 999",
          cursor: [0, 0]
        });
      });
      it("repeat operator", function() {
        return ensure('3 d w', {
          text: "333 444 555 666 777 888 999"
        });
      });
      it("repeat motion", function() {
        return ensure('d 2 w', {
          text: "222 333 444 555 666 777 888 999"
        });
      });
      return it("repeat operator and motion respectively", function() {
        return ensure('3 d 2 w', {
          text: "666 777 888 999"
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvcHJlZml4LXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFCQUFBO0lBQUEsa0JBQUE7O0FBQUEsRUFBQyxjQUFlLE9BQUEsQ0FBUSxlQUFSLEVBQWYsV0FBRCxDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUixDQURYLENBQUE7O0FBQUEsRUFHQSxRQUFBLENBQVMsVUFBVCxFQUFxQixTQUFBLEdBQUE7QUFDbkIsUUFBQSw2REFBQTtBQUFBLElBQUEsT0FBNEQsRUFBNUQsRUFBQyxhQUFELEVBQU0sZ0JBQU4sRUFBYyxtQkFBZCxFQUF5QixnQkFBekIsRUFBaUMsdUJBQWpDLEVBQWdELGtCQUFoRCxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLEdBQVIsR0FBQTtBQUNWLFFBQUEsUUFBQSxHQUFXLEtBQVgsQ0FBQTtBQUFBLFFBQ0Msa0JBQUEsTUFBRCxFQUFTLHlCQUFBLGFBRFQsQ0FBQTtlQUVDLFVBQUEsR0FBRCxFQUFNLGFBQUEsTUFBTixFQUFjLGdCQUFBLFNBQWQsRUFBMkIsSUFIakI7TUFBQSxDQUFaLEVBRFM7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBUUEsU0FBQSxDQUFVLFNBQUEsR0FBQTthQUNSLFFBQVEsQ0FBQyxlQUFULENBQUEsRUFEUTtJQUFBLENBQVYsQ0FSQSxDQUFBO0FBQUEsSUFXQSxRQUFBLENBQVMsUUFBVCxFQUFtQixTQUFBLEdBQUE7QUFDakIsTUFBQSxRQUFBLENBQVMsaUJBQVQsRUFBNEIsU0FBQSxHQUFBO0FBQzFCLFFBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtpQkFDVCxHQUFBLENBQUk7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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/spec/prefix-spec.coffee
