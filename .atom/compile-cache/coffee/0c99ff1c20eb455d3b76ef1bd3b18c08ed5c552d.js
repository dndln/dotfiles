(function() {
  var Emitter, GlobalState;

  Emitter = require('atom').Emitter;

  GlobalState = (function() {
    function GlobalState(state) {
      this.state = state;
      this.emitter = new Emitter;
      this.onDidChange((function(_this) {
        return function(_arg) {
          var name, newValue;
          name = _arg.name, newValue = _arg.newValue;
          if (name === 'lastSearchPattern') {
            return _this.set('highlightSearchPattern', newValue);
          }
        };
      })(this));
    }

    GlobalState.prototype.get = function(name) {
      return this.state[name];
    };

    GlobalState.prototype.set = function(name, newValue) {
      var oldValue;
      oldValue = this.get(name);
      this.state[name] = newValue;
      return this.emitDidChange({
        name: name,
        oldValue: oldValue,
        newValue: newValue
      });
    };

    GlobalState.prototype.onDidChange = function(fn) {
      return this.emitter.on('did-change', fn);
    };

    GlobalState.prototype.emitDidChange = function(event) {
      return this.emitter.emit('did-change', event);
    };

    return GlobalState;

  })();

  module.exports = new GlobalState({
    searchHistory: [],
    currentSearch: null,
    lastSearchPattern: null,
    highlightSearchPattern: null,
    currentFind: null,
    register: {}
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9nbG9iYWwtc3RhdGUuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9CQUFBOztBQUFBLEVBQUMsVUFBVyxPQUFBLENBQVEsTUFBUixFQUFYLE9BQUQsQ0FBQTs7QUFBQSxFQUVNO0FBQ1MsSUFBQSxxQkFBRSxLQUFGLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxRQUFBLEtBQ2IsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUFBLENBQUEsT0FBWCxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsV0FBRCxDQUFhLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLElBQUQsR0FBQTtBQUVYLGNBQUEsY0FBQTtBQUFBLFVBRmEsWUFBQSxNQUFNLGdCQUFBLFFBRW5CLENBQUE7QUFBQSxVQUFBLElBQUcsSUFBQSxLQUFRLG1CQUFYO21CQUNFLEtBQUMsQ0FBQSxHQUFELENBQUssd0JBQUwsRUFBK0IsUUFBL0IsRUFERjtXQUZXO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBYixDQUZBLENBRFc7SUFBQSxDQUFiOztBQUFBLDBCQVFBLEdBQUEsR0FBSyxTQUFDLElBQUQsR0FBQTthQUNILElBQUMsQ0FBQSxLQUFNLENBQUEsSUFBQSxFQURKO0lBQUEsQ0FSTCxDQUFBOztBQUFBLDBCQVdBLEdBQUEsR0FBSyxTQUFDLElBQUQsRUFBTyxRQUFQLEdBQUE7QUFDSCxVQUFBLFFBQUE7QUFBQSxNQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsR0FBRCxDQUFLLElBQUwsQ0FBWCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsS0FBTSxDQUFBLElBQUEsQ0FBUCxHQUFlLFFBRGYsQ0FBQTthQUVBLElBQUMsQ0FBQSxhQUFELENBQWU7QUFBQSxRQUFDLE1BQUEsSUFBRDtBQUFBLFFBQU8sVUFBQSxRQUFQO0FBQUEsUUFBaUIsVUFBQSxRQUFqQjtPQUFmLEVBSEc7SUFBQSxDQVhMLENBQUE7O0FBQUEsMEJBZ0JBLFdBQUEsR0FBYSxTQUFDLEVBQUQsR0FBQTthQUNYLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLFlBQVosRUFBMEIsRUFBMUIsRUFEVztJQUFBLENBaEJiLENBQUE7O0FBQUEsMEJBbUJBLGFBQUEsR0FBZSxTQUFDLEtBQUQsR0FBQTthQUNiLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLFlBQWQsRUFBNEIsS0FBNUIsRUFEYTtJQUFBLENBbkJmLENBQUE7O3VCQUFBOztNQUhGLENBQUE7O0FBQUEsRUF5QkEsTUFBTSxDQUFDLE9BQVAsR0FBcUIsSUFBQSxXQUFBLENBQ25CO0FBQUEsSUFBQSxhQUFBLEVBQWUsRUFBZjtBQUFBLElBQ0EsYUFBQSxFQUFlLElBRGY7QUFBQSxJQUVBLGlCQUFBLEVBQW1CLElBRm5CO0FBQUEsSUFHQSxzQkFBQSxFQUF3QixJQUh4QjtBQUFBLElBSUEsV0FBQSxFQUFhLElBSmI7QUFBQSxJQUtBLFFBQUEsRUFBVSxFQUxWO0dBRG1CLENBekJyQixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/global-state.coffee
