(function() {
  var Base, CreatePersistentSelection, CursorPositionManager, Decrease, DecrementNumber, Delete, DeleteLeft, DeleteLine, DeleteOccurrenceInAFunctionOrInnerParagraph, DeleteRight, DeleteToLastCharacterOfLine, Disposable, Increase, IncrementNumber, LineEndingRegExp, Operator, Point, PutAfter, PutAfterAndSelect, PutBefore, PutBeforeAndSelect, Range, Select, SelectLatestChange, SelectOccurrence, SelectOccurrenceInAFunctionOrInnerParagraph, SelectPersistentSelection, SelectPreviousSelection, TogglePersistentSelection, TogglePresetOccurrence, Yank, YankLine, YankToLastCharacterOfLine, cursorIsAtEmptyRow, debug, destroyNonLastSelection, getValidVimBufferRow, getVisibleBufferRange, getWordPatternAtBufferPosition, haveSomeSelection, highlightRanges, inspect, isEndsWithNewLineForBufferRow, scanInRanges, selectedRange, selectedText, settings, swrap, toString, _, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  LineEndingRegExp = /(?:\n|\r\n)$/;

  _ = require('underscore-plus');

  _ref = require('atom'), Point = _ref.Point, Range = _ref.Range, Disposable = _ref.Disposable;

  inspect = require('util').inspect;

  _ref1 = require('./utils'), haveSomeSelection = _ref1.haveSomeSelection, highlightRanges = _ref1.highlightRanges, isEndsWithNewLineForBufferRow = _ref1.isEndsWithNewLineForBufferRow, getValidVimBufferRow = _ref1.getValidVimBufferRow, cursorIsAtEmptyRow = _ref1.cursorIsAtEmptyRow, scanInRanges = _ref1.scanInRanges, getVisibleBufferRange = _ref1.getVisibleBufferRange, getWordPatternAtBufferPosition = _ref1.getWordPatternAtBufferPosition, destroyNonLastSelection = _ref1.destroyNonLastSelection, selectedRange = _ref1.selectedRange, selectedText = _ref1.selectedText, toString = _ref1.toString, debug = _ref1.debug;

  swrap = require('./selection-wrapper');

  settings = require('./settings');

  Base = require('./base');

  CursorPositionManager = require('./cursor-position-manager');

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
          ranges = _this.mutationTracker.getMarkerBufferRanges().filter(function(range) {
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
          if (marker = (_ref2 = _this.mutationTracker.getMutationForSelection(_this.editor.getLastSelection())) != null ? _ref2.marker : void 0) {
            return _this.setMarkForChange(marker.getBufferRange());
          }
        };
      })(this));
    };

    function Operator() {
      var implicitTarget, _ref2;
      Operator.__super__.constructor.apply(this, arguments);
      _ref2 = this.vimState, this.mutationTracker = _ref2.mutationTracker, this.occurrenceManager = _ref2.occurrenceManager, this.persistentSelection = _ref2.persistentSelection;
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

    Operator.prototype.forceTargetWise = function() {
      switch (this.wise) {
        case 'characterwise':
          if (this.target.linewise) {
            this.target.linewise = false;
            return this.target.inclusive = false;
          } else {
            return this.target.inclusive = !this.target.inclusive;
          }
          break;
        case 'linewise':
          return this.target.linewise = true;
      }
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
      if (ranges = this.occurrenceManager.getMarkerRangesIntersectsWithRanges(selectedRanges, this.isMode('visual'))) {
        if (this.isMode('visual')) {
          this.vimState.modeManager.deactivate();
        }
        this.editor.setSelectedBufferRanges(ranges);
      } else {
        this.mutationTracker.restoreInitialPositions();
      }
      return this.occurrenceManager.resetPatterns();
    };

    Operator.prototype.selectTarget = function() {
      var isExplicitEmptyTarget, options;
      options = {
        isSelect: this["instanceof"]('Select'),
        useMarker: this.useMarkerForStay
      };
      this.mutationTracker.init(options);
      this.mutationTracker.setCheckPoint('will-select');
      if (this.wise) {
        this.forceTargetWise();
      }
      this.emitWillSelectTarget();
      if (this.isOccurrence() && !this.occurrenceManager.hasMarkers()) {
        this.addOccurrencePattern();
      }
      this.target.select();
      if (this.isOccurrence()) {
        this.selectOccurrence();
      }
      isExplicitEmptyTarget = this.target.getName() === "Empty";
      if (haveSomeSelection(this.editor) || isExplicitEmptyTarget) {
        this.mutationTracker.setCheckPoint('did-select');
        this.emitDidSelectTarget();
        this.flashChangeIfNecessary();
        this.trackChangeIfNecessary();
      }
      return haveSomeSelection(this.editor) || isExplicitEmptyTarget;
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
      this.mutationTracker.restoreCursorPositions(options);
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
        point = this.mutationTracker.getInitialPointForSelection(cursor.selection);
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
        return this.target = "Empty";
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

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9vcGVyYXRvci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEscTJCQUFBO0lBQUE7OztzRkFBQTs7QUFBQSxFQUFBLGdCQUFBLEdBQW1CLGNBQW5CLENBQUE7O0FBQUEsRUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBREosQ0FBQTs7QUFBQSxFQUVBLE9BQTZCLE9BQUEsQ0FBUSxNQUFSLENBQTdCLEVBQUMsYUFBQSxLQUFELEVBQVEsYUFBQSxLQUFSLEVBQWUsa0JBQUEsVUFGZixDQUFBOztBQUFBLEVBSUMsVUFBVyxPQUFBLENBQVEsTUFBUixFQUFYLE9BSkQsQ0FBQTs7QUFBQSxFQUtBLFFBZUksT0FBQSxDQUFRLFNBQVIsQ0FmSixFQUNFLDBCQUFBLGlCQURGLEVBRUUsd0JBQUEsZUFGRixFQUdFLHNDQUFBLDZCQUhGLEVBSUUsNkJBQUEsb0JBSkYsRUFLRSwyQkFBQSxrQkFMRixFQU1FLHFCQUFBLFlBTkYsRUFPRSw4QkFBQSxxQkFQRixFQVFFLHVDQUFBLDhCQVJGLEVBU0UsZ0NBQUEsdUJBVEYsRUFXRSxzQkFBQSxhQVhGLEVBWUUscUJBQUEsWUFaRixFQWFFLGlCQUFBLFFBYkYsRUFjRSxjQUFBLEtBbkJGLENBQUE7O0FBQUEsRUFxQkEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUixDQXJCUixDQUFBOztBQUFBLEVBc0JBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQXRCWCxDQUFBOztBQUFBLEVBdUJBLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUixDQXZCUCxDQUFBOztBQUFBLEVBd0JBLHFCQUFBLEdBQXdCLE9BQUEsQ0FBUSwyQkFBUixDQXhCeEIsQ0FBQTs7QUFBQSxFQTBCTTtBQUNKLCtCQUFBLENBQUE7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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/operator.coffee
