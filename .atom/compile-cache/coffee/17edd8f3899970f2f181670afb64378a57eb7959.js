(function() {
  var Settings;

  Settings = (function() {
    function Settings(scope, config) {
      var i, name, _i, _len, _ref;
      this.scope = scope;
      this.config = config;
      _ref = Object.keys(this.config);
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        name = _ref[i];
        this.config[name].order = i;
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
      type: 'boolean',
      "default": true
    },
    groupChangesWhenLeavingInsertMode: {
      type: 'boolean',
      "default": true
    },
    useClipboardAsDefaultRegister: {
      type: 'boolean',
      "default": false
    },
    startInInsertMode: {
      type: 'boolean',
      "default": false
    },
    startInInsertModeScopes: {
      type: 'array',
      items: {
        type: 'string'
      },
      "default": [],
      description: 'Start in insert-mode whan editorElement matches scope'
    },
    clearMultipleCursorsOnEscapeInsertMode: {
      type: 'boolean',
      "default": false
    },
    autoSelectPersistentSelectionOnOperate: {
      type: 'boolean',
      "default": true
    },
    wrapLeftRightMotion: {
      type: 'boolean',
      "default": false
    },
    numberRegex: {
      type: 'string',
      "default": '-?[0-9]+',
      description: 'Used to find number in ctrl-a/ctrl-x. To ignore "-"(minus) char in string like "identifier-1" use "(?:\\B-)?[0-9]+"'
    },
    clearHighlightSearchOnResetNormalMode: {
      type: 'boolean',
      "default": false,
      description: 'Clear highlightSearch on `escape` in normal-mode'
    },
    clearPersistentSelectionOnResetNormalMode: {
      type: 'boolean',
      "default": false,
      description: 'Clear persistentSelection on `escape` in normal-mode'
    },
    charactersToAddSpaceOnSurround: {
      type: 'array',
      items: {
        type: 'string'
      },
      "default": [],
      description: 'Comma separated list of character, which add additional space inside when surround.'
    },
    showCursorInVisualMode: {
      type: 'boolean',
      "default": true
    },
    ignoreCaseForSearch: {
      type: 'boolean',
      "default": false,
      description: 'For `/` and `?`'
    },
    useSmartcaseForSearch: {
      type: 'boolean',
      "default": false,
      description: 'For `/` and `?`. Override `ignoreCaseForSearch`'
    },
    ignoreCaseForSearchCurrentWord: {
      type: 'boolean',
      "default": false,
      description: 'For `*` and `#`.'
    },
    useSmartcaseForSearchCurrentWord: {
      type: 'boolean',
      "default": false,
      description: 'For `*` and `#`. Override `ignoreCaseForSearchCurrentWord`'
    },
    highlightSearch: {
      type: 'boolean',
      "default": false
    },
    highlightSearchExcludeScopes: {
      type: 'array',
      items: {
        type: 'string'
      },
      "default": [],
      description: 'Suppress highlightSearch when any of these classes are present in the editor'
    },
    incrementalSearch: {
      type: 'boolean',
      "default": false
    },
    incrementalSearchVisitDirection: {
      type: 'string',
      "default": 'absolute',
      "enum": ['absolute', 'relative'],
      description: "Whether 'visit-next'(tab) and 'visit-prev'(shift-tab) depends on search direction('/' or '?')"
    },
    stayOnTransformString: {
      type: 'boolean',
      "default": false,
      description: "Don't move cursor after TransformString e.g Toggle, Surround"
    },
    stayOnYank: {
      type: 'boolean',
      "default": false,
      description: "Don't move cursor after Yank"
    },
    stayOnDelete: {
      type: 'boolean',
      "default": false,
      description: "Don't move cursor after Delete"
    },
    flashOnUndoRedo: {
      type: 'boolean',
      "default": true
    },
    flashOnUndoRedoDuration: {
      type: 'integer',
      "default": 100,
      description: "Duration(msec) for flash"
    },
    flashOnOperate: {
      type: 'boolean',
      "default": true
    },
    flashOnOperateDuration: {
      type: 'integer',
      "default": 100,
      description: "Duration(msec) for flash"
    },
    flashOnOperateBlacklist: {
      type: 'array',
      items: {
        type: 'string'
      },
      "default": [],
      description: 'comma separated list of operator class name to disable flash e.g. "Yank, AutoIndent"'
    },
    flashOnSearch: {
      type: 'boolean',
      "default": true
    },
    flashOnSearchDuration: {
      type: 'integer',
      "default": 300,
      description: "Duration(msec) for search flash"
    },
    flashScreenOnSearchHasNoMatch: {
      type: 'boolean',
      "default": true
    },
    showHoverOnOperate: {
      type: 'boolean',
      "default": false,
      description: "Show count, register and optional icon on hover overlay"
    },
    showHoverOnOperateIcon: {
      type: 'string',
      "default": 'icon',
      "enum": ['none', 'icon', 'emoji']
    },
    showHoverSearchCounter: {
      type: 'boolean',
      "default": false
    },
    showHoverSearchCounterDuration: {
      type: 'integer',
      "default": 700,
      description: "Duration(msec) for hover search counter"
    },
    hideTabBarOnMaximizePane: {
      type: 'boolean',
      "default": true
    },
    smoothScrollOnFullScrollMotion: {
      type: 'boolean',
      "default": false,
      description: "For `ctrl-f` and `ctrl-b`"
    },
    smoothScrollOnFullScrollMotionDuration: {
      type: 'integer',
      "default": 500,
      description: "For `ctrl-f` and `ctrl-b`"
    },
    smoothScrollOnHalfScrollMotion: {
      type: 'boolean',
      "default": false,
      description: "For `ctrl-d` and `ctrl-u`"
    },
    smoothScrollOnHalfScrollMotionDuration: {
      type: 'integer',
      "default": 500,
      description: "For `ctrl-d` and `ctrl-u`"
    },
    throwErrorOnNonEmptySelectionInNormalMode: {
      type: 'boolean',
      "default": false,
      description: "[Dev use] Throw error when non-empty selection was remained in normal-mode at the timing of operation finished"
    }
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9zZXR0aW5ncy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsUUFBQTs7QUFBQSxFQUFNO0FBQ1MsSUFBQSxrQkFBRSxLQUFGLEVBQVUsTUFBVixHQUFBO0FBRVgsVUFBQSx1QkFBQTtBQUFBLE1BRlksSUFBQyxDQUFBLFFBQUEsS0FFYixDQUFBO0FBQUEsTUFGb0IsSUFBQyxDQUFBLFNBQUEsTUFFckIsQ0FBQTtBQUFBO0FBQUEsV0FBQSxtREFBQTt1QkFBQTtBQUNFLFFBQUEsSUFBQyxDQUFBLE1BQU8sQ0FBQSxJQUFBLENBQUssQ0FBQyxLQUFkLEdBQXNCLENBQXRCLENBREY7QUFBQSxPQUZXO0lBQUEsQ0FBYjs7QUFBQSx1QkFLQSxHQUFBLEdBQUssU0FBQyxLQUFELEdBQUE7QUFDSCxNQUFBLElBQUcsS0FBQSxLQUFTLGlCQUFaO0FBQ0UsUUFBQSxJQUFHLElBQUMsQ0FBQSxHQUFELENBQUssK0JBQUwsQ0FBSDtpQkFBOEMsSUFBOUM7U0FBQSxNQUFBO2lCQUF1RCxJQUF2RDtTQURGO09BQUEsTUFBQTtlQUdFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixFQUFBLEdBQUcsSUFBQyxDQUFBLEtBQUosR0FBVSxHQUFWLEdBQWEsS0FBN0IsRUFIRjtPQURHO0lBQUEsQ0FMTCxDQUFBOztBQUFBLHVCQVdBLEdBQUEsR0FBSyxTQUFDLEtBQUQsRUFBUSxLQUFSLEdBQUE7YUFDSCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsRUFBQSxHQUFHLElBQUMsQ0FBQSxLQUFKLEdBQVUsR0FBVixHQUFhLEtBQTdCLEVBQXNDLEtBQXRDLEVBREc7SUFBQSxDQVhMLENBQUE7O0FBQUEsdUJBY0EsTUFBQSxHQUFRLFNBQUMsS0FB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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/settings.coffee
