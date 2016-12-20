(function() {
  var TextData, dispatch, getView, getVimState, settings, _ref;

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, dispatch = _ref.dispatch, TextData = _ref.TextData, getView = _ref.getView;

  settings = require('../lib/settings');

  describe("Persistent Selection", function() {
    var editor, editorElement, ensure, keystroke, set, vimState, _ref1;
    _ref1 = [], set = _ref1[0], ensure = _ref1[1], keystroke = _ref1[2], editor = _ref1[3], editorElement = _ref1[4], vimState = _ref1[5];
    beforeEach(function() {
      getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, keystroke = _vim.keystroke, _vim;
      });
      return runs(function() {
        return jasmine.attachToDOM(editorElement);
      });
    });
    afterEach(function() {
      return vimState.resetNormalMode();
    });
    return describe("CreatePersistentSelection operator", function() {
      var ensurePersistentSelection, textForMarker;
      textForMarker = function(marker) {
        return editor.getTextInBufferRange(marker.getBufferRange());
      };
      ensurePersistentSelection = function(options) {
        var markers, text;
        markers = vimState.persistentSelection.getMarkers();
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
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g m': 'vim-mode-plus:create-persistent-selection'
          }
        });
        set({
          text: "ooo xxx ooo\nxxx ooo xxx\n\nooo xxx ooo\nxxx ooo xxx\n\nooo xxx ooo\nxxx ooo xxx\n",
          cursor: [0, 0]
        });
        return expect(vimState.persistentSelection.hasMarkers()).toBe(false);
      });
      describe("basic behavior", function() {
        describe("create-persistent-selection", function() {
          return it("create-persistent-selection create range marker", function() {
            keystroke('g m i w');
            ensurePersistentSelection({
              length: 1,
              text: ['ooo']
            });
            keystroke('j .');
            return ensurePersistentSelection({
              length: 2,
              text: ['ooo', 'xxx']
            });
          });
        });
        return describe("[No behavior diff currently] inner-persistent-selection and a-persistent-selection", function() {
          return it("apply operator to across all persistent-selections", function() {
            keystroke('g m i w j . 2 j g m i p');
            ensurePersistentSelection({
              length: 3,
              text: ['ooo', 'xxx', "ooo xxx ooo\nxxx ooo xxx\n"]
            });
            return ensure('g U a r', {
              text: "OOO xxx ooo\nXXX ooo xxx\n\nOOO XXX OOO\nXXX OOO XXX\n\nooo xxx ooo\nxxx ooo xxx\n"
            });
          });
        });
      });
      describe("select-occurrence-in-a-persistent-selection", function() {
        var update;
        update = [][0];
        beforeEach(function() {
          return vimState.persistentSelection.markerLayer.onDidUpdate(update = jasmine.createSpy());
        });
        return it("select all instance of cursor word only within marked range", function() {
          runs(function() {
            var paragraphText;
            keystroke('g m i p } } j .');
            paragraphText = "ooo xxx ooo\nxxx ooo xxx\n";
            return ensurePersistentSelection({
              length: 2,
              text: [paragraphText, paragraphText]
            });
          });
          waitsFor(function() {
            return update.callCount === 1;
          });
          return runs(function() {
            ensure('g cmd-d', {
              selectedText: ['ooo', 'ooo', 'ooo', 'ooo', 'ooo', 'ooo']
            });
            keystroke('c');
            editor.insertText('!!!');
            return ensure({
              text: "!!! xxx !!!\nxxx !!! xxx\n\nooo xxx ooo\nxxx ooo xxx\n\n!!! xxx !!!\nxxx !!! xxx\n"
            });
          });
        });
      });
      describe("clearPersistentSelections command", function() {
        return it("clear persistentSelections", function() {
          keystroke('g m i w');
          ensurePersistentSelection({
            length: 1,
            text: ['ooo']
          });
          dispatch(editorElement, 'vim-mode-plus:clear-persistent-selection');
          return expect(vimState.persistentSelection.hasMarkers()).toBe(false);
        });
      });
      return describe("clearPersistentSelectionOnResetNormalMode", function() {
        describe("default setting", function() {
          return it("it won't clear persistentSelection", function() {
            keystroke('g m i w');
            ensurePersistentSelection({
              length: 1,
              text: ['ooo']
            });
            dispatch(editorElement, 'vim-mode-plus:reset-normal-mode');
            return ensurePersistentSelection({
              length: 1,
              text: ['ooo']
            });
          });
        });
        return describe("when enabled", function() {
          return it("it clear persistentSelection on reset-normal-mode", function() {
            settings.set('clearPersistentSelectionOnResetNormalMode', true);
            keystroke('g m i w');
            ensurePersistentSelection({
              length: 1,
              text: ['ooo']
            });
            dispatch(editorElement, 'vim-mode-plus:reset-normal-mode');
            return expect(vimState.persistentSelection.hasMarkers()).toBe(false);
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvcGVyc2lzdGVudC1zZWxlY3Rpb25yLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdEQUFBOztBQUFBLEVBQUEsT0FBNkMsT0FBQSxDQUFRLGVBQVIsQ0FBN0MsRUFBQyxtQkFBQSxXQUFELEVBQWMsZ0JBQUEsUUFBZCxFQUF3QixnQkFBQSxRQUF4QixFQUFrQyxlQUFBLE9BQWxDLENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSLENBRFgsQ0FBQTs7QUFBQSxFQUdBLFFBQUEsQ0FBUyxzQkFBVCxFQUFpQyxTQUFBLEdBQUE7QUFDL0IsUUFBQSw4REFBQTtBQUFBLElBQUEsUUFBNEQsRUFBNUQsRUFBQyxjQUFELEVBQU0saUJBQU4sRUFBYyxvQkFBZCxFQUF5QixpQkFBekIsRUFBaUMsd0JBQWpDLEVBQWdELG1CQUFoRCxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsSUFBUixHQUFBO0FBQ1YsUUFBQSxRQUFBLEdBQVcsS0FBWCxDQUFBO0FBQUEsUUFDQyxrQkFBQSxNQUFELEVBQVMseUJBQUEsYUFEVCxDQUFBO2VBRUMsV0FBQSxHQUFELEVBQU0sY0FBQSxNQUFOLEVBQWMsaUJBQUEsU0FBZCxFQUEyQixLQUhqQjtNQUFBLENBQVosQ0FBQSxDQUFBO2FBSUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtlQUNILE9BQU8sQ0FBQyxXQUFSLENBQW9CLGFBQXBCLEVBREc7TUFBQSxDQUFMLEVBTFM7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBVUEsU0FBQSxDQUFVLFNBQUEsR0FBQTthQUNSLFFBQVEsQ0FBQyxlQUFULENBQUEs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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/spec/persistent-selectionr-spec.coffee
