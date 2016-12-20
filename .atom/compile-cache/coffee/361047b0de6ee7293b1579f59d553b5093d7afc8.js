(function() {
  var TextData, dispatch, getVimState, settings, _ref;

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, dispatch = _ref.dispatch, TextData = _ref.TextData;

  settings = require('../lib/settings');

  describe("Motion Scroll", function() {
    var editor, editorElement, ensure, keystroke, set, text, vimState, _i, _ref1, _results;
    _ref1 = [], set = _ref1[0], ensure = _ref1[1], keystroke = _ref1[2], editor = _ref1[3], editorElement = _ref1[4], vimState = _ref1[5];
    text = new TextData((function() {
      _results = [];
      for (_i = 0; _i < 100; _i++){ _results.push(_i); }
      return _results;
    }).apply(this).join("\n"));
    beforeEach(function() {
      getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, keystroke = _vim.keystroke, _vim;
      });
      return runs(function() {
        jasmine.attachToDOM(editorElement);
        set({
          text: text.getRaw()
        });
        editorElement.setHeight(20 * 10);
        editorElement.style.lineHeight = "10px";
        atom.views.performDocumentPoll();
        editorElement.setScrollTop(40 * 10);
        return editor.setCursorBufferPosition([42, 0]);
      });
    });
    afterEach(function() {
      return vimState.resetNormalMode();
    });
    describe("the ctrl-u keybinding", function() {
      it("moves the screen down by half screen size and keeps cursor onscreen", function() {
        return ensure('ctrl-u', {
          scrollTop: 300,
          cursor: [32, 0]
        });
      });
      it("selects on visual mode", function() {
        set({
          cursor: [42, 1]
        });
        return ensure('v ctrl-u', {
          selectedText: text.getLines([32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42], {
            chomp: true
          })
        });
      });
      return it("selects on linewise mode", function() {
        return ensure('V ctrl-u', {
          selectedText: text.getLines([32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42])
        });
      });
    });
    describe("the ctrl-b keybinding", function() {
      it("moves screen up one page", function() {
        return ensure('ctrl-b', {
          scrollTop: 200,
          cursor: [22, 0]
        });
      });
      it("selects on visual mode", function() {
        set({
          cursor: [42, 1]
        });
        return ensure('v ctrl-b', {
          selectedText: text.getLines([22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42], {
            chomp: true
          })
        });
      });
      return it("selects on linewise mode", function() {
        return ensure('V ctrl-b', {
          selectedText: text.getLines([22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42])
        });
      });
    });
    describe("the ctrl-d keybinding", function() {
      it("moves the screen down by half screen size and keeps cursor onscreen", function() {
        return ensure('ctrl-d', {
          scrollTop: 500,
          cursor: [52, 0]
        });
      });
      it("selects on visual mode", function() {
        set({
          cursor: [42, 1]
        });
        return ensure('v ctrl-d', {
          selectedText: text.getLines([42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52], {
            chomp: true
          }).slice(1, -1)
        });
      });
      return it("selects on linewise mode", function() {
        return ensure('V ctrl-d', {
          selectedText: text.getLines([42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52])
        });
      });
    });
    return describe("the ctrl-f keybinding", function() {
      it("moves screen down one page", function() {
        return ensure('ctrl-f', {
          scrollTop: 600,
          cursor: [62, 0]
        });
      });
      it("selects on visual mode", function() {
        set({
          cursor: [42, 1]
        });
        return ensure('v ctrl-f', {
          selectedText: text.getLines([42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62], {
            chomp: true
          }).slice(1, -1)
        });
      });
      return it("selects on linewise mode", function() {
        return ensure('V ctrl-f', {
          selectedText: text.getLines([42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62])
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvbW90aW9uLXNjcm9sbC1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwrQ0FBQTs7QUFBQSxFQUFBLE9BQW9DLE9BQUEsQ0FBUSxlQUFSLENBQXBDLEVBQUMsbUJBQUEsV0FBRCxFQUFjLGdCQUFBLFFBQWQsRUFBd0IsZ0JBQUEsUUFBeEIsQ0FBQTs7QUFBQSxFQUNBLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVIsQ0FEWCxDQUFBOztBQUFBLEVBR0EsUUFBQSxDQUFTLGVBQVQsRUFBMEIsU0FBQSxHQUFBO0FBQ3hCLFFBQUEsa0ZBQUE7QUFBQSxJQUFBLFFBQTRELEVBQTVELEVBQUMsY0FBRCxFQUFNLGlCQUFOLEVBQWMsb0JBQWQsRUFBeUIsaUJBQXpCLEVBQWlDLHdCQUFqQyxFQUFnRCxtQkFBaEQsQ0FBQTtBQUFBLElBQ0EsSUFBQSxHQUFXLElBQUEsUUFBQSxDQUFTOzs7O2tCQUFTLENBQUMsSUFBVixDQUFlLElBQWYsQ0FBVCxDQURYLENBQUE7QUFBQSxJQUdBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxJQUFSLEdBQUE7QUFDVixRQUFBLFFBQUEsR0FBVyxLQUFYLENBQUE7QUFBQSxRQUNDLGtCQUFBLE1BQUQsRUFBUyx5QkFBQSxhQURULENBQUE7ZUFFQyxXQUFBLEdBQUQsRUFBTSxjQUFBLE1BQU4sRUFBYyxpQkFBQSxTQUFkLEVBQTJCLEtBSGpCO01BQUEsQ0FBWixDQUFBLENBQUE7YUFLQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsUUFBQSxPQUFPLENBQUMsV0FBUixDQUFvQixhQUFwQixDQUFBLENBQUE7QUFBQSxRQUNBLEdBQUEsQ0FBSTtBQUFBLFVBQUEsSUFBQSxFQUFNLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBTjtTQUFKLENBREEsQ0FBQTtBQUFBLFFBRUEsYUFBYSxDQUFDLFNBQWQsQ0FBd0IsRUFBQSxHQUFLLEVBQTdCLENBRkEsQ0FBQTtBQUFBLFFBR0EsYUFBYSxDQUFDLEtBQUssQ0FBQyxVQUFwQixHQUFpQyxNQUhqQyxDQUFBO0FBQUEsUUFJQSxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFYLENBQUEsQ0FKQSxDQUFBO0FBQUEsUUFLQSxhQUFhLENBQUMsWUFBZCxDQUEyQixFQUFBLEdBQUssRUFBaEMsQ0FMQSxDQUFBO2VBTUEsTUFBTSxDQUFDLHVCQUFQLENBQStCLENBQUMsRUFBRCxFQUFLLENBQUwsQ0FBL0IsRUFQRztNQUFBLENBQUwsRUFOUztJQUFBLENBQVgsQ0FIQSxDQUFBO0FBQUEsSUFrQkEsU0FBQSxDQUFVLFNBQUEsR0FBQTthQUNSLFFBQVEsQ0FBQyxlQUFULENBQUEsRUFEUTtJQUFBLENBQVYsQ0FsQkEsQ0FBQTtBQUFBLElBcUJBLFFBQUEsQ0FBUyx1QkFBVCxFQUFrQyxTQUFBLEdBQUE7QUFDaEMsTUFBQSxFQUFBLENBQUcscUVBQUgsRUFBMEUsU0FBQSxHQUFBO2VBQ3hFLE1BQUEsQ0FBTyxRQUFQLEVBQ0U7QUFBQSxVQUFBLFNBQUEsRUFBVyxHQUFYO0FBQUEsVUFDQSxNQUFBLEVBQVEsQ0FBQyxFQUFELEVBQUssQ0FBTCxDQURSO1NBREYsRUFEd0U7TUFBQSxDQUExRSxDQUFBLENBQUE7QUFBQSxNQUtBLEVBQUEsQ0FBRyx3QkFBSCxFQUE2QixTQUFBLEdBQUE7QUFDM0IsUUFBQSxHQUFBLENBQUk7QUFBQSxVQUFBLE1BQUEsRUFBUSxDQUFDLEVBQUQsRUFBSyxDQUFMLENBQVI7U0FBSixDQUFBLENBQUE7ZUFDQSxNQUFBLENBQU8sVUFBUCxFQUNFO0FBQUEsVUFBQSxZQUFBLEVBQWMsSUFBSSxDQUFDLFFBQUwsQ0FBYyw0Q0FBZCxFQUF3QjtBQUFBLFlBQUEsS0FBQSxFQUFPLElBQVA7V0FBeEIsQ0FBZDtTQURGLEVBRjJCO01BQUEsQ0FBN0IsQ0FMQSxDQUFBO2FBVUEsRUFBQSxDQUFHLDBCQUFILEVBQStCLFNBQUEsR0FBQTtlQUM3QixNQUFBLENBQU8sVUFBUCxFQUNFO0FBQUEsVUFBQSxZQUFBLEVBQWMsSUFBSSxDQUFDLFFBQUwsQ0FBYyw0Q0FBZCxDQUFkO1NBREYsRUFENkI7TUFBQSxDQUEvQixFQVhnQztJQUFBLENBQWxDLENBckJBLENBQUE7QUFBQSxJQW9DQSxRQUFBLENBQVMsdUJBQVQsRUFBa0MsU0FBQSxHQUFBO0FBQ2hDLE1BQUEsRUFBQSxDQUFHLDBCQUFILEVBQStCLFNBQUEsR0FBQTtlQUM3QixNQUFBLENBQU8sUUFBUCxFQUNFO0FBQUEsVUFBQSxTQUFBLEVBQVcsR0FBWDtBQUFBLFVBQ0EsTUFBQSxFQUFRLENBQUMsRUFBRCxFQUFLLENBQUwsQ0FEUjtTQURGLEVBRDZCO01BQUEsQ0FBL0IsQ0FBQSxDQUFBO0FBQUEsTUFLQSxFQUFBLENBQUcsd0JBQUgsRUFBNkIsU0FBQSxHQUFBO0FBQzNCLFFBQUEsR0FBQSxDQUFJO0FBQUEsVUFBQSxNQUFBLEVBQVEsQ0FBQyxFQUFELEVBQUssQ0FBTCxDQUFSO1NBQUosQ0FBQSxDQUFBO2VBQ0EsTUFBQSxDQUFPLFVBQVAsRUFDRTtBQUFBLFVBQUEsWUFBQSxFQUFjLElBQUksQ0FBQyxRQUFMLENBQWMsb0ZBQWQsRUFBd0I7QUFBQSxZQUFBLEtBQUEsRUFBTyxJQUFQO1dBQXhCLENBQWQ7U0FERixFQUYyQjtNQUFBLENBQTdCLENBTEEsQ0FBQTthQVVBLEVBQUEsQ0FBRywwQkFBSCxFQUErQixTQUFBLEdBQUE7ZUFDN0IsTUFBQSxDQUFPLFVBQVAsRUFDRTtBQUFBLFVBQUEsWUFBQSxFQUFjLElBQUksQ0FBQyxRQUFMLENBQWMsb0ZBQWQsQ0FBZDtTQURGLEVBRDZCO01BQUEsQ0FBL0IsRUFYZ0M7SUFBQSxDQUFsQyxDQXBDQSxDQUFBO0FBQUEsSUFtREEsUUFBQSxDQUFTLHVCQUFULEVBQWtDLFNBQUEsR0FBQTtBQUNoQyxNQUFBLEVBQUEsQ0FBRyxxRUFBSCxFQUEwRSxTQUFBLEdBQUE7ZUFDeEUsTUFBQSxDQUFPLFFBQVAsRUFDRTtBQUFBLFVBQUEsU0FBQSxFQUFXLEdBQVg7QUFBQSxVQUNBLE1BQUEsRUFBUSxDQUFDLEVBQUQsRUFBSyxDQUFMLENBRFI7U0FERixFQUR3RTtNQUFBLENBQTFFLENBQUEsQ0FBQTtBQUFBLE1BS0EsRUFBQSxDQUFHLHdCQUFILEVBQTZCLFNBQUEsR0FBQTtBQUMzQixRQUFBLEdBQUEsQ0FBSTtBQUFBLFVBQUEsTUFBQSxFQUFRLENBQUMsRUFBRCxFQUFLLENBQUwsQ0FBUjtTQUFKLENBQUEsQ0FBQTtlQUNBLE1BQUEsQ0FBTyxVQUFQLEVBQ0U7QUFBQSxVQUFBLFlBQUEsRUFBYyxJQUFJLENBQUMsUUFBTCxDQUFjLDRDQUFkLEVBQXdCO0FBQUEsWUFBQSxLQUFBLEVBQU8sSUFBUDtXQUF4QixDQUFvQyxDQUFDLEtBQXJDLENBQTJDLENBQTNDLEVBQThDLENBQUEsQ0FBOUMsQ0FBZDtTQURGLEVBRjJCO01BQUEsQ0FBN0IsQ0FMQSxDQUFBO2FBVUEsRUFBQSxDQUFHLDBCQUFILEVBQStCLFNBQUEsR0FBQTtlQUM3QixNQUFBLENBQU8sVUFBUCxFQUNFO0FBQUEsVUFBQSxZQUFBLEVBQWMsSUFBSSxDQUFDLFFBQUwsQ0FBYyw0Q0FBZCxDQUFkO1NBREYsRUFENkI7TUFBQSxDQUEvQixFQVhnQztJQUFBLENBQWxDLENBbkRBLENBQUE7V0FrRUEsUUFBQSxDQUFTLHVCQUFULEVBQWtDLFNBQUEsR0FBQTtBQUNoQyxNQUFBLEVBQUEsQ0FBRyw0QkFBSCxFQUFpQyxTQUFBLEdBQUE7ZUFDL0IsTUFBQSxDQUFPLFFBQVAsRUFDRTtBQUFBLFVBQUEsU0FBQSxFQUFXLEdBQVg7QUFBQSxVQUNBLE1BQUEsRUFBUSxDQUFDLEVBQUQsRUFBSyxDQUFMLENBRFI7U0FERixFQUQrQjtNQUFBLENBQWpDLENBQUEsQ0FBQTtBQUFBLE1BS0EsRUFBQSxDQUFHLHdCQUFILEVBQTZCLFNBQUEsR0FBQTtBQUMzQixRQUFBLEdBQUEsQ0FBSTtBQUFBLFVBQUEsTUFBQSxFQUFRLENBQUMsRUFBRCxFQUFLLENBQUwsQ0FBUjtTQUFKLENBQUEsQ0FBQTtlQUNBLE1BQUEsQ0FBTyxVQUFQLEVBQ0U7QUFBQSxVQUFBLFlBQUEsRUFBYyxJQUFJLENBQUMsUUFBTCxDQUFjLG9GQUFkLEVBQXdCO0FBQUEsWUFBQSxLQUFBLEVBQU8sSUFBUDtXQUF4QixDQUFvQyxDQUFDLEtBQXJDLENBQTJDLENBQTNDLEVBQThDLENBQUEsQ0FBOUMsQ0FBZDtTQURGLEVBRjJCO01BQUEsQ0FBN0IsQ0FMQSxDQUFBO2FBVUEsRUFBQSxDQUFHLDBCQUFILEVBQStCLFNBQUEsR0FBQTtlQUM3QixNQUFBLENBQU8sVUFBUCxFQUNFO0FBQUEsVUFBQSxZQUFBLEVBQWMsSUFBSSxDQUFDLFFBQUwsQ0FBYyxvRkFBZCxDQUFkO1NBREYsRUFENkI7TUFBQSxDQUEvQixFQVhnQztJQUFBLENBQWxDLEVBbkV3QjtFQUFBLENBQTFCLENBSEEsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/spec/motion-scroll-spec.coffee
