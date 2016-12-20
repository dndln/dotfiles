(function() {
  var Disposable, Point, Range, SelectionWrapper, getRangeByTranslatePointAndClip, propertyStore, swrap, translatePointAndClip, _, _ref, _ref1;

  _ = require('underscore-plus');

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point, Disposable = _ref.Disposable;

  _ref1 = require('./utils'), translatePointAndClip = _ref1.translatePointAndClip, getRangeByTranslatePointAndClip = _ref1.getRangeByTranslatePointAndClip;

  propertyStore = new Map;

  SelectionWrapper = (function() {
    function SelectionWrapper(selection) {
      this.selection = selection;
    }

    SelectionWrapper.prototype.hasProperties = function() {
      return propertyStore.has(this.selection);
    };

    SelectionWrapper.prototype.getProperties = function() {
      var _ref2;
      return (_ref2 = propertyStore.get(this.selection)) != null ? _ref2 : {};
    };

    SelectionWrapper.prototype.setProperties = function(prop) {
      return propertyStore.set(this.selection, prop);
    };

    SelectionWrapper.prototype.clearProperties = function() {
      return propertyStore["delete"](this.selection);
    };

    SelectionWrapper.prototype.setBufferRangeSafely = function(range) {
      if (range) {
        this.setBufferRange(range);
        if (this.selection.isLastSelection()) {
          return this.selection.cursor.autoscroll();
        }
      }
    };

    SelectionWrapper.prototype.getBufferRange = function() {
      return this.selection.getBufferRange();
    };

    SelectionWrapper.prototype.getNormalizedBufferPosition = function() {
      var editor, point, screenPoint;
      point = this.selection.getHeadBufferPosition();
      if (this.isForwarding()) {
        editor = this.selection.editor;
        screenPoint = editor.screenPositionForBufferPosition(point).translate([0, -1]);
        return editor.bufferPositionForScreenPosition(screenPoint, {
          clipDirection: 'backward'
        });
      } else {
        return point;
      }
    };

    SelectionWrapper.prototype.normalizeBufferPosition = function() {
      var head, point;
      head = this.selection.getHeadBufferPosition();
      point = this.getNormalizedBufferPosition();
      this.selection.modifySelection((function(_this) {
        return function() {
          return _this.selection.cursor.setBufferPosition(point);
        };
      })(this));
      return new Disposable((function(_this) {
        return function() {
          if (!head.isEqual(point)) {
            return _this.selection.modifySelection(function() {
              return _this.selection.cursor.setBufferPosition(head);
            });
          }
        };
      })(this));
    };

    SelectionWrapper.prototype.getBufferPositionFor = function(which, _arg) {
      var allowFallback, end, fromProperty, head, start, tail, _ref2, _ref3, _ref4, _ref5, _ref6;
      _ref2 = _arg != null ? _arg : {}, fromProperty = _ref2.fromProperty, allowFallback = _ref2.allowFallback;
      if (fromProperty == null) {
        fromProperty = false;
      }
      if (allowFallback == null) {
        allowFallback = false;
      }
      if (fromProperty && (!this.hasProperties()) && allowFallback) {
        fromProperty = false;
      }
      if (fromProperty) {
        _ref3 = this.getProperties(), head = _ref3.head, tail = _ref3.tail;
        if (head.isGreaterThanOrEqual(tail)) {
          _ref4 = [tail, head], start = _ref4[0], end = _ref4[1];
        } else {
          _ref5 = [head, tail], start = _ref5[0], end = _ref5[1];
        }
      } else {
        _ref6 = this.selection.getBufferRange(), start = _ref6.start, end = _ref6.end;
        head = this.selection.getHeadBufferPosition();
        tail = this.selection.getTailBufferPosition();
      }
      switch (which) {
        case 'start':
          return start;
        case 'end':
          return end;
        case 'head':
          return head;
        case 'tail':
          return tail;
      }
    };

    SelectionWrapper.prototype.setBufferPositionTo = function(which, options) {
      var point;
      point = this.getBufferPositionFor(which, options);
      return this.selection.cursor.setBufferPosition(point);
    };

    SelectionWrapper.prototype.mergeBufferRange = function(range, option) {
      return this.setBufferRange(this.getBufferRange().union(range), option);
    };

    SelectionWrapper.prototype.reverse = function() {
      var head, tail, _ref2;
      this.setReversedState(!this.selection.isReversed());
      _ref2 = this.getProperties(), head = _ref2.head, tail = _ref2.tail;
      if ((head != null) && (tail != null)) {
        return this.setProperties({
          head: tail,
          tail: head
        });
      }
    };

    SelectionWrapper.prototype.setReversedState = function(reversed) {
      var options;
      options = {
        autoscroll: true,
        reversed: reversed,
        preserveFolds: true
      };
      return this.setBufferRange(this.getBufferRange(), options);
    };

    SelectionWrapper.prototype.getRows = function() {
      var endRow, startRow, _i, _ref2, _results;
      _ref2 = this.selection.getBufferRowRange(), startRow = _ref2[0], endRow = _ref2[1];
      return (function() {
        _results = [];
        for (var _i = startRow; startRow <= endRow ? _i <= endRow : _i >= endRow; startRow <= endRow ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this);
    };

    SelectionWrapper.prototype.getRowCount = function() {
      return this.getRows().length;
    };

    SelectionWrapper.prototype.selectRowRange = function(rowRange) {
      var editor, endRange, range, startRange, _ref2;
      editor = this.selection.editor;
      _ref2 = rowRange.map(function(row) {
        return editor.bufferRangeForBufferRow(row, {
          includeNewline: true
        });
      }), startRange = _ref2[0], endRange = _ref2[1];
      range = startRange.union(endRange);
      return this.setBufferRange(range, {
        preserveFolds: true
      });
    };

    SelectionWrapper.prototype.expandOverLine = function(_arg) {
      var goalColumn, preserveGoalColumn;
      preserveGoalColumn = (_arg != null ? _arg : {}).preserveGoalColumn;
      if (preserveGoalColumn) {
        goalColumn = this.selection.cursor.goalColumn;
      }
      this.selectRowRange(this.selection.getBufferRowRange());
      if (goalColumn) {
        return this.selection.cursor.goalColumn = goalColumn;
      }
    };

    SelectionWrapper.prototype.getRowFor = function(where) {
      var endRow, headRow, startRow, tailRow, _ref2, _ref3, _ref4;
      _ref2 = this.selection.getBufferRowRange(), startRow = _ref2[0], endRow = _ref2[1];
      if (!this.selection.isReversed()) {
        _ref3 = [startRow, endRow], headRow = _ref3[0], tailRow = _ref3[1];
      } else {
        _ref4 = [endRow, startRow], headRow = _ref4[0], tailRow = _ref4[1];
      }
      switch (where) {
        case 'start':
          return startRow;
        case 'end':
          return endRow;
        case 'head':
          return headRow;
        case 'tail':
          return tailRow;
      }
    };

    SelectionWrapper.prototype.getHeadRow = function() {
      return this.getRowFor('head');
    };

    SelectionWrapper.prototype.getTailRow = function() {
      return this.getRowFor('tail');
    };

    SelectionWrapper.prototype.getStartRow = function() {
      return this.getRowFor('start');
    };

    SelectionWrapper.prototype.getEndRow = function() {
      return this.getRowFor('end');
    };

    SelectionWrapper.prototype.getTailBufferRange = function() {
      var editor, point, tailPoint;
      editor = this.selection.editor;
      tailPoint = this.selection.getTailBufferPosition();
      if (this.selection.isReversed()) {
        point = translatePointAndClip(editor, tailPoint, 'backward');
        return new Range(point, tailPoint);
      } else {
        point = translatePointAndClip(editor, tailPoint, 'forward', {
          hello: 'when getting tailRange'
        });
        return new Range(tailPoint, point);
      }
    };

    SelectionWrapper.prototype.saveProperties = function() {
      var endPoint, properties;
      properties = this.captureProperties();
      if (!this.selection.isEmpty()) {
        endPoint = this.selection.getBufferRange().end.translate([0, -1]);
        endPoint = this.selection.editor.clipBufferPosition(endPoint);
        if (this.selection.isReversed()) {
          properties.tail = endPoint;
        } else {
          properties.head = endPoint;
        }
      }
      return this.setProperties(properties);
    };

    SelectionWrapper.prototype.captureProperties = function() {
      return {
        head: this.selection.getHeadBufferPosition(),
        tail: this.selection.getTailBufferPosition()
      };
    };

    SelectionWrapper.prototype.selectByProperties = function(_arg) {
      var head, tail;
      head = _arg.head, tail = _arg.tail;
      this.setBufferRange([tail, head]);
      return this.setReversedState(head.isLessThan(tail));
    };

    SelectionWrapper.prototype.isForwarding = function() {
      var head, tail;
      head = this.selection.getHeadBufferPosition();
      tail = this.selection.getTailBufferPosition();
      return head.isGreaterThan(tail);
    };

    SelectionWrapper.prototype.restoreColumnFromProperties = function() {
      var end, head, start, tail, _ref2, _ref3, _ref4, _ref5;
      _ref2 = this.getProperties(), head = _ref2.head, tail = _ref2.tail;
      if (!((head != null) && (tail != null))) {
        return;
      }
      if (this.selection.isEmpty()) {
        return;
      }
      if (this.selection.isReversed()) {
        _ref3 = [head, tail], start = _ref3[0], end = _ref3[1];
      } else {
        _ref4 = [tail, head], start = _ref4[0], end = _ref4[1];
      }
      _ref5 = this.selection.getBufferRowRange(), start.row = _ref5[0], end.row = _ref5[1];
      return this.withKeepingGoalColumn((function(_this) {
        return function() {
          _this.setBufferRange([start, end], {
            preserveFolds: true
          });
          return _this.translateSelectionEndAndClip('backward', {
            translate: false
          });
        };
      })(this));
    };

    SelectionWrapper.prototype.setBufferRange = function(range, options) {
      if (options == null) {
        options = {};
      }
      if (options.autoscroll == null) {
        options.autoscroll = false;
      }
      return this.selection.setBufferRange(range, options);
    };

    SelectionWrapper.prototype.replace = function(text) {
      var originalText;
      originalText = this.selection.getText();
      this.selection.insertText(text);
      return originalText;
    };

    SelectionWrapper.prototype.lineTextForBufferRows = function() {
      var editor;
      editor = this.selection.editor;
      return this.getRows().map(function(row) {
        return editor.lineTextForBufferRow(row);
      });
    };

    SelectionWrapper.prototype.translate = function(startDelta, endDelta, options) {
      var newRange;
      if (endDelta == null) {
        endDelta = startDelta;
      }
      newRange = this.getBufferRange().translate(startDelta, endDelta);
      return this.setBufferRange(newRange, options);
    };

    SelectionWrapper.prototype.isSingleRow = function() {
      var endRow, startRow, _ref2;
      _ref2 = this.selection.getBufferRowRange(), startRow = _ref2[0], endRow = _ref2[1];
      return startRow === endRow;
    };

    SelectionWrapper.prototype.isLinewise = function() {
      var end, start, _ref2, _ref3;
      _ref2 = this.getBufferRange(), start = _ref2.start, end = _ref2.end;
      return (start.row !== end.row) && ((start.column === (_ref3 = end.column) && _ref3 === 0));
    };

    SelectionWrapper.prototype.detectVisualModeSubmode = function() {
      if (this.selection.isEmpty()) {
        return null;
      } else if (this.isLinewise()) {
        return 'linewise';
      } else {
        return 'characterwise';
      }
    };

    SelectionWrapper.prototype.withKeepingGoalColumn = function(fn) {
      var end, goalColumn, start, _ref2;
      goalColumn = this.selection.cursor.goalColumn;
      _ref2 = this.getBufferRange(), start = _ref2.start, end = _ref2.end;
      fn();
      if (goalColumn) {
        return this.selection.cursor.goalColumn = goalColumn;
      }
    };

    SelectionWrapper.prototype.translateSelectionEndAndClip = function(direction, options) {
      var editor, newRange, range;
      editor = this.selection.editor;
      range = this.getBufferRange();
      newRange = getRangeByTranslatePointAndClip(editor, range, "end", direction, options);
      return this.withKeepingGoalColumn((function(_this) {
        return function() {
          return _this.setBufferRange(newRange, {
            preserveFolds: true
          });
        };
      })(this));
    };

    SelectionWrapper.prototype.translateSelectionHeadAndClip = function(direction, options) {
      var editor, newRange, range, which;
      editor = this.selection.editor;
      which = this.selection.isReversed() ? 'start' : 'end';
      range = this.getBufferRange();
      newRange = getRangeByTranslatePointAndClip(editor, range, which, direction, options);
      return this.withKeepingGoalColumn((function(_this) {
        return function() {
          return _this.setBufferRange(newRange, {
            preserveFolds: true
          });
        };
      })(this));
    };

    return SelectionWrapper;

  })();

  swrap = function(selection) {
    return new SelectionWrapper(selection);
  };

  swrap.setReversedState = function(editor, reversed) {
    return editor.getSelections().forEach(function(selection) {
      return swrap(selection).setReversedState(reversed);
    });
  };

  swrap.expandOverLine = function(editor, options) {
    return editor.getSelections().forEach(function(selection) {
      return swrap(selection).expandOverLine(options);
    });
  };

  swrap.reverse = function(editor) {
    return editor.getSelections().forEach(function(selection) {
      return swrap(selection).reverse();
    });
  };

  swrap.clearProperties = function(editor) {
    return editor.getSelections().forEach(function(selection) {
      return swrap(selection).clearProperties();
    });
  };

  swrap.detectVisualModeSubmode = function(editor) {
    var results, selection, selections;
    selections = editor.getSelections();
    results = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = selections.length; _i < _len; _i++) {
        selection = selections[_i];
        _results.push(swrap(selection).detectVisualModeSubmode());
      }
      return _results;
    })();
    if (results.every(function(r) {
      return r === 'linewise';
    })) {
      return 'linewise';
    } else if (results.some(function(r) {
      return r === 'characterwise';
    })) {
      return 'characterwise';
    } else {
      return null;
    }
  };

  swrap.updateSelectionProperties = function(editor, _arg) {
    var selection, unknownOnly, _i, _len, _ref2, _results;
    unknownOnly = (_arg != null ? _arg : {}).unknownOnly;
    _ref2 = editor.getSelections();
    _results = [];
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      selection = _ref2[_i];
      if (unknownOnly && swrap(selection).hasProperties()) {
        continue;
      }
      _results.push(swrap(selection).saveProperties());
    }
    return _results;
  };

  module.exports = swrap;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9zZWxlY3Rpb24td3JhcHBlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0lBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLE9BQTZCLE9BQUEsQ0FBUSxNQUFSLENBQTdCLEVBQUMsYUFBQSxLQUFELEVBQVEsYUFBQSxLQUFSLEVBQWUsa0JBQUEsVUFEZixDQUFBOztBQUFBLEVBRUEsUUFHSSxPQUFBLENBQVEsU0FBUixDQUhKLEVBQ0UsOEJBQUEscUJBREYsRUFFRSx3Q0FBQSwrQkFKRixDQUFBOztBQUFBLEVBT0EsYUFBQSxHQUFnQixHQUFBLENBQUEsR0FQaEIsQ0FBQTs7QUFBQSxFQVNNO0FBQ1MsSUFBQSwwQkFBRSxTQUFGLEdBQUE7QUFBYyxNQUFiLElBQUMsQ0FBQSxZQUFBLFNBQVksQ0FBZDtJQUFBLENBQWI7O0FBQUEsK0JBRUEsYUFBQSxHQUFlLFNBQUEsR0FBQTthQUFHLGFBQWEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxTQUFuQixFQUFIO0lBQUEsQ0FGZixDQUFBOztBQUFBLCtCQUdBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFBRyxVQUFBLEtBQUE7MkVBQWdDLEdBQW5DO0lBQUEsQ0FIZixDQUFBOztBQUFBLCtCQUlBLGFBQUEsR0FBZSxTQUFDLElBQUQsR0FBQTthQUFVLGFBQWEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxTQUFuQixFQUE4QixJQUE5QixFQUFWO0lBQUEsQ0FKZixDQUFBOztBQUFBLCtCQUtBLGVBQUEsR0FBaUIsU0FBQSxHQUFBO2FBQUcsYUFBYSxDQUFDLFFBQUQsQ0FBYixDQUFxQixJQUFDLENBQUEsU0FBdEIsRUFBSDtJ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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/selection-wrapper.coffee
