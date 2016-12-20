(function() {
  var helpers;

  helpers = require('./spec-helper');

  describe("Scrolling", function() {
    var editor, editorElement, keydown, vimState, _ref;
    _ref = [], editor = _ref[0], editorElement = _ref[1], vimState = _ref[2];
    beforeEach(function() {
      var vimMode;
      vimMode = atom.packages.loadPackage('vim-mode');
      vimMode.activateResources();
      return helpers.getEditorElement(function(element) {
        editorElement = element;
        editor = editorElement.getModel();
        vimState = editorElement.vimState;
        vimState.activateNormalMode();
        vimState.resetNormalMode();
        return jasmine.attachToDOM(element);
      });
    });
    keydown = function(key, options) {
      if (options == null) {
        options = {};
      }
      if (options.element == null) {
        options.element = editorElement;
      }
      return helpers.keydown(key, options);
    };
    describe("scrolling keybindings", function() {
      beforeEach(function() {
        editor.setText("100\n200\n300\n400\n500\n600\n700\n800\n900\n1000");
        editor.setCursorBufferPosition([1, 2]);
        editorElement.setHeight(editorElement.getHeight() * 4 / 10);
        return expect(editor.getVisibleRowRange()).toEqual([0, 4]);
      });
      return describe("the ctrl-e and ctrl-y keybindings", function() {
        return it("moves the screen up and down by one and keeps cursor onscreen", function() {
          keydown('e', {
            ctrl: true
          });
          expect(editor.getFirstVisibleScreenRow()).toBe(1);
          expect(editor.getLastVisibleScreenRow()).toBe(5);
          expect(editor.getCursorScreenPosition()).toEqual([2, 2]);
          keydown('2');
          keydown('e', {
            ctrl: true
          });
          expect(editor.getFirstVisibleScreenRow()).toBe(3);
          expect(editor.getLastVisibleScreenRow()).toBe(7);
          expect(editor.getCursorScreenPosition()).toEqual([4, 2]);
          keydown('2');
          keydown('y', {
            ctrl: true
          });
          expect(editor.getFirstVisibleScreenRow()).toBe(1);
          expect(editor.getLastVisibleScreenRow()).toBe(5);
          return expect(editor.getCursorScreenPosition()).toEqual([2, 2]);
        });
      });
    });
    describe("scroll cursor keybindings", function() {
      beforeEach(function() {
        var i, text, _i;
        text = "";
        for (i = _i = 1; _i <= 200; i = ++_i) {
          text += "" + i + "\n";
        }
        editor.setText(text);
        spyOn(editor, 'moveToFirstCharacterOfLine');
        spyOn(editorElement, 'setScrollTop');
        editorElement.style.lineHeight = "20px";
        editorElement.component.sampleFontStyling();
        editorElement.setHeight(200);
        spyOn(editorElement, 'getFirstVisibleScreenRow').andReturn(90);
        return spyOn(editorElement, 'getLastVisibleScreenRow').andReturn(110);
      });
      describe("the z<CR> keybinding", function() {
        var keydownCodeForEnter;
        keydownCodeForEnter = '\r';
        beforeEach(function() {
          return spyOn(editorElement, 'pixelPositionForScreenPosition').andReturn({
            top: 1000,
            left: 0
          });
        });
        return it("moves the screen to position cursor at the top of the window and moves cursor to first non-blank in the line", function() {
          keydown('z');
          keydown(keydownCodeForEnter);
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(960);
          return expect(editor.moveToFirstCharacterOfLine).toHaveBeenCalled();
        });
      });
      describe("the zt keybinding", function() {
        beforeEach(function() {
          return spyOn(editorElement, 'pixelPositionForScreenPosition').andReturn({
            top: 1000,
            left: 0
          });
        });
        return it("moves the screen to position cursor at the top of the window and leave cursor in the same column", function() {
          keydown('z');
          keydown('t');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(960);
          return expect(editor.moveToFirstCharacterOfLine).not.toHaveBeenCalled();
        });
      });
      describe("the z. keybinding", function() {
        beforeEach(function() {
          return spyOn(editorElement, 'pixelPositionForScreenPosition').andReturn({
            top: 1000,
            left: 0
          });
        });
        return it("moves the screen to position cursor at the center of the window and moves cursor to first non-blank in the line", function() {
          keydown('z');
          keydown('.');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(900);
          return expect(editor.moveToFirstCharacterOfLine).toHaveBeenCalled();
        });
      });
      describe("the zz keybinding", function() {
        beforeEach(function() {
          return spyOn(editorElement, 'pixelPositionForScreenPosition').andReturn({
            top: 1000,
            left: 0
          });
        });
        return it("moves the screen to position cursor at the center of the window and leave cursor in the same column", function() {
          keydown('z');
          keydown('z');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(900);
          return expect(editor.moveToFirstCharacterOfLine).not.toHaveBeenCalled();
        });
      });
      describe("the z- keybinding", function() {
        beforeEach(function() {
          return spyOn(editorElement, 'pixelPositionForScreenPosition').andReturn({
            top: 1000,
            left: 0
          });
        });
        return it("moves the screen to position cursor at the bottom of the window and moves cursor to first non-blank in the line", function() {
          keydown('z');
          keydown('-');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(860);
          return expect(editor.moveToFirstCharacterOfLine).toHaveBeenCalled();
        });
      });
      return describe("the zb keybinding", function() {
        beforeEach(function() {
          return spyOn(editorElement, 'pixelPositionForScreenPosition').andReturn({
            top: 1000,
            left: 0
          });
        });
        return it("moves the screen to position cursor at the bottom of the window and leave cursor in the same column", function() {
          keydown('z');
          keydown('b');
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
          keydown('z');
          keydown('s');
          return editorElement.getScrollLeft();
        };
        startPosition = NaN;
        beforeEach(function() {
          return startPosition = editorElement.getScrollLeft();
        });
        it("does nothing near the start of the line", function() {
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
          var pos340, pos342, pos390, posEnd;
          posEnd = zsPos(399);
          expect(editor.getCursorBufferPosition()).toEqual([0, 399]);
          pos390 = zsPos(390);
          expect(pos390).toEqual(posEnd);
          expect(editor.getCursorBufferPosition()).toEqual([0, 390]);
          pos340 = zsPos(340);
          expect(pos340).toBeLessThan(posEnd);
          pos342 = zsPos(342);
          return expect(pos342 - pos340).toEqual(19);
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
          keydown('z');
          keydown('e');
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
          return expect(pos110 - pos109).toEqual(10);
        });
        it("does nothing when very near the end of the line", function() {
          var pos380, pos382, pos397, posEnd;
          posEnd = zePos(399);
          expect(editor.getCursorBufferPosition()).toEqual([0, 399]);
          pos397 = zePos(397);
          expect(pos397).toEqual(posEnd);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS9zcGVjL3Njcm9sbC1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxPQUFBOztBQUFBLEVBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxlQUFSLENBQVYsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsQ0FBUyxXQUFULEVBQXNCLFNBQUEsR0FBQTtBQUNwQixRQUFBLDhDQUFBO0FBQUEsSUFBQSxPQUFvQyxFQUFwQyxFQUFDLGdCQUFELEVBQVMsdUJBQVQsRUFBd0Isa0JBQXhCLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxVQUFBLE9BQUE7QUFBQSxNQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQWQsQ0FBMEIsVUFBMUIsQ0FBVixDQUFBO0FBQUEsTUFDQSxPQUFPLENBQUMsaUJBQVIsQ0FBQSxDQURBLENBQUE7YUFHQSxPQUFPLENBQUMsZ0JBQVIsQ0FBeUIsU0FBQyxPQUFELEdBQUE7QUFDdkIsUUFBQSxhQUFBLEdBQWdCLE9BQWhCLENBQUE7QUFBQSxRQUNBLE1BQUEsR0FBUyxhQUFhLENBQUMsUUFBZCxDQUFBLENBRFQsQ0FBQTtBQUFBLFFBRUEsUUFBQSxHQUFXLGFBQWEsQ0FBQyxRQUZ6QixDQUFBO0FBQUEsUUFHQSxRQUFRLENBQUMsa0JBQVQsQ0FBQSxDQUhBLENBQUE7QUFBQSxRQUlBLFFBQVEsQ0FBQyxlQUFULENBQUEsQ0FKQSxDQUFBO2VBS0EsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsT0FBcEIsRUFOdUI7TUFBQSxDQUF6QixFQUpTO0lBQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxJQWNBLE9BQUEsR0FBVSxTQUFDLEdBQUQsRUFBTSxPQUFOLEdBQUE7O1FBQU0sVUFBUTtPQUN0Qjs7UUFBQSxPQUFP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

//# sourceURL=/home/andy/.atom/packages/vim-mode/spec/scroll-spec.coffee
