(function() {
  var Base, CurrentSelection, Find, FindBackwards, Motion, MoveDown, MoveDownScreen, MoveDownToEdge, MoveLeft, MoveRight, MoveRightBufferColumn, MoveToBeginningOfLine, MoveToBottomOfScreen, MoveToColumn, MoveToEndOfAlphanumericWord, MoveToEndOfSmartWord, MoveToEndOfWholeWord, MoveToEndOfWord, MoveToFirstCharacterOfLine, MoveToFirstCharacterOfLineAndDown, MoveToFirstCharacterOfLineDown, MoveToFirstCharacterOfLineUp, MoveToFirstLine, MoveToLastCharacterOfLine, MoveToLastLine, MoveToLastNonblankCharacterOfLineAndDown, MoveToLineByPercent, MoveToMark, MoveToMarkLine, MoveToMiddleOfScreen, MoveToNextAlphanumericWord, MoveToNextFoldEnd, MoveToNextFoldStart, MoveToNextFoldStartWithSameIndent, MoveToNextFunction, MoveToNextNumber, MoveToNextParagraph, MoveToNextSentence, MoveToNextSentenceSkipBlankRow, MoveToNextSmartWord, MoveToNextString, MoveToNextWholeWord, MoveToNextWord, MoveToPair, MoveToPositionByScope, MoveToPreviousAlphanumericWord, MoveToPreviousEndOfWholeWord, MoveToPreviousEndOfWord, MoveToPreviousFoldEnd, MoveToPreviousFoldStart, MoveToPreviousFoldStartWithSameIndent, MoveToPreviousFunction, MoveToPreviousNumber, MoveToPreviousParagraph, MoveToPreviousSentence, MoveToPreviousSentenceSkipBlankRow, MoveToPreviousSmartWord, MoveToPreviousString, MoveToPreviousWholeWord, MoveToPreviousWord, MoveToRelativeLine, MoveToRelativeLineWithMinimum, MoveToTopOfScreen, MoveUp, MoveUpScreen, MoveUpToEdge, Point, Range, ScrollFullScreenDown, ScrollFullScreenUp, ScrollHalfScreenDown, ScrollHalfScreenUp, Select, Till, TillBackwards, cursorIsAtEmptyRow, cursorIsAtEndOfLineAtNonEmptyRow, cursorIsAtVimEndOfFile, cursorIsOnWhiteSpace, debug, detectScopeStartPositionForScope, getBufferRows, getCodeFoldRowRanges, getFirstCharacterBufferPositionForScreenRow, getFirstCharacterColumForBufferRow, getFirstCharacterPositionForBufferRow, getFirstVisibleScreenRow, getIndentLevelForBufferRow, getLargestFoldRangeContainsBufferRow, getLastVisibleScreenRow, getStartPositionForPattern, getValidVimBufferRow, getValidVimScreenRow, getVisibleBufferRange, highlightRanges, isIncludeFunctionScopeForRow, moveCursorDownBuffer, moveCursorDownScreen, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUpBuffer, moveCursorUpScreen, saveEditorState, screenPositionIsAtWhiteSpace, settings, sortRanges, swrap, _, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  _ref = require('atom'), Point = _ref.Point, Range = _ref.Range;

  Select = null;

  _ref1 = require('./utils'), saveEditorState = _ref1.saveEditorState, getVisibleBufferRange = _ref1.getVisibleBufferRange, moveCursorLeft = _ref1.moveCursorLeft, moveCursorRight = _ref1.moveCursorRight, moveCursorUpScreen = _ref1.moveCursorUpScreen, moveCursorDownScreen = _ref1.moveCursorDownScreen, moveCursorDownBuffer = _ref1.moveCursorDownBuffer, moveCursorUpBuffer = _ref1.moveCursorUpBuffer, cursorIsAtVimEndOfFile = _ref1.cursorIsAtVimEndOfFile, getFirstVisibleScreenRow = _ref1.getFirstVisibleScreenRow, getLastVisibleScreenRow = _ref1.getLastVisibleScreenRow, getValidVimScreenRow = _ref1.getValidVimScreenRow, getValidVimBufferRow = _ref1.getValidVimBufferRow, highlightRanges = _ref1.highlightRanges, moveCursorToFirstCharacterAtRow = _ref1.moveCursorToFirstCharacterAtRow, sortRanges = _ref1.sortRanges, getIndentLevelForBufferRow = _ref1.getIndentLevelForBufferRow, cursorIsOnWhiteSpace = _ref1.cursorIsOnWhiteSpace, moveCursorToNextNonWhitespace = _ref1.moveCursorToNextNonWhitespace, cursorIsAtEmptyRow = _ref1.cursorIsAtEmptyRow, getCodeFoldRowRanges = _ref1.getCodeFoldRowRanges, getLargestFoldRangeContainsBufferRow = _ref1.getLargestFoldRangeContainsBufferRow, isIncludeFunctionScopeForRow = _ref1.isIncludeFunctionScopeForRow, detectScopeStartPositionForScope = _ref1.detectScopeStartPositionForScope, getBufferRows = _ref1.getBufferRows, getStartPositionForPattern = _ref1.getStartPositionForPattern, getFirstCharacterPositionForBufferRow = _ref1.getFirstCharacterPositionForBufferRow, getFirstCharacterBufferPositionForScreenRow = _ref1.getFirstCharacterBufferPositionForScreenRow, screenPositionIsAtWhiteSpace = _ref1.screenPositionIsAtWhiteSpace, cursorIsAtEndOfLineAtNonEmptyRow = _ref1.cursorIsAtEndOfLineAtNonEmptyRow, getFirstCharacterColumForBufferRow = _ref1.getFirstCharacterColumForBufferRow, debug = _ref1.debug;

  swrap = require('./selection-wrapper');

  settings = require('./settings');

  Base = require('./base');

  Motion = (function(_super) {
    __extends(Motion, _super);

    Motion.extend(false);

    Motion.prototype.inclusive = false;

    Motion.prototype.wise = 'characterwise';

    Motion.prototype.jump = false;

    function Motion() {
      Motion.__super__.constructor.apply(this, arguments);
      if (this.isMode('visual')) {
        this.inclusive = true;
        this.wise = this.vimState.submode;
      }
      this.initialize();
    }

    Motion.prototype.isInclusive = function() {
      return this.inclusive;
    };

    Motion.prototype.isJump = function() {
      return this.jump;
    };

    Motion.prototype.isCharacterwise = function() {
      return this.wise === 'characterwise';
    };

    Motion.prototype.isLinewise = function() {
      return this.wise === 'linewise';
    };

    Motion.prototype.isBlockwise = function() {
      return this.wise === 'blockwise';
    };

    Motion.prototype.forceWise = function(wise) {
      if (wise === 'characterwise') {
        if (this.wise === 'linewise') {
          this.inclusive = false;
        } else {
          this.inclusive = !this.inclusive;
        }
      }
      return this.wise = wise;
    };

    Motion.prototype.setBufferPositionSafely = function(cursor, point) {
      if (point != null) {
        return cursor.setBufferPosition(point);
      }
    };

    Motion.prototype.setScreenPositionSafely = function(cursor, point) {
      if (point != null) {
        return cursor.setScreenPosition(point);
      }
    };

    Motion.prototype.moveWithSaveJump = function(cursor) {
      var cursorPosition;
      if (cursor.isLastCursor() && this.isJump()) {
        cursorPosition = cursor.getBufferPosition();
      }
      this.moveCursor(cursor);
      if ((cursorPosition != null) && !cursorPosition.isEqual(cursor.getBufferPosition())) {
        this.vimState.mark.set('`', cursorPosition);
        return this.vimState.mark.set("'", cursorPosition);
      }
    };

    Motion.prototype.execute = function() {
      return this.editor.moveCursors((function(_this) {
        return function(cursor) {
          return _this.moveWithSaveJump(cursor);
        };
      })(this));
    };

    Motion.prototype.select = function() {
      var selection, _i, _len, _ref2;
      if (this.isMode('visual')) {
        this.vimState.modeManager.normalizeSelections();
      }
      _ref2 = this.editor.getSelections();
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        selection = _ref2[_i];
        this.selectByMotion(selection);
      }
      this.editor.mergeCursors();
      this.editor.mergeIntersectingSelections();
      if (this.isMode('visual')) {
        this.updateSelectionProperties();
      }
      switch (this.wise) {
        case 'linewise':
          return this.vimState.selectLinewise();
        case 'blockwise':
          return this.vimState.selectBlockwise();
      }
    };

    Motion.prototype.selectByMotion = function(selection) {
      var cursor;
      cursor = selection.cursor;
      selection.modifySelection((function(_this) {
        return function() {
          return _this.moveWithSaveJump(cursor);
        };
      })(this));
      if (!this.isMode('visual') && selection.isEmpty()) {
        return;
      }
      if (!(this.isInclusive() || this.isLinewise())) {
        return;
      }
      if (this.isMode('visual') && cursorIsAtEndOfLineAtNonEmptyRow(cursor)) {
        swrap(selection).translateSelectionHeadAndClip('backward');
      }
      return swrap(selection).translateSelectionEndAndClip('forward');
    };

    return Motion;

  })(Base);

  CurrentSelection = (function(_super) {
    __extends(CurrentSelection, _super);

    function CurrentSelection() {
      return CurrentSelection.__super__.constructor.apply(this, arguments);
    }

    CurrentSelection.extend(false);

    CurrentSelection.prototype.selectionExtent = null;

    CurrentSelection.prototype.inclusive = true;

    CurrentSelection.prototype.initialize = function() {
      CurrentSelection.__super__.initialize.apply(this, arguments);
      return this.pointInfoByCursor = new Map;
    };

    CurrentSelection.prototype.execute = function() {
      throw new Error("" + (this.getName()) + " should not be executed");
    };

    CurrentSelection.prototype.moveCursor = function(cursor) {
      var end, head, point, start, tail, _ref2, _ref3;
      if (this.isMode('visual')) {
        if (this.isBlockwise()) {
          _ref2 = cursor.selection.getBufferRange(), start = _ref2.start, end = _ref2.end;
          _ref3 = cursor.selection.isReversed() ? [start, end] : [end, start], head = _ref3[0], tail = _ref3[1];
          return this.selectionExtent = new Point(head.row - tail.row, head.column - tail.column);
        } else {
          return this.selectionExtent = this.editor.getSelectedBufferRange().getExtent();
        }
      } else {
        point = cursor.getBufferPosition();
        if (this.isBlockwise()) {
          return cursor.setBufferPosition(point.translate(this.selectionExtent));
        } else {
          return cursor.setBufferPosition(point.traverse(this.selectionExtent));
        }
      }
    };

    CurrentSelection.prototype.select = function() {
      var atEOL, cursor, cursorPosition, pointInfo, startOfSelection, _i, _j, _len, _len1, _ref2, _ref3, _results;
      if (this.isMode('visual')) {
        CurrentSelection.__super__.select.apply(this, arguments);
      } else {
        _ref2 = this.editor.getCursors();
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          cursor = _ref2[_i];
          if (!(pointInfo = this.pointInfoByCursor.get(cursor))) {
            continue;
          }
          cursorPosition = pointInfo.cursorPosition, startOfSelection = pointInfo.startOfSelection, atEOL = pointInfo.atEOL;
          if (atEOL || cursorPosition.isEqual(cursor.getBufferPosition())) {
            cursor.setBufferPosition(startOfSelection);
          }
        }
        CurrentSelection.__super__.select.apply(this, arguments);
      }
      _ref3 = this.editor.getCursors();
      _results = [];
      for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
        cursor = _ref3[_j];
        startOfSelection = cursor.selection.getBufferRange().start;
        _results.push(this.onDidFinishOperation((function(_this) {
          return function() {
            cursorPosition = cursor.getBufferPosition();
            atEOL = cursor.isAtEndOfLine();
            return _this.pointInfoByCursor.set(cursor, {
              startOfSelection: startOfSelection,
              cursorPosition: cursorPosition,
              atEOL: atEOL
            });
          };
        })(this)));
      }
      return _results;
    };

    return CurrentSelection;

  })(Motion);

  MoveLeft = (function(_super) {
    __extends(MoveLeft, _super);

    function MoveLeft() {
      return MoveLeft.__super__.constructor.apply(this, arguments);
    }

    MoveLeft.extend();

    MoveLeft.prototype.moveCursor = function(cursor) {
      var allowWrap;
      allowWrap = settings.get('wrapLeftRightMotion');
      return this.countTimes(function() {
        return moveCursorLeft(cursor, {
          allowWrap: allowWrap
        });
      });
    };

    return MoveLeft;

  })(Motion);

  MoveRight = (function(_super) {
    __extends(MoveRight, _super);

    function MoveRight() {
      return MoveRight.__super__.constructor.apply(this, arguments);
    }

    MoveRight.extend();

    MoveRight.prototype.canWrapToNextLine = function(cursor) {
      if (this.isAsOperatorTarget() && !cursor.isAtEndOfLine()) {
        return false;
      } else {
        return settings.get('wrapLeftRightMotion');
      }
    };

    MoveRight.prototype.moveCursor = function(cursor) {
      return this.countTimes((function(_this) {
        return function() {
          var allowWrap;
          _this.editor.unfoldBufferRow(cursor.getBufferRow());
          allowWrap = _this.canWrapToNextLine(cursor);
          moveCursorRight(cursor);
          if (cursor.isAtEndOfLine() && allowWrap && !cursorIsAtVimEndOfFile(cursor)) {
            return moveCursorRight(cursor, {
              allowWrap: allowWrap
            });
          }
        };
      })(this));
    };

    return MoveRight;

  })(Motion);

  MoveRightBufferColumn = (function(_super) {
    __extends(MoveRightBufferColumn, _super);

    function MoveRightBufferColumn() {
      return MoveRightBufferColumn.__super__.constructor.apply(this, arguments);
    }

    MoveRightBufferColumn.extend(true);

    MoveRightBufferColumn.prototype.moveCursor = function(cursor) {
      var newPoint;
      newPoint = cursor.getBufferPosition().translate([0, this.getCount()]);
      return cursor.setBufferPosition(newPoint);
    };

    return MoveRightBufferColumn;

  })(Motion);

  MoveUp = (function(_super) {
    __extends(MoveUp, _super);

    function MoveUp() {
      return MoveUp.__super__.constructor.apply(this, arguments);
    }

    MoveUp.extend();

    MoveUp.prototype.wise = 'linewise';

    MoveUp.prototype.getPoint = function(cursor) {
      var row;
      row = this.getRow(cursor.getBufferRow());
      return new Point(row, cursor.goalColumn);
    };

    MoveUp.prototype.getRow = function(row) {
      row = Math.max(row - 1, 0);
      if (this.editor.isFoldedAtBufferRow(row)) {
        row = getLargestFoldRangeContainsBufferRow(this.editor, row).start.row;
      }
      return row;
    };

    MoveUp.prototype.moveCursor = function(cursor) {
      return this.countTimes((function(_this) {
        return function() {
          var goalColumn;
          if (cursor.goalColumn == null) {
            cursor.goalColumn = cursor.getBufferColumn();
          }
          goalColumn = cursor.goalColumn;
          cursor.setBufferPosition(_this.getPoint(cursor));
          return cursor.goalColumn = goalColumn;
        };
      })(this));
    };

    return MoveUp;

  })(Motion);

  MoveDown = (function(_super) {
    __extends(MoveDown, _super);

    function MoveDown() {
      return MoveDown.__super__.constructor.apply(this, arguments);
    }

    MoveDown.extend();

    MoveDown.prototype.wise = 'linewise';

    MoveDown.prototype.getRow = function(row) {
      if (this.editor.isFoldedAtBufferRow(row)) {
        row = getLargestFoldRangeContainsBufferRow(this.editor, row).end.row;
      }
      return Math.min(row + 1, this.getVimLastBufferRow());
    };

    return MoveDown;

  })(MoveUp);

  MoveUpScreen = (function(_super) {
    __extends(MoveUpScreen, _super);

    function MoveUpScreen() {
      return MoveUpScreen.__super__.constructor.apply(this, arguments);
    }

    MoveUpScreen.extend();

    MoveUpScreen.prototype.wise = 'linewise';

    MoveUpScreen.prototype.direction = 'up';

    MoveUpScreen.prototype.moveCursor = function(cursor) {
      return this.countTimes(function() {
        return moveCursorUpScreen(cursor);
      });
    };

    return MoveUpScreen;

  })(Motion);

  MoveDownScreen = (function(_super) {
    __extends(MoveDownScreen, _super);

    function MoveDownScreen() {
      return MoveDownScreen.__super__.constructor.apply(this, arguments);
    }

    MoveDownScreen.extend();

    MoveDownScreen.prototype.wise = 'linewise';

    MoveDownScreen.prototype.direction = 'down';

    MoveDownScreen.prototype.moveCursor = function(cursor) {
      return this.countTimes(function() {
        return moveCursorDownScreen(cursor);
      });
    };

    return MoveDownScreen;

  })(MoveUpScreen);

  MoveUpToEdge = (function(_super) {
    __extends(MoveUpToEdge, _super);

    function MoveUpToEdge() {
      return MoveUpToEdge.__super__.constructor.apply(this, arguments);
    }

    MoveUpToEdge.extend();

    MoveUpToEdge.prototype.wise = 'linewise';

    MoveUpToEdge.prototype.jump = true;

    MoveUpToEdge.prototype.direction = 'up';

    MoveUpToEdge.description = "Move cursor up to **edge** char at same-column";

    MoveUpToEdge.prototype.moveCursor = function(cursor) {
      var point;
      point = cursor.getScreenPosition();
      this.countTimes((function(_this) {
        return function(_arg) {
          var newPoint, stop;
          stop = _arg.stop;
          if ((newPoint = _this.getPoint(point))) {
            return point = newPoint;
          } else {
            return stop();
          }
        };
      })(this));
      return this.setScreenPositionSafely(cursor, point);
    };

    MoveUpToEdge.prototype.getPoint = function(fromPoint) {
      var column, point, row, _i, _len, _ref2;
      column = fromPoint.column;
      _ref2 = this.getScanRows(fromPoint);
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        row = _ref2[_i];
        if (point = new Point(row, column)) {
          if (this.isEdge(point)) {
            return point;
          }
        }
      }
    };

    MoveUpToEdge.prototype.getScanRows = function(_arg) {
      var row, validRow, _i, _j, _ref2, _ref3, _ref4, _results, _results1;
      row = _arg.row;
      validRow = getValidVimScreenRow.bind(null, this.editor);
      switch (this.direction) {
        case 'up':
          return (function() {
            _results = [];
            for (var _i = _ref2 = validRow(row - 1); _ref2 <= 0 ? _i <= 0 : _i >= 0; _ref2 <= 0 ? _i++ : _i--){ _results.push(_i); }
            return _results;
          }).apply(this);
        case 'down':
          return (function() {
            _results1 = [];
            for (var _j = _ref3 = validRow(row + 1), _ref4 = this.getVimLastScreenRow(); _ref3 <= _ref4 ? _j <= _ref4 : _j >= _ref4; _ref3 <= _ref4 ? _j++ : _j--){ _results1.push(_j); }
            return _results1;
          }).apply(this);
      }
    };

    MoveUpToEdge.prototype.isEdge = function(point) {
      var above, below;
      if (this.isStoppablePoint(point)) {
        above = point.translate([-1, 0]);
        below = point.translate([+1, 0]);
        return (!this.isStoppablePoint(above)) || (!this.isStoppablePoint(below));
      } else {
        return false;
      }
    };

    MoveUpToEdge.prototype.isStoppablePoint = function(point) {
      var leftPoint, rightPoint;
      if (this.isNonWhiteSpacePoint(point)) {
        return true;
      } else {
        leftPoint = point.translate([0, -1]);
        rightPoint = point.translate([0, +1]);
        return this.isNonWhiteSpacePoint(leftPoint) && this.isNonWhiteSpacePoint(rightPoint);
      }
    };

    MoveUpToEdge.prototype.isNonWhiteSpacePoint = function(point) {
      return screenPositionIsAtWhiteSpace(this.editor, point);
    };

    return MoveUpToEdge;

  })(Motion);

  MoveDownToEdge = (function(_super) {
    __extends(MoveDownToEdge, _super);

    function MoveDownToEdge() {
      return MoveDownToEdge.__super__.constructor.apply(this, arguments);
    }

    MoveDownToEdge.extend();

    MoveDownToEdge.description = "Move cursor down to **edge** char at same-column";

    MoveDownToEdge.prototype.direction = 'down';

    return MoveDownToEdge;

  })(MoveUpToEdge);

  MoveToNextWord = (function(_super) {
    __extends(MoveToNextWord, _super);

    function MoveToNextWord() {
      return MoveToNextWord.__super__.constructor.apply(this, arguments);
    }

    MoveToNextWord.extend();

    MoveToNextWord.prototype.wordRegex = null;

    MoveToNextWord.prototype.getPoint = function(cursor) {
      var cursorPoint, found, pattern, scanRange, wordRange, _ref2, _ref3;
      cursorPoint = cursor.getBufferPosition();
      pattern = (_ref2 = this.wordRegex) != null ? _ref2 : cursor.wordRegExp();
      scanRange = [cursorPoint, this.getVimEofBufferPosition()];
      wordRange = null;
      found = false;
      this.editor.scanInBufferRange(pattern, scanRange, function(_arg) {
        var matchText, range, stop;
        range = _arg.range, matchText = _arg.matchText, stop = _arg.stop;
        wordRange = range;
        if (matchText === '' && range.start.column !== 0) {
          return;
        }
        if (range.start.isGreaterThan(cursorPoint)) {
          found = true;
          return stop();
        }
      });
      if (found) {
        return wordRange.start;
      } else {
        return (_ref3 = wordRange != null ? wordRange.end : void 0) != null ? _ref3 : cursorPoint;
      }
    };

    MoveToNextWord.prototype.moveCursor = function(cursor) {
      var wasOnWhiteSpace;
      if (cursorIsAtVimEndOfFile(cursor)) {
        return;
      }
      wasOnWhiteSpace = cursorIsOnWhiteSpace(cursor);
      return this.countTimes((function(_this) {
        return function(_arg) {
          var cursorRow, isFinal, point;
          isFinal = _arg.isFinal;
          cursorRow = cursor.getBufferRow();
          if (cursorIsAtEmptyRow(cursor) && _this.isAsOperatorTarget()) {
            point = [cursorRow + 1, 0];
          } else {
            point = _this.getPoint(cursor);
            if (isFinal && _this.isAsOperatorTarget()) {
              if (_this.getOperator().getName() === 'Change' && (!wasOnWhiteSpace)) {
                point = cursor.getEndOfCurrentWordBufferPosition({
                  wordRegex: _this.wordRegex
                });
              } else if (point.row > cursorRow) {
                point = [cursorRow, Infinity];
              }
            }
          }
          return cursor.setBufferPosition(point);
        };
      })(this));
    };

    return MoveToNextWord;

  })(Motion);

  MoveToPreviousWord = (function(_super) {
    __extends(MoveToPreviousWord, _super);

    function MoveToPreviousWord() {
      return MoveToPreviousWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousWord.extend();

    MoveToPreviousWord.prototype.wordRegex = null;

    MoveToPreviousWord.prototype.moveCursor = function(cursor) {
      return this.countTimes((function(_this) {
        return function() {
          var point;
          point = cursor.getBeginningOfCurrentWordBufferPosition({
            wordRegex: _this.wordRegex
          });
          return cursor.setBufferPosition(point);
        };
      })(this));
    };

    return MoveToPreviousWord;

  })(Motion);

  MoveToEndOfWord = (function(_super) {
    __extends(MoveToEndOfWord, _super);

    function MoveToEndOfWord() {
      return MoveToEndOfWord.__super__.constructor.apply(this, arguments);
    }

    MoveToEndOfWord.extend();

    MoveToEndOfWord.prototype.wordRegex = null;

    MoveToEndOfWord.prototype.inclusive = true;

    MoveToEndOfWord.prototype.moveToNextEndOfWord = function(cursor) {
      var point;
      moveCursorToNextNonWhitespace(cursor);
      point = cursor.getEndOfCurrentWordBufferPosition({
        wordRegex: this.wordRegex
      }).translate([0, -1]);
      point = Point.min(point, this.getVimEofBufferPosition());
      return cursor.setBufferPosition(point);
    };

    MoveToEndOfWord.prototype.moveCursor = function(cursor) {
      return this.countTimes((function(_this) {
        return function() {
          var originalPoint;
          originalPoint = cursor.getBufferPosition();
          _this.moveToNextEndOfWord(cursor);
          if (originalPoint.isEqual(cursor.getBufferPosition())) {
            cursor.moveRight();
            return _this.moveToNextEndOfWord(cursor);
          }
        };
      })(this));
    };

    return MoveToEndOfWord;

  })(Motion);

  MoveToPreviousEndOfWord = (function(_super) {
    __extends(MoveToPreviousEndOfWord, _super);

    function MoveToPreviousEndOfWord() {
      return MoveToPreviousEndOfWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousEndOfWord.extend();

    MoveToPreviousEndOfWord.prototype.inclusive = true;

    MoveToPreviousEndOfWord.prototype.moveCursor = function(cursor) {
      var cursorPosition, point, times, wordRange, _i;
      times = this.getCount();
      wordRange = cursor.getCurrentWordBufferRange();
      cursorPosition = cursor.getBufferPosition();
      if (cursorPosition.isGreaterThan(wordRange.start) && cursorPosition.isLessThan(wordRange.end)) {
        times += 1;
      }
      for (_i = 1; 1 <= times ? _i <= times : _i >= times; 1 <= times ? _i++ : _i--) {
        point = cursor.getBeginningOfCurrentWordBufferPosition({
          wordRegex: this.wordRegex
        });
        cursor.setBufferPosition(point);
      }
      this.moveToNextEndOfWord(cursor);
      if (cursor.getBufferPosition().isGreaterThanOrEqual(cursorPosition)) {
        return cursor.setBufferPosition([0, 0]);
      }
    };

    MoveToPreviousEndOfWord.prototype.moveToNextEndOfWord = function(cursor) {
      var point;
      point = cursor.getEndOfCurrentWordBufferPosition({
        wordRegex: this.wordRegex
      }).translate([0, -1]);
      point = Point.min(point, this.getVimEofBufferPosition());
      return cursor.setBufferPosition(point);
    };

    return MoveToPreviousEndOfWord;

  })(MoveToPreviousWord);

  MoveToNextWholeWord = (function(_super) {
    __extends(MoveToNextWholeWord, _super);

    function MoveToNextWholeWord() {
      return MoveToNextWholeWord.__super__.constructor.apply(this, arguments);
    }

    MoveToNextWholeWord.extend();

    MoveToNextWholeWord.prototype.wordRegex = /^\s*$|\S+/g;

    return MoveToNextWholeWord;

  })(MoveToNextWord);

  MoveToPreviousWholeWord = (function(_super) {
    __extends(MoveToPreviousWholeWord, _super);

    function MoveToPreviousWholeWord() {
      return MoveToPreviousWholeWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousWholeWord.extend();

    MoveToPreviousWholeWord.prototype.wordRegex = /^\s*$|\S+/;

    return MoveToPreviousWholeWord;

  })(MoveToPreviousWord);

  MoveToEndOfWholeWord = (function(_super) {
    __extends(MoveToEndOfWholeWord, _super);

    function MoveToEndOfWholeWord() {
      return MoveToEndOfWholeWord.__super__.constructor.apply(this, arguments);
    }

    MoveToEndOfWholeWord.extend();

    MoveToEndOfWholeWord.prototype.wordRegex = /\S+/;

    return MoveToEndOfWholeWord;

  })(MoveToEndOfWord);

  MoveToPreviousEndOfWholeWord = (function(_super) {
    __extends(MoveToPreviousEndOfWholeWord, _super);

    function MoveToPreviousEndOfWholeWord() {
      return MoveToPreviousEndOfWholeWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousEndOfWholeWord.extend();

    MoveToPreviousEndOfWholeWord.prototype.wordRegex = /\S+/;

    return MoveToPreviousEndOfWholeWord;

  })(MoveToPreviousEndOfWord);

  MoveToNextAlphanumericWord = (function(_super) {
    __extends(MoveToNextAlphanumericWord, _super);

    function MoveToNextAlphanumericWord() {
      return MoveToNextAlphanumericWord.__super__.constructor.apply(this, arguments);
    }

    MoveToNextAlphanumericWord.extend();

    MoveToNextAlphanumericWord.description = "Move to next alphanumeric(`/\w+/`) word";

    MoveToNextAlphanumericWord.prototype.wordRegex = /\w+/g;

    return MoveToNextAlphanumericWord;

  })(MoveToNextWord);

  MoveToPreviousAlphanumericWord = (function(_super) {
    __extends(MoveToPreviousAlphanumericWord, _super);

    function MoveToPreviousAlphanumericWord() {
      return MoveToPreviousAlphanumericWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousAlphanumericWord.extend();

    MoveToPreviousAlphanumericWord.description = "Move to previous alphanumeric(`/\w+/`) word";

    MoveToPreviousAlphanumericWord.prototype.wordRegex = /\w+/;

    return MoveToPreviousAlphanumericWord;

  })(MoveToPreviousWord);

  MoveToEndOfAlphanumericWord = (function(_super) {
    __extends(MoveToEndOfAlphanumericWord, _super);

    function MoveToEndOfAlphanumericWord() {
      return MoveToEndOfAlphanumericWord.__super__.constructor.apply(this, arguments);
    }

    MoveToEndOfAlphanumericWord.extend();

    MoveToEndOfAlphanumericWord.description = "Move to end of alphanumeric(`/\w+/`) word";

    MoveToEndOfAlphanumericWord.prototype.wordRegex = /\w+/;

    return MoveToEndOfAlphanumericWord;

  })(MoveToEndOfWord);

  MoveToNextSmartWord = (function(_super) {
    __extends(MoveToNextSmartWord, _super);

    function MoveToNextSmartWord() {
      return MoveToNextSmartWord.__super__.constructor.apply(this, arguments);
    }

    MoveToNextSmartWord.extend();

    MoveToNextSmartWord.description = "Move to next smart word (`/[\w-]+/`) word";

    MoveToNextSmartWord.prototype.wordRegex = /[\w-]+/g;

    return MoveToNextSmartWord;

  })(MoveToNextWord);

  MoveToPreviousSmartWord = (function(_super) {
    __extends(MoveToPreviousSmartWord, _super);

    function MoveToPreviousSmartWord() {
      return MoveToPreviousSmartWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousSmartWord.extend();

    MoveToPreviousSmartWord.description = "Move to previous smart word (`/[\w-]+/`) word";

    MoveToPreviousSmartWord.prototype.wordRegex = /[\w-]+/;

    return MoveToPreviousSmartWord;

  })(MoveToPreviousWord);

  MoveToEndOfSmartWord = (function(_super) {
    __extends(MoveToEndOfSmartWord, _super);

    function MoveToEndOfSmartWord() {
      return MoveToEndOfSmartWord.__super__.constructor.apply(this, arguments);
    }

    MoveToEndOfSmartWord.extend();

    MoveToEndOfSmartWord.description = "Move to end of smart word (`/[\w-]+/`) word";

    MoveToEndOfSmartWord.prototype.wordRegex = /[\w-]+/;

    return MoveToEndOfSmartWord;

  })(MoveToEndOfWord);

  MoveToNextSentence = (function(_super) {
    __extends(MoveToNextSentence, _super);

    function MoveToNextSentence() {
      return MoveToNextSentence.__super__.constructor.apply(this, arguments);
    }

    MoveToNextSentence.extend();

    MoveToNextSentence.prototype.jump = true;

    MoveToNextSentence.prototype.sentenceRegex = /(?:[\.!\?][\)\]"']*\s+)|(\n|\r\n)/g;

    MoveToNextSentence.prototype.direction = 'next';

    MoveToNextSentence.prototype.moveCursor = function(cursor) {
      var point;
      point = cursor.getBufferPosition();
      this.countTimes((function(_this) {
        return function() {
          return point = _this.getPoint(point);
        };
      })(this));
      return cursor.setBufferPosition(point);
    };

    MoveToNextSentence.prototype.getPoint = function(fromPoint) {
      if (this.direction === 'next') {
        return this.getNextStartOfSentence(fromPoint);
      } else if (this.direction === 'previous') {
        return this.getPreviousStartOfSentence(fromPoint);
      }
    };

    MoveToNextSentence.prototype.getFirstCharacterPositionForRow = function(row) {
      return new Point(row, getFirstCharacterColumForBufferRow(this.editor, row));
    };

    MoveToNextSentence.prototype.isBlankRow = function(row) {
      return this.editor.isBufferRowBlank(row);
    };

    MoveToNextSentence.prototype.getNextStartOfSentence = function(fromPoint) {
      var foundPoint, scanRange;
      scanRange = new Range(fromPoint, this.getVimEofBufferPosition());
      foundPoint = null;
      this.editor.scanInBufferRange(this.sentenceRegex, scanRange, (function(_this) {
        return function(_arg) {
          var endRow, match, matchText, range, startRow, stop, _ref2, _ref3;
          range = _arg.range, matchText = _arg.matchText, match = _arg.match, stop = _arg.stop;
          if (match[1] != null) {
            (_ref2 = range.start, startRow = _ref2.row), (_ref3 = range.end, endRow = _ref3.row);
            if (_this.skipBlankRow && _this.isBlankRow(endRow)) {
              return;
            }
            if (_this.isBlankRow(startRow) !== _this.isBlankRow(endRow)) {
              foundPoint = _this.getFirstCharacterPositionForRow(endRow);
            }
          } else {
            foundPoint = range.end;
          }
          if (foundPoint != null) {
            return stop();
          }
        };
      })(this));
      return foundPoint != null ? foundPoint : scanRange.end;
    };

    MoveToNextSentence.prototype.getPreviousStartOfSentence = function(fromPoint) {
      var foundPoint, scanRange;
      scanRange = new Range(fromPoint, [0, 0]);
      foundPoint = null;
      this.editor.backwardsScanInBufferRange(this.sentenceRegex, scanRange, (function(_this) {
        return function(_arg) {
          var endRow, match, matchText, point, range, startRow, stop, _ref2, _ref3;
          range = _arg.range, match = _arg.match, stop = _arg.stop, matchText = _arg.matchText;
          if (match[1] != null) {
            (_ref2 = range.start, startRow = _ref2.row), (_ref3 = range.end, endRow = _ref3.row);
            if (!_this.isBlankRow(endRow) && _this.isBlankRow(startRow)) {
              point = _this.getFirstCharacterPositionForRow(endRow);
              if (point.isLessThan(fromPoint)) {
                foundPoint = point;
              } else {
                if (_this.skipBlankRow) {
                  return;
                }
                foundPoint = _this.getFirstCharacterPositionForRow(startRow);
              }
            }
          } else {
            if (range.end.isLessThan(fromPoint)) {
              foundPoint = range.end;
            }
          }
          if (foundPoint != null) {
            return stop();
          }
        };
      })(this));
      return foundPoint != null ? foundPoint : scanRange.start;
    };

    return MoveToNextSentence;

  })(Motion);

  MoveToPreviousSentence = (function(_super) {
    __extends(MoveToPreviousSentence, _super);

    function MoveToPreviousSentence() {
      return MoveToPreviousSentence.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousSentence.extend();

    MoveToPreviousSentence.prototype.direction = 'previous';

    return MoveToPreviousSentence;

  })(MoveToNextSentence);

  MoveToNextSentenceSkipBlankRow = (function(_super) {
    __extends(MoveToNextSentenceSkipBlankRow, _super);

    function MoveToNextSentenceSkipBlankRow() {
      return MoveToNextSentenceSkipBlankRow.__super__.constructor.apply(this, arguments);
    }

    MoveToNextSentenceSkipBlankRow.extend();

    MoveToNextSentenceSkipBlankRow.prototype.skipBlankRow = true;

    return MoveToNextSentenceSkipBlankRow;

  })(MoveToNextSentence);

  MoveToPreviousSentenceSkipBlankRow = (function(_super) {
    __extends(MoveToPreviousSentenceSkipBlankRow, _super);

    function MoveToPreviousSentenceSkipBlankRow() {
      return MoveToPreviousSentenceSkipBlankRow.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousSentenceSkipBlankRow.extend();

    MoveToPreviousSentenceSkipBlankRow.prototype.skipBlankRow = true;

    return MoveToPreviousSentenceSkipBlankRow;

  })(MoveToPreviousSentence);

  MoveToNextParagraph = (function(_super) {
    __extends(MoveToNextParagraph, _super);

    function MoveToNextParagraph() {
      return MoveToNextParagraph.__super__.constructor.apply(this, arguments);
    }

    MoveToNextParagraph.extend();

    MoveToNextParagraph.prototype.jump = true;

    MoveToNextParagraph.prototype.direction = 'next';

    MoveToNextParagraph.prototype.moveCursor = function(cursor) {
      var point;
      point = cursor.getBufferPosition();
      this.countTimes((function(_this) {
        return function() {
          return point = _this.getPoint(point);
        };
      })(this));
      return cursor.setBufferPosition(point);
    };

    MoveToNextParagraph.prototype.getPoint = function(fromPoint) {
      var row, startRow, wasAtNonBlankRow, _i, _len, _ref2;
      startRow = fromPoint.row;
      wasAtNonBlankRow = !this.editor.isBufferRowBlank(startRow);
      _ref2 = getBufferRows(this.editor, {
        startRow: startRow,
        direction: this.direction
      });
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        row = _ref2[_i];
        if (this.editor.isBufferRowBlank(row)) {
          if (wasAtNonBlankRow) {
            return new Point(row, 0);
          }
        } else {
          wasAtNonBlankRow = true;
        }
      }
      switch (this.direction) {
        case 'previous':
          return new Point(0, 0);
        case 'next':
          return this.getVimEofBufferPosition();
      }
    };

    return MoveToNextParagraph;

  })(Motion);

  MoveToPreviousParagraph = (function(_super) {
    __extends(MoveToPreviousParagraph, _super);

    function MoveToPreviousParagraph() {
      return MoveToPreviousParagraph.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousParagraph.extend();

    MoveToPreviousParagraph.prototype.direction = 'previous';

    return MoveToPreviousParagraph;

  })(MoveToNextParagraph);

  MoveToBeginningOfLine = (function(_super) {
    __extends(MoveToBeginningOfLine, _super);

    function MoveToBeginningOfLine() {
      return MoveToBeginningOfLine.__super__.constructor.apply(this, arguments);
    }

    MoveToBeginningOfLine.extend();

    MoveToBeginningOfLine.prototype.getPoint = function(_arg) {
      var row;
      row = _arg.row;
      return new Point(row, 0);
    };

    MoveToBeginningOfLine.prototype.moveCursor = function(cursor) {
      var point;
      point = this.getPoint(cursor.getBufferPosition());
      return cursor.setBufferPosition(point);
    };

    return MoveToBeginningOfLine;

  })(Motion);

  MoveToColumn = (function(_super) {
    __extends(MoveToColumn, _super);

    function MoveToColumn() {
      return MoveToColumn.__super__.constructor.apply(this, arguments);
    }

    MoveToColumn.extend();

    MoveToColumn.prototype.getCount = function() {
      return MoveToColumn.__super__.getCount.apply(this, arguments) - 1;
    };

    MoveToColumn.prototype.getPoint = function(_arg) {
      var row;
      row = _arg.row;
      return new Point(row, this.getCount());
    };

    MoveToColumn.prototype.moveCursor = function(cursor) {
      var point;
      point = this.getPoint(cursor.getScreenPosition());
      return cursor.setScreenPosition(point);
    };

    return MoveToColumn;

  })(Motion);

  MoveToLastCharacterOfLine = (function(_super) {
    __extends(MoveToLastCharacterOfLine, _super);

    function MoveToLastCharacterOfLine() {
      return MoveToLastCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    MoveToLastCharacterOfLine.extend();

    MoveToLastCharacterOfLine.prototype.getCount = function() {
      return MoveToLastCharacterOfLine.__super__.getCount.apply(this, arguments) - 1;
    };

    MoveToLastCharacterOfLine.prototype.getPoint = function(_arg) {
      var row;
      row = _arg.row;
      row = getValidVimBufferRow(this.editor, row + this.getCount());
      return new Point(row, Infinity);
    };

    MoveToLastCharacterOfLine.prototype.moveCursor = function(cursor) {
      var point;
      point = this.getPoint(cursor.getBufferPosition());
      cursor.setBufferPosition(point);
      return cursor.goalColumn = Infinity;
    };

    return MoveToLastCharacterOfLine;

  })(Motion);

  MoveToLastNonblankCharacterOfLineAndDown = (function(_super) {
    __extends(MoveToLastNonblankCharacterOfLineAndDown, _super);

    function MoveToLastNonblankCharacterOfLineAndDown() {
      return MoveToLastNonblankCharacterOfLineAndDown.__super__.constructor.apply(this, arguments);
    }

    MoveToLastNonblankCharacterOfLineAndDown.extend();

    MoveToLastNonblankCharacterOfLineAndDown.prototype.inclusive = true;

    MoveToLastNonblankCharacterOfLineAndDown.prototype.getCount = function() {
      return MoveToLastNonblankCharacterOfLineAndDown.__super__.getCount.apply(this, arguments) - 1;
    };

    MoveToLastNonblankCharacterOfLineAndDown.prototype.moveCursor = function(cursor) {
      var point;
      point = this.getPoint(cursor.getBufferPosition());
      return cursor.setBufferPosition(point);
    };

    MoveToLastNonblankCharacterOfLineAndDown.prototype.getPoint = function(_arg) {
      var from, point, row;
      row = _arg.row;
      row = Math.min(row + this.getCount(), this.getVimLastBufferRow());
      from = new Point(row, Infinity);
      point = getStartPositionForPattern(this.editor, from, /\s*$/);
      return (point != null ? point : from).translate([0, -1]);
    };

    return MoveToLastNonblankCharacterOfLineAndDown;

  })(Motion);

  MoveToFirstCharacterOfLine = (function(_super) {
    __extends(MoveToFirstCharacterOfLine, _super);

    function MoveToFirstCharacterOfLine() {
      return MoveToFirstCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLine.extend();

    MoveToFirstCharacterOfLine.prototype.moveCursor = function(cursor) {
      return this.setBufferPositionSafely(cursor, this.getPoint(cursor));
    };

    MoveToFirstCharacterOfLine.prototype.getPoint = function(cursor) {
      return getFirstCharacterPositionForBufferRow(this.editor, cursor.getBufferRow());
    };

    return MoveToFirstCharacterOfLine;

  })(Motion);

  MoveToFirstCharacterOfLineUp = (function(_super) {
    __extends(MoveToFirstCharacterOfLineUp, _super);

    function MoveToFirstCharacterOfLineUp() {
      return MoveToFirstCharacterOfLineUp.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLineUp.extend();

    MoveToFirstCharacterOfLineUp.prototype.wise = 'linewise';

    MoveToFirstCharacterOfLineUp.prototype.moveCursor = function(cursor) {
      this.countTimes(function() {
        return moveCursorUpBuffer(cursor);
      });
      return MoveToFirstCharacterOfLineUp.__super__.moveCursor.apply(this, arguments);
    };

    return MoveToFirstCharacterOfLineUp;

  })(MoveToFirstCharacterOfLine);

  MoveToFirstCharacterOfLineDown = (function(_super) {
    __extends(MoveToFirstCharacterOfLineDown, _super);

    function MoveToFirstCharacterOfLineDown() {
      return MoveToFirstCharacterOfLineDown.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLineDown.extend();

    MoveToFirstCharacterOfLineDown.prototype.wise = 'linewise';

    MoveToFirstCharacterOfLineDown.prototype.moveCursor = function(cursor) {
      this.countTimes(function() {
        return moveCursorDownBuffer(cursor);
      });
      return MoveToFirstCharacterOfLineDown.__super__.moveCursor.apply(this, arguments);
    };

    return MoveToFirstCharacterOfLineDown;

  })(MoveToFirstCharacterOfLine);

  MoveToFirstCharacterOfLineAndDown = (function(_super) {
    __extends(MoveToFirstCharacterOfLineAndDown, _super);

    function MoveToFirstCharacterOfLineAndDown() {
      return MoveToFirstCharacterOfLineAndDown.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLineAndDown.extend();

    MoveToFirstCharacterOfLineAndDown.prototype.defaultCount = 0;

    MoveToFirstCharacterOfLineAndDown.prototype.getCount = function() {
      return MoveToFirstCharacterOfLineAndDown.__super__.getCount.apply(this, arguments) - 1;
    };

    return MoveToFirstCharacterOfLineAndDown;

  })(MoveToFirstCharacterOfLineDown);

  MoveToFirstLine = (function(_super) {
    __extends(MoveToFirstLine, _super);

    function MoveToFirstLine() {
      return MoveToFirstLine.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstLine.extend();

    MoveToFirstLine.prototype.wise = 'linewise';

    MoveToFirstLine.prototype.jump = true;

    MoveToFirstLine.prototype.moveCursor = function(cursor) {
      cursor.setBufferPosition(this.getPoint());
      return cursor.autoscroll({
        center: true
      });
    };

    MoveToFirstLine.prototype.getPoint = function() {
      var row;
      row = getValidVimBufferRow(this.editor, this.getRow());
      return getFirstCharacterPositionForBufferRow(this.editor, row);
    };

    MoveToFirstLine.prototype.getRow = function() {
      return this.getCount() - 1;
    };

    return MoveToFirstLine;

  })(Motion);

  MoveToLastLine = (function(_super) {
    __extends(MoveToLastLine, _super);

    function MoveToLastLine() {
      return MoveToLastLine.__super__.constructor.apply(this, arguments);
    }

    MoveToLastLine.extend();

    MoveToLastLine.prototype.defaultCount = Infinity;

    return MoveToLastLine;

  })(MoveToFirstLine);

  MoveToLineByPercent = (function(_super) {
    __extends(MoveToLineByPercent, _super);

    function MoveToLineByPercent() {
      return MoveToLineByPercent.__super__.constructor.apply(this, arguments);
    }

    MoveToLineByPercent.extend();

    MoveToLineByPercent.prototype.getRow = function() {
      var percent;
      percent = Math.min(100, this.getCount());
      return Math.floor(this.getVimLastScreenRow() * (percent / 100));
    };

    return MoveToLineByPercent;

  })(MoveToFirstLine);

  MoveToRelativeLine = (function(_super) {
    __extends(MoveToRelativeLine, _super);

    function MoveToRelativeLine() {
      return MoveToRelativeLine.__super__.constructor.apply(this, arguments);
    }

    MoveToRelativeLine.extend(false);

    MoveToRelativeLine.prototype.wise = 'linewise';

    MoveToRelativeLine.prototype.moveCursor = function(cursor) {
      var point;
      point = this.getPoint(cursor.getBufferPosition());
      return cursor.setBufferPosition(point);
    };

    MoveToRelativeLine.prototype.getCount = function() {
      return MoveToRelativeLine.__super__.getCount.apply(this, arguments) - 1;
    };

    MoveToRelativeLine.prototype.getPoint = function(_arg) {
      var row;
      row = _arg.row;
      return [row + this.getCount(), 0];
    };

    return MoveToRelativeLine;

  })(Motion);

  MoveToRelativeLineWithMinimum = (function(_super) {
    __extends(MoveToRelativeLineWithMinimum, _super);

    function MoveToRelativeLineWithMinimum() {
      return MoveToRelativeLineWithMinimum.__super__.constructor.apply(this, arguments);
    }

    MoveToRelativeLineWithMinimum.extend(false);

    MoveToRelativeLineWithMinimum.prototype.min = 0;

    MoveToRelativeLineWithMinimum.prototype.getCount = function() {
      return Math.max(this.min, MoveToRelativeLineWithMinimum.__super__.getCount.apply(this, arguments));
    };

    return MoveToRelativeLineWithMinimum;

  })(MoveToRelativeLine);

  MoveToTopOfScreen = (function(_super) {
    __extends(MoveToTopOfScreen, _super);

    function MoveToTopOfScreen() {
      return MoveToTopOfScreen.__super__.constructor.apply(this, arguments);
    }

    MoveToTopOfScreen.extend();

    MoveToTopOfScreen.prototype.wise = 'linewise';

    MoveToTopOfScreen.prototype.jump = true;

    MoveToTopOfScreen.prototype.scrolloff = 2;

    MoveToTopOfScreen.prototype.defaultCount = 0;

    MoveToTopOfScreen.prototype.getCount = function() {
      return MoveToTopOfScreen.__super__.getCount.apply(this, arguments) - 1;
    };

    MoveToTopOfScreen.prototype.moveCursor = function(cursor) {
      return cursor.setBufferPosition(this.getPoint());
    };

    MoveToTopOfScreen.prototype.getPoint = function() {
      return getFirstCharacterBufferPositionForScreenRow(this.editor, this.getRow());
    };

    MoveToTopOfScreen.prototype.getScrolloff = function() {
      if (this.isAsOperatorTarget()) {
        return 0;
      } else {
        return this.scrolloff;
      }
    };

    MoveToTopOfScreen.prototype.getRow = function() {
      var offset, row;
      row = getFirstVisibleScreenRow(this.editor);
      offset = this.getScrolloff();
      if (row === 0) {
        offset = 0;
      }
      offset = Math.max(this.getCount(), offset);
      return row + offset;
    };

    return MoveToTopOfScreen;

  })(Motion);

  MoveToMiddleOfScreen = (function(_super) {
    __extends(MoveToMiddleOfScreen, _super);

    function MoveToMiddleOfScreen() {
      return MoveToMiddleOfScreen.__super__.constructor.apply(this, arguments);
    }

    MoveToMiddleOfScreen.extend();

    MoveToMiddleOfScreen.prototype.getRow = function() {
      var endRow, startRow, vimLastScreenRow;
      startRow = getFirstVisibleScreenRow(this.editor);
      vimLastScreenRow = this.getVimLastScreenRow();
      endRow = Math.min(this.editor.getLastVisibleScreenRow(), vimLastScreenRow);
      return startRow + Math.floor((endRow - startRow) / 2);
    };

    return MoveToMiddleOfScreen;

  })(MoveToTopOfScreen);

  MoveToBottomOfScreen = (function(_super) {
    __extends(MoveToBottomOfScreen, _super);

    function MoveToBottomOfScreen() {
      return MoveToBottomOfScreen.__super__.constructor.apply(this, arguments);
    }

    MoveToBottomOfScreen.extend();

    MoveToBottomOfScreen.prototype.getRow = function() {
      var offset, row, vimLastScreenRow;
      vimLastScreenRow = this.getVimLastScreenRow();
      row = Math.min(this.editor.getLastVisibleScreenRow(), vimLastScreenRow);
      offset = this.getScrolloff() + 1;
      if (row === vimLastScreenRow) {
        offset = 0;
      }
      offset = Math.max(this.getCount(), offset);
      return row - offset;
    };

    return MoveToBottomOfScreen;

  })(MoveToTopOfScreen);

  ScrollFullScreenDown = (function(_super) {
    __extends(ScrollFullScreenDown, _super);

    function ScrollFullScreenDown() {
      return ScrollFullScreenDown.__super__.constructor.apply(this, arguments);
    }

    ScrollFullScreenDown.extend();

    ScrollFullScreenDown.prototype.amountOfPage = +1;

    ScrollFullScreenDown.prototype.isSmoothScrollEnabled = function() {
      if (Math.abs(this.amountOfPage) === 1) {
        return settings.get('smoothScrollOnFullScrollMotion');
      } else {
        return settings.get('smoothScrollOnHalfScrollMotion');
      }
    };

    ScrollFullScreenDown.prototype.getSmoothScrollDuation = function() {
      if (Math.abs(this.amountOfPage) === 1) {
        return settings.get('smoothScrollOnFullScrollMotionDuration');
      } else {
        return settings.get('smoothScrollOnHalfScrollMotionDuration');
      }
    };

    ScrollFullScreenDown.prototype.getPixelRectTopForSceenRow = function(row) {
      var point;
      point = new Point(row, 0);
      return this.editor.element.pixelRectForScreenRange(new Range(point, point)).top;
    };

    ScrollFullScreenDown.prototype.smoothScroll = function(fromRow, toRow, options) {
      var topPixelFrom, topPixelTo;
      topPixelFrom = {
        top: this.getPixelRectTopForSceenRow(fromRow)
      };
      topPixelTo = {
        top: this.getPixelRectTopForSceenRow(toRow)
      };
      options.step = (function(_this) {
        return function(newTop) {
          return _this.editor.element.setScrollTop(newTop);
        };
      })(this);
      options.duration = this.getSmoothScrollDuation();
      return this.vimState.requestScrollAnimation(topPixelFrom, topPixelTo, options);
    };

    ScrollFullScreenDown.prototype.highlightScreenRow = function(screenRow) {
      var marker, screenRange;
      screenRange = new Range([screenRow, 0], [screenRow, Infinity]);
      marker = this.editor.markScreenRange(screenRange);
      this.editor.decorateMarker(marker, {
        type: 'highlight',
        "class": 'vim-mode-plus-flash'
      });
      return marker;
    };

    ScrollFullScreenDown.prototype.getAmountOfRows = function() {
      return Math.ceil(this.amountOfPage * this.editor.getRowsPerPage() * this.getCount());
    };

    ScrollFullScreenDown.prototype.getPoint = function(cursor) {
      var row;
      row = getValidVimScreenRow(this.editor, cursor.getScreenRow() + this.getAmountOfRows());
      return new Point(row, 0);
    };

    ScrollFullScreenDown.prototype.moveCursor = function(cursor) {
      var complete, currentTopRow, done, finalTopRow, marker;
      cursor.setScreenPosition(this.getPoint(cursor), {
        autoscroll: false
      });
      if (cursor.isLastCursor()) {
        if (this.isSmoothScrollEnabled()) {
          this.vimState.finishScrollAnimation();
        }
        currentTopRow = this.editor.getFirstVisibleScreenRow();
        finalTopRow = currentTopRow + this.getAmountOfRows();
        done = (function(_this) {
          return function() {
            return _this.editor.setFirstVisibleScreenRow(finalTopRow);
          };
        })(this);
        if (this.isSmoothScrollEnabled()) {
          marker = this.highlightScreenRow(cursor.getScreenRow());
          complete = function() {
            return marker.destroy();
          };
          return this.smoothScroll(currentTopRow, finalTopRow, {
            done: done,
            complete: complete
          });
        } else {
          return done();
        }
      }
    };

    return ScrollFullScreenDown;

  })(Motion);

  ScrollFullScreenUp = (function(_super) {
    __extends(ScrollFullScreenUp, _super);

    function ScrollFullScreenUp() {
      return ScrollFullScreenUp.__super__.constructor.apply(this, arguments);
    }

    ScrollFullScreenUp.extend();

    ScrollFullScreenUp.prototype.amountOfPage = -1;

    return ScrollFullScreenUp;

  })(ScrollFullScreenDown);

  ScrollHalfScreenDown = (function(_super) {
    __extends(ScrollHalfScreenDown, _super);

    function ScrollHalfScreenDown() {
      return ScrollHalfScreenDown.__super__.constructor.apply(this, arguments);
    }

    ScrollHalfScreenDown.extend();

    ScrollHalfScreenDown.prototype.amountOfPage = +1 / 2;

    return ScrollHalfScreenDown;

  })(ScrollFullScreenDown);

  ScrollHalfScreenUp = (function(_super) {
    __extends(ScrollHalfScreenUp, _super);

    function ScrollHalfScreenUp() {
      return ScrollHalfScreenUp.__super__.constructor.apply(this, arguments);
    }

    ScrollHalfScreenUp.extend();

    ScrollHalfScreenUp.prototype.amountOfPage = -1 / 2;

    return ScrollHalfScreenUp;

  })(ScrollHalfScreenDown);

  Find = (function(_super) {
    __extends(Find, _super);

    function Find() {
      return Find.__super__.constructor.apply(this, arguments);
    }

    Find.extend();

    Find.prototype.backwards = false;

    Find.prototype.inclusive = true;

    Find.prototype.hover = {
      icon: ':find:',
      emoji: ':mag_right:'
    };

    Find.prototype.offset = 0;

    Find.prototype.requireInput = true;

    Find.prototype.initialize = function() {
      Find.__super__.initialize.apply(this, arguments);
      if (!this.isComplete()) {
        return this.focusInput();
      }
    };

    Find.prototype.isBackwards = function() {
      return this.backwards;
    };

    Find.prototype.getPoint = function(fromPoint) {
      var end, method, offset, points, scanRange, start, unOffset, _ref2, _ref3;
      _ref2 = this.editor.bufferRangeForBufferRow(fromPoint.row), start = _ref2.start, end = _ref2.end;
      offset = this.isBackwards() ? this.offset : -this.offset;
      unOffset = -offset * this.isRepeated();
      if (this.isBackwards()) {
        scanRange = [start, fromPoint.translate([0, unOffset])];
        method = 'backwardsScanInBufferRange';
      } else {
        scanRange = [fromPoint.translate([0, 1 + unOffset]), end];
        method = 'scanInBufferRange';
      }
      points = [];
      this.editor[method](RegExp("" + (_.escapeRegExp(this.input)), "g"), scanRange, function(_arg) {
        var range;
        range = _arg.range;
        return points.push(range.start);
      });
      return (_ref3 = points[this.getCount()]) != null ? _ref3.translate([0, offset]) : void 0;
    };

    Find.prototype.getCount = function() {
      return Find.__super__.getCount.apply(this, arguments) - 1;
    };

    Find.prototype.moveCursor = function(cursor) {
      var point;
      point = this.getPoint(cursor.getBufferPosition());
      this.setBufferPositionSafely(cursor, point);
      if (!this.isRepeated()) {
        return this.globalState.set('currentFind', this);
      }
    };

    return Find;

  })(Motion);

  FindBackwards = (function(_super) {
    __extends(FindBackwards, _super);

    function FindBackwards() {
      return FindBackwards.__super__.constructor.apply(this, arguments);
    }

    FindBackwards.extend();

    FindBackwards.prototype.inclusive = false;

    FindBackwards.prototype.backwards = true;

    FindBackwards.prototype.hover = {
      icon: ':find:',
      emoji: ':mag:'
    };

    return FindBackwards;

  })(Find);

  Till = (function(_super) {
    __extends(Till, _super);

    function Till() {
      return Till.__super__.constructor.apply(this, arguments);
    }

    Till.extend();

    Till.prototype.offset = 1;

    Till.prototype.getPoint = function() {
      return this.point = Till.__super__.getPoint.apply(this, arguments);
    };

    Till.prototype.selectByMotion = function(selection) {
      Till.__super__.selectByMotion.apply(this, arguments);
      if (selection.isEmpty() && ((this.point != null) && !this.backwards)) {
        return swrap(selection).translateSelectionEndAndClip('forward');
      }
    };

    return Till;

  })(Find);

  TillBackwards = (function(_super) {
    __extends(TillBackwards, _super);

    function TillBackwards() {
      return TillBackwards.__super__.constructor.apply(this, arguments);
    }

    TillBackwards.extend();

    TillBackwards.prototype.inclusive = false;

    TillBackwards.prototype.backwards = true;

    return TillBackwards;

  })(Till);

  MoveToMark = (function(_super) {
    __extends(MoveToMark, _super);

    function MoveToMark() {
      return MoveToMark.__super__.constructor.apply(this, arguments);
    }

    MoveToMark.extend();

    MoveToMark.prototype.jump = true;

    MoveToMark.prototype.requireInput = true;

    MoveToMark.prototype.hover = {
      icon: ":move-to-mark:`",
      emoji: ":round_pushpin:`"
    };

    MoveToMark.prototype.input = null;

    MoveToMark.prototype.initialize = function() {
      MoveToMark.__super__.initialize.apply(this, arguments);
      if (!this.isComplete()) {
        return this.focusInput();
      }
    };

    MoveToMark.prototype.getPoint = function() {
      return this.vimState.mark.get(this.getInput());
    };

    MoveToMark.prototype.moveCursor = function(cursor) {
      var point;
      if (point = this.getPoint()) {
        cursor.setBufferPosition(point);
        return cursor.autoscroll({
          center: true
        });
      }
    };

    return MoveToMark;

  })(Motion);

  MoveToMarkLine = (function(_super) {
    __extends(MoveToMarkLine, _super);

    function MoveToMarkLine() {
      return MoveToMarkLine.__super__.constructor.apply(this, arguments);
    }

    MoveToMarkLine.extend();

    MoveToMarkLine.prototype.hover = {
      icon: ":move-to-mark:'",
      emoji: ":round_pushpin:'"
    };

    MoveToMarkLine.prototype.wise = 'linewise';

    MoveToMarkLine.prototype.getPoint = function() {
      var point;
      if (point = MoveToMarkLine.__super__.getPoint.apply(this, arguments)) {
        return getFirstCharacterPositionForBufferRow(this.editor, point.row);
      }
    };

    return MoveToMarkLine;

  })(MoveToMark);

  MoveToPreviousFoldStart = (function(_super) {
    __extends(MoveToPreviousFoldStart, _super);

    function MoveToPreviousFoldStart() {
      return MoveToPreviousFoldStart.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousFoldStart.extend();

    MoveToPreviousFoldStart.description = "Move to previous fold start";

    MoveToPreviousFoldStart.prototype.wise = 'characterwise';

    MoveToPreviousFoldStart.prototype.which = 'start';

    MoveToPreviousFoldStart.prototype.direction = 'prev';

    MoveToPreviousFoldStart.prototype.initialize = function() {
      MoveToPreviousFoldStart.__super__.initialize.apply(this, arguments);
      this.rows = this.getFoldRows(this.which);
      if (this.direction === 'prev') {
        return this.rows.reverse();
      }
    };

    MoveToPreviousFoldStart.prototype.getFoldRows = function(which) {
      var index, rows;
      index = which === 'start' ? 0 : 1;
      rows = getCodeFoldRowRanges(this.editor).map(function(rowRange) {
        return rowRange[index];
      });
      return _.sortBy(_.uniq(rows), function(row) {
        return row;
      });
    };

    MoveToPreviousFoldStart.prototype.getScanRows = function(cursor) {
      var cursorRow, isValidRow;
      cursorRow = cursor.getBufferRow();
      isValidRow = (function() {
        switch (this.direction) {
          case 'prev':
            return function(row) {
              return row < cursorRow;
            };
          case 'next':
            return function(row) {
              return row > cursorRow;
            };
        }
      }).call(this);
      return this.rows.filter(isValidRow);
    };

    MoveToPreviousFoldStart.prototype.detectRow = function(cursor) {
      return this.getScanRows(cursor)[0];
    };

    MoveToPreviousFoldStart.prototype.moveCursor = function(cursor) {
      return this.countTimes((function(_this) {
        return function() {
          var row;
          if ((row = _this.detectRow(cursor)) != null) {
            return moveCursorToFirstCharacterAtRow(cursor, row);
          }
        };
      })(this));
    };

    return MoveToPreviousFoldStart;

  })(Motion);

  MoveToNextFoldStart = (function(_super) {
    __extends(MoveToNextFoldStart, _super);

    function MoveToNextFoldStart() {
      return MoveToNextFoldStart.__super__.constructor.apply(this, arguments);
    }

    MoveToNextFoldStart.extend();

    MoveToNextFoldStart.description = "Move to next fold start";

    MoveToNextFoldStart.prototype.direction = 'next';

    return MoveToNextFoldStart;

  })(MoveToPreviousFoldStart);

  MoveToPreviousFoldStartWithSameIndent = (function(_super) {
    __extends(MoveToPreviousFoldStartWithSameIndent, _super);

    function MoveToPreviousFoldStartWithSameIndent() {
      return MoveToPreviousFoldStartWithSameIndent.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousFoldStartWithSameIndent.extend();

    MoveToPreviousFoldStartWithSameIndent.description = "Move to previous same-indented fold start";

    MoveToPreviousFoldStartWithSameIndent.prototype.detectRow = function(cursor) {
      var baseIndentLevel, row, _i, _len, _ref2;
      baseIndentLevel = getIndentLevelForBufferRow(this.editor, cursor.getBufferRow());
      _ref2 = this.getScanRows(cursor);
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        row = _ref2[_i];
        if (getIndentLevelForBufferRow(this.editor, row) === baseIndentLevel) {
          return row;
        }
      }
      return null;
    };

    return MoveToPreviousFoldStartWithSameIndent;

  })(MoveToPreviousFoldStart);

  MoveToNextFoldStartWithSameIndent = (function(_super) {
    __extends(MoveToNextFoldStartWithSameIndent, _super);

    function MoveToNextFoldStartWithSameIndent() {
      return MoveToNextFoldStartWithSameIndent.__super__.constructor.apply(this, arguments);
    }

    MoveToNextFoldStartWithSameIndent.extend();

    MoveToNextFoldStartWithSameIndent.description = "Move to next same-indented fold start";

    MoveToNextFoldStartWithSameIndent.prototype.direction = 'next';

    return MoveToNextFoldStartWithSameIndent;

  })(MoveToPreviousFoldStartWithSameIndent);

  MoveToPreviousFoldEnd = (function(_super) {
    __extends(MoveToPreviousFoldEnd, _super);

    function MoveToPreviousFoldEnd() {
      return MoveToPreviousFoldEnd.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousFoldEnd.extend();

    MoveToPreviousFoldEnd.description = "Move to previous fold end";

    MoveToPreviousFoldEnd.prototype.which = 'end';

    return MoveToPreviousFoldEnd;

  })(MoveToPreviousFoldStart);

  MoveToNextFoldEnd = (function(_super) {
    __extends(MoveToNextFoldEnd, _super);

    function MoveToNextFoldEnd() {
      return MoveToNextFoldEnd.__super__.constructor.apply(this, arguments);
    }

    MoveToNextFoldEnd.extend();

    MoveToNextFoldEnd.description = "Move to next fold end";

    MoveToNextFoldEnd.prototype.direction = 'next';

    return MoveToNextFoldEnd;

  })(MoveToPreviousFoldEnd);

  MoveToPreviousFunction = (function(_super) {
    __extends(MoveToPreviousFunction, _super);

    function MoveToPreviousFunction() {
      return MoveToPreviousFunction.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousFunction.extend();

    MoveToPreviousFunction.description = "Move to previous function";

    MoveToPreviousFunction.prototype.direction = 'prev';

    MoveToPreviousFunction.prototype.detectRow = function(cursor) {
      return _.detect(this.getScanRows(cursor), (function(_this) {
        return function(row) {
          return isIncludeFunctionScopeForRow(_this.editor, row);
        };
      })(this));
    };

    return MoveToPreviousFunction;

  })(MoveToPreviousFoldStart);

  MoveToNextFunction = (function(_super) {
    __extends(MoveToNextFunction, _super);

    function MoveToNextFunction() {
      return MoveToNextFunction.__super__.constructor.apply(this, arguments);
    }

    MoveToNextFunction.extend();

    MoveToNextFunction.description = "Move to next function";

    MoveToNextFunction.prototype.direction = 'next';

    return MoveToNextFunction;

  })(MoveToPreviousFunction);

  MoveToPositionByScope = (function(_super) {
    __extends(MoveToPositionByScope, _super);

    function MoveToPositionByScope() {
      return MoveToPositionByScope.__super__.constructor.apply(this, arguments);
    }

    MoveToPositionByScope.extend(false);

    MoveToPositionByScope.prototype.direction = 'backward';

    MoveToPositionByScope.prototype.scope = '.';

    MoveToPositionByScope.prototype.getPoint = function(fromPoint) {
      return detectScopeStartPositionForScope(this.editor, fromPoint, this.direction, this.scope);
    };

    MoveToPositionByScope.prototype.moveCursor = function(cursor) {
      var point;
      point = cursor.getBufferPosition();
      this.countTimes((function(_this) {
        return function(_arg) {
          var newPoint, stop;
          stop = _arg.stop;
          if ((newPoint = _this.getPoint(point))) {
            return point = newPoint;
          } else {
            return stop();
          }
        };
      })(this));
      return this.setBufferPositionSafely(cursor, point);
    };

    return MoveToPositionByScope;

  })(Motion);

  MoveToPreviousString = (function(_super) {
    __extends(MoveToPreviousString, _super);

    function MoveToPreviousString() {
      return MoveToPreviousString.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousString.extend();

    MoveToPreviousString.description = "Move to previous string(searched by `string.begin` scope)";

    MoveToPreviousString.prototype.direction = 'backward';

    MoveToPreviousString.prototype.scope = 'string.begin';

    return MoveToPreviousString;

  })(MoveToPositionByScope);

  MoveToNextString = (function(_super) {
    __extends(MoveToNextString, _super);

    function MoveToNextString() {
      return MoveToNextString.__super__.constructor.apply(this, arguments);
    }

    MoveToNextString.extend();

    MoveToNextString.description = "Move to next string(searched by `string.begin` scope)";

    MoveToNextString.prototype.direction = 'forward';

    return MoveToNextString;

  })(MoveToPreviousString);

  MoveToPreviousNumber = (function(_super) {
    __extends(MoveToPreviousNumber, _super);

    function MoveToPreviousNumber() {
      return MoveToPreviousNumber.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousNumber.extend();

    MoveToPreviousNumber.prototype.direction = 'backward';

    MoveToPreviousNumber.description = "Move to previous number(searched by `constant.numeric` scope)";

    MoveToPreviousNumber.prototype.scope = 'constant.numeric';

    return MoveToPreviousNumber;

  })(MoveToPositionByScope);

  MoveToNextNumber = (function(_super) {
    __extends(MoveToNextNumber, _super);

    function MoveToNextNumber() {
      return MoveToNextNumber.__super__.constructor.apply(this, arguments);
    }

    MoveToNextNumber.extend();

    MoveToNextNumber.description = "Move to next number(searched by `constant.numeric` scope)";

    MoveToNextNumber.prototype.direction = 'forward';

    return MoveToNextNumber;

  })(MoveToPreviousNumber);

  MoveToPair = (function(_super) {
    __extends(MoveToPair, _super);

    function MoveToPair() {
      return MoveToPair.__super__.constructor.apply(this, arguments);
    }

    MoveToPair.extend();

    MoveToPair.prototype.inclusive = true;

    MoveToPair.prototype.jump = true;

    MoveToPair.prototype.member = ['Parenthesis', 'CurlyBracket', 'SquareBracket', 'AngleBracket'];

    MoveToPair.prototype.moveCursor = function(cursor) {
      return this.setBufferPositionSafely(cursor, this.getPoint(cursor));
    };

    MoveToPair.prototype.getPoint = function(cursor) {
      var cursorPosition, cursorRow, enclosingRange, enclosingRanges, forwardingRanges, getPointForTag, point, ranges, _ref2, _ref3;
      cursorPosition = cursor.getBufferPosition();
      cursorRow = cursorPosition.row;
      getPointForTag = (function(_this) {
        return function() {
          var closeRange, openRange, p, pairInfo;
          p = cursorPosition;
          pairInfo = _this["new"]("ATag").getPairInfo(p);
          if (pairInfo == null) {
            return null;
          }
          openRange = pairInfo.openRange, closeRange = pairInfo.closeRange;
          openRange = openRange.translate([0, +1], [0, -1]);
          closeRange = closeRange.translate([0, +1], [0, -1]);
          if (openRange.containsPoint(p) && (!p.isEqual(openRange.end))) {
            return closeRange.start;
          }
          if (closeRange.containsPoint(p) && (!p.isEqual(closeRange.end))) {
            return openRange.start;
          }
        };
      })(this);
      point = getPointForTag();
      if (point != null) {
        return point;
      }
      ranges = this["new"]("AAnyPair", {
        allowForwarding: true,
        member: this.member
      }).getRanges(cursor.selection);
      ranges = ranges.filter(function(_arg) {
        var end, p, start;
        start = _arg.start, end = _arg.end;
        p = cursorPosition;
        return (p.row === start.row) && start.isGreaterThanOrEqual(p) || (p.row === end.row) && end.isGreaterThanOrEqual(p);
      });
      if (!ranges.length) {
        return null;
      }
      _ref2 = _.partition(ranges, function(range) {
        return range.containsPoint(cursorPosition, true);
      }), enclosingRanges = _ref2[0], forwardingRanges = _ref2[1];
      enclosingRange = _.last(sortRanges(enclosingRanges));
      forwardingRanges = sortRanges(forwardingRanges);
      if (enclosingRange) {
        forwardingRanges = forwardingRanges.filter(function(range) {
          return enclosingRange.containsRange(range);
        });
      }
      return ((_ref3 = forwardingRanges[0]) != null ? _ref3.end.translate([0, -1]) : void 0) || (enclosingRange != null ? enclosingRange.start : void 0);
    };

    return MoveToPair;

  })(Motion);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9tb3Rpb24uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGkwRUFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxPQUFpQixPQUFBLENBQVEsTUFBUixDQUFqQixFQUFDLGFBQUEsS0FBRCxFQUFRLGFBQUEsS0FEUixDQUFBOztBQUFBLEVBRUEsTUFBQSxHQUFTLElBRlQsQ0FBQTs7QUFBQSxFQUlBLFFBNkJJLE9BQUEsQ0FBUSxTQUFSLENBN0JKLEVBQ0Usd0JBQUEsZUFERixFQUNtQiw4QkFBQSxxQkFEbkIsRUFFRSx1QkFBQSxjQUZGLEVBRWtCLHdCQUFBLGVBRmxCLEVBR0UsMkJBQUEsa0JBSEYsRUFHc0IsNkJBQUEsb0JBSHRCLEVBSUUsNkJBQUEsb0JBSkYsRUFLRSwyQkFBQSxrQkFMRixFQU1FLCtCQUFBLHNCQU5GLEVBT0UsaUNBQUEsd0JBUEYsRUFPNEIsZ0NBQUEsdUJBUDVCLEVBUUUsNkJBQUEsb0JBUkYsRUFRd0IsNkJBQUEsb0JBUnhCLEVBU0Usd0JBQUEsZUFURixFQVVFLHdDQUFBLCtCQVZGLEVBV0UsbUJBQUEsVUFYRixFQVlFLG1DQUFBLDBCQVpGLEVBYUUsNkJBQUEsb0JBYkYsRUFjRSxzQ0FBQSw2QkFkRixFQWVFLDJCQUFBLGtCQWZGLEVBZ0JFLDZCQUFBLG9CQWhCRixFQWlCRSw2Q0FBQSxvQ0FqQkYsRUFrQkUscUNBQUEsNEJBbEJGLEVBbUJFLHlDQUFBLGdDQW5CRixFQW9CRSxzQkFBQSxhQXBCRixFQXFCRSxtQ0FBQSwwQkFyQkYsRUFzQkUsOENBQUEscUNBdEJGLEVBdUJFLG9EQUFBLDJDQXZCRixFQXdCRSxxQ0FBQSw0QkF4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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/motion.coffee
