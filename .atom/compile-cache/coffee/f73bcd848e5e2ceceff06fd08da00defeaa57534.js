(function() {
  var ActivateInsertMode, ActivateReplaceMode, Change, ChangeOccurrence, ChangeOccurrenceInAFunctionOrInnerParagraph, ChangeOccurrenceInAPersistentSelection, ChangeToLastCharacterOfLine, InsertAboveWithNewline, InsertAfter, InsertAfterEndOfLine, InsertAtBeginningOfLine, InsertAtEndOfInnerSmartWord, InsertAtEndOfTarget, InsertAtHeadOfTarget, InsertAtLastInsert, InsertAtNextFoldStart, InsertAtPreviousFoldStart, InsertAtStartOfInnerSmartWord, InsertAtStartOfTarget, InsertAtTailOfTarget, InsertBelowWithNewline, InsertByTarget, Operator, Substitute, SubstituteLine, moveCursorLeft, moveCursorRight, settings, swrap, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  _ref = require('./utils'), moveCursorLeft = _ref.moveCursorLeft, moveCursorRight = _ref.moveCursorRight;

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
          var change, mode, textByUserInput;
          mode = _arg.mode;
          if (mode !== 'insert') {
            return;
          }
          disposable.dispose();
          _this.vimState.mark.set('^', _this.editor.getCursorBufferPosition());
          textByUserInput = '';
          if (change = _this.getChangeSinceCheckpoint('insert')) {
            _this.lastChange = change;
            _this.vimState.mark.set('[', change.start);
            _this.vimState.mark.set(']', change.start.traverse(change.newExtent));
            textByUserInput = change.newText;
          }
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

    ActivateInsertMode.prototype.getChangeSinceCheckpoint = function(purpose) {
      var checkpoint;
      checkpoint = this.getCheckpoint(purpose);
      return this.editor.buffer.getChangesSinceCheckpoint(checkpoint)[0];
    };

    ActivateInsertMode.prototype.replayLastChange = function(selection) {
      var deletionEnd, deletionStart, newExtent, newText, oldExtent, start, traversalToStartOfDelete, _ref1;
      if (this.lastChange != null) {
        _ref1 = this.lastChange, start = _ref1.start, newExtent = _ref1.newExtent, oldExtent = _ref1.oldExtent, newText = _ref1.newText;
        if (!oldExtent.isZero()) {
          traversalToStartOfDelete = start.traversalFrom(this.topCursorPositionAtInsertionStart);
          deletionStart = selection.cursor.getBufferPosition().traverse(traversalToStartOfDelete);
          deletionEnd = deletionStart.traverse(oldExtent);
          selection.setBufferRange([deletionStart, deletionEnd]);
        }
      } else {
        newText = '';
      }
      return selection.insertText(newText, {
        autoIndent: true
      });
    };

    ActivateInsertMode.prototype.repeatInsert = function(selection, text) {
      return this.replayLastChange(selection);
    };

    ActivateInsertMode.prototype.getInsertionCount = function() {
      if (this.insertionCount == null) {
        this.insertionCount = this.supportInsertionCount ? this.getCount() - 1 : 0;
      }
      return this.insertionCount;
    };

    ActivateInsertMode.prototype.execute = function() {
      var topCursor, _ref1, _ref2;
      if (this.isRepeated()) {
        if (!this["instanceof"]('Change')) {
          this.flashTarget = this.trackChange = true;
          this.emitDidSelectTarget();
        }
        this.editor.transact((function(_this) {
          return function() {
            var selection, _i, _len, _ref1, _ref2, _ref3, _results;
            _ref1 = _this.editor.getSelections();
            _results = [];
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              selection = _ref1[_i];
              _this.repeatInsert(selection, (_ref2 = (_ref3 = _this.lastChange) != null ? _ref3.newText : void 0) != null ? _ref2 : '');
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
          this.textByOperator = (_ref1 = (_ref2 = this.getChangeSinceCheckpoint('undo')) != null ? _ref2.newText : void 0) != null ? _ref1 : '';
        }
        this.setCheckpoint('insert');
        topCursor = this.editor.getCursorsOrderedByBufferPosition()[0];
        this.topCursorPositionAtInsertionStart = topCursor.getBufferPosition();
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9vcGVyYXRvci1pbnNlcnQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBtQkFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFFQSxPQUVJLE9BQUEsQ0FBUSxTQUFSLENBRkosRUFDRSxzQkFBQSxjQURGLEVBQ2tCLHVCQUFBLGVBSGxCLENBQUE7O0FBQUEsRUFLQSxLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSLENBTFIsQ0FBQTs7QUFBQSxFQU1BLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQU5YLENBQUE7O0FBQUEsRUFPQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFFBQVIsQ0FBaUIsQ0FBQyxRQUFsQixDQUEyQixVQUEzQixDQVBYLENBQUE7O0FBQUEsRUFXTTtBQUNKLHlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGtCQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxpQ0FDQSxhQUFBLEdBQWUsS0FEZixDQUFBOztBQUFBLGlDQUVBLFdBQUEsR0FBYSxLQUZiLENBQUE7O0FBQUEsaUNBR0EsVUFBQSxHQUFZLElBSFosQ0FBQTs7QUFBQSxpQ0FJQSxZQUFBLEdBQWMsSUFKZCxDQUFBOztBQUFBLGlDQUtBLHFCQUFBLEdBQXVCLElBTHZCLENBQUE7O0FBQUEsaUNBT0EseUJBQUEsR0FBMkIsU0FBQSxHQUFBO0FBQ3pCLFVBQUEsVUFBQTthQUFBLFVBQUEsR0FBYSxJQUFDLENBQUEsUUFBUSxDQUFDLFdBQVcsQ0FBQyx5QkFBdEIsQ0FBZ0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsSUFBRCxHQUFBO0FBQzNELGNBQUEsNkJBQUE7QUFBQSxVQUQ2RCxPQUFELEtBQUMsSUFDN0QsQ0FBQTtBQUFBLFVBQUEsSUFBYyxJQUFBLEtBQVEsUUFBdEI7QUFBQSxrQkFBQSxDQUFBO1dBQUE7QUFBQSxVQUNBLFVBQVUsQ0FBQyxPQUFYLENBQUEsQ0FEQSxDQUFBO0FBQUEsVUFHQSxLQUFDLENBQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFmLENBQW1CLEdBQW5CLEVBQXdCLEtBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBQSxDQUF4QixDQUhBLENBQUE7QUFBQSxVQUlBLGVBQUEsR0FBa0IsRUFKbEIsQ0FBQTtBQUtBLFVBQUEsSUFBRyxNQUFBLEdBQVMsS0FBQyxDQUFBLHdCQUFELENBQTBCLFFBQTFCLENBQVo7QUFDRSxZQUFBLEtBQUMsQ0FBQSxVQUFELEdBQWMsTUFBZCxDQUFBO0FBQUEsWUFDQSxLQUFDLENBQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFmLENBQW1CLEdBQW5CLEVBQXdCLE1BQU0sQ0FBQyxLQUEvQixDQURBLENBQUE7QUFBQSxZQUVBLEtBQUMsQ0FBQSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQWYsQ0FBbUIsR0FBbkIsRUFBd0IsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFiLENBQXNCLE1BQU0sQ0FBQyxTQUE3QixDQUF4QixDQUZBLENBQUE7QUFBQSxZQUdBLGVBQUEsR0FBa0IsTUFBTSxDQUFDLE9BSHpCLENBREY7V0FMQTtBQUFBLFVBVUEsS0FBQyxDQUFBLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBbkIsQ0FBdUIsR0FBdkIsRUFBNEI7QUFBQSxZQUFBLElBQUEsRUFBTSxlQUFOO1dBQTVCLENBVkEsQ0FBQTtBQUFBLFVBWUEsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxLQUFDLENBQUEsaUJBQUQsQ0FBQSxDQUFSLEVBQThCLFNBQUEsR0FBQTtBQUM1QixnQkFBQSwwQ0FBQTtBQUFBLFlBQUEsSUFBQSxHQUFPLEtBQUMsQ0FBQSxjQUFELEdBQWtCLGVBQXpCLENBQUE7QUFDQTtBQUFBO2lCQUFBLDRDQUFBO29DQUFBO0FBQ0UsNEJBQUEsU0FBUyxDQUFDLFVBQVYsQ0FBcUIsSUFBckIsRUFBMkI7QUFBQSxnQkFBQSxVQUFBLEVBQVksSUFBWjtlQUEzQixFQUFBLENBREY7QUFBQTs0QkFGNEI7VUFBQSxDQUE5QixDQVpBLENBQUE7QUFrQkEsVUFBQSxJQUFHLFFBQVEsQ0FBQyxHQUFULENBQWEsbUNBQWIsQ0FBSDttQkFDRSxLQUFDLENBQUEsTUFBTSxDQUFDLDJCQUFSLENBQW9DLEtBQUMsQ0FBQSxhQUFELENBQWUsTUFBZixDQUFwQyxFQURGO1dBbkIyRDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhELEVBRFk7SUFBQSxDQVAzQixDQUFBOztBQUFBLGlDQThCQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSxvREFBQSxTQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxFQURkLENBQUE7QUFFQSxNQUFBLElBQUEsQ0FBQSxJQUErQixDQUFBLFVBQUQsQ0FBQSxDQUE5QjtBQUFBLFFBQUEsSUFBQyxDQUFBLGFBQUQsQ0FBZSxNQUFmLENBQUEsQ0FBQTtPQUZBO2FBR0EsSUFBQyxDQUFBLHlCQUFELENBQUEsRUFKVTtJQUFBLENBOUJaLENBQUE7O0FBQUEsaUNBdUNBLGFBQUEsR0FBZSxTQUFDLE9BQUQsR0FBQTthQUNiLElBQUMsQ0FBQSxVQUFXLENBQUEsT0FBQSxDQUFaLEdBQXVCLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBQSxFQURWO0lBQUEsQ0F2Q2YsQ0FBQTs7QUFBQSxpQ0EwQ0EsYUFBQSxHQUFlLFNBQUMsT0FBRCxHQUFBO2FBQ2IsSUFBQyxDQUFBLFVBQVcsQ0FBQSxPQUFBLEVBREM7SUFBQSxDQTFDZixDQUFBOztBQUFBLGlDQXFEQSx3QkFBQSxHQUEwQixTQUFDLE9BQUQsR0FBQTtBQUN4QixVQUFBLFVBQUE7QUFBQSxNQUFBLFVBQUEsR0FBYSxJQUFDLENBQUEsYUFBRCxDQUFlLE9BQWYsQ0FBYixDQUFBO2FBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMseUJBQWYsQ0FBeUMsVUFBekMsQ0FBcUQsQ0FBQSxDQUFBLEVBRjdCO0lBQUEsQ0FyRDFCLENBQUE7O0FBQUEsaUNBOERBLGdCQUFBLEdBQWtCLFNBQUMsU0FBRCxHQUFBO0FBQ2hCLFVBQUEsaUdBQUE7QUFBQSxNQUFBLElBQUcsdUJBQUg7QUFDRSxRQUFBLFFBQXlDLElBQUMsQ0FBQSxVQUExQyxFQUFDLGNBQUEsS0FBRCxFQUFRLGtCQUFBLFNBQVIsRUFBbUIsa0JBQUEsU0FBbkIsRUFBOEIsZ0JBQUEsT0FBOUIsQ0FBQTtBQUNBLFFBQUEsSUFBQSxDQUFBLFNBQWdCLENBQUMsTUFBVixDQUFBLENBQVA7QUFDRSxVQUFBLHdCQUFBLEdBQTJCLEtBQUssQ0FBQyxhQUFOLENBQW9CLElBQUMsQ0FBQSxpQ0FBckIsQ0FBM0IsQ0FBQTtBQUFBLFVBQ0EsYUFBQSxHQUFnQixTQUFTLENBQUMsTUFBTSxDQUFDLGlCQUFqQixDQUFBLENBQW9DLENBQUMsUUFBckMsQ0FBOEMsd0JBQTlDLENBRGhCLENBQUE7QUFBQSxVQUVBLFdBQUEsR0FBYyxhQUFhLENBQUMsUUFBZCxDQUF1QixTQUF2QixDQUZkLENBQUE7QUFBQSxVQUdBLFNBQVMsQ0FBQyxjQUFWLENBQXlCLENBQUMsYUFBRCxFQUFnQixXQUFoQixDQUF6QixDQUhBLENBREY7U0FGRjtPQUFBLE1BQUE7QUFRRSxRQUFBLE9BQUEsR0FBVSxFQUFWLENBUkY7T0FBQTthQVNBLFNBQVMsQ0FBQyxVQUFWLENBQXFCLE9BQXJCLEVBQThCO0FBQUEsUUFBQSxVQUFBLEVBQVksSUFBWjtPQUE5QixFQVZnQjtJQUFBLENBOURsQixDQUFBOztBQUFBLGlDQTRFQSxZQUFBLEdBQWMsU0FBQyxTQUFELEVBQVksSUFBWixHQUFBO2FBQ1osSUFBQyxDQUFBLGdCQUFELENBQWtCLFNBQWxCLEVBRFk7SUFBQSxDQTVFZCxDQUFBOztBQUFBLGlDQStFQSxpQkFBQSxHQUFtQixTQUFBLEdBQUE7O1FBQ2pCLElBQUMsQ0FBQSxpQkFBcUIsSUFBQyxDQUFBLHFCQUFKLEdBQWdDLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBQSxHQUFjLENBQTlDLEdBQXNEO09BQXpFO2FBQ0EsSUFBQyxDQUFBLGVBRmdCO0lBQUEsQ0EvRW5CLENBQUE7O0FBQUEsaUNBbUZBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLHVCQUFBO0FBQUEsTUFBQSxJQUFHLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBSDtBQUNFLFFBQUEsSUFBQSxDQUFBLElBQVEsQ0FBQSxZQUFBLENBQUQsQ0FBWSxRQUFaLENBQVA7QUFDRSxVQUFBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUE5QixDQUFBO0FBQUEsVUFDQSxJQUFDLENBQUEsbUJBQUQsQ0FBQSxDQURBLENBREY7U0FBQTtBQUFBLFFBR0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQWlCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO0FBQ2YsZ0JBQUEsa0RBQUE7QUFBQTtBQUFBO2lCQUFBLDRDQUFBO29DQUFBO0FBQ0UsY0FBQSxLQUFDLENBQUEsWUFBRCxDQUFjLFNBQWQsMEZBQWdELEVBQWhELENBQUEsQ0FBQTtBQUFBLDRCQUNBLGNBQUEsQ0FBZSxTQUFTLENBQUMsTUFBekIsRUFEQSxDQURGO0FBQUE7NEJBRGU7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQixDQUhBLENBQUE7QUFRQSxRQUFBLElBQUcsUUFBUSxDQUFDLEdBQVQsQ0FBYSx3Q0FBYixDQUFIO2lCQUNFLElBQUMsQ0FBQSxNQUFNLENBQUMsZUFBUixDQUFBLEVBREY7U0FURjtPQUFBLE1BQUE7QUFhRSxRQUFBLElBQUcsSUFBQyxDQUFBLGlCQUFELENBQUEsQ0FBQSxHQUF1QixDQUExQjtBQUNFLFVBQUEsSUFBQyxDQUFBLGNBQUQsZ0hBQStELEVBQS9ELENBREY7U0FBQTtBQUFBLFFBRUEsSUFBQyxDQUFBLGFBQUQsQ0FBZSxRQUFmLENBRkEsQ0FBQTtBQUFBLFFBR0EsU0FBQSxHQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsaUNBQVIsQ0FBQSxDQUE0QyxDQUFBLENBQUEsQ0FIeEQsQ0FBQTtBQUFBLFFBSUEsSUFBQyxDQUFBLGlDQUFELEdBQXFDLFNBQVMsQ0FBQyxpQkFBVixDQUFBLENBSnJDLENBQUE7ZUFLQSxJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVYsQ0FBbUIsUUFBbkIsRUFBNkIsSUFBQyxDQUFBLFlBQTlCLEVBbEJGO09BRE87SUFBQSxDQW5GVCxDQUFBOzs4QkFBQTs7S0FEK0IsU0FYakMsQ0FBQTs7QUFBQSxFQW9ITTtBQUNKLDBDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLG1CQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxrQ0FDQSxZQUFBLEdBQWMsU0FEZCxDQUFBOztBQUFBLGtDQUdBLFlBQUEsR0FBYyxTQUFDLFNBQUQsRUFBWSxJQUFaLEdBQUE7QUFDWixVQUFBLGNBQUE7QUFBQSxXQUFBLDJDQUFBO3dCQUFBO2NBQXVCLElBQUEsS0FBVTs7U0FDL0I7QUFBQSxRQUFBLElBQVMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxhQUFqQixDQUFBLENBQVQ7QUFBQSxnQkFBQTtTQUFBO0FBQUEsUUFDQSxTQUFTLENBQUMsV0FBVixDQUFBLENBREEsQ0FERjtBQUFBLE9BQUE7YUFHQSxTQUFTLENBQUMsVUFBVixDQUFxQixJQUFyQixFQUEyQjtBQUFBLFFBQUEsVUFBQSxFQUFZLEtBQVo7T0FBM0IsRUFKWTtJQUFBLENBSGQsQ0FBQTs7K0JBQUE7O0tBRGdDLG1CQXBIbEMsQ0FBQTs7QUFBQSxFQThITTtBQUNKLGtDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFdBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLDBCQUNBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLHVCQUFBO0FBQUE7QUFBQSxXQUFBLDRDQUFBOzJCQUFBO0FBQUEsUUFBQSxlQUFBLENBQWdCLE1BQWhCLENBQUEsQ0FBQTtBQUFBLE9BQUE7YUFDQSwwQ0FBQSxTQUFBLEVBRk87SUFBQSxDQURULENBQUE7O3VCQUFBOztLQUR3QixtQkE5SDFCLENBQUE7O0FBQUEsRUFvSU07QUFDSiwyQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxvQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsbUNBQ0EsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLE1BQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxlQUFSLENBQUEsQ0FBQSxDQUFBO2FBQ0EsbURBQUEsU0FBQSxFQUZPO0lBQUEsQ0FEVCxDQUFBOztnQ0FBQTs7S0FEaUMsbUJBcEluQyxDQUFBOztBQUFBLEVBMElNO0FBQ0osOENBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsdUJBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLHNDQUNBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxNQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMscUJBQVIsQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsMEJBQVIsQ0FBQSxDQURBLENBQUE7YUFFQSxzREFBQSxTQUFBLEVBSE87SUFBQSxDQURULENBQUE7O21DQUFBOztLQURvQyxtQkExSXRDLENBQUE7O0FBQUEsRUFpSk07QUFDSix5Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxrQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsaUNBQ0EsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLFVBQUEsS0FBQTtBQUFBLE1BQUEsSUFBRyxDQUFDLEtBQUEsR0FBUSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFmLENBQW1CLEdBQW5CLENBQVQsQ0FBSDtBQUNFLFFBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFnQyxLQUFoQyxDQUFBLENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsc0JBQVIsQ0FBK0I7QUFBQSxVQUFDLE1BQUEsRUFBUSxJQUFUO1NBQS9CLENBREEsQ0FERjtPQUFBO2FBR0EsaURBQUEsU0FBQSxFQUpPO0lBQUEsQ0FEVCxDQUFBOzs4QkFBQTs7S0FEK0IsbUJBakpqQyxDQUFBOztBQUFBLEVBeUpNO0FBQ0osNkNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsc0JBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLHFDQUNBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxNQUFBLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBQSxDQUFBO2FBQ0EscURBQUEsU0FBQSxFQUZPO0lBQUEsQ0FEVCxDQUFBOztBQUFBLHFDQUtBLGFBQUEsR0FBZSxTQUFBLEdBQUE7YUFDYixJQUFDLENBQUEsTUFBTSxDQUFDLGtCQUFSLENBQUEsRUFEYTtJQUFBLENBTGYsQ0FBQTs7QUFBQSxxQ0FRQSxZQUFBLEdBQWMsU0FBQyxTQUFELEVBQVksSUFBWixHQUFBO2FBQ1osU0FBUyxDQUFDLFVBQVYsQ0FBcUIsSUFBSSxDQUFDLFFBQUwsQ0FBQSxDQUFyQixFQUFzQztBQUFBLFFBQUEsVUFBQSxFQUFZLElBQVo7T0FBdEMsRUFEWTtJQUFBLENBUmQsQ0FBQTs7a0NBQUE7O0tBRG1DLG1CQXpKckMsQ0FBQTs7QUFBQSxFQXFLTTtBQUNKLDZDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLHNCQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxxQ0FDQSxhQUFBLEdBQWUsU0FBQSxHQUFBO2FBQ2IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxrQkFBUixDQUFBLEVBRGE7SUFBQSxDQURmLENBQUE7O2tDQUFBOztLQURtQyx1QkFyS3JDLENBQUE7O0FBQUEsRUE0S007QUFDSixxQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxjQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUFBLDZCQUNBLGFBQUEsR0FBZSxJQURmLENBQUE7O0FBQUEsNkJBRUEsS0FBQSxHQUFPLElBRlAsQ0FBQTs7QUFBQSw2QkFHQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsVUFBQSwwQkFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFlBQUQsQ0FBQSxDQUFBLENBQUE7QUFDQTtBQUFBLFdBQUEsNENBQUE7OEJBQUE7QUFDRSxRQUFBLEtBQUEsQ0FBTSxTQUFOLENBQWdCLENBQUMsbUJBQWpCLENBQXFDLElBQUMsQ0FBQSxLQUF0QyxDQUFBLENBREY7QUFBQSxPQURBO2FBR0EsNkNBQUEsU0FBQSxFQUpPO0lBQUEsQ0FIVCxDQUFBOzswQkFBQTs7S0FEMkIsbUJBNUs3QixDQUFBOztBQUFBLEVBc0xNO0FBQ0osNENBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEscUJBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLG9DQUNBLEtBQUEsR0FBTyxPQURQLENBQUE7O2lDQUFBOztLQURrQyxlQXRMcEMsQ0FBQTs7QUFBQSxFQTBMTTtBQUNKLDBDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLG1CQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxrQ0FDQSxLQUFBLEdBQU8sS0FEUCxDQUFBOzsrQkFBQTs7S0FEZ0MsZUExTGxDLENBQUE7O0FBQUEsRUE4TE07QUFDSixvREFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSw2QkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsNENBQ0EsS0FBQSxHQUFPLE9BRFAsQ0FBQTs7QUFBQSw0Q0FFQSxNQUFBLEdBQVEsZ0JBRlIsQ0FBQTs7eUNBQUE7O0tBRDBDLGVBOUw1QyxDQUFBOztBQUFBLEVBbU1NO0FBQ0osa0RBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsMkJBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLDBDQUNBLEtBQUEsR0FBTyxLQURQLENBQUE7O0FBQUEsMENBRUEsTUFBQSxHQUFRLGdCQUZSLENBQUE7O3VDQUFBOztLQUR3QyxlQW5NMUMsQ0FBQTs7QUFBQSxFQXdNTTtBQUNKLDJDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLG9CQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxtQ0FDQSxLQUFBLEdBQU8sTUFEUCxDQUFBOztnQ0FBQTs7S0FEaUMsZUF4TW5DLENBQUE7O0FBQUEsRUE0TU07QUFDSiwyQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxvQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsbUNBQ0EsS0FBQSxHQUFPLE1BRFAsQ0FBQTs7Z0NBQUE7O0tBRGlDLGVBNU1uQyxDQUFBOztBQUFBLEVBZ05NO0FBQ0osZ0RBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEseUJBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLElBQ0EseUJBQUMsQ0FBQSxXQUFELEdBQWMsb0RBRGQsQ0FBQTs7QUFBQSx3Q0FFQSxNQUFBLEdBQVEseUJBRlIsQ0FBQTs7cUNBQUE7O0tBRHNDLHFCQWhOeEMsQ0FBQTs7QUFBQSxFQXFOTTtBQUNKLDRDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLHFCQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxJQUNBLHFCQUFDLENBQUEsV0FBRCxHQUFjLGdEQURkLENBQUE7O0FBQUEsb0NBRUEsTUFBQSxHQUFRLHFCQUZSLENBQUE7O2lDQUFBOztLQURrQyxxQkFyTnBDLENBQUE7O0FBQUEsRUEyTk07QUFDSiw2QkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxNQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxxQkFDQSxhQUFBLEdBQWUsSUFEZixDQUFBOztBQUFBLHFCQUVBLFdBQUEsR0FBYSxJQUZiLENBQUE7O0FBQUEscUJBR0EscUJBQUEsR0FBdUIsS0FIdkIsQ0FBQTs7QUFBQSxxQkFLQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsVUFBQSxxQkFBQTtBQUFBLE1BQUEsSUFBRyxJQUFDLENBQUEsVUFBRCxDQUFBLENBQUg7QUFDRSxRQUFBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBZixDQURGO09BQUE7QUFBQSxNQUdBLFFBQUEsR0FBVyxJQUFDLENBQUEsWUFBRCxDQUFBLENBSFgsQ0FBQTtBQUlBLE1BQUEsSUFBRyxJQUFDLENBQUEsWUFBRCxDQUFBLENBQUEsSUFBb0IsQ0FBQSxRQUF2QjtBQUNFLFFBQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxRQUFWLENBQW1CLFFBQW5CLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FGRjtPQUpBO0FBQUEsTUFRQSxJQUFBLEdBQU8sRUFSUCxDQUFBO0FBU0EsTUFBQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFBLENBQUEsSUFBMEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQUEsQ0FBN0I7QUFDRSxRQUFBLElBQWdCLEtBQUssQ0FBQyx1QkFBTixDQUE4QixJQUFDLENBQUEsTUFBL0IsQ0FBQSxLQUEwQyxVQUExRDtBQUFBLFVBQUEsSUFBQSxHQUFPLElBQVAsQ0FBQTtTQURGO09BQUEsTUFBQTtBQUdFLFFBQUEsa0VBQXNCLENBQUMscUJBQXZCO0FBQUEsVUFBQSxJQUFBLEdBQU8sSUFBUCxDQUFBO1NBSEY7T0FUQTtBQUFBLE1BY0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQWlCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDZixjQUFBLDJDQUFBO0FBQUE7QUFBQTtlQUFBLDRDQUFBO2tDQUFBO0FBQ0UsWUFBQSxLQUFDLENBQUEsNkJBQUQsQ0FBK0IsU0FBL0IsQ0FBQSxDQUFBO0FBQUEsWUFDQSxLQUFBLEdBQVEsU0FBUyxDQUFDLFVBQVYsQ0FBcUIsSUFBckIsRUFBMkI7QUFBQSxjQUFBLFVBQUEsRUFBWSxJQUFaO2FBQTNCLENBRFIsQ0FBQTtBQUVBLFlBQUEsSUFBQSxDQUFBLEtBQXdDLENBQUMsT0FBTixDQUFBLENBQW5DOzRCQUFBLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBakIsQ0FBQSxHQUFBO2FBQUEsTUFBQTtvQ0FBQTthQUhGO0FBQUE7MEJBRGU7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQixDQWRBLENBQUE7YUFxQkEscUNBQUEsU0FBQSxFQXRCTztJQUFBLENBTFQsQ0FBQTs7a0JBQUE7O0tBRG1CLG1CQTNOckIsQ0FBQTs7QUFBQSxFQXlQTTtBQUNKLHVDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGdCQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxJQUNBLGdCQUFDLENBQUEsV0FBRCxHQUFjLDhDQURkLENBQUE7O0FBQUEsK0JBRUEsVUFBQSxHQUFZLElBRlosQ0FBQTs7NEJBQUE7O0tBRDZCLE9BelAvQixDQUFBOztBQUFBLEVBOFBNO0FBQ0osa0VBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsMkNBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLDBEQUNBLE1BQUEsR0FBUSwyQkFEUixDQUFBOzt1REFBQTs7S0FEd0QsaUJBOVAxRCxDQUFBOztBQUFBLEVBa1FNO0FBQ0osNkRBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsc0NBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLHFEQUNBLE1BQUEsR0FBUSxzQkFEUixDQUFBOztrREFBQTs7S0FEbUQsaUJBbFFyRCxDQUFBOztBQUFBLEVBc1FNO0FBQ0osaUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsVUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEseUJBQ0EsTUFBQSxHQUFRLFdBRFIsQ0FBQTs7c0JBQUE7O0tBRHVCLE9BdFF6QixDQUFBOztBQUFBLEVBMFFNO0FBQ0oscUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsY0FBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsNkJBQ0EsTUFBQSxHQUFRLG9CQURSLENBQUE7OzBCQUFBOztLQUQyQixPQTFRN0IsQ0FBQTs7QUFBQSxFQThRTTtBQUNKLGtEQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLDJCQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSwwQ0FDQSxNQUFBLEdBQVEsMkJBRFIsQ0FBQTs7QUFBQSwwQ0FHQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBRVAsTUFBQSxJQUFHLElBQUMsQ0FBQSxNQUFELENBQVEsUUFBUixFQUFrQixXQUFsQixDQUFIO0FBQ0UsUUFBQSxLQUFLLENBQUMsZ0JBQU4sQ0FBdUIsSUFBQyxDQUFBLE1BQXhCLEVBQWdDLEtBQWhDLENBQUEsQ0FERjtPQUFBO2FBRUEsMERBQUEsU0FBQSxFQUpPO0lBQUEsQ0FIVCxDQUFBOzt1Q0FBQTs7S0FEd0MsT0E5UTFDLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/operator-insert.coffee
