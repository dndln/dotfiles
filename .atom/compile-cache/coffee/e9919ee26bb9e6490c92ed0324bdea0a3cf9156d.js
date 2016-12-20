(function() {
  var Base, CopyFromLineAbove, CopyFromLineBelow, InsertLastInserted, InsertMode, InsertRegister, Range,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Range = require('atom').Range;

  Base = require('./base');

  InsertMode = (function(_super) {
    __extends(InsertMode, _super);

    InsertMode.extend(false);

    function InsertMode() {
      InsertMode.__super__.constructor.apply(this, arguments);
      if (typeof this.initialize === "function") {
        this.initialize();
      }
    }

    return InsertMode;

  })(Base);

  InsertRegister = (function(_super) {
    __extends(InsertRegister, _super);

    function InsertRegister() {
      return InsertRegister.__super__.constructor.apply(this, arguments);
    }

    InsertRegister.extend();

    InsertRegister.prototype.hover = {
      icon: '"',
      emoji: '"'
    };

    InsertRegister.prototype.requireInput = true;

    InsertRegister.prototype.initialize = function() {
      InsertRegister.__super__.initialize.apply(this, arguments);
      return this.focusInput();
    };

    InsertRegister.prototype.execute = function() {
      return this.editor.transact((function(_this) {
        return function() {
          var selection, text, _i, _len, _ref, _results;
          _ref = _this.editor.getSelections();
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            selection = _ref[_i];
            text = _this.vimState.register.getText(_this.getInput(), selection);
            _results.push(selection.insertText(text));
          }
          return _results;
        };
      })(this));
    };

    return InsertRegister;

  })(InsertMode);

  InsertLastInserted = (function(_super) {
    __extends(InsertLastInserted, _super);

    function InsertLastInserted() {
      return InsertLastInserted.__super__.constructor.apply(this, arguments);
    }

    InsertLastInserted.extend();

    InsertLastInserted.description = "Insert text inserted in latest insert-mode.\nEquivalent to *i_CTRL-A* of pure Vim";

    InsertLastInserted.prototype.execute = function() {
      var text;
      text = this.vimState.register.getText('.');
      return this.editor.insertText(text);
    };

    return InsertLastInserted;

  })(InsertMode);

  CopyFromLineAbove = (function(_super) {
    __extends(CopyFromLineAbove, _super);

    function CopyFromLineAbove() {
      return CopyFromLineAbove.__super__.constructor.apply(this, arguments);
    }

    CopyFromLineAbove.extend();

    CopyFromLineAbove.description = "Insert character of same-column of above line.\nEquivalent to *i_CTRL-Y* of pure Vim";

    CopyFromLineAbove.prototype.rowDelta = -1;

    CopyFromLineAbove.prototype.execute = function() {
      var translation;
      translation = [this.rowDelta, 0];
      return this.editor.transact((function(_this) {
        return function() {
          var point, range, selection, text, _i, _len, _ref, _results;
          _ref = _this.editor.getSelections();
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            selection = _ref[_i];
            point = selection.cursor.getBufferPosition().translate(translation);
            range = Range.fromPointWithDelta(point, 0, 1);
            if (text = _this.editor.getTextInBufferRange(range)) {
              _results.push(selection.insertText(text));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
      })(this));
    };

    return CopyFromLineAbove;

  })(InsertMode);

  CopyFromLineBelow = (function(_super) {
    __extends(CopyFromLineBelow, _super);

    function CopyFromLineBelow() {
      return CopyFromLineBelow.__super__.constructor.apply(this, arguments);
    }

    CopyFromLineBelow.extend();

    CopyFromLineBelow.description = "Insert character of same-column of above line.\nEquivalent to *i_CTRL-E* of pure Vim";

    CopyFromLineBelow.prototype.rowDelta = +1;

    return CopyFromLineBelow;

  })(CopyFromLineAbove);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9pbnNlcnQtbW9kZS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsaUdBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLFFBQVMsT0FBQSxDQUFRLE1BQVIsRUFBVCxLQUFELENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVIsQ0FGUCxDQUFBOztBQUFBLEVBSU07QUFDSixpQ0FBQSxDQUFBOztBQUFBLElBQUEsVUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSLENBQUEsQ0FBQTs7QUFDYSxJQUFBLG9CQUFBLEdBQUE7QUFDWCxNQUFBLDZDQUFBLFNBQUEsQ0FBQSxDQUFBOztRQUNBLElBQUMsQ0FBQTtPQUZVO0lBQUEsQ0FEYjs7c0JBQUE7O0tBRHVCLEtBSnpCLENBQUE7O0FBQUEsRUFVTTtBQUNKLHFDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGNBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLDZCQUNBLEtBQUEsR0FBTztBQUFBLE1BQUEsSUFBQSxFQUFNLEdBQU47QUFBQSxNQUFXLEtBQUEsRUFBTyxHQUFsQjtLQURQLENBQUE7O0FBQUEsNkJBRUEsWUFBQSxHQUFjLElBRmQsQ0FBQTs7QUFBQSw2QkFJQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSxnREFBQSxTQUFBLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxVQUFELENBQUEsRUFGVTtJQUFBLENBSlosQ0FBQTs7QUFBQSw2QkFRQSxPQUFBLEdBQVMsU0FBQSxHQUFBO2FBQ1AsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQWlCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDZixjQUFBLHlDQUFBO0FBQUE7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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/insert-mode.coffee
