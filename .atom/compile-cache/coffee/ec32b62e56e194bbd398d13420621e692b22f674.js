(function() {
  var Base, CurrentSelection, Find, FindBackwards, MatchList, Motion, MoveDown, MoveDownScreen, MoveDownToEdge, MoveLeft, MoveRight, MoveToBeginningOfLine, MoveToBottomOfScreen, MoveToColumn, MoveToEndOfAlphanumericWord, MoveToEndOfSmartWord, MoveToEndOfWholeWord, MoveToEndOfWord, MoveToFirstCharacterOfLine, MoveToFirstCharacterOfLineAndDown, MoveToFirstCharacterOfLineDown, MoveToFirstCharacterOfLineUp, MoveToFirstLine, MoveToLastCharacterOfLine, MoveToLastLine, MoveToLastNonblankCharacterOfLineAndDown, MoveToLineByPercent, MoveToMark, MoveToMarkLine, MoveToMiddleOfScreen, MoveToNextAlphanumericWord, MoveToNextFoldEnd, MoveToNextFoldStart, MoveToNextFoldStartWithSameIndent, MoveToNextFunction, MoveToNextNumber, MoveToNextParagraph, MoveToNextSmartWord, MoveToNextString, MoveToNextWholeWord, MoveToNextWord, MoveToPair, MoveToPositionByScope, MoveToPreviousAlphanumericWord, MoveToPreviousFoldEnd, MoveToPreviousFoldStart, MoveToPreviousFoldStartWithSameIndent, MoveToPreviousFunction, MoveToPreviousNumber, MoveToPreviousParagraph, MoveToPreviousSmartWord, MoveToPreviousString, MoveToPreviousWholeWord, MoveToPreviousWord, MoveToRelativeLine, MoveToRelativeLineWithMinimum, MoveToTopOfScreen, MoveUp, MoveUpScreen, MoveUpToEdge, Point, Range, RepeatSearch, RepeatSearchReverse, ScrollFullScreenDown, ScrollFullScreenUp, ScrollHalfScreenDown, ScrollHalfScreenUp, Search, SearchBackwards, SearchBase, SearchCurrentLine, SearchCurrentLineBackwards, SearchCurrentWord, SearchCurrentWordBackwards, Select, Till, TillBackwards, cursorIsAtEmptyRow, cursorIsAtEndOfLineAtNonEmptyRow, cursorIsAtVimEndOfFile, cursorIsOnWhiteSpace, debug, detectScopeStartPositionForScope, getBufferRows, getCodeFoldRowRanges, getEndPositionForPattern, getFirstCharacterBufferPositionForScreenRow, getFirstCharacterPositionForBufferRow, getFirstVisibleScreenRow, getIndentLevelForBufferRow, getLargestFoldRangeContainsBufferRow, getLastVisibleScreenRow, getStartPositionForPattern, getTextInScreenRange, getValidVimBufferRow, getValidVimScreenRow, getVisibleBufferRange, highlightRanges, isIncludeFunctionScopeForRow, moveCursorDownBuffer, moveCursorDownScreen, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUpBuffer, moveCursorUpScreen, saveEditorState, settings, sortRanges, swrap, _, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  _ref = require('atom'), Point = _ref.Point, Range = _ref.Range;

  Select = null;

  _ref1 = require('./utils'), saveEditorState = _ref1.saveEditorState, getVisibleBufferRange = _ref1.getVisibleBufferRange, moveCursorLeft = _ref1.moveCursorLeft, moveCursorRight = _ref1.moveCursorRight, moveCursorUpScreen = _ref1.moveCursorUpScreen, moveCursorDownScreen = _ref1.moveCursorDownScreen, moveCursorDownBuffer = _ref1.moveCursorDownBuffer, moveCursorUpBuffer = _ref1.moveCursorUpBuffer, cursorIsAtVimEndOfFile = _ref1.cursorIsAtVimEndOfFile, getFirstVisibleScreenRow = _ref1.getFirstVisibleScreenRow, getLastVisibleScreenRow = _ref1.getLastVisibleScreenRow, getValidVimScreenRow = _ref1.getValidVimScreenRow, getValidVimBufferRow = _ref1.getValidVimBufferRow, highlightRanges = _ref1.highlightRanges, moveCursorToFirstCharacterAtRow = _ref1.moveCursorToFirstCharacterAtRow, sortRanges = _ref1.sortRanges, getIndentLevelForBufferRow = _ref1.getIndentLevelForBufferRow, cursorIsOnWhiteSpace = _ref1.cursorIsOnWhiteSpace, moveCursorToNextNonWhitespace = _ref1.moveCursorToNextNonWhitespace, cursorIsAtEmptyRow = _ref1.cursorIsAtEmptyRow, getCodeFoldRowRanges = _ref1.getCodeFoldRowRanges, getLargestFoldRangeContainsBufferRow = _ref1.getLargestFoldRangeContainsBufferRow, isIncludeFunctionScopeForRow = _ref1.isIncludeFunctionScopeForRow, detectScopeStartPositionForScope = _ref1.detectScopeStartPositionForScope, getBufferRows = _ref1.getBufferRows, getStartPositionForPattern = _ref1.getStartPositionForPattern, getEndPositionForPattern = _ref1.getEndPositionForPattern, getFirstCharacterPositionForBufferRow = _ref1.getFirstCharacterPositionForBufferRow, getFirstCharacterBufferPositionForScreenRow = _ref1.getFirstCharacterBufferPositionForScreenRow, getTextInScreenRange = _ref1.getTextInScreenRange, cursorIsAtEndOfLineAtNonEmptyRow = _ref1.cursorIsAtEndOfLineAtNonEmptyRow, debug = _ref1.debug;

  swrap = require('./selection-wrapper');

  MatchList = require('./match').MatchList;

  settings = require('./settings');

  Base = require('./base');

  Motion = (function(_super) {
    __extends(Motion, _super);

    Motion.extend(false);

    Motion.prototype.inclusive = false;

    Motion.prototype.linewise = false;

    function Motion() {
      Motion.__super__.constructor.apply(this, arguments);
      this.initialize();
    }

    Motion.prototype.isBlockwise = function() {
      return this.isMode('visual', 'blockwise');
    };

    Motion.prototype.isInclusive = function() {
      return this.isMode('visual') || this.isAsOperatorTarget() && this.inclusive;
    };

    Motion.prototype.isLinewise = function() {
      return this.isMode('visual', 'linewise') || this.isAsOperatorTarget() && this.linewise;
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

    Motion.prototype.execute = function() {
      return this.editor.moveCursors((function(_this) {
        return function(cursor) {
          return _this.moveCursor(cursor);
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
      switch (false) {
        case !this.isLinewise():
          return this.vimState.selectLinewise();
        case !this.isBlockwise():
          return this.vimState.selectBlockwise();
      }
    };

    Motion.prototype.selectByMotion = function(selection) {
      var cursor;
      cursor = selection.cursor;
      selection.modifySelection((function(_this) {
        return function() {
          return _this.moveCursor(cursor);
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
          this.isBlockwise = function() {
            return true;
          };
          _ref2 = cursor.selection.getBufferRange(), start = _ref2.start, end = _ref2.end;
          _ref3 = cursor.selection.isReversed() ? [start, end] : [end, start], head = _ref3[0], tail = _ref3[1];
          this.selectionExtent = new Point(head.row - tail.row, head.column - tail.column);
        } else {
          this.selectionExtent = this.editor.getSelectedBufferRange().getExtent();
        }
        return this.linewise = this.isLinewise();
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

  MoveUp = (function(_super) {
    __extends(MoveUp, _super);

    function MoveUp() {
      return MoveUp.__super__.constructor.apply(this, arguments);
    }

    MoveUp.extend();

    MoveUp.prototype.linewise = true;

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

    MoveDown.prototype.linewise = true;

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

    MoveUpScreen.prototype.linewise = true;

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

    MoveDownScreen.prototype.linewise = true;

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

    MoveUpToEdge.prototype.linewise = true;

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
      var point, row, _i, _len, _ref2;
      _ref2 = this.getScanRows(fromPoint);
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        row = _ref2[_i];
        if (this.isMovablePoint(point = new Point(row, fromPoint.column))) {
          return point;
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

    MoveUpToEdge.prototype.isMovablePoint = function(point) {
      var _ref2;
      if (this.isStoppablePoint(point)) {
        if ((_ref2 = point.row) === 0 || _ref2 === this.getVimLastScreenRow()) {
          return true;
        } else {
          return this.isEdge(point);
        }
      } else {
        return false;
      }
    };

    MoveUpToEdge.prototype.isEdge = function(point) {
      var above, below;
      above = point.translate([-1, 0]);
      below = point.translate([+1, 0]);
      return (!this.isStoppablePoint(above)) || (!this.isStoppablePoint(below));
    };

    MoveUpToEdge.prototype.isValidStoppablePoint = function(_arg) {
      var column, firstChar, lastChar, match, row, softTabText, text;
      row = _arg.row, column = _arg.column;
      text = getTextInScreenRange(this.editor, [[row, 0], [row, Infinity]]);
      softTabText = _.multiplyString(' ', this.editor.getTabLength());
      text = text.replace(/\t/g, softTabText);
      if ((match = text.match(/\S/g)) != null) {
        firstChar = match[0], lastChar = match[match.length - 1];
        return (text.indexOf(firstChar) <= column && column <= text.lastIndexOf(lastChar));
      } else {
        return false;
      }
    };

    MoveUpToEdge.prototype.isStoppablePoint = function(point) {
      var left, right, _ref2;
      if ((_ref2 = point.row) === 0 || _ref2 === this.getVimLastScreenRow()) {
        return true;
      } else if (this.isNonBlankPoint(point)) {
        return true;
      } else if (this.isValidStoppablePoint(point)) {
        left = point.translate([0, -1]);
        right = point.translate([0, +1]);
        return this.isNonBlankPoint(left) && this.isNonBlankPoint(right);
      } else {
        return false;
      }
    };

    MoveUpToEdge.prototype.isNonBlankPoint = function(point) {
      var char, screenRange;
      screenRange = Range.fromPointWithDelta(point, 0, 1);
      char = getTextInScreenRange(this.editor, screenRange);
      return (char != null) && /\S/.test(char);
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

  MoveToNextParagraph = (function(_super) {
    __extends(MoveToNextParagraph, _super);

    function MoveToNextParagraph() {
      return MoveToNextParagraph.__super__.constructor.apply(this, arguments);
    }

    MoveToNextParagraph.extend();

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
      var row, wasAtNonBlankRow, _i, _len, _ref2;
      wasAtNonBlankRow = !this.editor.isBufferRowBlank(fromPoint.row);
      _ref2 = getBufferRows(this.editor, {
        startRow: fromPoint.row,
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

    MoveToFirstCharacterOfLineUp.prototype.linewise = true;

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

    MoveToFirstCharacterOfLineDown.prototype.linewise = true;

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

    MoveToFirstLine.prototype.linewise = true;

    MoveToFirstLine.prototype.defaultCount = null;

    MoveToFirstLine.prototype.moveCursor = function(cursor) {
      cursor.setBufferPosition(this.getPoint());
      return cursor.autoscroll({
        center: true
      });
    };

    MoveToFirstLine.prototype.getPoint = function() {
      return getFirstCharacterPositionForBufferRow(this.editor, this.getRow());
    };

    MoveToFirstLine.prototype.getRow = function() {
      var count;
      if ((count = this.getCount())) {
        return count - 1;
      } else {
        return this.getDefaultRow();
      }
    };

    MoveToFirstLine.prototype.getDefaultRow = function() {
      return 0;
    };

    return MoveToFirstLine;

  })(Motion);

  MoveToLastLine = (function(_super) {
    __extends(MoveToLastLine, _super);

    function MoveToLastLine() {
      return MoveToLastLine.__super__.constructor.apply(this, arguments);
    }

    MoveToLastLine.extend();

    MoveToLastLine.prototype.getDefaultRow = function() {
      return this.getVimLastBufferRow();
    };

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

    MoveToRelativeLine.prototype.linewise = true;

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

    MoveToTopOfScreen.prototype.linewise = true;

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

    MoveToMark.prototype.getPoint = function(fromPoint) {
      var input, point;
      input = this.getInput();
      point = null;
      point = this.vimState.mark.get(input);
      if (input === '`') {
        if (point == null) {
          point = [0, 0];
        }
        this.vimState.mark.set('`', fromPoint);
      }
      if ((point != null) && this.linewise) {
        point = getFirstCharacterPositionForBufferRow(this.editor, point.row);
      }
      return point;
    };

    MoveToMark.prototype.moveCursor = function(cursor) {
      var point;
      point = cursor.getBufferPosition();
      return this.setBufferPositionSafely(cursor, this.getPoint(point));
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

    MoveToMarkLine.prototype.linewise = true;

    return MoveToMarkLine;

  })(MoveToMark);

  SearchBase = (function(_super) {
    __extends(SearchBase, _super);

    function SearchBase() {
      return SearchBase.__super__.constructor.apply(this, arguments);
    }

    SearchBase.extend(false);

    SearchBase.prototype.backwards = false;

    SearchBase.prototype.useRegexp = true;

    SearchBase.prototype.configScope = null;

    SearchBase.prototype.updateSearchHistory = true;

    SearchBase.prototype.scanRanges = null;

    SearchBase.prototype.landingPoint = null;

    SearchBase.prototype.defaultLandingPoint = 'start';

    SearchBase.prototype.caseSensitivity = null;

    SearchBase.prototype.quiet = false;

    SearchBase.prototype.isQuiet = function() {
      return this.quiet;
    };

    SearchBase.prototype.getCount = function() {
      var count;
      count = SearchBase.__super__.getCount.apply(this, arguments) - 1;
      if (this.isBackwards()) {
        count = -count;
      }
      return count;
    };

    SearchBase.prototype.isBackwards = function() {
      return this.backwards;
    };

    SearchBase.prototype.getVisualEffectFor = function(key) {
      if (this.isQuiet()) {
        return false;
      } else {
        return settings.get(key);
      }
    };

    SearchBase.prototype.needToUpdateSearchHistory = function() {
      return this.updateSearchHistory;
    };

    SearchBase.prototype.isCaseSensitive = function(term) {
      switch (this.getCaseSensitivity()) {
        case 'smartcase':
          return term.search('[A-Z]') !== -1;
        case 'insensitive':
          return false;
        case 'sensitive':
          return true;
      }
    };

    SearchBase.prototype.getCaseSensitivity = function() {
      return this.caseSensitivity != null ? this.caseSensitivity : this.caseSensitivity = settings.get("useSmartcaseFor" + this.configScope) ? 'smartcase' : settings.get("ignoreCaseFor" + this.configScope) ? 'insensitive' : 'sensitive';
    };

    SearchBase.prototype.finish = function() {
      var _ref2;
      if ((typeof this.isIncrementalSearch === "function" ? this.isIncrementalSearch() : void 0) && this.getVisualEffectFor('showHoverSearchCounter')) {
        this.vimState.hoverSearchCounter.reset();
      }
      this.scanRanges = null;
      if ((_ref2 = this.matches) != null) {
        _ref2.destroy();
      }
      return this.matches = null;
    };

    SearchBase.prototype.flashScreen = function() {
      highlightRanges(this.editor, getVisibleBufferRange(this.editor), {
        "class": 'vim-mode-plus-flash',
        timeout: 100
      });
      return atom.beep();
    };

    SearchBase.prototype.getLandingPoint = function() {
      return this.landingPoint != null ? this.landingPoint : this.landingPoint = this.defaultLandingPoint;
    };

    SearchBase.prototype.getPoint = function(cursor) {
      var input;
      input = this.getInput();
      if (this.matches == null) {
        this.matches = this.getMatchList(cursor, input);
      }
      if (this.matches.isEmpty()) {
        return null;
      } else {
        if (this.getLandingPoint() === 'start') {
          return this.matches.getCurrentStartPosition();
        } else {
          return this.matches.getCurrentEndPosition();
        }
      }
    };

    SearchBase.prototype.moveCursor = function(cursor) {
      var input, point;
      input = this.getInput();
      if (input === '') {
        this.finish();
        return;
      }
      if (point = this.getPoint(cursor)) {
        this.visitMatch("current", {
          timeout: settings.get('showHoverSearchCounterDuration'),
          landing: true
        });
        cursor.setBufferPosition(point, {
          autoscroll: false
        });
      } else {
        if (this.getVisualEffectFor('flashScreenOnSearchHasNoMatch')) {
          this.flashScreen();
        }
      }
      if (this.needToUpdateSearchHistory()) {
        this.globalState.set('currentSearch', this);
        this.vimState.searchHistory.save(input);
      }
      if (!this.isQuiet()) {
        this.globalState.set('lastSearchPattern', this.getPattern(input));
      }
      return this.finish();
    };

    SearchBase.prototype.getFromPoint = function(cursor) {
      if (this.isMode('visual', 'linewise') && (typeof this.isIncrementalSearch === "function" ? this.isIncrementalSearch() : void 0)) {
        return swrap(cursor.selection).getBufferPositionFor('head', {
          fromProperty: true
        });
      } else {
        return cursor.getBufferPosition();
      }
    };

    SearchBase.prototype.getScanRanges = function() {
      var _ref2;
      return (_ref2 = this.scanRanges) != null ? _ref2 : [];
    };

    SearchBase.prototype.getMatchList = function(cursor, input) {
      return MatchList.fromScan(this.editor, {
        fromPoint: this.getFromPoint(cursor),
        pattern: this.getPattern(input),
        direction: (this.isBackwards() ? 'backward' : 'forward'),
        countOffset: this.getCount(),
        scanRanges: this.getScanRanges()
      });
    };

    SearchBase.prototype.visitMatch = function(direction, options) {
      var flashOptions, landing, match, timeout;
      if (direction == null) {
        direction = null;
      }
      if (options == null) {
        options = {};
      }
      timeout = options.timeout, landing = options.landing;
      if (landing == null) {
        landing = false;
      }
      match = this.matches.get(direction);
      match.scrollToStartPoint();
      flashOptions = {
        "class": 'vim-mode-plus-flash',
        timeout: settings.get('flashOnSearchDuration')
      };
      if (landing) {
        if (this.getVisualEffectFor('flashOnSearch') && !(typeof this.isIncrementalSearch === "function" ? this.isIncrementalSearch() : void 0)) {
          match.flash(flashOptions);
        }
      } else {
        this.matches.refresh();
        if (this.getVisualEffectFor('flashOnSearch')) {
          match.flash(flashOptions);
        }
      }
      if (this.getVisualEffectFor('showHoverSearchCounter')) {
        return this.vimState.hoverSearchCounter.withTimeout(match.getStartPoint(), {
          text: this.matches.getCounterText(),
          classList: match.getClassList(),
          timeout: timeout
        });
      }
    };

    return SearchBase;

  })(Motion);

  Search = (function(_super) {
    __extends(Search, _super);

    function Search() {
      return Search.__super__.constructor.apply(this, arguments);
    }

    Search.extend();

    Search.prototype.configScope = "Search";

    Search.prototype.requireInput = true;

    Search.prototype.isIncrementalSearch = function() {
      return settings.get('incrementalSearch');
    };

    Search.prototype.initialize = function() {
      Search.__super__.initialize.apply(this, arguments);
      if (this.isIncrementalSearch()) {
        this.activateIncrementalSearch();
      }
      this.onDidConfirmSearch((function(_this) {
        return function(_arg) {
          var searchChar, _ref2;
          _this.input = _arg.input, _this.landingPoint = _arg.landingPoint;
          if (!_this.isIncrementalSearch()) {
            searchChar = _this.isBackwards() ? '?' : '/';
            if ((_ref2 = _this.input) === '' || _ref2 === searchChar) {
              _this.input = _this.vimState.searchHistory.get('prev');
              if (!_this.input) {
                atom.beep();
              }
            }
          }
          return _this.processOperation();
        };
      })(this));
      this.onDidCancelSearch((function(_this) {
        return function() {
          if (!(_this.isMode('visual') || _this.isMode('insert'))) {
            _this.vimState.resetNormalMode();
          }
          if (typeof _this.restoreEditorState === "function") {
            _this.restoreEditorState();
          }
          _this.vimState.reset();
          return _this.finish();
        };
      })(this));
      this.onDidChangeSearch((function(_this) {
        return function(input) {
          _this.input = input;
          if (_this.input.startsWith(' ')) {
            _this.useRegexp = false;
            _this.input = input.replace(/^ /, '');
          } else {
            _this.useRegexp = true;
          }
          _this.vimState.searchInput.updateOptionSettings({
            useRegexp: _this.useRegexp
          });
          if (_this.isIncrementalSearch()) {
            return _this.visitCursors();
          }
        };
      })(this));
      return this.vimState.searchInput.focus({
        backwards: this.backwards
      });
    };

    Search.prototype.activateIncrementalSearch = function() {
      var refresh;
      this.restoreEditorState = saveEditorState(this.editor);
      refresh = (function(_this) {
        return function() {
          var _ref2;
          return (_ref2 = _this.matches) != null ? _ref2.refresh() : void 0;
        };
      })(this);
      this.subscribe(this.editorElement.onDidChangeScrollTop(refresh));
      this.subscribe(this.editorElement.onDidChangeScrollLeft(refresh));
      return this.onDidCommandSearch((function(_this) {
        return function(command) {
          var direction;
          if (!_this.input) {
            return;
          }
          if (_this.matches.isEmpty()) {
            return;
          }
          switch (command.name) {
            case 'visit':
              direction = command.direction;
              if (_this.isBackwards() && settings.get('incrementalSearchVisitDirection') === 'relative') {
                direction = (function() {
                  switch (direction) {
                    case 'next':
                      return 'prev';
                    case 'prev':
                      return 'next';
                  }
                })();
              }
              return _this.visitMatch(direction);
            case 'occurrence':
              if (command.operation != null) {
                _this.vimState.occurrenceManager.resetPatterns();
              }
              _this.vimState.occurrenceManager.addPattern(_this.matches.pattern);
              _this.vimState.searchHistory.save(_this.input);
              _this.vimState.searchInput.cancel();
              if (command.operation != null) {
                return _this.vimState.operationStack.run(command.operation);
              }
          }
        };
      })(this));
    };

    Search.prototype.visitCursors = function() {
      var cursor, input, visitCursor, _i, _len, _ref2, _ref3, _results;
      visitCursor = (function(_this) {
        return function(cursor) {
          if (_this.matches == null) {
            _this.matches = _this.getMatchList(cursor, input);
          }
          if (_this.matches.isEmpty()) {
            if (_this.getVisualEffectFor('flashScreenOnSearchHasNoMatch')) {
              return _this.flashScreen();
            }
          } else {
            return _this.visitMatch();
          }
        };
      })(this);
      if ((_ref2 = this.matches) != null) {
        _ref2.destroy();
      }
      this.matches = null;
      if (this.getVisualEffectFor('showHoverSearchCounter')) {
        this.vimState.hoverSearchCounter.reset();
      }
      input = this.getInput();
      if (input !== '') {
        _ref3 = this.editor.getCursors();
        _results = [];
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          cursor = _ref3[_i];
          _results.push(visitCursor(cursor));
        }
        return _results;
      }
    };

    Search.prototype.getPattern = function(term) {
      var modifiers;
      modifiers = this.isCaseSensitive(term) ? 'g' : 'gi';
      if (term.indexOf('\\c') >= 0) {
        term = term.replace('\\c', '');
        if (__indexOf.call(modifiers, 'i') < 0) {
          modifiers += 'i';
        }
      }
      if (this.useRegexp) {
        try {
          return new RegExp(term, modifiers);
        } catch (_error) {
          return new RegExp(_.escapeRegExp(term), modifiers);
        }
      } else {
        return new RegExp(_.escapeRegExp(term), modifiers);
      }
    };

    return Search;

  })(SearchBase);

  SearchBackwards = (function(_super) {
    __extends(SearchBackwards, _super);

    function SearchBackwards() {
      return SearchBackwards.__super__.constructor.apply(this, arguments);
    }

    SearchBackwards.extend();

    SearchBackwards.prototype.backwards = true;

    return SearchBackwards;

  })(Search);

  SearchCurrentLine = (function(_super) {
    __extends(SearchCurrentLine, _super);

    function SearchCurrentLine() {
      return SearchCurrentLine.__super__.constructor.apply(this, arguments);
    }

    SearchCurrentLine.extend();

    SearchCurrentLine.prototype.quiet = true;

    SearchCurrentLine.prototype.getScanRanges = function() {
      return [this.editor.getLastCursor().getCurrentLineBufferRange()];
    };

    return SearchCurrentLine;

  })(Search);

  SearchCurrentLineBackwards = (function(_super) {
    __extends(SearchCurrentLineBackwards, _super);

    function SearchCurrentLineBackwards() {
      return SearchCurrentLineBackwards.__super__.constructor.apply(this, arguments);
    }

    SearchCurrentLineBackwards.extend();

    SearchCurrentLineBackwards.prototype.backwards = true;

    return SearchCurrentLineBackwards;

  })(SearchCurrentLine);

  SearchCurrentWord = (function(_super) {
    __extends(SearchCurrentWord, _super);

    function SearchCurrentWord() {
      return SearchCurrentWord.__super__.constructor.apply(this, arguments);
    }

    SearchCurrentWord.extend();

    SearchCurrentWord.prototype.configScope = "SearchCurrentWord";

    SearchCurrentWord.prototype.getInput = function() {
      var wordRange;
      return this.input != null ? this.input : this.input = (wordRange = this.getCurrentWordBufferRange(), wordRange != null ? (this.editor.setCursorBufferPosition(wordRange.start), this.editor.getTextInBufferRange(wordRange)) : '');
    };

    SearchCurrentWord.prototype.getPattern = function(term) {
      var modifiers, pattern;
      modifiers = this.isCaseSensitive(term) ? 'g' : 'gi';
      pattern = _.escapeRegExp(term);
      if (/\W/.test(term)) {
        return new RegExp("" + pattern + "\\b", modifiers);
      } else {
        return new RegExp("\\b" + pattern + "\\b", modifiers);
      }
    };

    SearchCurrentWord.prototype.getNextNonWhiteSpacePoint = function(from) {
      var point, scanRange;
      point = null;
      scanRange = [from, [from.row, Infinity]];
      this.editor.scanInBufferRange(/\S/, scanRange, function(_arg) {
        var range, stop;
        range = _arg.range, stop = _arg.stop;
        return point = range.start;
      });
      return point;
    };

    SearchCurrentWord.prototype.getCurrentWordBufferRange = function() {
      var cursor, fromPoint, options, originalPoint, wordRange;
      cursor = this.editor.getLastCursor();
      originalPoint = cursor.getBufferPosition();
      fromPoint = this.getNextNonWhiteSpacePoint(originalPoint);
      if (!fromPoint) {
        return;
      }
      cursor.setBufferPosition(fromPoint);
      options = {};
      if (cursor.isBetweenWordAndNonWord()) {
        options.includeNonWordCharacters = false;
      }
      wordRange = cursor.getCurrentWordBufferRange(options);
      cursor.setBufferPosition(originalPoint);
      return wordRange;
    };

    return SearchCurrentWord;

  })(SearchBase);

  SearchCurrentWordBackwards = (function(_super) {
    __extends(SearchCurrentWordBackwards, _super);

    function SearchCurrentWordBackwards() {
      return SearchCurrentWordBackwards.__super__.constructor.apply(this, arguments);
    }

    SearchCurrentWordBackwards.extend();

    SearchCurrentWordBackwards.prototype.backwards = true;

    return SearchCurrentWordBackwards;

  })(SearchCurrentWord);

  RepeatSearch = (function(_super) {
    __extends(RepeatSearch, _super);

    function RepeatSearch() {
      return RepeatSearch.__super__.constructor.apply(this, arguments);
    }

    RepeatSearch.extend();

    RepeatSearch.prototype.initialize = function() {
      var search;
      RepeatSearch.__super__.initialize.apply(this, arguments);
      if (!(search = this.globalState.get('currentSearch'))) {
        this.abort();
      }
      return this.input = search.input, this.backwards = search.backwards, this.getPattern = search.getPattern, this.getCaseSensitivity = search.getCaseSensitivity, this.configScope = search.configScope, this.quiet = search.quiet, search;
    };

    return RepeatSearch;

  })(SearchBase);

  RepeatSearchReverse = (function(_super) {
    __extends(RepeatSearchReverse, _super);

    function RepeatSearchReverse() {
      return RepeatSearchReverse.__super__.constructor.apply(this, arguments);
    }

    RepeatSearchReverse.extend();

    RepeatSearchReverse.prototype.isBackwards = function() {
      return !this.backwards;
    };

    return RepeatSearchReverse;

  })(RepeatSearch);

  MoveToPreviousFoldStart = (function(_super) {
    __extends(MoveToPreviousFoldStart, _super);

    function MoveToPreviousFoldStart() {
      return MoveToPreviousFoldStart.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousFoldStart.extend();

    MoveToPreviousFoldStart.description = "Move to previous fold start";

    MoveToPreviousFoldStart.prototype.linewise = false;

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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9tb3Rpb24uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGt5RUFBQTtJQUFBOzt5SkFBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0EsT0FBaUIsT0FBQSxDQUFRLE1BQVIsQ0FBakIsRUFBQyxhQUFBLEtBQUQsRUFBUSxhQUFBLEtBRFIsQ0FBQTs7QUFBQSxFQUVBLE1BQUEsR0FBUyxJQUZULENBQUE7O0FBQUEsRUFJQSxRQTZCSSxPQUFBLENBQVEsU0FBUixDQTdCSixFQUNFLHdCQUFBLGVBREYsRUFDbUIsOEJBQUEscUJBRG5CLEVBRUUsdUJBQUEsY0FGRixFQUVrQix3QkFBQSxlQUZsQixFQUdFLDJCQUFBLGtCQUhGLEVBR3NCLDZCQUFBLG9CQUh0QixFQUlFLDZCQUFBLG9CQUpGLEVBS0UsMkJBQUEsa0JBTEYsRUFNRSwrQkFBQSxzQkFORixFQU9FLGlDQUFBLHdCQVBGLEVBTzRCLGdDQUFBLHVCQVA1QixFQVFFLDZCQUFBLG9CQVJGLEVBUXdCLDZCQUFBLG9CQVJ4QixFQVNFLHdCQUFBLGVBVEYsRUFVRSx3Q0FBQSwrQkFWRixFQVdFLG1CQUFBLFVBWEYsRUFZRSxtQ0FBQSwwQkFaRixFQWFFLDZCQUFBLG9CQWJGLEVBY0Usc0NBQUEsNkJBZEYsRUFlRSwyQkFBQSxrQkFmRixFQWdCRSw2QkFBQSxvQkFoQkYsRUFpQkUsNkNBQUEsb0NBakJGLEVBa0JFLHFDQUFBLDRCQWxCRixFQW1CRSx5Q0FBQSxnQ0FuQkYsRUFvQkUsc0JBQUEsYUFwQkYsRUFxQkUsbUNBQUEsMEJBckJGLEVBc0JFLGlDQUFBLHdCQXRCRixFQXVCRSw4Q0FBQSxxQ0F2QkYsRUF3QkUsb0RBQUEsMkNB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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/motion.coffee
