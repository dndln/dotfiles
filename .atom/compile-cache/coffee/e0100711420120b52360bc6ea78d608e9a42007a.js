(function() {
  var Disposable, ElementBuilder, Point, Range, WhiteSpaceRegExp, adjustRangeToRowRange, buildWordPatternByCursor, clipScreenPositionForBufferPosition, countChar, cursorIsAtEmptyRow, cursorIsAtEndOfLineAtNonEmptyRow, cursorIsAtFirstCharacter, cursorIsAtVimEndOfFile, cursorIsOnWhiteSpace, debug, destroyNonLastSelection, detectScopeStartPositionForScope, findIndexBy, fs, getAncestors, getBeginningOfWordBufferPosition, getBufferRangeForPatternFromPoint, getBufferRangeForRowRange, getBufferRows, getCharacterAtBufferPosition, getCharacterAtCursor, getCharacterForEvent, getCodeFoldRowRanges, getCodeFoldRowRangesContainesForRow, getCurrentWordBufferRangeAndKind, getEndOfWordBufferPosition, getEndPositionForPattern, getEolForBufferRow, getFirstCharacterBufferPositionForScreenRow, getFirstCharacterColumForBufferRow, getFirstCharacterPositionForBufferRow, getFirstVisibleScreenRow, getIndentLevelForBufferRow, getIndex, getKeyBindingForCommand, getKeystrokeForEvent, getLargestFoldRangeContainsBufferRow, getLastVisibleScreenRow, getNewTextRangeFromCheckpoint, getNonWordCharactersForCursor, getParent, getRangeByTranslatePointAndClip, getScopesForTokenizedLine, getStartPositionForPattern, getTextInScreenRange, getTextToPoint, getTokenizedLineForRow, getValidVimBufferRow, getValidVimScreenRow, getView, getVimEofBufferPosition, getVimEofScreenPosition, getVimLastBufferRow, getVimLastScreenRow, getVisibleBufferRange, getVisibleEditors, getWordBufferRangeAndKindAtBufferPosition, getWordBufferRangeAtBufferPosition, getWordPatternAtBufferPosition, getWordPatternAtCursor, haveSomeSelection, highlightRanges, include, inspect, isAllWhiteSpace, isEmptyRow, isEndsWithNewLineForBufferRow, isFunctionScope, isIncludeFunctionScopeForRow, isLinewiseRange, isRangeContainsSomePoint, isSingleLine, isSurroundedBySpace, keystrokeToCharCode, logGoalColumnForSelection, matchScopes, mergeIntersectingRanges, moveCursor, moveCursorDownBuffer, moveCursorDownScreen, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUpBuffer, moveCursorUpScreen, normalizePatchChanges, pointIsAtEndOfLine, pointIsAtVimEndOfFile, pointIsOnWhiteSpace, registerElement, reportCursor, reportSelection, saveCursorPositions, saveEditorState, scanEditor, scanForScopeStart, scanInRanges, selectedRange, selectedRanges, selectedText, settings, shouldPreventWrapLine, shrinkRangeEndToBeforeNewLine, smartScrollToBufferPosition, sortComparable, sortRanges, sortRangesByEndPosition, spaceSurroundedRegExp, toString, translatePointAndClip, trimRange, withTrackingCursorPositionChange, withVisibleBufferRange, _, _ref,
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

  getView = function(model) {
    return atom.views.getView(model);
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

  haveSomeSelection = function(editor) {
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

  normalizePatchChanges = function(changes) {
    return changes.map(function(change) {
      return {
        start: Point.fromObject(change.newStart),
        oldExtent: Point.fromObject(change.oldExtent),
        newExtent: Point.fromObject(change.newExtent),
        newText: change.newText
      };
    });
  };

  getNewTextRangeFromCheckpoint = function(editor, checkpoint) {
    var change, patch, range, _ref1;
    range = null;
    if (patch = (_ref1 = editor.getBuffer().history) != null ? _ref1.getChangesSinceCheckpoint(checkpoint) : void 0) {
      if (change = normalizePatchChanges(patch.getChanges()).shift()) {
        range = new Range(change.start, change.start.traverse(change.newExtent));
      }
    }
    return range;
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

  getEolForBufferRow = function(editor, row) {
    return editor.bufferRangeForBufferRow(row).end;
  };

  pointIsAtEndOfLine = function(editor, point) {
    point = Point.fromObject(point);
    return getEolForBufferRow(editor, point.row).isEqual(point);
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
    var originalPoint;
    originalPoint = cursor.getBufferPosition();
    while (cursorIsOnWhiteSpace(cursor) && (!cursorIsAtVimEndOfFile(cursor))) {
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

  getVimEofBufferPosition = function(editor) {
    var eof;
    eof = editor.getEofBufferPosition();
    if ((eof.row === 0) || (eof.column > 0)) {
      return eof;
    } else {
      return getEolForBufferRow(editor, eof.row - 1);
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
    var end, pattern, start, _ref1;
    pattern = /\S/;
    _ref1 = [], start = _ref1[0], end = _ref1[1];
    editor.scanInBufferRange(pattern, scanRange, function(_arg) {
      var range;
      range = _arg.range;
      return start = range.start;
    });
    if (start) {
      editor.backwardsScanInBufferRange(pattern, scanRange, function(_arg) {
        var range;
        range = _arg.range;
        return end = range.end;
      });
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

  clipScreenPositionForBufferPosition = function(editor, bufferPosition, options) {
    var screenPosition, translate;
    screenPosition = editor.screenPositionForBufferPosition(bufferPosition);
    translate = options.translate;
    delete options.translate;
    if (translate) {
      screenPosition = screenPosition.translate(translate);
    }
    return editor.clipScreenPosition(screenPosition, options);
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
    editorElement = getView(editor);
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

  spaceSurroundedRegExp = /^\s+([\s|\S]+)\s+$/;

  isSurroundedBySpace = function(text) {
    return spaceSurroundedRegExp.test(text);
  };

  isSingleLine = function(text) {
    return text.split(/\n|\r\n/).length === 1;
  };

  getWordBufferRangeAndKindAtBufferPosition = function(editor, point, options) {
    var characterAtPoint, cursor, kind, nonWordCharacters, nonWordRegex, range, singleNonWordChar, source, wordRegex, _ref1;
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

  getWordPatternAtCursor = function(cursor, options) {
    if (options == null) {
      options = {};
    }
    return getWordPatternAtCursor(cursor.editor, cursor.getBufferPosition(), options);
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

  logGoalColumnForSelection = function(subject, selection) {
    return console.log("" + subject + ": goalColumn = ", selection.cursor.goalColumn);
  };

  reportSelection = function(subject, selection) {
    return console.log(subject, selection.getBufferRange().toString());
  };

  reportCursor = function(subject, cursor) {
    return console.log(subject, cursor.getBufferPosition().toString());
  };

  withTrackingCursorPositionChange = function(cursor, fn) {
    var cursorAfter, cursorBefore;
    cursorBefore = cursor.getBufferPosition();
    fn();
    cursorAfter = cursor.getBufferPosition();
    if (!cursorBefore.isEqual(cursorAfter)) {
      return console.log("Changed: " + (cursorBefore.toString()) + " -> " + (cursorAfter.toString()));
    }
  };

  selectedRanges = function(editor) {
    return editor.getSelectedBufferRanges().map(toString).join("\n");
  };

  selectedRange = function(editor) {
    return editor.getSelectedBufferRange().toString();
  };

  inspect = require('util').inspect;

  selectedText = function(editor) {
    return editor.getSelectedBufferRanges().map(function(range) {
      return editor.getTextInBufferRange(range);
    }).join("\n");
  };

  toString = function(obj) {
    if (_.isFunction(obj.toString)) {
      return obj.toString();
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

  ElementBuilder = {
    includeInto: function(target) {
      var name, value, _results;
      _results = [];
      for (name in this) {
        value = this[name];
        if (name !== "includeInto") {
          _results.push(target.prototype[name] = value.bind(this));
        }
      }
      return _results;
    },
    div: function(params) {
      return this.createElement('div', params);
    },
    span: function(params) {
      return this.createElement('span', params);
    },
    atomTextEditor: function(params) {
      return this.createElement('atom-text-editor', params);
    },
    createElement: function(element, _arg) {
      var attribute, classList, id, name, textContent, value, _ref1, _ref2;
      classList = _arg.classList, textContent = _arg.textContent, id = _arg.id, attribute = _arg.attribute;
      element = document.createElement(element);
      if (id != null) {
        element.id = id;
      }
      if (classList != null) {
        (_ref1 = element.classList).add.apply(_ref1, classList);
      }
      if (textContent != null) {
        element.textContent = textContent;
      }
      _ref2 = attribute != null ? attribute : {};
      for (name in _ref2) {
        value = _ref2[name];
        element.setAttribute(name, value);
      }
      return element;
    }
  };

  module.exports = {
    getParent: getParent,
    getAncestors: getAncestors,
    getKeyBindingForCommand: getKeyBindingForCommand,
    include: include,
    debug: debug,
    getView: getView,
    saveEditorState: saveEditorState,
    saveCursorPositions: saveCursorPositions,
    getKeystrokeForEvent: getKeystrokeForEvent,
    getCharacterForEvent: getCharacterForEvent,
    isLinewiseRange: isLinewiseRange,
    isEndsWithNewLineForBufferRow: isEndsWithNewLineForBufferRow,
    haveSomeSelection: haveSomeSelection,
    sortRanges: sortRanges,
    sortRangesByEndPosition: sortRangesByEndPosition,
    getIndex: getIndex,
    getVisibleBufferRange: getVisibleBufferRange,
    withVisibleBufferRange: withVisibleBufferRange,
    getVisibleEditors: getVisibleEditors,
    getNewTextRangeFromCheckpoint: getNewTextRangeFromCheckpoint,
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
    getEolForBufferRow: getEolForBufferRow,
    getFirstVisibleScreenRow: getFirstVisibleScreenRow,
    getLastVisibleScreenRow: getLastVisibleScreenRow,
    highlightRanges: highlightRanges,
    getValidVimBufferRow: getValidVimBufferRow,
    getValidVimScreenRow: getValidVimScreenRow,
    moveCursorToFirstCharacterAtRow: moveCursorToFirstCharacterAtRow,
    countChar: countChar,
    clipScreenPositionForBufferPosition: clipScreenPositionForBufferPosition,
    getTextToPoint: getTextToPoint,
    getIndentLevelForBufferRow: getIndentLevelForBufferRow,
    isAllWhiteSpace: isAllWhiteSpace,
    getCharacterAtCursor: getCharacterAtCursor,
    getTextInScreenRange: getTextInScreenRange,
    cursorIsOnWhiteSpace: cursorIsOnWhiteSpace,
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
    ElementBuilder: ElementBuilder,
    registerElement: registerElement,
    getBufferRangeForPatternFromPoint: getBufferRangeForPatternFromPoint,
    sortComparable: sortComparable,
    smartScrollToBufferPosition: smartScrollToBufferPosition,
    matchScopes: matchScopes,
    moveCursorDownBuffer: moveCursorDownBuffer,
    moveCursorUpBuffer: moveCursorUpBuffer,
    isSurroundedBySpace: isSurroundedBySpace,
    isSingleLine: isSingleLine,
    getCurrentWordBufferRangeAndKind: getCurrentWordBufferRangeAndKind,
    buildWordPatternByCursor: buildWordPatternByCursor,
    getWordBufferRangeAtBufferPosition: getWordBufferRangeAtBufferPosition,
    getWordBufferRangeAndKindAtBufferPosition: getWordBufferRangeAndKindAtBufferPosition,
    getWordPatternAtBufferPosition: getWordPatternAtBufferPosition,
    getNonWordCharactersForCursor: getNonWordCharactersForCursor,
    getWordPatternAtCursor: getWordPatternAtCursor,
    adjustRangeToRowRange: adjustRangeToRowRange,
    shrinkRangeEndToBeforeNewLine: shrinkRangeEndToBeforeNewLine,
    scanInRanges: scanInRanges,
    scanEditor: scanEditor,
    isRangeContainsSomePoint: isRangeContainsSomePoint,
    destroyNonLastSelection: destroyNonLastSelection,
    getLargestFoldRangeContainsBufferRow: getLargestFoldRangeContainsBufferRow,
    translatePointAndClip: translatePointAndClip,
    getRangeByTranslatePointAndClip: getRangeByTranslatePointAndClip,
    reportSelection: reportSelection,
    reportCursor: reportCursor,
    withTrackingCursorPositionChange: withTrackingCursorPositionChange,
    logGoalColumnForSelection: logGoalColumnForSelection,
    selectedRanges: selectedRanges,
    selectedRange: selectedRange,
    selectedText: selectedText,
    toString: toString
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi91dGlscy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsc2tGQUFBO0lBQUEsa0JBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBRFgsQ0FBQTs7QUFBQSxFQUdBLE9BQTZCLE9BQUEsQ0FBUSxNQUFSLENBQTdCLEVBQUMsa0JBQUEsVUFBRCxFQUFhLGFBQUEsS0FBYixFQUFvQixhQUFBLEtBSHBCLENBQUE7O0FBQUEsRUFJQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBSkosQ0FBQTs7QUFBQSxFQU1BLFNBQUEsR0FBWSxTQUFDLEdBQUQsR0FBQTtBQUNWLFFBQUEsS0FBQTtrREFBYSxDQUFFLHFCQURMO0VBQUEsQ0FOWixDQUFBOztBQUFBLEVBU0EsWUFBQSxHQUFlLFNBQUMsR0FBRCxHQUFBO0FBQ2IsUUFBQSxrQkFBQTtBQUFBLElBQUEsU0FBQSxHQUFZLEVBQVosQ0FBQTtBQUFBLElBQ0EsT0FBQSxHQUFVLEdBRFYsQ0FBQTtBQUVBLFdBQUEsSUFBQSxHQUFBO0FBQ0UsTUFBQSxTQUFTLENBQUMsSUFBVixDQUFlLE9BQWYsQ0FBQSxDQUFBO0FBQUEsTUFDQSxPQUFBLEdBQVUsU0FBQSxDQUFVLE9BQVYsQ0FEVixDQUFBO0FBRUEsTUFBQSxJQUFBLENBQUEsT0FBQTtBQUFBLGNBQUE7T0FIRjtJQUFBLENBRkE7V0FNQSxVQVBhO0VBQUEsQ0FUZixDQUFBOztBQUFBLEVBa0JBLHVCQUFBLEdBQTBCLFNBQUMsT0FBRCxFQUFVLElBQVYsR0FBQTtBQUN4QixRQUFBLGlGQUFBO0FBQUEsSUFEbUMsY0FBRCxLQUFDLFdBQ25D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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/utils.coffee
