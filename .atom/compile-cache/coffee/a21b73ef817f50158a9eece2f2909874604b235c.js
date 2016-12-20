(function() {
  var AutoIndent, Base, BufferedProcess, CamelCase, ChangeOrder, ChangeSurround, ChangeSurroundAnyPair, ChangeSurroundAnyPairAllowForwarding, CompactSpaces, ConvertToHardTab, ConvertToSoftTab, DashCase, DecodeUriComponent, DeleteSurround, DeleteSurroundAnyPair, DeleteSurroundAnyPairAllowForwarding, EncodeUriComponent, Indent, Join, JoinByInput, JoinByInputWithKeepingSpace, JoinWithKeepingSpace, LineEndingRegExp, LowerCase, MapSurround, Operator, Outdent, PascalCase, Range, Replace, ReplaceWithRegister, Reverse, SnakeCase, Sort, SplitByCharacter, SplitString, Surround, SurroundSmartWord, SurroundWord, SwapWithRegister, TitleCase, ToggleCase, ToggleCaseAndMoveRight, ToggleLineComments, TransformSmartWordBySelectList, TransformString, TransformStringByExternalCommand, TransformStringBySelectList, TransformWordBySelectList, TrimString, UpperCase, haveSomeNonEmptySelection, isSingleLine, selectListItems, settings, swrap, transformerRegistry, _, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __modulo = function(a, b) { return (+a % (b = +b) + b) % b; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  LineEndingRegExp = /(?:\n|\r\n)$/;

  _ = require('underscore-plus');

  _ref = require('atom'), BufferedProcess = _ref.BufferedProcess, Range = _ref.Range;

  _ref1 = require('./utils'), haveSomeNonEmptySelection = _ref1.haveSomeNonEmptySelection, isSingleLine = _ref1.isSingleLine;

  swrap = require('./selection-wrapper');

  settings = require('./settings');

  Base = require('./base');

  Operator = Base.getClass('Operator');

  transformerRegistry = [];

  TransformString = (function(_super) {
    __extends(TransformString, _super);

    function TransformString() {
      return TransformString.__super__.constructor.apply(this, arguments);
    }

    TransformString.extend(false);

    TransformString.prototype.trackChange = true;

    TransformString.prototype.stayOnLinewise = true;

    TransformString.prototype.autoIndent = false;

    TransformString.registerToSelectList = function() {
      return transformerRegistry.push(this);
    };

    TransformString.prototype.mutateSelection = function(selection, stopMutation) {
      var text;
      if (text = this.getNewText(selection.getText(), selection, stopMutation)) {
        return selection.insertText(text, {
          autoIndent: this.autoIndent
        });
      }
    };

    return TransformString;

  })(Operator);

  ToggleCase = (function(_super) {
    __extends(ToggleCase, _super);

    function ToggleCase() {
      return ToggleCase.__super__.constructor.apply(this, arguments);
    }

    ToggleCase.extend();

    ToggleCase.registerToSelectList();

    ToggleCase.description = "`Hello World` -> `hELLO wORLD`";

    ToggleCase.prototype.displayName = 'Toggle ~';

    ToggleCase.prototype.hover = {
      icon: ':toggle-case:',
      emoji: ':clap:'
    };

    ToggleCase.prototype.toggleCase = function(char) {
      var charLower;
      charLower = char.toLowerCase();
      if (charLower === char) {
        return char.toUpperCase();
      } else {
        return charLower;
      }
    };

    ToggleCase.prototype.getNewText = function(text) {
      return text.replace(/./g, this.toggleCase.bind(this));
    };

    return ToggleCase;

  })(TransformString);

  ToggleCaseAndMoveRight = (function(_super) {
    __extends(ToggleCaseAndMoveRight, _super);

    function ToggleCaseAndMoveRight() {
      return ToggleCaseAndMoveRight.__super__.constructor.apply(this, arguments);
    }

    ToggleCaseAndMoveRight.extend();

    ToggleCaseAndMoveRight.prototype.hover = null;

    ToggleCaseAndMoveRight.prototype.flashTarget = false;

    ToggleCaseAndMoveRight.prototype.restorePositions = false;

    ToggleCaseAndMoveRight.prototype.target = 'MoveRight';

    return ToggleCaseAndMoveRight;

  })(ToggleCase);

  UpperCase = (function(_super) {
    __extends(UpperCase, _super);

    function UpperCase() {
      return UpperCase.__super__.constructor.apply(this, arguments);
    }

    UpperCase.extend();

    UpperCase.registerToSelectList();

    UpperCase.description = "`Hello World` -> `HELLO WORLD`";

    UpperCase.prototype.hover = {
      icon: ':upper-case:',
      emoji: ':point_up:'
    };

    UpperCase.prototype.displayName = 'Upper';

    UpperCase.prototype.getNewText = function(text) {
      return text.toUpperCase();
    };

    return UpperCase;

  })(TransformString);

  LowerCase = (function(_super) {
    __extends(LowerCase, _super);

    function LowerCase() {
      return LowerCase.__super__.constructor.apply(this, arguments);
    }

    LowerCase.extend();

    LowerCase.registerToSelectList();

    LowerCase.description = "`Hello World` -> `hello world`";

    LowerCase.prototype.hover = {
      icon: ':lower-case:',
      emoji: ':point_down:'
    };

    LowerCase.prototype.displayName = 'Lower';

    LowerCase.prototype.getNewText = function(text) {
      return text.toLowerCase();
    };

    return LowerCase;

  })(TransformString);

  Replace = (function(_super) {
    __extends(Replace, _super);

    function Replace() {
      return Replace.__super__.constructor.apply(this, arguments);
    }

    Replace.extend();

    Replace.prototype.input = null;

    Replace.prototype.hover = {
      icon: ':replace:',
      emoji: ':tractor:'
    };

    Replace.prototype.requireInput = true;

    Replace.prototype.initialize = function() {
      Replace.__super__.initialize.apply(this, arguments);
      if (this.isMode('normal')) {
        this.target = 'MoveRightBufferColumn';
      }
      return this.focusInput();
    };

    Replace.prototype.getInput = function() {
      return Replace.__super__.getInput.apply(this, arguments) || "\n";
    };

    Replace.prototype.mutateSelection = function(selection) {
      var input, text;
      if (this.target.is('MoveRightBufferColumn')) {
        if (selection.getText().length !== this.getCount()) {
          return;
        }
      }
      input = this.getInput();
      if (input === "\n") {
        this.restorePositions = false;
      }
      text = selection.getText().replace(/./g, input);
      return selection.insertText(text, {
        autoIndentNewline: true
      });
    };

    return Replace;

  })(TransformString);

  SplitByCharacter = (function(_super) {
    __extends(SplitByCharacter, _super);

    function SplitByCharacter() {
      return SplitByCharacter.__super__.constructor.apply(this, arguments);
    }

    SplitByCharacter.extend();

    SplitByCharacter.registerToSelectList();

    SplitByCharacter.prototype.getNewText = function(text) {
      return text.split('').join(' ');
    };

    return SplitByCharacter;

  })(TransformString);

  CamelCase = (function(_super) {
    __extends(CamelCase, _super);

    function CamelCase() {
      return CamelCase.__super__.constructor.apply(this, arguments);
    }

    CamelCase.extend();

    CamelCase.registerToSelectList();

    CamelCase.prototype.displayName = 'Camelize';

    CamelCase.description = "`hello-world` -> `helloWorld`";

    CamelCase.prototype.hover = {
      icon: ':camel-case:',
      emoji: ':camel:'
    };

    CamelCase.prototype.getNewText = function(text) {
      return _.camelize(text);
    };

    return CamelCase;

  })(TransformString);

  SnakeCase = (function(_super) {
    __extends(SnakeCase, _super);

    function SnakeCase() {
      return SnakeCase.__super__.constructor.apply(this, arguments);
    }

    SnakeCase.extend();

    SnakeCase.registerToSelectList();

    SnakeCase.description = "`HelloWorld` -> `hello_world`";

    SnakeCase.prototype.displayName = 'Underscore _';

    SnakeCase.prototype.hover = {
      icon: ':snake-case:',
      emoji: ':snake:'
    };

    SnakeCase.prototype.getNewText = function(text) {
      return _.underscore(text);
    };

    return SnakeCase;

  })(TransformString);

  PascalCase = (function(_super) {
    __extends(PascalCase, _super);

    function PascalCase() {
      return PascalCase.__super__.constructor.apply(this, arguments);
    }

    PascalCase.extend();

    PascalCase.registerToSelectList();

    PascalCase.description = "`hello_world` -> `HelloWorld`";

    PascalCase.prototype.displayName = 'Pascalize';

    PascalCase.prototype.hover = {
      icon: ':pascal-case:',
      emoji: ':triangular_ruler:'
    };

    PascalCase.prototype.getNewText = function(text) {
      return _.capitalize(_.camelize(text));
    };

    return PascalCase;

  })(TransformString);

  DashCase = (function(_super) {
    __extends(DashCase, _super);

    function DashCase() {
      return DashCase.__super__.constructor.apply(this, arguments);
    }

    DashCase.extend();

    DashCase.registerToSelectList();

    DashCase.prototype.displayName = 'Dasherize -';

    DashCase.description = "HelloWorld -> hello-world";

    DashCase.prototype.hover = {
      icon: ':dash-case:',
      emoji: ':dash:'
    };

    DashCase.prototype.getNewText = function(text) {
      return _.dasherize(text);
    };

    return DashCase;

  })(TransformString);

  TitleCase = (function(_super) {
    __extends(TitleCase, _super);

    function TitleCase() {
      return TitleCase.__super__.constructor.apply(this, arguments);
    }

    TitleCase.extend();

    TitleCase.registerToSelectList();

    TitleCase.description = "`HelloWorld` -> `Hello World`";

    TitleCase.prototype.displayName = 'Titlize';

    TitleCase.prototype.getNewText = function(text) {
      return _.humanizeEventName(_.dasherize(text));
    };

    return TitleCase;

  })(TransformString);

  EncodeUriComponent = (function(_super) {
    __extends(EncodeUriComponent, _super);

    function EncodeUriComponent() {
      return EncodeUriComponent.__super__.constructor.apply(this, arguments);
    }

    EncodeUriComponent.extend();

    EncodeUriComponent.registerToSelectList();

    EncodeUriComponent.description = "`Hello World` -> `Hello%20World`";

    EncodeUriComponent.prototype.displayName = 'Encode URI Component %';

    EncodeUriComponent.prototype.hover = {
      icon: 'encodeURI',
      emoji: 'encodeURI'
    };

    EncodeUriComponent.prototype.getNewText = function(text) {
      return encodeURIComponent(text);
    };

    return EncodeUriComponent;

  })(TransformString);

  DecodeUriComponent = (function(_super) {
    __extends(DecodeUriComponent, _super);

    function DecodeUriComponent() {
      return DecodeUriComponent.__super__.constructor.apply(this, arguments);
    }

    DecodeUriComponent.extend();

    DecodeUriComponent.registerToSelectList();

    DecodeUriComponent.description = "`Hello%20World` -> `Hello World`";

    DecodeUriComponent.prototype.displayName = 'Decode URI Component %%';

    DecodeUriComponent.prototype.hover = {
      icon: 'decodeURI',
      emoji: 'decodeURI'
    };

    DecodeUriComponent.prototype.getNewText = function(text) {
      return decodeURIComponent(text);
    };

    return DecodeUriComponent;

  })(TransformString);

  TrimString = (function(_super) {
    __extends(TrimString, _super);

    function TrimString() {
      return TrimString.__super__.constructor.apply(this, arguments);
    }

    TrimString.extend();

    TrimString.registerToSelectList();

    TrimString.description = "` hello ` -> `hello`";

    TrimString.prototype.displayName = 'Trim string';

    TrimString.prototype.getNewText = function(text) {
      return text.trim();
    };

    return TrimString;

  })(TransformString);

  CompactSpaces = (function(_super) {
    __extends(CompactSpaces, _super);

    function CompactSpaces() {
      return CompactSpaces.__super__.constructor.apply(this, arguments);
    }

    CompactSpaces.extend();

    CompactSpaces.registerToSelectList();

    CompactSpaces.description = "`  a    b    c` -> `a b c`";

    CompactSpaces.prototype.displayName = 'Compact space';

    CompactSpaces.prototype.getNewText = function(text) {
      if (text.match(/^[ ]+$/)) {
        return ' ';
      } else {
        return text.replace(/^(\s*)(.*?)(\s*)$/gm, function(m, leading, middle, trailing) {
          return leading + middle.split(/[ \t]+/).join(' ') + trailing;
        });
      }
    };

    return CompactSpaces;

  })(TransformString);

  ConvertToSoftTab = (function(_super) {
    __extends(ConvertToSoftTab, _super);

    function ConvertToSoftTab() {
      return ConvertToSoftTab.__super__.constructor.apply(this, arguments);
    }

    ConvertToSoftTab.extend();

    ConvertToSoftTab.registerToSelectList();

    ConvertToSoftTab.prototype.displayName = 'Soft Tab';

    ConvertToSoftTab.prototype.wise = 'linewise';

    ConvertToSoftTab.prototype.mutateSelection = function(selection) {
      var scanRange;
      scanRange = selection.getBufferRange();
      return this.editor.scanInBufferRange(/\t/g, scanRange, (function(_this) {
        return function(_arg) {
          var length, range, replace;
          range = _arg.range, replace = _arg.replace;
          length = _this.editor.screenRangeForBufferRange(range).getExtent().column;
          return replace(" ".repeat(length));
        };
      })(this));
    };

    return ConvertToSoftTab;

  })(TransformString);

  ConvertToHardTab = (function(_super) {
    __extends(ConvertToHardTab, _super);

    function ConvertToHardTab() {
      return ConvertToHardTab.__super__.constructor.apply(this, arguments);
    }

    ConvertToHardTab.extend();

    ConvertToHardTab.registerToSelectList();

    ConvertToHardTab.prototype.displayName = 'Hard Tab';

    ConvertToHardTab.prototype.mutateSelection = function(selection) {
      var scanRange, tabLength;
      tabLength = this.editor.getTabLength();
      scanRange = selection.getBufferRange();
      return this.editor.scanInBufferRange(/[ \t]+/g, scanRange, (function(_this) {
        return function(_arg) {
          var endColumn, newText, nextTabStop, range, remainder, replace, screenRange, startColumn, _ref2, _ref3;
          range = _arg.range, replace = _arg.replace;
          screenRange = _this.editor.screenRangeForBufferRange(range);
          (_ref2 = screenRange.start, startColumn = _ref2.column), (_ref3 = screenRange.end, endColumn = _ref3.column);
          newText = '';
          while (true) {
            remainder = __modulo(startColumn, tabLength);
            nextTabStop = startColumn + (remainder === 0 ? tabLength : remainder);
            if (nextTabStop > endColumn) {
              newText += " ".repeat(endColumn - startColumn);
            } else {
              newText += "\t";
            }
            startColumn = nextTabStop;
            if (startColumn >= endColumn) {
              break;
            }
          }
          return replace(newText);
        };
      })(this));
    };

    return ConvertToHardTab;

  })(TransformString);

  TransformStringByExternalCommand = (function(_super) {
    __extends(TransformStringByExternalCommand, _super);

    function TransformStringByExternalCommand() {
      return TransformStringByExternalCommand.__super__.constructor.apply(this, arguments);
    }

    TransformStringByExternalCommand.extend(false);

    TransformStringByExternalCommand.prototype.autoIndent = true;

    TransformStringByExternalCommand.prototype.command = '';

    TransformStringByExternalCommand.prototype.args = [];

    TransformStringByExternalCommand.prototype.stdoutBySelection = null;

    TransformStringByExternalCommand.prototype.execute = function() {
      if (this.selectTarget()) {
        return new Promise((function(_this) {
          return function(resolve) {
            return _this.collect(resolve);
          };
        })(this)).then((function(_this) {
          return function() {
            var selection, text, _i, _len, _ref2;
            _ref2 = _this.editor.getSelections();
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              selection = _ref2[_i];
              text = _this.getNewText(selection.getText(), selection);
              selection.insertText(text, {
                autoIndent: _this.autoIndent
              });
            }
            _this.restoreCursorPositionsIfNecessary();
            return _this.activateMode(_this.finalMode, _this.finalSubmode);
          };
        })(this));
      }
    };

    TransformStringByExternalCommand.prototype.collect = function(resolve) {
      var args, command, processFinished, processRunning, selection, _fn, _i, _len, _ref2, _ref3, _ref4;
      this.stdoutBySelection = new Map;
      processRunning = processFinished = 0;
      _ref2 = this.editor.getSelections();
      _fn = (function(_this) {
        return function(selection) {
          var exit, stdin, stdout;
          stdin = _this.getStdin(selection);
          stdout = function(output) {
            return _this.stdoutBySelection.set(selection, output);
          };
          exit = function(code) {
            processFinished++;
            if (processRunning === processFinished) {
              return resolve();
            }
          };
          return _this.runExternalCommand({
            command: command,
            args: args,
            stdout: stdout,
            exit: exit,
            stdin: stdin
          });
        };
      })(this);
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        selection = _ref2[_i];
        _ref4 = (_ref3 = this.getCommand(selection)) != null ? _ref3 : {}, command = _ref4.command, args = _ref4.args;
        if (!((command != null) && (args != null))) {
          return;
        }
        processRunning++;
        _fn(selection);
      }
    };

    TransformStringByExternalCommand.prototype.runExternalCommand = function(options) {
      var bufferedProcess, stdin;
      stdin = options.stdin;
      delete options.stdin;
      bufferedProcess = new BufferedProcess(options);
      bufferedProcess.onWillThrowError((function(_this) {
        return function(_arg) {
          var commandName, error, handle;
          error = _arg.error, handle = _arg.handle;
          if (error.code === 'ENOENT' && error.syscall.indexOf('spawn') === 0) {
            commandName = _this.constructor.getCommandName();
            console.log("" + commandName + ": Failed to spawn command " + error.path + ".");
            handle();
          }
          return _this.cancelOperation();
        };
      })(this));
      if (stdin) {
        bufferedProcess.process.stdin.write(stdin);
        return bufferedProcess.process.stdin.end();
      }
    };

    TransformStringByExternalCommand.prototype.getNewText = function(text, selection) {
      var _ref2;
      return (_ref2 = this.getStdout(selection)) != null ? _ref2 : text;
    };

    TransformStringByExternalCommand.prototype.getCommand = function(selection) {
      return {
        command: this.command,
        args: this.args
      };
    };

    TransformStringByExternalCommand.prototype.getStdin = function(selection) {
      return selection.getText();
    };

    TransformStringByExternalCommand.prototype.getStdout = function(selection) {
      return this.stdoutBySelection.get(selection);
    };

    return TransformStringByExternalCommand;

  })(TransformString);

  selectListItems = null;

  TransformStringBySelectList = (function(_super) {
    __extends(TransformStringBySelectList, _super);

    function TransformStringBySelectList() {
      return TransformStringBySelectList.__super__.constructor.apply(this, arguments);
    }

    TransformStringBySelectList.extend();

    TransformStringBySelectList.description = "Interactively choose string transformation operator from select-list";

    TransformStringBySelectList.prototype.requireInput = true;

    TransformStringBySelectList.prototype.getItems = function() {
      return selectListItems != null ? selectListItems : selectListItems = transformerRegistry.map(function(klass) {
        var displayName;
        if (klass.prototype.hasOwnProperty('displayName')) {
          displayName = klass.prototype.displayName;
        } else {
          displayName = _.humanizeEventName(_.dasherize(klass.name));
        }
        return {
          name: klass,
          displayName: displayName
        };
      });
    };

    TransformStringBySelectList.prototype.initialize = function() {
      TransformStringBySelectList.__super__.initialize.apply(this, arguments);
      this.vimState.onDidConfirmSelectList((function(_this) {
        return function(transformer) {
          var target, _ref2;
          _this.vimState.reset();
          target = (_ref2 = _this.target) != null ? _ref2.constructor.name : void 0;
          return _this.vimState.operationStack.run(transformer.name, {
            target: target
          });
        };
      })(this));
      return this.focusSelectList({
        items: this.getItems()
      });
    };

    TransformStringBySelectList.prototype.execute = function() {
      throw new Error("" + (this.getName()) + " should not be executed");
    };

    return TransformStringBySelectList;

  })(TransformString);

  TransformWordBySelectList = (function(_super) {
    __extends(TransformWordBySelectList, _super);

    function TransformWordBySelectList() {
      return TransformWordBySelectList.__super__.constructor.apply(this, arguments);
    }

    TransformWordBySelectList.extend();

    TransformWordBySelectList.prototype.target = "InnerWord";

    return TransformWordBySelectList;

  })(TransformStringBySelectList);

  TransformSmartWordBySelectList = (function(_super) {
    __extends(TransformSmartWordBySelectList, _super);

    function TransformSmartWordBySelectList() {
      return TransformSmartWordBySelectList.__super__.constructor.apply(this, arguments);
    }

    TransformSmartWordBySelectList.extend();

    TransformSmartWordBySelectList.description = "Transform InnerSmartWord by `transform-string-by-select-list`";

    TransformSmartWordBySelectList.prototype.target = "InnerSmartWord";

    return TransformSmartWordBySelectList;

  })(TransformStringBySelectList);

  ReplaceWithRegister = (function(_super) {
    __extends(ReplaceWithRegister, _super);

    function ReplaceWithRegister() {
      return ReplaceWithRegister.__super__.constructor.apply(this, arguments);
    }

    ReplaceWithRegister.extend();

    ReplaceWithRegister.description = "Replace target with specified register value";

    ReplaceWithRegister.prototype.hover = {
      icon: ':replace-with-register:',
      emoji: ':pencil:'
    };

    ReplaceWithRegister.prototype.getNewText = function(text) {
      return this.vimState.register.getText();
    };

    return ReplaceWithRegister;

  })(TransformString);

  SwapWithRegister = (function(_super) {
    __extends(SwapWithRegister, _super);

    function SwapWithRegister() {
      return SwapWithRegister.__super__.constructor.apply(this, arguments);
    }

    SwapWithRegister.extend();

    SwapWithRegister.description = "Swap register value with target";

    SwapWithRegister.prototype.getNewText = function(text, selection) {
      var newText;
      newText = this.vimState.register.getText();
      this.setTextToRegister(text, selection);
      return newText;
    };

    return SwapWithRegister;

  })(TransformString);

  Indent = (function(_super) {
    __extends(Indent, _super);

    function Indent() {
      return Indent.__super__.constructor.apply(this, arguments);
    }

    Indent.extend();

    Indent.prototype.hover = {
      icon: ':indent:',
      emoji: ':point_right:'
    };

    Indent.prototype.stayOnLinewise = false;

    Indent.prototype.useMarkerForStay = true;

    Indent.prototype.clipToMutationEndOnStay = false;

    Indent.prototype.execute = function() {
      if (!this.needStay()) {
        this.onDidRestoreCursorPositions((function(_this) {
          return function() {
            return _this.editor.moveToFirstCharacterOfLine();
          };
        })(this));
      }
      return Indent.__super__.execute.apply(this, arguments);
    };

    Indent.prototype.mutateSelection = function(selection) {
      return selection.indentSelectedRows();
    };

    return Indent;

  })(TransformString);

  Outdent = (function(_super) {
    __extends(Outdent, _super);

    function Outdent() {
      return Outdent.__super__.constructor.apply(this, arguments);
    }

    Outdent.extend();

    Outdent.prototype.hover = {
      icon: ':outdent:',
      emoji: ':point_left:'
    };

    Outdent.prototype.mutateSelection = function(selection) {
      return selection.outdentSelectedRows();
    };

    return Outdent;

  })(Indent);

  AutoIndent = (function(_super) {
    __extends(AutoIndent, _super);

    function AutoIndent() {
      return AutoIndent.__super__.constructor.apply(this, arguments);
    }

    AutoIndent.extend();

    AutoIndent.prototype.hover = {
      icon: ':auto-indent:',
      emoji: ':open_hands:'
    };

    AutoIndent.prototype.mutateSelection = function(selection) {
      return selection.autoIndentSelectedRows();
    };

    return AutoIndent;

  })(Indent);

  ToggleLineComments = (function(_super) {
    __extends(ToggleLineComments, _super);

    function ToggleLineComments() {
      return ToggleLineComments.__super__.constructor.apply(this, arguments);
    }

    ToggleLineComments.extend();

    ToggleLineComments.prototype.hover = {
      icon: ':toggle-line-comments:',
      emoji: ':mute:'
    };

    ToggleLineComments.prototype.useMarkerForStay = true;

    ToggleLineComments.prototype.mutateSelection = function(selection) {
      return selection.toggleLineComments();
    };

    return ToggleLineComments;

  })(TransformString);

  Surround = (function(_super) {
    __extends(Surround, _super);

    function Surround() {
      return Surround.__super__.constructor.apply(this, arguments);
    }

    Surround.extend();

    Surround.description = "Surround target by specified character like `(`, `[`, `\"`";

    Surround.prototype.displayName = "Surround ()";

    Surround.prototype.hover = {
      icon: ':surround:',
      emoji: ':two_women_holding_hands:'
    };

    Surround.prototype.pairs = [['[', ']'], ['(', ')'], ['{', '}'], ['<', '>']];

    Surround.prototype.input = null;

    Surround.prototype.charsMax = 1;

    Surround.prototype.requireInput = true;

    Surround.prototype.autoIndent = false;

    Surround.prototype.initialize = function() {
      Surround.__super__.initialize.apply(this, arguments);
      if (!this.requireInput) {
        return;
      }
      if (this.requireTarget) {
        return this.onDidSetTarget((function(_this) {
          return function() {
            _this.onDidConfirmInput(function(input) {
              return _this.onConfirm(input);
            });
            _this.onDidChangeInput(function(input) {
              return _this.addHover(input);
            });
            _this.onDidCancelInput(function() {
              return _this.cancelOperation();
            });
            return _this.vimState.input.focus(_this.charsMax);
          };
        })(this));
      } else {
        this.onDidConfirmInput((function(_this) {
          return function(input) {
            return _this.onConfirm(input);
          };
        })(this));
        this.onDidChangeInput((function(_this) {
          return function(input) {
            return _this.addHover(input);
          };
        })(this));
        this.onDidCancelInput((function(_this) {
          return function() {
            return _this.cancelOperation();
          };
        })(this));
        return this.vimState.input.focus(this.charsMax);
      }
    };

    Surround.prototype.onConfirm = function(input) {
      this.input = input;
      return this.processOperation();
    };

    Surround.prototype.getPair = function(char) {
      var pair;
      pair = _.detect(this.pairs, function(pair) {
        return __indexOf.call(pair, char) >= 0;
      });
      return pair != null ? pair : pair = [char, char];
    };

    Surround.prototype.surround = function(text, char, options) {
      var close, keepLayout, open, _ref2, _ref3;
      if (options == null) {
        options = {};
      }
      keepLayout = (_ref2 = options.keepLayout) != null ? _ref2 : false;
      _ref3 = this.getPair(char), open = _ref3[0], close = _ref3[1];
      if ((!keepLayout) && LineEndingRegExp.test(text)) {
        this.autoIndent = true;
        open += "\n";
        close += "\n";
      }
      if (__indexOf.call(settings.get('charactersToAddSpaceOnSurround'), char) >= 0 && isSingleLine(text)) {
        return open + ' ' + text + ' ' + close;
      } else {
        return open + text + close;
      }
    };

    Surround.prototype.getNewText = function(text) {
      return this.surround(text, this.input);
    };

    return Surround;

  })(TransformString);

  SurroundWord = (function(_super) {
    __extends(SurroundWord, _super);

    function SurroundWord() {
      return SurroundWord.__super__.constructor.apply(this, arguments);
    }

    SurroundWord.extend();

    SurroundWord.description = "Surround **word**";

    SurroundWord.prototype.target = 'InnerWord';

    return SurroundWord;

  })(Surround);

  SurroundSmartWord = (function(_super) {
    __extends(SurroundSmartWord, _super);

    function SurroundSmartWord() {
      return SurroundSmartWord.__super__.constructor.apply(this, arguments);
    }

    SurroundSmartWord.extend();

    SurroundSmartWord.description = "Surround **smart-word**";

    SurroundSmartWord.prototype.target = 'InnerSmartWord';

    return SurroundSmartWord;

  })(Surround);

  MapSurround = (function(_super) {
    __extends(MapSurround, _super);

    function MapSurround() {
      return MapSurround.__super__.constructor.apply(this, arguments);
    }

    MapSurround.extend();

    MapSurround.description = "Surround each word(`/\w+/`) within target";

    MapSurround.prototype.occurrence = true;

    MapSurround.prototype.patternForOccurrence = /\w+/g;

    return MapSurround;

  })(Surround);

  DeleteSurround = (function(_super) {
    __extends(DeleteSurround, _super);

    function DeleteSurround() {
      return DeleteSurround.__super__.constructor.apply(this, arguments);
    }

    DeleteSurround.extend();

    DeleteSurround.description = "Delete specified surround character like `(`, `[`, `\"`";

    DeleteSurround.prototype.pairChars = ['[]', '()', '{}'].join('');

    DeleteSurround.prototype.requireTarget = false;

    DeleteSurround.prototype.onConfirm = function(input) {
      var _ref2;
      this.input = input;
      this.setTarget(this["new"]('Pair', {
        pair: this.getPair(this.input),
        inner: false,
        allowNextLine: (_ref2 = this.input, __indexOf.call(this.pairChars, _ref2) >= 0)
      }));
      return this.processOperation();
    };

    DeleteSurround.prototype.getNewText = function(text) {
      var closeChar, openChar, _ref2;
      _ref2 = [text[0], _.last(text)], openChar = _ref2[0], closeChar = _ref2[1];
      text = text.slice(1, -1);
      if (isSingleLine(text)) {
        if (openChar !== closeChar) {
          text = text.trim();
        }
      }
      return text;
    };

    return DeleteSurround;

  })(Surround);

  DeleteSurroundAnyPair = (function(_super) {
    __extends(DeleteSurroundAnyPair, _super);

    function DeleteSurroundAnyPair() {
      return DeleteSurroundAnyPair.__super__.constructor.apply(this, arguments);
    }

    DeleteSurroundAnyPair.extend();

    DeleteSurroundAnyPair.description = "Delete surround character by auto-detect paired char from cursor enclosed pair";

    DeleteSurroundAnyPair.prototype.requireInput = false;

    DeleteSurroundAnyPair.prototype.target = 'AAnyPair';

    return DeleteSurroundAnyPair;

  })(DeleteSurround);

  DeleteSurroundAnyPairAllowForwarding = (function(_super) {
    __extends(DeleteSurroundAnyPairAllowForwarding, _super);

    function DeleteSurroundAnyPairAllowForwarding() {
      return DeleteSurroundAnyPairAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    DeleteSurroundAnyPairAllowForwarding.extend();

    DeleteSurroundAnyPairAllowForwarding.description = "Delete surround character by auto-detect paired char from cursor enclosed pair and forwarding pair within same line";

    DeleteSurroundAnyPairAllowForwarding.prototype.target = 'AAnyPairAllowForwarding';

    return DeleteSurroundAnyPairAllowForwarding;

  })(DeleteSurroundAnyPair);

  ChangeSurround = (function(_super) {
    __extends(ChangeSurround, _super);

    function ChangeSurround() {
      return ChangeSurround.__super__.constructor.apply(this, arguments);
    }

    ChangeSurround.extend();

    ChangeSurround.description = "Change surround character, specify both from and to pair char";

    ChangeSurround.prototype.charsMax = 2;

    ChangeSurround.prototype.char = null;

    ChangeSurround.prototype.onConfirm = function(input) {
      var from, _ref2;
      if (!input) {
        return;
      }
      _ref2 = input.split(''), from = _ref2[0], this.char = _ref2[1];
      return ChangeSurround.__super__.onConfirm.call(this, from);
    };

    ChangeSurround.prototype.getNewText = function(text) {
      var innerText;
      innerText = ChangeSurround.__super__.getNewText.apply(this, arguments);
      return this.surround(innerText, this.char, {
        keepLayout: true
      });
    };

    return ChangeSurround;

  })(DeleteSurround);

  ChangeSurroundAnyPair = (function(_super) {
    __extends(ChangeSurroundAnyPair, _super);

    function ChangeSurroundAnyPair() {
      return ChangeSurroundAnyPair.__super__.constructor.apply(this, arguments);
    }

    ChangeSurroundAnyPair.extend();

    ChangeSurroundAnyPair.description = "Change surround character, from char is auto-detected";

    ChangeSurroundAnyPair.prototype.charsMax = 1;

    ChangeSurroundAnyPair.prototype.target = "AAnyPair";

    ChangeSurroundAnyPair.prototype.highlightTargetRange = function(selection) {
      var marker, range;
      if (range = this.target.getRange(selection)) {
        marker = this.editor.markBufferRange(range);
        this.editor.decorateMarker(marker, {
          type: 'highlight',
          "class": 'vim-mode-plus-target-range'
        });
        return marker;
      } else {
        return null;
      }
    };

    ChangeSurroundAnyPair.prototype.initialize = function() {
      var marker;
      marker = null;
      this.onDidSetTarget((function(_this) {
        return function() {
          var char, textRange;
          if (marker = _this.highlightTargetRange(_this.editor.getLastSelection())) {
            textRange = Range.fromPointWithDelta(marker.getBufferRange().start, 0, 1);
            char = _this.editor.getTextInBufferRange(textRange);
            return _this.addHover(char, {}, _this.editor.getCursorBufferPosition());
          } else {
            _this.vimState.input.cancel();
            return _this.abort();
          }
        };
      })(this));
      this.onDidResetOperationStack(function() {
        return marker != null ? marker.destroy() : void 0;
      });
      return ChangeSurroundAnyPair.__super__.initialize.apply(this, arguments);
    };

    ChangeSurroundAnyPair.prototype.onConfirm = function(char) {
      this.char = char;
      this.input = this.char;
      return this.processOperation();
    };

    return ChangeSurroundAnyPair;

  })(ChangeSurround);

  ChangeSurroundAnyPairAllowForwarding = (function(_super) {
    __extends(ChangeSurroundAnyPairAllowForwarding, _super);

    function ChangeSurroundAnyPairAllowForwarding() {
      return ChangeSurroundAnyPairAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    ChangeSurroundAnyPairAllowForwarding.extend();

    ChangeSurroundAnyPairAllowForwarding.description = "Change surround character, from char is auto-detected from enclosed and forwarding area";

    ChangeSurroundAnyPairAllowForwarding.prototype.target = "AAnyPairAllowForwarding";

    return ChangeSurroundAnyPairAllowForwarding;

  })(ChangeSurroundAnyPair);

  Join = (function(_super) {
    __extends(Join, _super);

    function Join() {
      return Join.__super__.constructor.apply(this, arguments);
    }

    Join.extend();

    Join.prototype.target = "MoveToRelativeLine";

    Join.prototype.flashTarget = false;

    Join.prototype.restorePositions = false;

    Join.prototype.mutateSelection = function(selection) {
      var end, range;
      if (swrap(selection).isLinewise()) {
        range = selection.getBufferRange();
        selection.setBufferRange(range.translate([0, 0], [-1, Infinity]));
      }
      selection.joinLines();
      end = selection.getBufferRange().end;
      return selection.cursor.setBufferPosition(end.translate([0, -1]));
    };

    return Join;

  })(TransformString);

  JoinWithKeepingSpace = (function(_super) {
    __extends(JoinWithKeepingSpace, _super);

    function JoinWithKeepingSpace() {
      return JoinWithKeepingSpace.__super__.constructor.apply(this, arguments);
    }

    JoinWithKeepingSpace.extend();

    JoinWithKeepingSpace.registerToSelectList();

    JoinWithKeepingSpace.prototype.input = '';

    JoinWithKeepingSpace.prototype.requireTarget = false;

    JoinWithKeepingSpace.prototype.trim = false;

    JoinWithKeepingSpace.prototype.initialize = function() {
      return this.setTarget(this["new"]("MoveToRelativeLineWithMinimum", {
        min: 1
      }));
    };

    JoinWithKeepingSpace.prototype.mutateSelection = function(selection) {
      var endRow, row, rows, startRow, text, _ref2;
      _ref2 = selection.getBufferRowRange(), startRow = _ref2[0], endRow = _ref2[1];
      swrap(selection).expandOverLine();
      rows = (function() {
        var _i, _results;
        _results = [];
        for (row = _i = startRow; startRow <= endRow ? _i <= endRow : _i >= endRow; row = startRow <= endRow ? ++_i : --_i) {
          text = this.editor.lineTextForBufferRow(row);
          if (this.trim && row !== startRow) {
            _results.push(text.trimLeft());
          } else {
            _results.push(text);
          }
        }
        return _results;
      }).call(this);
      return selection.insertText(this.join(rows) + "\n");
    };

    JoinWithKeepingSpace.prototype.join = function(rows) {
      return rows.join(this.input);
    };

    return JoinWithKeepingSpace;

  })(TransformString);

  JoinByInput = (function(_super) {
    __extends(JoinByInput, _super);

    function JoinByInput() {
      return JoinByInput.__super__.constructor.apply(this, arguments);
    }

    JoinByInput.extend();

    JoinByInput.registerToSelectList();

    JoinByInput.description = "Transform multi-line to single-line by with specified separator character";

    JoinByInput.prototype.hover = {
      icon: ':join:',
      emoji: ':couple:'
    };

    JoinByInput.prototype.requireInput = true;

    JoinByInput.prototype.input = null;

    JoinByInput.prototype.trim = true;

    JoinByInput.prototype.initialize = function() {
      var charsMax;
      JoinByInput.__super__.initialize.apply(this, arguments);
      charsMax = 10;
      return this.focusInput(charsMax);
    };

    JoinByInput.prototype.join = function(rows) {
      return rows.join(" " + this.input + " ");
    };

    return JoinByInput;

  })(JoinWithKeepingSpace);

  JoinByInputWithKeepingSpace = (function(_super) {
    __extends(JoinByInputWithKeepingSpace, _super);

    function JoinByInputWithKeepingSpace() {
      return JoinByInputWithKeepingSpace.__super__.constructor.apply(this, arguments);
    }

    JoinByInputWithKeepingSpace.description = "Join lines without padding space between each line";

    JoinByInputWithKeepingSpace.extend();

    JoinByInputWithKeepingSpace.registerToSelectList();

    JoinByInputWithKeepingSpace.prototype.trim = false;

    JoinByInputWithKeepingSpace.prototype.join = function(rows) {
      return rows.join(this.input);
    };

    return JoinByInputWithKeepingSpace;

  })(JoinByInput);

  SplitString = (function(_super) {
    __extends(SplitString, _super);

    function SplitString() {
      return SplitString.__super__.constructor.apply(this, arguments);
    }

    SplitString.extend();

    SplitString.registerToSelectList();

    SplitString.description = "Split single-line into multi-line by splitting specified separator chars";

    SplitString.prototype.hover = {
      icon: ':split-string:',
      emoji: ':hocho:'
    };

    SplitString.prototype.requireInput = true;

    SplitString.prototype.input = null;

    SplitString.prototype.initialize = function() {
      var charsMax;
      SplitString.__super__.initialize.apply(this, arguments);
      if (!this.isMode('visual')) {
        this.setTarget(this["new"]("MoveToRelativeLine", {
          min: 1
        }));
      }
      charsMax = 10;
      return this.focusInput(charsMax);
    };

    SplitString.prototype.getNewText = function(text) {
      var regex;
      if (this.input === '') {
        this.input = "\\n";
      }
      regex = RegExp("" + (_.escapeRegExp(this.input)), "g");
      return text.split(regex).join("\n");
    };

    return SplitString;

  })(TransformString);

  ChangeOrder = (function(_super) {
    __extends(ChangeOrder, _super);

    function ChangeOrder() {
      return ChangeOrder.__super__.constructor.apply(this, arguments);
    }

    ChangeOrder.extend(false);

    ChangeOrder.prototype.wise = 'linewise';

    ChangeOrder.prototype.mutateSelection = function(selection) {
      var newText, rows, textForRows;
      textForRows = swrap(selection).lineTextForBufferRows();
      rows = this.getNewRows(textForRows);
      newText = rows.join("\n") + "\n";
      return selection.insertText(newText);
    };

    return ChangeOrder;

  })(TransformString);

  Reverse = (function(_super) {
    __extends(Reverse, _super);

    function Reverse() {
      return Reverse.__super__.constructor.apply(this, arguments);
    }

    Reverse.extend();

    Reverse.registerToSelectList();

    Reverse.description = "Reverse lines(e.g reverse selected three line)";

    Reverse.prototype.getNewRows = function(rows) {
      return rows.reverse();
    };

    return Reverse;

  })(ChangeOrder);

  Sort = (function(_super) {
    __extends(Sort, _super);

    function Sort() {
      return Sort.__super__.constructor.apply(this, arguments);
    }

    Sort.extend();

    Sort.registerToSelectList();

    Sort.description = "Sort lines alphabetically";

    Sort.prototype.getNewRows = function(rows) {
      return rows.sort();
    };

    return Sort;

  })(ChangeOrder);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9vcGVyYXRvci10cmFuc2Zvcm0tc3RyaW5nLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwrN0JBQUE7SUFBQTs7O3lKQUFBOztBQUFBLEVBQUEsZ0JBQUEsR0FBbUIsY0FBbkIsQ0FBQTs7QUFBQSxFQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FESixDQUFBOztBQUFBLEVBRUEsT0FBMkIsT0FBQSxDQUFRLE1BQVIsQ0FBM0IsRUFBQyx1QkFBQSxlQUFELEVBQWtCLGFBQUEsS0FGbEIsQ0FBQTs7QUFBQSxFQUlBLFFBR0ksT0FBQSxDQUFRLFNBQVIsQ0FISixFQUNFLGtDQUFBLHlCQURGLEVBRUUscUJBQUEsWUFORixDQUFBOztBQUFBLEVBUUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUixDQVJSLENBQUE7O0FBQUEsRUFTQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FUWCxDQUFBOztBQUFBLEVBVUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSLENBVlAsQ0FBQTs7QUFBQSxFQVdBLFFBQUEsR0FBVyxJQUFJLENBQUMsUUFBTCxDQUFjLFVBQWQsQ0FYWCxDQUFBOztBQUFBLEVBZUEsbUJBQUEsR0FBc0IsRUFmdEIsQ0FBQTs7QUFBQSxFQWdCTTtBQUNKLHNDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGVBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQUEsOEJBQ0EsV0FBQSxHQUFhLElBRGIsQ0FBQTs7QUFBQSw4QkFFQSxjQUFBLEdBQWdCLElBRmhCLENBQUE7O0FBQUEsOEJBR0EsVUFBQSxHQUFZLEtBSFosQ0FBQTs7QUFBQSxJQUtBLGVBQUMsQ0FBQSxvQkFBRCxHQUF1QixTQUFBLEdB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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/operator-transform-string.coffee
