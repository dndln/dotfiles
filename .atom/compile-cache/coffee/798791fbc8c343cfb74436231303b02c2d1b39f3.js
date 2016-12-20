(function() {
  var Decrease, Increase, Operator, Range, settings,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Operator = require('./general-operators').Operator;

  Range = require('atom').Range;

  settings = require('../settings');

  Increase = (function(_super) {
    __extends(Increase, _super);

    Increase.prototype.step = 1;

    function Increase() {
      Increase.__super__.constructor.apply(this, arguments);
      this.complete = true;
      this.numberRegex = new RegExp(settings.numberRegex());
    }

    Increase.prototype.execute = function(count) {
      if (count == null) {
        count = 1;
      }
      return this.editor.transact((function(_this) {
        return function() {
          var cursor, increased, _i, _len, _ref;
          increased = false;
          _ref = _this.editor.getCursors();
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            cursor = _ref[_i];
            if (_this.increaseNumber(count, cursor)) {
              increased = true;
            }
          }
          if (!increased) {
            return atom.beep();
          }
        };
      })(this));
    };

    Increase.prototype.increaseNumber = function(count, cursor) {
      var cursorPosition, newValue, numEnd, numStart, number, range;
      cursorPosition = cursor.getBufferPosition();
      numEnd = cursor.getEndOfCurrentWordBufferPosition({
        wordRegex: this.numberRegex,
        allowNext: false
      });
      if (numEnd.column === cursorPosition.column) {
        numEnd = cursor.getEndOfCurrentWordBufferPosition({
          wordRegex: this.numberRegex,
          allowNext: true
        });
        if (numEnd.row !== cursorPosition.row) {
          return;
        }
        if (numEnd.column === cursorPosition.column) {
          return;
        }
      }
      cursor.setBufferPosition(numEnd);
      numStart = cursor.getBeginningOfCurrentWordBufferPosition({
        wordRegex: this.numberRegex,
        allowPrevious: false
      });
      range = new Range(numStart, numEnd);
      number = parseInt(this.editor.getTextInBufferRange(range), 10);
      if (isNaN(number)) {
        cursor.setBufferPosition(cursorPosition);
        return;
      }
      number += this.step * count;
      newValue = String(number);
      this.editor.setTextInBufferRange(range, newValue, {
        normalizeLineEndings: false
      });
      cursor.setBufferPosition({
        row: numStart.row,
        column: numStart.column - 1 + newValue.length
      });
      return true;
    };

    return Increase;

  })(Operator);

  Decrease = (function(_super) {
    __extends(Decrease, _super);

    function Decrease() {
      return Decrease.__super__.constructor.apply(this, arguments);
    }

    Decrease.prototype.step = -1;

    return Decrease;

  })(Increase);

  module.exports = {
    Increase: Increase,
    Decrease: Decrease
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS9saWIvb3BlcmF0b3JzL2luY3JlYXNlLW9wZXJhdG9ycy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNkNBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLFdBQVksT0FBQSxDQUFRLHFCQUFSLEVBQVosUUFBRCxDQUFBOztBQUFBLEVBQ0MsUUFBUyxPQUFBLENBQVEsTUFBUixFQUFULEtBREQsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUixDQUZYLENBQUE7O0FBQUEsRUFPTTtBQUNKLCtCQUFBLENBQUE7O0FBQUEsdUJBQUEsSUFBQSxHQUFNLENBQU4sQ0FBQTs7QUFFYSxJQUFBLGtCQUFBLEdBQUE7QUFDWCxNQUFBLDJDQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBRFosQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFdBQUQsR0FBbUIsSUFBQSxNQUFBLENBQU8sUUFBUSxDQUFDLFdBQVQsQ0FBQSxDQUFQLENBRm5CLENBRFc7SUFBQSxDQUZiOztBQUFBLHVCQU9BLE9BQUEsR0FBUyxTQUFDLEtBQUQsR0FBQTs7UUFBQyxRQUFNO09BQ2Q7YUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsQ0FBaUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNmLGNBQUEsaUNBQUE7QUFBQSxVQUFBLFNBQUEsR0FBWSxLQUFaLENBQUE7QUFDQTtBQUFBLGVBQUEsMkNBQUE7OEJBQUE7QUFDRSxZQUFBLElBQUcsS0FBQyxDQUFBLGNBQUQsQ0FBZ0IsS0FBaEIsRUFBdUIsTUFBdkIsQ0FBSDtBQUF1QyxjQUFBLFNBQUEsR0FBWSxJQUFaLENBQXZDO2FBREY7QUFBQSxXQURB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

//# sourceURL=/home/andy/.atom/packages/vim-mode/lib/operators/increase-operators.coffee
