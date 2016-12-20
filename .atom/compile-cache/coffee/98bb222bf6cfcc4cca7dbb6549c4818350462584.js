(function() {
  var BlockwiseSelection, Range, getBufferRows, sortRanges, swrap, _, _ref;

  Range = require('atom').Range;

  _ = require('underscore-plus');

  _ref = require('./utils'), sortRanges = _ref.sortRanges, getBufferRows = _ref.getBufferRows;

  swrap = require('./selection-wrapper');

  BlockwiseSelection = (function() {
    BlockwiseSelection.prototype.editor = null;

    BlockwiseSelection.prototype.selections = null;

    BlockwiseSelection.prototype.goalColumn = null;

    BlockwiseSelection.prototype.reversed = false;

    function BlockwiseSelection(selection) {
      this.editor = selection.editor;
      this.initialize(selection);
    }

    BlockwiseSelection.prototype.getSelections = function() {
      return this.selections;
    };

    BlockwiseSelection.prototype.isBlockwise = function() {
      return true;
    };

    BlockwiseSelection.prototype.isEmpty = function() {
      return this.getSelections().every(function(selection) {
        return selection.isEmpty();
      });
    };

    BlockwiseSelection.prototype.initialize = function(selection) {
      var end, range, ranges, reversed, start, wasReversed, _i, _j, _len, _ref1, _ref2, _results;
      this.goalColumn = selection.cursor.goalColumn;
      this.selections = [selection];
      wasReversed = reversed = selection.isReversed();
      range = selection.getBufferRange();
      if (range.end.column === 0) {
        range.end.row = range.end.row - 1;
      }
      if (this.goalColumn != null) {
        if (wasReversed) {
          range.start.column = this.goalColumn;
        } else {
          range.end.column = this.goalColumn + 1;
        }
      }
      if (range.start.column >= range.end.column) {
        reversed = !reversed;
        range = range.translate([0, 1], [0, -1]);
      }
      start = range.start, end = range.end;
      ranges = (function() {
        _results = [];
        for (var _i = _ref1 = start.row, _ref2 = end.row; _ref1 <= _ref2 ? _i <= _ref2 : _i >= _ref2; _ref1 <= _ref2 ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this).map(function(row) {
        return [[row, start.column], [row, end.column]];
      });
      selection.setBufferRange(ranges.shift(), {
        reversed: reversed
      });
      for (_j = 0, _len = ranges.length; _j < _len; _j++) {
        range = ranges[_j];
        this.selections.push(this.editor.addSelectionForBufferRange(range, {
          reversed: reversed
        }));
      }
      if (wasReversed) {
        this.reverse();
      }
      return this.updateGoalColumn();
    };

    BlockwiseSelection.prototype.isReversed = function() {
      return this.reversed;
    };

    BlockwiseSelection.prototype.reverse = function() {
      return this.reversed = !this.reversed;
    };

    BlockwiseSelection.prototype.updateGoalColumn = function() {
      var selection, _i, _len, _ref1, _results;
      if (this.goalColumn != null) {
        _ref1 = this.selections;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          selection = _ref1[_i];
          _results.push(selection.cursor.goalColumn = this.goalColumn);
        }
        return _results;
      }
    };

    BlockwiseSelection.prototype.isSingleRow = function() {
      return this.selections.length === 1;
    };

    BlockwiseSelection.prototype.getHeight = function() {
      var endRow, startRow, _ref1;
      _ref1 = this.getBufferRowRange(), startRow = _ref1[0], endRow = _ref1[1];
      return (endRow - startRow) + 1;
    };

    BlockwiseSelection.prototype.getStartSelection = function() {
      return this.selections[0];
    };

    BlockwiseSelection.prototype.getEndSelection = function() {
      return _.last(this.selections);
    };

    BlockwiseSelection.prototype.getHeadSelection = function() {
      if (this.isReversed()) {
        return this.getStartSelection();
      } else {
        return this.getEndSelection();
      }
    };

    BlockwiseSelection.prototype.getTailSelection = function() {
      if (this.isReversed()) {
        return this.getEndSelection();
      } else {
        return this.getStartSelection();
      }
    };

    BlockwiseSelection.prototype.getHeadBufferPosition = function() {
      return this.getHeadSelection().getHeadBufferPosition();
    };

    BlockwiseSelection.prototype.getTailBufferPosition = function() {
      return this.getTailSelection().getTailBufferPosition();
    };

    BlockwiseSelection.prototype.getStartBufferPosition = function() {
      return this.getStartSelection().getBufferRange().start;
    };

    BlockwiseSelection.prototype.getEndBufferPosition = function() {
      return this.getStartSelection().getBufferRange().end;
    };

    BlockwiseSelection.prototype.getBufferRowRange = function() {
      var endRow, startRow;
      startRow = this.getStartSelection().getBufferRowRange()[0];
      endRow = this.getEndSelection().getBufferRowRange()[0];
      return [startRow, endRow];
    };

    BlockwiseSelection.prototype.headReversedStateIsInSync = function() {
      return this.isReversed() === this.getHeadSelection().isReversed();
    };

    BlockwiseSelection.prototype.setSelectedBufferRanges = function(ranges, _arg) {
      var range, reversed, _i, _len;
      reversed = _arg.reversed;
      sortRanges(ranges);
      range = ranges.shift();
      this.setHeadBufferRange(range, {
        reversed: reversed
      });
      for (_i = 0, _len = ranges.length; _i < _len; _i++) {
        range = ranges[_i];
        this.selections.push(this.editor.addSelectionForBufferRange(range, {
          reversed: reversed
        }));
      }
      return this.updateGoalColumn();
    };

    BlockwiseSelection.prototype.sortSelections = function() {
      var _ref1;
      return (_ref1 = this.selections) != null ? _ref1.sort(function(a, b) {
        return a.compare(b);
      }) : void 0;
    };

    BlockwiseSelection.prototype.setPositionForSelections = function(which) {
      var selection, _i, _len, _ref1, _results;
      _ref1 = this.selections;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        selection = _ref1[_i];
        _results.push(swrap(selection).setBufferPositionTo(which));
      }
      return _results;
    };

    BlockwiseSelection.prototype.clearSelections = function(_arg) {
      var except, selection, _i, _len, _ref1, _results;
      except = (_arg != null ? _arg : {}).except;
      _ref1 = this.selections.slice();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        selection = _ref1[_i];
        if (selection !== except) {
          _results.push(this.removeSelection(selection));
        }
      }
      return _results;
    };

    BlockwiseSelection.prototype.setHeadBufferPosition = function(point) {
      var head;
      head = this.getHeadSelection();
      this.clearSelections({
        except: head
      });
      return head.cursor.setBufferPosition(point);
    };

    BlockwiseSelection.prototype.removeEmptySelections = function() {
      var selection, _i, _len, _ref1, _results;
      _ref1 = this.selections.slice();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        selection = _ref1[_i];
        if (selection.isEmpty()) {
          _results.push(this.removeSelection(selection));
        }
      }
      return _results;
    };

    BlockwiseSelection.prototype.removeSelection = function(selection) {
      _.remove(this.selections, selection);
      return selection.destroy();
    };

    BlockwiseSelection.prototype.setHeadBufferRange = function(range, options) {
      var goalColumn, head, _base;
      head = this.getHeadSelection();
      this.clearSelections({
        except: head
      });
      goalColumn = head.cursor.goalColumn;
      head.setBufferRange(range, options);
      if (goalColumn != null) {
        return (_base = head.cursor).goalColumn != null ? _base.goalColumn : _base.goalColumn = goalColumn;
      }
    };

    BlockwiseSelection.prototype.getCharacterwiseProperties = function() {
      var end, head, start, tail, _ref1, _ref2;
      head = this.getHeadBufferPosition();
      tail = this.getTailBufferPosition();
      if (this.isReversed()) {
        _ref1 = [head, tail], start = _ref1[0], end = _ref1[1];
      } else {
        _ref2 = [tail, head], start = _ref2[0], end = _ref2[1];
      }
      if (!(this.isSingleRow() || this.headReversedStateIsInSync())) {
        start.column -= 1;
        end.column += 1;
      }
      return {
        head: head,
        tail: tail
      };
    };

    BlockwiseSelection.prototype.getBufferRange = function() {
      var end, start;
      if (this.headReversedStateIsInSync()) {
        start = this.getStartSelection.getBufferrange().start;
        end = this.getEndSelection.getBufferrange().end;
      } else {
        start = this.getStartSelection.getBufferrange().end.translate([0, -1]);
        end = this.getEndSelection.getBufferrange().start.translate([0, +1]);
      }
      return {
        start: start,
        end: end
      };
    };

    BlockwiseSelection.prototype.restoreCharacterwise = function() {
      var goalColumn, head, properties, _base;
      if (this.isEmpty()) {
        return;
      }
      properties = this.getCharacterwiseProperties();
      head = this.getHeadSelection();
      this.clearSelections({
        except: head
      });
      goalColumn = head.cursor.goalColumn;
      swrap(head).selectByProperties(properties);
      if (head.getBufferRange().end.column === 0) {
        swrap(head).translateSelectionEndAndClip('forward');
      }
      if (goalColumn != null) {
        return (_base = head.cursor).goalColumn != null ? _base.goalColumn : _base.goalColumn = goalColumn;
      }
    };

    return BlockwiseSelection;

  })();

  module.exports = BlockwiseSelection;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9ibG9ja3dpc2Utc2VsZWN0aW9uLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxvRUFBQTs7QUFBQSxFQUFDLFFBQVMsT0FBQSxDQUFRLE1BQVIsRUFBVCxLQUFELENBQUE7O0FBQUEsRUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBREosQ0FBQTs7QUFBQSxFQUdBLE9BQThCLE9BQUEsQ0FBUSxTQUFSLENBQTlCLEVBQUMsa0JBQUEsVUFBRCxFQUFhLHFCQUFBLGFBSGIsQ0FBQTs7QUFBQSxFQUlBLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVIsQ0FKUixDQUFBOztBQUFBLEVBTU07QUFDSixpQ0FBQSxNQUFBLEdBQVEsSUFBUixDQUFBOztBQUFBLGlDQUNBLFVBQUEsR0FBWSxJQURaLENBQUE7O0FBQUEsaUNBRUEsVUFBQSxHQUFZLElBRlosQ0FBQTs7QUFBQSxpQ0FHQSxRQUFBLEdBQVUsS0FIVixDQUFBOztBQUthLElBQUEsNEJBQUMsU0FBRCxHQUFBO0FBQ1gsTUFBQyxJQUFDLENBQUEsU0FBVSxVQUFWLE1BQUYsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFVBQUQsQ0FBWSxTQUFaLENBREEsQ0FEVztJQUFBLENBTGI7O0FBQUEsaUNBU0EsYUFBQSxHQUFlLFNBQUEsR0FBQTthQUNiLElBQUMsQ0FBQSxXQURZO0lBQUEsQ0FUZixDQUFBOztBQUFBLGlDQVlBLFdBQUEsR0FBYSxTQUFBLEdBQUE7YUFDWCxLQURXO0lBQUEsQ0FaYixDQUFBOztBQUFBLGlDQWVBLE9BQUEsR0FBUyxTQUFBLEdBQUE7YUFDUCxJQUFDLENBQUEsYUFBRCxDQUFBLENBQWdCLENBQUMsS0FBakIsQ0FBdUIsU0FBQyxTQUFELEdBQUE7ZUFDckIs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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/blockwise-selection.coffee
