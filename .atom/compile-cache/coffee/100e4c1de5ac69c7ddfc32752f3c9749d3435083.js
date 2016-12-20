(function() {
  var GlobalExState;

  GlobalExState = (function() {
    function GlobalExState() {}

    GlobalExState.prototype.commandHistory = [];

    GlobalExState.prototype.setVim = function(vim) {
      this.vim = vim;
    };

    return GlobalExState;

  })();

  module.exports = GlobalExState;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy9leC1tb2RlL2xpYi9nbG9iYWwtZXgtc3RhdGUuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGFBQUE7O0FBQUEsRUFBTTsrQkFDSjs7QUFBQSw0QkFBQSxjQUFBLEdBQWdCLEVBQWhCLENBQUE7O0FBQUEsNEJBQ0EsTUFBQSxHQUFRLFNBQUUsR0FBRixHQUFBO0FBQVEsTUFBUCxJQUFDLENBQUEsTUFBQSxHQUFNLENBQVI7SUFBQSxDQURSLENBQUE7O3lCQUFBOztNQURGLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUFpQixhQUpqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/andy/.atom/packages/ex-mode/lib/global-ex-state.coffee
