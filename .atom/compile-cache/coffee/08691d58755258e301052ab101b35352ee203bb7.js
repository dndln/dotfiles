(function() {
  var CompositeDisposable, MARKS, MarkManager, Range, _ref;

  _ref = require('atom'), Range = _ref.Range, CompositeDisposable = _ref.CompositeDisposable;

  MARKS = /(?:[a-z]|[\[\]`.^(){}<>])/;

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
      var _ref1;
      if (!this.isValid(name)) {
        return;
      }
      return (_ref1 = this.marks[name]) != null ? _ref1.getStartBufferPosition() : void 0;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9tYXJrLW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9EQUFBOztBQUFBLEVBQUEsT0FBK0IsT0FBQSxDQUFRLE1BQVIsQ0FBL0IsRUFBQyxhQUFBLEtBQUQsRUFBUSwyQkFBQSxtQkFBUixDQUFBOztBQUFBLEVBRUEsS0FBQSxHQUFRLDJCQUZSLENBQUE7O0FBQUEsRUFPTTtBQUNKLDBCQUFBLEtBQUEsR0FBTyxJQUFQLENBQUE7O0FBRWEsSUFBQSxxQkFBRSxRQUFGLEdBQUE7QUFDWCxVQUFBLEtBQUE7QUFBQSxNQURZLElBQUMsQ0FBQSxXQUFBLFFBQ2IsQ0FBQTtBQUFBLE1BQUEsUUFBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLGVBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxzQkFBQSxhQUFYLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxLQUFELEdBQVMsRUFEVCxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBSGpCLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsSUFBZCxDQUF2QixDQUFuQixDQUpBLENBRFc7SUFBQSxDQUZiOztBQUFBLDBCQVNBLE9BQUEsR0FBUyxTQUFBLEdBQUE7YUFDUCxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQSxFQURPO0lBQUEsQ0FUVCxDQUFBOztBQUFBLDBCQVlBLE9BQUEsR0FBUyxTQUFDLElBQUQsR0FBQTthQUNQLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWCxFQURPO0lBQUEsQ0FaVCxDQUFBOztBQUFBLDBCQWVBLEdBQUEsR0FBSyxTQUFDLElBQUQsR0FBQTtBQUNILFVBQUEsS0FBQTtBQUFBLE1BQUEsSUFBQSxDQUFBLElBQWUsQ0FBQSxPQUFELENBQVMsSUFBVCxDQUFkO0FBQUEsY0FBQSxDQUFBO09BQUE7dURBQ1ksQ0FBRSxzQkFBZCxDQUFBLFdBRkc7SUFBQSxDQWZMLENBQUE7O0FBQUEsMEJBb0JBLFFBQUEsR0FBVSxTQUFDLFNBQUQsRUFBWSxPQUFaLEdBQUE7QUFDUixVQUFBLFVBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsR0FBRCxDQUFLLFNBQUwsQ0FBUixDQUFBO0FBQUEsTUFDQSxHQUFBLEdBQU0sSUFBQyxDQUFBLEdBQUQsQ0FBSyxPQUFMLENBRE4sQ0FBQTtBQUVBLE1BQUEsSUFBRyxlQUFBLElBQVcsYUFBZDtlQUNNLElBQUEsS0FBQSxDQUFNLEtBQU4sRUFBYSxHQUFiLEVBRE47T0FIUTtJQUFBLENBcEJWLENBQUE7O0FBQUEsMEJBMEJBLFFBQUEsR0FBVSxTQUFDLFNBQUQsRUFBWSxPQUFaLEVBQXFCLEtBQXJCLEdBQUE7QUFDUixVQUFBLGlCQUFBO0FBQUEsTUFBQSxRQUFlLEtBQUssQ0FBQyxVQUFOLENBQWlCLEtBQWpCLENBQWYsRUFBQyxjQUFBLEtBQUQsRUFBUSxZQUFBLEdBQVIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLEdBQUQsQ0FBSyxTQUFMLEVBQWdCLEtBQWhCLENBREEsQ0FBQTthQUVBLElBQUMsQ0FBQSxHQUFELENBQUssT0FBTCxFQUFjLEdBQWQsRUFIUTtJQUFBLENBMUJWLENBQUE7O0FBQUEsMEJBZ0NBLEdBQUEsR0FBSyxTQUFDLElBQUQsRUFBTyxLQUFQLEdBQUE7QUFDSCxVQUFBLHFCQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsSUFBZSxDQUFBLE9BQUQsQ0FBUyxJQUFULENBQWQ7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUFBLE1BQ0EsY0FBQSxHQUFpQixJQUFDLENBQUEsTUFBTSxDQUFDLGtCQUFSLENBQTJCLEtBQTNCLENBRGpCLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxLQUFNLENBQUEsSUFBQSxDQUFQLEdBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxrQkFBUixDQUEyQixjQUEzQixDQUZmLENBQUE7QUFBQSxNQUdBLEtBQUEsR0FBUTtBQUFBLFFBQUMsTUFBQSxJQUFEO0FBQUEsUUFBTyxnQkFBQSxjQUFQO0FBQUEsUUFBd0IsUUFBRCxJQUFDLENBQUEsTUFBeEI7T0FIUixDQUFBO2FBSUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBbEIsQ0FBdUIsY0FBdkIsRUFBdUMsS0FBdkMsRUFMRztJQUFBLENBaENMLENBQUE7O3VCQUFBOztNQVJGLENBQUE7O0FBQUEsRUErQ0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsV0EvQ2pCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/mark-manager.coffee
