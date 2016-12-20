(function() {
  var OperationAbortedError, VimModePlusError,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  VimModePlusError = (function(_super) {
    __extends(VimModePlusError, _super);

    function VimModePlusError(_arg) {
      this.message = _arg.message;
      this.name = this.constructor.name;
    }

    return VimModePlusError;

  })(Error);

  OperationAbortedError = (function(_super) {
    __extends(OperationAbortedError, _super);

    function OperationAbortedError() {
      return OperationAbortedError.__super__.constructor.apply(this, arguments);
    }

    return OperationAbortedError;

  })(VimModePlusError);

  module.exports = {
    OperationAbortedError: OperationAbortedError
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9lcnJvcnMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBTTtBQUNKLHVDQUFBLENBQUE7O0FBQWEsSUFBQSwwQkFBQyxJQUFELEdBQUE7QUFDWCxNQURhLElBQUMsQ0FBQSxVQUFGLEtBQUUsT0FDZCxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBckIsQ0FEVztJQUFBLENBQWI7OzRCQUFBOztLQUQ2QixNQUEvQixDQUFBOztBQUFBLEVBSU07QUFBTiw0Q0FBQSxDQUFBOzs7O0tBQUE7O2lDQUFBOztLQUFvQyxpQkFKcEMsQ0FBQTs7QUFBQSxFQU1BLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBQUEsSUFDZix1QkFBQSxxQkFEZTtHQU5qQixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/errors.coffee
