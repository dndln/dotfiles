(function() {
  var Base, excludeProperties, extractBetween, formatKeymaps, formatReport, genTableOfContent, generateIntrospectionReport, getAncestors, getCommandFromClass, getKeyBindingForCommand, getParent, inspectFunction, inspectInstance, inspectObject, packageName, report, sortByAncesstor, util, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  util = require('util');

  _ = require('underscore-plus');

  Base = require('./base');

  _ref = require('./utils'), getParent = _ref.getParent, getAncestors = _ref.getAncestors, getKeyBindingForCommand = _ref.getKeyBindingForCommand;

  packageName = 'vim-mode-plus';

  extractBetween = function(str, s1, s2) {
    return str.substring(str.indexOf(s1) + 1, str.lastIndexOf(s2));
  };

  inspectFunction = function(fn, name) {
    var args, argumentsSignature, defaultConstructor, fnArgs, fnBody, fnString, line, m, superAsIs, superBase, superSignature, superWithModify, _i, _len;
    superBase = _.escapeRegExp("" + fn.name + ".__super__." + name);
    superAsIs = superBase + _.escapeRegExp(".apply(this, arguments);");
    defaultConstructor = '^return ' + superAsIs;
    superWithModify = superBase + '\\.call\\((.*)\\)';
    fnString = fn.toString();
    fnBody = extractBetween(fnString, '{', '}').split("\n").map(function(e) {
      return e.trim();
    });
    fnArgs = fnString.split("\n")[0].match(/\((.*)\)/)[1].split(/,\s*/g);
    fnArgs = fnArgs.map(function(arg) {
      var iVarAssign;
      iVarAssign = '^' + _.escapeRegExp("this." + arg + " = " + arg + ";") + '$';
      if (_.detect(fnBody, function(line) {
        return line.match(iVarAssign);
      })) {
        return '@' + arg;
      } else {
        return arg;
      }
    });
    argumentsSignature = '(' + fnArgs.join(', ') + ')';
    superSignature = null;
    for (_i = 0, _len = fnBody.length; _i < _len; _i++) {
      line = fnBody[_i];
      if (name === 'constructor' && line.match(defaultConstructor)) {
        superSignature = 'default';
      } else if (line.match(superAsIs)) {
        superSignature = 'super';
      } else if (m = line.match(superWithModify)) {
        args = m[1].replace(/this,?\s*/, '');
        args = args.replace(/this\./g, '@');
        superSignature = "super(" + args + ")";
      }
      if (superSignature) {
        break;
      }
    }
    return {
      argumentsSignature: argumentsSignature,
      superSignature: superSignature
    };
  };

  excludeProperties = ['__super__'];

  inspectObject = function(obj, options, prototype) {
    var ancesstors, argumentsSignature, excludeList, isOverridden, prefix, prop, results, s, superSignature, value, _ref1, _ref2;
    if (options == null) {
      options = {};
    }
    if (prototype == null) {
      prototype = false;
    }
    excludeList = excludeProperties.concat((_ref1 = options.excludeProperties) != null ? _ref1 : []);
    if (options.depth == null) {
      options.depth = 1;
    }
    prefix = '@';
    if (prototype) {
      obj = obj.prototype;
      prefix = '::';
    }
    ancesstors = getAncestors(obj.constructor);
    ancesstors.shift();
    results = [];
    for (prop in obj) {
      if (!__hasProp.call(obj, prop)) continue;
      value = obj[prop];
      if (!(__indexOf.call(excludeList, prop) < 0)) {
        continue;
      }
      s = "- " + prefix + prop;
      if (value instanceof options.recursiveInspect) {
        s += ":\n" + (inspectInstance(value, options));
      } else if (_.isFunction(value)) {
        _ref2 = inspectFunction(value, prop), argumentsSignature = _ref2.argumentsSignature, superSignature = _ref2.superSignature;
        if ((prop === 'constructor') && (superSignature === 'default')) {
          continue;
        }
        s += "`" + argumentsSignature + "`";
        if (superSignature != null) {
          s += ": `" + superSignature + "`";
        }
      } else {
        s += ": ```" + (util.inspect(value, options)) + "```";
      }
      isOverridden = _.detect(ancesstors, function(ancestor) {
        return ancestor.prototype.hasOwnProperty(prop);
      });
      if (isOverridden) {
        s += ": **Overridden**";
      }
      results.push(s);
    }
    if (!results.length) {
      return null;
    }
    return results.join('\n');
  };

  report = function(obj, options) {
    var name;
    if (options == null) {
      options = {};
    }
    name = obj.name;
    return {
      name: name,
      ancesstorsNames: _.pluck(getAncestors(obj), 'name'),
      command: getCommandFromClass(obj),
      instance: inspectObject(obj, options),
      prototype: inspectObject(obj, options, true)
    };
  };

  sortByAncesstor = function(list) {
    var compare, mapped;
    mapped = list.map(function(obj, i) {
      return {
        index: i,
        value: obj.ancesstorsNames.slice().reverse()
      };
    });
    compare = function(v1, v2) {
      var a, b;
      a = v1.value[0];
      b = v2.value[0];
      switch (false) {
        case !((a === void 0) && (b === void 0)):
          return 0;
        case a !== void 0:
          return -1;
        case b !== void 0:
          return 1;
        case !(a < b):
          return -1;
        case !(a > b):
          return 1;
        default:
          a = {
            index: v1.index,
            value: v1.value.slice(1)
          };
          b = {
            index: v2.index,
            value: v2.value.slice(1)
          };
          return compare(a, b);
      }
    };
    return mapped.sort(compare).map(function(e) {
      return list[e.index];
    });
  };

  genTableOfContent = function(obj) {
    var ancesstorsNames, indent, indentLevel, link, name, s;
    name = obj.name, ancesstorsNames = obj.ancesstorsNames;
    indentLevel = ancesstorsNames.length - 1;
    indent = _.multiplyString('  ', indentLevel);
    link = ancesstorsNames.slice(0, 2).join('--').toLowerCase();
    s = "" + indent + "- [" + name + "](#" + link + ")";
    if (obj.virtual != null) {
      s += ' *Not exported*';
    }
    return s;
  };

  generateIntrospectionReport = function(klasses, options) {
    var ancesstors, body, command, content, date, header, instance, keymaps, klass, pack, prototype, result, results, s, toc, version, _i, _len;
    pack = atom.packages.getActivePackage(packageName);
    version = pack.metadata.version;
    results = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = klasses.length; _i < _len; _i++) {
        klass = klasses[_i];
        _results.push(report(klass, options));
      }
      return _results;
    })();
    results = sortByAncesstor(results);
    toc = results.map(function(e) {
      return genTableOfContent(e);
    }).join('\n');
    body = [];
    for (_i = 0, _len = results.length; _i < _len; _i++) {
      result = results[_i];
      ancesstors = result.ancesstorsNames.slice(0, 2);
      header = "#" + (_.multiplyString('#', ancesstors.length)) + " " + (ancesstors.join(" < "));
      s = [];
      s.push(header);
      command = result.command, instance = result.instance, prototype = result.prototype;
      if (command != null) {
        s.push("- command: `" + command + "`");
        keymaps = getKeyBindingForCommand(command, {
          packageName: 'vim-mode-plus'
        });
        if (keymaps != null) {
          s.push(formatKeymaps(keymaps));
        }
      }
      if (instance != null) {
        s.push(instance);
      }
      if (prototype != null) {
        s.push(prototype);
      }
      body.push(s.join("\n"));
    }
    date = new Date().toISOString();
    content = ["" + packageName + " version: " + version + "  \n*generated at " + date + "*", toc, body.join("\n\n")].join("\n\n");
    return atom.workspace.open().then(function(editor) {
      editor.setText(content);
      return editor.setGrammar(atom.grammars.grammarForScopeName('source.gfm'));
    });
  };

  formatKeymaps = function(keymaps) {
    var keymap, keystrokes, s, selector, _i, _len;
    s = [];
    s.push('  - keymaps');
    for (_i = 0, _len = keymaps.length; _i < _len; _i++) {
      keymap = keymaps[_i];
      keystrokes = keymap.keystrokes, selector = keymap.selector;
      keystrokes = keystrokes.replace(/(`|_)/g, '\\$1');
      s.push("    - `" + selector + "`: <kbd>" + keystrokes + "</kbd>");
    }
    return s.join("\n");
  };

  formatReport = function(report) {
    var ancesstorsNames, instance, prototype, s;
    instance = report.instance, prototype = report.prototype, ancesstorsNames = report.ancesstorsNames;
    s = [];
    s.push("# " + (ancesstorsNames.join(" < ")));
    if (instance != null) {
      s.push(instance);
    }
    if (prototype != null) {
      s.push(prototype);
    }
    return s.join("\n");
  };

  inspectInstance = function(obj, options) {
    var indent, rep, _ref1;
    if (options == null) {
      options = {};
    }
    indent = _.multiplyString(' ', (_ref1 = options.indent) != null ? _ref1 : 0);
    rep = report(obj.constructor, options);
    return ["## " + obj + ": " + (rep.ancesstorsNames.slice(0, 2).join(" < ")), inspectObject(obj, options), formatReport(rep)].filter(function(e) {
      return e;
    }).join('\n').split('\n').map(function(e) {
      return indent + e;
    }).join('\n');
  };

  getCommandFromClass = function(klass) {
    if (klass.isCommand()) {
      return klass.getCommandName();
    } else {
      return null;
    }
  };

  module.exports = {
    generateIntrospectionReport: generateIntrospectionReport,
    inspectInstance: inspectInstance
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9pbnRyb3NwZWN0aW9uLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpU0FBQTtJQUFBO3lKQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FESixDQUFBOztBQUFBLEVBRUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSLENBRlAsQ0FBQTs7QUFBQSxFQUdBLE9BQXFELE9BQUEsQ0FBUSxTQUFSLENBQXJELEVBQUMsaUJBQUEsU0FBRCxFQUFZLG9CQUFBLFlBQVosRUFBMEIsK0JBQUEsdUJBSDFCLENBQUE7O0FBQUEsRUFLQSxXQUFBLEdBQWMsZUFMZCxDQUFBOztBQUFBLEVBT0EsY0FBQSxHQUFpQixTQUFDLEdBQUQsRUFBTSxFQUFOLEVBQVUsRUFBVixHQUFBO1dBQ2YsR0FBRyxDQUFDLFNBQUosQ0FBYyxHQUFHLENBQUMsT0FBSixDQUFZLEVBQVosQ0FBQSxHQUFnQixDQUE5QixFQUFpQyxHQUFHLENBQUMsV0FBSixDQUFnQixFQUFoQixDQUFqQyxFQURlO0VBQUEsQ0FQakIsQ0FBQTs7QUFBQSxFQVVBLGVBQUEsR0FBa0IsU0FBQyxFQUFELEVBQUssSUFBTCxHQUFBO0FBYWhCLFFBQUEsZ0pBQUE7QUFBQSxJQUFBLFNBQUEsR0FBWSxDQUFDLENBQUMsWUFBRixDQUFlLEVBQUEsR0FBRyxFQUFFLENBQUMsSUFBTixHQUFXLGFBQVgsR0FBd0IsSUFBdkMsQ0FBWixDQUFBO0FBQUEsSUFDQSxTQUFBLEdBQVksU0FBQSxHQUFZLENBQUMsQ0FBQyxZQUFGLENBQWUsMEJBQWYsQ0FEeEIsQ0FBQTtBQUFBLElBRUEsa0JBQUEsR0FB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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/introspection.coffee
