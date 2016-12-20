(function() {
  var Disposable, Point, Range, WhiteSpaceRegExp, adjustRangeToRowRange, buildWordPatternByCursor, countChar, cursorIsAtEmptyRow, cursorIsAtEndOfLineAtNonEmptyRow, cursorIsAtFirstCharacter, cursorIsAtVimEndOfFile, cursorIsOnWhiteSpace, debug, destroyNonLastSelection, detectScopeStartPositionForScope, findIndexBy, fs, getAncestors, getBeginningOfWordBufferPosition, getBufferRangeForPatternFromPoint, getBufferRangeForRowRange, getBufferRows, getCharacterAtBufferPosition, getCharacterAtCursor, getCharacterForEvent, getCodeFoldRowRanges, getCodeFoldRowRangesContainesForRow, getCurrentWordBufferRangeAndKind, getEndOfLineForBufferRow, getEndOfWordBufferPosition, getEndPositionForPattern, getFirstCharacterBufferPositionForScreenRow, getFirstCharacterColumForBufferRow, getFirstCharacterPositionForBufferRow, getFirstVisibleScreenRow, getIndentLevelForBufferRow, getIndex, getKeyBindingForCommand, getKeystrokeForEvent, getLargestFoldRangeContainsBufferRow, getLastVisibleScreenRow, getNonWordCharactersForCursor, getParagraphBoundaryRow, getParent, getRangeByTranslatePointAndClip, getScopesForTokenizedLine, getStartPositionForPattern, getTextInScreenRange, getTextToPoint, getTokenizedLineForRow, getValidVimBufferRow, getValidVimScreenRow, getVimEofBufferPosition, getVimEofScreenPosition, getVimLastBufferRow, getVimLastScreenRow, getVisibleBufferRange, getVisibleEditors, getWordBufferRangeAndKindAtBufferPosition, getWordBufferRangeAtBufferPosition, getWordPatternAtBufferPosition, haveSomeNonEmptySelection, highlightRange, highlightRanges, include, isAllWhiteSpace, isEmptyRow, isEndsWithNewLineForBufferRow, isFunctionScope, isIncludeFunctionScopeForRow, isLinewiseRange, isRangeContainsSomePoint, isSingleLine, keystrokeToCharCode, matchScopes, mergeIntersectingRanges, moveCursor, moveCursorDownBuffer, moveCursorDownScreen, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUpBuffer, moveCursorUpScreen, pointIsAtEndOfLine, pointIsAtVimEndOfFile, pointIsOnWhiteSpace, registerElement, saveCursorPositions, saveEditorState, scanEditor, scanForScopeStart, scanInRanges, screenPositionIsAtWhiteSpace, settings, shouldPreventWrapLine, shrinkRangeEndToBeforeNewLine, smartScrollToBufferPosition, sortComparable, sortRanges, sortRangesByEndPosition, translatePointAndClip, trimRange, withVisibleBufferRange, _, _ref,
    __slice = [].slice;

  fs = require('fs-plus');

  settings = require('./settings');

  _ref = require('atom'), Disposable = _ref.Disposable, Range = _ref.Range, Point = _ref.Point;

  _ = require('underscore-plus');

  getParent = function(obj) {
    var _ref1;
    return (_ref1 = obj.__super__) != null ? _ref1.constructor : void 0;
  };

  getAncestors = function(obj) {
    var ancestors, current;
    ancestors = [];
    current = obj;
    while (true) {
      ancestors.push(current);
      current = getParent(current);
      if (!current) {
        break;
      }
    }
    return ancestors;
  };

  getKeyBindingForCommand = function(command, _arg) {
    var keymap, keymapPath, keymaps, keystrokes, packageName, results, selector, _i, _len;
    packageName = _arg.packageName;
    results = null;
    keymaps = atom.keymaps.getKeyBindings();
    if (packageName != null) {
      keymapPath = atom.packages.getActivePackage(packageName).getKeymapPaths().pop();
      keymaps = keymaps.filter(function(_arg1) {
        var source;
        source = _arg1.source;
        return source === keymapPath;
      });
    }
    for (_i = 0, _len = keymaps.length; _i < _len; _i++) {
      keymap = keymaps[_i];
      if (!(keymap.command === command)) {
        continue;
      }
      keystrokes = keymap.keystrokes, selector = keymap.selector;
      keystrokes = keystrokes.replace(/shift-/, '');
      (results != null ? results : results = []).push({
        keystrokes: keystrokes,
        selector: selector
      });
    }
    return results;
  };

  include = function(klass, module) {
    var key, value, _results;
    _results = [];
    for (key in module) {
      value = module[key];
      _results.push(klass.prototype[key] = value);
    }
    return _results;
  };

  debug = function() {
    var filePath, messages;
    messages = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (!settings.get('debug')) {
      return;
    }
    switch (settings.get('debugOutput')) {
      case 'console':
        return console.log.apply(console, messages);
      case 'file':
        filePath = fs.normalize(settings.get('debugOutputFilePath'));
        if (fs.existsSync(filePath)) {
          return fs.appendFileSync(filePath, messages + "\n");
        }
    }
  };

  saveEditorState = function(editor) {
    var editorElement, foldStartRows, scrollTop;
    editorElement = editor.element;
    scrollTop = editorElement.getScrollTop();
    foldStartRows = editor.displayLayer.findFoldMarkers({}).map(function(m) {
      return m.getStartPosition().row;
    });
    return function() {
      var row, _i, _len, _ref1;
      _ref1 = foldStartRows.reverse();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        row = _ref1[_i];
        if (!editor.isFoldedAtBufferRow(row)) {
          editor.foldBufferRow(row);
        }
      }
      return editorElement.setScrollTop(scrollTop);
    };
  };

  saveCursorPositions = function(editor) {
    var cursor, points, _i, _len, _ref1;
    points = new Map;
    _ref1 = editor.getCursors();
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      cursor = _ref1[_i];
      points.set(cursor, cursor.getBufferPosition());
    }
    return function() {
      var point, _j, _len1, _ref2, _results;
      _ref2 = editor.getCursors();
      _results = [];
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        cursor = _ref2[_j];
        if (!(points.has(cursor))) {
          continue;
        }
        point = points.get(cursor);
        _results.push(cursor.setBufferPosition(point));
      }
      return _results;
    };
  };

  getKeystrokeForEvent = function(event) {
    var keyboardEvent, _ref1;
    keyboardEvent = (_ref1 = event.originalEvent.originalEvent) != null ? _ref1 : event.originalEvent;
    return atom.keymaps.keystrokeForKeyboardEvent(keyboardEvent);
  };

  keystrokeToCharCode = {
    backspace: 8,
    tab: 9,
    enter: 13,
    escape: 27,
    space: 32,
    "delete": 127
  };

  getCharacterForEvent = function(event) {
    var charCode, keystroke;
    keystroke = getKeystrokeForEvent(event);
    if (charCode = keystrokeToCharCode[keystroke]) {
      return String.fromCharCode(charCode);
    } else {
      return keystroke;
    }
  };

  isLinewiseRange = function(_arg) {
    var end, start, _ref1;
    start = _arg.start, end = _arg.end;
    return (start.row !== end.row) && ((start.column === (_ref1 = end.column) && _ref1 === 0));
  };

  isEndsWithNewLineForBufferRow = function(editor, row) {
    var end, start, _ref1;
    _ref1 = editor.bufferRangeForBufferRow(row, {
      includeNewline: true
    }), start = _ref1.start, end = _ref1.end;
    return (!start.isEqual(end)) && end.column === 0;
  };

  haveSomeNonEmptySelection = function(editor) {
    return editor.getSelections().some(function(selection) {
      return !selection.isEmpty();
    });
  };

  sortRanges = function(ranges) {
    return ranges.sort(function(a, b) {
      return a.compare(b);
    });
  };

  sortRangesByEndPosition = function(ranges, fn) {
    return ranges.sort(function(a, b) {
      return a.end.compare(b.end);
    });
  };

  getIndex = function(index, list) {
    var length;
    length = list.length;
    if (length === 0) {
      return -1;
    } else {
      index = index % length;
      if (index >= 0) {
        return index;
      } else {
        return length + index;
      }
    }
  };

  withVisibleBufferRange = function(editor, fn) {
    var disposable, range;
    if (range = getVisibleBufferRange(editor)) {
      return fn(range);
    } else {
      return disposable = editor.element.onDidAttach(function() {
        disposable.dispose();
        range = getVisibleBufferRange(editor);
        return fn(range);
      });
    }
  };

  getVisibleBufferRange = function(editor) {
    var endRow, startRow, _ref1;
    _ref1 = editor.element.getVisibleRowRange(), startRow = _ref1[0], endRow = _ref1[1];
    if (!((startRow != null) && (endRow != null))) {
      return null;
    }
    startRow = editor.bufferRowForScreenRow(startRow);
    endRow = editor.bufferRowForScreenRow(endRow);
    return new Range([startRow, 0], [endRow, Infinity]);
  };

  getVisibleEditors = function() {
    var editor, pane, _i, _len, _ref1, _results;
    _ref1 = atom.workspace.getPanes();
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      pane = _ref1[_i];
      if (editor = pane.getActiveEditor()) {
        _results.push(editor);
      }
    }
    return _results;
  };

  countChar = function(string, char) {
    return string.split(char).length - 1;
  };

  findIndexBy = function(list, fn) {
    var i, item, _i, _len;
    for (i = _i = 0, _len = list.length; _i < _len; i = ++_i) {
      item = list[i];
      if (fn(item)) {
        return i;
      }
    }
    return null;
  };

  mergeIntersectingRanges = function(ranges) {
    var i, index, range, result, _i, _len;
    result = [];
    for (i = _i = 0, _len = ranges.length; _i < _len; i = ++_i) {
      range = ranges[i];
      if (index = findIndexBy(result, function(r) {
        return r.intersectsWith(range);
      })) {
        result[index] = result[index].union(range);
      } else {
        result.push(range);
      }
    }
    return result;
  };

  getEndOfLineForBufferRow = function(editor, row) {
    return editor.bufferRangeForBufferRow(row).end;
  };

  pointIsAtEndOfLine = function(editor, point) {
    point = Point.fromObject(point);
    return getEndOfLineForBufferRow(editor, point.row).isEqual(point);
  };

  getCharacterAtCursor = function(cursor) {
    return getTextInScreenRange(cursor.editor, cursor.getScreenRange());
  };

  getCharacterAtBufferPosition = function(editor, startPosition) {
    var endPosition;
    endPosition = startPosition.translate([0, 1]);
    return editor.getTextInBufferRange([startPosition, endPosition]);
  };

  getTextInScreenRange = function(editor, screenRange) {
    var bufferRange;
    bufferRange = editor.bufferRangeForScreenRange(screenRange);
    return editor.getTextInBufferRange(bufferRange);
  };

  cursorIsOnWhiteSpace = function(cursor) {
    return isAllWhiteSpace(getCharacterAtCursor(cursor));
  };

  pointIsOnWhiteSpace = function(editor, point) {
    return isAllWhiteSpace(getCharacterAtBufferPosition(editor, point));
  };

  screenPositionIsAtWhiteSpace = function(editor, screenPosition) {
    var char, screenRange;
    screenRange = Range.fromPointWithDelta(screenPosition, 0, 1);
    char = getTextInScreenRange(editor, screenRange);
    return (char != null) && /\S/.test(char);
  };

  getNonWordCharactersForCursor = function(cursor) {
    var scope;
    if (cursor.getNonWordCharacters != null) {
      return cursor.getNonWordCharacters();
    } else {
      scope = cursor.getScopeDescriptor().getScopesArray();
      return atom.config.get('editor.nonWordCharacters', {
        scope: scope
      });
    }
  };

  moveCursorToNextNonWhitespace = function(cursor) {
    var originalPoint, vimEof;
    originalPoint = cursor.getBufferPosition();
    vimEof = getVimEofBufferPosition(cursor.editor);
    while (cursorIsOnWhiteSpace(cursor) && !cursor.getBufferPosition().isGreaterThanOrEqual(vimEof)) {
      cursor.moveRight();
    }
    return !originalPoint.isEqual(cursor.getBufferPosition());
  };

  getBufferRows = function(editor, _arg) {
    var direction, startRow, vimLastBufferRow, _i, _j, _ref1, _ref2, _results, _results1;
    startRow = _arg.startRow, direction = _arg.direction;
    switch (direction) {
      case 'previous':
        if (startRow <= 0) {
          return [];
        } else {
          return (function() {
            _results = [];
            for (var _i = _ref1 = startRow - 1; _ref1 <= 0 ? _i <= 0 : _i >= 0; _ref1 <= 0 ? _i++ : _i--){ _results.push(_i); }
            return _results;
          }).apply(this);
        }
        break;
      case 'next':
        vimLastBufferRow = getVimLastBufferRow(editor);
        if (startRow >= vimLastBufferRow) {
          return [];
        } else {
          return (function() {
            _results1 = [];
            for (var _j = _ref2 = startRow + 1; _ref2 <= vimLastBufferRow ? _j <= vimLastBufferRow : _j >= vimLastBufferRow; _ref2 <= vimLastBufferRow ? _j++ : _j--){ _results1.push(_j); }
            return _results1;
          }).apply(this);
        }
    }
  };

  getParagraphBoundaryRow = function(editor, startRow, direction, fn) {
    var isAtNonBlankRow, row, wasAtNonBlankRow, _i, _len, _ref1;
    wasAtNonBlankRow = !editor.isBufferRowBlank(startRow);
    _ref1 = getBufferRows(editor, {
      startRow: startRow,
      direction: direction
    });
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      row = _ref1[_i];
      isAtNonBlankRow = !editor.isBufferRowBlank(row);
      if (wasAtNonBlankRow !== isAtNonBlankRow) {
        if (fn != null) {
          if (typeof fn === "function" ? fn(isAtNonBlankRow) : void 0) {
            return row;
          }
        } else {
          return row;
        }
      }
      wasAtNonBlankRow = isAtNonBlankRow;
    }
  };

  getVimEofBufferPosition = function(editor) {
    var eof;
    eof = editor.getEofBufferPosition();
    if ((eof.row === 0) || (eof.column > 0)) {
      return eof;
    } else {
      return getEndOfLineForBufferRow(editor, eof.row - 1);
    }
  };

  getVimEofScreenPosition = function(editor) {
    return editor.screenPositionForBufferPosition(getVimEofBufferPosition(editor));
  };

  pointIsAtVimEndOfFile = function(editor, point) {
    return getVimEofBufferPosition(editor).isEqual(point);
  };

  cursorIsAtVimEndOfFile = function(cursor) {
    return pointIsAtVimEndOfFile(cursor.editor, cursor.getBufferPosition());
  };

  isEmptyRow = function(editor, row) {
    return editor.bufferRangeForBufferRow(row).isEmpty();
  };

  cursorIsAtEmptyRow = function(cursor) {
    return isEmptyRow(cursor.editor, cursor.getBufferRow());
  };

  cursorIsAtEndOfLineAtNonEmptyRow = function(cursor) {
    return cursor.isAtEndOfLine() && !cursor.isAtBeginningOfLine();
  };

  getVimLastBufferRow = function(editor) {
    return getVimEofBufferPosition(editor).row;
  };

  getVimLastScreenRow = function(editor) {
    return getVimEofScreenPosition(editor).row;
  };

  getFirstVisibleScreenRow = function(editor) {
    return editor.element.getFirstVisibleScreenRow();
  };

  getLastVisibleScreenRow = function(editor) {
    return editor.element.getLastVisibleScreenRow();
  };

  getFirstCharacterColumForBufferRow = function(editor, row) {
    var column, text;
    text = editor.lineTextForBufferRow(row);
    if ((column = text.search(/\S/)) >= 0) {
      return column;
    } else {
      return 0;
    }
  };

  trimRange = function(editor, scanRange) {
    var end, pattern, setEnd, setStart, start, _ref1;
    pattern = /\S/;
    _ref1 = [], start = _ref1[0], end = _ref1[1];
    setStart = function(_arg) {
      var range;
      range = _arg.range;
      return start = range.start, range;
    };
    editor.scanInBufferRange(pattern, scanRange, setStart);
    if (start != null) {
      setEnd = function(_arg) {
        var range;
        range = _arg.range;
        return end = range.end, range;
      };
      editor.backwardsScanInBufferRange(pattern, scanRange, setEnd);
      return new Range(start, end);
    } else {
      return scanRange;
    }
  };

  getFirstCharacterPositionForBufferRow = function(editor, row) {
    var from;
    from = [row, 0];
    return getEndPositionForPattern(editor, from, /\s*/, {
      containedOnly: true
    }) || from;
  };

  getFirstCharacterBufferPositionForScreenRow = function(editor, screenRow) {
    var end, point, scanRange, start;
    start = editor.clipScreenPosition([screenRow, 0], {
      skipSoftWrapIndentation: true
    });
    end = [screenRow, Infinity];
    scanRange = editor.bufferRangeForScreenRange([start, end]);
    point = null;
    editor.scanInBufferRange(/\S/, scanRange, function(_arg) {
      var range, stop;
      range = _arg.range, stop = _arg.stop;
      point = range.start;
      return stop();
    });
    return point != null ? point : scanRange.start;
  };

  cursorIsAtFirstCharacter = function(cursor) {
    var column, editor, firstCharColumn;
    editor = cursor.editor;
    column = cursor.getBufferColumn();
    firstCharColumn = getFirstCharacterColumForBufferRow(editor, cursor.getBufferRow());
    return column === firstCharColumn;
  };

  moveCursor = function(cursor, _arg, fn) {
    var goalColumn, preserveGoalColumn;
    preserveGoalColumn = _arg.preserveGoalColumn;
    goalColumn = cursor.goalColumn;
    fn(cursor);
    if (preserveGoalColumn && (goalColumn != null)) {
      return cursor.goalColumn = goalColumn;
    }
  };

  shouldPreventWrapLine = function(cursor) {
    var column, row, tabLength, text, _ref1;
    _ref1 = cursor.getBufferPosition(), row = _ref1.row, column = _ref1.column;
    if (atom.config.get('editor.softTabs')) {
      tabLength = atom.config.get('editor.tabLength');
      if ((0 < column && column < tabLength)) {
        text = cursor.editor.getTextInBufferRange([[row, 0], [row, tabLength]]);
        return /^\s+$/.test(text);
      } else {
        return false;
      }
    }
  };

  moveCursorLeft = function(cursor, options) {
    var allowWrap, motion, needSpecialCareToPreventWrapLine;
    if (options == null) {
      options = {};
    }
    allowWrap = options.allowWrap, needSpecialCareToPreventWrapLine = options.needSpecialCareToPreventWrapLine;
    delete options.allowWrap;
    if (needSpecialCareToPreventWrapLine) {
      if (shouldPreventWrapLine(cursor)) {
        return;
      }
    }
    if (!cursor.isAtBeginningOfLine() || allowWrap) {
      motion = function(cursor) {
        return cursor.moveLeft();
      };
      return moveCursor(cursor, options, motion);
    }
  };

  moveCursorRight = function(cursor, options) {
    var allowWrap, motion;
    if (options == null) {
      options = {};
    }
    allowWrap = options.allowWrap;
    delete options.allowWrap;
    if (!cursor.isAtEndOfLine() || allowWrap) {
      motion = function(cursor) {
        return cursor.moveRight();
      };
      return moveCursor(cursor, options, motion);
    }
  };

  moveCursorUpScreen = function(cursor, options) {
    var motion;
    if (options == null) {
      options = {};
    }
    if (cursor.getScreenRow() !== 0) {
      motion = function(cursor) {
        return cursor.moveUp();
      };
      return moveCursor(cursor, options, motion);
    }
  };

  moveCursorDownScreen = function(cursor, options) {
    var motion;
    if (options == null) {
      options = {};
    }
    if (getVimLastScreenRow(cursor.editor) !== cursor.getScreenRow()) {
      motion = function(cursor) {
        return cursor.moveDown();
      };
      return moveCursor(cursor, options, motion);
    }
  };

  moveCursorDownBuffer = function(cursor) {
    var point;
    point = cursor.getBufferPosition();
    if (getVimLastBufferRow(cursor.editor) !== point.row) {
      return cursor.setBufferPosition(point.translate([+1, 0]));
    }
  };

  moveCursorUpBuffer = function(cursor) {
    var point;
    point = cursor.getBufferPosition();
    if (point.row !== 0) {
      return cursor.setBufferPosition(point.translate([-1, 0]));
    }
  };

  moveCursorToFirstCharacterAtRow = function(cursor, row) {
    cursor.setBufferPosition([row, 0]);
    return cursor.moveToFirstCharacterOfLine();
  };

  highlightRanges = function(editor, ranges, options) {
    var decorateOptions, destroyMarkers, invalidate, marker, markers, range, timeout, _i, _len, _ref1;
    if (!_.isArray(ranges)) {
      ranges = [ranges];
    }
    if (!ranges.length) {
      return null;
    }
    invalidate = (_ref1 = options.invalidate) != null ? _ref1 : 'never';
    markers = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = ranges.length; _i < _len; _i++) {
        range = ranges[_i];
        _results.push(editor.markBufferRange(range, {
          invalidate: invalidate
        }));
      }
      return _results;
    })();
    decorateOptions = {
      type: 'highlight',
      "class": options["class"]
    };
    for (_i = 0, _len = markers.length; _i < _len; _i++) {
      marker = markers[_i];
      editor.decorateMarker(marker, decorateOptions);
    }
    timeout = options.timeout;
    if (timeout != null) {
      destroyMarkers = function() {
        return _.invoke(markers, 'destroy');
      };
      setTimeout(destroyMarkers, timeout);
    }
    return markers;
  };

  highlightRange = function(editor, range, options) {
    return highlightRanges(editor, [range], options)[0];
  };

  getValidVimBufferRow = function(editor, row) {
    var vimLastBufferRow;
    vimLastBufferRow = getVimLastBufferRow(editor);
    switch (false) {
      case !(row < 0):
        return 0;
      case !(row > vimLastBufferRow):
        return vimLastBufferRow;
      default:
        return row;
    }
  };

  getValidVimScreenRow = function(editor, row) {
    var vimLastScreenRow;
    vimLastScreenRow = getVimLastScreenRow(editor);
    switch (false) {
      case !(row < 0):
        return 0;
      case !(row > vimLastScreenRow):
        return vimLastScreenRow;
      default:
        return row;
    }
  };

  getTextToPoint = function(editor, _arg, _arg1) {
    var column, exclusive, row;
    row = _arg.row, column = _arg.column;
    exclusive = (_arg1 != null ? _arg1 : {}).exclusive;
    if (exclusive == null) {
      exclusive = true;
    }
    if (exclusive) {
      return editor.lineTextForBufferRow(row).slice(0, column);
    } else {
      return editor.lineTextForBufferRow(row).slice(0, +column + 1 || 9e9);
    }
  };

  getIndentLevelForBufferRow = function(editor, row) {
    var text;
    text = editor.lineTextForBufferRow(row);
    return editor.indentLevelForLine(text);
  };

  WhiteSpaceRegExp = /^\s*$/;

  isAllWhiteSpace = function(text) {
    return WhiteSpaceRegExp.test(text);
  };

  getCodeFoldRowRanges = function(editor) {
    var _i, _ref1, _results;
    return (function() {
      _results = [];
      for (var _i = 0, _ref1 = editor.getLastBufferRow(); 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; 0 <= _ref1 ? _i++ : _i--){ _results.push(_i); }
      return _results;
    }).apply(this).map(function(row) {
      return editor.languageMode.rowRangeForCodeFoldAtBufferRow(row);
    }).filter(function(rowRange) {
      return (rowRange != null) && (rowRange[0] != null) && (rowRange[1] != null);
    });
  };

  getCodeFoldRowRangesContainesForRow = function(editor, bufferRow, _arg) {
    var includeStartRow;
    includeStartRow = (_arg != null ? _arg : {}).includeStartRow;
    if (includeStartRow == null) {
      includeStartRow = true;
    }
    return getCodeFoldRowRanges(editor).filter(function(_arg1) {
      var endRow, startRow;
      startRow = _arg1[0], endRow = _arg1[1];
      if (includeStartRow) {
        return (startRow <= bufferRow && bufferRow <= endRow);
      } else {
        return (startRow < bufferRow && bufferRow <= endRow);
      }
    });
  };

  getBufferRangeForRowRange = function(editor, rowRange) {
    var endRange, startRange, _ref1;
    _ref1 = rowRange.map(function(row) {
      return editor.bufferRangeForBufferRow(row, {
        includeNewline: true
      });
    }), startRange = _ref1[0], endRange = _ref1[1];
    return startRange.union(endRange);
  };

  getTokenizedLineForRow = function(editor, row) {
    return editor.tokenizedBuffer.tokenizedLineForRow(row);
  };

  getScopesForTokenizedLine = function(line) {
    var tag, _i, _len, _ref1, _results;
    _ref1 = line.tags;
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      tag = _ref1[_i];
      if (tag < 0 && (tag % 2 === -1)) {
        _results.push(atom.grammars.scopeForId(tag));
      }
    }
    return _results;
  };

  scanForScopeStart = function(editor, fromPoint, direction, fn) {
    var column, continueScan, isValidToken, position, result, results, row, scanRows, scope, stop, tag, tokenIterator, tokenizedLine, _i, _j, _k, _len, _len1, _len2, _ref1;
    fromPoint = Point.fromObject(fromPoint);
    scanRows = (function() {
      var _i, _j, _ref1, _ref2, _ref3, _results, _results1;
      switch (direction) {
        case 'forward':
          return (function() {
            _results = [];
            for (var _i = _ref1 = fromPoint.row, _ref2 = editor.getLastBufferRow(); _ref1 <= _ref2 ? _i <= _ref2 : _i >= _ref2; _ref1 <= _ref2 ? _i++ : _i--){ _results.push(_i); }
            return _results;
          }).apply(this);
        case 'backward':
          return (function() {
            _results1 = [];
            for (var _j = _ref3 = fromPoint.row; _ref3 <= 0 ? _j <= 0 : _j >= 0; _ref3 <= 0 ? _j++ : _j--){ _results1.push(_j); }
            return _results1;
          }).apply(this);
      }
    })();
    continueScan = true;
    stop = function() {
      return continueScan = false;
    };
    isValidToken = (function() {
      switch (direction) {
        case 'forward':
          return function(_arg) {
            var position;
            position = _arg.position;
            return position.isGreaterThan(fromPoint);
          };
        case 'backward':
          return function(_arg) {
            var position;
            position = _arg.position;
            return position.isLessThan(fromPoint);
          };
      }
    })();
    for (_i = 0, _len = scanRows.length; _i < _len; _i++) {
      row = scanRows[_i];
      if (!(tokenizedLine = getTokenizedLineForRow(editor, row))) {
        continue;
      }
      column = 0;
      results = [];
      tokenIterator = tokenizedLine.getTokenIterator();
      _ref1 = tokenizedLine.tags;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        tag = _ref1[_j];
        tokenIterator.next();
        if (tag < 0) {
          scope = atom.grammars.scopeForId(tag);
          if ((tag % 2) === 0) {
            null;
          } else {
            position = new Point(row, column);
            results.push({
              scope: scope,
              position: position,
              stop: stop
            });
          }
        } else {
          column += tag;
        }
      }
      results = results.filter(isValidToken);
      if (direction === 'backward') {
        results.reverse();
      }
      for (_k = 0, _len2 = results.length; _k < _len2; _k++) {
        result = results[_k];
        fn(result);
        if (!continueScan) {
          return;
        }
      }
      if (!continueScan) {
        return;
      }
    }
  };

  detectScopeStartPositionForScope = function(editor, fromPoint, direction, scope) {
    var point;
    point = null;
    scanForScopeStart(editor, fromPoint, direction, function(info) {
      if (info.scope.search(scope) >= 0) {
        info.stop();
        return point = info.position;
      }
    });
    return point;
  };

  isIncludeFunctionScopeForRow = function(editor, row) {
    var tokenizedLine;
    if (tokenizedLine = getTokenizedLineForRow(editor, row)) {
      return getScopesForTokenizedLine(tokenizedLine).some(function(scope) {
        return isFunctionScope(editor, scope);
      });
    } else {
      return false;
    }
  };

  isFunctionScope = function(editor, scope) {
    var scopeName;
    scopeName = editor.getGrammar().scopeName;
    switch (scopeName) {
      case 'source.go':
        return /^entity\.name\.function/.test(scope);
      default:
        return /^meta\.function\./.test(scope);
    }
  };

  getStartPositionForPattern = function(editor, from, pattern, options) {
    var containedOnly, point, scanRange, _ref1;
    if (options == null) {
      options = {};
    }
    from = Point.fromObject(from);
    containedOnly = (_ref1 = options.containedOnly) != null ? _ref1 : false;
    scanRange = [[from.row, 0], from];
    point = null;
    editor.backwardsScanInBufferRange(pattern, scanRange, function(_arg) {
      var matchText, range, stop;
      range = _arg.range, matchText = _arg.matchText, stop = _arg.stop;
      if (matchText === '' && range.start.column !== 0) {
        return;
      }
      if ((!containedOnly) || range.end.isGreaterThanOrEqual(from)) {
        point = range.start;
        return stop();
      }
    });
    return point;
  };

  getEndPositionForPattern = function(editor, from, pattern, options) {
    var containedOnly, point, scanRange, _ref1;
    if (options == null) {
      options = {};
    }
    from = Point.fromObject(from);
    containedOnly = (_ref1 = options.containedOnly) != null ? _ref1 : false;
    scanRange = [from, [from.row, Infinity]];
    point = null;
    editor.scanInBufferRange(pattern, scanRange, function(_arg) {
      var matchText, range, stop;
      range = _arg.range, matchText = _arg.matchText, stop = _arg.stop;
      if (matchText === '' && range.start.column !== 0) {
        return;
      }
      if ((!containedOnly) || range.start.isLessThanOrEqual(from)) {
        point = range.end;
        return stop();
      }
    });
    return point;
  };

  getBufferRangeForPatternFromPoint = function(editor, fromPoint, pattern) {
    var end, start;
    end = getEndPositionForPattern(editor, fromPoint, pattern, {
      containedOnly: true
    });
    if (end != null) {
      start = getStartPositionForPattern(editor, end, pattern, {
        containedOnly: true
      });
    }
    if (start != null) {
      return new Range(start, end);
    }
  };

  sortComparable = function(collection) {
    return collection.sort(function(a, b) {
      return a.compare(b);
    });
  };

  smartScrollToBufferPosition = function(editor, point) {
    var center, editorAreaHeight, editorElement, onePageDown, onePageUp, target;
    editorElement = editor.element;
    editorAreaHeight = editor.getLineHeightInPixels() * (editor.getRowsPerPage() - 1);
    onePageUp = editorElement.getScrollTop() - editorAreaHeight;
    onePageDown = editorElement.getScrollBottom() + editorAreaHeight;
    target = editorElement.pixelPositionForBufferPosition(point).top;
    center = (onePageDown < target) || (target < onePageUp);
    return editor.scrollToBufferPosition(point, {
      center: center
    });
  };

  matchScopes = function(editorElement, scopes) {
    var className, classNames, classes, containsCount, _i, _j, _len, _len1;
    classes = scopes.map(function(scope) {
      return scope.split('.');
    });
    for (_i = 0, _len = classes.length; _i < _len; _i++) {
      classNames = classes[_i];
      containsCount = 0;
      for (_j = 0, _len1 = classNames.length; _j < _len1; _j++) {
        className = classNames[_j];
        if (editorElement.classList.contains(className)) {
          containsCount += 1;
        }
      }
      if (containsCount === classNames.length) {
        return true;
      }
    }
    return false;
  };

  isSingleLine = function(text) {
    return text.split(/\n|\r\n/).length === 1;
  };

  getWordBufferRangeAndKindAtBufferPosition = function(editor, point, options) {
    var characterAtPoint, cursor, kind, nonWordCharacters, nonWordRegex, range, singleNonWordChar, source, wordRegex, _ref1;
    if (options == null) {
      options = {};
    }
    singleNonWordChar = options.singleNonWordChar, wordRegex = options.wordRegex, nonWordCharacters = options.nonWordCharacters, cursor = options.cursor;
    if ((wordRegex == null) && (nonWordCharacters == null)) {
      if (cursor == null) {
        cursor = editor.getLastCursor();
      }
      _ref1 = _.extend(options, buildWordPatternByCursor(cursor, options)), wordRegex = _ref1.wordRegex, nonWordCharacters = _ref1.nonWordCharacters;
    }
    if (singleNonWordChar == null) {
      singleNonWordChar = false;
    }
    characterAtPoint = getCharacterAtBufferPosition(editor, point);
    nonWordRegex = new RegExp("[" + (_.escapeRegExp(nonWordCharacters)) + "]+");
    if (/\s/.test(characterAtPoint)) {
      source = "[\t ]+";
      kind = 'white-space';
      wordRegex = new RegExp(source);
    } else if (nonWordRegex.test(characterAtPoint) && !wordRegex.test(characterAtPoint)) {
      kind = 'non-word';
      if (singleNonWordChar) {
        source = _.escapeRegExp(characterAtPoint);
        wordRegex = new RegExp(source);
      } else {
        wordRegex = nonWordRegex;
      }
    } else {
      kind = 'word';
    }
    range = getWordBufferRangeAtBufferPosition(editor, point, {
      wordRegex: wordRegex
    });
    return {
      kind: kind,
      range: range
    };
  };

  getWordPatternAtBufferPosition = function(editor, point, options) {
    var kind, pattern, range, _ref1;
    if (options == null) {
      options = {};
    }
    _ref1 = getWordBufferRangeAndKindAtBufferPosition(editor, point, options), range = _ref1.range, kind = _ref1.kind;
    pattern = _.escapeRegExp(editor.getTextInBufferRange(range));
    if (kind === 'word') {
      pattern = "\\b" + pattern + "\\b";
    }
    return new RegExp(pattern, 'g');
  };

  buildWordPatternByCursor = function(cursor, _arg) {
    var nonWordCharacters, wordRegex;
    wordRegex = _arg.wordRegex;
    nonWordCharacters = getNonWordCharactersForCursor(cursor);
    if (wordRegex == null) {
      wordRegex = new RegExp("^[\t ]*$|[^\\s" + (_.escapeRegExp(nonWordCharacters)) + "]+");
    }
    return {
      wordRegex: wordRegex,
      nonWordCharacters: nonWordCharacters
    };
  };

  getCurrentWordBufferRangeAndKind = function(cursor, options) {
    if (options == null) {
      options = {};
    }
    return getWordBufferRangeAndKindAtBufferPosition(cursor.editor, cursor.getBufferPosition(), options);
  };

  getBeginningOfWordBufferPosition = function(editor, point, _arg) {
    var found, scanRange, wordRegex;
    wordRegex = (_arg != null ? _arg : {}).wordRegex;
    scanRange = [[point.row, 0], point];
    found = null;
    editor.backwardsScanInBufferRange(wordRegex, scanRange, function(_arg1) {
      var matchText, range, stop;
      range = _arg1.range, matchText = _arg1.matchText, stop = _arg1.stop;
      if (matchText === '' && range.start.column !== 0) {
        return;
      }
      if (range.start.isLessThan(point)) {
        if (range.end.isGreaterThanOrEqual(point)) {
          found = range.start;
        }
        return stop();
      }
    });
    return found != null ? found : point;
  };

  getEndOfWordBufferPosition = function(editor, point, _arg) {
    var found, scanRange, wordRegex;
    wordRegex = (_arg != null ? _arg : {}).wordRegex;
    scanRange = [point, [point.row, Infinity]];
    found = null;
    editor.scanInBufferRange(wordRegex, scanRange, function(_arg1) {
      var matchText, range, stop;
      range = _arg1.range, matchText = _arg1.matchText, stop = _arg1.stop;
      if (matchText === '' && range.start.column !== 0) {
        return;
      }
      if (range.end.isGreaterThan(point)) {
        if (range.start.isLessThanOrEqual(point)) {
          found = range.end;
        }
        return stop();
      }
    });
    return found != null ? found : point;
  };

  getWordBufferRangeAtBufferPosition = function(editor, position, options) {
    var endPosition, startPosition;
    if (options == null) {
      options = {};
    }
    startPosition = getBeginningOfWordBufferPosition(editor, position, options);
    endPosition = getEndOfWordBufferPosition(editor, startPosition, options);
    return new Range(startPosition, endPosition);
  };

  adjustRangeToRowRange = function(_arg, options) {
    var end, endRow, start, _ref1;
    start = _arg.start, end = _arg.end;
    if (options == null) {
      options = {};
    }
    endRow = end.row;
    if (end.column === 0) {
      endRow = Math.max(start.row, end.row - 1);
    }
    if ((_ref1 = options.endOnly) != null ? _ref1 : false) {
      return new Range(start, [endRow, Infinity]);
    } else {
      return new Range([start.row, 0], [endRow, Infinity]);
    }
  };

  shrinkRangeEndToBeforeNewLine = function(range) {
    var end, endRow, start;
    start = range.start, end = range.end;
    if (end.column === 0) {
      endRow = Math.max(start.row, end.row - 1);
      return new Range(start, [endRow, Infinity]);
    } else {
      return range;
    }
  };

  scanInRanges = function(editor, pattern, scanRanges, _arg) {
    var exclusiveIntersects, i, includeIntersects, isIntersects, originalScanRanges, ranges, scanRange, _i, _len, _ref1;
    _ref1 = _arg != null ? _arg : {}, includeIntersects = _ref1.includeIntersects, exclusiveIntersects = _ref1.exclusiveIntersects;
    if (includeIntersects) {
      originalScanRanges = scanRanges.slice();
      scanRanges = scanRanges.map(adjustRangeToRowRange);
      isIntersects = function(_arg1) {
        var range, scanRange;
        range = _arg1.range, scanRange = _arg1.scanRange;
        return scanRange.intersectsWith(range, exclusiveIntersects);
      };
    }
    ranges = [];
    for (i = _i = 0, _len = scanRanges.length; _i < _len; i = ++_i) {
      scanRange = scanRanges[i];
      editor.scanInBufferRange(pattern, scanRange, function(_arg1) {
        var range;
        range = _arg1.range;
        if (includeIntersects) {
          if (isIntersects({
            range: range,
            scanRange: originalScanRanges[i]
          })) {
            return ranges.push(range);
          }
        } else {
          return ranges.push(range);
        }
      });
    }
    return ranges;
  };

  scanEditor = function(editor, pattern) {
    var ranges;
    ranges = [];
    editor.scan(pattern, function(_arg) {
      var range;
      range = _arg.range;
      return ranges.push(range);
    });
    return ranges;
  };

  isRangeContainsSomePoint = function(range, points, _arg) {
    var exclusive;
    exclusive = (_arg != null ? _arg : {}).exclusive;
    if (exclusive == null) {
      exclusive = false;
    }
    return points.some(function(point) {
      return range.containsPoint(point, exclusive);
    });
  };

  destroyNonLastSelection = function(editor) {
    var selection, _i, _len, _ref1, _results;
    _ref1 = editor.getSelections();
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      selection = _ref1[_i];
      if (!selection.isLastSelection()) {
        _results.push(selection.destroy());
      }
    }
    return _results;
  };

  getLargestFoldRangeContainsBufferRow = function(editor, row) {
    var end, endPoint, marker, markers, start, startPoint, _i, _len, _ref1, _ref2;
    markers = editor.displayLayer.findFoldMarkers({
      intersectsRow: row
    });
    startPoint = null;
    endPoint = null;
    _ref1 = markers != null ? markers : [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      marker = _ref1[_i];
      _ref2 = marker.getRange(), start = _ref2.start, end = _ref2.end;
      if (!startPoint) {
        startPoint = start;
        endPoint = end;
        continue;
      }
      if (start.isLessThan(startPoint)) {
        startPoint = start;
        endPoint = end;
      }
    }
    if ((startPoint != null) && (endPoint != null)) {
      return new Range(startPoint, endPoint);
    }
  };

  translatePointAndClip = function(editor, point, direction, _arg) {
    var dontClip, eol, newRow, screenPoint, translate;
    translate = (_arg != null ? _arg : {}).translate;
    if (translate == null) {
      translate = true;
    }
    point = Point.fromObject(point);
    dontClip = false;
    switch (direction) {
      case 'forward':
        if (translate) {
          point = point.translate([0, +1]);
        }
        eol = editor.bufferRangeForBufferRow(point.row).end;
        if (point.isEqual(eol)) {
          dontClip = true;
        }
        if (point.isGreaterThan(eol)) {
          point = new Point(point.row + 1, 0);
          dontClip = true;
        }
        point = Point.min(point, editor.getEofBufferPosition());
        break;
      case 'backward':
        if (translate) {
          point = point.translate([0, -1]);
        }
        if (point.column < 0) {
          newRow = point.row - 1;
          eol = editor.bufferRangeForBufferRow(newRow).end;
          point = new Point(newRow, eol.column);
        }
        point = Point.max(point, Point.ZERO);
    }
    if (dontClip) {
      return point;
    } else {
      screenPoint = editor.screenPositionForBufferPosition(point, {
        clipDirection: direction
      });
      return editor.bufferPositionForScreenPosition(screenPoint);
    }
  };

  getRangeByTranslatePointAndClip = function(editor, range, which, direction, options) {
    var newPoint;
    newPoint = translatePointAndClip(editor, range[which], direction, options);
    switch (which) {
      case 'start':
        return new Range(newPoint, range.end);
      case 'end':
        return new Range(range.start, newPoint);
    }
  };

  registerElement = function(name, options) {
    var Element, element;
    element = document.createElement(name);
    if (element.constructor === HTMLElement) {
      Element = document.registerElement(name, options);
    } else {
      Element = element.constructor;
      if (options.prototype != null) {
        Element.prototype = options.prototype;
      }
    }
    return Element;
  };

  module.exports = {
    getParent: getParent,
    getAncestors: getAncestors,
    getKeyBindingForCommand: getKeyBindingForCommand,
    include: include,
    debug: debug,
    saveEditorState: saveEditorState,
    saveCursorPositions: saveCursorPositions,
    getKeystrokeForEvent: getKeystrokeForEvent,
    getCharacterForEvent: getCharacterForEvent,
    isLinewiseRange: isLinewiseRange,
    isEndsWithNewLineForBufferRow: isEndsWithNewLineForBufferRow,
    haveSomeNonEmptySelection: haveSomeNonEmptySelection,
    sortRanges: sortRanges,
    sortRangesByEndPosition: sortRangesByEndPosition,
    getIndex: getIndex,
    getVisibleBufferRange: getVisibleBufferRange,
    withVisibleBufferRange: withVisibleBufferRange,
    getVisibleEditors: getVisibleEditors,
    findIndexBy: findIndexBy,
    mergeIntersectingRanges: mergeIntersectingRanges,
    pointIsAtEndOfLine: pointIsAtEndOfLine,
    pointIsAtVimEndOfFile: pointIsAtVimEndOfFile,
    cursorIsAtVimEndOfFile: cursorIsAtVimEndOfFile,
    getVimEofBufferPosition: getVimEofBufferPosition,
    getVimEofScreenPosition: getVimEofScreenPosition,
    getVimLastBufferRow: getVimLastBufferRow,
    getVimLastScreenRow: getVimLastScreenRow,
    moveCursorLeft: moveCursorLeft,
    moveCursorRight: moveCursorRight,
    moveCursorUpScreen: moveCursorUpScreen,
    moveCursorDownScreen: moveCursorDownScreen,
    getEndOfLineForBufferRow: getEndOfLineForBufferRow,
    getFirstVisibleScreenRow: getFirstVisibleScreenRow,
    getLastVisibleScreenRow: getLastVisibleScreenRow,
    highlightRanges: highlightRanges,
    highlightRange: highlightRange,
    getValidVimBufferRow: getValidVimBufferRow,
    getValidVimScreenRow: getValidVimScreenRow,
    moveCursorToFirstCharacterAtRow: moveCursorToFirstCharacterAtRow,
    countChar: countChar,
    getTextToPoint: getTextToPoint,
    getIndentLevelForBufferRow: getIndentLevelForBufferRow,
    isAllWhiteSpace: isAllWhiteSpace,
    getCharacterAtCursor: getCharacterAtCursor,
    getTextInScreenRange: getTextInScreenRange,
    cursorIsOnWhiteSpace: cursorIsOnWhiteSpace,
    screenPositionIsAtWhiteSpace: screenPositionIsAtWhiteSpace,
    moveCursorToNextNonWhitespace: moveCursorToNextNonWhitespace,
    isEmptyRow: isEmptyRow,
    cursorIsAtEmptyRow: cursorIsAtEmptyRow,
    cursorIsAtEndOfLineAtNonEmptyRow: cursorIsAtEndOfLineAtNonEmptyRow,
    getCodeFoldRowRanges: getCodeFoldRowRanges,
    getCodeFoldRowRangesContainesForRow: getCodeFoldRowRangesContainesForRow,
    getBufferRangeForRowRange: getBufferRangeForRowRange,
    getFirstCharacterColumForBufferRow: getFirstCharacterColumForBufferRow,
    trimRange: trimRange,
    getFirstCharacterPositionForBufferRow: getFirstCharacterPositionForBufferRow,
    getFirstCharacterBufferPositionForScreenRow: getFirstCharacterBufferPositionForScreenRow,
    cursorIsAtFirstCharacter: cursorIsAtFirstCharacter,
    isFunctionScope: isFunctionScope,
    getStartPositionForPattern: getStartPositionForPattern,
    getEndPositionForPattern: getEndPositionForPattern,
    isIncludeFunctionScopeForRow: isIncludeFunctionScopeForRow,
    getTokenizedLineForRow: getTokenizedLineForRow,
    getScopesForTokenizedLine: getScopesForTokenizedLine,
    scanForScopeStart: scanForScopeStart,
    detectScopeStartPositionForScope: detectScopeStartPositionForScope,
    getBufferRows: getBufferRows,
    getParagraphBoundaryRow: getParagraphBoundaryRow,
    registerElement: registerElement,
    getBufferRangeForPatternFromPoint: getBufferRangeForPatternFromPoint,
    sortComparable: sortComparable,
    smartScrollToBufferPosition: smartScrollToBufferPosition,
    matchScopes: matchScopes,
    moveCursorDownBuffer: moveCursorDownBuffer,
    moveCursorUpBuffer: moveCursorUpBuffer,
    isSingleLine: isSingleLine,
    getCurrentWordBufferRangeAndKind: getCurrentWordBufferRangeAndKind,
    buildWordPatternByCursor: buildWordPatternByCursor,
    getWordBufferRangeAtBufferPosition: getWordBufferRangeAtBufferPosition,
    getWordBufferRangeAndKindAtBufferPosition: getWordBufferRangeAndKindAtBufferPosition,
    getWordPatternAtBufferPosition: getWordPatternAtBufferPosition,
    getNonWordCharactersForCursor: getNonWordCharactersForCursor,
    adjustRangeToRowRange: adjustRangeToRowRange,
    shrinkRangeEndToBeforeNewLine: shrinkRangeEndToBeforeNewLine,
    scanInRanges: scanInRanges,
    scanEditor: scanEditor,
    isRangeContainsSomePoint: isRangeContainsSomePoint,
    destroyNonLastSelection: destroyNonLastSelection,
    getLargestFoldRangeContainsBufferRow: getLargestFoldRangeContainsBufferRow,
    translatePointAndClip: translatePointAndClip,
    getRangeByTranslatePointAndClip: getRangeByTranslatePointAndClip
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi91dGlscy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsdTBFQUFBO0lBQUEsa0JBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBRFgsQ0FBQTs7QUFBQSxFQUdBLE9BQTZCLE9BQUEsQ0FBUSxNQUFSLENBQTdCLEVBQUMsa0JBQUEsVUFBRCxFQUFhLGFBQUEsS0FBYixFQUFvQixhQUFBLEtBSHBCLENBQUE7O0FBQUEsRUFJQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBSkosQ0FBQTs7QUFBQSxFQU1BLFNBQUEsR0FBWSxTQUFDLEdBQUQsR0FBQTtBQUNWLFFBQUEsS0FBQTtrREFBYSxDQUFFLHFCQURMO0VBQUEsQ0FOWixDQUFBOztBQUFBLEVBU0EsWUFBQSxHQUFlLFNBQUMsR0FBRCxHQUFBO0FBQ2IsUUFBQSxrQkFBQTtBQUFBLElBQUEsU0FBQSxHQUFZLEVBQVosQ0FBQTtBQUFBLElBQ0EsT0FBQSxHQUFVLEdBRFYsQ0FBQTtBQUVBLFdBQUEsSUFBQSxHQUFBO0FBQ0UsTUFBQSxTQUFTLENBQUMsSUFBVixDQUFlLE9BQWYsQ0FBQSxDQUFBO0FBQUEsTUFDQSxPQUFBLEdBQVUsU0FBQSxDQUFVLE9BQVYsQ0FEVixDQUFBO0FBRUEsTUFBQSxJQUFBLENBQUEsT0FBQTtBQUFBLGNBQUE7T0FIRjtJQUFBLENBRkE7V0FNQSxVQVBhO0VBQUEsQ0FUZixDQUFBOztBQUFBLEVBa0JBLHVCQUFBLEdBQTBCLFNBQUMsT0FBRCxFQUFVLElBQVYsR0FBQTtBQUN4QixRQUFBLGlGQUFBO0FBQUEsSUFEbUMsY0FBRCxLQUFDLFdBQ25D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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/utils.coffee
