(function() {
  var CompositeDisposable, MARKS, MarkManager, Point, Range, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point, CompositeDisposable = _ref.CompositeDisposable;

  MARKS = /(?:[a-z]|[\[\]`'.^(){}<>])/;

  MarkManager = (function() {
    MarkManager.prototype.marks = null;

    function MarkManager(vimState) {
      var _ref1;
      this.vimState = vimState;
      _ref1 = this.vimState, this.editor = _ref1.editor, this.editorElement = _ref1.editorElement;
      this.marks = {};
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
    }

    MarkManager.prototype.destroy = function() {
      return this.subscriptions.dispose();
    };

    MarkManager.prototype.isValid = function(name) {
      return MARKS.test(name);
    };

    MarkManager.prototype.get = function(name) {
      var point, _ref1;
      if (!this.isValid(name)) {
        return;
      }
      point = (_ref1 = this.marks[name]) != null ? _ref1.getStartBufferPosition() : void 0;
      if (__indexOf.call("`'", name) >= 0) {
        return point != null ? point : Point.ZERO;
      } else {
        return point;
      }
    };

    MarkManager.prototype.getRange = function(startMark, endMark) {
      var end, start;
      start = this.get(startMark);
      end = this.get(endMark);
      if ((start != null) && (end != null)) {
        return new Range(start, end);
      }
    };

    MarkManager.prototype.setRange = function(startMark, endMark, range) {
      var end, start, _ref1;
      _ref1 = Range.fromObject(range), start = _ref1.start, end = _ref1.end;
      this.set(startMark, start);
      return this.set(endMark, end);
    };

    MarkManager.prototype.set = function(name, point) {
      var bufferPosition, event;
      if (!this.isValid(name)) {
        return;
      }
      bufferPosition = this.editor.clipBufferPosition(point);
      this.marks[name] = this.editor.markBufferPosition(bufferPosition);
      event = {
        name: name,
        bufferPosition: bufferPosition,
        editor: this.editor
      };
      return this.vimState.emitter.emit('did-set-mark', event);
    };

    return MarkManager;

  })();

  module.exports = MarkManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9tYXJrLW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJEQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxPQUFzQyxPQUFBLENBQVEsTUFBUixDQUF0QyxFQUFDLGFBQUEsS0FBRCxFQUFRLGFBQUEsS0FBUixFQUFlLDJCQUFBLG1CQUFmLENBQUE7O0FBQUEsRUFFQSxLQUFBLEdBQVEsNEJBRlIsQ0FBQTs7QUFBQSxFQU9NO0FBQ0osMEJBQUEsS0FBQSxHQUFPLElBQVAsQ0FBQTs7QUFFYSxJQUFBLHFCQUFFLFFBQUYsR0FBQTtBQUNYLFVBQUEsS0FBQTtBQUFBLE1BRFksSUFBQyxDQUFBLFdBQUEsUUFDYixDQUFBO0FBQUEsTUFBQSxRQUE0QixJQUFDLENBQUEsUUFBN0IsRUFBQyxJQUFDLENBQUEsZUFBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLHNCQUFBLGFBQVgsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxFQURULENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFIakIsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxRQUFRLENBQUMsWUFBVixDQUF1QixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxJQUFkLENBQXZCLENBQW5CLENBSkEsQ0FEVztJQUFBLENBRmI7O0FBQUEsMEJBU0EsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUNQLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBLEVBRE87SUFBQSxDQVRULENBQUE7O0FBQUEsMEJBWUEsT0FBQSxHQUFTLFNBQUMsSUFBRCxHQUFBO2FBQ1AsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYLEVBRE87SUFBQSxDQVpULENBQUE7O0FBQUEsMEJBZUEsR0FBQSxHQUFLLFNBQUMsSUFBRCxHQUFBO0FBQ0gsVUFBQSxZQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsSUFBZSxDQUFBLE9BQUQsQ0FBUyxJQUFULENBQWQ7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUFBLE1BQ0EsS0FBQSw2Q0FBb0IsQ0FBRSxzQkFBZCxDQUFBLFVBRFIsQ0FBQTtBQUVBLE1BQUEsSUFBRyxlQUFRLElBQVIsRUFBQSxJQUFBLE1BQUg7K0JBQ0UsUUFBUSxLQUFLLENBQUMsS0FEaEI7T0FBQSxNQUFBO2VBR0UsTUFIRjtPQUhHO0lBQUEsQ0FmTCxDQUFBOztBQUFBLDBCQXdCQSxRQUFBLEdBQVUsU0FBQyxTQUFELEVBQVksT0FBWixHQUFBO0FBQ1IsVUFBQSxVQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxTQUFMLENBQVIsQ0FBQTtBQUFBLE1BQ0EsR0FBQSxHQUFNLElBQUMsQ0FBQSxHQUFELENBQUssT0FBTCxDQUROLENBQUE7QUFFQSxNQUFBLElBQUcsZUFBQSxJQUFXLGFBQWQ7ZUFDTSxJQUFBLEtBQUEsQ0FBTSxLQUFOLEVBQWEsR0FBYixFQUROO09BSFE7SUFBQSxDQXhCVixDQUFBOztBQUFBLDBCQThCQSxRQUFBLEdBQVUsU0FBQyxTQUFELEVBQVksT0FBWixFQUFxQixLQUFyQixHQUFBO0FBQ1IsVUFBQSxpQkFBQTtBQUFBLE1BQUEsUUFBZSxLQUFLLENBQUMsVUFBTixDQUFpQixLQUFqQixDQUFmLEVBQUMsY0FBQSxLQUFELEVBQVEsWUFBQSxHQUFSLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxHQUFELENBQUssU0FBTCxFQUFnQixLQUFoQixDQURBLENBQUE7YUFFQSxJQUFDLENBQUEsR0FBRCxDQUFLLE9BQUwsRUFBYyxHQUFkLEVBSFE7SUFBQSxDQTlCVixDQUFBOztBQUFBLDBCQW9DQSxHQUFBLEdBQUssU0FBQyxJQUFELEVBQU8sS0FBUCxHQUFBO0FBQ0gsVUFBQSxxQkFBQTtBQUFBLE1BQUEsSUFBQSxDQUFBLElBQWUsQ0FBQSxPQUFELENBQVMsSUFBVCxDQUFkO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFBQSxNQUNBLGNBQUEsR0FBaUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxrQkFBUixDQUEyQixLQUEzQixDQURqQixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsS0FBTSxDQUFBLElBQUEsQ0FBUCxHQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsa0JBQVIsQ0FBMkIsY0FBM0IsQ0FGZixDQUFBO0FBQUEsTUFHQSxLQUFBLEdBQVE7QUFBQSxRQUFDLE1BQUEsSUFBRDtBQUFBLFFBQU8sZ0JBQUEsY0FBUDtBQUFBLFFBQXdCLFFBQUQsSUFBQyxDQUFBLE1BQXhCO09BSFIsQ0FBQTthQUlBLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBTyxDQUFDLElBQWxCLENBQXVCLGNBQXZCLEVBQXVDLEtBQXZDLEVBTEc7SUFBQSxDQXBDTCxDQUFBOzt1QkFBQTs7TUFSRixDQUFBOztBQUFBLEVBbURBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFdBbkRqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/mark-manager.coffee
