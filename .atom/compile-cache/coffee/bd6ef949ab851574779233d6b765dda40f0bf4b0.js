(function() {
  var CompositeDisposable, Emitter, Input, _ref;

  _ref = require('atom'), Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  module.exports = Input = (function() {
    Input.prototype.onDidChange = function(fn) {
      return this.emitter.on('did-change', fn);
    };

    Input.prototype.onDidConfirm = function(fn) {
      return this.emitter.on('did-confirm', fn);
    };

    Input.prototype.onDidCancel = function(fn) {
      return this.emitter.on('did-cancel', fn);
    };

    function Input(vimState) {
      this.vimState = vimState;
      this.editorElement = this.vimState.editorElement;
      this.vimState.onDidFailToSetTarget((function(_this) {
        return function() {
          return _this.cancel();
        };
      })(this));
      this.emitter = new Emitter;
    }

    Input.prototype.destroy = function() {
      var _ref1;
      return _ref1 = {}, this.vimState = _ref1.vimState, _ref1;
    };

    Input.prototype.focus = function(charsMax) {
      var chars;
      if (charsMax == null) {
        charsMax = 1;
      }
      chars = [];
      this.disposables = new CompositeDisposable();
      this.disposables.add(this.vimState.swapClassName("vim-mode-plus-input-char-waiting is-focused"));
      this.disposables.add(this.vimState.onDidSetInputChar((function(_this) {
        return function(char) {
          var text;
          if (charsMax === 1) {
            return _this.confirm(char);
          } else {
            chars.push(char);
            text = chars.join('');
            _this.emitter.emit('did-change', text);
            if (chars.length >= charsMax) {
              return _this.confirm(text);
            }
          }
        };
      })(this)));
      return this.disposables.add(atom.commands.add(this.editorElement, {
        'core:cancel': (function(_this) {
          return function(event) {
            event.stopImmediatePropagation();
            return _this.cancel();
          };
        })(this),
        'core:confirm': (function(_this) {
          return function(event) {
            event.stopImmediatePropagation();
            return _this.confirm(chars.join(''));
          };
        })(this)
      }));
    };

    Input.prototype.confirm = function(char) {
      var _ref1;
      if ((_ref1 = this.disposables) != null) {
        _ref1.dispose();
      }
      return this.emitter.emit('did-confirm', char);
    };

    Input.prototype.cancel = function() {
      var _ref1;
      if ((_ref1 = this.disposables) != null) {
        _ref1.dispose();
      }
      return this.emitter.emit('did-cancel');
    };

    return Input;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9pbnB1dC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEseUNBQUE7O0FBQUEsRUFBQSxPQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLGVBQUEsT0FBRCxFQUFVLDJCQUFBLG1CQUFWLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osb0JBQUEsV0FBQSxHQUFhLFNBQUMsRUFBRCxHQUFBO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksWUFBWixFQUEwQixFQUExQixFQUFSO0lBQUEsQ0FBYixDQUFBOztBQUFBLG9CQUNBLFlBQUEsR0FBYyxTQUFDLEVBQUQsR0FBQTthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGFBQVosRUFBMkIsRUFBM0IsRUFBUjtJQUFBLENBRGQsQ0FBQTs7QUFBQSxvQkFFQSxXQUFBLEdBQWEsU0FBQyxFQUFELEdBQUE7YUFBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxZQUFaLEVBQTBCLEVBQTFCLEVBQVI7SUFBQSxDQUZiLENBQUE7O0FBSWEsSUFBQSxlQUFFLFFBQUYsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLFdBQUEsUUFDYixDQUFBO0FBQUEsTUFBQyxJQUFDLENBQUEsZ0JBQWlCLElBQUMsQ0FBQSxTQUFsQixhQUFGLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsb0JBQVYsQ0FBK0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDN0IsS0FBQyxDQUFBLE1BQUQsQ0FBQSxFQUQ2QjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQS9CLENBREEsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUFBLENBQUEsT0FIWCxDQURXO0lBQUEsQ0FKYjs7QUFBQSxvQkFVQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsVUFBQSxLQUFBO2FBQUEsUUFBYyxFQUFkLEVBQUMsSUFBQyxDQUFBLGlCQUFBLFFBQUYsRUFBQSxNQURPO0lBQUEsQ0FWVCxDQUFBOztBQUFBLG9CQWFBLEtBQUEsR0FBTyxTQUFDLFFBQUQsR0FBQTtBQUNMLFVBQUEsS0FBQTs7UUFETSxXQUFTO09BQ2Y7QUFBQSxNQUFBLEtBQUEsR0FBUSxFQUFSLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxXQUFELEdBQW1CLElBQUEsbUJBQUEsQ0FBQSxDQUZuQixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxhQUFWLENBQXdCLDZDQUF4QixDQUFqQixDQUhBLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFDLENBQUEsUUFBUSxDQUFDLGlCQUFWLENBQTRCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLElBQUQsR0FBQTtBQUMzQyxjQUFBLElBQUE7QUFBQSxVQUFBLElBQUcsUUFBQSxLQUFZLENBQWY7bUJBQ0UsS0FBQyxDQUFBLE9BQUQsQ0FBUyxJQUFULEVBREY7V0FBQSxNQUFBO0FBR0UsWUFBQSxLQUFLLENBQUMsSUFBTixDQUFXLElBQVgsQ0FBQSxDQUFBO0FBQUEsWUFDQSxJQUFBLEdBQU8sS0FBSyxDQUFDLElBQU4sQ0FBVyxFQUFYLENBRFAsQ0FBQTtBQUFBLFlBRUEsS0FBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsWUFBZCxFQUE0QixJQUE1QixDQUZBLENBQUE7QUFHQSxZQUFBLElBQUcsS0FBSyxDQUFDLE1BQU4sSUFBZ0IsUUFBbkI7cUJBQ0UsS0FBQyxDQUFBLE9BQUQsQ0FBUyxJQUFULEVBREY7YUFORjtXQUQyQztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTVCLENBQWpCLENBSkEsQ0FBQTthQWNBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLGFBQW5CLEVBQ2Y7QUFBQSxRQUFBLGFBQUEsRUFBZSxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUMsS0FBRCxHQUFBO0FBQ2IsWUFBQSxLQUFLLENBQUMsd0JBQU4sQ0FBQSxDQUFBLENBQUE7bUJBQ0EsS0FBQyxDQUFBLE1BQUQsQ0FBQSxFQUZhO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZjtBQUFBLFFBR0EsY0FBQSxFQUFnQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUMsS0FBRCxHQUFBO0FBQ2QsWUFBQSxLQUFLLENBQUMsd0JBQU4sQ0FBQSxDQUFBLENBQUE7bUJBQ0EsS0FBQyxDQUFBLE9BQUQsQ0FBUyxLQUFLLENBQUMsSUFBTixDQUFXLEVBQVgsQ0FBVCxFQUZjO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIaEI7T0FEZSxDQUFqQixFQWZLO0lBQUEsQ0FiUCxDQUFBOztBQUFBLG9CQW9DQSxPQUFBLEdBQVMsU0FBQyxJQUFELEdBQUE7QUFDUCxVQUFBLEtBQUE7O2FBQVksQ0FBRSxPQUFkLENBQUE7T0FBQTthQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGFBQWQsRUFBNkIsSUFBN0IsRUFGTztJQUFBLENBcENULENBQUE7O0FBQUEsb0JBd0NBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTixVQUFBLEtBQUE7O2FBQVksQ0FBRSxPQUFkLENBQUE7T0FBQTthQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLFlBQWQsRUFGTTtJQUFBLENBeENSLENBQUE7O2lCQUFBOztNQUpGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/input.coffee
