(function() {
  var Disposable, KeymapManager, Point, Range, TextData, VimEditor, buildKeydownEvent, buildKeydownEventFromKeystroke, buildTextInputEvent, characterForKeyboardEvent, dispatch, getHiddenInputElementForEditor, getView, getVimState, headFromProperty, inspect, isPoint, isRange, keydown, normalizeKeystrokes, rawKeystroke, supportedModeClass, swrap, toArray, toArrayOfPoint, toArrayOfRange, withMockPlatform, _, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point, Disposable = _ref.Disposable;

  inspect = require('util').inspect;

  swrap = require('../lib/selection-wrapper');

  KeymapManager = atom.keymaps.constructor;

  normalizeKeystrokes = require(atom.config.resourcePath + "/node_modules/atom-keymap/lib/helpers").normalizeKeystrokes;

  supportedModeClass = ['normal-mode', 'visual-mode', 'insert-mode', 'replace', 'linewise', 'blockwise', 'characterwise'];

  getView = function(model) {
    return atom.views.getView(model);
  };

  dispatch = function(target, command) {
    return atom.commands.dispatch(target, command);
  };

  withMockPlatform = function(target, platform, fn) {
    var wrapper;
    wrapper = document.createElement('div');
    wrapper.className = platform;
    wrapper.appendChild(target);
    fn();
    return target.parentNode.removeChild(target);
  };

  buildKeydownEvent = function(key, options) {
    return KeymapManager.buildKeydownEvent(key, options);
  };

  headFromProperty = function(selection) {
    return swrap(selection).getBufferPositionFor('head', {
      fromProperty: true
    });
  };

  buildKeydownEventFromKeystroke = function(keystroke, target) {
    var key, modifier, options, part, parts, _i, _len;
    modifier = ['ctrl', 'alt', 'shift', 'cmd'];
    parts = keystroke === '-' ? ['-'] : keystroke.split('-');
    options = {
      target: target
    };
    key = null;
    for (_i = 0, _len = parts.length; _i < _len; _i++) {
      part = parts[_i];
      if (__indexOf.call(modifier, part) >= 0) {
        options[part] = true;
      } else {
        key = part;
      }
    }
    if (key === 'space') {
      key = ' ';
    }
    return buildKeydownEvent(key, options);
  };

  buildTextInputEvent = function(key) {
    var event, eventArgs;
    eventArgs = [true, true, window, key];
    event = document.createEvent('TextEvent');
    event.initTextEvent.apply(event, ["textInput"].concat(__slice.call(eventArgs)));
    return event;
  };

  getHiddenInputElementForEditor = function(editor) {
    return editor.element.component.hiddenInputComponent.getDomNode();
  };

  characterForKeyboardEvent = function(event) {
    var key;
    if (!(event.ctrlKey || event.altKey || event.metaKey)) {
      if (key = atom.keymaps.keystrokeForKeyboardEvent(event)) {
        if (key === 'space') {
          key = ' ';
        }
        if (key.startsWith('shift-')) {
          key = key[key.length - 1];
        }
        if (key.length === 1) {
          return key;
        }
      }
    }
  };

  keydown = function(key, target) {
    var event;
    if (target == null) {
      target = document.activeElement;
    }
    event = buildKeydownEventFromKeystroke(key, target);
    return atom.keymaps.handleKeyboardEvent(event);
  };

  rawKeystroke = function(keystrokes, target) {
    var key, _i, _len, _ref1, _results;
    _ref1 = normalizeKeystrokes(keystrokes).split(/\s+/);
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      key = _ref1[_i];
      _results.push(keydown(key, target));
    }
    return _results;
  };

  isPoint = function(obj) {
    if (obj instanceof Point) {
      return true;
    } else {
      return obj.length === 2 && _.isNumber(obj[0]) && _.isNumber(obj[1]);
    }
  };

  isRange = function(obj) {
    if (obj instanceof Range) {
      return true;
    } else {
      return _.all([_.isArray(obj), obj.length === 2, isPoint(obj[0]), isPoint(obj[1])]);
    }
  };

  toArray = function(obj, cond) {
    if (cond == null) {
      cond = null;
    }
    if (_.isArray(cond != null ? cond : obj)) {
      return obj;
    } else {
      return [obj];
    }
  };

  toArrayOfPoint = function(obj) {
    if (_.isArray(obj) && isPoint(obj[0])) {
      return obj;
    } else {
      return [obj];
    }
  };

  toArrayOfRange = function(obj) {
    if (_.isArray(obj) && _.all(obj.map(function(e) {
      return isRange(e);
    }))) {
      return obj;
    } else {
      return [obj];
    }
  };

  getVimState = function() {
    var args, callback, editor, file, _ref1;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    _ref1 = [], editor = _ref1[0], file = _ref1[1], callback = _ref1[2];
    switch (args.length) {
      case 1:
        callback = args[0];
        break;
      case 2:
        file = args[0], callback = args[1];
    }
    waitsForPromise(function() {
      return atom.packages.activatePackage('vim-mode-plus');
    });
    waitsForPromise(function() {
      if (file) {
        file = atom.project.resolvePath(file);
      }
      return atom.workspace.open(file).then(function(e) {
        return editor = e;
      });
    });
    return runs(function() {
      var main, vimState;
      main = atom.packages.getActivePackage('vim-mode-plus').mainModule;
      vimState = main.getEditorState(editor);
      return callback(vimState, new VimEditor(vimState));
    });
  };

  TextData = (function() {
    function TextData(rawData) {
      this.rawData = rawData;
      this.lines = this.rawData.split("\n");
    }

    TextData.prototype.getLines = function(lines, _arg) {
      var chomp, line, text;
      chomp = (_arg != null ? _arg : {}).chomp;
      if (chomp == null) {
        chomp = false;
      }
      text = ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = lines.length; _i < _len; _i++) {
          line = lines[_i];
          _results.push(this.lines[line]);
        }
        return _results;
      }).call(this)).join("\n");
      if (chomp) {
        return text;
      } else {
        return text + "\n";
      }
    };

    TextData.prototype.getRaw = function() {
      return this.rawData;
    };

    return TextData;

  })();

  VimEditor = (function() {
    var ensureOptionsOrdered, setOptionsOrdered;

    function VimEditor(vimState) {
      var _ref1;
      this.vimState = vimState;
      this.keystroke = __bind(this.keystroke, this);
      this.ensure = __bind(this.ensure, this);
      this.set = __bind(this.set, this);
      _ref1 = this.vimState, this.editor = _ref1.editor, this.editorElement = _ref1.editorElement;
    }

    VimEditor.prototype.validateOptions = function(options, validOptions, message) {
      var invalidOptions;
      invalidOptions = _.without.apply(_, [_.keys(options)].concat(__slice.call(validOptions)));
      if (invalidOptions.length) {
        throw new Error("" + message + ": " + (inspect(invalidOptions)));
      }
    };

    setOptionsOrdered = ['text', 'text_', 'grammar', 'cursor', 'cursorBuffer', 'addCursor', 'addCursorBuffer', 'register', 'selectedBufferRange'];

    VimEditor.prototype.set = function(options) {
      var method, name, _i, _len, _results;
      this.validateOptions(options, setOptionsOrdered, 'Invalid set options');
      _results = [];
      for (_i = 0, _len = setOptionsOrdered.length; _i < _len; _i++) {
        name = setOptionsOrdered[_i];
        if (!(options[name] != null)) {
          continue;
        }
        method = 'set' + _.capitalize(_.camelize(name));
        _results.push(this[method](options[name]));
      }
      return _results;
    };

    VimEditor.prototype.setText = function(text) {
      return this.editor.setText(text);
    };

    VimEditor.prototype.setText_ = function(text) {
      return this.setText(text.replace(/_/g, ' '));
    };

    VimEditor.prototype.setGrammar = function(scope) {
      return this.editor.setGrammar(atom.grammars.grammarForScopeName(scope));
    };

    VimEditor.prototype.setCursor = function(points) {
      var point, _i, _len, _results;
      points = toArrayOfPoint(points);
      this.editor.setCursorScreenPosition(points.shift());
      _results = [];
      for (_i = 0, _len = points.length; _i < _len; _i++) {
        point = points[_i];
        _results.push(this.editor.addCursorAtScreenPosition(point));
      }
      return _results;
    };

    VimEditor.prototype.setCursorBuffer = function(points) {
      var point, _i, _len, _results;
      points = toArrayOfPoint(points);
      this.editor.setCursorBufferPosition(points.shift());
      _results = [];
      for (_i = 0, _len = points.length; _i < _len; _i++) {
        point = points[_i];
        _results.push(this.editor.addCursorAtBufferPosition(point));
      }
      return _results;
    };

    VimEditor.prototype.setAddCursor = function(points) {
      var point, _i, _len, _ref1, _results;
      _ref1 = toArrayOfPoint(points);
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        point = _ref1[_i];
        _results.push(this.editor.addCursorAtScreenPosition(point));
      }
      return _results;
    };

    VimEditor.prototype.setAddCursorBuffer = function(points) {
      var point, _i, _len, _ref1, _results;
      _ref1 = toArrayOfPoint(points);
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        point = _ref1[_i];
        _results.push(this.editor.addCursorAtBufferPosition(point));
      }
      return _results;
    };

    VimEditor.prototype.setRegister = function(register) {
      var name, value, _results;
      _results = [];
      for (name in register) {
        value = register[name];
        _results.push(this.vimState.register.set(name, value));
      }
      return _results;
    };

    VimEditor.prototype.setSelectedBufferRange = function(range) {
      return this.editor.setSelectedBufferRange(range);
    };

    ensureOptionsOrdered = ['text', 'text_', 'selectedText', 'selectedTextOrdered', "selectionIsNarrowed", 'cursor', 'cursorBuffer', 'numCursors', 'register', 'selectedScreenRange', 'selectedScreenRangeOrdered', 'selectedBufferRange', 'selectedBufferRangeOrdered', 'selectionIsReversed', 'persistentSelectionBufferRange', 'persistentSelectionCount', 'occurrenceCount', 'occurrenceText', 'characterwiseHead', 'scrollTop', 'mode'];

    VimEditor.prototype.ensure = function() {
      var args, keystroke, method, name, options, _i, _len, _results;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      switch (args.length) {
        case 1:
          options = args[0];
          break;
        case 2:
          keystroke = args[0], options = args[1];
      }
      this.validateOptions(options, ensureOptionsOrdered, 'Invalid ensure option');
      if (!_.isEmpty(keystroke)) {
        this.keystroke(keystroke);
      }
      _results = [];
      for (_i = 0, _len = ensureOptionsOrdered.length; _i < _len; _i++) {
        name = ensureOptionsOrdered[_i];
        if (!(options[name] != null)) {
          continue;
        }
        method = 'ensure' + _.capitalize(_.camelize(name));
        _results.push(this[method](options[name]));
      }
      return _results;
    };

    VimEditor.prototype.ensureText = function(text) {
      return expect(this.editor.getText()).toEqual(text);
    };

    VimEditor.prototype.ensureText_ = function(text) {
      return this.ensureText(text.replace(/_/g, ' '));
    };

    VimEditor.prototype.ensureSelectedText = function(text, ordered) {
      var actual, s, selections;
      if (ordered == null) {
        ordered = false;
      }
      selections = ordered ? this.editor.getSelectionsOrderedByBufferPosition() : this.editor.getSelections();
      actual = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = selections.length; _i < _len; _i++) {
          s = selections[_i];
          _results.push(s.getText());
        }
        return _results;
      })();
      return expect(actual).toEqual(toArray(text));
    };

    VimEditor.prototype.ensureSelectionIsNarrowed = function(isNarrowed) {
      var actual;
      actual = this.vimState.modeManager.isNarrowed();
      return expect(actual).toEqual(isNarrowed);
    };

    VimEditor.prototype.ensureSelectedTextOrdered = function(text) {
      return this.ensureSelectedText(text, true);
    };

    VimEditor.prototype.ensureCursor = function(points) {
      var actual;
      actual = this.editor.getCursorScreenPositions();
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensureCursorBuffer = function(points) {
      var actual;
      actual = this.editor.getCursorBufferPositions();
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensureRegister = function(register) {
      var ensure, name, property, reg, selection, _results, _value;
      _results = [];
      for (name in register) {
        ensure = register[name];
        selection = ensure.selection;
        delete ensure.selection;
        reg = this.vimState.register.get(name, selection);
        _results.push((function() {
          var _results1;
          _results1 = [];
          for (property in ensure) {
            _value = ensure[property];
            _results1.push(expect(reg[property]).toEqual(_value));
          }
          return _results1;
        })());
      }
      return _results;
    };

    VimEditor.prototype.ensureNumCursors = function(number) {
      return expect(this.editor.getCursors()).toHaveLength(number);
    };

    VimEditor.prototype._ensureSelectedRangeBy = function(range, ordered, fn) {
      var actual, s, selections;
      if (ordered == null) {
        ordered = false;
      }
      selections = ordered ? this.editor.getSelectionsOrderedByBufferPosition() : this.editor.getSelections();
      actual = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = selections.length; _i < _len; _i++) {
          s = selections[_i];
          _results.push(fn(s));
        }
        return _results;
      })();
      return expect(actual).toEqual(toArrayOfRange(range));
    };

    VimEditor.prototype.ensureSelectedScreenRange = function(range, ordered) {
      if (ordered == null) {
        ordered = false;
      }
      return this._ensureSelectedRangeBy(range, ordered, function(s) {
        return s.getScreenRange();
      });
    };

    VimEditor.prototype.ensureSelectedScreenRangeOrdered = function(range) {
      return this.ensureSelectedScreenRange(range, true);
    };

    VimEditor.prototype.ensureSelectedBufferRange = function(range, ordered) {
      if (ordered == null) {
        ordered = false;
      }
      return this._ensureSelectedRangeBy(range, ordered, function(s) {
        return s.getBufferRange();
      });
    };

    VimEditor.prototype.ensureSelectedBufferRangeOrdered = function(range) {
      return this.ensureSelectedBufferRange(range, true);
    };

    VimEditor.prototype.ensureSelectionIsReversed = function(reversed) {
      var actual, selection, _i, _len, _ref1, _results;
      _ref1 = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        selection = _ref1[_i];
        actual = selection.isReversed();
        _results.push(expect(actual).toBe(reversed));
      }
      return _results;
    };

    VimEditor.prototype.ensurePersistentSelectionBufferRange = function(range) {
      var actual;
      actual = this.vimState.persistentSelection.getMarkerBufferRanges();
      return expect(actual).toEqual(toArrayOfRange(range));
    };

    VimEditor.prototype.ensurePersistentSelectionCount = function(number) {
      var actual;
      actual = this.vimState.persistentSelection.getMarkerCount();
      return expect(actual).toBe(number);
    };

    VimEditor.prototype.ensureOccurrenceCount = function(number) {
      var actual;
      actual = this.vimState.occurrenceManager.getMarkerCount();
      return expect(actual).toBe(number);
    };

    VimEditor.prototype.ensureOccurrenceText = function(text) {
      var actual, markers, r, ranges;
      markers = this.vimState.occurrenceManager.getMarkers();
      ranges = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = markers.length; _i < _len; _i++) {
          r = markers[_i];
          _results.push(r.getBufferRange());
        }
        return _results;
      })();
      actual = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = ranges.length; _i < _len; _i++) {
          r = ranges[_i];
          _results.push(this.editor.getTextInBufferRange(r));
        }
        return _results;
      }).call(this);
      return expect(actual).toEqual(toArray(text));
    };

    VimEditor.prototype.ensureCharacterwiseHead = function(points) {
      var actual, s;
      actual = (function() {
        var _i, _len, _ref1, _results;
        _ref1 = this.editor.getSelections();
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          s = _ref1[_i];
          _results.push(headFromProperty(s));
        }
        return _results;
      }).call(this);
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensureScrollTop = function(scrollTop) {
      var actual;
      actual = this.editorElement.getScrollTop();
      return expect(actual).toEqual(scrollTop);
    };

    VimEditor.prototype.ensureMode = function(mode) {
      var m, shouldNotContainClasses, _i, _j, _len, _len1, _ref1, _results;
      mode = toArray(mode);
      expect((_ref1 = this.vimState).isMode.apply(_ref1, mode)).toBe(true);
      mode[0] = "" + mode[0] + "-mode";
      mode = mode.filter(function(m) {
        return m;
      });
      expect(this.editorElement.classList.contains('vim-mode-plus')).toBe(true);
      for (_i = 0, _len = mode.length; _i < _len; _i++) {
        m = mode[_i];
        expect(this.editorElement.classList.contains(m)).toBe(true);
      }
      shouldNotContainClasses = _.difference(supportedModeClass, mode);
      _results = [];
      for (_j = 0, _len1 = shouldNotContainClasses.length; _j < _len1; _j++) {
        m = shouldNotContainClasses[_j];
        _results.push(expect(this.editorElement.classList.contains(m)).toBe(false));
      }
      return _results;
    };

    VimEditor.prototype.keystroke = function(keys, options) {
      var finished, k, target, _i, _len, _ref1, _results;
      if (options == null) {
        options = {};
      }
      if (options.waitsForFinish) {
        finished = false;
        this.vimState.onDidFinishOperation(function() {
          return finished = true;
        });
        delete options.waitsForFinish;
        this.keystroke(keys, options);
        waitsFor(function() {
          return finished;
        });
        return;
      }
      target = this.editorElement;
      _ref1 = toArray(keys);
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        k = _ref1[_i];
        if (_.isString(k)) {
          _results.push(rawKeystroke(k, target));
        } else {
          switch (false) {
            case k.input == null:
              _results.push(this.vimState.input.editor.insertText(k.input));
              break;
            case k.search == null:
              this.vimState.searchInput.editor.insertText(k.search);
              _results.push(atom.commands.dispatch(this.vimState.searchInput.editorElement, 'core:confirm'));
              break;
            default:
              _results.push(rawKeystroke(k, target));
          }
        }
      }
      return _results;
    };

    return VimEditor;

  })();

  module.exports = {
    getVimState: getVimState,
    getView: getView,
    dispatch: dispatch,
    TextData: TextData,
    withMockPlatform: withMockPlatform,
    rawKeystroke: rawKeystroke
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvc3BlYy1oZWxwZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVaQUFBO0lBQUE7O3NGQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxPQUE2QixPQUFBLENBQVEsTUFBUixDQUE3QixFQUFDLGFBQUEsS0FBRCxFQUFRLGFBQUEsS0FBUixFQUFlLGtCQUFBLFVBRGYsQ0FBQTs7QUFBQSxFQUVDLFVBQVcsT0FBQSxDQUFRLE1BQVIsRUFBWCxPQUZELENBQUE7O0FBQUEsRUFHQSxLQUFBLEdBQVEsT0FBQSxDQUFRLDBCQUFSLENBSFIsQ0FBQTs7QUFBQSxFQUtBLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUw3QixDQUFBOztBQUFBLEVBTUMsc0JBQXVCLE9BQUEsQ0FBUSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVosR0FBMkIsdUNBQW5DLEVBQXZCLG1CQU5ELENBQUE7O0FBQUEsRUFRQSxrQkFBQSxHQUFxQixDQUNuQixhQURtQixFQUVuQixhQUZtQixFQUduQixhQUhtQixFQUluQixTQUptQixFQUtuQixVQUxtQixFQU1uQixXQU5tQixFQU9uQixlQVBtQixDQVJyQixDQUFBOztBQUFBLEVBb0JBLE9BQUEsR0FBVSxTQUFDLEtBQUQsR0FBQTtXQUNSLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixLQUFuQixFQURRO0VBQUEsQ0FwQlYsQ0FBQTs7QUFBQSxFQXVCQSxRQUFBLEdBQVcsU0FBQyxNQUFELEVBQVMsT0FBVCxHQUFBO1dBQ1QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLE1BQXZCLEVBQStCLE9BQS9CLEVBRFM7RUFBQSxD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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/spec/spec-helper.coffee
