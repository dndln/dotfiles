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
      if (!swrap(selection).isSingleRow()) {
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
      if (end.column === 0) {
        end.row += 1;
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
