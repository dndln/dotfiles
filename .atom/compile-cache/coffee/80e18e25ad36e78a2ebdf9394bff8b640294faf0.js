(function() {
  var CursorPositionManager, Point, swrap;

  Point = require('atom').Point;

  swrap = require('./selection-wrapper');

  module.exports = CursorPositionManager = (function() {
    CursorPositionManager.prototype.editor = null;

    CursorPositionManager.prototype.pointsBySelection = null;

    function CursorPositionManager(editor) {
      this.editor = editor;
      this.pointsBySelection = new Map;
    }

    CursorPositionManager.prototype.save = function(which, options) {
      var point, selection, useMarker, _i, _len, _ref, _ref1, _results;
      if (options == null) {
        options = {};
      }
      useMarker = (_ref = options.useMarker) != null ? _ref : false;
      delete options.useMarker;
      _ref1 = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        selection = _ref1[_i];
        point = swrap(selection).getBufferPositionFor(which, options);
        if (useMarker) {
          point = this.editor.markBufferPosition(point, {
            invalidate: 'never'
          });
        }
        _results.push(this.pointsBySelection.set(selection, point));
      }
      return _results;
    };

    CursorPositionManager.prototype.updateBy = function(fn) {
      return this.pointsBySelection.forEach((function(_this) {
        return function(point, selection) {
          return _this.pointsBySelection.set(selection, fn(selection, point));
        };
      })(this));
    };

    CursorPositionManager.prototype.restore = function(_arg) {
      var marker, point, selection, selectionNotFound, selections, strict, _i, _len;
      strict = (_arg != null ? _arg : {}).strict;
      if (strict == null) {
        strict = true;
      }
      selections = this.editor.getSelections();
      selectionNotFound = (function(_this) {
        return function(selection) {
          return !_this.pointsBySelection.has(selection);
        };
      })(this);
      if (strict && selections.some(selectionNotFound)) {
        return;
      }
      for (_i = 0, _len = selections.length; _i < _len; _i++) {
        selection = selections[_i];
        if (point = this.pointsBySelection.get(selection)) {
          if (!(point instanceof Point)) {
            marker = point;
            point = marker.getHeadBufferPosition();
            marker.destroy();
          }
          selection.cursor.setBufferPosition(point);
        } else {
          selection.destroy();
        }
      }
      return this.destroy();
    };

    CursorPositionManager.prototype.getPointForSelection = function(selection) {
      var marker, point;
      point = null;
      if (point = this.pointsBySelection.get(selection)) {
        if (!(point instanceof Point)) {
          marker = point;
          point = marker.getHeadBufferPosition();
          marker.destroy();
        }
      }
      return point;
    };

    CursorPositionManager.prototype.destroy = function() {
      var _ref;
      this.pointsBySelection.forEach(function(point) {
        if (!(point instanceof Point)) {
          return point.destroy();
        }
      });
      this.pointsBySelection.clear();
      return _ref = [], this.pointsBySelection = _ref[0], this.editor = _ref[1], _ref;
    };

    return CursorPositionManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9jdXJzb3ItcG9zaXRpb24tbWFuYWdlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsbUNBQUE7O0FBQUEsRUFBQyxRQUFTLE9BQUEsQ0FBUSxNQUFSLEVBQVQsS0FBRCxDQUFBOztBQUFBLEVBQ0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUixDQURSLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osb0NBQUEsTUFBQSxHQUFRLElBQVIsQ0FBQTs7QUFBQSxvQ0FDQSxpQkFBQSxHQUFtQixJQURuQixDQUFBOztBQUVhLElBQUEsK0JBQUUsTUFBRixHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsU0FBQSxNQUNiLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxpQkFBRCxHQUFxQixHQUFBLENBQUEsR0FBckIsQ0FEVztJQUFBLENBRmI7O0FBQUEsb0NBS0EsSUFBQSxHQUFNLFNBQUMsS0FBRCxFQUFRLE9BQVIsR0FBQTtBQUNKLFVBQUEsNERBQUE7O1FBRFksVUFBUTtPQUNwQjtBQUFBLE1BQUEsU0FBQSwrQ0FBZ0MsS0FBaEMsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxDQUFBLE9BQWMsQ0FBQyxTQURmLENBQUE7QUFHQTtBQUFBO1dBQUEsNENBQUE7OEJBQUE7QUFDRSxRQUFBLEtBQUEsR0FBUSxLQUFBLENBQU0sU0FBTixDQUFnQixDQUFDLG9CQUFqQixDQUFzQyxLQUF0QyxFQUE2QyxPQUE3QyxDQUFSLENBQUE7QUFDQSxRQUFBLElBQUcsU0FBSDtBQUNFLFVBQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsa0JBQVIsQ0FBMkIsS0FBM0IsRUFBa0M7QUFBQSxZQUFBLFVBQUEsRUFBWSxPQUFaO1dBQWxDLENBQVIsQ0FERjtTQURBO0FBQUEsc0JBR0EsSUFBQyxDQUFBLGlCQUFpQixDQUFDLEdBQW5CLENBQXVCLFNBQXZCLEVBQWtDLEtBQWxDLEVBSEEsQ0FERjtBQUFBO3NCQUpJO0lBQUEsQ0FMTixDQUFBOztBQUFBLG9DQWVBLFFBQUEsR0FBVSxTQUFDLEVBQUQsR0FBQTthQUNSLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxPQUFuQixDQUEyQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxLQUFELEVBQVEsU0FBUixHQUFBO2lCQUN6QixLQUFDLENBQUEsaUJBQWlCLENBQUMsR0FBbkIsQ0FBdUIsU0FBdkIsRUFBa0MsRUFBQSxDQUFHLFNBQUgsRUFBYyxLQUFkLENBQWxDLEVBRHlCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBM0IsRUFEUTtJQUFBLENBZlYsQ0FBQTs7QUFBQSxvQ0FtQkEsT0FBQSxHQUFTLFNBQUMsSUFBRCxHQUFBO0FBQ1AsVUFBQSx5RUFBQTtBQUFBLE1BRFMseUJBQUQsT0FBUyxJQUFSLE1BQ1QsQ0FBQTs7UUFBQSxTQUFVO09BQVY7QUFBQSxNQUNBLFVBQUEsR0FBYSxJQUFDLENBQUEsTUFBTSxDQUFDLGFBQVIsQ0FBQSxDQURiLENBQUE7QUFBQSxNQU1BLGlCQUFBLEdBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLFNBQUQsR0FBQTtpQkFBZSxDQUFBLEtBQUssQ0FBQSxpQkFBaUIsQ0FBQyxHQUFuQixDQUF1QixTQUF2QixFQUFuQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBTnBCLENBQUE7QUFPQSxNQUFBLElBQVUsTUFBQSxJQUFXLFVBQVUsQ0FBQyxJQUFYLENBQWdCLGlCQUFoQixDQUFyQjtBQUFBLGNBQUEsQ0FBQTtPQVBBO0FBU0EsV0FBQSxpREFBQTttQ0FBQTtBQUNFLFFBQUEsSUFBRyxLQUFBLEdBQVEsSUFBQyxDQUFBLGlCQUFpQixDQUFDLEdBQW5CLENBQXVCLFNBQXZCLENBQVg7QUFDRSxVQUFBLElBQUEsQ0FBQSxDQUFPLEtBQUEsWUFBaUIsS0FBeEIsQ0FBQTtBQUNFLFlBQUEsTUFBQSxHQUFTLEtBQVQsQ0FBQTtBQUFBLFlBQ0EsS0FBQSxHQUFRLE1BQU0sQ0FBQyxxQkFBUCxDQUFBLENBRFIsQ0FBQTtBQUFBLFlBRUEsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUZBLENBREY7V0FBQTtBQUFBLFVBSUEsU0FBUyxDQUFDLE1BQU0sQ0FBQyxpQkFBakIsQ0FBbUMsS0FBbkMsQ0FKQSxDQURGO1NBQUEsTUFBQTtBQVFFLFVBQUEsU0FBUyxDQUFDLE9BQVYsQ0FBQSxDQUFBLENBUkY7U0FERjtBQUFBLE9BVEE7YUFvQkEsSUFBQyxDQUFBLE9BQUQsQ0FBQSxFQXJCTztJQUFBLENBbkJULENBQUE7O0FBQUEsb0NBMENBLG9CQUFBLEdBQXNCLFNBQUMsU0FBRCxHQUFBO0FBQ3BCLFVBQUEsYUFBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLElBQVIsQ0FBQTtBQUNBLE1BQUEsSUFBRyxLQUFBLEdBQVEsSUFBQyxDQUFBLGlCQUFpQixDQUFDLEdBQW5CLENBQXVCLFNBQXZCLENBQVg7QUFDRSxRQUFBLElBQUEsQ0FBQSxDQUFPLEtBQUEsWUFBaUIsS0FBeEIsQ0FBQTtBQUNFLFVBQUEsTUFBQSxHQUFTLEtBQVQsQ0FBQTtBQUFBLFVBQ0EsS0FBQSxHQUFRLE1BQU0sQ0FBQyxxQkFBUCxDQUFBLENBRFIsQ0FBQTtBQUFBLFVBRUEsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUZBLENBREY7U0FERjtPQURBO2FBTUEsTUFQb0I7SUFBQSxDQTFDdEIsQ0FBQTs7QUFBQSxvQ0FtREEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLFVBQUEsSUFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLGlCQUFpQixDQUFDLE9BQW5CLENBQTJCLFNBQUMsS0FBRCxHQUFBO0FBQ3pCLFFBQUEsSUFBQSxDQUFBLENBQXVCLEtBQUEsWUFBaUIsS0FBeEMsQ0FBQTtpQkFBQSxLQUFLLENBQUMsT0FBTixDQUFBLEVBQUE7U0FEeUI7TUFBQSxDQUEzQixDQUFBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxLQUFuQixDQUFBLENBSEEsQ0FBQTthQUlBLE9BQWdDLEVBQWhDLEVBQUMsSUFBQyxDQUFBLDJCQUFGLEVBQXFCLElBQUMsQ0FBQSxnQkFBdEIsRUFBQSxLQUxPO0lBQUEsQ0FuRFQsQ0FBQTs7aUNBQUE7O01BTEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/cursor-position-manager.coffee
