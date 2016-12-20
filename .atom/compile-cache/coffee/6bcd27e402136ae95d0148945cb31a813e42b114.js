(function() {
  var AAngleBracket, AAngleBracketAllowForwarding, AAnyPair, AAnyPairAllowForwarding, AAnyQuote, ABackTick, AComment, ACurlyBracket, ACurlyBracketAllowForwarding, ACurrentLine, ACurrentSelectionAndAPersistentSelection, ADoubleQuote, AEdge, AEntire, AFold, AFunction, AFunctionOrInnerParagraph, AIndentation, ALatestChange, AParagraph, AParenthesis, AParenthesisAllowForwarding, APersistentSelection, ASingleQuote, ASmartWord, ASquareBracket, ASquareBracketAllowForwarding, ATag, AVisibleArea, AWholeWord, AWord, All, AngleBracket, AnyPair, AnyPairAllowForwarding, AnyQuote, BackTick, Base, Comment, CurlyBracket, CurrentLine, DoubleQuote, Edge, Empty, Entire, Fold, Function, Indentation, InnerAngleBracket, InnerAngleBracketAllowForwarding, InnerAnyPair, InnerAnyPairAllowForwarding, InnerAnyQuote, InnerBackTick, InnerComment, InnerCurlyBracket, InnerCurlyBracketAllowForwarding, InnerCurrentLine, InnerDoubleQuote, InnerEdge, InnerEntire, InnerFold, InnerFunction, InnerIndentation, InnerLatestChange, InnerParagraph, InnerParenthesis, InnerParenthesisAllowForwarding, InnerPersistentSelection, InnerSingleQuote, InnerSmartWord, InnerSquareBracket, InnerSquareBracketAllowForwarding, InnerTag, InnerVisibleArea, InnerWholeWord, InnerWord, LatestChange, Pair, Paragraph, Parenthesis, PersistentSelection, Point, PreviousSelection, Quote, Range, SearchMatchBackward, SearchMatchForward, SingleQuote, SmartWord, SquareBracket, Tag, TextObject, TextObjectFirstFound, UnionTextObject, VisibleArea, WholeWord, Word, countChar, getBufferRangeForRowRange, getBufferRows, getCodeFoldRowRangesContainesForRow, getEndPositionForPattern, getIndentLevelForBufferRow, getRangeByTranslatePointAndClip, getStartPositionForPattern, getTextToPoint, getValidVimBufferRow, getVisibleBufferRange, isIncludeFunctionScopeForRow, pointIsAtEndOfLine, sortRanges, sortRangesByEndPosition, swrap, tagPattern, translatePointAndClip, trimRange, _, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  _ = require('underscore-plus');

  Base = require('./base');

  swrap = require('./selection-wrapper');

  _ref1 = require('./utils'), sortRanges = _ref1.sortRanges, sortRangesByEndPosition = _ref1.sortRangesByEndPosition, countChar = _ref1.countChar, pointIsAtEndOfLine = _ref1.pointIsAtEndOfLine, getTextToPoint = _ref1.getTextToPoint, getIndentLevelForBufferRow = _ref1.getIndentLevelForBufferRow, getCodeFoldRowRangesContainesForRow = _ref1.getCodeFoldRowRangesContainesForRow, getBufferRangeForRowRange = _ref1.getBufferRangeForRowRange, isIncludeFunctionScopeForRow = _ref1.isIncludeFunctionScopeForRow, getStartPositionForPattern = _ref1.getStartPositionForPattern, getEndPositionForPattern = _ref1.getEndPositionForPattern, getVisibleBufferRange = _ref1.getVisibleBufferRange, translatePointAndClip = _ref1.translatePointAndClip, getRangeByTranslatePointAndClip = _ref1.getRangeByTranslatePointAndClip, getBufferRows = _ref1.getBufferRows, getValidVimBufferRow = _ref1.getValidVimBufferRow, getStartPositionForPattern = _ref1.getStartPositionForPattern, trimRange = _ref1.trimRange;

  TextObject = (function(_super) {
    __extends(TextObject, _super);

    TextObject.extend(false);

    TextObject.prototype.allowSubmodeChange = true;

    function TextObject() {
      this.constructor.prototype.inner = this.getName().startsWith('Inner');
      TextObject.__super__.constructor.apply(this, arguments);
      this.initialize();
    }

    TextObject.prototype.isInner = function() {
      return this.inner;
    };

    TextObject.prototype.isA = function() {
      return !this.isInner();
    };

    TextObject.prototype.isAllowSubmodeChange = function() {
      return this.allowSubmodeChange;
    };

    TextObject.prototype.isLinewise = function() {
      if (this.isAllowSubmodeChange()) {
        return swrap.detectVisualModeSubmode(this.editor) === 'linewise';
      } else {
        return this.isMode('visual', 'linewise');
      }
    };

    TextObject.prototype.stopSelection = function() {
      return this.canSelect = false;
    };

    TextObject.prototype.getNormalizedHeadBufferPosition = function(selection) {
      var head;
      head = selection.getHeadBufferPosition();
      if (this.isMode('visual') && !selection.isReversed()) {
        head = translatePointAndClip(this.editor, head, 'backward');
      }
      return head;
    };

    TextObject.prototype.getNormalizedHeadScreenPosition = function(selection) {
      var bufferPosition;
      bufferPosition = this.getNormalizedHeadBufferPosition(selection);
      return this.editor.screenPositionForBufferPosition(bufferPosition);
    };

    TextObject.prototype.select = function() {
      this.canSelect = true;
      this.countTimes((function(_this) {
        return function() {
          var selection, _i, _len, _ref2, _results;
          _ref2 = _this.editor.getSelections();
          _results = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            selection = _ref2[_i];
            if (_this.canSelect) {
              _results.push(_this.selectTextObject(selection));
            }
          }
          return _results;
        };
      })(this));
      this.editor.mergeIntersectingSelections();
      if (this.isMode('visual')) {
        return this.updateSelectionProperties();
      }
    };

    TextObject.prototype.selectTextObject = function(selection) {
      var range;
      range = this.getRange(selection);
      return swrap(selection).setBufferRangeSafely(range);
    };

    TextObject.prototype.getRange = function() {};

    return TextObject;

  })(Base);

  Word = (function(_super) {
    __extends(Word, _super);

    function Word() {
      return Word.__super__.constructor.apply(this, arguments);
    }

    Word.extend(false);

    Word.prototype.getRange = function(selection) {
      var kind, point, range, _ref2;
      point = this.getNormalizedHeadBufferPosition(selection);
      _ref2 = this.getWordBufferRangeAndKindAtBufferPosition(point, {
        wordRegex: this.wordRegex
      }), range = _ref2.range, kind = _ref2.kind;
      if (this.isA() && kind === 'word') {
        range = this.expandRangeToWhiteSpaces(range);
      }
      return range;
    };

    Word.prototype.expandRangeToWhiteSpaces = function(range) {
      var newEnd, newStart;
      if (newEnd = getEndPositionForPattern(this.editor, range.end, /\s+/, {
        containedOnly: true
      })) {
        return new Range(range.start, newEnd);
      }
      if (newStart = getStartPositionForPattern(this.editor, range.start, /\s+/, {
        containedOnly: true
      })) {
        if (newStart.column !== 0) {
          return new Range(newStart, range.end);
        }
      }
      return range;
    };

    return Word;

  })(TextObject);

  AWord = (function(_super) {
    __extends(AWord, _super);

    function AWord() {
      return AWord.__super__.constructor.apply(this, arguments);
    }

    AWord.extend();

    return AWord;

  })(Word);

  InnerWord = (function(_super) {
    __extends(InnerWord, _super);

    function InnerWord() {
      return InnerWord.__super__.constructor.apply(this, arguments);
    }

    InnerWord.extend();

    return InnerWord;

  })(Word);

  WholeWord = (function(_super) {
    __extends(WholeWord, _super);

    function WholeWord() {
      return WholeWord.__super__.constructor.apply(this, arguments);
    }

    WholeWord.extend(false);

    WholeWord.prototype.wordRegex = /\S+/;

    return WholeWord;

  })(Word);

  AWholeWord = (function(_super) {
    __extends(AWholeWord, _super);

    function AWholeWord() {
      return AWholeWord.__super__.constructor.apply(this, arguments);
    }

    AWholeWord.extend();

    return AWholeWord;

  })(WholeWord);

  InnerWholeWord = (function(_super) {
    __extends(InnerWholeWord, _super);

    function InnerWholeWord() {
      return InnerWholeWord.__super__.constructor.apply(this, arguments);
    }

    InnerWholeWord.extend();

    return InnerWholeWord;

  })(WholeWord);

  SmartWord = (function(_super) {
    __extends(SmartWord, _super);

    function SmartWord() {
      return SmartWord.__super__.constructor.apply(this, arguments);
    }

    SmartWord.extend(false);

    SmartWord.prototype.wordRegex = /[\w-]+/;

    return SmartWord;

  })(Word);

  ASmartWord = (function(_super) {
    __extends(ASmartWord, _super);

    function ASmartWord() {
      return ASmartWord.__super__.constructor.apply(this, arguments);
    }

    ASmartWord.description = "A word that consists of alphanumeric chars(`/[A-Za-z0-9_]/`) and hyphen `-`";

    ASmartWord.extend();

    return ASmartWord;

  })(SmartWord);

  InnerSmartWord = (function(_super) {
    __extends(InnerSmartWord, _super);

    function InnerSmartWord() {
      return InnerSmartWord.__super__.constructor.apply(this, arguments);
    }

    InnerSmartWord.description = "Currently No diff from `a-smart-word`";

    InnerSmartWord.extend();

    return InnerSmartWord;

  })(SmartWord);

  Pair = (function(_super) {
    var backSlashPattern;

    __extends(Pair, _super);

    function Pair() {
      return Pair.__super__.constructor.apply(this, arguments);
    }

    Pair.extend(false);

    Pair.prototype.allowNextLine = false;

    Pair.prototype.allowSubmodeChange = false;

    Pair.prototype.adjustInnerRange = true;

    Pair.prototype.pair = null;

    Pair.prototype.getPattern = function() {
      var close, open, _ref2;
      _ref2 = this.pair, open = _ref2[0], close = _ref2[1];
      if (open === close) {
        return new RegExp("(" + (_.escapeRegExp(open)) + ")", 'g');
      } else {
        return new RegExp("(" + (_.escapeRegExp(open)) + ")|(" + (_.escapeRegExp(close)) + ")", 'g');
      }
    };

    Pair.prototype.getPairState = function(_arg) {
      var match, matchText, range;
      matchText = _arg.matchText, range = _arg.range, match = _arg.match;
      switch (match.length) {
        case 2:
          return this.pairStateInBufferRange(range, matchText);
        case 3:
          switch (false) {
            case !match[1]:
              return 'open';
            case !match[2]:
              return 'close';
          }
      }
    };

    backSlashPattern = _.escapeRegExp('\\');

    Pair.prototype.pairStateInBufferRange = function(range, char) {
      var bs, escapedChar, pattern, patterns, text;
      text = getTextToPoint(this.editor, range.end);
      escapedChar = _.escapeRegExp(char);
      bs = backSlashPattern;
      patterns = ["" + bs + bs + escapedChar, "[^" + bs + "]?" + escapedChar];
      pattern = new RegExp(patterns.join('|'));
      return ['close', 'open'][countChar(text, pattern) % 2];
    };

    Pair.prototype.isEscapedCharAtPoint = function(point) {
      var bs, found, pattern, scanRange;
      found = false;
      bs = backSlashPattern;
      pattern = new RegExp("[^" + bs + "]" + bs);
      scanRange = [[point.row, 0], point];
      this.editor.backwardsScanInBufferRange(pattern, scanRange, function(_arg) {
        var matchText, range, stop;
        matchText = _arg.matchText, range = _arg.range, stop = _arg.stop;
        if (range.end.isEqual(point)) {
          stop();
          return found = true;
        }
      });
      return found;
    };

    Pair.prototype.findPair = function(which, options, fn) {
      var from, pattern, scanFunc, scanRange;
      from = options.from, pattern = options.pattern, scanFunc = options.scanFunc, scanRange = options.scanRange;
      return this.editor[scanFunc](pattern, scanRange, (function(_this) {
        return function(event) {
          var matchText, range, stop;
          matchText = event.matchText, range = event.range, stop = event.stop;
          if (!(_this.allowNextLine || (from.row === range.start.row))) {
            return stop();
          }
          if (_this.isEscapedCharAtPoint(range.start)) {
            return;
          }
          return fn(event);
        };
      })(this));
    };

    Pair.prototype.findOpen = function(from, pattern) {
      var found, scanFunc, scanRange, stack;
      scanFunc = 'backwardsScanInBufferRange';
      scanRange = new Range([0, 0], from);
      stack = [];
      found = null;
      this.findPair('open', {
        from: from,
        pattern: pattern,
        scanFunc: scanFunc,
        scanRange: scanRange
      }, (function(_this) {
        return function(event) {
          var matchText, pairState, range, stop;
          matchText = event.matchText, range = event.range, stop = event.stop;
          pairState = _this.getPairState(event);
          if (pairState === 'close') {
            stack.push({
              pairState: pairState,
              matchText: matchText,
              range: range
            });
          } else {
            stack.pop();
            if (stack.length === 0) {
              found = range;
            }
          }
          if (found != null) {
            return stop();
          }
        };
      })(this));
      return found;
    };

    Pair.prototype.findClose = function(from, pattern) {
      var found, scanFunc, scanRange, stack;
      scanFunc = 'scanInBufferRange';
      scanRange = new Range(from, this.editor.buffer.getEndPosition());
      stack = [];
      found = null;
      this.findPair('close', {
        from: from,
        pattern: pattern,
        scanFunc: scanFunc,
        scanRange: scanRange
      }, (function(_this) {
        return function(event) {
          var entry, openStart, pairState, range, stop;
          range = event.range, stop = event.stop;
          pairState = _this.getPairState(event);
          if (pairState === 'open') {
            stack.push({
              pairState: pairState,
              range: range
            });
          } else {
            entry = stack.pop();
            if (stack.length === 0) {
              if ((openStart = entry != null ? entry.range.start : void 0)) {
                if (_this.allowForwarding) {
                  if (openStart.row > from.row) {
                    return;
                  }
                } else {
                  if (openStart.isGreaterThan(from)) {
                    return;
                  }
                }
              }
              found = range;
            }
          }
          if (found != null) {
            return stop();
          }
        };
      })(this));
      return found;
    };

    Pair.prototype.getPairInfo = function(from) {
      var aRange, closeRange, innerEnd, innerRange, innerStart, openRange, pairInfo, pattern, targetRange, _ref2;
      pairInfo = null;
      pattern = this.getPattern();
      closeRange = this.findClose(from, pattern);
      if (closeRange != null) {
        openRange = this.findOpen(closeRange.end, pattern);
      }
      if (!((openRange != null) && (closeRange != null))) {
        return null;
      }
      aRange = new Range(openRange.start, closeRange.end);
      _ref2 = [openRange.end, closeRange.start], innerStart = _ref2[0], innerEnd = _ref2[1];
      if (this.adjustInnerRange) {
        if (pointIsAtEndOfLine(this.editor, innerStart)) {
          innerStart = new Point(innerStart.row + 1, 0);
        }
        if (getTextToPoint(this.editor, innerEnd).match(/^\s*$/)) {
          innerEnd = new Point(innerEnd.row, 0);
        }
        if ((innerEnd.column === 0) && (innerStart.column !== 0)) {
          innerEnd = new Point(innerEnd.row - 1, Infinity);
        }
      }
      innerRange = new Range(innerStart, innerEnd);
      targetRange = this.isInner() ? innerRange : aRange;
      if (this.skipEmptyPair && innerRange.isEmpty()) {
        return this.getPairInfo(aRange.end);
      } else {
        return {
          openRange: openRange,
          closeRange: closeRange,
          aRange: aRange,
          innerRange: innerRange,
          targetRange: targetRange
        };
      }
    };

    Pair.prototype.getPointToSearchFrom = function(selection, searchFrom) {
      switch (searchFrom) {
        case 'head':
          return this.getNormalizedHeadBufferPosition(selection);
        case 'start':
          return swrap(selection).getBufferPositionFor('start');
      }
    };

    Pair.prototype.getRange = function(selection, options) {
      var allowForwarding, originalRange, pairInfo, searchFrom;
      if (options == null) {
        options = {};
      }
      allowForwarding = options.allowForwarding, searchFrom = options.searchFrom;
      if (searchFrom == null) {
        searchFrom = 'head';
      }
      if (allowForwarding != null) {
        this.allowForwarding = allowForwarding;
      }
      originalRange = selection.getBufferRange();
      pairInfo = this.getPairInfo(this.getPointToSearchFrom(selection, searchFrom));
      if (pairInfo != null ? pairInfo.targetRange.isEqual(originalRange) : void 0) {
        pairInfo = this.getPairInfo(pairInfo.aRange.end);
      }
      return pairInfo != null ? pairInfo.targetRange : void 0;
    };

    return Pair;

  })(TextObject);

  AnyPair = (function(_super) {
    __extends(AnyPair, _super);

    function AnyPair() {
      return AnyPair.__super__.constructor.apply(this, arguments);
    }

    AnyPair.extend(false);

    AnyPair.prototype.allowForwarding = false;

    AnyPair.prototype.allowNextLine = null;

    AnyPair.prototype.skipEmptyPair = false;

    AnyPair.prototype.member = ['DoubleQuote', 'SingleQuote', 'BackTick', 'CurlyBracket', 'AngleBracket', 'Tag', 'SquareBracket', 'Parenthesis'];

    AnyPair.prototype.getRangeBy = function(klass, selection) {
      var options;
      options = {
        inner: this.inner,
        skipEmptyPair: this.skipEmptyPair
      };
      if (this.allowNextLine != null) {
        options.allowNextLine = this.allowNextLine;
      }
      return this["new"](klass, options).getRange(selection, {
        allowForwarding: this.allowForwarding,
        searchFrom: this.searchFrom
      });
    };

    AnyPair.prototype.getRanges = function(selection) {
      var klass, range, _i, _len, _ref2, _results;
      _ref2 = this.member;
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        klass = _ref2[_i];
        if ((range = this.getRangeBy(klass, selection))) {
          _results.push(range);
        }
      }
      return _results;
    };

    AnyPair.prototype.getRange = function(selection) {
      var ranges;
      ranges = this.getRanges(selection);
      if (ranges.length) {
        return _.last(sortRanges(ranges));
      }
    };

    return AnyPair;

  })(Pair);

  AAnyPair = (function(_super) {
    __extends(AAnyPair, _super);

    function AAnyPair() {
      return AAnyPair.__super__.constructor.apply(this, arguments);
    }

    AAnyPair.extend();

    return AAnyPair;

  })(AnyPair);

  InnerAnyPair = (function(_super) {
    __extends(InnerAnyPair, _super);

    function InnerAnyPair() {
      return InnerAnyPair.__super__.constructor.apply(this, arguments);
    }

    InnerAnyPair.extend();

    return InnerAnyPair;

  })(AnyPair);

  AnyPairAllowForwarding = (function(_super) {
    __extends(AnyPairAllowForwarding, _super);

    function AnyPairAllowForwarding() {
      return AnyPairAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    AnyPairAllowForwarding.extend(false);

    AnyPairAllowForwarding.description = "Range surrounded by auto-detected paired chars from enclosed and forwarding area";

    AnyPairAllowForwarding.prototype.allowForwarding = true;

    AnyPairAllowForwarding.prototype.skipEmptyPair = false;

    AnyPairAllowForwarding.prototype.searchFrom = 'start';

    AnyPairAllowForwarding.prototype.getRange = function(selection) {
      var enclosingRange, enclosingRanges, forwardingRanges, from, ranges, _ref2;
      ranges = this.getRanges(selection);
      from = selection.cursor.getBufferPosition();
      _ref2 = _.partition(ranges, function(range) {
        return range.start.isGreaterThanOrEqual(from);
      }), forwardingRanges = _ref2[0], enclosingRanges = _ref2[1];
      enclosingRange = _.last(sortRanges(enclosingRanges));
      forwardingRanges = sortRanges(forwardingRanges);
      if (enclosingRange) {
        forwardingRanges = forwardingRanges.filter(function(range) {
          return enclosingRange.containsRange(range);
        });
      }
      return forwardingRanges[0] || enclosingRange;
    };

    return AnyPairAllowForwarding;

  })(AnyPair);

  AAnyPairAllowForwarding = (function(_super) {
    __extends(AAnyPairAllowForwarding, _super);

    function AAnyPairAllowForwarding() {
      return AAnyPairAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    AAnyPairAllowForwarding.extend();

    return AAnyPairAllowForwarding;

  })(AnyPairAllowForwarding);

  InnerAnyPairAllowForwarding = (function(_super) {
    __extends(InnerAnyPairAllowForwarding, _super);

    function InnerAnyPairAllowForwarding() {
      return InnerAnyPairAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    InnerAnyPairAllowForwarding.extend();

    return InnerAnyPairAllowForwarding;

  })(AnyPairAllowForwarding);

  AnyQuote = (function(_super) {
    __extends(AnyQuote, _super);

    function AnyQuote() {
      return AnyQuote.__super__.constructor.apply(this, arguments);
    }

    AnyQuote.extend(false);

    AnyQuote.prototype.allowForwarding = true;

    AnyQuote.prototype.member = ['DoubleQuote', 'SingleQuote', 'BackTick'];

    AnyQuote.prototype.getRange = function(selection) {
      var ranges;
      ranges = this.getRanges(selection);
      if (ranges.length) {
        return _.first(_.sortBy(ranges, function(r) {
          return r.end.column;
        }));
      }
    };

    return AnyQuote;

  })(AnyPair);

  AAnyQuote = (function(_super) {
    __extends(AAnyQuote, _super);

    function AAnyQuote() {
      return AAnyQuote.__super__.constructor.apply(this, arguments);
    }

    AAnyQuote.extend();

    return AAnyQuote;

  })(AnyQuote);

  InnerAnyQuote = (function(_super) {
    __extends(InnerAnyQuote, _super);

    function InnerAnyQuote() {
      return InnerAnyQuote.__super__.constructor.apply(this, arguments);
    }

    InnerAnyQuote.extend();

    return InnerAnyQuote;

  })(AnyQuote);

  Quote = (function(_super) {
    __extends(Quote, _super);

    function Quote() {
      return Quote.__super__.constructor.apply(this, arguments);
    }

    Quote.extend(false);

    Quote.prototype.allowForwarding = true;

    Quote.prototype.allowNextLine = false;

    return Quote;

  })(Pair);

  DoubleQuote = (function(_super) {
    __extends(DoubleQuote, _super);

    function DoubleQuote() {
      return DoubleQuote.__super__.constructor.apply(this, arguments);
    }

    DoubleQuote.extend(false);

    DoubleQuote.prototype.pair = ['"', '"'];

    return DoubleQuote;

  })(Quote);

  ADoubleQuote = (function(_super) {
    __extends(ADoubleQuote, _super);

    function ADoubleQuote() {
      return ADoubleQuote.__super__.constructor.apply(this, arguments);
    }

    ADoubleQuote.extend();

    return ADoubleQuote;

  })(DoubleQuote);

  InnerDoubleQuote = (function(_super) {
    __extends(InnerDoubleQuote, _super);

    function InnerDoubleQuote() {
      return InnerDoubleQuote.__super__.constructor.apply(this, arguments);
    }

    InnerDoubleQuote.extend();

    return InnerDoubleQuote;

  })(DoubleQuote);

  SingleQuote = (function(_super) {
    __extends(SingleQuote, _super);

    function SingleQuote() {
      return SingleQuote.__super__.constructor.apply(this, arguments);
    }

    SingleQuote.extend(false);

    SingleQuote.prototype.pair = ["'", "'"];

    return SingleQuote;

  })(Quote);

  ASingleQuote = (function(_super) {
    __extends(ASingleQuote, _super);

    function ASingleQuote() {
      return ASingleQuote.__super__.constructor.apply(this, arguments);
    }

    ASingleQuote.extend();

    return ASingleQuote;

  })(SingleQuote);

  InnerSingleQuote = (function(_super) {
    __extends(InnerSingleQuote, _super);

    function InnerSingleQuote() {
      return InnerSingleQuote.__super__.constructor.apply(this, arguments);
    }

    InnerSingleQuote.extend();

    return InnerSingleQuote;

  })(SingleQuote);

  BackTick = (function(_super) {
    __extends(BackTick, _super);

    function BackTick() {
      return BackTick.__super__.constructor.apply(this, arguments);
    }

    BackTick.extend(false);

    BackTick.prototype.pair = ['`', '`'];

    return BackTick;

  })(Quote);

  ABackTick = (function(_super) {
    __extends(ABackTick, _super);

    function ABackTick() {
      return ABackTick.__super__.constructor.apply(this, arguments);
    }

    ABackTick.extend();

    return ABackTick;

  })(BackTick);

  InnerBackTick = (function(_super) {
    __extends(InnerBackTick, _super);

    function InnerBackTick() {
      return InnerBackTick.__super__.constructor.apply(this, arguments);
    }

    InnerBackTick.extend();

    return InnerBackTick;

  })(BackTick);

  CurlyBracket = (function(_super) {
    __extends(CurlyBracket, _super);

    function CurlyBracket() {
      return CurlyBracket.__super__.constructor.apply(this, arguments);
    }

    CurlyBracket.extend(false);

    CurlyBracket.prototype.pair = ['{', '}'];

    CurlyBracket.prototype.allowNextLine = true;

    return CurlyBracket;

  })(Pair);

  ACurlyBracket = (function(_super) {
    __extends(ACurlyBracket, _super);

    function ACurlyBracket() {
      return ACurlyBracket.__super__.constructor.apply(this, arguments);
    }

    ACurlyBracket.extend();

    return ACurlyBracket;

  })(CurlyBracket);

  InnerCurlyBracket = (function(_super) {
    __extends(InnerCurlyBracket, _super);

    function InnerCurlyBracket() {
      return InnerCurlyBracket.__super__.constructor.apply(this, arguments);
    }

    InnerCurlyBracket.extend();

    return InnerCurlyBracket;

  })(CurlyBracket);

  ACurlyBracketAllowForwarding = (function(_super) {
    __extends(ACurlyBracketAllowForwarding, _super);

    function ACurlyBracketAllowForwarding() {
      return ACurlyBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    ACurlyBracketAllowForwarding.extend();

    ACurlyBracketAllowForwarding.prototype.allowForwarding = true;

    return ACurlyBracketAllowForwarding;

  })(CurlyBracket);

  InnerCurlyBracketAllowForwarding = (function(_super) {
    __extends(InnerCurlyBracketAllowForwarding, _super);

    function InnerCurlyBracketAllowForwarding() {
      return InnerCurlyBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    InnerCurlyBracketAllowForwarding.extend();

    InnerCurlyBracketAllowForwarding.prototype.allowForwarding = true;

    return InnerCurlyBracketAllowForwarding;

  })(CurlyBracket);

  SquareBracket = (function(_super) {
    __extends(SquareBracket, _super);

    function SquareBracket() {
      return SquareBracket.__super__.constructor.apply(this, arguments);
    }

    SquareBracket.extend(false);

    SquareBracket.prototype.pair = ['[', ']'];

    SquareBracket.prototype.allowNextLine = true;

    return SquareBracket;

  })(Pair);

  ASquareBracket = (function(_super) {
    __extends(ASquareBracket, _super);

    function ASquareBracket() {
      return ASquareBracket.__super__.constructor.apply(this, arguments);
    }

    ASquareBracket.extend();

    return ASquareBracket;

  })(SquareBracket);

  InnerSquareBracket = (function(_super) {
    __extends(InnerSquareBracket, _super);

    function InnerSquareBracket() {
      return InnerSquareBracket.__super__.constructor.apply(this, arguments);
    }

    InnerSquareBracket.extend();

    return InnerSquareBracket;

  })(SquareBracket);

  ASquareBracketAllowForwarding = (function(_super) {
    __extends(ASquareBracketAllowForwarding, _super);

    function ASquareBracketAllowForwarding() {
      return ASquareBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    ASquareBracketAllowForwarding.extend();

    ASquareBracketAllowForwarding.prototype.allowForwarding = true;

    return ASquareBracketAllowForwarding;

  })(SquareBracket);

  InnerSquareBracketAllowForwarding = (function(_super) {
    __extends(InnerSquareBracketAllowForwarding, _super);

    function InnerSquareBracketAllowForwarding() {
      return InnerSquareBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    InnerSquareBracketAllowForwarding.extend();

    InnerSquareBracketAllowForwarding.prototype.allowForwarding = true;

    return InnerSquareBracketAllowForwarding;

  })(SquareBracket);

  Parenthesis = (function(_super) {
    __extends(Parenthesis, _super);

    function Parenthesis() {
      return Parenthesis.__super__.constructor.apply(this, arguments);
    }

    Parenthesis.extend(false);

    Parenthesis.prototype.pair = ['(', ')'];

    Parenthesis.prototype.allowNextLine = true;

    return Parenthesis;

  })(Pair);

  AParenthesis = (function(_super) {
    __extends(AParenthesis, _super);

    function AParenthesis() {
      return AParenthesis.__super__.constructor.apply(this, arguments);
    }

    AParenthesis.extend();

    return AParenthesis;

  })(Parenthesis);

  InnerParenthesis = (function(_super) {
    __extends(InnerParenthesis, _super);

    function InnerParenthesis() {
      return InnerParenthesis.__super__.constructor.apply(this, arguments);
    }

    InnerParenthesis.extend();

    return InnerParenthesis;

  })(Parenthesis);

  AParenthesisAllowForwarding = (function(_super) {
    __extends(AParenthesisAllowForwarding, _super);

    function AParenthesisAllowForwarding() {
      return AParenthesisAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    AParenthesisAllowForwarding.extend();

    AParenthesisAllowForwarding.prototype.allowForwarding = true;

    return AParenthesisAllowForwarding;

  })(Parenthesis);

  InnerParenthesisAllowForwarding = (function(_super) {
    __extends(InnerParenthesisAllowForwarding, _super);

    function InnerParenthesisAllowForwarding() {
      return InnerParenthesisAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    InnerParenthesisAllowForwarding.extend();

    InnerParenthesisAllowForwarding.prototype.allowForwarding = true;

    return InnerParenthesisAllowForwarding;

  })(Parenthesis);

  AngleBracket = (function(_super) {
    __extends(AngleBracket, _super);

    function AngleBracket() {
      return AngleBracket.__super__.constructor.apply(this, arguments);
    }

    AngleBracket.extend(false);

    AngleBracket.prototype.pair = ['<', '>'];

    return AngleBracket;

  })(Pair);

  AAngleBracket = (function(_super) {
    __extends(AAngleBracket, _super);

    function AAngleBracket() {
      return AAngleBracket.__super__.constructor.apply(this, arguments);
    }

    AAngleBracket.extend();

    return AAngleBracket;

  })(AngleBracket);

  InnerAngleBracket = (function(_super) {
    __extends(InnerAngleBracket, _super);

    function InnerAngleBracket() {
      return InnerAngleBracket.__super__.constructor.apply(this, arguments);
    }

    InnerAngleBracket.extend();

    return InnerAngleBracket;

  })(AngleBracket);

  AAngleBracketAllowForwarding = (function(_super) {
    __extends(AAngleBracketAllowForwarding, _super);

    function AAngleBracketAllowForwarding() {
      return AAngleBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    AAngleBracketAllowForwarding.extend();

    AAngleBracketAllowForwarding.prototype.allowForwarding = true;

    return AAngleBracketAllowForwarding;

  })(AngleBracket);

  InnerAngleBracketAllowForwarding = (function(_super) {
    __extends(InnerAngleBracketAllowForwarding, _super);

    function InnerAngleBracketAllowForwarding() {
      return InnerAngleBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    InnerAngleBracketAllowForwarding.extend();

    InnerAngleBracketAllowForwarding.prototype.allowForwarding = true;

    return InnerAngleBracketAllowForwarding;

  })(AngleBracket);

  tagPattern = /(<(\/?))([^\s>]+)[^>]*>/g;

  Tag = (function(_super) {
    __extends(Tag, _super);

    function Tag() {
      return Tag.__super__.constructor.apply(this, arguments);
    }

    Tag.extend(false);

    Tag.prototype.allowNextLine = true;

    Tag.prototype.allowForwarding = true;

    Tag.prototype.adjustInnerRange = false;

    Tag.prototype.getPattern = function() {
      return tagPattern;
    };

    Tag.prototype.getPairState = function(_arg) {
      var match, matchText, slash, tagName, __;
      match = _arg.match, matchText = _arg.matchText;
      __ = match[0], __ = match[1], slash = match[2], tagName = match[3];
      if (slash === '') {
        return ['open', tagName];
      } else {
        return ['close', tagName];
      }
    };

    Tag.prototype.getTagStartPoint = function(from) {
      var scanRange, tagRange, _ref2;
      tagRange = null;
      scanRange = this.editor.bufferRangeForBufferRow(from.row);
      this.editor.scanInBufferRange(tagPattern, scanRange, function(_arg) {
        var range, stop;
        range = _arg.range, stop = _arg.stop;
        if (range.containsPoint(from, true)) {
          tagRange = range;
          return stop();
        }
      });
      return (_ref2 = tagRange != null ? tagRange.start : void 0) != null ? _ref2 : from;
    };

    Tag.prototype.findTagState = function(stack, tagState) {
      var entry, i, _i, _ref2;
      if (stack.length === 0) {
        return null;
      }
      for (i = _i = _ref2 = stack.length - 1; _ref2 <= 0 ? _i <= 0 : _i >= 0; i = _ref2 <= 0 ? ++_i : --_i) {
        entry = stack[i];
        if (entry.tagState === tagState) {
          return entry;
        }
      }
      return null;
    };

    Tag.prototype.findOpen = function(from, pattern) {
      var found, scanFunc, scanRange, stack;
      scanFunc = 'backwardsScanInBufferRange';
      scanRange = new Range([0, 0], from);
      stack = [];
      found = null;
      this.findPair('open', {
        from: from,
        pattern: pattern,
        scanFunc: scanFunc,
        scanRange: scanRange
      }, (function(_this) {
        return function(event) {
          var entry, pairState, range, stop, tagName, tagState, _ref2;
          range = event.range, stop = event.stop;
          _ref2 = _this.getPairState(event), pairState = _ref2[0], tagName = _ref2[1];
          if (pairState === 'close') {
            tagState = pairState + tagName;
            stack.push({
              tagState: tagState,
              range: range
            });
          } else {
            if (entry = _this.findTagState(stack, "close" + tagName)) {
              stack = stack.slice(0, stack.indexOf(entry));
            }
            if (stack.length === 0) {
              found = range;
            }
          }
          if (found != null) {
            return stop();
          }
        };
      })(this));
      return found;
    };

    Tag.prototype.findClose = function(from, pattern) {
      var found, scanFunc, scanRange, stack;
      scanFunc = 'scanInBufferRange';
      from = this.getTagStartPoint(from);
      scanRange = new Range(from, this.editor.buffer.getEndPosition());
      stack = [];
      found = null;
      this.findPair('close', {
        from: from,
        pattern: pattern,
        scanFunc: scanFunc,
        scanRange: scanRange
      }, (function(_this) {
        return function(event) {
          var entry, openStart, pairState, range, stop, tagName, tagState, _ref2;
          range = event.range, stop = event.stop;
          _ref2 = _this.getPairState(event), pairState = _ref2[0], tagName = _ref2[1];
          if (pairState === 'open') {
            tagState = pairState + tagName;
            stack.push({
              tagState: tagState,
              range: range
            });
          } else {
            if (entry = _this.findTagState(stack, "open" + tagName)) {
              stack = stack.slice(0, stack.indexOf(entry));
            } else {
              stack = [];
            }
            if (stack.length === 0) {
              if ((openStart = entry != null ? entry.range.start : void 0)) {
                if (_this.allowForwarding) {
                  if (openStart.row > from.row) {
                    return;
                  }
                } else {
                  if (openStart.isGreaterThan(from)) {
                    return;
                  }
                }
              }
              found = range;
            }
          }
          if (found != null) {
            return stop();
          }
        };
      })(this));
      return found;
    };

    return Tag;

  })(Pair);

  ATag = (function(_super) {
    __extends(ATag, _super);

    function ATag() {
      return ATag.__super__.constructor.apply(this, arguments);
    }

    ATag.extend();

    return ATag;

  })(Tag);

  InnerTag = (function(_super) {
    __extends(InnerTag, _super);

    function InnerTag() {
      return InnerTag.__super__.constructor.apply(this, arguments);
    }

    InnerTag.extend();

    return InnerTag;

  })(Tag);

  Paragraph = (function(_super) {
    __extends(Paragraph, _super);

    function Paragraph() {
      return Paragraph.__super__.constructor.apply(this, arguments);
    }

    Paragraph.extend(false);

    Paragraph.prototype.findRow = function(fromRow, direction, fn) {
      var foundRow, row, _i, _len, _ref2;
      if (typeof fn.reset === "function") {
        fn.reset();
      }
      foundRow = fromRow;
      _ref2 = getBufferRows(this.editor, {
        startRow: fromRow,
        direction: direction
      });
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        row = _ref2[_i];
        if (!fn(row, direction)) {
          break;
        }
        foundRow = row;
      }
      return foundRow;
    };

    Paragraph.prototype.findRowRangeBy = function(fromRow, fn) {
      var endRow, startRow;
      startRow = this.findRow(fromRow, 'previous', fn);
      endRow = this.findRow(fromRow, 'next', fn);
      return [startRow, endRow];
    };

    Paragraph.prototype.getPredictFunction = function(fromRow, selection) {
      var directionToExtend, flip, fromRowResult, predict;
      fromRowResult = this.editor.isBufferRowBlank(fromRow);
      if (this.isInner()) {
        predict = (function(_this) {
          return function(row, direction) {
            return _this.editor.isBufferRowBlank(row) === fromRowResult;
          };
        })(this);
      } else {
        if (selection.isReversed()) {
          directionToExtend = 'previous';
        } else {
          directionToExtend = 'next';
        }
        flip = false;
        predict = (function(_this) {
          return function(row, direction) {
            var result;
            result = _this.editor.isBufferRowBlank(row) === fromRowResult;
            if (flip) {
              return !result;
            } else {
              if ((!result) && (direction === directionToExtend)) {
                flip = true;
                return true;
              }
              return result;
            }
          };
        })(this);
        predict.reset = function() {
          return flip = false;
        };
      }
      return predict;
    };

    Paragraph.prototype.getRange = function(selection) {
      var fromRow, rowRange;
      fromRow = this.getNormalizedHeadBufferPosition(selection).row;
      if (this.isMode('visual', 'linewise')) {
        if (selection.isReversed()) {
          fromRow--;
        } else {
          fromRow++;
        }
        fromRow = getValidVimBufferRow(this.editor, fromRow);
      }
      rowRange = this.findRowRangeBy(fromRow, this.getPredictFunction(fromRow, selection));
      return selection.getBufferRange().union(getBufferRangeForRowRange(this.editor, rowRange));
    };

    return Paragraph;

  })(TextObject);

  AParagraph = (function(_super) {
    __extends(AParagraph, _super);

    function AParagraph() {
      return AParagraph.__super__.constructor.apply(this, arguments);
    }

    AParagraph.extend();

    return AParagraph;

  })(Paragraph);

  InnerParagraph = (function(_super) {
    __extends(InnerParagraph, _super);

    function InnerParagraph() {
      return InnerParagraph.__super__.constructor.apply(this, arguments);
    }

    InnerParagraph.extend();

    return InnerParagraph;

  })(Paragraph);

  Indentation = (function(_super) {
    __extends(Indentation, _super);

    function Indentation() {
      return Indentation.__super__.constructor.apply(this, arguments);
    }

    Indentation.extend(false);

    Indentation.prototype.getRange = function(selection) {
      var baseIndentLevel, fromRow, predict, rowRange;
      fromRow = this.getNormalizedHeadBufferPosition(selection).row;
      baseIndentLevel = getIndentLevelForBufferRow(this.editor, fromRow);
      predict = (function(_this) {
        return function(row) {
          if (_this.editor.isBufferRowBlank(row)) {
            return _this.isA();
          } else {
            return getIndentLevelForBufferRow(_this.editor, row) >= baseIndentLevel;
          }
        };
      })(this);
      rowRange = this.findRowRangeBy(fromRow, predict);
      return getBufferRangeForRowRange(this.editor, rowRange);
    };

    return Indentation;

  })(Paragraph);

  AIndentation = (function(_super) {
    __extends(AIndentation, _super);

    function AIndentation() {
      return AIndentation.__super__.constructor.apply(this, arguments);
    }

    AIndentation.extend();

    return AIndentation;

  })(Indentation);

  InnerIndentation = (function(_super) {
    __extends(InnerIndentation, _super);

    function InnerIndentation() {
      return InnerIndentation.__super__.constructor.apply(this, arguments);
    }

    InnerIndentation.extend();

    return InnerIndentation;

  })(Indentation);

  Comment = (function(_super) {
    __extends(Comment, _super);

    function Comment() {
      return Comment.__super__.constructor.apply(this, arguments);
    }

    Comment.extend(false);

    Comment.prototype.getRange = function(selection) {
      var row, rowRange;
      row = selection.getBufferRange().start.row;
      rowRange = this.editor.languageMode.rowRangeForCommentAtBufferRow(row);
      if (this.editor.isBufferRowCommented(row)) {
        if (rowRange == null) {
          rowRange = [row, row];
        }
      }
      if (rowRange) {
        return getBufferRangeForRowRange(selection.editor, rowRange);
      }
    };

    return Comment;

  })(TextObject);

  AComment = (function(_super) {
    __extends(AComment, _super);

    function AComment() {
      return AComment.__super__.constructor.apply(this, arguments);
    }

    AComment.extend();

    return AComment;

  })(Comment);

  InnerComment = (function(_super) {
    __extends(InnerComment, _super);

    function InnerComment() {
      return InnerComment.__super__.constructor.apply(this, arguments);
    }

    InnerComment.extend();

    return InnerComment;

  })(Comment);

  Fold = (function(_super) {
    __extends(Fold, _super);

    function Fold() {
      return Fold.__super__.constructor.apply(this, arguments);
    }

    Fold.extend(false);

    Fold.prototype.adjustRowRange = function(_arg) {
      var endRow, endRowIndentLevel, startRow, startRowIndentLevel;
      startRow = _arg[0], endRow = _arg[1];
      if (!this.isInner()) {
        return [startRow, endRow];
      }
      startRowIndentLevel = getIndentLevelForBufferRow(this.editor, startRow);
      endRowIndentLevel = getIndentLevelForBufferRow(this.editor, endRow);
      if (startRowIndentLevel === endRowIndentLevel) {
        endRow -= 1;
      }
      startRow += 1;
      return [startRow, endRow];
    };

    Fold.prototype.getFoldRowRangesContainsForRow = function(row) {
      var _ref2;
      return (_ref2 = getCodeFoldRowRangesContainesForRow(this.editor, row, {
        includeStartRow: false
      })) != null ? _ref2.reverse() : void 0;
    };

    Fold.prototype.getRange = function(selection) {
      var range, rowRange, rowRanges, targetRange;
      range = selection.getBufferRange();
      rowRanges = this.getFoldRowRangesContainsForRow(range.start.row);
      if (!rowRanges.length) {
        return;
      }
      if ((rowRange = rowRanges.shift()) != null) {
        rowRange = this.adjustRowRange(rowRange);
        targetRange = getBufferRangeForRowRange(this.editor, rowRange);
        if (targetRange.isEqual(range) && rowRanges.length) {
          rowRange = this.adjustRowRange(rowRanges.shift());
        }
      }
      return getBufferRangeForRowRange(this.editor, rowRange);
    };

    return Fold;

  })(TextObject);

  AFold = (function(_super) {
    __extends(AFold, _super);

    function AFold() {
      return AFold.__super__.constructor.apply(this, arguments);
    }

    AFold.extend();

    return AFold;

  })(Fold);

  InnerFold = (function(_super) {
    __extends(InnerFold, _super);

    function InnerFold() {
      return InnerFold.__super__.constructor.apply(this, arguments);
    }

    InnerFold.extend();

    return InnerFold;

  })(Fold);

  Function = (function(_super) {
    __extends(Function, _super);

    function Function() {
      return Function.__super__.constructor.apply(this, arguments);
    }

    Function.extend(false);

    Function.prototype.omittingClosingCharLanguages = ['go'];

    Function.prototype.initialize = function() {
      Function.__super__.initialize.apply(this, arguments);
      return this.language = this.editor.getGrammar().scopeName.replace(/^source\./, '');
    };

    Function.prototype.getFoldRowRangesContainsForRow = function(row) {
      var rowRanges, _ref2;
      rowRanges = (_ref2 = getCodeFoldRowRangesContainesForRow(this.editor, row)) != null ? _ref2.reverse() : void 0;
      return rowRanges != null ? rowRanges.filter((function(_this) {
        return function(rowRange) {
          return isIncludeFunctionScopeForRow(_this.editor, rowRange[0]);
        };
      })(this)) : void 0;
    };

    Function.prototype.adjustRowRange = function(rowRange) {
      var endRow, startRow, _ref2, _ref3;
      _ref2 = Function.__super__.adjustRowRange.apply(this, arguments), startRow = _ref2[0], endRow = _ref2[1];
      if (this.isA() && (_ref3 = this.language, __indexOf.call(this.omittingClosingCharLanguages, _ref3) >= 0)) {
        endRow += 1;
      }
      return [startRow, endRow];
    };

    return Function;

  })(Fold);

  AFunction = (function(_super) {
    __extends(AFunction, _super);

    function AFunction() {
      return AFunction.__super__.constructor.apply(this, arguments);
    }

    AFunction.extend();

    return AFunction;

  })(Function);

  InnerFunction = (function(_super) {
    __extends(InnerFunction, _super);

    function InnerFunction() {
      return InnerFunction.__super__.constructor.apply(this, arguments);
    }

    InnerFunction.extend();

    return InnerFunction;

  })(Function);

  CurrentLine = (function(_super) {
    __extends(CurrentLine, _super);

    function CurrentLine() {
      return CurrentLine.__super__.constructor.apply(this, arguments);
    }

    CurrentLine.extend(false);

    CurrentLine.prototype.getRange = function(selection) {
      var range, row;
      row = this.getNormalizedHeadBufferPosition(selection).row;
      range = this.editor.bufferRangeForBufferRow(row);
      if (this.isA()) {
        return range;
      } else {
        return trimRange(this.editor, range);
      }
    };

    return CurrentLine;

  })(TextObject);

  ACurrentLine = (function(_super) {
    __extends(ACurrentLine, _super);

    function ACurrentLine() {
      return ACurrentLine.__super__.constructor.apply(this, arguments);
    }

    ACurrentLine.extend();

    return ACurrentLine;

  })(CurrentLine);

  InnerCurrentLine = (function(_super) {
    __extends(InnerCurrentLine, _super);

    function InnerCurrentLine() {
      return InnerCurrentLine.__super__.constructor.apply(this, arguments);
    }

    InnerCurrentLine.extend();

    return InnerCurrentLine;

  })(CurrentLine);

  Entire = (function(_super) {
    __extends(Entire, _super);

    function Entire() {
      return Entire.__super__.constructor.apply(this, arguments);
    }

    Entire.extend(false);

    Entire.prototype.getRange = function(selection) {
      this.stopSelection();
      return this.editor.buffer.getRange();
    };

    return Entire;

  })(TextObject);

  AEntire = (function(_super) {
    __extends(AEntire, _super);

    function AEntire() {
      return AEntire.__super__.constructor.apply(this, arguments);
    }

    AEntire.extend();

    return AEntire;

  })(Entire);

  InnerEntire = (function(_super) {
    __extends(InnerEntire, _super);

    function InnerEntire() {
      return InnerEntire.__super__.constructor.apply(this, arguments);
    }

    InnerEntire.extend();

    return InnerEntire;

  })(Entire);

  All = (function(_super) {
    __extends(All, _super);

    function All() {
      return All.__super__.constructor.apply(this, arguments);
    }

    All.extend(false);

    return All;

  })(Entire);

  Empty = (function(_super) {
    __extends(Empty, _super);

    function Empty() {
      return Empty.__super__.constructor.apply(this, arguments);
    }

    Empty.extend(false);

    return Empty;

  })(TextObject);

  LatestChange = (function(_super) {
    __extends(LatestChange, _super);

    function LatestChange() {
      return LatestChange.__super__.constructor.apply(this, arguments);
    }

    LatestChange.extend(false);

    LatestChange.prototype.getRange = function() {
      this.stopSelection();
      return this.vimState.mark.getRange('[', ']');
    };

    return LatestChange;

  })(TextObject);

  ALatestChange = (function(_super) {
    __extends(ALatestChange, _super);

    function ALatestChange() {
      return ALatestChange.__super__.constructor.apply(this, arguments);
    }

    ALatestChange.extend();

    return ALatestChange;

  })(LatestChange);

  InnerLatestChange = (function(_super) {
    __extends(InnerLatestChange, _super);

    function InnerLatestChange() {
      return InnerLatestChange.__super__.constructor.apply(this, arguments);
    }

    InnerLatestChange.extend();

    return InnerLatestChange;

  })(LatestChange);

  SearchMatchForward = (function(_super) {
    __extends(SearchMatchForward, _super);

    function SearchMatchForward() {
      return SearchMatchForward.__super__.constructor.apply(this, arguments);
    }

    SearchMatchForward.extend();

    SearchMatchForward.prototype.backward = false;

    SearchMatchForward.prototype.findMatch = function(fromPoint, pattern) {
      var found, scanRange;
      if (this.isMode('visual')) {
        fromPoint = translatePointAndClip(this.editor, fromPoint, "forward");
      }
      scanRange = [[fromPoint.row, 0], this.getVimEofBufferPosition()];
      found = null;
      this.editor.scanInBufferRange(pattern, scanRange, function(_arg) {
        var range, stop;
        range = _arg.range, stop = _arg.stop;
        if (range.end.isGreaterThan(fromPoint)) {
          found = range;
          return stop();
        }
      });
      return {
        range: found,
        whichIsHead: 'end'
      };
    };

    SearchMatchForward.prototype.getRange = function(selection) {
      var fromPoint, pattern, range, whichIsHead, _ref2;
      pattern = this.globalState.get('lastSearchPattern');
      if (pattern == null) {
        return;
      }
      fromPoint = selection.getHeadBufferPosition();
      _ref2 = this.findMatch(fromPoint, pattern), range = _ref2.range, whichIsHead = _ref2.whichIsHead;
      if (range != null) {
        return this.unionRangeAndDetermineReversedState(selection, range, whichIsHead);
      }
    };

    SearchMatchForward.prototype.unionRangeAndDetermineReversedState = function(selection, found, whichIsHead) {
      var head, tail;
      if (selection.isEmpty()) {
        return found;
      } else {
        head = found[whichIsHead];
        tail = selection.getTailBufferPosition();
        if (this.backward) {
          if (tail.isLessThan(head)) {
            head = translatePointAndClip(this.editor, head, 'forward');
          }
        } else {
          if (head.isLessThan(tail)) {
            head = translatePointAndClip(this.editor, head, 'backward');
          }
        }
        this.reversed = head.isLessThan(tail);
        return new Range(tail, head).union(swrap(selection).getTailBufferRange());
      }
    };

    SearchMatchForward.prototype.selectTextObject = function(selection) {
      var range, reversed, _ref2;
      if (!(range = this.getRange(selection))) {
        return;
      }
      reversed = (_ref2 = this.reversed) != null ? _ref2 : this.backward;
      swrap(selection).setBufferRange(range, {
        reversed: reversed
      });
      return selection.cursor.autoscroll();
    };

    return SearchMatchForward;

  })(TextObject);

  SearchMatchBackward = (function(_super) {
    __extends(SearchMatchBackward, _super);

    function SearchMatchBackward() {
      return SearchMatchBackward.__super__.constructor.apply(this, arguments);
    }

    SearchMatchBackward.extend();

    SearchMatchBackward.prototype.backward = true;

    SearchMatchBackward.prototype.findMatch = function(fromPoint, pattern) {
      var found, scanRange;
      if (this.isMode('visual')) {
        fromPoint = translatePointAndClip(this.editor, fromPoint, "backward");
      }
      scanRange = [[fromPoint.row, Infinity], [0, 0]];
      found = null;
      this.editor.backwardsScanInBufferRange(pattern, scanRange, function(_arg) {
        var range, stop;
        range = _arg.range, stop = _arg.stop;
        if (range.start.isLessThan(fromPoint)) {
          found = range;
          return stop();
        }
      });
      return {
        range: found,
        whichIsHead: 'start'
      };
    };

    return SearchMatchBackward;

  })(SearchMatchForward);

  PreviousSelection = (function(_super) {
    __extends(PreviousSelection, _super);

    function PreviousSelection() {
      return PreviousSelection.__super__.constructor.apply(this, arguments);
    }

    PreviousSelection.extend();

    PreviousSelection.prototype.select = function() {
      var properties, selection, _ref2;
      _ref2 = this.vimState.previousSelection, properties = _ref2.properties, this.submode = _ref2.submode;
      if ((properties != null) && (this.submode != null)) {
        selection = this.editor.getLastSelection();
        return swrap(selection).selectByProperties(properties);
      }
    };

    return PreviousSelection;

  })(TextObject);

  PersistentSelection = (function(_super) {
    __extends(PersistentSelection, _super);

    function PersistentSelection() {
      return PersistentSelection.__super__.constructor.apply(this, arguments);
    }

    PersistentSelection.extend(false);

    PersistentSelection.prototype.select = function() {
      var ranges;
      ranges = this.vimState.persistentSelection.getMarkerBufferRanges();
      if (ranges.length) {
        this.editor.setSelectedBufferRanges(ranges);
      }
      return this.vimState.clearPersistentSelections();
    };

    return PersistentSelection;

  })(TextObject);

  APersistentSelection = (function(_super) {
    __extends(APersistentSelection, _super);

    function APersistentSelection() {
      return APersistentSelection.__super__.constructor.apply(this, arguments);
    }

    APersistentSelection.extend();

    return APersistentSelection;

  })(PersistentSelection);

  InnerPersistentSelection = (function(_super) {
    __extends(InnerPersistentSelection, _super);

    function InnerPersistentSelection() {
      return InnerPersistentSelection.__super__.constructor.apply(this, arguments);
    }

    InnerPersistentSelection.extend();

    return InnerPersistentSelection;

  })(PersistentSelection);

  VisibleArea = (function(_super) {
    __extends(VisibleArea, _super);

    function VisibleArea() {
      return VisibleArea.__super__.constructor.apply(this, arguments);
    }

    VisibleArea.extend(false);

    VisibleArea.prototype.getRange = function(selection) {
      this.stopSelection();
      return getVisibleBufferRange(this.editor).translate([+1, 0], [-3, 0]);
    };

    return VisibleArea;

  })(TextObject);

  AVisibleArea = (function(_super) {
    __extends(AVisibleArea, _super);

    function AVisibleArea() {
      return AVisibleArea.__super__.constructor.apply(this, arguments);
    }

    AVisibleArea.extend();

    return AVisibleArea;

  })(VisibleArea);

  InnerVisibleArea = (function(_super) {
    __extends(InnerVisibleArea, _super);

    function InnerVisibleArea() {
      return InnerVisibleArea.__super__.constructor.apply(this, arguments);
    }

    InnerVisibleArea.extend();

    return InnerVisibleArea;

  })(VisibleArea);

  Edge = (function(_super) {
    __extends(Edge, _super);

    function Edge() {
      return Edge.__super__.constructor.apply(this, arguments);
    }

    Edge.extend(false);

    Edge.prototype.select = function() {
      this.success = null;
      Edge.__super__.select.apply(this, arguments);
      if (this.success) {
        return this.vimState.activate('visual', 'linewise');
      }
    };

    Edge.prototype.getRange = function(selection) {
      var endScreenPoint, fromPoint, moveDownToEdge, moveUpToEdge, range, screenRange, startScreenPoint;
      fromPoint = this.getNormalizedHeadScreenPosition(selection);
      moveUpToEdge = this["new"]('MoveUpToEdge');
      moveDownToEdge = this["new"]('MoveDownToEdge');
      if (!moveUpToEdge.isStoppablePoint(fromPoint)) {
        return;
      }
      startScreenPoint = endScreenPoint = null;
      if (moveUpToEdge.isEdge(fromPoint)) {
        startScreenPoint = endScreenPoint = fromPoint;
      }
      if (moveUpToEdge.isStoppablePoint(fromPoint.translate([-1, 0]))) {
        startScreenPoint = moveUpToEdge.getPoint(fromPoint);
      }
      if (moveDownToEdge.isStoppablePoint(fromPoint.translate([+1, 0]))) {
        endScreenPoint = moveDownToEdge.getPoint(fromPoint);
      }
      if ((startScreenPoint != null) && (endScreenPoint != null)) {
        if (this.success == null) {
          this.success = true;
        }
        screenRange = new Range(startScreenPoint, endScreenPoint);
        range = this.editor.bufferRangeForScreenRange(screenRange);
        return getRangeByTranslatePointAndClip(this.editor, range, 'end', 'forward');
      }
    };

    return Edge;

  })(TextObject);

  AEdge = (function(_super) {
    __extends(AEdge, _super);

    function AEdge() {
      return AEdge.__super__.constructor.apply(this, arguments);
    }

    AEdge.extend();

    return AEdge;

  })(Edge);

  InnerEdge = (function(_super) {
    __extends(InnerEdge, _super);

    function InnerEdge() {
      return InnerEdge.__super__.constructor.apply(this, arguments);
    }

    InnerEdge.extend();

    return InnerEdge;

  })(Edge);

  UnionTextObject = (function(_super) {
    __extends(UnionTextObject, _super);

    function UnionTextObject() {
      return UnionTextObject.__super__.constructor.apply(this, arguments);
    }

    UnionTextObject.extend(false);

    UnionTextObject.prototype.member = [];

    UnionTextObject.prototype.getRange = function(selection) {
      var member, range, unionRange, _i, _len, _ref2;
      unionRange = null;
      _ref2 = this.member;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        member = _ref2[_i];
        if (range = this["new"](member).getRange(selection)) {
          if (unionRange != null) {
            unionRange = unionRange.union(range);
          } else {
            unionRange = range;
          }
        }
      }
      return unionRange;
    };

    return UnionTextObject;

  })(TextObject);

  AFunctionOrInnerParagraph = (function(_super) {
    __extends(AFunctionOrInnerParagraph, _super);

    function AFunctionOrInnerParagraph() {
      return AFunctionOrInnerParagraph.__super__.constructor.apply(this, arguments);
    }

    AFunctionOrInnerParagraph.extend();

    AFunctionOrInnerParagraph.prototype.member = ['AFunction', 'InnerParagraph'];

    return AFunctionOrInnerParagraph;

  })(UnionTextObject);

  ACurrentSelectionAndAPersistentSelection = (function(_super) {
    __extends(ACurrentSelectionAndAPersistentSelection, _super);

    function ACurrentSelectionAndAPersistentSelection() {
      return ACurrentSelectionAndAPersistentSelection.__super__.constructor.apply(this, arguments);
    }

    ACurrentSelectionAndAPersistentSelection.extend();

    ACurrentSelectionAndAPersistentSelection.prototype.select = function() {
      var pesistentRanges, ranges, selectedRanges;
      pesistentRanges = this.vimState.getPersistentSelectionBuffferRanges();
      selectedRanges = this.editor.getSelectedBufferRanges();
      ranges = pesistentRanges.concat(selectedRanges);
      if (ranges.length) {
        this.editor.setSelectedBufferRanges(ranges);
      }
      this.vimState.clearPersistentSelections();
      return this.editor.mergeIntersectingSelections();
    };

    return ACurrentSelectionAndAPersistentSelection;

  })(TextObject);

  TextObjectFirstFound = (function(_super) {
    __extends(TextObjectFirstFound, _super);

    function TextObjectFirstFound() {
      return TextObjectFirstFound.__super__.constructor.apply(this, arguments);
    }

    TextObjectFirstFound.extend(false);

    TextObjectFirstFound.prototype.member = [];

    TextObjectFirstFound.prototype.memberOptoins = {
      allowNextLine: false
    };

    TextObjectFirstFound.prototype.getRangeBy = function(klass, selection) {
      return this["new"](klass, this.memberOptoins).getRange(selection);
    };

    TextObjectFirstFound.prototype.getRanges = function(selection) {
      var klass, range, _i, _len, _ref2, _results;
      _ref2 = this.member;
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        klass = _ref2[_i];
        if ((range = this.getRangeBy(klass, selection))) {
          _results.push(range);
        }
      }
      return _results;
    };

    TextObjectFirstFound.prototype.getRange = function(selection) {
      var member, range, _i, _len, _ref2;
      _ref2 = this.member;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        member = _ref2[_i];
        if (range = this.getRangeBy(member, selection)) {
          return range;
        }
      }
    };

    return TextObjectFirstFound;

  })(TextObject);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi90ZXh0LW9iamVjdC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsdTREQUFBO0lBQUE7O3lKQUFBOztBQUFBLEVBQUEsT0FBaUIsT0FBQSxDQUFRLE1BQVIsQ0FBakIsRUFBQyxhQUFBLEtBQUQsRUFBUSxhQUFBLEtBQVIsQ0FBQTs7QUFBQSxFQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FESixDQUFBOztBQUFBLEVBUUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSLENBUlAsQ0FBQTs7QUFBQSxFQVNBLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVIsQ0FUUixDQUFBOztBQUFBLEVBVUEsUUFpQkksT0FBQSxDQUFRLFNBQVIsQ0FqQkosRUFDRSxtQkFBQSxVQURGLEVBQ2MsZ0NBQUEsdUJBRGQsRUFDdUMsa0JBQUEsU0FEdkMsRUFDa0QsMkJBQUEsa0JBRGxELEVBRUUsdUJBQUEsY0FGRixFQUdFLG1DQUFBLDBCQUhGLEVBSUUsNENBQUEsbUNBSkYsRUFLRSxrQ0FBQSx5QkFMRixFQU1FLHFDQUFBLDRCQU5GLEVBT0UsbUNBQUEsMEJBUEYsRUFRRSxpQ0FBQSx3QkFSRixFQVNFLDhCQUFBLHFCQVRGLEVBVUUsOEJBQUEscUJBVkYsRUFXRSx3Q0FBQSwrQkFYRixFQVlFLHNCQUFBLGFBWkYsRUFhRSw2QkFBQSxvQkFiRixFQWVFLG1DQUFBLDBCQWZGLEVBZ0JFLGtCQUFBLFNBMUJGLENBQUE7O0FBQUEsRUE2Qk07QUFDSixpQ0FBQSxDQUFBOztBQUFBLElBQUEsVUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSLENBQUEsQ0FBQTs7QUFBQSx5QkFDQSxrQkFBQSxHQUFvQixJQURwQixDQUFBOztBQUVhLElBQUEsb0JBQUEsR0FBQTtBQUNYLE1BQUEsSUFBQyxDQUFBLFdBQVcsQ0FBQSxTQUFFLENBQUEsS0FBZCxHQUFzQixJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxVQUFYLENBQXNCLE9BQXRCLENBQXRCLENBQUE7QUFBQSxNQUNBLDZDQUFBLFNBQUEsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsVUFBRCxDQUFBLENBRkEsQ0FEVztJQUFBLENBRmI7O0FBQUEseUJBT0EsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUNQLElBQUMsQ0FBQSxNQURNO0lBQUEsQ0FQVCxDQUFBOztBQUFBLHlCQVVBLEdBQUEsR0FBSyxTQUFBLEdBQUE7YUFDSCxDQUFBLElBQUssQ0FBQSxPQUFELENBQUEsRUFERDtJQUFBLENBVkwsQ0FBQTs7QUFBQSx5QkFhQSxvQkFBQSxHQUFzQixTQUFBLEdBQUE7YUFDcEIsSUFBQyxDQUFBLG1CQURtQjtJQUFBLENBYnRCLENBQUE7O0FBQUEseUJBZ0JBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixNQUFBLElBQUcsSUFBQyxDQUFBLG9CQUFELENBQUEsQ0FBSDtlQUNFLEtBQUssQ0FBQyx1QkFBTixDQUE4QixJQUFDLENBQUEsTUFBL0IsQ0FBQSxLQUEwQyxXQUQ1QztPQUFBLE1BQUE7ZUFHRSxJQUFDLENBQUEsTUFBRCxDQUFRLFFBQVIsRUFBa0IsVUFBbEIsRUFIRjtPQURVO0lBQUEsQ0FoQlosQ0FBQTs7QUFBQSx5QkFzQkEsYUFBQSxHQUFlLFNBQUEsR0FBQTthQUNiLElBQUMsQ0FBQSxTQUFELEdBQWEsTUFEQTtJQUFBLENBdEJmLENBQUE7O0FBQUEseUJBeUJBLCtCQUFBLEdBQWlDLFNBQUMsU0FBRCxHQUFBO0FBQy9CLFVBQUEsSUFBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLFNBQVMsQ0FBQyxxQkFBVixDQUFBLENBQVAsQ0FBQTtBQUNBLE1BQUEsSUFBRyxJQUFDLENBQUEsTUFBRCxDQUFRLFFBQVIsQ0FBQSxJQUFzQixDQUFBLFNBQWEsQ0FBQyxVQUFWLENBQUEsQ0FBN0I7QUFDRSxRQUFBLElBQUEsR0FBTyxxQkFBQSxDQUFzQixJQUFDLENBQUEsTUFBdkIsRUFBK0IsSUFBL0IsRUFBcUMsVUFBckMsQ0FBUCxDQURGO09BREE7YUFHQSxLQUorQjtJQUFBLENBekJqQyxDQUFBOztBQUFBLHlCQStCQSwrQkFBQSxHQUFpQyxTQUFDLFNBQUQsR0FBQTtBQUMvQixVQUFBLGNBQUE7QUFBQSxNQUFBLGNBQUEsR0FBaUIsSUFBQyxDQUFBLCtCQUFELENBQWlDLFNBQWpDLENBQWpCLENBQUE7YUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLCtCQUFSLENBQXdDLGNBQXhDLEVBRitCO0lBQUEsQ0EvQmpDLENBQUE7O0FBQUEseUJBbUNBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTixNQUFBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBYixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsVUFBRCxDQUFZLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDVixjQUFBLG9DQUFBO0FBQUE7QUFBQTtlQUFBLDRDQUFBO2tDQUFBO2dCQUE4QyxLQUFDLENBQUE7QUFDN0MsNEJBQUEsS0FBQyxDQUFBLGdCQUFELENBQWtCLFNBQWxCLEVBQUE7YUFERjtBQUFBOzBCQURVO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWixDQUZBLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxNQUFNLENBQUMsMkJBQVIsQ0FBQSxDQUxBLENBQUE7QUFNQSxNQUFBLElBQWdDLElBQUMsQ0FBQSxNQUFELENBQVEsUUFBUixDQUFoQztlQUFBLElBQUMsQ0FBQSx5QkFBRCxDQUFBLEVBQUE7T0FQTTtJQUFBLENBbkNSLENBQUE7O0FBQUEseUJBNENBLGdCQUFBLEdBQWtCLFNBQUMsU0FBRCxHQUFBO0FBQ2hCLFVBQUEsS0FBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxRQUFELENBQVUsU0FBVixDQUFSLENBQUE7YUFDQSxLQUFBLENBQU0sU0FBTixDQUFnQixDQUFDLG9CQUFqQixDQUFzQyxLQUF0QyxFQUZnQjtJQUFBLENBNUNsQixDQUFBOztBQUFBLHlCQWdEQSxRQUFBLEdBQVUsU0FBQSxHQUFBLENBaERWLENBQUE7O3NCQUFBOztLQUR1QixLQTdCekIsQ0FBQTs7QUFBQSxFQW1GTTtBQUNKLDJCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLElBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQUEsbUJBRUEsUUFBQSxHQUFVLFNBQUMsU0FBRCxHQUFBO0FBQ1IsVUFBQSx5QkFBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSwrQkFBRCxDQUFpQyxTQUFqQyxDQUFSLENBQUE7QUFBQSxNQUNBLFFBQWdCLElBQUMsQ0FBQSx5Q0FBRCxDQUEyQyxLQUEzQyxFQUFrRDtBQUFBLFFBQUUsV0FBRCxJQUFDLENBQUEsU0FBRjtPQUFsRCxDQUFoQixFQUFDLGNBQUEsS0FBRCxFQUFRLGFBQUEsSUFEUixDQUFBO0FBRUEsTUFBQSxJQUFHLElBQUMsQ0FBQSxHQUFELENBQUEsQ0FBQSxJQUFXLElBQUEsS0FBUSxNQUF0QjtBQUNFLFFBQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSx3QkFBRCxDQUEwQixLQUExQixDQUFSLENBREY7T0FGQTthQUlBLE1BTFE7SUFBQSxDQUZWLENBQUE7O0FBQUEsbUJBU0Esd0JBQUEsR0FBMEIsU0FBQyxLQUFELEdBQUE7QUFDeEIsVUFBQSxnQkFBQTtBQUFBLE1BQUEsSUFBRyxNQUFBLEdBQVMsd0JBQUEsQ0FBeUIsSUFBQyxDQUFBLE1BQTFCLEVBQWtDLEtBQUssQ0FBQyxHQUF4QyxFQUE2QyxLQUE3QyxFQUFvRDtBQUFBLFFBQUEsYUFBQSxFQUFlLElBQWY7T0FBcEQsQ0FBWjtBQUNFLGVBQVcsSUFBQSxLQUFBLENBQU0sS0FBSyxDQUFDLEtBQVosRUFBbUIsTUFBbkIsQ0FBWCxDQURGO09BQUE7QUFHQSxNQUFBLElBQUcsUUFBQSxHQUFXLDBCQUFBLENBQTJCLElBQUMsQ0FBQSxNQUE1QixFQUFvQyxLQUFLLENBQUMsS0FBMUMsRUFBaUQsS0FBakQsRUFBd0Q7QUFBQSxRQUFBLGFBQUEsRUFBZSxJQUFmO09BQXhELENBQWQ7QUFFRSxRQUFBLElBQTZDLFFBQVEsQ0FBQyxNQUFULEtBQW1CLENBQWhFO0FBQUEsaUJBQVcsSUFBQSxLQUFBLENBQU0sUUFBTixFQUFnQixLQUFLLENBQUMsR0FBdEIsQ0FBWCxDQUFBO1NBRkY7T0FIQTthQU9BLE1BUndCO0lBQUEsQ0FUMUIsQ0FBQTs7Z0JBQUE7O0tBRGlCLFdBbkZuQixDQUFBOztBQUFBLEVBdUdNO0FBQ0osNEJBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsS0FBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O2lCQUFBOztLQURrQixLQXZHcEIsQ0FBQTs7QUFBQSxFQTBHTTtBQUNKLGdDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFNBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztxQkFBQTs7S0FEc0IsS0ExR3hCLENBQUE7O0FBQUEsRUE4R007QUFDSixnQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxTQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUFBLHdCQUNBLFNBQUEsR0FBVyxLQURYLENBQUE7O3FCQUFBOztLQURzQixLQTlHeEIsQ0FBQTs7QUFBQSxFQWtITTtBQUNKLGlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFVBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztzQkFBQTs7S0FEdUIsVUFsSHpCLENBQUE7O0FBQUEsRUFxSE07QUFDSixxQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxjQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7MEJBQUE7O0tBRDJCLFVBckg3QixDQUFBOztBQUFBLEVBMEhNO0FBQ0osZ0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsU0FBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSLENBQUEsQ0FBQTs7QUFBQSx3QkFDQSxTQUFBLEdBQVcsUUFEWCxDQUFBOztxQkFBQTs7S0FEc0IsS0ExSHhCLENBQUE7O0FBQUEsRUE4SE07QUFDSixpQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxVQUFDLENBQUEsV0FBRCxHQUFjLDZFQUFkLENBQUE7O0FBQUEsSUFDQSxVQUFDLENBQUEsTUFBRCxDQUFBLENBREEsQ0FBQTs7c0JBQUE7O0tBRHVCLFVBOUh6QixDQUFBOztBQUFBLEVBa0lNO0FBQ0oscUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsY0FBQyxDQUFBLFdBQUQsR0FBYyx1Q0FBZCxDQUFBOztBQUFBLElBQ0EsY0FBQyxDQUFBLE1BQUQsQ0FBQSxDQURBLENBQUE7OzBCQUFBOztLQUQyQixVQWxJN0IsQ0FBQTs7QUFBQSxFQXVJTTtBQUNKLFFBQUEsZ0JBQUE7O0FBQUEsMkJBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsSUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSLENBQUEsQ0FBQTs7QUFBQSxtQkFDQSxhQUFBLEdBQWUsS0FEZixDQUFBOztBQUFBLG1CQUVBLGtCQUFBLEdBQW9CLEtBRnBCLENBQUE7O0FBQUEsbUJBR0EsZ0JBQUEsR0FBa0IsSUFIbEIsQ0FBQTs7QUFBQSxtQkFJQSxJQUFBLEdBQU0sSUFKTixDQUFBOztBQUFBLG1CQU1BLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixVQUFBLGtCQUFBO0FBQUEsTUFBQSxRQUFnQixJQUFDLENBQUEsSUFBakIsRUFBQyxlQUFELEVBQU8sZ0JBQVAsQ0FBQTtBQUNBLE1BQUEsSUFBRyxJQUFBLEtBQVEsS0FBWDtlQUNNLElBQUEsTUFBQSxDQUFRLEdBQUEsR0FBRSxDQUFDLENBQUMsQ0FBQyxZQUFGLENBQWUsSUFBZixDQUFELENBQUYsR0FBd0IsR0FBaEMsRUFBb0MsR0FBcEMsRUFETjtPQUFBLE1BQUE7ZUFHTSxJQUFBLE1BQUEsQ0FBUSxHQUFBLEdBQUUsQ0FBQyxDQUFDLENBQUMsWUFBRixDQUFlLElBQWYsQ0FBRCxDQUFGLEdBQXdCLEtBQXhCLEdBQTRCLENBQUMsQ0FBQyxDQUFDLFlBQUYsQ0FBZSxLQUFmLENBQUQsQ0FBNUIsR0FBbUQsR0FBM0QsRUFBK0QsR0FBL0QsRUFITjtPQUZVO0lBQUEsQ0FOWixDQUFBOztBQUFBLG1CQWNBLFlBQUEsR0FBYyxTQUFDLElBQUQsR0FBQTtBQUNaLFVBQUEsdUJBQUE7QUFBQSxNQURjLGlCQUFBLFdBQVcsYUFBQSxPQUFPLGFBQUEsS0FDaEMsQ0FBQTtBQUFBLGNBQU8sS0FBSyxDQUFDLE1BQWI7QUFBQSxhQUNPLENBRFA7aUJBRUksSUFBQyxDQUFBLHNCQUFELENBQXdCLEtBQXhCLEVBQStCLFNBQS9CLEVBRko7QUFBQSxhQUdPLENBSFA7QUFJSSxrQkFBQSxLQUFBO0FBQUEsa0JBQ08sS0FBTSxDQUFBLENBQUEsQ0FEYjtxQkFDcUIsT0FEckI7QUFBQSxrQkFFTyxLQUFNLENBQUEsQ0FBQSxDQUZiO3FCQUVxQixRQUZyQjtBQUFBLFdBSko7QUFBQSxPQURZO0lBQUEsQ0FkZCxDQUFBOztBQUFBLElBdUJBLGdCQUFBLEdBQW1CLENBQUMsQ0FBQyxZQUFGLENBQWUsSUFBZixDQXZCbkIsQ0FBQTs7QUFBQSxtQkF3QkEsc0JBQUEsR0FBd0IsU0FBQyxLQUFELEVBQVEsSUFBUixHQUFBO0FBQ3RCLFVBQUEsd0NBQUE7QUFBQSxNQUFBLElBQUEsR0FBTyxjQUFBLENBQWUsSUFBQyxDQUFBLE1BQWhCLEVBQXdCLEtBQUssQ0FBQyxHQUE5QixDQUFQLENBQUE7QUFBQSxNQUNBLFdBQUEsR0FBYyxDQUFDLENBQUMsWUFBRixDQUFlLElBQWYsQ0FEZCxDQUFBO0FBQUEsTUFFQSxFQUFBLEdBQUssZ0JBRkwsQ0FBQTtBQUFBLE1BR0EsUUFBQSxHQUFXLENBQ1QsRUFBQSxHQUFHLEVBQUgsR0FBUSxFQUFSLEdBQWEsV0FESixFQUVSLElBQUEsR0FBSSxFQUFKLEdBQU8sSUFBUCxHQUFXLFdBRkgsQ0FIWCxDQUFBO0FBQUEsTUFPQSxPQUFBLEdBQWMsSUFBQSxNQUFBLENBQU8sUUFBUSxDQUFDLElBQVQsQ0FBYyxHQUFkLENBQVAsQ0FQZCxDQUFBO2FBUUEsQ0FBQyxPQUFELEVBQVUsTUFBVixDQUFrQixDQUFDLFNBQUEsQ0FBVSxJQUFWLEVBQWdCLE9BQWhCLENBQUEsR0FBMkIsQ0FBNUIsRUFUSTtJQUFBLENBeEJ4QixDQUFBOztBQUFBLG1CQW9DQSxvQkFBQSxHQUFzQixTQUFDLEtBQUQsR0FBQTtBQUNwQixVQUFBLDZCQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsS0FBUixDQUFBO0FBQUEsTUFFQSxFQUFBLEdBQUssZ0JBRkwsQ0FBQTtBQUFBLE1BR0EsT0FBQSxHQUFjLElBQUEsTUFBQSxDQUFRLElBQUEsR0FBSSxFQUFKLEdBQU8sR0FBUCxHQUFVLEVBQWxCLENBSGQsQ0FBQTtBQUFBLE1BSUEsU0FBQSxHQUFZLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBUCxFQUFZLENBQVosQ0FBRCxFQUFpQixLQUFqQixDQUpaLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxNQUFNLENBQUMsMEJBQVIsQ0FBbUMsT0FBbkMsRUFBNEMsU0FBNUMsRUFBdUQsU0FBQyxJQUFELEdBQUE7QUFDckQsWUFBQSxzQkFBQTtBQUFBLFFBRHVELGlCQUFBLFdBQVcsYUFBQSxPQUFPLFlBQUEsSUFDekUsQ0FBQTtBQUFBLFFBQUEsSUFBRyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQVYsQ0FBa0IsS0FBbEIsQ0FBSDtBQUNFLFVBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtpQkFDQSxLQUFBLEdBQVEsS0FGVjtTQURxRDtNQUFBLENBQXZELENBTEEsQ0FBQTthQVNBLE1BVm9CO0lBQUEsQ0FwQ3RCLENBQUE7O0FBQUEsbUJBZ0RBLFFBQUEsR0FBVSxTQUFDLEtBQUQsRUFBUSxPQUFSLEVBQWlCLEVBQWpCLEdBQUE7QUFDUixVQUFBLGtDQUFBO0FBQUEsTUFBQyxlQUFBLElBQUQsRUFBTyxrQkFBQSxPQUFQLEVBQWdCLG1CQUFBLFFBQWhCLEVBQTBCLG9CQUFBLFNBQTFCLENBQUE7YUFDQSxJQUFDLENBQUEsTUFBTyxDQUFBLFFBQUEsQ0FBUixDQUFrQixPQUFsQixFQUEyQixTQUEzQixFQUFzQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxLQUFELEdBQUE7QUFDcEMsY0FBQSxzQkFBQTtBQUFBLFVBQUMsa0JBQUEsU0FBRCxFQUFZLGNBQUEsS0FBWixFQUFtQixhQUFBLElBQW5CLENBQUE7QUFDQSxVQUFBLElBQUEsQ0FBQSxDQUFPLEtBQUMsQ0FBQSxhQUFELElBQWtCLENBQUMsSUFBSSxDQUFDLEdBQUwsS0FBWSxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQXpCLENBQXpCLENBQUE7QUFDRSxtQkFBTyxJQUFBLENBQUEsQ0FBUCxDQURGO1dBREE7QUFHQSxVQUFBLElBQVUsS0FBQyxDQUFBLG9CQUFELENBQXNCLEtBQUssQ0FBQyxLQUE1QixDQUFWO0FBQUEsa0JBQUEsQ0FBQTtXQUhBO2lCQUlBLEVBQUEsQ0FBRyxLQUFILEVBTG9DO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEMsRUFGUTtJQUFBLENBaERWLENBQUE7O0FBQUEsbUJBeURBLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBUSxPQUFSLEdBQUE7QUFDUixVQUFBLGlDQUFBO0FBQUEsTUFBQSxRQUFBLEdBQVcsNEJBQVgsQ0FBQTtBQUFBLE1BQ0EsU0FBQSxHQUFnQixJQUFBLEtBQUEsQ0FBTSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQU4sRUFBYyxJQUFkLENBRGhCLENBQUE7QUFBQSxNQUVBLEtBQUEsR0FBUSxFQUZSLENBQUE7QUFBQSxNQUdBLEtBQUEsR0FBUSxJQUhSLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxRQUFELENBQVUsTUFBVixFQUFrQjtBQUFBLFFBQUMsTUFBQSxJQUFEO0FBQUEsUUFBTyxTQUFBLE9BQVA7QUFBQSxRQUFnQixVQUFBLFFBQWhCO0FBQUEsUUFBMEIsV0FBQSxTQUExQjtPQUFsQixFQUF3RCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxLQUFELEdBQUE7QUFDdEQsY0FBQSxpQ0FBQTtBQUFBLFVBQUMsa0JBQUEsU0FBRCxFQUFZLGNBQUEsS0FBWixFQUFtQixhQUFBLElBQW5CLENBQUE7QUFBQSxVQUNBLFNBQUEsR0FBWSxLQUFDLENBQUEsWUFBRCxDQUFjLEtBQWQsQ0FEWixDQUFBO0FBRUEsVUFBQSxJQUFHLFNBQUEsS0FBYSxPQUFoQjtBQUNFLFlBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVztBQUFBLGNBQUMsV0FBQSxTQUFEO0FBQUEsY0FBWSxXQUFBLFNBQVo7QUFBQSxjQUF1QixPQUFBLEtBQXZCO2FBQVgsQ0FBQSxDQURGO1dBQUEsTUFBQTtBQUdFLFlBQUEsS0FBSyxDQUFDLEdBQU4sQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLElBQUcsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsQ0FBbkI7QUFDRSxjQUFBLEtBQUEsR0FBUSxLQUFSLENBREY7YUFKRjtXQUZBO0FBUUEsVUFBQSxJQUFVLGFBQVY7bUJBQUEsSUFBQSxDQUFBLEVBQUE7V0FUc0Q7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4RCxDQUpBLENBQUE7YUFjQSxNQWZRO0lBQUEsQ0F6RFYsQ0FBQTs7QUFBQSxtQkEwRUEsU0FBQSxHQUFXLFNBQUMsSUFBRCxFQUFRLE9BQVIsR0FBQTtBQUNULFVBQUEsaUNBQUE7QUFBQSxNQUFBLFFBQUEsR0FBVyxtQkFBWCxDQUFBO0FBQUEsTUFDQSxTQUFBLEdBQWdCLElBQUEsS0FBQSxDQUFNLElBQU4sRUFBWSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFmLENBQUEsQ0FBWixDQURoQixDQUFBO0FBQUEsTUFFQSxLQUFBLEdBQVEsRUFGUixDQUFBO0FBQUEsTUFHQSxLQUFBLEdBQVEsSUFIUixDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUI7QUFBQSxRQUFDLE1BQUEsSUFBRDtBQUFBLFFBQU8sU0FBQSxPQUFQO0FBQUEsUUFBZ0IsVUFBQSxRQUFoQjtBQUFBLFFBQTBCLFdBQUEsU0FBMUI7T0FBbkIsRUFBeUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsS0FBRCxHQUFBO0FBQ3ZELGNBQUEsd0NBQUE7QUFBQSxVQUFDLGNBQUEsS0FBRCxFQUFRLGFBQUEsSUFBUixDQUFBO0FBQUEsVUFDQSxTQUFBLEdBQVksS0FBQyxDQUFBLFlBQUQsQ0FBYyxLQUFkLENBRFosQ0FBQTtBQUVBLFVBQUEsSUFBRyxTQUFBLEtBQWEsTUFBaEI7QUFDRSxZQUFBLEtBQUssQ0FBQyxJQUFOLENBQVc7QUFBQSxjQUFDLFdBQUEsU0FBRDtBQUFBLGNBQVksT0FBQSxLQUFaO2FBQVgsQ0FBQSxDQURGO1dBQUEsTUFBQTtBQUdFLFlBQUEsS0FBQSxHQUFRLEtBQUssQ0FBQyxHQUFOLENBQUEsQ0FBUixDQUFBO0FBQ0EsWUFBQSxJQUFHLEtBQUssQ0FBQyxNQUFOLEtBQWdCLENBQW5CO0FBQ0UsY0FBQSxJQUFHLENBQUMsU0FBQSxtQkFBWSxLQUFLLENBQUUsS0FBSyxDQUFDLGNBQTFCLENBQUg7QUFDRSxnQkFBQSxJQUFHLEtBQUMsQ0FBQSxlQUFKO0FBQ0Usa0JBQUEsSUFBVSxTQUFTLENBQUMsR0FBVixHQUFnQixJQUFJLENBQUMsR0FBL0I7QUFBQSwwQkFBQSxDQUFBO21CQURGO2lCQUFBLE1BQUE7QUFHRSxrQkFBQSxJQUFVLFNBQVMsQ0FBQyxhQUFWLENBQXdCLElBQXhCLENBQVY7QUFBQSwwQkFBQSxDQUFBO21CQUhGO2lCQURGO2VBQUE7QUFBQSxjQUtBLEtBQUEsR0FBUSxLQUxSLENBREY7YUFKRjtXQUZBO0FBYUEsVUFBQSxJQUFVLGFBQVY7bUJBQUEsSUFBQSxDQUFBLEVBQUE7V0FkdUQ7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6RCxDQUpBLENBQUE7YUFtQkEsTUFwQlM7SUFBQSxDQTFFWCxDQUFBOztBQUFBLG1CQWdHQSxXQUFBLEdBQWEsU0FBQyxJQUFELEdBQUE7QUFDWCxVQUFBLHNHQUFBO0FBQUEsTUFBQSxRQUFBLEdBQVcsSUFBWCxDQUFBO0FBQUEsTUFDQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQURWLENBQUE7QUFBQSxNQUVBLFVBQUEsR0FBYSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQVgsRUFBaUIsT0FBakIsQ0FGYixDQUFBO0FBR0EsTUFBQSxJQUFpRCxrQkFBakQ7QUFBQSxRQUFBLFNBQUEsR0FBWSxJQUFDLENBQUEsUUFBRCxDQUFVLFVBQVUsQ0FBQyxHQUFyQixFQUEwQixPQUExQixDQUFaLENBQUE7T0FIQTtBQUtBLE1BQUEsSUFBQSxDQUFBLENBQVEsbUJBQUEsSUFBZSxvQkFBaEIsQ0FBUDtBQUNFLGVBQU8sSUFBUCxDQURGO09BTEE7QUFBQSxNQVFBLE1BQUEsR0FBYSxJQUFBLEtBQUEsQ0FBTSxTQUFTLENBQUMsS0FBaEIsRUFBdUIsVUFBVSxDQUFDLEdBQWxDLENBUmIsQ0FBQTtBQUFBLE1BU0EsUUFBeUIsQ0FBQyxTQUFTLENBQUMsR0FBWCxFQUFnQixVQUFVLENBQUMsS0FBM0IsQ0FBekIsRUFBQyxxQkFBRCxFQUFhLG1CQVRiLENBQUE7QUFVQSxNQUFBLElBQUcsSUFBQyxDQUFBLGdCQUFKO0FBU0UsUUFBQSxJQUFpRCxrQkFBQSxDQUFtQixJQUFDLENBQUEsTUFBcEIsRUFBNEIsVUFBNUIsQ0FBakQ7QUFBQSxVQUFBLFVBQUEsR0FBaUIsSUFBQSxLQUFBLENBQU0sVUFBVSxDQUFDLEdBQVgsR0FBaUIsQ0FBdkIsRUFBMEIsQ0FBMUIsQ0FBakIsQ0FBQTtTQUFBO0FBQ0EsUUFBQSxJQUF5QyxjQUFBLENBQWUsSUFBQyxDQUFBLE1BQWhCLEVBQXdCLFFBQXhCLENBQWlDLENBQUMsS0FBbEMsQ0FBd0MsT0FBeEMsQ0FBekM7QUFBQSxVQUFBLFFBQUEsR0FBZSxJQUFBLEtBQUEsQ0FBTSxRQUFRLENBQUMsR0FBZixFQUFvQixDQUFwQixDQUFmLENBQUE7U0FEQTtBQUVBLFFBQUEsSUFBRyxDQUFDLFFBQVEsQ0FBQyxNQUFULEtBQW1CLENBQXBCLENBQUEsSUFBMkIsQ0FBQyxVQUFVLENBQUMsTUFBWCxLQUF1QixDQUF4QixDQUE5QjtBQUNFLFVBQUEsUUFBQSxHQUFlLElBQUEsS0FBQSxDQUFNLFFBQVEsQ0FBQyxHQUFULEdBQWUsQ0FBckIsRUFBd0IsUUFBeEIsQ0FBZixDQURGO1NBWEY7T0FWQTtBQUFBLE1Bd0JBLFVBQUEsR0FBaUIsSUFBQSxLQUFBLENBQU0sVUFBTixFQUFrQixRQUFsQixDQXhCakIsQ0FBQTtBQUFBLE1BeUJBLFdBQUEsR0FBaUIsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFILEdBQW1CLFVBQW5CLEdBQW1DLE1BekJqRCxDQUFBO0FBMEJBLE1BQUEsSUFBRyxJQUFDLENBQUEsYUFBRCxJQUFtQixVQUFVLENBQUMsT0FBWCxDQUFBLENBQXRCO2VBQ0UsSUFBQyxDQUFBLFdBQUQsQ0FBYSxNQUFNLENBQUMsR0FBcEIsRUFERjtPQUFBLE1BQUE7ZUFHRTtBQUFBLFVBQUMsV0FBQSxTQUFEO0FBQUEsVUFBWSxZQUFBLFVBQVo7QUFBQSxVQUF3QixRQUFBLE1BQXhCO0FBQUEsVUFBZ0MsWUFBQSxVQUFoQztBQUFBLFVBQTRDLGFBQUEsV0FBNUM7VUFIRjtPQTNCVztJQUFBLENBaEdiLENBQUE7O0FBQUEsbUJBZ0lBLG9CQUFBLEdBQXNCLFNBQUMsU0FBRCxFQUFZLFVBQVosR0FBQTtBQUNwQixjQUFPLFVBQVA7QUFBQSxhQUNPLE1BRFA7aUJBQ21CLElBQUMsQ0FBQSwrQkFBRCxDQUFpQyxTQUFqQyxFQURuQjtBQUFBLGFBRU8sT0FGUDtpQkFFb0IsS0FBQSxDQUFNLFNBQU4sQ0FBZ0IsQ0FBQyxvQkFBakIsQ0FBc0MsT0FBdEMsRUFGcEI7QUFBQSxPQURvQjtJQUFBLENBaEl0QixDQUFBOztBQUFBLG1CQXNJQSxRQUFBLEdBQVUsU0FBQyxTQUFELEVBQVksT0FBWixHQUFBO0FBQ1IsVUFBQSxvREFBQTs7UUFEb0IsVUFBUTtPQUM1QjtBQUFBLE1BQUMsMEJBQUEsZUFBRCxFQUFrQixxQkFBQSxVQUFsQixDQUFBOztRQUNBLGFBQWM7T0FEZDtBQUVBLE1BQUEsSUFBc0MsdUJBQXRDO0FBQUEsUUFBQSxJQUFDLENBQUEsZUFBRCxHQUFtQixlQUFuQixDQUFBO09BRkE7QUFBQSxNQUdBLGFBQUEsR0FBZ0IsU0FBUyxDQUFDLGNBQVYsQ0FBQSxDQUhoQixDQUFBO0FBQUEsTUFJQSxRQUFBLEdBQVcsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsb0JBQUQsQ0FBc0IsU0FBdEIsRUFBaUMsVUFBakMsQ0FBYixDQUpYLENBQUE7QUFNQSxNQUFBLHVCQUFHLFFBQVEsQ0FBRSxXQUFXLENBQUMsT0FBdEIsQ0FBOEIsYUFBOUIsVUFBSDtBQUNFLFFBQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxXQUFELENBQWEsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUE3QixDQUFYLENBREY7T0FOQTtnQ0FRQSxRQUFRLENBQUUscUJBVEY7SUFBQSxDQXRJVixDQUFBOztnQkFBQTs7S0FEaUIsV0F2SW5CLENBQUE7O0FBQUEsRUEwUk07QUFDSiw4QkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxPQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUFBLHNCQUNBLGVBQUEsR0FBaUIsS0FEakIsQ0FBQTs7QUFBQSxzQkFFQSxhQUFBLEdBQWUsSUFGZixDQUFBOztBQUFBLHNCQUdBLGFBQUEsR0FBZSxLQUhmLENBQUE7O0FBQUEsc0JBSUEsTUFBQSxHQUFRLENBQ04sYUFETSxFQUNTLGFBRFQsRUFDd0IsVUFEeEIsRUFFTixjQUZNLEVBRVUsY0FGVixFQUUwQixLQUYxQixFQUVpQyxlQUZqQyxFQUVrRCxhQUZsRCxDQUpSLENBQUE7O0FBQUEsc0JBU0EsVUFBQSxHQUFZLFNBQUMsS0FBRCxFQUFRLFNBQVIsR0FBQTtBQUNWLFVBQUEsT0FBQTtBQUFBLE1BQUEsT0FBQSxHQUFVO0FBQUEsUUFBRSxPQUFELElBQUMsQ0FBQSxLQUFGO0FBQUEsUUFBVSxlQUFELElBQUMsQ0FBQSxhQUFWO09BQVYsQ0FBQTtBQUNBLE1BQUEsSUFBMEMsMEJBQTFDO0FBQUEsUUFBQSxPQUFPLENBQUMsYUFBUixHQUF3QixJQUFDLENBQUEsYUFBekIsQ0FBQTtPQURBO2FBRUEsSUFBQyxDQUFBLEtBQUEsQ0FBRCxDQUFLLEtBQUwsRUFBWSxPQUFaLENBQW9CLENBQUMsUUFBckIsQ0FBOEIsU0FBOUIsRUFBeUM7QUFBQSxRQUFFLGlCQUFELElBQUMsQ0FBQSxlQUFGO0FBQUEsUUFBb0IsWUFBRCxJQUFDLENBQUEsVUFBcEI7T0FBekMsRUFIVTtJQUFBLENBVFosQ0FBQTs7QUFBQSxzQkFjQSxTQUFBLEdBQVcsU0FBQyxTQUFELEdBQUE7QUFDVCxVQUFBLHVDQUFBO0FBQUM7QUFBQTtXQUFBLDRDQUFBOzBCQUFBO1lBQWdDLENBQUMsS0FBQSxHQUFRLElBQUMsQ0FBQSxVQUFELENBQVksS0FBWixFQUFtQixTQUFuQixDQUFUO0FBQWhDLHdCQUFBLE1BQUE7U0FBQTtBQUFBO3NCQURRO0lBQUEsQ0FkWCxDQUFBOztBQUFBLHNCQWlCQSxRQUFBLEdBQVUsU0FBQyxTQUFELEdBQUE7QUFDUixVQUFBLE1BQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsU0FBRCxDQUFXLFNBQVgsQ0FBVCxDQUFBO0FBQ0EsTUFBQSxJQUE4QixNQUFNLENBQUMsTUFBckM7ZUFBQSxDQUFDLENBQUMsSUFBRixDQUFPLFVBQUEsQ0FBVyxNQUFYLENBQVAsRUFBQTtPQUZRO0lBQUEsQ0FqQlYsQ0FBQTs7bUJBQUE7O0tBRG9CLEtBMVJ0QixDQUFBOztBQUFBLEVBZ1RNO0FBQ0osK0JBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsUUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O29CQUFBOztLQURxQixRQWhUdkIsQ0FBQTs7QUFBQSxFQW1UTTtBQUNKLG1DQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFlBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOzt3QkFBQTs7S0FEeUIsUUFuVDNCLENBQUE7O0FBQUEsRUF1VE07QUFDSiw2Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxzQkFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSLENBQUEsQ0FBQTs7QUFBQSxJQUNBLHNCQUFDLENBQUEsV0FBRCxHQUFjLGtGQURkLENBQUE7O0FBQUEscUNBRUEsZUFBQSxHQUFpQixJQUZqQixDQUFBOztBQUFBLHFDQUdBLGFBQUEsR0FBZSxLQUhmLENBQUE7O0FBQUEscUNBSUEsVUFBQSxHQUFZLE9BSlosQ0FBQTs7QUFBQSxxQ0FLQSxRQUFBLEdBQVUsU0FBQyxTQUFELEdBQUE7QUFDUixVQUFBLHNFQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFNBQUQsQ0FBVyxTQUFYLENBQVQsQ0FBQTtBQUFBLE1BQ0EsSUFBQSxHQUFPLFNBQVMsQ0FBQyxNQUFNLENBQUMsaUJBQWpCLENBQUEsQ0FEUCxDQUFBO0FBQUEsTUFFQSxRQUFzQyxDQUFDLENBQUMsU0FBRixDQUFZLE1BQVosRUFBb0IsU0FBQyxLQUFELEdBQUE7ZUFDeEQsS0FBSyxDQUFDLEtBQUssQ0FBQyxvQkFBWixDQUFpQyxJQUFqQyxFQUR3RDtNQUFBLENBQXBCLENBQXRDLEVBQUMsMkJBQUQsRUFBbUIsMEJBRm5CLENBQUE7QUFBQSxNQUlBLGNBQUEsR0FBaUIsQ0FBQyxDQUFDLElBQUYsQ0FBTyxVQUFBLENBQVcsZUFBWCxDQUFQLENBSmpCLENBQUE7QUFBQSxNQUtBLGdCQUFBLEdBQW1CLFVBQUEsQ0FBVyxnQkFBWCxDQUxuQixDQUFBO0FBVUEsTUFBQSxJQUFHLGNBQUg7QUFDRSxRQUFBLGdCQUFBLEdBQW1CLGdCQUFnQixDQUFDLE1BQWpCLENBQXdCLFNBQUMsS0FBRCxHQUFBO2lCQUN6QyxjQUFjLENBQUMsYUFBZixDQUE2QixLQUE3QixFQUR5QztRQUFBLENBQXhCLENBQW5CLENBREY7T0FWQTthQWNBLGdCQUFpQixDQUFBLENBQUEsQ0FBakIsSUFBdUIsZUFmZjtJQUFBLENBTFYsQ0FBQTs7a0NBQUE7O0tBRG1DLFFBdlRyQyxDQUFBOztBQUFBLEVBOFVNO0FBQ0osOENBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsdUJBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOzttQ0FBQTs7S0FEb0MsdUJBOVV0QyxDQUFBOztBQUFBLEVBaVZNO0FBQ0osa0RBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsMkJBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOzt1Q0FBQTs7S0FEd0MsdUJBalYxQyxDQUFBOztBQUFBLEVBcVZNO0FBQ0osK0JBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsUUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSLENBQUEsQ0FBQTs7QUFBQSx1QkFDQSxlQUFBLEdBQWlCLElBRGpCLENBQUE7O0FBQUEsdUJBRUEsTUFBQSxHQUFRLENBQUMsYUFBRCxFQUFnQixhQUFoQixFQUErQixVQUEvQixDQUZSLENBQUE7O0FBQUEsdUJBR0EsUUFBQSxHQUFVLFNBQUMsU0FBRCxHQUFBO0FBQ1IsVUFBQSxNQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFNBQUQsQ0FBVyxTQUFYLENBQVQsQ0FBQTtBQUVBLE1BQUEsSUFBa0QsTUFBTSxDQUFDLE1BQXpEO2VBQUEsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxDQUFDLENBQUMsTUFBRixDQUFTLE1BQVQsRUFBaUIsU0FBQyxDQUFELEdBQUE7aUJBQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFiO1FBQUEsQ0FBakIsQ0FBUixFQUFBO09BSFE7SUFBQSxDQUhWLENBQUE7O29CQUFBOztLQURxQixRQXJWdkIsQ0FBQTs7QUFBQSxFQThWTTtBQUNKLGdDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFNBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztxQkFBQTs7S0FEc0IsU0E5VnhCLENBQUE7O0FBQUEsRUFpV007QUFDSixvQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxhQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7eUJBQUE7O0tBRDBCLFNBalc1QixDQUFBOztBQUFBLEVBcVdNO0FBQ0osNEJBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsS0FBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSLENBQUEsQ0FBQTs7QUFBQSxvQkFDQSxlQUFBLEdBQWlCLElBRGpCLENBQUE7O0FBQUEsb0JBRUEsYUFBQSxHQUFlLEtBRmYsQ0FBQTs7aUJBQUE7O0tBRGtCLEtBcldwQixDQUFBOztBQUFBLEVBMFdNO0FBQ0osa0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsV0FBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSLENBQUEsQ0FBQTs7QUFBQSwwQkFDQSxJQUFBLEdBQU0sQ0FBQyxHQUFELEVBQU0sR0FBTixDQUROLENBQUE7O3VCQUFBOztLQUR3QixNQTFXMUIsQ0FBQTs7QUFBQSxFQThXTTtBQUNKLG1DQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFlBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOzt3QkFBQTs7S0FEeUIsWUE5VzNCLENBQUE7O0FBQUEsRUFpWE07QUFDSix1Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxnQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7OzRCQUFBOztLQUQ2QixZQWpYL0IsQ0FBQTs7QUFBQSxFQXFYTTtBQUNKLGtDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFdBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQUEsMEJBQ0EsSUFBQSxHQUFNLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FETixDQUFBOzt1QkFBQTs7S0FEd0IsTUFyWDFCLENBQUE7O0FBQUEsRUF5WE07QUFDSixtQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxZQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7d0JBQUE7O0tBRHlCLFlBelgzQixDQUFBOztBQUFBLEVBNFhNO0FBQ0osdUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsZ0JBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOzs0QkFBQTs7S0FENkIsWUE1WC9CLENBQUE7O0FBQUEsRUFnWU07QUFDSiwrQkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxRQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUFBLHVCQUNBLElBQUEsR0FBTSxDQUFDLEdBQUQsRUFBTSxHQUFOLENBRE4sQ0FBQTs7b0JBQUE7O0tBRHFCLE1BaFl2QixDQUFBOztBQUFBLEVBb1lNO0FBQ0osZ0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsU0FBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O3FCQUFBOztLQURzQixTQXBZeEIsQ0FBQTs7QUFBQSxFQXVZTTtBQUNKLG9DQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGFBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOzt5QkFBQTs7S0FEMEIsU0F2WTVCLENBQUE7O0FBQUEsRUE0WU07QUFDSixtQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxZQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUFBLDJCQUNBLElBQUEsR0FBTSxDQUFDLEdBQUQsRUFBTSxHQUFOLENBRE4sQ0FBQTs7QUFBQSwyQkFFQSxhQUFBLEdBQWUsSUFGZixDQUFBOzt3QkFBQTs7S0FEeUIsS0E1WTNCLENBQUE7O0FBQUEsRUFpWk07QUFDSixvQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxhQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7eUJBQUE7O0tBRDBCLGFBalo1QixDQUFBOztBQUFBLEVBb1pNO0FBQ0osd0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsaUJBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOzs2QkFBQTs7S0FEOEIsYUFwWmhDLENBQUE7O0FBQUEsRUF1Wk07QUFDSixtREFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSw0QkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsMkNBQ0EsZUFBQSxHQUFpQixJQURqQixDQUFBOzt3Q0FBQTs7S0FEeUMsYUF2WjNDLENBQUE7O0FBQUEsRUEyWk07QUFDSix1REFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxnQ0FBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsK0NBQ0EsZUFBQSxHQUFpQixJQURqQixDQUFBOzs0Q0FBQTs7S0FENkMsYUEzWi9DLENBQUE7O0FBQUEsRUFnYU07QUFDSixvQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxhQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUFBLDRCQUNBLElBQUEsR0FBTSxDQUFDLEdBQUQsRUFBTSxHQUFOLENBRE4sQ0FBQTs7QUFBQSw0QkFFQSxhQUFBLEdBQWUsSUFGZixDQUFBOzt5QkFBQTs7S0FEMEIsS0FoYTVCLENBQUE7O0FBQUEsRUFxYU07QUFDSixxQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxjQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7MEJBQUE7O0tBRDJCLGNBcmE3QixDQUFBOztBQUFBLEVBd2FNO0FBQ0oseUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsa0JBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOzs4QkFBQTs7S0FEK0IsY0F4YWpDLENBQUE7O0FBQUEsRUEyYU07QUFDSixvREFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSw2QkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsNENBQ0EsZUFBQSxHQUFpQixJQURqQixDQUFBOzt5Q0FBQTs7S0FEMEMsY0EzYTVDLENBQUE7O0FBQUEsRUErYU07QUFDSix3REFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxpQ0FBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsZ0RBQ0EsZUFBQSxHQUFpQixJQURqQixDQUFBOzs2Q0FBQTs7S0FEOEMsY0EvYWhELENBQUE7O0FBQUEsRUFvYk07QUFDSixrQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxXQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUFBLDBCQUNBLElBQUEsR0FBTSxDQUFDLEdBQUQsRUFBTSxHQUFOLENBRE4sQ0FBQTs7QUFBQSwwQkFFQSxhQUFBLEdBQWUsSUFGZixDQUFBOzt1QkFBQTs7S0FEd0IsS0FwYjFCLENBQUE7O0FBQUEsRUF5Yk07QUFDSixtQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxZQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7d0JBQUE7O0tBRHlCLFlBemIzQixDQUFBOztBQUFBLEVBNGJNO0FBQ0osdUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsZ0JBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOzs0QkFBQTs7S0FENkIsWUE1Yi9CLENBQUE7O0FBQUEsRUErYk07QUFDSixrREFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSwyQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsMENBQ0EsZUFBQSxHQUFpQixJQURqQixDQUFBOzt1Q0FBQTs7S0FEd0MsWUEvYjFDLENBQUE7O0FBQUEsRUFtY007QUFDSixzREFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSwrQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsOENBQ0EsZUFBQSxHQUFpQixJQURqQixDQUFBOzsyQ0FBQTs7S0FENEMsWUFuYzlDLENBQUE7O0FBQUEsRUF3Y007QUFDSixtQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxZQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUFBLDJCQUNBLElBQUEsR0FBTSxDQUFDLEdBQUQsRUFBTSxHQUFOLENBRE4sQ0FBQTs7d0JBQUE7O0tBRHlCLEtBeGMzQixDQUFBOztBQUFBLEVBNGNNO0FBQ0osb0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsYUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O3lCQUFBOztLQUQwQixhQTVjNUIsQ0FBQTs7QUFBQSxFQStjTTtBQUNKLHdDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGlCQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7NkJBQUE7O0tBRDhCLGFBL2NoQyxDQUFBOztBQUFBLEVBa2RNO0FBQ0osbURBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsNEJBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLDJDQUNBLGVBQUEsR0FBaUIsSUFEakIsQ0FBQTs7d0NBQUE7O0tBRHlDLGFBbGQzQyxDQUFBOztBQUFBLEVBc2RNO0FBQ0osdURBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsZ0NBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLCtDQUNBLGVBQUEsR0FBaUIsSUFEakIsQ0FBQTs7NENBQUE7O0tBRDZDLGFBdGQvQyxDQUFBOztBQUFBLEVBMmRBLFVBQUEsR0FBYSwwQkEzZGIsQ0FBQTs7QUFBQSxFQTRkTTtBQUNKLDBCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLEdBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQUEsa0JBQ0EsYUFBQSxHQUFlLElBRGYsQ0FBQTs7QUFBQSxrQkFFQSxlQUFBLEdBQWlCLElBRmpCLENBQUE7O0FBQUEsa0JBR0EsZ0JBQUEsR0FBa0IsS0FIbEIsQ0FBQTs7QUFBQSxrQkFJQSxVQUFBLEdBQVksU0FBQSxHQUFBO2FBQ1YsV0FEVTtJQUFBLENBSlosQ0FBQTs7QUFBQSxrQkFPQSxZQUFBLEdBQWMsU0FBQyxJQUFELEdBQUE7QUFDWixVQUFBLG9DQUFBO0FBQUEsTUFEYyxhQUFBLE9BQU8saUJBQUEsU0FDckIsQ0FBQTtBQUFBLE1BQUMsYUFBRCxFQUFLLGFBQUwsRUFBUyxnQkFBVCxFQUFnQixrQkFBaEIsQ0FBQTtBQUNBLE1BQUEsSUFBRyxLQUFBLEtBQVMsRUFBWjtlQUNFLENBQUMsTUFBRCxFQUFTLE9BQVQsRUFERjtPQUFBLE1BQUE7ZUFHRSxDQUFDLE9BQUQsRUFBVSxPQUFWLEVBSEY7T0FGWTtJQUFBLENBUGQsQ0FBQTs7QUFBQSxrQkFjQSxnQkFBQSxHQUFrQixTQUFDLElBQUQsR0FBQTtBQUNoQixVQUFBLDBCQUFBO0FBQUEsTUFBQSxRQUFBLEdBQVcsSUFBWCxDQUFBO0FBQUEsTUFDQSxTQUFBLEdBQVksSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFnQyxJQUFJLENBQUMsR0FBckMsQ0FEWixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsTUFBTSxDQUFDLGlCQUFSLENBQTBCLFVBQTFCLEVBQXNDLFNBQXRDLEVBQWlELFNBQUMsSUFBRCxHQUFBO0FBQy9DLFlBQUEsV0FBQTtBQUFBLFFBRGlELGFBQUEsT0FBTyxZQUFBLElBQ3hELENBQUE7QUFBQSxRQUFBLElBQUcsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsSUFBcEIsRUFBMEIsSUFBMUIsQ0FBSDtBQUNFLFVBQUEsUUFBQSxHQUFXLEtBQVgsQ0FBQTtpQkFDQSxJQUFBLENBQUEsRUFGRjtTQUQrQztNQUFBLENBQWpELENBRkEsQ0FBQTtvRkFNa0IsS0FQRjtJQUFBLENBZGxCLENBQUE7O0FBQUEsa0JBdUJBLFlBQUEsR0FBYyxTQUFDLEtBQUQsRUFBUSxRQUFSLEdBQUE7QUFDWixVQUFBLG1CQUFBO0FBQUEsTUFBQSxJQUFlLEtBQUssQ0FBQyxNQUFOLEtBQWdCLENBQS9CO0FBQUEsZUFBTyxJQUFQLENBQUE7T0FBQTtBQUNBLFdBQVMsK0ZBQVQsR0FBQTtBQUNFLFFBQUEsS0FBQSxHQUFRLEtBQU0sQ0FBQSxDQUFBLENBQWQsQ0FBQTtBQUNBLFFBQUEsSUFBRyxLQUFLLENBQUMsUUFBTixLQUFrQixRQUFyQjtBQUNFLGlCQUFPLEtBQVAsQ0FERjtTQUZGO0FBQUEsT0FEQTthQUtBLEtBTlk7SUFBQSxDQXZCZCxDQUFBOztBQUFBLGtCQStCQSxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQVEsT0FBUixHQUFBO0FBQ1IsVUFBQSxpQ0FBQTtBQUFBLE1BQUEsUUFBQSxHQUFXLDRCQUFYLENBQUE7QUFBQSxNQUNBLFNBQUEsR0FBZ0IsSUFBQSxLQUFBLENBQU0sQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFOLEVBQWMsSUFBZCxDQURoQixDQUFBO0FBQUEsTUFFQSxLQUFBLEdBQVEsRUFGUixDQUFBO0FBQUEsTUFHQSxLQUFBLEdBQVEsSUFIUixDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsUUFBRCxDQUFVLE1BQVYsRUFBa0I7QUFBQSxRQUFDLE1BQUEsSUFBRDtBQUFBLFFBQU8sU0FBQSxPQUFQO0FBQUEsUUFBZ0IsVUFBQSxRQUFoQjtBQUFBLFFBQTBCLFdBQUEsU0FBMUI7T0FBbEIsRUFBd0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsS0FBRCxHQUFBO0FBQ3RELGNBQUEsdURBQUE7QUFBQSxVQUFDLGNBQUEsS0FBRCxFQUFRLGFBQUEsSUFBUixDQUFBO0FBQUEsVUFDQSxRQUF1QixLQUFDLENBQUEsWUFBRCxDQUFjLEtBQWQsQ0FBdkIsRUFBQyxvQkFBRCxFQUFZLGtCQURaLENBQUE7QUFFQSxVQUFBLElBQUcsU0FBQSxLQUFhLE9BQWhCO0FBQ0UsWUFBQSxRQUFBLEdBQVcsU0FBQSxHQUFZLE9BQXZCLENBQUE7QUFBQSxZQUNBLEtBQUssQ0FBQyxJQUFOLENBQVc7QUFBQSxjQUFDLFVBQUEsUUFBRDtBQUFBLGNBQVcsT0FBQSxLQUFYO2FBQVgsQ0FEQSxDQURGO1dBQUEsTUFBQTtBQUlFLFlBQUEsSUFBRyxLQUFBLEdBQVEsS0FBQyxDQUFBLFlBQUQsQ0FBYyxLQUFkLEVBQXNCLE9BQUEsR0FBTyxPQUE3QixDQUFYO0FBQ0UsY0FBQSxLQUFBLEdBQVEsS0FBTSwrQkFBZCxDQURGO2FBQUE7QUFFQSxZQUFBLElBQUcsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsQ0FBbkI7QUFDRSxjQUFBLEtBQUEsR0FBUSxLQUFSLENBREY7YUFORjtXQUZBO0FBVUEsVUFBQSxJQUFVLGFBQVY7bUJBQUEsSUFBQSxDQUFBLEVBQUE7V0FYc0Q7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4RCxDQUpBLENBQUE7YUFnQkEsTUFqQlE7SUFBQSxDQS9CVixDQUFBOztBQUFBLGtCQWtEQSxTQUFBLEdBQVcsU0FBQyxJQUFELEVBQVEsT0FBUixHQUFBO0FBQ1QsVUFBQSxpQ0FBQTtBQUFBLE1BQUEsUUFBQSxHQUFXLG1CQUFYLENBQUE7QUFBQSxNQUNBLElBQUEsR0FBTyxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsSUFBbEIsQ0FEUCxDQUFBO0FBQUEsTUFFQSxTQUFBLEdBQWdCLElBQUEsS0FBQSxDQUFNLElBQU4sRUFBWSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFmLENBQUEsQ0FBWixDQUZoQixDQUFBO0FBQUEsTUFHQSxLQUFBLEdBQVEsRUFIUixDQUFBO0FBQUEsTUFJQSxLQUFBLEdBQVEsSUFKUixDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUI7QUFBQSxRQUFDLE1BQUEsSUFBRDtBQUFBLFFBQU8sU0FBQSxPQUFQO0FBQUEsUUFBZ0IsVUFBQSxRQUFoQjtBQUFBLFFBQTBCLFdBQUEsU0FBMUI7T0FBbkIsRUFBeUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsS0FBRCxHQUFBO0FBQ3ZELGNBQUEsa0VBQUE7QUFBQSxVQUFDLGNBQUEsS0FBRCxFQUFRLGFBQUEsSUFBUixDQUFBO0FBQUEsVUFDQSxRQUF1QixLQUFDLENBQUEsWUFBRCxDQUFjLEtBQWQsQ0FBdkIsRUFBQyxvQkFBRCxFQUFZLGtCQURaLENBQUE7QUFFQSxVQUFBLElBQUcsU0FBQSxLQUFhLE1BQWhCO0FBQ0UsWUFBQSxRQUFBLEdBQVcsU0FBQSxHQUFZLE9BQXZCLENBQUE7QUFBQSxZQUNBLEtBQUssQ0FBQyxJQUFOLENBQVc7QUFBQSxjQUFDLFVBQUEsUUFBRDtBQUFBLGNBQVcsT0FBQSxLQUFYO2FBQVgsQ0FEQSxDQURGO1dBQUEsTUFBQTtBQUlFLFlBQUEsSUFBRyxLQUFBLEdBQVEsS0FBQyxDQUFBLFlBQUQsQ0FBYyxLQUFkLEVBQXNCLE1BQUEsR0FBTSxPQUE1QixDQUFYO0FBQ0UsY0FBQSxLQUFBLEdBQVEsS0FBTSwrQkFBZCxDQURGO2FBQUEsTUFBQTtBQUlFLGNBQUEsS0FBQSxHQUFRLEVBQVIsQ0FKRjthQUFBO0FBS0EsWUFBQSxJQUFHLEtBQUssQ0FBQyxNQUFOLEtBQWdCLENBQW5CO0FBQ0UsY0FBQSxJQUFHLENBQUMsU0FBQSxtQkFBWSxLQUFLLENBQUUsS0FBSyxDQUFDLGNBQTFCLENBQUg7QUFDRSxnQkFBQSxJQUFHLEtBQUMsQ0FBQSxlQUFKO0FBQ0Usa0JBQUEsSUFBVSxTQUFTLENBQUMsR0FBVixHQUFnQixJQUFJLENBQUMsR0FBL0I7QUFBQSwwQkFBQSxDQUFBO21CQURGO2lCQUFBLE1BQUE7QUFHRSxrQkFBQSxJQUFVLFNBQVMsQ0FBQyxhQUFWLENBQXdCLElBQXhCLENBQVY7QUFBQSwwQkFBQSxDQUFBO21CQUhGO2lCQURGO2VBQUE7QUFBQSxjQUtBLEtBQUEsR0FBUSxLQUxSLENBREY7YUFURjtXQUZBO0FBa0JBLFVBQUEsSUFBVSxhQUFWO21CQUFBLElBQUEsQ0FBQSxFQUFBO1dBbkJ1RDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpELENBTEEsQ0FBQTthQXlCQSxNQTFCUztJQUFBLENBbERYLENBQUE7O2VBQUE7O0tBRGdCLEtBNWRsQixDQUFBOztBQUFBLEVBMmlCTTtBQUNKLDJCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztnQkFBQTs7S0FEaUIsSUEzaUJuQixDQUFBOztBQUFBLEVBOGlCTTtBQUNKLCtCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFFBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztvQkFBQTs7S0FEcUIsSUE5aUJ2QixDQUFBOztBQUFBLEVBb2pCTTtBQUNKLGdDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFNBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQUEsd0JBRUEsT0FBQSxHQUFTLFNBQUMsT0FBRCxFQUFVLFNBQVYsRUFBcUIsRUFBckIsR0FBQTtBQUNQLFVBQUEsOEJBQUE7O1FBQUEsRUFBRSxDQUFDO09BQUg7QUFBQSxNQUNBLFFBQUEsR0FBVyxPQURYLENBQUE7QUFFQTs7OztBQUFBLFdBQUEsNENBQUE7d0JBQUE7QUFDRSxRQUFBLElBQUEsQ0FBQSxFQUFhLENBQUcsR0FBSCxFQUFRLFNBQVIsQ0FBYjtBQUFBLGdCQUFBO1NBQUE7QUFBQSxRQUNBLFFBQUEsR0FBVyxHQURYLENBREY7QUFBQSxPQUZBO2FBTUEsU0FQTztJQUFBLENBRlQsQ0FBQTs7QUFBQSx3QkFXQSxjQUFBLEdBQWdCLFNBQUMsT0FBRCxFQUFVLEVBQVYsR0FBQTtBQUNkLFVBQUEsZ0JBQUE7QUFBQSxNQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsT0FBRCxDQUFTLE9BQVQsRUFBa0IsVUFBbEIsRUFBOEIsRUFBOUIsQ0FBWCxDQUFBO0FBQUEsTUFDQSxNQUFBLEdBQVMsSUFBQyxDQUFBLE9BQUQsQ0FBUyxPQUFULEVBQWtCLE1BQWxCLEVBQTBCLEVBQTFCLENBRFQsQ0FBQTthQUVBLENBQUMsUUFBRCxFQUFXLE1BQVgsRUFIYztJQUFBLENBWGhCLENBQUE7O0FBQUEsd0JBZ0JBLGtCQUFBLEdBQW9CLFNBQUMsT0FBRCxFQUFVLFNBQVYsR0FBQTtBQUNsQixVQUFBLCtDQUFBO0FBQUEsTUFBQSxhQUFBLEdBQWdCLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBeUIsT0FBekIsQ0FBaEIsQ0FBQTtBQUVBLE1BQUEsSUFBRyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQUg7QUFDRSxRQUFBLE9BQUEsR0FBVSxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUMsR0FBRCxFQUFNLFNBQU4sR0FBQTttQkFDUixLQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQXlCLEdBQXpCLENBQUEsS0FBaUMsY0FEekI7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFWLENBREY7T0FBQSxNQUFBO0FBSUUsUUFBQSxJQUFHLFNBQVMsQ0FBQyxVQUFWLENBQUEsQ0FBSDtBQUNFLFVBQUEsaUJBQUEsR0FBb0IsVUFBcEIsQ0FERjtTQUFBLE1BQUE7QUFHRSxVQUFBLGlCQUFBLEdBQW9CLE1BQXBCLENBSEY7U0FBQTtBQUFBLFFBS0EsSUFBQSxHQUFPLEtBTFAsQ0FBQTtBQUFBLFFBTUEsT0FBQSxHQUFVLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQyxHQUFELEVBQU0sU0FBTixHQUFBO0FBQ1IsZ0JBQUEsTUFBQTtBQUFBLFlBQUEsTUFBQSxHQUFTLEtBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBeUIsR0FBekIsQ0FBQSxLQUFpQyxhQUExQyxDQUFBO0FBQ0EsWUFBQSxJQUFHLElBQUg7cUJBQ0UsQ0FBQSxPQURGO2FBQUEsTUFBQTtBQUdFLGNBQUEsSUFBRyxDQUFDLENBQUEsTUFBRCxDQUFBLElBQWlCLENBQUMsU0FBQSxLQUFhLGlCQUFkLENBQXBCO0FBQ0UsZ0JBQUEsSUFBQSxHQUFPLElBQVAsQ0FBQTtBQUNBLHVCQUFPLElBQVAsQ0FGRjtlQUFBO3FCQUdBLE9BTkY7YUFGUTtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBTlYsQ0FBQTtBQUFBLFFBZ0JBLE9BQU8sQ0FBQyxLQUFSLEdBQWdCLFNBQUEsR0FBQTtpQkFDZCxJQUFBLEdBQU8sTUFETztRQUFBLENBaEJoQixDQUpGO09BRkE7YUF3QkEsUUF6QmtCO0lBQUEsQ0FoQnBCLENBQUE7O0FBQUEsd0JBMkNBLFFBQUEsR0FBVSxTQUFDLFNBQUQsR0FBQTtBQUNSLFVBQUEsaUJBQUE7QUFBQSxNQUFBLE9BQUEsR0FBVSxJQUFDLENBQUEsK0JBQUQsQ0FBaUMsU0FBakMsQ0FBMkMsQ0FBQyxHQUF0RCxDQUFBO0FBRUEsTUFBQSxJQUFHLElBQUMsQ0FBQSxNQUFELENBQVEsUUFBUixFQUFrQixVQUFsQixDQUFIO0FBQ0UsUUFBQSxJQUFHLFNBQVMsQ0FBQyxVQUFWLENBQUEsQ0FBSDtBQUNFLFVBQUEsT0FBQSxFQUFBLENBREY7U0FBQSxNQUFBO0FBR0UsVUFBQSxPQUFBLEVBQUEsQ0FIRjtTQUFBO0FBQUEsUUFJQSxPQUFBLEdBQVUsb0JBQUEsQ0FBcUIsSUFBQyxDQUFBLE1BQXRCLEVBQThCLE9BQTlCLENBSlYsQ0FERjtPQUZBO0FBQUEsTUFTQSxRQUFBLEdBQVcsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsT0FBaEIsRUFBeUIsSUFBQyxDQUFBLGtCQUFELENBQW9CLE9BQXBCLEVBQTZCLFNBQTdCLENBQXpCLENBVFgsQ0FBQTthQVVBLFNBQVMsQ0FBQyxjQUFWLENBQUEsQ0FBMEIsQ0FBQyxLQUEzQixDQUFpQyx5QkFBQSxDQUEwQixJQUFDLENBQUEsTUFBM0IsRUFBbUMsUUFBbkMsQ0FBakMsRUFYUTtJQUFBLENBM0NWLENBQUE7O3FCQUFBOztLQURzQixXQXBqQnhCLENBQUE7O0FBQUEsRUE2bUJNO0FBQ0osaUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsVUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O3NCQUFBOztLQUR1QixVQTdtQnpCLENBQUE7O0FBQUEsRUFnbkJNO0FBQ0oscUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsY0FBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7OzBCQUFBOztLQUQyQixVQWhuQjdCLENBQUE7O0FBQUEsRUFvbkJNO0FBQ0osa0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsV0FBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSLENBQUEsQ0FBQTs7QUFBQSwwQkFFQSxRQUFBLEdBQVUsU0FBQyxTQUFELEdBQUE7QUFDUixVQUFBLDJDQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLCtCQUFELENBQWlDLFNBQWpDLENBQTJDLENBQUMsR0FBdEQsQ0FBQTtBQUFBLE1BRUEsZUFBQSxHQUFrQiwwQkFBQSxDQUEyQixJQUFDLENBQUEsTUFBNUIsRUFBb0MsT0FBcEMsQ0FGbEIsQ0FBQTtBQUFBLE1BR0EsT0FBQSxHQUFVLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLEdBQUQsR0FBQTtBQUNSLFVBQUEsSUFBRyxLQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQXlCLEdBQXpCLENBQUg7bUJBQ0UsS0FBQyxDQUFBLEdBQUQsQ0FBQSxFQURGO1dBQUEsTUFBQTttQkFHRSwwQkFBQSxDQUEyQixLQUFDLENBQUEsTUFBNUIsRUFBb0MsR0FBcEMsQ0FBQSxJQUE0QyxnQkFIOUM7V0FEUTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSFYsQ0FBQTtBQUFBLE1BU0EsUUFBQSxHQUFXLElBQUMsQ0FBQSxjQUFELENBQWdCLE9BQWhCLEVBQXlCLE9BQXpCLENBVFgsQ0FBQTthQVVBLHlCQUFBLENBQTBCLElBQUMsQ0FBQSxNQUEzQixFQUFtQyxRQUFuQyxFQVhRO0lBQUEsQ0FGVixDQUFBOzt1QkFBQTs7S0FEd0IsVUFwbkIxQixDQUFBOztBQUFBLEVBb29CTTtBQUNKLG1DQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFlBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOzt3QkFBQTs7S0FEeUIsWUFwb0IzQixDQUFBOztBQUFBLEVBdW9CTTtBQUNKLHVDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGdCQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7NEJBQUE7O0tBRDZCLFlBdm9CL0IsQ0FBQTs7QUFBQSxFQTJvQk07QUFDSiw4QkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxPQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUFBLHNCQUVBLFFBQUEsR0FBVSxTQUFDLFNBQUQsR0FBQTtBQUNSLFVBQUEsYUFBQTtBQUFBLE1BQUEsR0FBQSxHQUFNLFNBQVMsQ0FBQyxjQUFWLENBQUEsQ0FBMEIsQ0FBQyxLQUFLLENBQUMsR0FBdkMsQ0FBQTtBQUFBLE1BQ0EsUUFBQSxHQUFXLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBWSxDQUFDLDZCQUFyQixDQUFtRCxHQUFuRCxDQURYLENBQUE7QUFFQSxNQUFBLElBQTBCLElBQUMsQ0FBQSxNQUFNLENBQUMsb0JBQVIsQ0FBNkIsR0FBN0IsQ0FBMUI7O1VBQUEsV0FBWSxDQUFDLEdBQUQsRUFBTSxHQUFOO1NBQVo7T0FGQTtBQUlBLE1BQUEsSUFBRyxRQUFIO2VBQ0UseUJBQUEsQ0FBMEIsU0FBUyxDQUFDLE1BQXBDLEVBQTRDLFFBQTVDLEVBREY7T0FMUTtJQUFBLENBRlYsQ0FBQTs7bUJBQUE7O0tBRG9CLFdBM29CdEIsQ0FBQTs7QUFBQSxFQXNwQk07QUFDSiwrQkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxRQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7b0JBQUE7O0tBRHFCLFFBdHBCdkIsQ0FBQTs7QUFBQSxFQXlwQk07QUFDSixtQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxZQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7d0JBQUE7O0tBRHlCLFFBenBCM0IsQ0FBQTs7QUFBQSxFQTZwQk07QUFDSiwyQkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxJQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUFBLG1CQUVBLGNBQUEsR0FBZ0IsU0FBQyxJQUFELEdBQUE7QUFDZCxVQUFBLHdEQUFBO0FBQUEsTUFEZ0Isb0JBQVUsZ0JBQzFCLENBQUE7QUFBQSxNQUFBLElBQUEsQ0FBQSxJQUFrQyxDQUFBLE9BQUQsQ0FBQSxDQUFqQztBQUFBLGVBQU8sQ0FBQyxRQUFELEVBQVcsTUFBWCxDQUFQLENBQUE7T0FBQTtBQUFBLE1BQ0EsbUJBQUEsR0FBc0IsMEJBQUEsQ0FBMkIsSUFBQyxDQUFBLE1BQTVCLEVBQW9DLFFBQXBDLENBRHRCLENBQUE7QUFBQSxNQUVBLGlCQUFBLEdBQW9CLDBCQUFBLENBQTJCLElBQUMsQ0FBQSxNQUE1QixFQUFvQyxNQUFwQyxDQUZwQixDQUFBO0FBR0EsTUFBQSxJQUFnQixtQkFBQSxLQUF1QixpQkFBdkM7QUFBQSxRQUFBLE1BQUEsSUFBVSxDQUFWLENBQUE7T0FIQTtBQUFBLE1BSUEsUUFBQSxJQUFZLENBSlosQ0FBQTthQUtBLENBQUMsUUFBRCxFQUFXLE1BQVgsRUFOYztJQUFBLENBRmhCLENBQUE7O0FBQUEsbUJBVUEsOEJBQUEsR0FBZ0MsU0FBQyxHQUFELEdBQUE7QUFDOUIsVUFBQSxLQUFBOzs7eUJBQXlFLENBQUUsT0FBM0UsQ0FBQSxXQUQ4QjtJQUFBLENBVmhDLENBQUE7O0FBQUEsbUJBYUEsUUFBQSxHQUFVLFNBQUMsU0FBRCxHQUFBO0FBQ1IsVUFBQSx1Q0FBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLFNBQVMsQ0FBQyxjQUFWLENBQUEsQ0FBUixDQUFBO0FBQUEsTUFDQSxTQUFBLEdBQVksSUFBQyxDQUFBLDhCQUFELENBQWdDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBNUMsQ0FEWixDQUFBO0FBRUEsTUFBQSxJQUFBLENBQUEsU0FBdUIsQ0FBQyxNQUF4QjtBQUFBLGNBQUEsQ0FBQTtPQUZBO0FBSUEsTUFBQSxJQUFHLHNDQUFIO0FBQ0UsUUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsUUFBaEIsQ0FBWCxDQUFBO0FBQUEsUUFDQSxXQUFBLEdBQWMseUJBQUEsQ0FBMEIsSUFBQyxDQUFBLE1BQTNCLEVBQW1DLFFBQW5DLENBRGQsQ0FBQTtBQUVBLFFBQUEsSUFBRyxXQUFXLENBQUMsT0FBWixDQUFvQixLQUFwQixDQUFBLElBQStCLFNBQVMsQ0FBQyxNQUE1QztBQUNFLFVBQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxjQUFELENBQWdCLFNBQVMsQ0FBQyxLQUFWLENBQUEsQ0FBaEIsQ0FBWCxDQURGO1NBSEY7T0FKQTthQVVBLHlCQUFBLENBQTBCLElBQUMsQ0FBQSxNQUEzQixFQUFtQyxRQUFuQyxFQVhRO0lBQUEsQ0FiVixDQUFBOztnQkFBQTs7S0FEaUIsV0E3cEJuQixDQUFBOztBQUFBLEVBd3JCTTtBQUNKLDRCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLEtBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztpQkFBQTs7S0FEa0IsS0F4ckJwQixDQUFBOztBQUFBLEVBMnJCTTtBQUNKLGdDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFNBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztxQkFBQTs7S0FEc0IsS0EzckJ4QixDQUFBOztBQUFBLEVBZ3NCTTtBQUNKLCtCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFFBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQUEsdUJBR0EsNEJBQUEsR0FBOEIsQ0FBQyxJQUFELENBSDlCLENBQUE7O0FBQUEsdUJBS0EsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLE1BQUEsMENBQUEsU0FBQSxDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFBLENBQW9CLENBQUMsU0FBUyxDQUFDLE9BQS9CLENBQXVDLFdBQXZDLEVBQW9ELEVBQXBELEVBRkY7SUFBQSxDQUxaLENBQUE7O0FBQUEsdUJBU0EsOEJBQUEsR0FBZ0MsU0FBQyxHQUFELEdBQUE7QUFDOUIsVUFBQSxnQkFBQTtBQUFBLE1BQUEsU0FBQSxrRkFBNkQsQ0FBRSxPQUFuRCxDQUFBLFVBQVosQ0FBQTtpQ0FDQSxTQUFTLENBQUUsTUFBWCxDQUFrQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxRQUFELEdBQUE7aUJBQ2hCLDRCQUFBLENBQTZCLEtBQUMsQ0FBQSxNQUE5QixFQUFzQyxRQUFTLENBQUEsQ0FBQSxDQUEvQyxFQURnQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxCLFdBRjhCO0lBQUEsQ0FUaEMsQ0FBQTs7QUFBQSx1QkFjQSxjQUFBLEdBQWdCLFNBQUMsUUFBRCxHQUFBO0FBQ2QsVUFBQSw4QkFBQTtBQUFBLE1BQUEsUUFBcUIsOENBQUEsU0FBQSxDQUFyQixFQUFDLG1CQUFELEVBQVcsaUJBQVgsQ0FBQTtBQUNBLE1BQUEsSUFBRyxJQUFDLENBQUEsR0FBRCxDQUFBLENBQUEsSUFBVyxTQUFDLElBQUMsQ0FBQSxRQUFELEVBQUEsZUFBYSxJQUFDLENBQUEsNEJBQWQsRUFBQSxLQUFBLE1BQUQsQ0FBZDtBQUNFLFFBQUEsTUFBQSxJQUFVLENBQVYsQ0FERjtPQURBO2FBR0EsQ0FBQyxRQUFELEVBQVcsTUFBWCxFQUpjO0lBQUEsQ0FkaEIsQ0FBQTs7b0JBQUE7O0tBRHFCLEtBaHNCdkIsQ0FBQTs7QUFBQSxFQXF0Qk07QUFDSixnQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxTQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7cUJBQUE7O0tBRHNCLFNBcnRCeEIsQ0FBQTs7QUFBQSxFQXd0Qk07QUFDSixvQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxhQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7eUJBQUE7O0tBRDBCLFNBeHRCNUIsQ0FBQTs7QUFBQSxFQTR0Qk07QUFDSixrQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxXQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUFBLDBCQUNBLFFBQUEsR0FBVSxTQUFDLFNBQUQsR0FBQTtBQUNSLFVBQUEsVUFBQTtBQUFBLE1BQUEsR0FBQSxHQUFNLElBQUMsQ0FBQSwrQkFBRCxDQUFpQyxTQUFqQyxDQUEyQyxDQUFDLEdBQWxELENBQUE7QUFBQSxNQUNBLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQWdDLEdBQWhDLENBRFIsQ0FBQTtBQUVBLE1BQUEsSUFBRyxJQUFDLENBQUEsR0FBRCxDQUFBLENBQUg7ZUFDRSxNQURGO09BQUEsTUFBQTtlQUdFLFNBQUEsQ0FBVSxJQUFDLENBQUEsTUFBWCxFQUFtQixLQUFuQixFQUhGO09BSFE7SUFBQSxDQURWLENBQUE7O3VCQUFBOztLQUR3QixXQTV0QjFCLENBQUE7O0FBQUEsRUFzdUJNO0FBQ0osbUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsWUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O3dCQUFBOztLQUR5QixZQXR1QjNCLENBQUE7O0FBQUEsRUF5dUJNO0FBQ0osdUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsZ0JBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOzs0QkFBQTs7S0FENkIsWUF6dUIvQixDQUFBOztBQUFBLEVBNnVCTTtBQUNKLDZCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLE1BQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQUEscUJBQ0EsUUFBQSxHQUFVLFNBQUMsU0FBRCxHQUFBO0FBQ1IsTUFBQSxJQUFDLENBQUEsYUFBRCxDQUFBLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQWYsQ0FBQSxFQUZRO0lBQUEsQ0FEVixDQUFBOztrQkFBQTs7S0FEbUIsV0E3dUJyQixDQUFBOztBQUFBLEVBbXZCTTtBQUNKLDhCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLE9BQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOzttQkFBQTs7S0FEb0IsT0FudkJ0QixDQUFBOztBQUFBLEVBc3ZCTTtBQUNKLGtDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFdBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOzt1QkFBQTs7S0FEd0IsT0F0dkIxQixDQUFBOztBQUFBLEVBMHZCTTtBQUNKLDBCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLEdBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O2VBQUE7O0tBRGdCLE9BMXZCbEIsQ0FBQTs7QUFBQSxFQTh2Qk07QUFDSiw0QkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxLQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztpQkFBQTs7S0FEa0IsV0E5dkJwQixDQUFBOztBQUFBLEVBa3dCTTtBQUNKLG1DQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFlBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQUEsMkJBQ0EsUUFBQSxHQUFVLFNBQUEsR0FBQTtBQUNSLE1BQUEsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFmLENBQXdCLEdBQXhCLEVBQTZCLEdBQTdCLEVBRlE7SUFBQSxDQURWLENBQUE7O3dCQUFBOztLQUR5QixXQWx3QjNCLENBQUE7O0FBQUEsRUF3d0JNO0FBQ0osb0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsYUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O3lCQUFBOztLQUQwQixhQXh3QjVCLENBQUE7O0FBQUEsRUE0d0JNO0FBQ0osd0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsaUJBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOzs2QkFBQTs7S0FEOEIsYUE1d0JoQyxDQUFBOztBQUFBLEVBZ3hCTTtBQUNKLHlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGtCQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxpQ0FDQSxRQUFBLEdBQVUsS0FEVixDQUFBOztBQUFBLGlDQUdBLFNBQUEsR0FBVyxTQUFDLFNBQUQsRUFBWSxPQUFaLEdBQUE7QUFDVCxVQUFBLGdCQUFBO0FBQUEsTUFBQSxJQUFvRSxJQUFDLENBQUEsTUFBRCxDQUFRLFFBQVIsQ0FBcEU7QUFBQSxRQUFBLFNBQUEsR0FBWSxxQkFBQSxDQUFzQixJQUFDLENBQUEsTUFBdkIsRUFBK0IsU0FBL0IsRUFBMEMsU0FBMUMsQ0FBWixDQUFBO09BQUE7QUFBQSxNQUNBLFNBQUEsR0FBWSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQVgsRUFBZ0IsQ0FBaEIsQ0FBRCxFQUFxQixJQUFDLENBQUEsdUJBQUQsQ0FBQSxDQUFyQixDQURaLENBQUE7QUFBQSxNQUVBLEtBQUEsR0FBUSxJQUZSLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxNQUFNLENBQUMsaUJBQVIsQ0FBMEIsT0FBMUIsRUFBbUMsU0FBbkMsRUFBOEMsU0FBQyxJQUFELEdBQUE7QUFDNUMsWUFBQSxXQUFBO0FBQUEsUUFEOEMsYUFBQSxPQUFPLFlBQUEsSUFDckQsQ0FBQTtBQUFBLFFBQUEsSUFBRyxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQVYsQ0FBd0IsU0FBeEIsQ0FBSDtBQUNFLFVBQUEsS0FBQSxHQUFRLEtBQVIsQ0FBQTtpQkFDQSxJQUFBLENBQUEsRUFGRjtTQUQ0QztNQUFBLENBQTlDLENBSEEsQ0FBQTthQU9BO0FBQUEsUUFBQyxLQUFBLEVBQU8sS0FBUjtBQUFBLFFBQWUsV0FBQSxFQUFhLEtBQTVCO1FBUlM7SUFBQSxDQUhYLENBQUE7O0FBQUEsaUNBYUEsUUFBQSxHQUFVLFNBQUMsU0FBRCxHQUFBO0FBQ1IsVUFBQSw2Q0FBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixtQkFBakIsQ0FBVixDQUFBO0FBQ0EsTUFBQSxJQUFjLGVBQWQ7QUFBQSxjQUFBLENBQUE7T0FEQTtBQUFBLE1BR0EsU0FBQSxHQUFZLFNBQVMsQ0FBQyxxQkFBVixDQUFBLENBSFosQ0FBQTtBQUFBLE1BSUEsUUFBdUIsSUFBQyxDQUFBLFNBQUQsQ0FBVyxTQUFYLEVBQXNCLE9BQXRCLENBQXZCLEVBQUMsY0FBQSxLQUFELEVBQVEsb0JBQUEsV0FKUixDQUFBO0FBS0EsTUFBQSxJQUFHLGFBQUg7ZUFDRSxJQUFDLENBQUEsbUNBQUQsQ0FBcUMsU0FBckMsRUFBZ0QsS0FBaEQsRUFBdUQsV0FBdkQsRUFERjtPQU5RO0lBQUEsQ0FiVixDQUFBOztBQUFBLGlDQXNCQSxtQ0FBQSxHQUFxQyxTQUFDLFNBQUQsRUFBWSxLQUFaLEVBQW1CLFdBQW5CLEdBQUE7QUFDbkMsVUFBQSxVQUFBO0FBQUEsTUFBQSxJQUFHLFNBQVMsQ0FBQyxPQUFWLENBQUEsQ0FBSDtlQUNFLE1BREY7T0FBQSxNQUFBO0FBR0UsUUFBQSxJQUFBLEdBQU8sS0FBTSxDQUFBLFdBQUEsQ0FBYixDQUFBO0FBQUEsUUFDQSxJQUFBLEdBQU8sU0FBUyxDQUFDLHFCQUFWLENBQUEsQ0FEUCxDQUFBO0FBR0EsUUFBQSxJQUFHLElBQUMsQ0FBQSxRQUFKO0FBQ0UsVUFBQSxJQUEwRCxJQUFJLENBQUMsVUFBTCxDQUFnQixJQUFoQixDQUExRDtBQUFBLFlBQUEsSUFBQSxHQUFPLHFCQUFBLENBQXNCLElBQUMsQ0FBQSxNQUF2QixFQUErQixJQUEvQixFQUFxQyxTQUFyQyxDQUFQLENBQUE7V0FERjtTQUFBLE1BQUE7QUFHRSxVQUFBLElBQTJELElBQUksQ0FBQyxVQUFMLENBQWdCLElBQWhCLENBQTNEO0FBQUEsWUFBQSxJQUFBLEdBQU8scUJBQUEsQ0FBc0IsSUFBQyxDQUFBLE1BQXZCLEVBQStCLElBQS9CLEVBQXFDLFVBQXJDLENBQVAsQ0FBQTtXQUhGO1NBSEE7QUFBQSxRQVFBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FSWixDQUFBO2VBU0ksSUFBQSxLQUFBLENBQU0sSUFBTixFQUFZLElBQVosQ0FBaUIsQ0FBQyxLQUFsQixDQUF3QixLQUFBLENBQU0sU0FBTixDQUFnQixDQUFDLGtCQUFqQixDQUFBLENBQXhCLEVBWk47T0FEbUM7SUFBQSxDQXRCckMsQ0FBQTs7QUFBQSxpQ0FxQ0EsZ0JBQUEsR0FBa0IsU0FBQyxTQUFELEdBQUE7QUFDaEIsVUFBQSxzQkFBQTtBQUFBLE1BQUEsSUFBQSxDQUFBLENBQWMsS0FBQSxHQUFRLElBQUMsQ0FBQSxRQUFELENBQVUsU0FBVixDQUFSLENBQWQ7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUFBLE1BQ0EsUUFBQSw2Q0FBdUIsSUFBQyxDQUFBLFFBRHhCLENBQUE7QUFBQSxNQUVBLEtBQUEsQ0FBTSxTQUFOLENBQWdCLENBQUMsY0FBakIsQ0FBZ0MsS0FBaEMsRUFBdUM7QUFBQSxRQUFDLFVBQUEsUUFBRDtPQUF2QyxDQUZBLENBQUE7YUFHQSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQWpCLENBQUEsRUFKZ0I7SUFBQSxDQXJDbEIsQ0FBQTs7OEJBQUE7O0tBRCtCLFdBaHhCakMsQ0FBQTs7QUFBQSxFQTR6Qk07QUFDSiwwQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxtQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsa0NBQ0EsUUFBQSxHQUFVLElBRFYsQ0FBQTs7QUFBQSxrQ0FHQSxTQUFBLEdBQVcsU0FBQyxTQUFELEVBQVksT0FBWixHQUFBO0FBQ1QsVUFBQSxnQkFBQTtBQUFBLE1BQUEsSUFBcUUsSUFBQyxDQUFBLE1BQUQsQ0FBUSxRQUFSLENBQXJFO0FBQUEsUUFBQSxTQUFBLEdBQVkscUJBQUEsQ0FBc0IsSUFBQyxDQUFBLE1BQXZCLEVBQStCLFNBQS9CLEVBQTBDLFVBQTFDLENBQVosQ0FBQTtPQUFBO0FBQUEsTUFDQSxTQUFBLEdBQVksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFYLEVBQWdCLFFBQWhCLENBQUQsRUFBNEIsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUE1QixDQURaLENBQUE7QUFBQSxNQUVBLEtBQUEsR0FBUSxJQUZSLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxNQUFNLENBQUMsMEJBQVIsQ0FBbUMsT0FBbkMsRUFBNEMsU0FBNUMsRUFBdUQsU0FBQyxJQUFELEdBQUE7QUFDckQsWUFBQSxXQUFBO0FBQUEsUUFEdUQsYUFBQSxPQUFPLFlBQUEsSUFDOUQsQ0FBQTtBQUFBLFFBQUEsSUFBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVosQ0FBdUIsU0FBdkIsQ0FBSDtBQUNFLFVBQUEsS0FBQSxHQUFRLEtBQVIsQ0FBQTtpQkFDQSxJQUFBLENBQUEsRUFGRjtTQURxRDtNQUFBLENBQXZELENBSEEsQ0FBQTthQU9BO0FBQUEsUUFBQyxLQUFBLEVBQU8sS0FBUjtBQUFBLFFBQWUsV0FBQSxFQUFhLE9BQTVCO1FBUlM7SUFBQSxDQUhYLENBQUE7OytCQUFBOztLQURnQyxtQkE1ekJsQyxDQUFBOztBQUFBLEVBNjBCTTtBQUNKLHdDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGlCQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxnQ0FDQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sVUFBQSw0QkFBQTtBQUFBLE1BQUEsUUFBeUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxpQkFBbkMsRUFBQyxtQkFBQSxVQUFELEVBQWEsSUFBQyxDQUFBLGdCQUFBLE9BQWQsQ0FBQTtBQUNBLE1BQUEsSUFBRyxvQkFBQSxJQUFnQixzQkFBbkI7QUFDRSxRQUFBLFNBQUEsR0FBWSxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQUEsQ0FBWixDQUFBO2VBQ0EsS0FBQSxDQUFNLFNBQU4sQ0FBZ0IsQ0FBQyxrQkFBakIsQ0FBb0MsVUFBcEMsRUFGRjtPQUZNO0lBQUEsQ0FEUixDQUFBOzs2QkFBQTs7S0FEOEIsV0E3MEJoQyxDQUFBOztBQUFBLEVBcTFCTTtBQUNKLDBDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLG1CQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUFBLGtDQUVBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTixVQUFBLE1BQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsUUFBUSxDQUFDLG1CQUFtQixDQUFDLHFCQUE5QixDQUFBLENBQVQsQ0FBQTtBQUNBLE1BQUEsSUFBRyxNQUFNLENBQUMsTUFBVjtBQUNFLFFBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFnQyxNQUFoQyxDQUFBLENBREY7T0FEQTthQUdBLElBQUMsQ0FBQSxRQUFRLENBQUMseUJBQVYsQ0FBQSxFQUpNO0lBQUEsQ0FGUixDQUFBOzsrQkFBQTs7S0FEZ0MsV0FyMUJsQyxDQUFBOztBQUFBLEVBODFCTTtBQUNKLDJDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLG9CQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7Z0NBQUE7O0tBRGlDLG9CQTkxQm5DLENBQUE7O0FBQUEsRUFpMkJNO0FBQ0osK0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsd0JBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztvQ0FBQTs7S0FEcUMsb0JBajJCdkMsQ0FBQTs7QUFBQSxFQXEyQk07QUFDSixrQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxXQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUFBLDBCQUVBLFFBQUEsR0FBVSxTQUFDLFNBQUQsR0FBQTtBQUNSLE1BQUEsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFBLENBQUE7YUFHQSxxQkFBQSxDQUFzQixJQUFDLENBQUEsTUFBdkIsQ0FBOEIsQ0FBQyxTQUEvQixDQUF5QyxDQUFDLENBQUEsQ0FBRCxFQUFLLENBQUwsQ0FBekMsRUFBa0QsQ0FBQyxDQUFBLENBQUQsRUFBSyxDQUFMLENBQWxELEVBSlE7SUFBQSxDQUZWLENBQUE7O3VCQUFBOztLQUR3QixXQXIyQjFCLENBQUE7O0FBQUEsRUE4MkJNO0FBQ0osbUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsWUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O3dCQUFBOztLQUR5QixZQTkyQjNCLENBQUE7O0FBQUEsRUFpM0JNO0FBQ0osdUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsZ0JBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOzs0QkFBQTs7S0FENkIsWUFqM0IvQixDQUFBOztBQUFBLEVBczNCTTtBQUNKLDJCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLElBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQUEsbUJBRUEsTUFBQSxHQUFRLFNBQUEsR0FBQTtBQUNOLE1BQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFYLENBQUE7QUFBQSxNQUVBLGtDQUFBLFNBQUEsQ0FGQSxDQUFBO0FBSUEsTUFBQSxJQUE0QyxJQUFDLENBQUEsT0FBN0M7ZUFBQSxJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVYsQ0FBbUIsUUFBbkIsRUFBNkIsVUFBN0IsRUFBQTtPQUxNO0lBQUEsQ0FGUixDQUFBOztBQUFBLG1CQVNBLFFBQUEsR0FBVSxTQUFDLFNBQUQsR0FBQTtBQUNSLFVBQUEsNkZBQUE7QUFBQSxNQUFBLFNBQUEsR0FBWSxJQUFDLENBQUEsK0JBQUQsQ0FBaUMsU0FBakMsQ0FBWixDQUFBO0FBQUEsTUFFQSxZQUFBLEdBQWUsSUFBQyxDQUFBLEtBQUEsQ0FBRCxDQUFLLGNBQUwsQ0FGZixDQUFBO0FBQUEsTUFHQSxjQUFBLEdBQWlCLElBQUMsQ0FBQSxLQUFBLENBQUQsQ0FBSyxnQkFBTCxDQUhqQixDQUFBO0FBSUEsTUFBQSxJQUFBLENBQUEsWUFBMEIsQ0FBQyxnQkFBYixDQUE4QixTQUE5QixDQUFkO0FBQUEsY0FBQSxDQUFBO09BSkE7QUFBQSxNQU1BLGdCQUFBLEdBQW1CLGNBQUEsR0FBaUIsSUFOcEMsQ0FBQTtBQU9BLE1BQUEsSUFBaUQsWUFBWSxDQUFDLE1BQWIsQ0FBb0IsU0FBcEIsQ0FBakQ7QUFBQSxRQUFBLGdCQUFBLEdBQW1CLGNBQUEsR0FBaUIsU0FBcEMsQ0FBQTtPQVBBO0FBU0EsTUFBQSxJQUFHLFlBQVksQ0FBQyxnQkFBYixDQUE4QixTQUFTLENBQUMsU0FBVixDQUFvQixDQUFDLENBQUEsQ0FBRCxFQUFLLENBQUwsQ0FBcEIsQ0FBOUIsQ0FBSDtBQUNFLFFBQUEsZ0JBQUEsR0FBbUIsWUFBWSxDQUFDLFFBQWIsQ0FBc0IsU0FBdEIsQ0FBbkIsQ0FERjtPQVRBO0FBWUEsTUFBQSxJQUFHLGNBQWMsQ0FBQyxnQkFBZixDQUFnQyxTQUFTLENBQUMsU0FBVixDQUFvQixDQUFDLENBQUEsQ0FBRCxFQUFLLENBQUwsQ0FBcEIsQ0FBaEMsQ0FBSDtBQUNFLFFBQUEsY0FBQSxHQUFpQixjQUFjLENBQUMsUUFBZixDQUF3QixTQUF4QixDQUFqQixDQURGO09BWkE7QUFlQSxNQUFBLElBQUcsMEJBQUEsSUFBc0Isd0JBQXpCOztVQUNFLElBQUMsQ0FBQSxVQUFXO1NBQVo7QUFBQSxRQUNBLFdBQUEsR0FBa0IsSUFBQSxLQUFBLENBQU0sZ0JBQU4sRUFBd0IsY0FBeEIsQ0FEbEIsQ0FBQTtBQUFBLFFBRUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMseUJBQVIsQ0FBa0MsV0FBbEMsQ0FGUixDQUFBO2VBR0EsK0JBQUEsQ0FBZ0MsSUFBQyxDQUFBLE1BQWpDLEVBQXlDLEtBQXpDLEVBQWdELEtBQWhELEVBQXVELFNBQXZELEVBSkY7T0FoQlE7SUFBQSxDQVRWLENBQUE7O2dCQUFBOztLQURpQixXQXQzQm5CLENBQUE7O0FBQUEsRUFzNUJNO0FBQ0osNEJBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsS0FBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O2lCQUFBOztLQURrQixLQXQ1QnBCLENBQUE7O0FBQUEsRUF5NUJNO0FBQ0osZ0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsU0FBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O3FCQUFBOztLQURzQixLQXo1QnhCLENBQUE7O0FBQUEsRUE4NUJNO0FBQ0osc0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsZUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSLENBQUEsQ0FBQTs7QUFBQSw4QkFDQSxNQUFBLEdBQVEsRUFEUixDQUFBOztBQUFBLDhCQUdBLFFBQUEsR0FBVSxTQUFDLFNBQUQsR0FBQTtBQUNSLFVBQUEsMENBQUE7QUFBQSxNQUFBLFVBQUEsR0FBYSxJQUFiLENBQUE7QUFDQTtBQUFBLFdBQUEsNENBQUE7MkJBQUE7WUFBMkIsS0FBQSxHQUFRLElBQUMsQ0FBQSxLQUFBLENBQUQsQ0FBSyxNQUFMLENBQVksQ0FBQyxRQUFiLENBQXNCLFNBQXRCO0FBQ2pDLFVBQUEsSUFBRyxrQkFBSDtBQUNFLFlBQUEsVUFBQSxHQUFhLFVBQVUsQ0FBQyxLQUFYLENBQWlCLEtBQWpCLENBQWIsQ0FERjtXQUFBLE1BQUE7QUFHRSxZQUFBLFVBQUEsR0FBYSxLQUFiLENBSEY7O1NBREY7QUFBQSxPQURBO2FBTUEsV0FQUTtJQUFBLENBSFYsQ0FBQTs7MkJBQUE7O0tBRDRCLFdBOTVCOUIsQ0FBQTs7QUFBQSxFQTI2Qk07QUFDSixnREFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSx5QkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsd0NBQ0EsTUFBQSxHQUFRLENBQUMsV0FBRCxFQUFjLGdCQUFkLENBRFIsQ0FBQTs7cUNBQUE7O0tBRHNDLGdCQTM2QnhDLENBQUE7O0FBQUEsRUFnN0JNO0FBQ0osK0RBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsd0NBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLHVEQUNBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTixVQUFBLHVDQUFBO0FBQUEsTUFBQSxlQUFBLEdBQWtCLElBQUMsQ0FBQSxRQUFRLENBQUMsbUNBQVYsQ0FBQSxDQUFsQixDQUFBO0FBQUEsTUFDQSxjQUFBLEdBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBQSxDQURqQixDQUFBO0FBQUEsTUFFQSxNQUFBLEdBQVMsZUFBZSxDQUFDLE1BQWhCLENBQXVCLGNBQXZCLENBRlQsQ0FBQTtBQUlBLE1BQUEsSUFBRyxNQUFNLENBQUMsTUFBVjtBQUNFLFFBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFnQyxNQUFoQyxDQUFBLENBREY7T0FKQTtBQUFBLE1BTUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyx5QkFBVixDQUFBLENBTkEsQ0FBQTthQU9BLElBQUMsQ0FBQSxNQUFNLENBQUMsMkJBQVIsQ0FBQSxFQVJNO0lBQUEsQ0FEUixDQUFBOztvREFBQTs7S0FEcUQsV0FoN0J2RCxDQUFBOztBQUFBLEVBODdCTTtBQUNKLDJDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLG9CQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUFBLG1DQUNBLE1BQUEsR0FBUSxFQURSLENBQUE7O0FBQUEsbUNBRUEsYUFBQSxHQUFlO0FBQUEsTUFBQyxhQUFBLEVBQWUsS0FBaEI7S0FGZixDQUFBOztBQUFBLG1DQUlBLFVBQUEsR0FBWSxTQUFDLEtBQUQsRUFBUSxTQUFSLEdBQUE7YUFDVixJQUFDLENBQUEsS0FBQSxDQUFELENBQUssS0FBTCxFQUFZLElBQUMsQ0FBQSxhQUFiLENBQTJCLENBQUMsUUFBNUIsQ0FBcUMsU0FBckMsRUFEVTtJQUFBLENBSlosQ0FBQTs7QUFBQSxtQ0FPQSxTQUFBLEdBQVcsU0FBQyxTQUFELEdBQUE7QUFDVCxVQUFBLHVDQUFBO0FBQUM7QUFBQTtXQUFBLDRDQUFBOzBCQUFBO1lBQWdDLENBQUMsS0FBQSxHQUFRLElBQUMsQ0FBQSxVQUFELENBQVksS0FBWixFQUFtQixTQUFuQixDQUFUO0FBQWhDLHdCQUFBLE1BQUE7U0FBQTtBQUFBO3NCQURRO0lBQUEsQ0FQWCxDQUFBOztBQUFBLG1DQVVBLFFBQUEsR0FBVSxTQUFDLFNBQUQsR0FBQTtBQUNSLFVBQUEsOEJBQUE7QUFBQTtBQUFBLFdBQUEsNENBQUE7MkJBQUE7WUFBMkIsS0FBQSxHQUFRLElBQUMsQ0FBQSxVQUFELENBQVksTUFBWixFQUFvQixTQUFwQjtBQUNqQyxpQkFBTyxLQUFQO1NBREY7QUFBQSxPQURRO0lBQUEsQ0FWVixDQUFBOztnQ0FBQTs7S0FEaUMsV0E5N0JuQyxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/text-object.coffee
