(function() {
  var Base, CreatePersistentSelection, Decrease, DecrementNumber, Delete, DeleteLeft, DeleteLine, DeleteOccurrenceInAFunctionOrInnerParagraph, DeleteRight, DeleteToLastCharacterOfLine, Disposable, Increase, IncrementNumber, LineEndingRegExp, Mark, Operator, Point, PutAfter, PutAfterAndSelect, PutBefore, PutBeforeAndSelect, Range, Select, SelectLatestChange, SelectOccurrence, SelectOccurrenceInAFunctionOrInnerParagraph, SelectPersistentSelection, SelectPreviousSelection, TogglePersistentSelection, TogglePresetOccurrence, Yank, YankLine, YankToLastCharacterOfLine, cursorIsAtEmptyRow, debug, destroyNonLastSelection, getValidVimBufferRow, getVisibleBufferRange, getWordPatternAtBufferPosition, haveSomeNonEmptySelection, highlightRanges, inspect, isEndsWithNewLineForBufferRow, selectedRange, selectedText, settings, swrap, toString, _, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  LineEndingRegExp = /(?:\n|\r\n)$/;

  _ = require('underscore-plus');

  _ref = require('atom'), Point = _ref.Point, Range = _ref.Range, Disposable = _ref.Disposable;

  inspect = require('util').inspect;

  _ref1 = require('./utils'), haveSomeNonEmptySelection = _ref1.haveSomeNonEmptySelection, highlightRanges = _ref1.highlightRanges, isEndsWithNewLineForBufferRow = _ref1.isEndsWithNewLineForBufferRow, getValidVimBufferRow = _ref1.getValidVimBufferRow, cursorIsAtEmptyRow = _ref1.cursorIsAtEmptyRow, getVisibleBufferRange = _ref1.getVisibleBufferRange, getWordPatternAtBufferPosition = _ref1.getWordPatternAtBufferPosition, destroyNonLastSelection = _ref1.destroyNonLastSelection, selectedRange = _ref1.selectedRange, selectedText = _ref1.selectedText, toString = _ref1.toString, debug = _ref1.debug;

  swrap = require('./selection-wrapper');

  settings = require('./settings');

  Base = require('./base');

  Operator = (function(_super) {
    __extends(Operator, _super);

    Operator.extend(false);

    Operator.prototype.requireTarget = true;

    Operator.prototype.recordable = true;

    Operator.prototype.wise = null;

    Operator.prototype.occurrence = false;

    Operator.prototype.patternForOccurrence = null;

    Operator.prototype.stayOnLinewise = false;

    Operator.prototype.stayAtSamePosition = null;

    Operator.prototype.clipToMutationEndOnStay = true;

    Operator.prototype.useMarkerForStay = false;

    Operator.prototype.restorePositions = true;

    Operator.prototype.restorePositionsToMutationEnd = false;

    Operator.prototype.flashTarget = true;

    Operator.prototype.trackChange = false;

    Operator.prototype.acceptPresetOccurrence = true;

    Operator.prototype.acceptPersistentSelection = true;

    Operator.prototype.needStay = function() {
      return this.stayAtSamePosition != null ? this.stayAtSamePosition : this.stayAtSamePosition = (function(_this) {
        return function() {
          var param, _base;
          param = _this.getStayParam();
          if (_this.isMode('visual', 'linewise')) {
            return settings.get(param);
          } else {
            return settings.get(param) || (_this.stayOnLinewise && (typeof (_base = _this.target).isLinewise === "function" ? _base.isLinewise() : void 0));
          }
        };
      })(this)();
    };

    Operator.prototype.getStayParam = function() {
      switch (false) {
        case !this["instanceof"]('Increase'):
          return 'stayOnIncrease';
        case !this["instanceof"]('TransformString'):
          return 'stayOnTransformString';
        case !this["instanceof"]('Delete'):
          return 'stayOnDelete';
        default:
          return "stayOn" + (this.getName());
      }
    };

    Operator.prototype.isOccurrence = function() {
      return this.occurrence;
    };

    Operator.prototype.setMarkForChange = function(range) {
      return this.vimState.mark.setRange('[', ']', range);
    };

    Operator.prototype.needFlash = function() {
      var _ref2;
      if (this.flashTarget && !this.isMode('visual')) {
        return settings.get('flashOnOperate') && (_ref2 = this.getName(), __indexOf.call(settings.get('flashOnOperateBlacklist'), _ref2) < 0);
      }
    };

    Operator.prototype.flashIfNecessary = function(ranges) {
      if (!this.needFlash()) {
        return;
      }
      return highlightRanges(this.editor, ranges, {
        "class": 'vim-mode-plus-flash',
        timeout: settings.get('flashOnOperateDuration')
      });
    };

    Operator.prototype.flashChangeIfNecessary = function() {
      if (!this.needFlash()) {
        return;
      }
      return this.onDidFinishOperation((function(_this) {
        return function() {
          var ranges;
          ranges = _this.mutationManager.getMarkerBufferRanges().filter(function(range) {
            return !range.isEmpty();
          });
          if (ranges.length) {
            return _this.flashIfNecessary(ranges);
          }
        };
      })(this));
    };

    Operator.prototype.trackChangeIfNecessary = function() {
      if (!this.trackChange) {
        return;
      }
      return this.onDidFinishOperation((function(_this) {
        return function() {
          var marker, _ref2;
          if (marker = (_ref2 = _this.mutationManager.getMutationForSelection(_this.editor.getLastSelection())) != null ? _ref2.marker : void 0) {
            return _this.setMarkForChange(marker.getBufferRange());
          }
        };
      })(this));
    };

    function Operator() {
      var implicitTarget, _ref2;
      Operator.__super__.constructor.apply(this, arguments);
      _ref2 = this.vimState, this.mutationManager = _ref2.mutationManager, this.occurrenceManager = _ref2.occurrenceManager, this.persistentSelection = _ref2.persistentSelection;
      this.initialize();
      this.onDidSetOperatorModifier((function(_this) {
        return function(_arg) {
          var occurrence, wise;
          occurrence = _arg.occurrence, wise = _arg.wise;
          if (wise != null) {
            _this.wise = wise;
          }
          if (occurrence != null) {
            return _this.setOccurrence('modifier');
          }
        };
      })(this));
      if (implicitTarget = this.getImplicitTarget()) {
        if (this.target == null) {
          this.target = implicitTarget;
        }
      }
      if (_.isString(this.target)) {
        this.setTarget(this["new"](this.target));
      }
      if (this.occurrence) {
        this.setOccurrence('static');
      } else if (this.acceptPresetOccurrence && this.occurrenceManager.hasPatterns()) {
        this.setOccurrence('preset');
      }
      if (this.acceptPersistentSelection) {
        this.subscribe(this.onDidDeactivateMode((function(_this) {
          return function(_arg) {
            var mode;
            mode = _arg.mode;
            if (mode === 'operator-pending') {
              return _this.occurrenceManager.resetPatterns();
            }
          };
        })(this)));
      }
    }

    Operator.prototype.getImplicitTarget = function() {
      if (this.canSelectPersistentSelection()) {
        this.destroyUnknownSelection = true;
        if (this.isMode('visual')) {
          return "ACurrentSelectionAndAPersistentSelection";
        } else {
          return "APersistentSelection";
        }
      } else {
        if (this.isMode('visual')) {
          return "CurrentSelection";
        }
      }
    };

    Operator.prototype.canSelectPersistentSelection = function() {
      return this.acceptPersistentSelection && this.vimState.hasPersistentSelections() && settings.get('autoSelectPersistentSelectionOnOperate');
    };

    Operator.prototype.setOccurrence = function(type) {
      this.occurrence = true;
      switch (type) {
        case 'static':
          if (!this.isComplete()) {
            debug('static: mark as we enter operator-pending');
            if (!this.occurrenceManager.hasMarkers()) {
              return this.addOccurrencePattern();
            }
          }
          break;
        case 'preset':
          return debug('preset: nothing to do since we have markers already');
        case 'modifier':
          debug('modifier: overwrite existing marker when manually typed `o`');
          this.occurrenceManager.resetPatterns();
          return this.addOccurrencePattern();
      }
    };

    Operator.prototype.addOccurrencePattern = function(pattern) {
      var point;
      if (pattern == null) {
        pattern = null;
      }
      if (pattern == null) {
        pattern = this.patternForOccurrence;
      }
      if (pattern == null) {
        point = this.getCursorBufferPosition();
        pattern = getWordPatternAtBufferPosition(this.editor, point, {
          singleNonWordChar: true
        });
      }
      return this.occurrenceManager.addPattern(pattern);
    };

    Operator.prototype.setTarget = function(target) {
      this.target = target;
      this.target.setOperator(this);
      this.emitDidSetTarget(this);
      return this;
    };

    Operator.prototype.setTextToRegisterForSelection = function(selection) {
      return this.setTextToRegister(selection.getText(), selection);
    };

    Operator.prototype.setTextToRegister = function(text, selection) {
      var _base;
      if ((typeof (_base = this.target).isLinewise === "function" ? _base.isLinewise() : void 0) && (!text.endsWith('\n'))) {
        text += "\n";
      }
      if (text) {
        return this.vimState.register.set({
          text: text,
          selection: selection
        });
      }
    };

    Operator.prototype.execute = function() {
      var canMutate, stopMutation;
      canMutate = true;
      stopMutation = function() {
        return canMutate = false;
      };
      if (this.selectTarget()) {
        this.editor.transact((function(_this) {
          return function() {
            var selection, _i, _len, _ref2, _results;
            _ref2 = _this.editor.getSelections();
            _results = [];
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              selection = _ref2[_i];
              if (canMutate) {
                _results.push(_this.mutateSelection(selection, stopMutation));
              }
            }
            return _results;
          };
        })(this));
        this.restoreCursorPositionsIfNecessary();
      }
      return this.activateMode('normal');
    };

    Operator.prototype.selectOccurrence = function() {
      var ranges, selectedRanges;
      if (!this.occurrenceManager.hasMarkers()) {
        this.addOccurrencePattern();
      }
      if (this.patternForOccurrence == null) {
        this.patternForOccurrence = this.occurrenceManager.buildPattern();
      }
      selectedRanges = this.editor.getSelectedBufferRanges();
      ranges = this.occurrenceManager.getMarkerRangesIntersectsWithRanges(selectedRanges, this.isMode('visual'));
      if (ranges.length) {
        if (this.isMode('visual')) {
          this.vimState.modeManager.deactivate();
        }
        this.editor.setSelectedBufferRanges(ranges);
      } else {
        this.mutationManager.restoreInitialPositions();
      }
      return this.occurrenceManager.resetPatterns();
    };

    Operator.prototype.selectTarget = function() {
      var options;
      options = {
        isSelect: this["instanceof"]('Select'),
        useMarker: this.useMarkerForStay
      };
      this.mutationManager.init(options);
      this.mutationManager.setCheckPoint('will-select');
      if (this.wise && this.target.isMotion()) {
        this.target.forceWise(this.wise);
      }
      this.emitWillSelectTarget();
      if (this.isOccurrence() && !this.occurrenceManager.hasMarkers()) {
        this.addOccurrencePattern();
      }
      this.target.select();
      if (this.isOccurrence()) {
        this.selectOccurrence();
      }
      if (haveSomeNonEmptySelection(this.editor) || this.target.getName() === "Empty") {
        this.mutationManager.setCheckPoint('did-select');
        this.emitDidSelectTarget();
        this.flashChangeIfNecessary();
        this.trackChangeIfNecessary();
        return true;
      } else {
        return false;
      }
    };

    Operator.prototype.restoreCursorPositionsIfNecessary = function() {
      var options, _ref2;
      if (!this.restorePositions) {
        return;
      }
      options = {
        stay: this.needStay(),
        strict: this.isOccurrence() || this.destroyUnknownSelection,
        clipToMutationEnd: this.clipToMutationEndOnStay,
        isBlockwise: (_ref2 = this.target) != null ? typeof _ref2.isBlockwise === "function" ? _ref2.isBlockwise() : void 0 : void 0,
        mutationEnd: this.restorePositionsToMutationEnd
      };
      this.mutationManager.restoreCursorPositions(options);
      return this.emitDidRestoreCursorPositions();
    };

    return Operator;

  })(Base);

  Select = (function(_super) {
    __extends(Select, _super);

    function Select() {
      return Select.__super__.constructor.apply(this, arguments);
    }

    Select.extend(false);

    Select.prototype.flashTarget = false;

    Select.prototype.recordable = false;

    Select.prototype.acceptPresetOccurrence = false;

    Select.prototype.acceptPersistentSelection = false;

    Select.prototype.canChangeMode = function() {
      var _base;
      if (this.isMode('visual')) {
        return this.isOccurrence() || (typeof (_base = this.target).isAllowSubmodeChange === "function" ? _base.isAllowSubmodeChange() : void 0);
      } else {
        return true;
      }
    };

    Select.prototype.execute = function() {
      var submode;
      this.selectTarget();
      if (this.canChangeMode()) {
        submode = swrap.detectVisualModeSubmode(this.editor);
        return this.activateModeIfNecessary('visual', submode);
      }
    };

    return Select;

  })(Operator);

  SelectLatestChange = (function(_super) {
    __extends(SelectLatestChange, _super);

    function SelectLatestChange() {
      return SelectLatestChange.__super__.constructor.apply(this, arguments);
    }

    SelectLatestChange.extend();

    SelectLatestChange.description = "Select latest yanked or changed range";

    SelectLatestChange.prototype.target = 'ALatestChange';

    return SelectLatestChange;

  })(Select);

  SelectPreviousSelection = (function(_super) {
    __extends(SelectPreviousSelection, _super);

    function SelectPreviousSelection() {
      return SelectPreviousSelection.__super__.constructor.apply(this, arguments);
    }

    SelectPreviousSelection.extend();

    SelectPreviousSelection.prototype.target = "PreviousSelection";

    SelectPreviousSelection.prototype.execute = function() {
      this.selectTarget();
      if (this.target.submode != null) {
        return this.activateModeIfNecessary('visual', this.target.submode);
      }
    };

    return SelectPreviousSelection;

  })(Select);

  SelectPersistentSelection = (function(_super) {
    __extends(SelectPersistentSelection, _super);

    function SelectPersistentSelection() {
      return SelectPersistentSelection.__super__.constructor.apply(this, arguments);
    }

    SelectPersistentSelection.extend();

    SelectPersistentSelection.description = "Select persistent-selection and clear all persistent-selection, it's like convert to real-selection";

    SelectPersistentSelection.prototype.target = "APersistentSelection";

    return SelectPersistentSelection;

  })(Select);

  SelectOccurrence = (function(_super) {
    __extends(SelectOccurrence, _super);

    function SelectOccurrence() {
      return SelectOccurrence.__super__.constructor.apply(this, arguments);
    }

    SelectOccurrence.extend();

    SelectOccurrence.description = "Add selection onto each matching word within target range";

    SelectOccurrence.prototype.occurrence = true;

    SelectOccurrence.prototype.initialize = function() {
      SelectOccurrence.__super__.initialize.apply(this, arguments);
      return this.onDidSelectTarget((function(_this) {
        return function() {
          return swrap.clearProperties(_this.editor);
        };
      })(this));
    };

    SelectOccurrence.prototype.execute = function() {
      var submode;
      if (this.selectTarget()) {
        submode = swrap.detectVisualModeSubmode(this.editor);
        return this.activateModeIfNecessary('visual', submode);
      }
    };

    return SelectOccurrence;

  })(Operator);

  SelectOccurrenceInAFunctionOrInnerParagraph = (function(_super) {
    __extends(SelectOccurrenceInAFunctionOrInnerParagraph, _super);

    function SelectOccurrenceInAFunctionOrInnerParagraph() {
      return SelectOccurrenceInAFunctionOrInnerParagraph.__super__.constructor.apply(this, arguments);
    }

    SelectOccurrenceInAFunctionOrInnerParagraph.extend();

    SelectOccurrenceInAFunctionOrInnerParagraph.prototype.target = "AFunctionOrInnerParagraph";

    return SelectOccurrenceInAFunctionOrInnerParagraph;

  })(SelectOccurrence);

  CreatePersistentSelection = (function(_super) {
    __extends(CreatePersistentSelection, _super);

    function CreatePersistentSelection() {
      return CreatePersistentSelection.__super__.constructor.apply(this, arguments);
    }

    CreatePersistentSelection.extend();

    CreatePersistentSelection.prototype.flashTarget = false;

    CreatePersistentSelection.prototype.stayAtSamePosition = true;

    CreatePersistentSelection.prototype.acceptPresetOccurrence = false;

    CreatePersistentSelection.prototype.acceptPersistentSelection = false;

    CreatePersistentSelection.prototype.mutateSelection = function(selection) {
      return this.persistentSelection.markBufferRange(selection.getBufferRange());
    };

    CreatePersistentSelection.prototype.execute = function() {
      this.onDidFinishOperation((function(_this) {
        return function() {
          return destroyNonLastSelection(_this.editor);
        };
      })(this));
      return CreatePersistentSelection.__super__.execute.apply(this, arguments);
    };

    return CreatePersistentSelection;

  })(Operator);

  TogglePersistentSelection = (function(_super) {
    __extends(TogglePersistentSelection, _super);

    function TogglePersistentSelection() {
      return TogglePersistentSelection.__super__.constructor.apply(this, arguments);
    }

    TogglePersistentSelection.extend();

    TogglePersistentSelection.prototype.isComplete = function() {
      var point;
      point = this.editor.getCursorBufferPosition();
      if (this.markerToRemove = this.persistentSelection.getMarkerAtPoint(point)) {
        return true;
      } else {
        return TogglePersistentSelection.__super__.isComplete.apply(this, arguments);
      }
    };

    TogglePersistentSelection.prototype.execute = function() {
      if (this.markerToRemove) {
        return this.markerToRemove.destroy();
      } else {
        return TogglePersistentSelection.__super__.execute.apply(this, arguments);
      }
    };

    return TogglePersistentSelection;

  })(CreatePersistentSelection);

  TogglePresetOccurrence = (function(_super) {
    __extends(TogglePresetOccurrence, _super);

    function TogglePresetOccurrence() {
      return TogglePresetOccurrence.__super__.constructor.apply(this, arguments);
    }

    TogglePresetOccurrence.extend();

    TogglePresetOccurrence.prototype.flashTarget = false;

    TogglePresetOccurrence.prototype.requireTarget = false;

    TogglePresetOccurrence.prototype.stayAtSamePosition = true;

    TogglePresetOccurrence.prototype.acceptPresetOccurrence = false;

    TogglePresetOccurrence.prototype.execute = function() {
      var isNarrowed, marker, pattern, text;
      this.occurrenceManager = this.vimState.occurrenceManager;
      if (marker = this.occurrenceManager.getMarkerAtPoint(this.editor.getCursorBufferPosition())) {
        return marker.destroy();
      } else {
        pattern = null;
        isNarrowed = this.vimState.modeManager.isNarrowed();
        if (this.isMode('visual') && !isNarrowed) {
          text = this.editor.getSelectedText();
          pattern = new RegExp(_.escapeRegExp(text), 'g');
        }
        this.addOccurrencePattern(pattern);
        if (!isNarrowed) {
          return this.activateMode('normal');
        }
      }
    };

    return TogglePresetOccurrence;

  })(Operator);

  Delete = (function(_super) {
    __extends(Delete, _super);

    function Delete() {
      this.mutateSelection = __bind(this.mutateSelection, this);
      return Delete.__super__.constructor.apply(this, arguments);
    }

    Delete.extend();

    Delete.prototype.hover = {
      icon: ':delete:',
      emoji: ':scissors:'
    };

    Delete.prototype.trackChange = true;

    Delete.prototype.flashTarget = false;

    Delete.prototype.execute = function() {
      this.onDidSelectTarget((function(_this) {
        return function() {
          if (_this.target.isLinewise()) {
            return _this.requestAdjustCursorPositions();
          }
        };
      })(this));
      return Delete.__super__.execute.apply(this, arguments);
    };

    Delete.prototype.mutateSelection = function(selection) {
      this.setTextToRegisterForSelection(selection);
      return selection.deleteSelectedText();
    };

    Delete.prototype.requestAdjustCursorPositions = function() {
      return this.onDidRestoreCursorPositions((function(_this) {
        return function() {
          var cursor, _i, _len, _ref2, _results;
          _ref2 = _this.editor.getCursors();
          _results = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            cursor = _ref2[_i];
            _results.push(_this.adjustCursor(cursor));
          }
          return _results;
        };
      })(this));
    };

    Delete.prototype.adjustCursor = function(cursor) {
      var point, row;
      row = getValidVimBufferRow(this.editor, cursor.getBufferRow());
      if (this.needStay()) {
        point = this.mutationManager.getInitialPointForSelection(cursor.selection);
        return cursor.setBufferPosition([row, point.column]);
      } else {
        cursor.setBufferPosition([row, 0]);
        return cursor.skipLeadingWhitespace();
      }
    };

    return Delete;

  })(Operator);

  DeleteRight = (function(_super) {
    __extends(DeleteRight, _super);

    function DeleteRight() {
      return DeleteRight.__super__.constructor.apply(this, arguments);
    }

    DeleteRight.extend();

    DeleteRight.prototype.target = 'MoveRight';

    DeleteRight.prototype.hover = null;

    return DeleteRight;

  })(Delete);

  DeleteLeft = (function(_super) {
    __extends(DeleteLeft, _super);

    function DeleteLeft() {
      return DeleteLeft.__super__.constructor.apply(this, arguments);
    }

    DeleteLeft.extend();

    DeleteLeft.prototype.target = 'MoveLeft';

    return DeleteLeft;

  })(Delete);

  DeleteToLastCharacterOfLine = (function(_super) {
    __extends(DeleteToLastCharacterOfLine, _super);

    function DeleteToLastCharacterOfLine() {
      return DeleteToLastCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    DeleteToLastCharacterOfLine.extend();

    DeleteToLastCharacterOfLine.prototype.target = 'MoveToLastCharacterOfLine';

    DeleteToLastCharacterOfLine.prototype.execute = function() {
      if (this.isMode('visual', 'blockwise')) {
        swrap.setReversedState(this.editor, false);
      }
      return DeleteToLastCharacterOfLine.__super__.execute.apply(this, arguments);
    };

    return DeleteToLastCharacterOfLine;

  })(Delete);

  DeleteLine = (function(_super) {
    __extends(DeleteLine, _super);

    function DeleteLine() {
      return DeleteLine.__super__.constructor.apply(this, arguments);
    }

    DeleteLine.extend();

    DeleteLine.commandScope = 'atom-text-editor.vim-mode-plus.visual-mode';

    DeleteLine.prototype.wise = 'linewise';

    return DeleteLine;

  })(Delete);

  DeleteOccurrenceInAFunctionOrInnerParagraph = (function(_super) {
    __extends(DeleteOccurrenceInAFunctionOrInnerParagraph, _super);

    function DeleteOccurrenceInAFunctionOrInnerParagraph() {
      return DeleteOccurrenceInAFunctionOrInnerParagraph.__super__.constructor.apply(this, arguments);
    }

    DeleteOccurrenceInAFunctionOrInnerParagraph.extend();

    DeleteOccurrenceInAFunctionOrInnerParagraph.prototype.occurrence = true;

    DeleteOccurrenceInAFunctionOrInnerParagraph.prototype.target = "AFunctionOrInnerParagraph";

    return DeleteOccurrenceInAFunctionOrInnerParagraph;

  })(Delete);

  Yank = (function(_super) {
    __extends(Yank, _super);

    function Yank() {
      return Yank.__super__.constructor.apply(this, arguments);
    }

    Yank.extend();

    Yank.prototype.hover = {
      icon: ':yank:',
      emoji: ':clipboard:'
    };

    Yank.prototype.trackChange = true;

    Yank.prototype.stayOnLinewise = true;

    Yank.prototype.clipToMutationEndOnStay = false;

    Yank.prototype.mutateSelection = function(selection) {
      return this.setTextToRegisterForSelection(selection);
    };

    return Yank;

  })(Operator);

  YankLine = (function(_super) {
    __extends(YankLine, _super);

    function YankLine() {
      return YankLine.__super__.constructor.apply(this, arguments);
    }

    YankLine.extend();

    YankLine.prototype.wise = 'linewise';

    YankLine.prototype.initialize = function() {
      YankLine.__super__.initialize.apply(this, arguments);
      if (this.isMode('normal')) {
        this.target = 'MoveToRelativeLine';
      }
      if (this.isMode('visual', 'characterwise')) {
        return this.stayOnLinewise = false;
      }
    };

    return YankLine;

  })(Yank);

  YankToLastCharacterOfLine = (function(_super) {
    __extends(YankToLastCharacterOfLine, _super);

    function YankToLastCharacterOfLine() {
      return YankToLastCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    YankToLastCharacterOfLine.extend();

    YankToLastCharacterOfLine.prototype.target = 'MoveToLastCharacterOfLine';

    return YankToLastCharacterOfLine;

  })(Yank);

  Increase = (function(_super) {
    __extends(Increase, _super);

    function Increase() {
      return Increase.__super__.constructor.apply(this, arguments);
    }

    Increase.extend();

    Increase.prototype.requireTarget = false;

    Increase.prototype.step = 1;

    Increase.prototype.execute = function() {
      var newRanges, pattern;
      pattern = RegExp("" + (settings.get('numberRegex')), "g");
      newRanges = [];
      this.editor.transact((function(_this) {
        return function() {
          var cursor, ranges, scanRange, _i, _len, _ref2, _results;
          _ref2 = _this.editor.getCursors();
          _results = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            cursor = _ref2[_i];
            scanRange = _this.isMode('visual') ? cursor.selection.getBufferRange() : cursor.getCurrentLineBufferRange();
            ranges = _this.increaseNumber(cursor, scanRange, pattern);
            if (!_this.isMode('visual') && ranges.length) {
              cursor.setBufferPosition(ranges[0].end.translate([0, -1]));
            }
            _results.push(newRanges.push(ranges));
          }
          return _results;
        };
      })(this));
      if ((newRanges = _.flatten(newRanges)).length) {
        return this.flashIfNecessary(newRanges);
      } else {
        return atom.beep();
      }
    };

    Increase.prototype.increaseNumber = function(cursor, scanRange, pattern) {
      var newRanges;
      newRanges = [];
      this.editor.scanInBufferRange(pattern, scanRange, (function(_this) {
        return function(_arg) {
          var matchText, newText, range, replace, stop;
          matchText = _arg.matchText, range = _arg.range, stop = _arg.stop, replace = _arg.replace;
          newText = String(parseInt(matchText, 10) + _this.step * _this.getCount());
          if (_this.isMode('visual')) {
            return newRanges.push(replace(newText));
          } else {
            if (!range.end.isGreaterThan(cursor.getBufferPosition())) {
              return;
            }
            newRanges.push(replace(newText));
            return stop();
          }
        };
      })(this));
      return newRanges;
    };

    return Increase;

  })(Operator);

  Decrease = (function(_super) {
    __extends(Decrease, _super);

    function Decrease() {
      return Decrease.__super__.constructor.apply(this, arguments);
    }

    Decrease.extend();

    Decrease.prototype.step = -1;

    return Decrease;

  })(Increase);

  IncrementNumber = (function(_super) {
    __extends(IncrementNumber, _super);

    function IncrementNumber() {
      return IncrementNumber.__super__.constructor.apply(this, arguments);
    }

    IncrementNumber.extend();

    IncrementNumber.prototype.displayName = 'Increment ++';

    IncrementNumber.prototype.step = 1;

    IncrementNumber.prototype.baseNumber = null;

    IncrementNumber.prototype.execute = function() {
      var newRanges, pattern, selection, _i, _len, _ref2;
      pattern = RegExp("" + (settings.get('numberRegex')), "g");
      newRanges = null;
      this.selectTarget();
      this.editor.transact((function(_this) {
        return function() {
          var selection;
          return newRanges = (function() {
            var _i, _len, _ref2, _results;
            _ref2 = this.editor.getSelectionsOrderedByBufferPosition();
            _results = [];
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              selection = _ref2[_i];
              _results.push(this.replaceNumber(selection.getBufferRange(), pattern));
            }
            return _results;
          }).call(_this);
        };
      })(this));
      if ((newRanges = _.flatten(newRanges)).length) {
        this.flashIfNecessary(newRanges);
      } else {
        atom.beep();
      }
      _ref2 = this.editor.getSelections();
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        selection = _ref2[_i];
        selection.cursor.setBufferPosition(selection.getBufferRange().start);
      }
      return this.activateModeIfNecessary('normal');
    };

    IncrementNumber.prototype.replaceNumber = function(scanRange, pattern) {
      var newRanges;
      newRanges = [];
      this.editor.scanInBufferRange(pattern, scanRange, (function(_this) {
        return function(_arg) {
          var matchText, replace;
          matchText = _arg.matchText, replace = _arg.replace;
          return newRanges.push(replace(_this.getNewText(matchText)));
        };
      })(this));
      return newRanges;
    };

    IncrementNumber.prototype.getNewText = function(text) {
      this.baseNumber = this.baseNumber != null ? this.baseNumber + this.step * this.getCount() : parseInt(text, 10);
      return String(this.baseNumber);
    };

    return IncrementNumber;

  })(Operator);

  DecrementNumber = (function(_super) {
    __extends(DecrementNumber, _super);

    function DecrementNumber() {
      return DecrementNumber.__super__.constructor.apply(this, arguments);
    }

    DecrementNumber.extend();

    DecrementNumber.prototype.displayName = 'Decrement --';

    DecrementNumber.prototype.step = -1;

    return DecrementNumber;

  })(IncrementNumber);

  PutBefore = (function(_super) {
    __extends(PutBefore, _super);

    function PutBefore() {
      return PutBefore.__super__.constructor.apply(this, arguments);
    }

    PutBefore.extend();

    PutBefore.prototype.restorePositions = false;

    PutBefore.prototype.location = 'before';

    PutBefore.prototype.initialize = function() {
      if (this.isMode('normal')) {
        return this.target = 'Empty';
      }
    };

    PutBefore.prototype.mutateSelection = function(selection) {
      var linewise, text, type, _ref2;
      _ref2 = this.vimState.register.get(null, selection), text = _ref2.text, type = _ref2.type;
      if (!text) {
        return;
      }
      text = _.multiplyString(text, this.getCount());
      linewise = (type === 'linewise') || this.isMode('visual', 'linewise');
      return this.paste(selection, text, {
        linewise: linewise,
        selectPastedText: this.selectPastedText
      });
    };

    PutBefore.prototype.paste = function(selection, text, _arg) {
      var adjustCursor, cursor, linewise, newRange, selectPastedText;
      linewise = _arg.linewise, selectPastedText = _arg.selectPastedText;
      cursor = selection.cursor;
      if (linewise) {
        newRange = this.pasteLinewise(selection, text);
        adjustCursor = function(range) {
          cursor.setBufferPosition(range.start);
          return cursor.moveToFirstCharacterOfLine();
        };
      } else {
        newRange = this.pasteCharacterwise(selection, text);
        adjustCursor = function(range) {
          return cursor.setBufferPosition(range.end.translate([0, -1]));
        };
      }
      this.setMarkForChange(newRange);
      if (selectPastedText) {
        return selection.setBufferRange(newRange);
      } else {
        return adjustCursor(newRange);
      }
    };

    PutBefore.prototype.pasteLinewise = function(selection, text) {
      var cursor, end, range, row;
      cursor = selection.cursor;
      if (!text.endsWith("\n")) {
        text += "\n";
      }
      if (selection.isEmpty()) {
        row = cursor.getBufferRow();
        switch (this.location) {
          case 'before':
            range = [[row, 0], [row, 0]];
            break;
          case 'after':
            if (!isEndsWithNewLineForBufferRow(this.editor, row)) {
              text = text.replace(LineEndingRegExp, '');
            }
            cursor.moveToEndOfLine();
            end = selection.insertText("\n").end;
            range = this.editor.bufferRangeForBufferRow(end.row, {
              includeNewline: true
            });
        }
        return this.editor.setTextInBufferRange(range, text);
      } else {
        if (this.isMode('visual', 'linewise')) {
          if (selection.getBufferRange().end.column !== 0) {
            text = text.replace(LineEndingRegExp, '');
          }
        } else {
          selection.insertText("\n");
        }
        return selection.insertText(text);
      }
    };

    PutBefore.prototype.pasteCharacterwise = function(selection, text) {
      if (this.location === 'after' && selection.isEmpty() && !cursorIsAtEmptyRow(selection.cursor)) {
        selection.cursor.moveRight();
      }
      return selection.insertText(text);
    };

    return PutBefore;

  })(Operator);

  PutAfter = (function(_super) {
    __extends(PutAfter, _super);

    function PutAfter() {
      return PutAfter.__super__.constructor.apply(this, arguments);
    }

    PutAfter.extend();

    PutAfter.prototype.location = 'after';

    return PutAfter;

  })(PutBefore);

  PutBeforeAndSelect = (function(_super) {
    __extends(PutBeforeAndSelect, _super);

    function PutBeforeAndSelect() {
      return PutBeforeAndSelect.__super__.constructor.apply(this, arguments);
    }

    PutBeforeAndSelect.extend();

    PutBeforeAndSelect.description = "Paste before then select";

    PutBeforeAndSelect.prototype.selectPastedText = true;

    PutBeforeAndSelect.prototype.activateMode = function() {
      var submode;
      submode = swrap.detectVisualModeSubmode(this.editor);
      if (!this.vimState.isMode('visual', submode)) {
        return PutBeforeAndSelect.__super__.activateMode.call(this, 'visual', submode);
      }
    };

    return PutBeforeAndSelect;

  })(PutBefore);

  PutAfterAndSelect = (function(_super) {
    __extends(PutAfterAndSelect, _super);

    function PutAfterAndSelect() {
      return PutAfterAndSelect.__super__.constructor.apply(this, arguments);
    }

    PutAfterAndSelect.extend();

    PutAfterAndSelect.description = "Paste after then select";

    PutAfterAndSelect.prototype.location = 'after';

    return PutAfterAndSelect;

  })(PutBeforeAndSelect);

  Mark = (function(_super) {
    __extends(Mark, _super);

    function Mark() {
      return Mark.__super__.constructor.apply(this, arguments);
    }

    Mark.extend();

    Mark.prototype.requireInput = true;

    Mark.prototype.requireTarget = false;

    Mark.prototype.initialize = function() {
      return this.focusInput();
    };

    Mark.prototype.execute = function() {
      return this.vimState.mark.set(this.input, this.editor.getCursorBufferPosition());
    };

    return Mark;

  })(Operator);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9vcGVyYXRvci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsODBCQUFBO0lBQUE7OztzRkFBQTs7QUFBQSxFQUFBLGdCQUFBLEdBQW1CLGNBQW5CLENBQUE7O0FBQUEsRUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBREosQ0FBQTs7QUFBQSxFQUVBLE9BQTZCLE9BQUEsQ0FBUSxNQUFSLENBQTdCLEVBQUMsYUFBQSxLQUFELEVBQVEsYUFBQSxLQUFSLEVBQWUsa0JBQUEsVUFGZixDQUFBOztBQUFBLEVBSUMsVUFBVyxPQUFBLENBQVEsTUFBUixFQUFYLE9BSkQsQ0FBQTs7QUFBQSxFQUtBLFFBY0ksT0FBQSxDQUFRLFNBQVIsQ0FkSixFQUNFLGtDQUFBLHlCQURGLEVBRUUsd0JBQUEsZUFGRixFQUdFLHNDQUFBLDZCQUhGLEVBSUUsNkJBQUEsb0JBSkYsRUFLRSwyQkFBQSxrQkFMRixFQU1FLDhCQUFBLHFCQU5GLEVBT0UsdUNBQUEsOEJBUEYsRUFRRSxnQ0FBQSx1QkFSRixFQVVFLHNCQUFBLGFBVkYsRUFXRSxxQkFBQSxZQVhGLEVBWUUsaUJBQUEsUUFaRixFQWFFLGNBQUEsS0FsQkYsQ0FBQTs7QUFBQSxFQW9CQSxLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSLENBcEJSLENBQUE7O0FBQUEsRUFxQkEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBckJYLENBQUE7O0FBQUEsRUFzQkEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSLENBdEJQLENBQUE7O0FBQUEsRUF3Qk07QUFDSiwrQkFBQSxDQUFBOztBQUFBLElBQUEsUUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSLENBQUEsQ0FBQTs7QUFBQSx1QkFDQSxhQUFBLEdBQWUs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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/operator.coffee
