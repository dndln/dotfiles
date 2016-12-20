(function() {
  var Disposable, KeymapManager, Point, Range, TextData, VimEditor, buildKeydownEvent, buildKeydownEventFromKeystroke, buildTextInputEvent, dispatch, getView, getVimState, headFromProperty, inspect, isPoint, isRange, normalizeKeystrokes, rawKeystroke, semver, settings, supportedModeClass, swrap, toArray, toArrayOfPoint, toArrayOfRange, withMockPlatform, _, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  semver = require('semver');

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point, Disposable = _ref.Disposable;

  inspect = require('util').inspect;

  swrap = require('../lib/selection-wrapper');

  settings = require('../lib/settings');

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
    if (semver.satisfies(atom.getVersion(), '< 1.12')) {
      if (key === 'space') {
        key = ' ';
      }
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

  rawKeystroke = function(keystrokes, target) {
    var event, key, _i, _len, _ref1, _results;
    _ref1 = normalizeKeystrokes(keystrokes).split(/\s+/);
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      key = _ref1[_i];
      event = buildKeydownEventFromKeystroke(key, target);
      _results.push(atom.keymaps.handleKeyboardEvent(event));
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

    ensureOptionsOrdered = ['text', 'text_', 'selectedText', 'selectedTextOrdered', "selectionIsNarrowed", 'cursor', 'cursorBuffer', 'numCursors', 'register', 'selectedScreenRange', 'selectedScreenRangeOrdered', 'selectedBufferRange', 'selectedBufferRangeOrdered', 'selectionIsReversed', 'persistentSelectionBufferRange', 'persistentSelectionCount', 'occurrenceCount', 'occurrenceText', 'characterwiseHead', 'scrollTop', 'mark', 'mode'];

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

    VimEditor.prototype.ensureMark = function(mark) {
      var actual, name, point, _results;
      _results = [];
      for (name in mark) {
        point = mark[name];
        actual = this.vimState.mark.get(name);
        _results.push(expect(actual).toEqual(point));
      }
      return _results;
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
      var finished, k, target, _i, _key, _len, _ref1, _results;
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
              _results.push((function() {
                var _j, _len1, _ref2, _results1;
                _ref2 = k.input.split('');
                _results1 = [];
                for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                  _key = _ref2[_j];
                  _results1.push(rawKeystroke(_key, target));
                }
                return _results1;
              })());
              break;
            case k.search == null:
              if (k.search) {
                this.vimState.searchInput.editor.insertText(k.search);
              }
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvc3BlYy1oZWxwZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFXQUFBO0lBQUE7O3NGQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVIsQ0FEVCxDQUFBOztBQUFBLEVBRUEsT0FBNkIsT0FBQSxDQUFRLE1BQVIsQ0FBN0IsRUFBQyxhQUFBLEtBQUQsRUFBUSxhQUFBLEtBQVIsRUFBZSxrQkFBQSxVQUZmLENBQUE7O0FBQUEsRUFHQyxVQUFXLE9BQUEsQ0FBUSxNQUFSLEVBQVgsT0FIRCxDQUFBOztBQUFBLEVBSUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSwwQkFBUixDQUpSLENBQUE7O0FBQUEsRUFLQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSLENBTFgsQ0FBQTs7QUFBQSxFQU9BLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQVA3QixDQUFBOztBQUFBLEVBUUMsc0JBQXVCLE9BQUEsQ0FBUSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVosR0FBMkIsdUNBQW5DLEVBQXZCLG1CQVJELENBQUE7O0FBQUEsRUFVQSxrQkFBQSxHQUFxQixDQUNuQixhQURtQixFQUVuQixhQUZtQixFQUduQixhQUhtQixFQUluQixTQUptQixFQUtuQixVQUxtQixFQU1uQixXQU5tQixFQU9uQixlQVBtQixDQVZyQixDQUFBOztBQUFBLEVBc0JBLE9BQUEsR0FBVSxTQUFDLEtBQUQsR0FBQTtXQUNSLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixLQUFuQixFQURRO0VBQUEsQ0F0QlYsQ0FBQTs7QUFBQSxFQXlCQSxRQUFBLEdB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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/spec/spec-helper.coffee
