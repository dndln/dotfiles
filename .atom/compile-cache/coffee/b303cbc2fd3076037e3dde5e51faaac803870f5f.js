(function() {
  var Settings;

  Settings = (function() {
    function Settings(scope, config) {
      var i, key, name, object, _i, _len, _ref, _ref1;
      this.scope = scope;
      this.config = config;
      _ref = Object.keys(this.config);
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        name = _ref[i];
        this.config[name].order = i;
      }
      _ref1 = this.config;
      for (key in _ref1) {
        object = _ref1[key];
        object.type = (function() {
          switch (false) {
            case !Number.isInteger(object["default"]):
              return 'integer';
            case typeof object["default"] !== 'boolean':
              return 'boolean';
            case typeof object["default"] !== 'string':
              return 'string';
            case !Array.isArray(object["default"]):
              return 'array';
          }
        })();
      }
    }

    Settings.prototype.get = function(param) {
      if (param === 'defaultRegister') {
        if (this.get('useClipboardAsDefaultRegister')) {
          return '*';
        } else {
          return '"';
        }
      } else {
        return atom.config.get("" + this.scope + "." + param);
      }
    };

    Settings.prototype.set = function(param, value) {
      return atom.config.set("" + this.scope + "." + param, value);
    };

    Settings.prototype.toggle = function(param) {
      return this.set(param, !this.get(param));
    };

    Settings.prototype.observe = function(param, fn) {
      return atom.config.observe("" + this.scope + "." + param, fn);
    };

    return Settings;

  })();

  module.exports = new Settings('vim-mode-plus', {
    setCursorToStartOfChangeOnUndoRedo: {
      "default": true
    },
    groupChangesWhenLeavingInsertMode: {
      "default": true
    },
    useClipboardAsDefaultRegister: {
      "default": false
    },
    startInInsertMode: {
      "default": false
    },
    startInInsertModeScopes: {
      "default": [],
      items: {
        type: 'string'
      },
      description: 'Start in insert-mode whan editorElement matches scope'
    },
    clearMultipleCursorsOnEscapeInsertMode: {
      "default": false
    },
    autoSelectPersistentSelectionOnOperate: {
      "default": true
    },
    wrapLeftRightMotion: {
      "default": false
    },
    numberRegex: {
      "default": '-?[0-9]+',
      description: 'Used to find number in ctrl-a/ctrl-x. To ignore "-"(minus) char in string like "identifier-1" use "(?:\\B-)?[0-9]+"'
    },
    clearHighlightSearchOnResetNormalMode: {
      "default": false,
      description: 'Clear highlightSearch on `escape` in normal-mode'
    },
    clearPersistentSelectionOnResetNormalMode: {
      "default": false,
      description: 'Clear persistentSelection on `escape` in normal-mode'
    },
    charactersToAddSpaceOnSurround: {
      "default": [],
      items: {
        type: 'string'
      },
      description: 'Comma separated list of character, which add additional space inside when surround.'
    },
    showCursorInVisualMode: {
      "default": true
    },
    ignoreCaseForSearch: {
      "default": false,
      description: 'For `/` and `?`'
    },
    useSmartcaseForSearch: {
      "default": false,
      description: 'For `/` and `?`. Override `ignoreCaseForSearch`'
    },
    ignoreCaseForSearchCurrentWord: {
      "default": false,
      description: 'For `*` and `#`.'
    },
    useSmartcaseForSearchCurrentWord: {
      "default": false,
      description: 'For `*` and `#`. Override `ignoreCaseForSearchCurrentWord`'
    },
    highlightSearch: {
      "default": false
    },
    highlightSearchExcludeScopes: {
      "default": [],
      items: {
        type: 'string'
      },
      description: 'Suppress highlightSearch when any of these classes are present in the editor'
    },
    incrementalSearch: {
      "default": false
    },
    incrementalSearchVisitDirection: {
      "default": 'absolute',
      "enum": ['absolute', 'relative'],
      description: "Whether 'visit-next'(tab) and 'visit-prev'(shift-tab) depends on search direction('/' or '?')"
    },
    stayOnTransformString: {
      "default": false,
      description: "Don't move cursor after TransformString e.g Toggle, Surround"
    },
    stayOnYank: {
      "default": false,
      description: "Don't move cursor after Yank"
    },
    stayOnDelete: {
      "default": false,
      description: "Don't move cursor after Delete"
    },
    flashOnUndoRedo: {
      "default": true
    },
    flashOnUndoRedoDuration: {
      "default": 100,
      description: "Duration(msec) for flash"
    },
    flashOnOperate: {
      "default": true
    },
    flashOnOperateDuration: {
      "default": 100,
      description: "Duration(msec) for flash"
    },
    flashOnOperateBlacklist: {
      "default": [],
      items: {
        type: 'string'
      },
      description: 'comma separated list of operator class name to disable flash e.g. "Yank, AutoIndent"'
    },
    flashOnSearch: {
      "default": true
    },
    flashOnSearchDuration: {
      "default": 300,
      description: "Duration(msec) for search flash"
    },
    flashScreenOnSearchHasNoMatch: {
      "default": true
    },
    showHoverOnOperate: {
      "default": false,
      description: "Show count, register and optional icon on hover overlay"
    },
    showHoverOnOperateIcon: {
      "default": 'icon',
      "enum": ['none', 'icon', 'emoji']
    },
    showHoverSearchCounter: {
      "default": false
    },
    showHoverSearchCounterDuration: {
      "default": 700,
      description: "Duration(msec) for hover search counter"
    },
    hideTabBarOnMaximizePane: {
      "default": true
    },
    smoothScrollOnFullScrollMotion: {
      "default": false,
      description: "For `ctrl-f` and `ctrl-b`"
    },
    smoothScrollOnFullScrollMotionDuration: {
      "default": 500,
      description: "For `ctrl-f` and `ctrl-b`"
    },
    smoothScrollOnHalfScrollMotion: {
      "default": false,
      description: "For `ctrl-d` and `ctrl-u`"
    },
    smoothScrollOnHalfScrollMotionDuration: {
      "default": 500,
      description: "For `ctrl-d` and `ctrl-u`"
    },
    statusBarModeStringStyle: {
      "default": 'short',
      "enum": ['short', 'long']
    },
    throwErrorOnNonEmptySelectionInNormalMode: {
      "default": false,
      description: "[Dev use] Throw error when non-empty selection was remained in normal-mode at the timing of operation finished"
    }
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9zZXR0aW5ncy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsUUFBQTs7QUFBQSxFQUFNO0FBQ1MsSUFBQSxrQkFBRSxLQUFGLEVBQVUsTUFBVixHQUFBO0FBRVgsVUFBQSwyQ0FBQTtBQUFBLE1BRlksSUFBQyxDQUFBLFFBQUEsS0FFYixDQUFBO0FBQUEsTUFGb0IsSUFBQyxDQUFBLFNBQUEsTUFFckIsQ0FBQTtBQUFBO0FBQUEsV0FBQSxtREFBQTt1QkFBQTtBQUNFLFFBQUEsSUFBQyxDQUFBLE1BQU8sQ0FBQSxJQUFBLENBQUssQ0FBQyxLQUFkLEdBQXNCLENBQXRCLENBREY7QUFBQSxPQUFBO0FBSUE7QUFBQSxXQUFBLFlBQUE7NEJBQUE7QUFDRSxRQUFBLE1BQU0sQ0FBQyxJQUFQO0FBQWMsa0JBQUEsS0FBQTtBQUFBLGtCQUNQLE1BQU0sQ0FBQyxTQUFQLENBQWlCLE1BQU0sQ0FBQyxTQUFELENBQXZCLENBRE87cUJBQytCLFVBRC9CO0FBQUEsaUJBRVAsTUFBQSxDQUFBLE1BQWEsQ0FBQyxTQUFELENBQWIsS0FBMEIsU0FGbkI7cUJBRWtDLFVBRmxDO0FBQUEsaUJBR1AsTUFBQSxDQUFBLE1BQWEsQ0FBQyxTQUFELENBQWIsS0FBMEIsUUFIbkI7cUJBR2lDLFNBSGpDO0FBQUEsa0JBSVAsS0FBSyxDQUFDLE9BQU4sQ0FBYyxNQUFNLENBQUMsU0FBRCxDQUFwQixDQUpPO3FCQUk0QixRQUo1QjtBQUFBO1lBQWQsQ0FERjtBQUFBLE9BTlc7SUFBQSxDQUFiOztBQUFBLHVCQWFBLEdBQUEsR0FBSyxTQUFDLEtBQUQsR0FBQTtBQUNILE1BQUEsSUFBRyxLQUFBLEtBQVMsaUJBQVo7QUFDRSxRQUFBLElBQUcsSUFBQyxDQUFBLEdBQUQs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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/settings.coffee
