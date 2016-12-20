(function() {
  var AAngleBracket, AAngleBracketAllowForwarding, AAnyPair, AAnyPairAllowForwarding, AAnyQuote, ABackTick, AComment, ACurlyBracket, ACurlyBracketAllowForwarding, ACurrentLine, ACurrentSelectionAndAPersistentSelection, ADoubleQuote, AEdge, AEntire, AFold, AFunction, AFunctionOrInnerParagraph, AIndentation, ALatestChange, AParagraph, AParenthesis, AParenthesisAllowForwarding, APersistentSelection, ASingleQuote, ASmartWord, ASquareBracket, ASquareBracketAllowForwarding, ATag, AVisibleArea, AWholeWord, AWord, All, AngleBracket, AnyPair, AnyPairAllowForwarding, AnyQuote, BackTick, Base, Comment, CurlyBracket, CurrentLine, DoubleQuote, Edge, Empty, Entire, Fold, Function, Indentation, InnerAngleBracket, InnerAngleBracketAllowForwarding, InnerAnyPair, InnerAnyPairAllowForwarding, InnerAnyQuote, InnerBackTick, InnerComment, InnerCurlyBracket, InnerCurlyBracketAllowForwarding, InnerCurrentLine, InnerDoubleQuote, InnerEdge, InnerEntire, InnerFold, InnerFunction, InnerIndentation, InnerLatestChange, InnerParagraph, InnerParenthesis, InnerParenthesisAllowForwarding, InnerPersistentSelection, InnerSingleQuote, InnerSmartWord, InnerSquareBracket, InnerSquareBracketAllowForwarding, InnerTag, InnerVisibleArea, InnerWholeWord, InnerWord, LatestChange, Pair, Paragraph, Parenthesis, PersistentSelection, Point, PreviousSelection, Quote, Range, SearchMatchBackward, SearchMatchForward, SingleQuote, SmartWord, SquareBracket, Tag, TextObject, TextObjectFirstFound, UnionTextObject, VisibleArea, WholeWord, Word, countChar, getBufferRangeForRowRange, getBufferRows, getCodeFoldRowRangesContainesForRow, getEndPositionForPattern, getIndentLevelForBufferRow, getRangeByTranslatePointAndClip, getStartPositionForPattern, getTextToPoint, getValidVimBufferRow, getVisibleBufferRange, isIncludeFunctionScopeForRow, pointIsAtEndOfLine, sortRanges, sortRangesByEndPosition, swrap, tagPattern, translatePointAndClip, trimRange, _, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  _ = require('underscore-plus');

  Base = require('./base');

  swrap = require('./selection-wrapper');

  _ref1 = require('./utils'), sortRanges = _ref1.sortRanges, sortRangesByEndPosition = _ref1.sortRangesByEndPosition, countChar = _ref1.countChar, pointIsAtEndOfLine = _ref1.pointIsAtEndOfLine, getTextToPoint = _ref1.getTextToPoint, getIndentLevelForBufferRow = _ref1.getIndentLevelForBufferRow, getCodeFoldRowRangesContainesForRow = _ref1.getCodeFoldRowRangesContainesForRow, getBufferRangeForRowRange = _ref1.getBufferRangeForRowRange, isIncludeFunctionScopeForRow = _ref1.isIncludeFunctionScopeForRow, getStartPositionForPattern = _ref1.getStartPositionForPattern, getEndPositionForPattern = _ref1.getEndPositionForPattern, getVisibleBufferRange = _ref1.getVisibleBufferRange, translatePointAndClip = _ref1.translatePointAndClip, getRangeByTranslatePointAndClip = _ref1.getRangeByTranslatePointAndClip, getBufferRows = _ref1.getBufferRows, getValidVimBufferRow = _ref1.getValidVimBufferRow, getEndPositionForPattern = _ref1.getEndPositionForPattern, getStartPositionForPattern = _ref1.getStartPositionForPattern, trimRange = _ref1.trimRange;

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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi90ZXh0LW9iamVjdC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsdTREQUFBO0lBQUE7O3lKQUFBOztBQUFBLEVBQUEsT0FBaUIsT0FBQSxDQUFRLE1BQVIsQ0FBakIsRUFBQyxhQUFBLEtBQUQsRUFBUSxhQUFBLEtBQVIsQ0FBQTs7QUFBQSxFQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FESixDQUFBOztBQUFBLEVBUUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSLENBUlAsQ0FBQTs7QUFBQSxFQVNBLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVIsQ0FUUixDQUFBOztBQUFBLEVBVUEsUUFrQkksT0FBQSxDQUFRLFNBQVIsQ0FsQkosRUFDRSxtQkFBQSxVQURGLEVBQ2MsZ0NBQUEsdUJBRGQsRUFDdUMsa0JBQUEsU0FEdkMsRUFDa0QsMkJBQUEsa0JBRGxELEVBRUUsdUJBQUEsY0FGRixFQUdFLG1DQUFBLDBCQUhGLEVBSUUsNENBQUEsbUNBSkYsRUFLRSxrQ0FBQSx5QkFMRixFQU1FLHFDQUFBLDRCQU5GLEVBT0UsbUNBQUEsMEJBUEYsRUFRRSxpQ0FBQSx3QkFSRixFQVNFLDhCQUFBLHFCQVRGLEVBVUUsOEJBQUEscUJBVkYsRUFXRSx3Q0FBQSwrQkFYRixFQVlFLHNCQUFBLGFBWkYsRUFhRSw2QkFBQSxvQkFiRixFQWVFLGlDQUFBLHdCQWZGLEVBZ0JFLG1DQUFBLDBCQWhCRixFQWlCRSxrQkFBQSxTQTNCRixDQUFBOztBQUFBLEVBOEJNO0FBQ0osaUNBQUEsQ0FBQTs7QUFBQSxJQUFBLFVBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQUEseUJBQ0Esa0JBQUEsR0FBb0IsSUFEcEIsQ0FBQTs7QUFF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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/text-object.coffee
