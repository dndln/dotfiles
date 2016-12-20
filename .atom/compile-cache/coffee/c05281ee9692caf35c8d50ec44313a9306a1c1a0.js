(function() {
  var ActivateInsertMode, ActivateReplaceMode, Change, ChangeOccurrence, ChangeOccurrenceInAFunctionOrInnerParagraph, ChangeOccurrenceInAPersistentSelection, ChangeToLastCharacterOfLine, InsertAboveWithNewline, InsertAfter, InsertAfterEndOfLine, InsertAtBeginningOfLine, InsertAtEndOfInnerSmartWord, InsertAtEndOfSearchCurrentLine, InsertAtEndOfTarget, InsertAtHeadOfTarget, InsertAtLastInsert, InsertAtNextFoldStart, InsertAtPreviousFoldStart, InsertAtStartOfInnerSmartWord, InsertAtStartOfSearchCurrentLine, InsertAtStartOfTarget, InsertAtTailOfTarget, InsertBelowWithNewline, InsertByTarget, Operator, Substitute, SubstituteLine, getNewTextRangeFromCheckpoint, moveCursorLeft, moveCursorRight, settings, swrap, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  _ref = require('./utils'), moveCursorLeft = _ref.moveCursorLeft, moveCursorRight = _ref.moveCursorRight, getNewTextRangeFromCheckpoint = _ref.getNewTextRangeFromCheckpoint;

  swrap = require('./selection-wrapper');

  settings = require('./settings');

  Operator = require('./base').getClass('Operator');

  ActivateInsertMode = (function(_super) {
    __extends(ActivateInsertMode, _super);

    function ActivateInsertMode() {
      return ActivateInsertMode.__super__.constructor.apply(this, arguments);
    }

    ActivateInsertMode.extend();

    ActivateInsertMode.prototype.requireTarget = false;

    ActivateInsertMode.prototype.flashTarget = false;

    ActivateInsertMode.prototype.checkpoint = null;

    ActivateInsertMode.prototype.finalSubmode = null;

    ActivateInsertMode.prototype.supportInsertionCount = true;

    ActivateInsertMode.prototype.observeWillDeactivateMode = function() {
      var disposable;
      return disposable = this.vimState.modeManager.preemptWillDeactivateMode((function(_this) {
        return function(_arg) {
          var mode, range, textByUserInput;
          mode = _arg.mode;
          if (mode !== 'insert') {
            return;
          }
          disposable.dispose();
          _this.vimState.mark.set('^', _this.editor.getCursorBufferPosition());
          if ((range = getNewTextRangeFromCheckpoint(_this.editor, _this.getCheckpoint('insert'))) != null) {
            _this.setMarkForChange(range);
            textByUserInput = _this.editor.getTextInBufferRange(range);
          } else {
            textByUserInput = '';
          }
          _this.saveInsertedText(textByUserInput);
          _this.vimState.register.set('.', {
            text: textByUserInput
          });
          _.times(_this.getInsertionCount(), function() {
            var selection, text, _i, _len, _ref1, _results;
            text = _this.textByOperator + textByUserInput;
            _ref1 = _this.editor.getSelections();
            _results = [];
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              selection = _ref1[_i];
              _results.push(selection.insertText(text, {
                autoIndent: true
              }));
            }
            return _results;
          });
          if (settings.get('groupChangesWhenLeavingInsertMode')) {
            return _this.editor.groupChangesSinceCheckpoint(_this.getCheckpoint('undo'));
          }
        };
      })(this));
    };

    ActivateInsertMode.prototype.initialize = function() {
      ActivateInsertMode.__super__.initialize.apply(this, arguments);
      this.checkpoint = {};
      if (!this.isRepeated()) {
        this.setCheckpoint('undo');
      }
      return this.observeWillDeactivateMode();
    };

    ActivateInsertMode.prototype.setCheckpoint = function(purpose) {
      return this.checkpoint[purpose] = this.editor.createCheckpoint();
    };

    ActivateInsertMode.prototype.getCheckpoint = function(purpose) {
      return this.checkpoint[purpose];
    };

    ActivateInsertMode.prototype.saveInsertedText = function(insertedText) {
      this.insertedText = insertedText;
      return this.insertedText;
    };

    ActivateInsertMode.prototype.getInsertedText = function() {
      var _ref1;
      return (_ref1 = this.insertedText) != null ? _ref1 : '';
    };

    ActivateInsertMode.prototype.repeatInsert = function(selection, text) {
      return selection.insertText(text, {
        autoIndent: true
      });
    };

    ActivateInsertMode.prototype.getInsertionCount = function() {
      if (this.insertionCount == null) {
        this.insertionCount = this.supportInsertionCount ? this.getCount() - 1 : 0;
      }
      return this.insertionCount;
    };

    ActivateInsertMode.prototype.execute = function() {
      var range, text;
      if (this.isRepeated()) {
        if (!(text = this.getInsertedText())) {
          return;
        }
        if (!this["instanceof"]('Change')) {
          this.flashTarget = this.trackChange = true;
          this.emitDidSelectTarget();
        }
        this.editor.transact((function(_this) {
          return function() {
            var selection, _i, _len, _ref1, _results;
            _ref1 = _this.editor.getSelections();
            _results = [];
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              selection = _ref1[_i];
              _this.repeatInsert(selection, text);
              _results.push(moveCursorLeft(selection.cursor));
            }
            return _results;
          };
        })(this));
        if (settings.get('clearMultipleCursorsOnEscapeInsertMode')) {
          return this.editor.clearSelections();
        }
      } else {
        if (this.getInsertionCount() > 0) {
          range = getNewTextRangeFromCheckpoint(this.editor, this.getCheckpoint('undo'));
          this.textByOperator = range != null ? this.editor.getTextInBufferRange(range) : '';
        }
        this.setCheckpoint('insert');
        return this.vimState.activate('insert', this.finalSubmode);
      }
    };

    return ActivateInsertMode;

  })(Operator);

  ActivateReplaceMode = (function(_super) {
    __extends(ActivateReplaceMode, _super);

    function ActivateReplaceMode() {
      return ActivateReplaceMode.__super__.constructor.apply(this, arguments);
    }

    ActivateReplaceMode.extend();

    ActivateReplaceMode.prototype.finalSubmode = 'replace';

    ActivateReplaceMode.prototype.repeatInsert = function(selection, text) {
      var char, _i, _len;
      for (_i = 0, _len = text.length; _i < _len; _i++) {
        char = text[_i];
        if (!(char !== "\n")) {
          continue;
        }
        if (selection.cursor.isAtEndOfLine()) {
          break;
        }
        selection.selectRight();
      }
      return selection.insertText(text, {
        autoIndent: false
      });
    };

    return ActivateReplaceMode;

  })(ActivateInsertMode);

  InsertAfter = (function(_super) {
    __extends(InsertAfter, _super);

    function InsertAfter() {
      return InsertAfter.__super__.constructor.apply(this, arguments);
    }

    InsertAfter.extend();

    InsertAfter.prototype.execute = function() {
      var cursor, _i, _len, _ref1;
      _ref1 = this.editor.getCursors();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        cursor = _ref1[_i];
        moveCursorRight(cursor);
      }
      return InsertAfter.__super__.execute.apply(this, arguments);
    };

    return InsertAfter;

  })(ActivateInsertMode);

  InsertAfterEndOfLine = (function(_super) {
    __extends(InsertAfterEndOfLine, _super);

    function InsertAfterEndOfLine() {
      return InsertAfterEndOfLine.__super__.constructor.apply(this, arguments);
    }

    InsertAfterEndOfLine.extend();

    InsertAfterEndOfLine.prototype.execute = function() {
      this.editor.moveToEndOfLine();
      return InsertAfterEndOfLine.__super__.execute.apply(this, arguments);
    };

    return InsertAfterEndOfLine;

  })(ActivateInsertMode);

  InsertAtBeginningOfLine = (function(_super) {
    __extends(InsertAtBeginningOfLine, _super);

    function InsertAtBeginningOfLine() {
      return InsertAtBeginningOfLine.__super__.constructor.apply(this, arguments);
    }

    InsertAtBeginningOfLine.extend();

    InsertAtBeginningOfLine.prototype.execute = function() {
      this.editor.moveToBeginningOfLine();
      this.editor.moveToFirstCharacterOfLine();
      return InsertAtBeginningOfLine.__super__.execute.apply(this, arguments);
    };

    return InsertAtBeginningOfLine;

  })(ActivateInsertMode);

  InsertAtLastInsert = (function(_super) {
    __extends(InsertAtLastInsert, _super);

    function InsertAtLastInsert() {
      return InsertAtLastInsert.__super__.constructor.apply(this, arguments);
    }

    InsertAtLastInsert.extend();

    InsertAtLastInsert.prototype.execute = function() {
      var point;
      if ((point = this.vimState.mark.get('^'))) {
        this.editor.setCursorBufferPosition(point);
        this.editor.scrollToCursorPosition({
          center: true
        });
      }
      return InsertAtLastInsert.__super__.execute.apply(this, arguments);
    };

    return InsertAtLastInsert;

  })(ActivateInsertMode);

  InsertAboveWithNewline = (function(_super) {
    __extends(InsertAboveWithNewline, _super);

    function InsertAboveWithNewline() {
      return InsertAboveWithNewline.__super__.constructor.apply(this, arguments);
    }

    InsertAboveWithNewline.extend();

    InsertAboveWithNewline.prototype.execute = function() {
      this.insertNewline();
      return InsertAboveWithNewline.__super__.execute.apply(this, arguments);
    };

    InsertAboveWithNewline.prototype.insertNewline = function() {
      return this.editor.insertNewlineAbove();
    };

    InsertAboveWithNewline.prototype.repeatInsert = function(selection, text) {
      return selection.insertText(text.trimLeft(), {
        autoIndent: true
      });
    };

    return InsertAboveWithNewline;

  })(ActivateInsertMode);

  InsertBelowWithNewline = (function(_super) {
    __extends(InsertBelowWithNewline, _super);

    function InsertBelowWithNewline() {
      return InsertBelowWithNewline.__super__.constructor.apply(this, arguments);
    }

    InsertBelowWithNewline.extend();

    InsertBelowWithNewline.prototype.insertNewline = function() {
      return this.editor.insertNewlineBelow();
    };

    return InsertBelowWithNewline;

  })(InsertAboveWithNewline);

  InsertByTarget = (function(_super) {
    __extends(InsertByTarget, _super);

    function InsertByTarget() {
      return InsertByTarget.__super__.constructor.apply(this, arguments);
    }

    InsertByTarget.extend(false);

    InsertByTarget.prototype.requireTarget = true;

    InsertByTarget.prototype.which = null;

    InsertByTarget.prototype.execute = function() {
      var selection, _i, _len, _ref1;
      this.selectTarget();
      _ref1 = this.editor.getSelections();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        selection = _ref1[_i];
        swrap(selection).setBufferPositionTo(this.which);
      }
      return InsertByTarget.__super__.execute.apply(this, arguments);
    };

    return InsertByTarget;

  })(ActivateInsertMode);

  InsertAtStartOfTarget = (function(_super) {
    __extends(InsertAtStartOfTarget, _super);

    function InsertAtStartOfTarget() {
      return InsertAtStartOfTarget.__super__.constructor.apply(this, arguments);
    }

    InsertAtStartOfTarget.extend();

    InsertAtStartOfTarget.prototype.which = 'start';

    return InsertAtStartOfTarget;

  })(InsertByTarget);

  InsertAtEndOfTarget = (function(_super) {
    __extends(InsertAtEndOfTarget, _super);

    function InsertAtEndOfTarget() {
      return InsertAtEndOfTarget.__super__.constructor.apply(this, arguments);
    }

    InsertAtEndOfTarget.extend();

    InsertAtEndOfTarget.prototype.which = 'end';

    return InsertAtEndOfTarget;

  })(InsertByTarget);

  InsertAtStartOfInnerSmartWord = (function(_super) {
    __extends(InsertAtStartOfInnerSmartWord, _super);

    function InsertAtStartOfInnerSmartWord() {
      return InsertAtStartOfInnerSmartWord.__super__.constructor.apply(this, arguments);
    }

    InsertAtStartOfInnerSmartWord.extend();

    InsertAtStartOfInnerSmartWord.prototype.which = 'start';

    InsertAtStartOfInnerSmartWord.prototype.target = "InnerSmartWord";

    return InsertAtStartOfInnerSmartWord;

  })(InsertByTarget);

  InsertAtEndOfInnerSmartWord = (function(_super) {
    __extends(InsertAtEndOfInnerSmartWord, _super);

    function InsertAtEndOfInnerSmartWord() {
      return InsertAtEndOfInnerSmartWord.__super__.constructor.apply(this, arguments);
    }

    InsertAtEndOfInnerSmartWord.extend();

    InsertAtEndOfInnerSmartWord.prototype.which = 'end';

    InsertAtEndOfInnerSmartWord.prototype.target = "InnerSmartWord";

    return InsertAtEndOfInnerSmartWord;

  })(InsertByTarget);

  InsertAtHeadOfTarget = (function(_super) {
    __extends(InsertAtHeadOfTarget, _super);

    function InsertAtHeadOfTarget() {
      return InsertAtHeadOfTarget.__super__.constructor.apply(this, arguments);
    }

    InsertAtHeadOfTarget.extend();

    InsertAtHeadOfTarget.prototype.which = 'head';

    return InsertAtHeadOfTarget;

  })(InsertByTarget);

  InsertAtTailOfTarget = (function(_super) {
    __extends(InsertAtTailOfTarget, _super);

    function InsertAtTailOfTarget() {
      return InsertAtTailOfTarget.__super__.constructor.apply(this, arguments);
    }

    InsertAtTailOfTarget.extend();

    InsertAtTailOfTarget.prototype.which = 'tail';

    return InsertAtTailOfTarget;

  })(InsertByTarget);

  InsertAtPreviousFoldStart = (function(_super) {
    __extends(InsertAtPreviousFoldStart, _super);

    function InsertAtPreviousFoldStart() {
      return InsertAtPreviousFoldStart.__super__.constructor.apply(this, arguments);
    }

    InsertAtPreviousFoldStart.extend();

    InsertAtPreviousFoldStart.description = "Move to previous fold start then enter insert-mode";

    InsertAtPreviousFoldStart.prototype.target = 'MoveToPreviousFoldStart';

    return InsertAtPreviousFoldStart;

  })(InsertAtHeadOfTarget);

  InsertAtNextFoldStart = (function(_super) {
    __extends(InsertAtNextFoldStart, _super);

    function InsertAtNextFoldStart() {
      return InsertAtNextFoldStart.__super__.constructor.apply(this, arguments);
    }

    InsertAtNextFoldStart.extend();

    InsertAtNextFoldStart.description = "Move to next fold start then enter insert-mode";

    InsertAtNextFoldStart.prototype.target = 'MoveToNextFoldStart';

    return InsertAtNextFoldStart;

  })(InsertAtHeadOfTarget);

  InsertAtStartOfSearchCurrentLine = (function(_super) {
    __extends(InsertAtStartOfSearchCurrentLine, _super);

    function InsertAtStartOfSearchCurrentLine() {
      return InsertAtStartOfSearchCurrentLine.__super__.constructor.apply(this, arguments);
    }

    InsertAtStartOfSearchCurrentLine.extend();

    InsertAtStartOfSearchCurrentLine.prototype.defaultLandingPoint = 'start';

    InsertAtStartOfSearchCurrentLine.prototype.initialize = function() {
      InsertAtStartOfSearchCurrentLine.__super__.initialize.apply(this, arguments);
      return this.setTarget(this["new"]('SearchCurrentLine', {
        updateSearchHistory: false,
        defaultLandingPoint: this.defaultLandingPoint,
        quiet: true
      }));
    };

    return InsertAtStartOfSearchCurrentLine;

  })(InsertAtEndOfTarget);

  InsertAtEndOfSearchCurrentLine = (function(_super) {
    __extends(InsertAtEndOfSearchCurrentLine, _super);

    function InsertAtEndOfSearchCurrentLine() {
      return InsertAtEndOfSearchCurrentLine.__super__.constructor.apply(this, arguments);
    }

    InsertAtEndOfSearchCurrentLine.extend();

    InsertAtEndOfSearchCurrentLine.prototype.defaultLandingPoint = 'end';

    return InsertAtEndOfSearchCurrentLine;

  })(InsertAtStartOfSearchCurrentLine);

  Change = (function(_super) {
    __extends(Change, _super);

    function Change() {
      return Change.__super__.constructor.apply(this, arguments);
    }

    Change.extend();

    Change.prototype.requireTarget = true;

    Change.prototype.trackChange = true;

    Change.prototype.supportInsertionCount = false;

    Change.prototype.execute = function() {
      var selected, text, _base;
      if (this.isRepeated()) {
        this.flashTarget = true;
      }
      selected = this.selectTarget();
      if (this.isOccurrence() && !selected) {
        this.vimState.activate('normal');
        return;
      }
      text = '';
      if (this.target.isTextObject() || this.target.isMotion()) {
        if (swrap.detectVisualModeSubmode(this.editor) === 'linewise') {
          text = "\n";
        }
      } else {
        if (typeof (_base = this.target).isLinewise === "function" ? _base.isLinewise() : void 0) {
          text = "\n";
        }
      }
      this.editor.transact((function(_this) {
        return function() {
          var range, selection, _i, _len, _ref1, _results;
          _ref1 = _this.editor.getSelections();
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            selection = _ref1[_i];
            _this.setTextToRegisterForSelection(selection);
            range = selection.insertText(text, {
              autoIndent: true
            });
            if (!range.isEmpty()) {
              _results.push(selection.cursor.moveLeft());
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
      })(this));
      return Change.__super__.execute.apply(this, arguments);
    };

    return Change;

  })(ActivateInsertMode);

  ChangeOccurrence = (function(_super) {
    __extends(ChangeOccurrence, _super);

    function ChangeOccurrence() {
      return ChangeOccurrence.__super__.constructor.apply(this, arguments);
    }

    ChangeOccurrence.extend();

    ChangeOccurrence.description = "Change all matching word within target range";

    ChangeOccurrence.prototype.occurrence = true;

    return ChangeOccurrence;

  })(Change);

  ChangeOccurrenceInAFunctionOrInnerParagraph = (function(_super) {
    __extends(ChangeOccurrenceInAFunctionOrInnerParagraph, _super);

    function ChangeOccurrenceInAFunctionOrInnerParagraph() {
      return ChangeOccurrenceInAFunctionOrInnerParagraph.__super__.constructor.apply(this, arguments);
    }

    ChangeOccurrenceInAFunctionOrInnerParagraph.extend();

    ChangeOccurrenceInAFunctionOrInnerParagraph.prototype.target = 'AFunctionOrInnerParagraph';

    return ChangeOccurrenceInAFunctionOrInnerParagraph;

  })(ChangeOccurrence);

  ChangeOccurrenceInAPersistentSelection = (function(_super) {
    __extends(ChangeOccurrenceInAPersistentSelection, _super);

    function ChangeOccurrenceInAPersistentSelection() {
      return ChangeOccurrenceInAPersistentSelection.__super__.constructor.apply(this, arguments);
    }

    ChangeOccurrenceInAPersistentSelection.extend();

    ChangeOccurrenceInAPersistentSelection.prototype.target = "APersistentSelection";

    return ChangeOccurrenceInAPersistentSelection;

  })(ChangeOccurrence);

  Substitute = (function(_super) {
    __extends(Substitute, _super);

    function Substitute() {
      return Substitute.__super__.constructor.apply(this, arguments);
    }

    Substitute.extend();

    Substitute.prototype.target = 'MoveRight';

    return Substitute;

  })(Change);

  SubstituteLine = (function(_super) {
    __extends(SubstituteLine, _super);

    function SubstituteLine() {
      return SubstituteLine.__super__.constructor.apply(this, arguments);
    }

    SubstituteLine.extend();

    SubstituteLine.prototype.target = 'MoveToRelativeLine';

    return SubstituteLine;

  })(Change);

  ChangeToLastCharacterOfLine = (function(_super) {
    __extends(ChangeToLastCharacterOfLine, _super);

    function ChangeToLastCharacterOfLine() {
      return ChangeToLastCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    ChangeToLastCharacterOfLine.extend();

    ChangeToLastCharacterOfLine.prototype.target = 'MoveToLastCharacterOfLine';

    ChangeToLastCharacterOfLine.prototype.execute = function() {
      if (this.isMode('visual', 'blockwise')) {
        swrap.setReversedState(this.editor, false);
      }
      return ChangeToLastCharacterOfLine.__super__.execute.apply(this, arguments);
    };

    return ChangeToLastCharacterOfLine;

  })(Change);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9vcGVyYXRvci1pbnNlcnQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJzQkFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFFQSxPQUdJLE9BQUEsQ0FBUSxTQUFSLENBSEosRUFDRSxzQkFBQSxjQURGLEVBQ2tCLHVCQUFBLGVBRGxCLEVBRUUscUNBQUEsNkJBSkYsQ0FBQTs7QUFBQSxFQU1BLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVIsQ0FOUixDQUFBOztBQUFBLEVBT0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBUFgsQ0FBQTs7QUFBQSxFQVFBLFFBQUEsR0FBVyxPQUFBLENBQVEsUUFBUixDQUFpQixDQUFDLFFBQWxCLENBQTJCLFVBQTNCLENBUlgsQ0FBQTs7QUFBQSxFQVlNO0FBQ0oseUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsa0JBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLGlDQUNBLGFBQUEsR0FBZSxLQURmLENBQUE7O0FBQUEsaUNBRUEsV0FBQSxHQUFhLEtBRmIsQ0FBQTs7QUFBQSxpQ0FHQSxVQUFBLEdBQVksSUFIWixDQUFBOztBQUFBLGlDQUlBLFlBQUEsR0FBYyxJQUpkLENBQUE7O0FBQUEsaUNBS0EscUJBQUEsR0FBdUIsSUFMdkIsQ0FBQTs7QUFBQSxpQ0FPQSx5QkFBQSxHQUEyQixTQUFBLEdBQUE7QUFDekIsVUFBQSxVQUFBO2FBQUEsVUFBQSxHQUFhLElBQUMsQ0FBQSxRQUFRLENBQUMsV0FBVyxDQUFDLHlCQUF0QixDQUFnRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxJQUFELEdB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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/operator-insert.coffee
