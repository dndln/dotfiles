(function() {
  var AutoIndent, Base, BufferedProcess, CamelCase, ChangeOrder, ChangeSurround, ChangeSurroundAnyPair, ChangeSurroundAnyPairAllowForwarding, CompactSpaces, CursorPositionManager, DashCase, DecodeUriComponent, DeleteSurround, DeleteSurroundAnyPair, DeleteSurroundAnyPairAllowForwarding, EncodeUriComponent, Indent, Join, JoinByInput, JoinByInputWithKeepingSpace, JoinWithKeepingSpace, LineEndingRegExp, LowerCase, MapSurround, Operator, Outdent, PascalCase, Replace, ReplaceAndMoveRight, ReplaceWithRegister, Reverse, SnakeCase, Sort, SplitByCharacter, SplitString, Surround, SurroundSmartWord, SurroundWord, SwapWithRegister, TitleCase, ToggleCase, ToggleCaseAndMoveRight, ToggleLineComments, TransformSmartWordBySelectList, TransformString, TransformStringByExternalCommand, TransformStringBySelectList, TransformWordBySelectList, TrimString, UpperCase, haveSomeSelection, isSingleLine, saveCursorPositions, selectListItems, settings, swrap, transformerRegistry, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  LineEndingRegExp = /(?:\n|\r\n)$/;

  _ = require('underscore-plus');

  BufferedProcess = require('atom').BufferedProcess;

  _ref = require('./utils'), haveSomeSelection = _ref.haveSomeSelection, isSingleLine = _ref.isSingleLine, saveCursorPositions = _ref.saveCursorPositions;

  swrap = require('./selection-wrapper');

  settings = require('./settings');

  Base = require('./base');

  Operator = Base.getClass('Operator');

  CursorPositionManager = require('./cursor-position-manager');

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
      return this.focusInput();
    };

    Replace.prototype.getInput = function() {
      return Replace.__super__.getInput.apply(this, arguments) || "\n";
    };

    Replace.prototype.mutateSelection = function(selection) {
      var input, text;
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

  ReplaceAndMoveRight = (function(_super) {
    __extends(ReplaceAndMoveRight, _super);

    function ReplaceAndMoveRight() {
      return ReplaceAndMoveRight.__super__.constructor.apply(this, arguments);
    }

    ReplaceAndMoveRight.extend();

    ReplaceAndMoveRight.prototype.target = "MoveRight";

    ReplaceAndMoveRight.prototype.mutateSelection = function(selection) {
      if (selection.getText().length === this.getCount()) {
        return ReplaceAndMoveRight.__super__.mutateSelection.apply(this, arguments);
      }
    };

    return ReplaceAndMoveRight;

  })(Replace);

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
            var selection, text, _i, _len, _ref1;
            _ref1 = _this.editor.getSelections();
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              selection = _ref1[_i];
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
      var args, command, processFinished, processRunning, selection, _fn, _i, _len, _ref1, _ref2, _ref3;
      this.stdoutBySelection = new Map;
      processRunning = processFinished = 0;
      _ref1 = this.editor.getSelections();
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
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        selection = _ref1[_i];
        _ref3 = (_ref2 = this.getCommand(selection)) != null ? _ref2 : {}, command = _ref3.command, args = _ref3.args;
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
      var _ref1;
      return (_ref1 = this.getStdout(selection)) != null ? _ref1 : text;
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
          var target, _ref1;
          _this.vimState.reset();
          target = (_ref1 = _this.target) != null ? _ref1.constructor.name : void 0;
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
      if (this.requireTarget) {
        return this.onDidSetTarget((function(_this) {
          return function() {
            return _this.vimState.input.focus({
              charsMax: _this.charsMax
            });
          };
        })(this));
      } else {
        return this.vimState.input.focus({
          charsMax: this.charsMax
        });
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
      var close, keepLayout, open, _ref1, _ref2;
      if (options == null) {
        options = {};
      }
      keepLayout = (_ref1 = options.keepLayout) != null ? _ref1 : false;
      _ref2 = this.getPair(char), open = _ref2[0], close = _ref2[1];
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
      var _ref1;
      this.input = input;
      this.setTarget(this["new"]('Pair', {
        pair: this.getPair(this.input),
        inner: false,
        allowNextLine: (_ref1 = this.input, __indexOf.call(this.pairChars, _ref1) >= 0)
      }));
      return this.processOperation();
    };

    DeleteSurround.prototype.getNewText = function(text) {
      var closeChar, openChar, _ref1;
      _ref1 = [text[0], _.last(text)], openChar = _ref1[0], closeChar = _ref1[1];
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
      var from, _ref1;
      if (!input) {
        return;
      }
      _ref1 = input.split(''), from = _ref1[0], this.char = _ref1[1];
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

    ChangeSurroundAnyPair.prototype.initialize = function() {
      this.onDidSetTarget((function(_this) {
        return function() {
          var hoverPosition;
          _this.preSelectPositions = new CursorPositionManager(_this.editor);
          _this.preSelectPositions.save('head');
          hoverPosition = _this.editor.getCursorBufferPosition();
          _this.target.select();
          if (!haveSomeSelection(_this.editor)) {
            _this.vimState.input.cancel();
            _this.abort();
          }
          return _this.addHover(_this.editor.getSelectedText()[0], {}, hoverPosition);
        };
      })(this));
      return ChangeSurroundAnyPair.__super__.initialize.apply(this, arguments);
    };

    ChangeSurroundAnyPair.prototype.onConfirm = function(char) {
      this.char = char;
      this.preSelectPositions.restore();
      this.preSelectPositions = null;
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
      var endRow, row, rows, startRow, text, _ref1;
      _ref1 = selection.getBufferRowRange(), startRow = _ref1[0], endRow = _ref1[1];
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
      JoinByInput.__super__.initialize.apply(this, arguments);
      return this.focusInput({
        charsMax: 10
      });
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
      SplitString.__super__.initialize.apply(this, arguments);
      if (!this.isMode('visual')) {
        this.setTarget(this["new"]("MoveToRelativeLine", {
          min: 1
        }));
      }
      return this.focusInput({
        charsMax: 10
      });
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9vcGVyYXRvci10cmFuc2Zvcm0tc3RyaW5nLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxzOEJBQUE7SUFBQTs7eUpBQUE7O0FBQUEsRUFBQSxnQkFBQSxHQUFtQixjQUFuQixDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQURKLENBQUE7O0FBQUEsRUFFQyxrQkFBbUIsT0FBQSxDQUFRLE1BQVIsRUFBbkIsZUFGRCxDQUFBOztBQUFBLEVBSUEsT0FBeUQsT0FBQSxDQUFRLFNBQVIsQ0FBekQsRUFBQyx5QkFBQSxpQkFBRCxFQUFvQixvQkFBQSxZQUFwQixFQUFrQywyQkFBQSxtQkFKbEMsQ0FBQTs7QUFBQSxFQUtBLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVIsQ0FMUixDQUFBOztBQUFBLEVBTUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBTlgsQ0FBQTs7QUFBQSxFQU9BLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUixDQVBQLENBQUE7O0FBQUEsRUFRQSxRQUFBLEdBQVcsSUFBSSxDQUFDLFFBQUwsQ0FBYyxVQUFkLENBUlgsQ0FBQTs7QUFBQSxFQVNBLHFCQUFBLEdBQXdCLE9BQUEsQ0FBUSwyQkFBUixDQVR4QixDQUFBOztBQUFBLEVBYUEsbUJBQUEsR0FBc0IsRUFidEIsQ0FBQTs7QUFBQSxFQWNNO0FBQ0osc0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsZUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSLENBQUEsQ0FBQTs7QUFBQSw4QkFDQSxXQUFBLEdBQWEsSUFEYixDQUFBOztBQUFBLDhCQUVBLGNBQUEsR0FBZ0IsSUFGaEIsQ0FBQTs7QUFBQSw4QkFHQSxVQUFBLEdBQVksS0FIWixDQUFBOztBQUFBLElBS0EsZUFBQyxDQUFBLG9CQUFELEdBQXVCLFNBQUEsR0FBQTthQUNyQixtQkFBbUIsQ0FBQyxJQUFwQixDQUF5QixJQUF6QixFQURxQjtJQUFBLENBTHZCLENBQUE7O0FBQUEsOEJBUUEsZUFBQSxHQUFpQixTQUFDLFNBQUQsRUFBWSxZQUFaLEdBQUE7QUFDZixVQUFBLElBQUE7QUFBQSxNQUFBLElBQUcsSUFBQSxHQUFPLElBQUMsQ0FBQSxVQUFELENBQVksU0FBUyxDQUFDLE9BQVYsQ0FBQSxDQUFaLEVBQWlDLFNBQWpDLEVBQTRDLFlBQTVDLENBQVY7ZUFDRSxTQUFTLENBQUMsVUFBVixDQUFxQixJQUFyQixFQUEyQjtBQUFBLFVBQUUsWUFBRCxJQUFDLENBQUEsVUFBRjtTQUEzQixFQURGO09BRGU7SUFBQSxDQVJqQixDQUFBOzsyQkFBQTs7S0FENEIsU0FkOUIsQ0FBQTs7QUFBQSxFQTJCTTtBQUNKLGlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFVBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLElBQ0EsVUFBQyxDQUFBLG9CQUFELENBQUEsQ0FEQSxDQUFBOztBQUFBLElBRUEsVUFBQyxDQUFBLFdBQUQsR0FBYyxnQ0FGZCxDQUFBOztBQUFBLHlCQUdBLFdBQUEsR0FBYSxVQUhiLENBQUE7O0FBQUEseUJBSUEsS0FBQSxHQUFPO0FBQUEsTUFBQSxJQUFBLEVBQU0sZUFBTjtBQUFBLE1BQXVCLEtBQUEsRUFBTyxRQUE5QjtLQUpQLENBQUE7O0FBQUEseUJBTUEsVUFBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO0FBQ1YsVUFBQSxTQUFBO0FBQUEsTUFBQSxTQUFBLEdBQVksSUFBSSxDQUFDLFdBQUwsQ0FBQSxDQUFaLENBQUE7QUFDQSxNQUFBLElBQUcsU0FBQSxLQUFhLElBQWhCO2VBQ0UsSUFBSSxDQUFDLFdBQUwsQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLFVBSEY7T0FGVTtJQUFBLENBTlosQ0FBQTs7QUFBQSx5QkFhQSxVQUFBLEdBQVksU0FBQyxJQUFELEdBQUE7YUFDVixJQUFJLENBQUMsT0FBTCxDQUFhLElBQWIsRUFBbUIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQWlCLElBQWpCLENBQW5CLEVBRFU7SUFBQSxDQWJaLENBQUE7O3NCQUFBOztLQUR1QixnQkEzQnpCLENBQUE7O0FBQUEsRUE0Q007QUFDSiw2Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxzQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEscUNBQ0EsS0FBQSxHQUFPLElBRFAsQ0FBQTs7QUFBQSxxQ0FFQSxXQUFBLEdBQWEsS0FGYixDQUFBOztBQUFBLHFDQUdBLGdCQUFBLEdBQWtCLEtBSGxCLENBQUE7O0FBQUEscUNBSUEsTUFBQSxHQUFRLFdBSlIsQ0FBQTs7a0NBQUE7O0tBRG1DLFdBNUNyQyxDQUFBOztBQUFBLEVBbURNO0FBQ0osZ0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsU0FBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsSUFDQSxTQUFDLENBQUEsb0JBQUQsQ0FBQSxDQURBLENBQUE7O0FBQUEsSUFFQSxTQUFDLENBQUEsV0FBRCxHQUFjLGdDQUZkLENBQUE7O0FBQUEsd0JBR0EsS0FBQSxHQUFPO0FBQUEsTUFBQSxJQUFBLEVBQU0sY0FBTjtBQUFBLE1BQXNCLEtBQUEsRUFBTyxZQUE3QjtLQUhQLENBQUE7O0FBQUEsd0JBSUEsV0FBQSxHQUFhLE9BSmIsQ0FBQTs7QUFBQSx3QkFLQSxVQUFBLEdBQVksU0FBQyxJQUFELEdBQUE7YUFDVixJQUFJLENBQUMsV0FBTCxDQUFBLEVBRFU7SUFBQSxDQUxaLENBQUE7O3FCQUFBOztLQURzQixnQkFuRHhCLENBQUE7O0FBQUEsRUE0RE07QUFDSixnQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxTQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxJQUNBLFNBQUMsQ0FBQSxvQkFBRCxDQUFBLENBREEsQ0FBQTs7QUFBQSxJQUVBLFNBQUMsQ0FBQSxXQUFELEdBQWMsZ0NBRmQsQ0FBQTs7QUFBQSx3QkFHQSxLQUFBLEdBQU87QUFBQSxNQUFBLElBQUEsRUFBTSxjQUFOO0FBQUEsTUFBc0IsS0FBQSxFQUFPLGNBQTdCO0tBSFAsQ0FBQTs7QUFBQSx3QkFJQSxXQUFBLEdBQWEsT0FKYixDQUFBOztBQUFBLHdCQUtBLFVBQUEsR0FBWSxTQUFDLElBQUQsR0FBQTthQUNWLElBQUksQ0FBQyxXQUFMLENBQUEsRUFEVTtJQUFBLENBTFosQ0FBQTs7cUJBQUE7O0tBRHNCLGdCQTVEeEIsQ0FBQTs7QUFBQSxFQXVFTTtBQUNKLDhCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLE9BQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLHNCQUNBLEtBQUEsR0FBTyxJQURQLENBQUE7O0FBQUEsc0JBRUEsS0FBQSxHQUFPO0FBQUEsTUFBQSxJQUFBLEVBQU0sV0FBTjtBQUFBLE1BQW1CLEtBQUEsRUFBTyxXQUExQjtLQUZQLENBQUE7O0FBQUEsc0JBR0EsWUFBQSxHQUFjLElBSGQsQ0FBQTs7QUFBQSxzQkFLQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSx5Q0FBQSxTQUFBLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxVQUFELENBQUEsRUFGVTtJQUFBLENBTFosQ0FBQTs7QUFBQSxzQkFTQSxRQUFBLEdBQVUsU0FBQSxHQUFBO2FBQ1IsdUNBQUEsU0FBQSxDQUFBLElBQVMsS0FERDtJQUFBLENBVFYsQ0FBQTs7QUFBQSxzQkFZQSxlQUFBLEdBQWlCLFNBQUMsU0FBRCxHQUFBO0FBQ2YsVUFBQSxXQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFSLENBQUE7QUFDQSxNQUFBLElBQTZCLEtBQUEsS0FBUyxJQUF0QztBQUFBLFFBQUEsSUFBQyxDQUFBLGdCQUFELEdBQW9CLEtBQXBCLENBQUE7T0FEQTtBQUFBLE1BRUEsSUFBQSxHQUFPLFNBQVMsQ0FBQyxPQUFWLENBQUEsQ0FBbUIsQ0FBQyxPQUFwQixDQUE0QixJQUE1QixFQUFrQyxLQUFsQyxDQUZQLENBQUE7YUFHQSxTQUFTLENBQUMsVUFBVixDQUFxQixJQUFyQixFQUEyQjtBQUFBLFFBQUEsaUJBQUEsRUFBbUIsSUFBbkI7T0FBM0IsRUFKZTtJQUFBLENBWmpCLENBQUE7O21CQUFBOztLQURvQixnQkF2RXRCLENBQUE7O0FBQUEsRUEwRk07QUFDSiwwQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxtQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsa0NBQ0EsTUFBQSxHQUFRLFdBRFIsQ0FBQTs7QUFBQSxrQ0FHQSxlQUFBLEdBQWlCLFNBQUMsU0FBRCxHQUFBO0FBQ2YsTUFBQSxJQUFHLFNBQVMsQ0FBQyxPQUFWLENBQUEsQ0FBbUIsQ0FBQyxNQUFwQixLQUE4QixJQUFDLENBQUEsUUFBRCxDQUFBLENBQWpDO2VBQ0UsMERBQUEsU0FBQSxFQURGO09BRGU7SUFBQSxDQUhqQixDQUFBOzsrQkFBQTs7S0FEZ0MsUUExRmxDLENBQUE7O0FBQUEsRUFvR007QUFDSix1Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxnQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsSUFDQSxnQkFBQyxDQUFBLG9CQUFELENBQUEsQ0FEQSxDQUFBOztBQUFBLCtCQUVBLFVBQUEsR0FBWSxTQUFDLElBQUQsR0FBQTthQUNWLElBQUksQ0FBQyxLQUFMLENBQVcsRUFBWCxDQUFjLENBQUMsSUFBZixDQUFvQixHQUFwQixFQURVO0lBQUEsQ0FGWixDQUFBOzs0QkFBQTs7S0FENkIsZ0JBcEcvQixDQUFBOztBQUFBLEVBMEdNO0FBQ0osZ0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsU0FBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsSUFDQSxTQUFDLENBQUEsb0JBQUQsQ0FBQSxDQURBLENBQUE7O0FBQUEsd0JBRUEsV0FBQSxHQUFhLFVBRmIsQ0FBQTs7QUFBQSxJQUdBLFNBQUMsQ0FBQSxXQUFELEdBQWMsK0JBSGQsQ0FBQTs7QUFBQSx3QkFJQSxLQUFBLEdBQU87QUFBQSxNQUFBLElBQUEsRUFBTSxjQUFOO0FBQUEsTUFBc0IsS0FBQSxFQUFPLFNBQTdCO0tBSlAsQ0FBQTs7QUFBQSx3QkFLQSxVQUFBLEdBQVksU0FBQyxJQUFELEdBQUE7YUFDVixDQUFDLENBQUMsUUFBRixDQUFXLElBQVgsRUFEVTtJQUFBLENBTFosQ0FBQTs7cUJBQUE7O0tBRHNCLGdCQTFHeEIsQ0FBQTs7QUFBQSxFQW1ITTtBQUNKLGdDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFNBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLElBQ0EsU0FBQyxDQUFBLG9CQUFELENBQUEsQ0FEQSxDQUFBOztBQUFBLElBRUEsU0FBQyxDQUFBLFdBQUQsR0FBYywrQkFGZCxDQUFBOztBQUFBLHdCQUdBLFdBQUEsR0FBYSxjQUhiLENBQUE7O0FBQUEsd0JBSUEsS0FBQSxHQUFPO0FBQUEsTUFBQSxJQUFBLEVBQU0sY0FBTjtBQUFBLE1BQXNCLEtBQUEsRUFBTyxTQUE3QjtLQUpQLENBQUE7O0FBQUEsd0JBS0EsVUFBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO2FBQ1YsQ0FBQyxDQUFDLFVBQUYsQ0FBYSxJQUFiLEVBRFU7SUFBQSxDQUxaLENBQUE7O3FCQUFBOztLQURzQixnQkFuSHhCLENBQUE7O0FBQUEsRUE0SE07QUFDSixpQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxVQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxJQUNBLFVBQUMsQ0FBQSxvQkFBRCxDQUFBLENBREEsQ0FBQTs7QUFBQSxJQUVBLFVBQUMsQ0FBQSxXQUFELEdBQWMsK0JBRmQsQ0FBQTs7QUFBQSx5QkFHQSxXQUFBLEdBQWEsV0FIYixDQUFBOztBQUFBLHlCQUlBLEtBQUEsR0FBTztBQUFBLE1BQUEsSUFBQSxFQUFNLGVBQU47QUFBQSxNQUF1QixLQUFBLEVBQU8sb0JBQTlCO0tBSlAsQ0FBQTs7QUFBQSx5QkFLQSxVQUFBLEdBQVksU0FBQyxJQUFELEdBQUE7YUFDVixDQUFDLENBQUMsVUFBRixDQUFhLENBQUMsQ0FBQyxRQUFGLENBQVcsSUFBWCxDQUFiLEVBRFU7SUFBQSxDQUxaLENBQUE7O3NCQUFBOztLQUR1QixnQkE1SHpCLENBQUE7O0FBQUEsRUFxSU07QUFDSiwrQkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxRQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxJQUNBLFFBQUMsQ0FBQSxvQkFBRCxDQUFBLENBREEsQ0FBQTs7QUFBQSx1QkFFQSxXQUFBLEdBQWEsYUFGYixDQUFBOztBQUFBLElBR0EsUUFBQyxDQUFBLFdBQUQsR0FBYywyQkFIZCxDQUFBOztBQUFBLHVCQUlBLEtBQUEsR0FBTztBQUFBLE1BQUEsSUFBQSxFQUFNLGFBQU47QUFBQSxNQUFxQixLQUFBLEVBQU8sUUFBNUI7S0FKUCxDQUFBOztBQUFBLHVCQUtBLFVBQUEsR0FBWSxTQUFDLElBQUQsR0FBQTthQUNWLENBQUMsQ0FBQyxTQUFGLENBQVksSUFBWixFQURVO0lBQUEsQ0FMWixDQUFBOztvQkFBQTs7S0FEcUIsZ0JBckl2QixDQUFBOztBQUFBLEVBOElNO0FBQ0osZ0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsU0FBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsSUFDQSxTQUFDLENBQUEsb0JBQUQsQ0FBQSxDQURBLENBQUE7O0FBQUEsSUFFQSxTQUFDLENBQUEsV0FBRCxHQUFjLCtCQUZkLENBQUE7O0FBQUEsd0JBR0EsV0FBQSxHQUFhLFNBSGIsQ0FBQTs7QUFBQSx3QkFJQSxVQUFBLEdBQVksU0FBQyxJQUFELEdBQUE7YUFDVixDQUFDLENBQUMsaUJBQUYsQ0FBb0IsQ0FBQyxDQUFDLFNBQUYsQ0FBWSxJQUFaLENBQXBCLEVBRFU7SUFBQSxDQUpaLENBQUE7O3FCQUFBOztLQURzQixnQkE5SXhCLENBQUE7O0FBQUEsRUFzSk07QUFDSix5Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxrQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsSUFDQSxrQkFBQyxDQUFBLG9CQUFELENBQUEsQ0FEQSxDQUFBOztBQUFBLElBRUEsa0JBQUMsQ0FBQSxXQUFELEdBQWMsa0NBRmQsQ0FBQTs7QUFBQSxpQ0FHQSxXQUFBLEdBQWEsd0JBSGIsQ0FBQTs7QUFBQSxpQ0FJQSxLQUFBLEdBQU87QUFBQSxNQUFBLElBQUEsRUFBTSxXQUFOO0FBQUEsTUFBbUIsS0FBQSxFQUFPLFdBQTFCO0tBSlAsQ0FBQTs7QUFBQSxpQ0FLQSxVQUFBLEdBQVksU0FBQyxJQUFELEdBQUE7YUFDVixrQkFBQSxDQUFtQixJQUFuQixFQURVO0lBQUEsQ0FMWixDQUFBOzs4QkFBQTs7S0FEK0IsZ0JBdEpqQyxDQUFBOztBQUFBLEVBK0pNO0FBQ0oseUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsa0JBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLElBQ0Esa0JBQUMsQ0FBQSxvQkFBRCxDQUFBLENBREEsQ0FBQTs7QUFBQSxJQUVBLGtCQUFDLENBQUEsV0FBRCxHQUFjLGtDQUZkLENBQUE7O0FBQUEsaUNBR0EsV0FBQSxHQUFhLHlCQUhiLENBQUE7O0FBQUEsaUNBSUEsS0FBQSxHQUFPO0FBQUEsTUFBQSxJQUFBLEVBQU0sV0FBTjtBQUFBLE1BQW1CLEtBQUEsRUFBTyxXQUExQjtLQUpQLENBQUE7O0FBQUEsaUNBS0EsVUFBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO2FBQ1Ysa0JBQUEsQ0FBbUIsSUFBbkIsRUFEVTtJQUFBLENBTFosQ0FBQTs7OEJBQUE7O0tBRCtCLGdCQS9KakMsQ0FBQTs7QUFBQSxFQXdLTTtBQUNKLGlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFVBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLElBQ0EsVUFBQyxDQUFBLG9CQUFELENBQUEsQ0FEQSxDQUFBOztBQUFBLElBRUEsVUFBQyxDQUFBLFdBQUQsR0FBYyxzQkFGZCxDQUFBOztBQUFBLHlCQUdBLFdBQUEsR0FBYSxhQUhiLENBQUE7O0FBQUEseUJBSUEsVUFBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO2FBQ1YsSUFBSSxDQUFDLElBQUwsQ0FBQSxFQURVO0lBQUEsQ0FKWixDQUFBOztzQkFBQTs7S0FEdUIsZ0JBeEt6QixDQUFBOztBQUFBLEVBZ0xNO0FBQ0osb0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsYUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsSUFDQSxhQUFDLENBQUEsb0JBQUQsQ0FBQSxDQURBLENBQUE7O0FBQUEsSUFFQSxhQUFDLENBQUEsV0FBRCxHQUFjLDRCQUZkLENBQUE7O0FBQUEsNEJBR0EsV0FBQSxHQUFhLGVBSGIsQ0FBQTs7QUFBQSw0QkFJQSxVQUFBLEdBQVksU0FBQyxJQUFELEdBQUE7QUFDVixNQUFBLElBQUcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxRQUFYLENBQUg7ZUFDRSxJQURGO09BQUEsTUFBQTtlQUlFLElBQUksQ0FBQyxPQUFMLENBQWEscUJBQWIsRUFBb0MsU0FBQyxDQUFELEVBQUksT0FBSixFQUFhLE1BQWIsRUFBcUIsUUFBckIsR0FBQTtpQkFDbEMsT0FBQSxHQUFVLE1BQU0sQ0FBQyxLQUFQLENBQWEsUUFBYixDQUFzQixDQUFDLElBQXZCLENBQTRCLEdBQTVCLENBQVYsR0FBNkMsU0FEWDtRQUFBLENBQXBDLEVBSkY7T0FEVTtJQUFBLENBSlosQ0FBQTs7eUJBQUE7O0tBRDBCLGdCQWhMNUIsQ0FBQTs7QUFBQSxFQThMTTtBQUNKLHVEQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGdDQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUFBLCtDQUNBLFVBQUEsR0FBWSxJQURaLENBQUE7O0FBQUEsK0NBRUEsT0FBQSxHQUFTLEVBRlQsQ0FBQTs7QUFBQSwrQ0FHQSxJQUFBLEdBQU0sRUFITixDQUFBOztBQUFBLCtDQUlBLGlCQUFBLEdBQW1CLElBSm5CLENBQUE7O0FBQUEsK0NBTUEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLE1BQUEsSUFBRyxJQUFDLENBQUEsWUFBRCxDQUFBLENBQUg7ZUFDTSxJQUFBLE9BQUEsQ0FBUSxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUMsT0FBRCxHQUFBO21CQUNWLEtBQUMsQ0FBQSxPQUFELENBQVMsT0FBVCxFQURVO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUixDQUVKLENBQUMsSUFGRyxDQUVFLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO0FBQ0osZ0JBQUEsZ0NBQUE7QUFBQTtBQUFBLGlCQUFBLDRDQUFBO29DQUFBO0FBQ0UsY0FBQSxJQUFBLEdBQU8sS0FBQyxDQUFBLFVBQUQsQ0FBWSxTQUFTLENBQUMsT0FBVixDQUFBLENBQVosRUFBaUMsU0FBakMsQ0FBUCxDQUFBO0FBQUEsY0FDQSxTQUFTLENBQUMsVUFBVixDQUFxQixJQUFyQixFQUEyQjtBQUFBLGdCQUFFLFlBQUQsS0FBQyxDQUFBLFVBQUY7ZUFBM0IsQ0FEQSxDQURGO0FBQUEsYUFBQTtBQUFBLFlBR0EsS0FBQyxDQUFBLGlDQUFELENBQUEsQ0FIQSxDQUFBO21CQUlBLEtBQUMsQ0FBQSxZQUFELENBQWMsS0FBQyxDQUFBLFNBQWYsRUFBMEIsS0FBQyxDQUFBLFlBQTNCLEVBTEk7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUZGLEVBRE47T0FETztJQUFBLENBTlQsQ0FBQTs7QUFBQSwrQ0FpQkEsT0FBQSxHQUFTLFNBQUMsT0FBRCxHQUFBO0FBQ1AsVUFBQSw2RkFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLGlCQUFELEdBQXFCLEdBQUEsQ0FBQSxHQUFyQixDQUFBO0FBQUEsTUFDQSxjQUFBLEdBQWlCLGVBQUEsR0FBa0IsQ0FEbkMsQ0FBQTtBQUVBO0FBQUEsWUFJSyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxTQUFELEdBQUE7QUFDRCxjQUFBLG1CQUFBO0FBQUEsVUFBQSxLQUFBLEdBQVEsS0FBQyxDQUFBLFFBQUQsQ0FBVSxTQUFWLENBQVIsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxHQUFTLFNBQUMsTUFBRCxHQUFBO21CQUNQLEtBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxHQUFuQixDQUF1QixTQUF2QixFQUFrQyxNQUFsQyxFQURPO1VBQUEsQ0FEVCxDQUFBO0FBQUEsVUFHQSxJQUFBLEdBQU8sU0FBQyxJQUFELEdBQUE7QUFDTCxZQUFBLGVBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxJQUFjLGNBQUEsS0FBa0IsZUFBaEM7cUJBQUEsT0FBQSxDQUFBLEVBQUE7YUFGSztVQUFBLENBSFAsQ0FBQTtpQkFNQSxLQUFDLENBQUEsa0JBQUQsQ0FBb0I7QUFBQSxZQUFDLFNBQUEsT0FBRDtBQUFBLFlBQVUsTUFBQSxJQUFWO0FBQUEsWUFBZ0IsUUFBQSxNQUFoQjtBQUFBLFlBQXdCLE1BQUEsSUFBeEI7QUFBQSxZQUE4QixPQUFBLEtBQTlCO1dBQXBCLEVBUEM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUpMO0FBQUEsV0FBQSw0Q0FBQTs4QkFBQTtBQUNFLFFBQUEsK0RBQTJDLEVBQTNDLEVBQUMsZ0JBQUEsT0FBRCxFQUFVLGFBQUEsSUFBVixDQUFBO0FBQ0EsUUFBQSxJQUFBLENBQUEsQ0FBZSxpQkFBQSxJQUFhLGNBQWQsQ0FBZDtBQUFBLGdCQUFBLENBQUE7U0FEQTtBQUFBLFFBRUEsY0FBQSxFQUZBLENBQUE7QUFBQSxZQUdJLFVBSEosQ0FERjtBQUFBLE9BSE87SUFBQSxDQWpCVCxDQUFBOztBQUFBLCtDQWlDQSxrQkFBQSxHQUFvQixTQUFDLE9BQUQsR0FBQTtBQUNsQixVQUFBLHNCQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsT0FBTyxDQUFDLEtBQWhCLENBQUE7QUFBQSxNQUNBLE1BQUEsQ0FBQSxPQUFjLENBQUMsS0FEZixDQUFBO0FBQUEsTUFFQSxlQUFBLEdBQXNCLElBQUEsZUFBQSxDQUFnQixPQUFoQixDQUZ0QixDQUFBO0FBQUEsTUFHQSxlQUFlLENBQUMsZ0JBQWhCLENBQWlDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLElBQUQsR0FBQTtBQUUvQixjQUFBLDBCQUFBO0FBQUEsVUFGaUMsYUFBQSxPQUFPLGNBQUEsTUFFeEMsQ0FBQTtBQUFBLFVBQUEsSUFBRyxLQUFLLENBQUMsSUFBTixLQUFjLFFBQWQsSUFBMkIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFkLENBQXNCLE9BQXRCLENBQUEsS0FBa0MsQ0FBaEU7QUFDRSxZQUFBLFdBQUEsR0FBYyxLQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBQSxDQUFkLENBQUE7QUFBQSxZQUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksRUFBQSxHQUFHLFdBQUgsR0FBZSw0QkFBZixHQUEyQyxLQUFLLENBQUMsSUFBakQsR0FBc0QsR0FBbEUsQ0FEQSxDQUFBO0FBQUEsWUFFQSxNQUFBLENBQUEsQ0FGQSxDQURGO1dBQUE7aUJBSUEsS0FBQyxDQUFBLGVBQUQsQ0FBQSxFQU4rQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpDLENBSEEsQ0FBQTtBQVdBLE1BQUEsSUFBRyxLQUFIO0FBQ0UsUUFBQSxlQUFlLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUE5QixDQUFvQyxLQUFwQyxDQUFBLENBQUE7ZUFDQSxlQUFlLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUE5QixDQUFBLEVBRkY7T0Faa0I7SUFBQSxDQWpDcEIsQ0FBQTs7QUFBQSwrQ0FpREEsVUFBQSxHQUFZLFNBQUMsSUFBRCxFQUFPLFNBQVAsR0FBQTtBQUNWLFVBQUEsS0FBQTttRUFBd0IsS0FEZDtJQUFBLENBakRaLENBQUE7O0FBQUEsK0NBcURBLFVBQUEsR0FBWSxTQUFDLFNBQUQsR0FBQTthQUFlO0FBQUEsUUFBRSxTQUFELElBQUMsQ0FBQSxPQUFGO0FBQUEsUUFBWSxNQUFELElBQUMsQ0FBQSxJQUFaO1FBQWY7SUFBQSxDQXJEWixDQUFBOztBQUFBLCtDQXNEQSxRQUFBLEdBQVUsU0FBQyxTQUFELEdBQUE7YUFBZSxTQUFTLENBQUMsT0FBVixDQUFBLEVBQWY7SUFBQSxDQXREVixDQUFBOztBQUFBLCtDQXVEQSxTQUFBLEdBQVcsU0FBQyxTQUFELEdBQUE7YUFBZSxJQUFDLENBQUEsaUJBQWlCLENBQUMsR0FBbkIsQ0FBdUIsU0FBdkIsRUFBZjtJQUFBLENBdkRYLENBQUE7OzRDQUFBOztLQUQ2QyxnQkE5TC9DLENBQUE7O0FBQUEsRUF5UEEsZUFBQSxHQUFrQixJQXpQbEIsQ0FBQTs7QUFBQSxFQTBQTTtBQUNKLGtEQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLDJCQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxJQUNBLDJCQUFDLENBQUEsV0FBRCxHQUFjLHNFQURkLENBQUE7O0FBQUEsMENBRUEsWUFBQSxHQUFjLElBRmQsQ0FBQTs7QUFBQSwwQ0FJQSxRQUFBLEdBQVUsU0FBQSxHQUFBO3VDQUNSLGtCQUFBLGtCQUFtQixtQkFBbUIsQ0FBQyxHQUFwQixDQUF3QixTQUFDLEtBQUQsR0FBQTtBQUN6QyxZQUFBLFdBQUE7QUFBQSxRQUFBLElBQUcsS0FBSyxDQUFBLFNBQUUsQ0FBQSxjQUFQLENBQXNCLGFBQXRCLENBQUg7QUFDRSxVQUFBLFdBQUEsR0FBYyxLQUFLLENBQUEsU0FBRSxDQUFBLFdBQXJCLENBREY7U0FBQSxNQUFBO0FBR0UsVUFBQSxXQUFBLEdBQWMsQ0FBQyxDQUFDLGlCQUFGLENBQW9CLENBQUMsQ0FBQyxTQUFGLENBQVksS0FBSyxDQUFDLElBQWxCLENBQXBCLENBQWQsQ0FIRjtTQUFBO2VBSUE7QUFBQSxVQUFDLElBQUEsRUFBTSxLQUFQO0FBQUEsVUFBYyxhQUFBLFdBQWQ7VUFMeUM7TUFBQSxDQUF4QixFQURYO0lBQUEsQ0FKVixDQUFBOztBQUFBLDBDQVlBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixNQUFBLDZEQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsUUFBUSxDQUFDLHNCQUFWLENBQWlDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLFdBQUQsR0FBQTtBQUMvQixjQUFBLGFBQUE7QUFBQSxVQUFBLEtBQUMsQ0FBQSxRQUFRLENBQUMsS0FBVixDQUFBLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBQSx5Q0FBZ0IsQ0FBRSxXQUFXLENBQUMsYUFEOUIsQ0FBQTtpQkFFQSxLQUFDLENBQUEsUUFBUSxDQUFDLGNBQWMsQ0FBQyxHQUF6QixDQUE2QixXQUFXLENBQUMsSUFBekMsRUFBK0M7QUFBQSxZQUFDLFFBQUEsTUFBRDtXQUEvQyxFQUgrQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpDLENBRkEsQ0FBQTthQU1BLElBQUMsQ0FBQSxlQUFELENBQWlCO0FBQUEsUUFBQyxLQUFBLEVBQU8sSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFSO09BQWpCLEVBUFU7SUFBQSxDQVpaLENBQUE7O0FBQUEsMENBcUJBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFFUCxZQUFVLElBQUEsS0FBQSxDQUFNLEVBQUEsR0FBRSxDQUFDLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBRCxDQUFGLEdBQWMseUJBQXBCLENBQVYsQ0FGTztJQUFBLENBckJULENBQUE7O3VDQUFBOztLQUR3QyxnQkExUDFDLENBQUE7O0FBQUEsRUFvUk07QUFDSixnREFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSx5QkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsd0NBQ0EsTUFBQSxHQUFRLFdBRFIsQ0FBQTs7cUNBQUE7O0tBRHNDLDRCQXBSeEMsQ0FBQTs7QUFBQSxFQXdSTTtBQUNKLHFEQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLDhCQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxJQUNBLDhCQUFDLENBQUEsV0FBRCxHQUFjLCtEQURkLENBQUE7O0FBQUEsNkNBRUEsTUFBQSxHQUFRLGdCQUZSLENBQUE7OzBDQUFBOztLQUQyQyw0QkF4UjdDLENBQUE7O0FBQUEsRUE4Uk07QUFDSiwwQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxtQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsSUFDQSxtQkFBQyxDQUFBLFdBQUQsR0FBYyw4Q0FEZCxDQUFBOztBQUFBLGtDQUVBLEtBQUEsR0FBTztBQUFBLE1BQUEsSUFBQSxFQUFNLHlCQUFOO0FBQUEsTUFBaUMsS0FBQSxFQUFPLFVBQXhDO0tBRlAsQ0FBQTs7QUFBQSxrQ0FHQSxVQUFBLEdBQVksU0FBQyxJQUFELEdBQUE7YUFDVixJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFuQixDQUFBLEVBRFU7SUFBQSxDQUhaLENBQUE7OytCQUFBOztLQURnQyxnQkE5UmxDLENBQUE7O0FBQUEsRUFzU007QUFDSix1Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxnQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsSUFDQSxnQkFBQyxDQUFBLFdBQUQsR0FBYyxpQ0FEZCxDQUFBOztBQUFBLCtCQUVBLFVBQUEsR0FBWSxTQUFDLElBQUQsRUFBTyxTQUFQLEdBQUE7QUFDVixVQUFBLE9BQUE7QUFBQSxNQUFBLE9BQUEsR0FBVSxJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFuQixDQUFBLENBQVYsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGlCQUFELENBQW1CLElBQW5CLEVBQXlCLFNBQXpCLENBREEsQ0FBQTthQUVBLFFBSFU7SUFBQSxDQUZaLENBQUE7OzRCQUFBOztLQUQ2QixnQkF0Uy9CLENBQUE7O0FBQUEsRUFnVE07QUFDSiw2QkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxNQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxxQkFDQSxLQUFBLEdBQU87QUFBQSxNQUFBLElBQUEsRUFBTSxVQUFOO0FBQUEsTUFBa0IsS0FBQSxFQUFPLGVBQXpCO0tBRFAsQ0FBQTs7QUFBQSxxQkFFQSxjQUFBLEdBQWdCLEtBRmhCLENBQUE7O0FBQUEscUJBR0EsZ0JBQUEsR0FBa0IsSUFIbEIsQ0FBQTs7QUFBQSxxQkFJQSx1QkFBQSxHQUF5QixLQUp6QixDQUFBOztBQUFBLHFCQU1BLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxNQUFBLElBQUEsQ0FBQSxJQUFRLENBQUEsUUFBRCxDQUFBLENBQVA7QUFDRSxRQUFBLElBQUMsQ0FBQSwyQkFBRCxDQUE2QixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFDM0IsS0FBQyxDQUFBLE1BQU0sQ0FBQywwQkFBUixDQUFBLEVBRDJCO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0IsQ0FBQSxDQURGO09BQUE7YUFHQSxxQ0FBQSxTQUFBLEVBSk87SUFBQSxDQU5ULENBQUE7O0FBQUEscUJBWUEsZUFBQSxHQUFpQixTQUFDLFNBQUQsR0FBQTthQUNmLFNBQVMsQ0FBQyxrQkFBVixDQUFBLEVBRGU7SUFBQSxDQVpqQixDQUFBOztrQkFBQTs7S0FEbUIsZ0JBaFRyQixDQUFBOztBQUFBLEVBZ1VNO0FBQ0osOEJBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsT0FBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsc0JBQ0EsS0FBQSxHQUFPO0FBQUEsTUFBQSxJQUFBLEVBQU0sV0FBTjtBQUFBLE1BQW1CLEtBQUEsRUFBTyxjQUExQjtLQURQLENBQUE7O0FBQUEsc0JBRUEsZUFBQSxHQUFpQixTQUFDLFNBQUQsR0FBQTthQUNmLFNBQVMsQ0FBQyxtQkFBVixDQUFBLEVBRGU7SUFBQSxDQUZqQixDQUFBOzttQkFBQTs7S0FEb0IsT0FoVXRCLENBQUE7O0FBQUEsRUFzVU07QUFDSixpQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxVQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSx5QkFDQSxLQUFBLEdBQU87QUFBQSxNQUFBLElBQUEsRUFBTSxlQUFOO0FBQUEsTUFBdUIsS0FBQSxFQUFPLGNBQTlCO0tBRFAsQ0FBQTs7QUFBQSx5QkFFQSxlQUFBLEdBQWlCLFNBQUMsU0FBRCxHQUFBO2FBQ2YsU0FBUyxDQUFDLHNCQUFWLENBQUEsRUFEZTtJQUFBLENBRmpCLENBQUE7O3NCQUFBOztLQUR1QixPQXRVekIsQ0FBQTs7QUFBQSxFQTRVTTtBQUNKLHlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGtCQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxpQ0FDQSxLQUFBLEdBQU87QUFBQSxNQUFBLElBQUEsRUFBTSx3QkFBTjtBQUFBLE1BQWdDLEtBQUEsRUFBTyxRQUF2QztLQURQLENBQUE7O0FBQUEsaUNBRUEsZ0JBQUEsR0FBa0IsSUFGbEIsQ0FBQTs7QUFBQSxpQ0FHQSxlQUFBLEdBQWlCLFNBQUMsU0FBRCxHQUFBO2FBQ2YsU0FBUyxDQUFDLGtCQUFWLENBQUEsRUFEZTtJQUFBLENBSGpCLENBQUE7OzhCQUFBOztLQUQrQixnQkE1VWpDLENBQUE7O0FBQUEsRUFxVk07QUFDSiwrQkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxRQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxJQUNBLFFBQUMsQ0FBQSxXQUFELEdBQWMsNERBRGQsQ0FBQTs7QUFBQSx1QkFFQSxXQUFBLEdBQWEsYUFGYixDQUFBOztBQUFBLHVCQUdBLEtBQUEsR0FBTztBQUFBLE1BQUEsSUFBQSxFQUFNLFlBQU47QUFBQSxNQUFvQixLQUFBLEVBQU8sMkJBQTNCO0tBSFAsQ0FBQTs7QUFBQSx1QkFJQSxLQUFBLEdBQU8sQ0FDTCxDQUFDLEdBQUQsRUFBTSxHQUFOLENBREssRUFFTCxDQUFDLEdBQUQsRUFBTSxHQUFOLENBRkssRUFHTCxDQUFDLEdBQUQsRUFBTSxHQUFOLENBSEssRUFJTCxDQUFDLEdBQUQsRUFBTSxHQUFOLENBSkssQ0FKUCxDQUFBOztBQUFBLHVCQVVBLEtBQUEsR0FBTyxJQVZQLENBQUE7O0FBQUEsdUJBV0EsUUFBQSxHQUFVLENBWFYsQ0FBQTs7QUFBQSx1QkFZQSxZQUFBLEdBQWMsSUFaZCxDQUFBOztBQUFBLHVCQWFBLFVBQUEsR0FBWSxLQWJaLENBQUE7O0FBQUEsdUJBZUEsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLE1BQUEsMENBQUEsU0FBQSxDQUFBLENBQUE7QUFFQSxNQUFBLElBQUEsQ0FBQSxJQUFlLENBQUEsWUFBZjtBQUFBLGNBQUEsQ0FBQTtPQUZBO0FBQUEsTUFHQSxJQUFDLENBQUEsaUJBQUQsQ0FBbUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsS0FBRCxHQUFBO2lCQUFXLEtBQUMsQ0FBQSxTQUFELENBQVcsS0FBWCxFQUFYO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkIsQ0FIQSxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsS0FBRCxHQUFBO2lCQUFXLEtBQUMsQ0FBQSxRQUFELENBQVUsS0FBVixFQUFYO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEIsQ0FKQSxDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsZUFBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQixDQUxBLENBQUE7QUFNQSxNQUFBLElBQUcsSUFBQyxDQUFBLGFBQUo7ZUFDRSxJQUFDLENBQUEsY0FBRCxDQUFnQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFDZCxLQUFDLENBQUEsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFoQixDQUFzQjtBQUFBLGNBQUUsVUFBRCxLQUFDLENBQUEsUUFBRjthQUF0QixFQURjO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEIsRUFERjtPQUFBLE1BQUE7ZUFJRSxJQUFDLENBQUEsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFoQixDQUFzQjtBQUFBLFVBQUUsVUFBRCxJQUFDLENBQUEsUUFBRjtTQUF0QixFQUpGO09BUFU7SUFBQSxDQWZaLENBQUE7O0FBQUEsdUJBNEJBLFNBQUEsR0FBVyxTQUFFLEtBQUYsR0FBQTtBQUNULE1BRFUsSUFBQyxDQUFBLFFBQUEsS0FDWCxDQUFBO2FBQUEsSUFBQyxDQUFBLGdCQUFELENBQUEsRUFEUztJQUFBLENBNUJYLENBQUE7O0FBQUEsdUJBK0JBLE9BQUEsR0FBUyxTQUFDLElBQUQsR0FBQTtBQUNQLFVBQUEsSUFBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBQyxDQUFBLEtBQVYsRUFBaUIsU0FBQyxJQUFELEdBQUE7ZUFBVSxlQUFRLElBQVIsRUFBQSxJQUFBLE9BQVY7TUFBQSxDQUFqQixDQUFQLENBQUE7NEJBQ0EsT0FBQSxPQUFRLENBQUMsSUFBRCxFQUFPLElBQVAsRUFGRDtJQUFBLENBL0JULENBQUE7O0FBQUEsdUJBbUNBLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsT0FBYixHQUFBO0FBQ1IsVUFBQSxxQ0FBQTs7UUFEcUIsVUFBUTtPQUM3QjtBQUFBLE1BQUEsVUFBQSxrREFBa0MsS0FBbEMsQ0FBQTtBQUFBLE1BQ0EsUUFBZ0IsSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFULENBQWhCLEVBQUMsZUFBRCxFQUFPLGdCQURQLENBQUE7QUFFQSxNQUFBLElBQUcsQ0FBQyxDQUFBLFVBQUQsQ0FBQSxJQUFxQixnQkFBZ0IsQ0FBQyxJQUFqQixDQUFzQixJQUF0QixDQUF4QjtBQUNFLFFBQUEsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFkLENBQUE7QUFBQSxRQUNBLElBQUEsSUFBUSxJQURSLENBQUE7QUFBQSxRQUVBLEtBQUEsSUFBUyxJQUZULENBREY7T0FGQTtBQU9BLE1BQUEsSUFBRyxlQUFRLFFBQVEsQ0FBQyxHQUFULENBQWEsZ0NBQWIsQ0FBUixFQUFBLElBQUEsTUFBQSxJQUEyRCxZQUFBLENBQWEsSUFBYixDQUE5RDtlQUNFLElBQUEsR0FBTyxHQUFQLEdBQWEsSUFBYixHQUFvQixHQUFwQixHQUEwQixNQUQ1QjtPQUFBLE1BQUE7ZUFHRSxJQUFBLEdBQU8sSUFBUCxHQUFjLE1BSGhCO09BUlE7SUFBQSxDQW5DVixDQUFBOztBQUFBLHVCQWdEQSxVQUFBLEdBQVksU0FBQyxJQUFELEdBQUE7YUFDVixJQUFDLENBQUEsUUFBRCxDQUFVLElBQVYsRUFBZ0IsSUFBQyxDQUFBLEtBQWpCLEVBRFU7SUFBQSxDQWhEWixDQUFBOztvQkFBQTs7S0FEcUIsZ0JBclZ2QixDQUFBOztBQUFBLEVBeVlNO0FBQ0osbUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsWUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsSUFDQSxZQUFDLENBQUEsV0FBRCxHQUFjLG1CQURkLENBQUE7O0FBQUEsMkJBRUEsTUFBQSxHQUFRLFdBRlIsQ0FBQTs7d0JBQUE7O0tBRHlCLFNBelkzQixDQUFBOztBQUFBLEVBOFlNO0FBQ0osd0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsaUJBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLElBQ0EsaUJBQUMsQ0FBQSxXQUFELEdBQWMseUJBRGQsQ0FBQTs7QUFBQSxnQ0FFQSxNQUFBLEdBQVEsZ0JBRlIsQ0FBQTs7NkJBQUE7O0tBRDhCLFNBOVloQyxDQUFBOztBQUFBLEVBbVpNO0FBQ0osa0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsV0FBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsSUFDQSxXQUFDLENBQUEsV0FBRCxHQUFjLDJDQURkLENBQUE7O0FBQUEsMEJBRUEsVUFBQSxHQUFZLElBRlosQ0FBQTs7QUFBQSwwQkFHQSxvQkFBQSxHQUFzQixNQUh0QixDQUFBOzt1QkFBQTs7S0FEd0IsU0FuWjFCLENBQUE7O0FBQUEsRUF5Wk07QUFDSixxQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxjQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxJQUNBLGNBQUMsQ0FBQSxXQUFELEdBQWMseURBRGQsQ0FBQTs7QUFBQSw2QkFFQSxTQUFBLEdBQVcsQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLElBQWIsQ0FBa0IsQ0FBQyxJQUFuQixDQUF3QixFQUF4QixDQUZYLENBQUE7O0FBQUEsNkJBR0EsYUFBQSxHQUFlLEtBSGYsQ0FBQTs7QUFBQSw2QkFLQSxTQUFBLEdBQVcsU0FBRSxLQUFGLEdBQUE7QUFFVCxVQUFBLEtBQUE7QUFBQSxNQUZVLElBQUMsQ0FBQSxRQUFBLEtBRVgsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsS0FBQSxDQUFELENBQUssTUFBTCxFQUNUO0FBQUEsUUFBQSxJQUFBLEVBQU0sSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFDLENBQUEsS0FBVixDQUFOO0FBQUEsUUFDQSxLQUFBLEVBQU8sS0FEUDtBQUFBLFFBRUEsYUFBQSxFQUFlLFNBQUMsSUFBQyxDQUFBLEtBQUQsRUFBQSxlQUFVLElBQUMsQ0FBQSxTQUFYLEVBQUEsS0FBQSxNQUFELENBRmY7T0FEUyxDQUFYLENBQUEsQ0FBQTthQUlBLElBQUMsQ0FBQSxnQkFBRCxDQUFBLEVBTlM7SUFBQSxDQUxYLENBQUE7O0FBQUEsNkJBYUEsVUFBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO0FBQ1YsVUFBQSwwQkFBQTtBQUFBLE1BQUEsUUFBd0IsQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFOLEVBQVUsQ0FBQyxDQUFDLElBQUYsQ0FBTyxJQUFQLENBQVYsQ0FBeEIsRUFBQyxtQkFBRCxFQUFXLG9CQUFYLENBQUE7QUFBQSxNQUNBLElBQUEsR0FBTyxJQUFLLGFBRFosQ0FBQTtBQUVBLE1BQUEsSUFBRyxZQUFBLENBQWEsSUFBYixDQUFIO0FBQ0UsUUFBQSxJQUFzQixRQUFBLEtBQWMsU0FBcEM7QUFBQSxVQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsSUFBTCxDQUFBLENBQVAsQ0FBQTtTQURGO09BRkE7YUFJQSxLQUxVO0lBQUEsQ0FiWixDQUFBOzswQkFBQTs7S0FEMkIsU0F6WjdCLENBQUE7O0FBQUEsRUE4YU07QUFDSiw0Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxxQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsSUFDQSxxQkFBQyxDQUFBLFdBQUQsR0FBYyxnRkFEZCxDQUFBOztBQUFBLG9DQUVBLFlBQUEsR0FBYyxLQUZkLENBQUE7O0FBQUEsb0NBR0EsTUFBQSxHQUFRLFVBSFIsQ0FBQTs7aUNBQUE7O0tBRGtDLGVBOWFwQyxDQUFBOztBQUFBLEVBb2JNO0FBQ0osMkRBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsb0NBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLElBQ0Esb0NBQUMsQ0FBQSxXQUFELEdBQWMscUhBRGQsQ0FBQTs7QUFBQSxtREFFQSxNQUFBLEdBQVEseUJBRlIsQ0FBQTs7Z0RBQUE7O0tBRGlELHNCQXBibkQsQ0FBQTs7QUFBQSxFQXliTTtBQUNKLHFDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGNBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLElBQ0EsY0FBQyxDQUFBLFdBQUQsR0FBYywrREFEZCxDQUFBOztBQUFBLDZCQUVBLFFBQUEsR0FBVSxDQUZWLENBQUE7O0FBQUEsNkJBR0EsSUFBQSxHQUFNLElBSE4sQ0FBQTs7QUFBQSw2QkFLQSxTQUFBLEdBQVcsU0FBQyxLQUFELEdBQUE7QUFDVCxVQUFBLFdBQUE7QUFBQSxNQUFBLElBQUEsQ0FBQSxLQUFBO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFBQSxNQUNBLFFBQWdCLEtBQUssQ0FBQyxLQUFOLENBQVksRUFBWixDQUFoQixFQUFDLGVBQUQsRUFBTyxJQUFDLENBQUEsZUFEUixDQUFBO2FBRUEsOENBQU0sSUFBTixFQUhTO0lBQUEsQ0FMWCxDQUFBOztBQUFBLDZCQVVBLFVBQUEsR0FBWSxTQUFDLElBQUQsR0FBQTtBQUNWLFVBQUEsU0FBQTtBQUFBLE1BQUEsU0FBQSxHQUFZLGdEQUFBLFNBQUEsQ0FBWixDQUFBO2FBQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBVSxTQUFWLEVBQXFCLElBQUMsQ0FBQSxJQUF0QixFQUE0QjtBQUFBLFFBQUEsVUFBQSxFQUFZLElBQVo7T0FBNUIsRUFGVTtJQUFBLENBVlosQ0FBQTs7MEJBQUE7O0tBRDJCLGVBemI3QixDQUFBOztBQUFBLEVBd2NNO0FBQ0osNENBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEscUJBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLElBQ0EscUJBQUMsQ0FBQSxXQUFELEdBQWMsdURBRGQsQ0FBQTs7QUFBQSxvQ0FFQSxRQUFBLEdBQVUsQ0FGVixDQUFBOztBQUFBLG9DQUdBLE1BQUEsR0FBUSxVQUhSLENBQUE7O0FBQUEsb0NBS0EsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLE1BQUEsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNkLGNBQUEsYUFBQTtBQUFBLFVBQUEsS0FBQyxDQUFBLGtCQUFELEdBQTBCLElBQUEscUJBQUEsQ0FBc0IsS0FBQyxDQUFBLE1BQXZCLENBQTFCLENBQUE7QUFBQSxVQUNBLEtBQUMsQ0FBQSxrQkFBa0IsQ0FBQyxJQUFwQixDQUF5QixNQUF6QixDQURBLENBQUE7QUFBQSxVQUVBLGFBQUEsR0FBZ0IsS0FBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFBLENBRmhCLENBQUE7QUFBQSxVQUlBLEtBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFBLENBSkEsQ0FBQTtBQUtBLFVBQUEsSUFBQSxDQUFBLGlCQUFPLENBQWtCLEtBQUMsQ0FBQSxNQUFuQixDQUFQO0FBQ0UsWUFBQSxLQUFDLENBQUEsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFoQixDQUFBLENBQUEsQ0FBQTtBQUFBLFlBQ0EsS0FBQyxDQUFBLEtBQUQsQ0FBQSxDQURBLENBREY7V0FMQTtpQkFRQSxLQUFDLENBQUEsUUFBRCxDQUFVLEtBQUMsQ0FBQSxNQUFNLENBQUMsZUFBUixDQUFBLENBQTBCLENBQUEsQ0FBQSxDQUFwQyxFQUF3QyxFQUF4QyxFQUE0QyxhQUE1QyxFQVRjO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEIsQ0FBQSxDQUFBO2FBVUEsdURBQUEsU0FBQSxFQVhVO0lBQUEsQ0FMWixDQUFBOztBQUFBLG9DQWtCQSxTQUFBLEdBQVcsU0FBRSxJQUFGLEdBQUE7QUFFVCxNQUZVLElBQUMsQ0FBQSxPQUFBLElBRVgsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLGtCQUFrQixDQUFDLE9BQXBCLENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsa0JBQUQsR0FBc0IsSUFEdEIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFDLENBQUEsSUFGVixDQUFBO2FBR0EsSUFBQyxDQUFBLGdCQUFELENBQUEsRUFMUztJQUFBLENBbEJYLENBQUE7O2lDQUFBOztLQURrQyxlQXhjcEMsQ0FBQTs7QUFBQSxFQWtlTTtBQUNKLDJEQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLG9DQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxJQUNBLG9DQUFDLENBQUEsV0FBRCxHQUFjLHlGQURkLENBQUE7O0FBQUEsbURBRUEsTUFBQSxHQUFRLHlCQUZSLENBQUE7O2dEQUFBOztLQURpRCxzQkFsZW5ELENBQUE7O0FBQUEsRUE0ZU07QUFDSiwyQkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxJQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxtQkFDQSxNQUFBLEdBQVEsb0JBRFIsQ0FBQTs7QUFBQSxtQkFFQSxXQUFBLEdBQWEsS0FGYixDQUFBOztBQUFBLG1CQUdBLGdCQUFBLEdBQWtCLEtBSGxCLENBQUE7O0FBQUEsbUJBS0EsZUFBQSxHQUFpQixTQUFDLFNBQUQsR0FBQTtBQUNmLFVBQUEsVUFBQTtBQUFBLE1BQUEsSUFBRyxLQUFBLENBQU0sU0FBTixDQUFnQixDQUFDLFVBQWpCLENBQUEsQ0FBSDtBQUNFLFFBQUEsS0FBQSxHQUFRLFNBQVMsQ0FBQyxjQUFWLENBQUEsQ0FBUixDQUFBO0FBQUEsUUFDQSxTQUFTLENBQUMsY0FBVixDQUF5QixLQUFLLENBQUMsU0FBTixDQUFnQixDQUFDLENBQUQsRUFBSSxDQUFKLENBQWhCLEVBQXdCLENBQUMsQ0FBQSxDQUFELEVBQUssUUFBTCxDQUF4QixDQUF6QixDQURBLENBREY7T0FBQTtBQUFBLE1BR0EsU0FBUyxDQUFDLFNBQVYsQ0FBQSxDQUhBLENBQUE7QUFBQSxNQUlBLEdBQUEsR0FBTSxTQUFTLENBQUMsY0FBVixDQUFBLENBQTBCLENBQUMsR0FKakMsQ0FBQTthQUtBLFNBQVMsQ0FBQyxNQUFNLENBQUMsaUJBQWpCLENBQW1DLEdBQUcsQ0FBQyxTQUFKLENBQWMsQ0FBQyxDQUFELEVBQUksQ0FBQSxDQUFKLENBQWQsQ0FBbkMsRUFOZTtJQUFBLENBTGpCLENBQUE7O2dCQUFBOztLQURpQixnQkE1ZW5CLENBQUE7O0FBQUEsRUEwZk07QUFDSiwyQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxvQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsSUFDQSxvQkFBQyxDQUFBLG9CQUFELENBQUEsQ0FEQSxDQUFBOztBQUFBLG1DQUVBLEtBQUEsR0FBTyxFQUZQLENBQUE7O0FBQUEsbUNBR0EsYUFBQSxHQUFlLEtBSGYsQ0FBQTs7QUFBQSxtQ0FJQSxJQUFBLEdBQU0sS0FKTixDQUFBOztBQUFBLG1DQUtBLFVBQUEsR0FBWSxTQUFBLEdBQUE7YUFDVixJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxLQUFBLENBQUQsQ0FBSywrQkFBTCxFQUFzQztBQUFBLFFBQUMsR0FBQSxFQUFLLENBQU47T0FBdEMsQ0FBWCxFQURVO0lBQUEsQ0FMWixDQUFBOztBQUFBLG1DQVFBLGVBQUEsR0FBaUIsU0FBQyxTQUFELEdBQUE7QUFDZixVQUFBLHdDQUFBO0FBQUEsTUFBQSxRQUFxQixTQUFTLENBQUMsaUJBQVYsQ0FBQSxDQUFyQixFQUFDLG1CQUFELEVBQVcsaUJBQVgsQ0FBQTtBQUFBLE1BQ0EsS0FBQSxDQUFNLFNBQU4sQ0FBZ0IsQ0FBQyxjQUFqQixDQUFBLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQTs7QUFBTzthQUFXLDZHQUFYLEdBQUE7QUFDTCxVQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsTUFBTSxDQUFDLG9CQUFSLENBQTZCLEdBQTdCLENBQVAsQ0FBQTtBQUNBLFVBQUEsSUFBRyxJQUFDLENBQUEsSUFBRCxJQUFVLEdBQUEsS0FBUyxRQUF0QjswQkFDRSxJQUFJLENBQUMsUUFBTCxDQUFBLEdBREY7V0FBQSxNQUFBOzBCQUdFLE1BSEY7V0FGSztBQUFBOzttQkFGUCxDQUFBO2FBUUEsU0FBUyxDQUFDLFVBQVYsQ0FBcUIsSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFOLENBQUEsR0FBYyxJQUFuQyxFQVRlO0lBQUEsQ0FSakIsQ0FBQTs7QUFBQSxtQ0FtQkEsSUFBQSxHQUFNLFNBQUMsSUFBRCxHQUFBO2FBQ0osSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFDLENBQUEsS0FBWCxFQURJO0lBQUEsQ0FuQk4sQ0FBQTs7Z0NBQUE7O0tBRGlDLGdCQTFmbkMsQ0FBQTs7QUFBQSxFQWloQk07QUFDSixrQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxXQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxJQUNBLFdBQUMsQ0FBQSxvQkFBRCxDQUFBLENBREEsQ0FBQTs7QUFBQSxJQUVBLFdBQUMsQ0FBQSxXQUFELEdBQWMsMkVBRmQsQ0FBQTs7QUFBQSwwQkFHQSxLQUFBLEdBQU87QUFBQSxNQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsTUFBZ0IsS0FBQSxFQUFPLFVBQXZCO0tBSFAsQ0FBQTs7QUFBQSwwQkFJQSxZQUFBLEdBQWMsSUFKZCxDQUFBOztBQUFBLDBCQUtBLEtBQUEsR0FBTyxJQUxQLENBQUE7O0FBQUEsMEJBTUEsSUFBQSxHQUFNLElBTk4sQ0FBQTs7QUFBQSwwQkFPQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSw2Q0FBQSxTQUFBLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxVQUFELENBQVk7QUFBQSxRQUFBLFFBQUEsRUFBVSxFQUFWO09BQVosRUFGVTtJQUFBLENBUFosQ0FBQTs7QUFBQSwwQkFXQSxJQUFBLEdBQU0sU0FBQyxJQUFELEdBQUE7YUFDSixJQUFJLENBQUMsSUFBTCxDQUFXLEdBQUEsR0FBRyxJQUFDLENBQUEsS0FBSixHQUFVLEdBQXJCLEVBREk7SUFBQSxDQVhOLENBQUE7O3VCQUFBOztLQUR3QixxQkFqaEIxQixDQUFBOztBQUFBLEVBZ2lCTTtBQUNKLGtEQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLDJCQUFDLENBQUEsV0FBRCxHQUFjLG9EQUFkLENBQUE7O0FBQUEsSUFDQSwyQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQURBLENBQUE7O0FBQUEsSUFFQSwyQkFBQyxDQUFBLG9CQUFELENBQUEsQ0FGQSxDQUFBOztBQUFBLDBDQUdBLElBQUEsR0FBTSxLQUhOLENBQUE7O0FBQUEsMENBSUEsSUFBQSxHQUFNLFNBQUMsSUFBRCxHQUFBO2FBQ0osSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFDLENBQUEsS0FBWCxFQURJO0lBQUEsQ0FKTixDQUFBOzt1Q0FBQTs7S0FEd0MsWUFoaUIxQyxDQUFBOztBQUFBLEVBMGlCTTtBQUNKLGtDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFdBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLElBQ0EsV0FBQyxDQUFBLG9CQUFELENBQUEsQ0FEQSxDQUFBOztBQUFBLElBRUEsV0FBQyxDQUFBLFdBQUQsR0FBYywwRUFGZCxDQUFBOztBQUFBLDBCQUdBLEtBQUEsR0FBTztBQUFBLE1BQUEsSUFBQSxFQUFNLGdCQUFOO0FBQUEsTUFBd0IsS0FBQSxFQUFPLFNBQS9CO0tBSFAsQ0FBQTs7QUFBQSwwQkFJQSxZQUFBLEdBQWMsSUFKZCxDQUFBOztBQUFBLDBCQUtBLEtBQUEsR0FBTyxJQUxQLENBQUE7O0FBQUEsMEJBT0EsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLE1BQUEsNkNBQUEsU0FBQSxDQUFBLENBQUE7QUFDQSxNQUFBLElBQUEsQ0FBQSxJQUFRLENBQUEsTUFBRCxDQUFRLFFBQVIsQ0FBUDtBQUNFLFFBQUEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsS0FBQSxDQUFELENBQUssb0JBQUwsRUFBMkI7QUFBQSxVQUFDLEdBQUEsRUFBSyxDQUFOO1NBQTNCLENBQVgsQ0FBQSxDQURGO09BREE7YUFHQSxJQUFDLENBQUEsVUFBRCxDQUFZO0FBQUEsUUFBQSxRQUFBLEVBQVUsRUFBVjtPQUFaLEVBSlU7SUFBQSxDQVBaLENBQUE7O0FBQUEsMEJBYUEsVUFBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO0FBQ1YsVUFBQSxLQUFBO0FBQUEsTUFBQSxJQUFrQixJQUFDLENBQUEsS0FBRCxLQUFVLEVBQTVCO0FBQUEsUUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLEtBQVQsQ0FBQTtPQUFBO0FBQUEsTUFDQSxLQUFBLEdBQVEsTUFBQSxDQUFBLEVBQUEsR0FBSSxDQUFDLENBQUMsQ0FBQyxZQUFGLENBQWUsSUFBQyxDQUFBLEtBQWhCLENBQUQsQ0FBSixFQUErQixHQUEvQixDQURSLENBQUE7YUFFQSxJQUFJLENBQUMsS0FBTCxDQUFXLEtBQVgsQ0FBaUIsQ0FBQyxJQUFsQixDQUF1QixJQUF2QixFQUhVO0lBQUEsQ0FiWixDQUFBOzt1QkFBQTs7S0FEd0IsZ0JBMWlCMUIsQ0FBQTs7QUFBQSxFQTZqQk07QUFDSixrQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxXQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUFBLDBCQUNBLElBQUEsR0FBTSxVQUROLENBQUE7O0FBQUEsMEJBR0EsZUFBQSxHQUFpQixTQUFDLFNBQUQsR0FBQTtBQUNmLFVBQUEsMEJBQUE7QUFBQSxNQUFBLFdBQUEsR0FBYyxLQUFBLENBQU0sU0FBTixDQUFnQixDQUFDLHFCQUFqQixDQUFBLENBQWQsQ0FBQTtBQUFBLE1BQ0EsSUFBQSxHQUFPLElBQUMsQ0FBQSxVQUFELENBQVksV0FBWixDQURQLENBQUE7QUFBQSxNQUVBLE9BQUEsR0FBVSxJQUFJLENBQUMsSUFBTCxDQUFVLElBQVYsQ0FBQSxHQUFrQixJQUY1QixDQUFBO2FBR0EsU0FBUyxDQUFDLFVBQVYsQ0FBcUIsT0FBckIsRUFKZTtJQUFBLENBSGpCLENBQUE7O3VCQUFBOztLQUR3QixnQkE3akIxQixDQUFBOztBQUFBLEVBdWtCTTtBQUNKLDhCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLE9BQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLElBQ0EsT0FBQyxDQUFBLG9CQUFELENBQUEsQ0FEQSxDQUFBOztBQUFBLElBRUEsT0FBQyxDQUFBLFdBQUQsR0FBYyxnREFGZCxDQUFBOztBQUFBLHNCQUdBLFVBQUEsR0FBWSxTQUFDLElBQUQsR0FBQTthQUNWLElBQUksQ0FBQyxPQUFMLENBQUEsRUFEVTtJQUFBLENBSFosQ0FBQTs7bUJBQUE7O0tBRG9CLFlBdmtCdEIsQ0FBQTs7QUFBQSxFQThrQk07QUFDSiwyQkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxJQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxJQUNBLElBQUMsQ0FBQSxvQkFBRCxDQUFBLENBREEsQ0FBQTs7QUFBQSxJQUVBLElBQUMsQ0FBQSxXQUFELEdBQWMsMkJBRmQsQ0FBQTs7QUFBQSxtQkFHQSxVQUFBLEdBQVksU0FBQyxJQUFELEdBQUE7YUFDVixJQUFJLENBQUMsSUFBTCxDQUFBLEVBRFU7SUFBQSxDQUhaLENBQUE7O2dCQUFBOztLQURpQixZQTlrQm5CLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/operator-transform-string.coffee
