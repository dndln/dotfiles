(function() {
  var TextData, getVimState, swrap, _ref,
    __slice = [].slice;

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, TextData = _ref.TextData;

  swrap = require('../lib/selection-wrapper');

  describe("Visual Blockwise", function() {
    var blockTexts, editor, editorElement, ensure, ensureBlockwiseSelection, keystroke, selectBlockwise, selectBlockwiseReversely, set, textAfterDeleted, textAfterInserted, textData, textInitial, vimState, _ref1;
    _ref1 = [], set = _ref1[0], ensure = _ref1[1], keystroke = _ref1[2], editor = _ref1[3], editorElement = _ref1[4], vimState = _ref1[5];
    textInitial = "01234567890123456789\n1-------------------\n2----A---------B----\n3----***********----\n4----+++++++++++----\n5----C---------D----\n6-------------------";
    textAfterDeleted = "01234567890123456789\n1-------------------\n2----\n3----\n4----\n5----\n6-------------------";
    textAfterInserted = "01234567890123456789\n1-------------------\n2----!!!\n3----!!!\n4----!!!\n5----!!!\n6-------------------";
    blockTexts = ['56789012345', '-----------', 'A---------B', '***********', '+++++++++++', 'C---------D', '-----------'];
    textData = new TextData(textInitial);
    selectBlockwise = function() {
      set({
        cursor: [2, 5]
      });
      return ensure('v 3 j 1 0 l ctrl-v', {
        mode: ['visual', 'blockwise'],
        selectedBufferRange: [[[2, 5], [2, 16]], [[3, 5], [3, 16]], [[4, 5], [4, 16]], [[5, 5], [5, 16]]],
        selectedText: blockTexts.slice(2, 6)
      });
    };
    selectBlockwiseReversely = function() {
      set({
        cursor: [2, 15]
      });
      return ensure('v 3 j 1 0 h ctrl-v', {
        mode: ['visual', 'blockwise'],
        selectedBufferRange: [[[2, 5], [2, 16]], [[3, 5], [3, 16]], [[4, 5], [4, 16]], [[5, 5], [5, 16]]],
        selectedText: blockTexts.slice(2, 6)
      });
    };
    ensureBlockwiseSelection = function(o) {
      var bs, first, head, last, others, s, selections, tail, _i, _j, _k, _len, _len1, _results;
      selections = editor.getSelectionsOrderedByBufferPosition();
      if (selections.length === 1) {
        first = last = selections[0];
      } else {
        first = selections[0], others = 3 <= selections.length ? __slice.call(selections, 1, _i = selections.length - 1) : (_i = 1, []), last = selections[_i++];
      }
      head = (function() {
        switch (o.head) {
          case 'top':
            return first;
          case 'bottom':
            return last;
        }
      })();
      bs = vimState.getLastBlockwiseSelection();
      expect(bs.getHeadSelection()).toBe(head);
      tail = (function() {
        switch (o.tail) {
          case 'top':
            return first;
          case 'bottom':
            return last;
        }
      })();
      expect(bs.getTailSelection()).toBe(tail);
      for (_j = 0, _len = others.length; _j < _len; _j++) {
        s = others[_j];
        expect(bs.getHeadSelection()).not.toBe(s);
        expect(bs.getTailSelection()).not.toBe(s);
      }
      if (o.reversed != null) {
        _results = [];
        for (_k = 0, _len1 = selections.length; _k < _len1; _k++) {
          s = selections[_k];
          _results.push(expect(s.isReversed()).toBe(o.reversed));
        }
        return _results;
      }
    };
    beforeEach(function() {
      getVimState(function(state, vimEditor) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vimEditor.set, ensure = vimEditor.ensure, keystroke = vimEditor.keystroke, vimEditor;
      });
      return runs(function() {
        return set({
          text: textInitial
        });
      });
    });
    afterEach(function() {
      return vimState.resetNormalMode();
    });
    describe("j", function() {
      beforeEach(function() {
        set({
          cursor: [3, 5]
        });
        return ensure('v 1 0 l ctrl-v', {
          selectedText: blockTexts[3],
          mode: ['visual', 'blockwise']
        });
      });
      it("add selection to down direction", function() {
        ensure('j', {
          selectedText: blockTexts.slice(3, 5)
        });
        return ensure('j', {
          selectedText: blockTexts.slice(3, 6)
        });
      });
      it("delete selection when blocwise is reversed", function() {
        ensure('3 k', {
          selectedTextOrdered: blockTexts.slice(0, 4)
        });
        ensure('j', {
          selectedTextOrdered: blockTexts.slice(1, 4)
        });
        return ensure('2 j', {
          selectedTextOrdered: blockTexts[3]
        });
      });
      return it("keep tail row when reversed status changed", function() {
        ensure('j', {
          selectedText: blockTexts.slice(3, 5)
        });
        return ensure('2 k', {
          selectedTextOrdered: blockTexts.slice(2, 4)
        });
      });
    });
    describe("k", function() {
      beforeEach(function() {
        set({
          cursor: [3, 5]
        });
        return ensure('v 1 0 l ctrl-v', {
          selectedText: blockTexts[3],
          mode: ['visual', 'blockwise']
        });
      });
      it("add selection to up direction", function() {
        ensure('k', {
          selectedTextOrdered: blockTexts.slice(2, 4)
        });
        return ensure('k', {
          selectedTextOrdered: blockTexts.slice(1, 4)
        });
      });
      return it("delete selection when blocwise is reversed", function() {
        ensure('3 j', {
          selectedTextOrdered: blockTexts.slice(3, 7)
        });
        ensure('k', {
          selectedTextOrdered: blockTexts.slice(3, 6)
        });
        return ensure('2 k', {
          selectedTextOrdered: blockTexts[3]
        });
      });
    });
    describe("C", function() {
      var ensureChange;
      ensureChange = function() {
        ensure('C', {
          mode: 'insert',
          cursor: [[2, 5], [3, 5], [4, 5], [5, 5]],
          text: textAfterDeleted
        });
        editor.insertText("!!!");
        return ensure({
          mode: 'insert',
          cursor: [[2, 8], [3, 8], [4, 8], [5, 8]],
          text: textAfterInserted
        });
      };
      it("change-to-last-character-of-line for each selection", function() {
        selectBlockwise();
        return ensureChange();
      });
      return it("[selection reversed] change-to-last-character-of-line for each selection", function() {
        selectBlockwiseReversely();
        return ensureChange();
      });
    });
    describe("D", function() {
      var ensureDelete;
      ensureDelete = function() {
        return ensure('D', {
          text: textAfterDeleted,
          cursor: [2, 4],
          mode: 'normal'
        });
      };
      it("delete-to-last-character-of-line for each selection", function() {
        selectBlockwise();
        return ensureDelete();
      });
      return it("[selection reversed] delete-to-last-character-of-line for each selection", function() {
        selectBlockwiseReversely();
        return ensureDelete();
      });
    });
    describe("I", function() {
      beforeEach(function() {
        return selectBlockwise();
      });
      return it("enter insert mode with each cursors position set to start of selection", function() {
        keystroke('I');
        editor.insertText("!!!");
        return ensure({
          text: "01234567890123456789\n1-------------------\n2----!!!A---------B----\n3----!!!***********----\n4----!!!+++++++++++----\n5----!!!C---------D----\n6-------------------",
          cursor: [[2, 8], [3, 8], [4, 8], [5, 8]],
          mode: 'insert'
        });
      });
    });
    describe("A", function() {
      beforeEach(function() {
        return selectBlockwise();
      });
      return it("enter insert mode with each cursors position set to end of selection", function() {
        keystroke('A');
        editor.insertText("!!!");
        return ensure({
          text: "01234567890123456789\n1-------------------\n2----A---------B!!!----\n3----***********!!!----\n4----+++++++++++!!!----\n5----C---------D!!!----\n6-------------------",
          cursor: [[2, 19], [3, 19], [4, 19], [5, 19]]
        });
      });
    });
    describe("o and O keybinding", function() {
      beforeEach(function() {
        return selectBlockwise();
      });
      describe('o', function() {
        return it("change blockwiseHead to opposite side and reverse selection", function() {
          keystroke('o');
          ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            reversed: true
          });
          keystroke('o');
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            reversed: false
          });
        });
      });
      return describe('capital O', function() {
        return it("reverse each selection", function() {
          keystroke('O');
          ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            reversed: true
          });
          keystroke('O');
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            reversed: false
          });
        });
      });
    });
    describe("shift from characterwise to blockwise", function() {
      describe("when selection is not reversed", function() {
        beforeEach(function() {
          set({
            cursor: [2, 5]
          });
          return ensure('v', {
            selectedText: 'A',
            mode: ['visual', 'characterwise']
          });
        });
        it('case-1', function() {
          ensure('3 j ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['A', '*', '+', 'C']
          });
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            reversed: false
          });
        });
        it('case-2', function() {
          ensure('h 3 j ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['-A', '-*', '-+', '-C']
          });
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            reversed: true
          });
        });
        it('case-3', function() {
          ensure('2 h 3 j ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['--A', '--*', '--+', '--C']
          });
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            reversed: true
          });
        });
        it('case-4', function() {
          ensure('l 3 j ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['A-', '**', '++', 'C-']
          });
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            reversed: false
          });
        });
        return it('case-5', function() {
          ensure('2 l 3 j ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['A--', '***', '+++', 'C--']
          });
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            reversed: false
          });
        });
      });
      return describe("when selection is reversed", function() {
        beforeEach(function() {
          set({
            cursor: [5, 5]
          });
          return ensure('v', {
            selectedText: 'C',
            mode: ['visual', 'characterwise']
          });
        });
        it('case-1', function() {
          ensure('3 k ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['A', '*', '+', 'C']
          });
          return ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            reversed: true
          });
        });
        it('case-2', function() {
          ensure('h 3 k ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['-A', '-*', '-+', '-C']
          });
          return ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            reversed: true
          });
        });
        it('case-3', function() {
          ensure('2 h 3 k ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['--A', '--*', '--+', '--C']
          });
          return ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            reversed: true
          });
        });
        it('case-4', function() {
          ensure('l 3 k ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['A-', '**', '++', 'C-']
          });
          return ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            reversed: false
          });
        });
        return it('case-5', function() {
          ensure('2 l 3 k ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['A--', '***', '+++', 'C--']
          });
          return ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            reversed: false
          });
        });
      });
    });
    describe("shift from blockwise to characterwise", function() {
      var ensureCharacterwiseWasRestored, preserveSelection;
      preserveSelection = function() {
        var cursor, mode, selectedBufferRange, selectedText;
        selectedText = editor.getSelectedText();
        selectedBufferRange = editor.getSelectedBufferRange();
        cursor = editor.getCursorBufferPosition();
        mode = [vimState.mode, vimState.submode];
        return {
          selectedText: selectedText,
          selectedBufferRange: selectedBufferRange,
          cursor: cursor,
          mode: mode
        };
      };
      ensureCharacterwiseWasRestored = function(keystroke) {
        var characterwiseState;
        ensure(keystroke, {
          mode: ['visual', 'characterwise']
        });
        characterwiseState = preserveSelection();
        ensure('ctrl-v', {
          mode: ['visual', 'blockwise']
        });
        return ensure('v', characterwiseState);
      };
      describe("when selection is not reversed", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 5]
          });
        });
        it('case-1', function() {
          return ensureCharacterwiseWasRestored('v');
        });
        it('case-2', function() {
          return ensureCharacterwiseWasRestored('v 3 j');
        });
        it('case-3', function() {
          return ensureCharacterwiseWasRestored('v h 3 j');
        });
        it('case-4', function() {
          return ensureCharacterwiseWasRestored('v 2 h 3 j');
        });
        it('case-5', function() {
          return ensureCharacterwiseWasRestored('v l 3 j');
        });
        return it('case-6', function() {
          return ensureCharacterwiseWasRestored('v 2 l 3 j');
        });
      });
      return describe("when selection is reversed", function() {
        beforeEach(function() {
          return set({
            cursor: [5, 5]
          });
        });
        it('case-1', function() {
          return ensureCharacterwiseWasRestored('v');
        });
        it('case-2', function() {
          return ensureCharacterwiseWasRestored('v 3 k');
        });
        it('case-3', function() {
          return ensureCharacterwiseWasRestored('v h 3 k');
        });
        it('case-4', function() {
          return ensureCharacterwiseWasRestored('v 2 h 3 k');
        });
        it('case-5', function() {
          return ensureCharacterwiseWasRestored('v l 3 k');
        });
        it('case-6', function() {
          return ensureCharacterwiseWasRestored('v 2 l 3 k');
        });
        return it('case-7', function() {
          set({
            cursor: [5, 0]
          });
          return ensureCharacterwiseWasRestored('v 5 l 3 k');
        });
      });
    });
    return describe("gv feature", function() {
      var ensureRestored, preserveSelection;
      preserveSelection = function() {
        var cursor, mode, s, selectedBufferRangeOrdered, selectedTextOrdered, selections;
        selections = editor.getSelectionsOrderedByBufferPosition();
        selectedTextOrdered = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = selections.length; _i < _len; _i++) {
            s = selections[_i];
            _results.push(s.getText());
          }
          return _results;
        })();
        selectedBufferRangeOrdered = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = selections.length; _i < _len; _i++) {
            s = selections[_i];
            _results.push(s.getBufferRange());
          }
          return _results;
        })();
        cursor = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = selections.length; _i < _len; _i++) {
            s = selections[_i];
            _results.push(s.getHeadScreenPosition());
          }
          return _results;
        })();
        mode = [vimState.mode, vimState.submode];
        return {
          selectedTextOrdered: selectedTextOrdered,
          selectedBufferRangeOrdered: selectedBufferRangeOrdered,
          cursor: cursor,
          mode: mode
        };
      };
      ensureRestored = function(keystroke, spec) {
        var preserved;
        ensure(keystroke, spec);
        preserved = preserveSelection();
        ensure('escape j j', {
          mode: 'normal',
          selectedText: ''
        });
        return ensure('g v', preserved);
      };
      describe("linewise selection", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 0]
          });
        });
        describe("selection is not reversed", function() {
          return it('restore previous selection', function() {
            return ensureRestored('V j', {
              selectedText: textData.getLines([2, 3]),
              mode: ['visual', 'linewise']
            });
          });
        });
        return describe("selection is reversed", function() {
          return it('restore previous selection', function() {
            return ensureRestored('V k', {
              selectedText: textData.getLines([1, 2]),
              mode: ['visual', 'linewise']
            });
          });
        });
      });
      describe("characterwise selection", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 0]
          });
        });
        describe("selection is not reversed", function() {
          return it('restore previous selection', function() {
            return ensureRestored('v j', {
              selectedText: "2----A---------B----\n3",
              mode: ['visual', 'characterwise']
            });
          });
        });
        return describe("selection is reversed", function() {
          return it('restore previous selection', function() {
            return ensureRestored('v k', {
              selectedText: "1-------------------\n2",
              mode: ['visual', 'characterwise']
            });
          });
        });
      });
      return describe("blockwise selection", function() {
        describe("selection is not reversed", function() {
          it('restore previous selection case-1', function() {
            set({
              cursor: [2, 5]
            });
            keystroke('ctrl-v 1 0 l');
            return ensureRestored('3 j', {
              selectedText: blockTexts.slice(2, 6),
              mode: ['visual', 'blockwise']
            });
          });
          return it('restore previous selection case-2', function() {
            set({
              cursor: [5, 5]
            });
            keystroke('ctrl-v 1 0 l');
            return ensureRestored('3 k', {
              selectedTextOrdered: blockTexts.slice(2, 6),
              mode: ['visual', 'blockwise']
            });
          });
        });
        return describe("selection is reversed", function() {
          it('restore previous selection case-1', function() {
            set({
              cursor: [2, 15]
            });
            keystroke('ctrl-v 1 0 h');
            return ensureRestored('3 j', {
              selectedText: blockTexts.slice(2, 6),
              mode: ['visual', 'blockwise']
            });
          });
          return it('restore previous selection case-2', function() {
            set({
              cursor: [5, 15]
            });
            keystroke('ctrl-v 1 0 h');
            return ensureRestored('3 k', {
              selectedTextOrdered: blockTexts.slice(2, 6),
              mode: ['visual', 'blockwise']
            });
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvdmlzdWFsLWJsb2Nrd2lzZS1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxrQ0FBQTtJQUFBLGtCQUFBOztBQUFBLEVBQUEsT0FBMEIsT0FBQSxDQUFRLGVBQVIsQ0FBMUIsRUFBQyxtQkFBQSxXQUFELEVBQWMsZ0JBQUEsUUFBZCxDQUFBOztBQUFBLEVBQ0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSwwQkFBUixDQURSLENBQUE7O0FBQUEsRUFHQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQSxHQUFBO0FBQzNCLFFBQUEsMk1BQUE7QUFBQSxJQUFBLFFBQTRELEVBQTVELEVBQUMsY0FBRCxFQUFNLGlCQUFOLEVBQWMsb0JBQWQsRUFBeUIsaUJBQXpCLEVBQWlDLHdCQUFqQyxFQUFnRCxtQkFBaEQsQ0FBQTtBQUFBLElBQ0EsV0FBQSxHQUFjLDBKQURkLENBQUE7QUFBQSxJQVdBLGdCQUFBLEdBQW1CLDhGQVhuQixDQUFBO0FBQUEsSUFxQkEsaUJBQUEsR0FBb0IsMEdBckJwQixDQUFBO0FBQUEsSUErQkEsVUFBQSxHQUFhLENBQ1gsYUFEVyxFQUVYLGFBRlcsRUFHWCxhQUhXLEVBSVgsYUFKVyxFQUtYLGFBTFcsRUFNWCxhQU5XLEVBT1gsYUFQVyxDQS9CYixDQUFBO0FBQUEsSUF5Q0EsUUFBQSxHQUFlLElBQUEsUUFBQSxDQUFTLFdBQVQsQ0F6Q2YsQ0FBQTtBQUFBLElBMkNBLGVBQUEsR0FBa0IsU0FBQSxHQUFBO0FBQ2hCLE1BQUEsR0FBQSxDQUFJO0FBQUEsUUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO09BQUosQ0FBQSxDQUFBO2FBQ0EsTUFBQSxDQUFPLG9CQUFQLEVBQ0U7QUFBQSxRQUFBLElB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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/spec/visual-blockwise-spec.coffee
