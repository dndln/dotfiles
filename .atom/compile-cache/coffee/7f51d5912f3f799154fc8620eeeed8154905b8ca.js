(function() {
  var ActivateNormalModeOnce, Base, BlockwiseOtherEnd, MiscCommand, Range, Redo, ReplaceModeBackspace, ReverseSelections, Scroll, ScrollCursor, ScrollCursorToBottom, ScrollCursorToBottomLeave, ScrollCursorToLeft, ScrollCursorToMiddle, ScrollCursorToMiddleLeave, ScrollCursorToRight, ScrollCursorToTop, ScrollCursorToTopLeave, ScrollDown, ScrollUp, ToggleFold, Undo, highlightRanges, mergeIntersectingRanges, moveCursorRight, pointIsAtEndOfLine, settings, swrap, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Range = require('atom').Range;

  Base = require('./base');

  swrap = require('./selection-wrapper');

  settings = require('./settings');

  _ = require('underscore-plus');

  moveCursorRight = require('./utils').moveCursorRight;

  _ref = require('./utils'), pointIsAtEndOfLine = _ref.pointIsAtEndOfLine, mergeIntersectingRanges = _ref.mergeIntersectingRanges, highlightRanges = _ref.highlightRanges;

  MiscCommand = (function(_super) {
    __extends(MiscCommand, _super);

    MiscCommand.extend(false);

    function MiscCommand() {
      MiscCommand.__super__.constructor.apply(this, arguments);
      this.initialize();
    }

    return MiscCommand;

  })(Base);

  ReverseSelections = (function(_super) {
    __extends(ReverseSelections, _super);

    function ReverseSelections() {
      return ReverseSelections.__super__.constructor.apply(this, arguments);
    }

    ReverseSelections.extend();

    ReverseSelections.prototype.execute = function() {
      var reversed, selection, _i, _len, _ref1, _results;
      reversed = this.editor.getLastSelection().isReversed();
      _ref1 = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        selection = _ref1[_i];
        if (selection.isReversed() === reversed) {
          _results.push(swrap(selection).reverse());
        }
      }
      return _results;
    };

    return ReverseSelections;

  })(MiscCommand);

  BlockwiseOtherEnd = (function(_super) {
    __extends(BlockwiseOtherEnd, _super);

    function BlockwiseOtherEnd() {
      return BlockwiseOtherEnd.__super__.constructor.apply(this, arguments);
    }

    BlockwiseOtherEnd.extend();

    BlockwiseOtherEnd.prototype.execute = function() {
      var bs, _i, _len, _ref1;
      _ref1 = this.getBlockwiseSelections();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        bs = _ref1[_i];
        bs.reverse();
      }
      return BlockwiseOtherEnd.__super__.execute.apply(this, arguments);
    };

    return BlockwiseOtherEnd;

  })(ReverseSelections);

  Undo = (function(_super) {
    __extends(Undo, _super);

    function Undo() {
      return Undo.__super__.constructor.apply(this, arguments);
    }

    Undo.extend();

    Undo.prototype.saveRangeAsMarker = function(markers, range) {
      if (_.all(markers, function(m) {
        return !m.getBufferRange().intersectsWith(range);
      })) {
        return markers.push(this.editor.markBufferRange(range));
      }
    };

    Undo.prototype.trimEndOfLineRange = function(range) {
      var start;
      start = range.start;
      if ((start.column !== 0) && pointIsAtEndOfLine(this.editor, start)) {
        return range.traverse([+1, 0], [0, 0]);
      } else {
        return range;
      }
    };

    Undo.prototype.mapToChangedRanges = function(list, fn) {
      var ranges;
      ranges = list.map(function(e) {
        return fn(e);
      });
      return mergeIntersectingRanges(ranges).map((function(_this) {
        return function(r) {
          return _this.trimEndOfLineRange(r);
        };
      })(this));
    };

    Undo.prototype.mutateWithTrackingChanges = function(fn) {
      var disposable, firstAdded, lastRemoved, markersAdded, range, rangesAdded, rangesRemoved;
      markersAdded = [];
      rangesRemoved = [];
      disposable = this.editor.getBuffer().onDidChange((function(_this) {
        return function(_arg) {
          var newRange, oldRange;
          oldRange = _arg.oldRange, newRange = _arg.newRange;
          if (!oldRange.isEmpty()) {
            rangesRemoved.push(oldRange);
          }
          if (!newRange.isEmpty()) {
            return _this.saveRangeAsMarker(markersAdded, newRange);
          }
        };
      })(this));
      this.mutate();
      disposable.dispose();
      rangesAdded = this.mapToChangedRanges(markersAdded, function(m) {
        return m.getBufferRange();
      });
      markersAdded.forEach(function(m) {
        return m.destroy();
      });
      rangesRemoved = this.mapToChangedRanges(rangesRemoved, function(r) {
        return r;
      });
      firstAdded = rangesAdded[0];
      lastRemoved = _.last(rangesRemoved);
      range = (firstAdded != null) && (lastRemoved != null) ? firstAdded.start.isLessThan(lastRemoved.start) ? firstAdded : lastRemoved : firstAdded || lastRemoved;
      if (range != null) {
        fn(range);
      }
      if (settings.get('flashOnUndoRedo')) {
        return this.onDidFinishOperation((function(_this) {
          return function() {
            var timeout;
            timeout = settings.get('flashOnUndoRedoDuration');
            highlightRanges(_this.editor, rangesRemoved, {
              "class": "vim-mode-plus-flash removed",
              timeout: timeout
            });
            return highlightRanges(_this.editor, rangesAdded, {
              "class": "vim-mode-plus-flash added",
              timeout: timeout
            });
          };
        })(this));
      }
    };

    Undo.prototype.execute = function() {
      var selection, _i, _len, _ref1;
      this.mutateWithTrackingChanges((function(_this) {
        return function(range) {
          _this.vimState.mark.setRange('[', ']', range);
          if (settings.get('setCursorToStartOfChangeOnUndoRedo')) {
            return _this.editor.setCursorBufferPosition(range.start);
          }
        };
      })(this));
      _ref1 = this.editor.getSelections();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        selection = _ref1[_i];
        selection.clear();
      }
      return this.activateMode('normal');
    };

    Undo.prototype.mutate = function() {
      return this.editor.undo();
    };

    return Undo;

  })(MiscCommand);

  Redo = (function(_super) {
    __extends(Redo, _super);

    function Redo() {
      return Redo.__super__.constructor.apply(this, arguments);
    }

    Redo.extend();

    Redo.prototype.mutate = function() {
      return this.editor.redo();
    };

    return Redo;

  })(Undo);

  ToggleFold = (function(_super) {
    __extends(ToggleFold, _super);

    function ToggleFold() {
      return ToggleFold.__super__.constructor.apply(this, arguments);
    }

    ToggleFold.extend();

    ToggleFold.prototype.execute = function() {
      var point;
      point = this.editor.getCursorBufferPosition();
      return this.editor.toggleFoldAtBufferRow(point.row);
    };

    return ToggleFold;

  })(MiscCommand);

  ReplaceModeBackspace = (function(_super) {
    __extends(ReplaceModeBackspace, _super);

    function ReplaceModeBackspace() {
      return ReplaceModeBackspace.__super__.constructor.apply(this, arguments);
    }

    ReplaceModeBackspace.commandScope = 'atom-text-editor.vim-mode-plus.insert-mode.replace';

    ReplaceModeBackspace.extend();

    ReplaceModeBackspace.prototype.execute = function() {
      return this.editor.getSelections().forEach((function(_this) {
        return function(selection) {
          var char;
          char = _this.vimState.modeManager.getReplacedCharForSelection(selection);
          if (char != null) {
            selection.selectLeft();
            if (!selection.insertText(char).isEmpty()) {
              return selection.cursor.moveLeft();
            }
          }
        };
      })(this));
    };

    return ReplaceModeBackspace;

  })(MiscCommand);

  Scroll = (function(_super) {
    __extends(Scroll, _super);

    function Scroll() {
      return Scroll.__super__.constructor.apply(this, arguments);
    }

    Scroll.extend(false);

    Scroll.prototype.scrolloff = 2;

    Scroll.prototype.cursorPixel = null;

    Scroll.prototype.getFirstVisibleScreenRow = function() {
      return this.editorElement.getFirstVisibleScreenRow();
    };

    Scroll.prototype.getLastVisibleScreenRow = function() {
      return this.editorElement.getLastVisibleScreenRow();
    };

    Scroll.prototype.getLastScreenRow = function() {
      return this.editor.getLastScreenRow();
    };

    Scroll.prototype.getCursorPixel = function() {
      var point;
      point = this.editor.getCursorScreenPosition();
      return this.editorElement.pixelPositionForScreenPosition(point);
    };

    return Scroll;

  })(MiscCommand);

  ScrollDown = (function(_super) {
    __extends(ScrollDown, _super);

    function ScrollDown() {
      return ScrollDown.__super__.constructor.apply(this, arguments);
    }

    ScrollDown.extend();

    ScrollDown.prototype.execute = function() {
      var column, count, margin, newFirstRow, newPoint, oldFirstRow, row, _ref1;
      count = this.getCount();
      oldFirstRow = this.editor.getFirstVisibleScreenRow();
      this.editor.setFirstVisibleScreenRow(oldFirstRow + count);
      newFirstRow = this.editor.getFirstVisibleScreenRow();
      margin = this.editor.getVerticalScrollMargin();
      _ref1 = this.editor.getCursorScreenPosition(), row = _ref1.row, column = _ref1.column;
      if (row < (newFirstRow + margin)) {
        newPoint = [row + count, column];
        return this.editor.setCursorScreenPosition(newPoint, {
          autoscroll: false
        });
      }
    };

    return ScrollDown;

  })(Scroll);

  ScrollUp = (function(_super) {
    __extends(ScrollUp, _super);

    function ScrollUp() {
      return ScrollUp.__super__.constructor.apply(this, arguments);
    }

    ScrollUp.extend();

    ScrollUp.prototype.execute = function() {
      var column, count, margin, newLastRow, newPoint, oldFirstRow, row, _ref1;
      count = this.getCount();
      oldFirstRow = this.editor.getFirstVisibleScreenRow();
      this.editor.setFirstVisibleScreenRow(oldFirstRow - count);
      newLastRow = this.editor.getLastVisibleScreenRow();
      margin = this.editor.getVerticalScrollMargin();
      _ref1 = this.editor.getCursorScreenPosition(), row = _ref1.row, column = _ref1.column;
      if (row >= (newLastRow - margin)) {
        newPoint = [row - count, column];
        return this.editor.setCursorScreenPosition(newPoint, {
          autoscroll: false
        });
      }
    };

    return ScrollUp;

  })(Scroll);

  ScrollCursor = (function(_super) {
    __extends(ScrollCursor, _super);

    function ScrollCursor() {
      return ScrollCursor.__super__.constructor.apply(this, arguments);
    }

    ScrollCursor.extend(false);

    ScrollCursor.prototype.execute = function() {
      if (typeof this.moveToFirstCharacterOfLine === "function") {
        this.moveToFirstCharacterOfLine();
      }
      if (this.isScrollable()) {
        return this.editorElement.setScrollTop(this.getScrollTop());
      }
    };

    ScrollCursor.prototype.moveToFirstCharacterOfLine = function() {
      return this.editor.moveToFirstCharacterOfLine();
    };

    ScrollCursor.prototype.getOffSetPixelHeight = function(lineDelta) {
      if (lineDelta == null) {
        lineDelta = 0;
      }
      return this.editor.getLineHeightInPixels() * (this.scrolloff + lineDelta);
    };

    return ScrollCursor;

  })(Scroll);

  ScrollCursorToTop = (function(_super) {
    __extends(ScrollCursorToTop, _super);

    function ScrollCursorToTop() {
      return ScrollCursorToTop.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToTop.extend();

    ScrollCursorToTop.prototype.isScrollable = function() {
      return this.getLastVisibleScreenRow() !== this.getLastScreenRow();
    };

    ScrollCursorToTop.prototype.getScrollTop = function() {
      return this.getCursorPixel().top - this.getOffSetPixelHeight();
    };

    return ScrollCursorToTop;

  })(ScrollCursor);

  ScrollCursorToTopLeave = (function(_super) {
    __extends(ScrollCursorToTopLeave, _super);

    function ScrollCursorToTopLeave() {
      return ScrollCursorToTopLeave.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToTopLeave.extend();

    ScrollCursorToTopLeave.prototype.moveToFirstCharacterOfLine = null;

    return ScrollCursorToTopLeave;

  })(ScrollCursorToTop);

  ScrollCursorToBottom = (function(_super) {
    __extends(ScrollCursorToBottom, _super);

    function ScrollCursorToBottom() {
      return ScrollCursorToBottom.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToBottom.extend();

    ScrollCursorToBottom.prototype.isScrollable = function() {
      return this.getFirstVisibleScreenRow() !== 0;
    };

    ScrollCursorToBottom.prototype.getScrollTop = function() {
      return this.getCursorPixel().top - (this.editorElement.getHeight() - this.getOffSetPixelHeight(1));
    };

    return ScrollCursorToBottom;

  })(ScrollCursor);

  ScrollCursorToBottomLeave = (function(_super) {
    __extends(ScrollCursorToBottomLeave, _super);

    function ScrollCursorToBottomLeave() {
      return ScrollCursorToBottomLeave.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToBottomLeave.extend();

    ScrollCursorToBottomLeave.prototype.moveToFirstCharacterOfLine = null;

    return ScrollCursorToBottomLeave;

  })(ScrollCursorToBottom);

  ScrollCursorToMiddle = (function(_super) {
    __extends(ScrollCursorToMiddle, _super);

    function ScrollCursorToMiddle() {
      return ScrollCursorToMiddle.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToMiddle.extend();

    ScrollCursorToMiddle.prototype.isScrollable = function() {
      return true;
    };

    ScrollCursorToMiddle.prototype.getScrollTop = function() {
      return this.getCursorPixel().top - (this.editorElement.getHeight() / 2);
    };

    return ScrollCursorToMiddle;

  })(ScrollCursor);

  ScrollCursorToMiddleLeave = (function(_super) {
    __extends(ScrollCursorToMiddleLeave, _super);

    function ScrollCursorToMiddleLeave() {
      return ScrollCursorToMiddleLeave.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToMiddleLeave.extend();

    ScrollCursorToMiddleLeave.prototype.moveToFirstCharacterOfLine = null;

    return ScrollCursorToMiddleLeave;

  })(ScrollCursorToMiddle);

  ScrollCursorToLeft = (function(_super) {
    __extends(ScrollCursorToLeft, _super);

    function ScrollCursorToLeft() {
      return ScrollCursorToLeft.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToLeft.extend();

    ScrollCursorToLeft.prototype.execute = function() {
      return this.editorElement.setScrollLeft(this.getCursorPixel().left);
    };

    return ScrollCursorToLeft;

  })(Scroll);

  ScrollCursorToRight = (function(_super) {
    __extends(ScrollCursorToRight, _super);

    function ScrollCursorToRight() {
      return ScrollCursorToRight.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToRight.extend();

    ScrollCursorToRight.prototype.execute = function() {
      return this.editorElement.setScrollRight(this.getCursorPixel().left);
    };

    return ScrollCursorToRight;

  })(ScrollCursorToLeft);

  ActivateNormalModeOnce = (function(_super) {
    __extends(ActivateNormalModeOnce, _super);

    function ActivateNormalModeOnce() {
      return ActivateNormalModeOnce.__super__.constructor.apply(this, arguments);
    }

    ActivateNormalModeOnce.extend();

    ActivateNormalModeOnce.commandScope = 'atom-text-editor.vim-mode-plus.insert-mode';

    ActivateNormalModeOnce.prototype.thisCommandName = ActivateNormalModeOnce.getCommandName();

    ActivateNormalModeOnce.prototype.execute = function() {
      var cursor, cursorsToMoveRight, disposable, _i, _len;
      cursorsToMoveRight = this.editor.getCursors().filter(function(cursor) {
        return !cursor.isAtBeginningOfLine();
      });
      this.vimState.activate('normal');
      for (_i = 0, _len = cursorsToMoveRight.length; _i < _len; _i++) {
        cursor = cursorsToMoveRight[_i];
        moveCursorRight(cursor);
      }
      return disposable = atom.commands.onDidDispatch((function(_this) {
        return function(_arg) {
          var type;
          type = _arg.type;
          if (type === _this.thisCommandName) {
            return;
          }
          disposable.dispose();
          disposable = null;
          return _this.vimState.activate('insert');
        };
      })(this));
    };

    return ActivateNormalModeOnce;

  })(MiscCommand);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9taXNjLWNvbW1hbmQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtjQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxRQUFTLE9BQUEsQ0FBUSxNQUFSLEVBQVQsS0FBRCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVBLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVIsQ0FGUixDQUFBOztBQUFBLEVBR0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBSFgsQ0FBQTs7QUFBQSxFQUlBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FKSixDQUFBOztBQUFBLEVBS0Msa0JBQW1CLE9BQUEsQ0FBUSxTQUFSLEVBQW5CLGVBTEQsQ0FBQTs7QUFBQSxFQU9BLE9BSUksT0FBQSxDQUFRLFNBQVIsQ0FKSixFQUNFLDBCQUFBLGtCQURGLEVBRUUsK0JBQUEsdUJBRkYsRUFHRSx1QkFBQSxlQVZGLENBQUE7O0FBQUEsRUFhTTtBQUNKLGtDQUFBLENBQUE7O0FBQUEsSUFBQSxXQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUNhLElBQUEscUJBQUEsR0FBQTtBQUNYLE1BQUEsOENBQUEsU0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FEQSxDQURXO0lBQUEsQ0FEYjs7dUJBQUE7O0tBRHdCLEtBYjFCLENBQUE7O0FBQUEsRUFtQk07QUFDSix3Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxpQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsZ0NBQ0EsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUVQLFVBQUEsOENB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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/misc-command.coffee
