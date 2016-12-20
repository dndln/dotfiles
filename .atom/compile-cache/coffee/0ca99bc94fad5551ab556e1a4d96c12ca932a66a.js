(function() {
  var getVimState;

  getVimState = require('./spec-helper').getVimState;

  describe("Scrolling", function() {
    var editor, editorElement, ensure, keystroke, set, vimState, _ref;
    _ref = [], set = _ref[0], ensure = _ref[1], keystroke = _ref[2], editor = _ref[3], editorElement = _ref[4], vimState = _ref[5];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke;
        return jasmine.attachToDOM(editorElement);
      });
    });
    afterEach(function() {
      return vimState.resetNormalMode();
    });
    describe("scrolling keybindings", function() {
      beforeEach(function() {
        editor.setLineHeightInPixels(10);
        editorElement.setHeight(50);
        atom.views.performDocumentPoll();
        set({
          cursor: [1, 2],
          text: "100\n200\n300\n400\n500\n600\n700\n800\n900\n1000"
        });
        return expect(editorElement.getVisibleRowRange()).toEqual([0, 4]);
      });
      return describe("the ctrl-e and ctrl-y keybindings", function() {
        return it("moves the screen up and down by one and keeps cursor onscreen", function() {
          ensure('ctrl-e', {
            cursor: [2, 2]
          });
          expect(editor.getFirstVisibleScreenRow()).toBe(1);
          expect(editor.getLastVisibleScreenRow()).toBe(6);
          ensure('2 ctrl-e', {
            cursor: [4, 2]
          });
          expect(editor.getFirstVisibleScreenRow()).toBe(3);
          expect(editor.getLastVisibleScreenRow()).toBe(8);
          ensure('2 ctrl-y', {
            cursor: [2, 2]
          });
          expect(editor.getFirstVisibleScreenRow()).toBe(1);
          return expect(editor.getLastVisibleScreenRow()).toBe(6);
        });
      });
    });
    describe("scroll cursor keybindings", function() {
      beforeEach(function() {
        var _i, _results;
        editor.setText((function() {
          _results = [];
          for (_i = 1; _i <= 200; _i++){ _results.push(_i); }
          return _results;
        }).apply(this).join("\n"));
        editorElement.style.lineHeight = "20px";
        editorElement.component.sampleFontStyling();
        editorElement.setHeight(20 * 10);
        spyOn(editor, 'moveToFirstCharacterOfLine');
        spyOn(editorElement, 'setScrollTop');
        spyOn(editorElement, 'getFirstVisibleScreenRow').andReturn(90);
        spyOn(editorElement, 'getLastVisibleScreenRow').andReturn(110);
        return spyOn(editorElement, 'pixelPositionForScreenPosition').andReturn({
          top: 1000,
          left: 0
        });
      });
      describe("the z<CR> keybinding", function() {
        return it("moves the screen to position cursor at the top of the window and moves cursor to first non-blank in the line", function() {
          keystroke('z enter');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(960);
          return expect(editor.moveToFirstCharacterOfLine).toHaveBeenCalled();
        });
      });
      describe("the zt keybinding", function() {
        return it("moves the screen to position cursor at the top of the window and leave cursor in the same column", function() {
          keystroke('z t');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(960);
          return expect(editor.moveToFirstCharacterOfLine).not.toHaveBeenCalled();
        });
      });
      describe("the z. keybinding", function() {
        return it("moves the screen to position cursor at the center of the window and moves cursor to first non-blank in the line", function() {
          keystroke('z .');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(900);
          return expect(editor.moveToFirstCharacterOfLine).toHaveBeenCalled();
        });
      });
      describe("the zz keybinding", function() {
        return it("moves the screen to position cursor at the center of the window and leave cursor in the same column", function() {
          keystroke('z z');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(900);
          return expect(editor.moveToFirstCharacterOfLine).not.toHaveBeenCalled();
        });
      });
      describe("the z- keybinding", function() {
        return it("moves the screen to position cursor at the bottom of the window and moves cursor to first non-blank in the line", function() {
          keystroke('z -');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(860);
          return expect(editor.moveToFirstCharacterOfLine).toHaveBeenCalled();
        });
      });
      return describe("the zb keybinding", function() {
        return it("moves the screen to position cursor at the bottom of the window and leave cursor in the same column", function() {
          keystroke('z b');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(860);
          return expect(editor.moveToFirstCharacterOfLine).not.toHaveBeenCalled();
        });
      });
    });
    return describe("horizontal scroll cursor keybindings", function() {
      beforeEach(function() {
        var i, text, _i;
        editorElement.setWidth(600);
        editorElement.setHeight(600);
        editorElement.style.lineHeight = "10px";
        editorElement.style.font = "16px monospace";
        atom.views.performDocumentPoll();
        text = "";
        for (i = _i = 100; _i <= 199; i = ++_i) {
          text += "" + i + " ";
        }
        editor.setText(text);
        return editor.setCursorBufferPosition([0, 0]);
      });
      describe("the zs keybinding", function() {
        var startPosition, zsPos;
        zsPos = function(pos) {
          editor.setCursorBufferPosition([0, pos]);
          keystroke('z s');
          return editorElement.getScrollLeft();
        };
        startPosition = NaN;
        beforeEach(function() {
          return startPosition = editorElement.getScrollLeft();
        });
        xit("does nothing near the start of the line", function() {
          var pos1;
          pos1 = zsPos(1);
          return expect(pos1).toEqual(startPosition);
        });
        it("moves the cursor the nearest it can to the left edge of the editor", function() {
          var pos10, pos11;
          pos10 = zsPos(10);
          expect(pos10).toBeGreaterThan(startPosition);
          pos11 = zsPos(11);
          return expect(pos11 - pos10).toEqual(10);
        });
        it("does nothing near the end of the line", function() {
          var pos340, pos390, posEnd;
          posEnd = zsPos(399);
          expect(editor.getCursorBufferPosition()).toEqual([0, 399]);
          pos390 = zsPos(390);
          expect(pos390).toEqual(posEnd);
          expect(editor.getCursorBufferPosition()).toEqual([0, 390]);
          pos340 = zsPos(340);
          return expect(pos340).toEqual(posEnd);
        });
        return it("does nothing if all lines are short", function() {
          var pos1, pos10;
          editor.setText('short');
          startPosition = editorElement.getScrollLeft();
          pos1 = zsPos(1);
          expect(pos1).toEqual(startPosition);
          expect(editor.getCursorBufferPosition()).toEqual([0, 1]);
          pos10 = zsPos(10);
          expect(pos10).toEqual(startPosition);
          return expect(editor.getCursorBufferPosition()).toEqual([0, 4]);
        });
      });
      return describe("the ze keybinding", function() {
        var startPosition, zePos;
        zePos = function(pos) {
          editor.setCursorBufferPosition([0, pos]);
          keystroke('z e');
          return editorElement.getScrollLeft();
        };
        startPosition = NaN;
        beforeEach(function() {
          return startPosition = editorElement.getScrollLeft();
        });
        it("does nothing near the start of the line", function() {
          var pos1, pos40;
          pos1 = zePos(1);
          expect(pos1).toEqual(startPosition);
          pos40 = zePos(40);
          return expect(pos40).toEqual(startPosition);
        });
        it("moves the cursor the nearest it can to the right edge of the editor", function() {
          var pos109, pos110;
          pos110 = zePos(110);
          expect(pos110).toBeGreaterThan(startPosition);
          pos109 = zePos(109);
          return expect(pos110 - pos109).toEqual(9);
        });
        it("does nothing when very near the end of the line", function() {
          var pos380, pos382, pos397, posEnd;
          posEnd = zePos(399);
          expect(editor.getCursorBufferPosition()).toEqual([0, 399]);
          pos397 = zePos(397);
          expect(pos397).toBeLessThan(posEnd);
          expect(editor.getCursorBufferPosition()).toEqual([0, 397]);
          pos380 = zePos(380);
          expect(pos380).toBeLessThan(posEnd);
          pos382 = zePos(382);
          return expect(pos382 - pos380).toEqual(19);
        });
        return it("does nothing if all lines are short", function() {
          var pos1, pos10;
          editor.setText('short');
          startPosition = editorElement.getScrollLeft();
          pos1 = zePos(1);
          expect(pos1).toEqual(startPosition);
          expect(editor.getCursorBufferPosition()).toEqual([0, 1]);
          pos10 = zePos(10);
          expect(pos10).toEqual(startPosition);
          return expect(editor.getCursorBufferPosition()).toEqual([0, 4]);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvc2Nyb2xsLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFdBQUE7O0FBQUEsRUFBQyxjQUFlLE9BQUEsQ0FBUSxlQUFSLEVBQWYsV0FBRCxDQUFBOztBQUFBLEVBRUEsUUFBQSxDQUFTLFdBQVQsRUFBc0IsU0FBQSxHQUFBO0FBQ3BCLFFBQUEsNkRBQUE7QUFBQSxJQUFBLE9BQTRELEVBQTVELEVBQUMsYUFBRCxFQUFNLGdCQUFOLEVBQWMsbUJBQWQsRUFBeUIsZ0JBQXpCLEVBQWlDLHVCQUFqQyxFQUFnRCxrQkFBaEQsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxHQUFSLEdBQUE7QUFDVixRQUFBLFFBQUEsR0FBVyxLQUFYLENBQUE7QUFBQSxRQUNDLGtCQUFBLE1BQUQsRUFBUyx5QkFBQSxhQURULENBQUE7QUFBQSxRQUVDLFVBQUEsR0FBRCxFQUFNLGFBQUEsTUFBTixFQUFjLGdCQUFBLFNBRmQsQ0FBQTtlQUdBLE9BQU8sQ0FBQyxXQUFSLENBQW9CLGFBQXBCLEVBSlU7TUFBQSxDQUFaLEVBRFM7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBU0EsU0FBQSxDQUFVLFNBQUEsR0FBQTthQUNSLFFBQVEsQ0FBQyxlQUFULENBQUEsRUFEUTtJQUFBLENBQVYsQ0FUQSxDQUFBO0FBQUEsSUFZQSxRQUFBLENBQVMsdUJBQVQsRUFBa0MsU0FBQSxHQUFBO0FBQ2hDLE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsTUFBTSxDQUFDLHFCQUFQLENBQTZCLEVBQTdCLENBQUEsQ0FBQTtBQUFBLFFBQ0EsYUFBYSxDQUFDLFNBQWQsQ0FBd0IsRUFB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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/spec/scroll-spec.coffee
