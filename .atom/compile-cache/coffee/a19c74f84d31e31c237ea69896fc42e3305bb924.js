(function() {
  var ElementBuilder, StatusBarManager, modeStringToContent;

  ElementBuilder = require('./utils').ElementBuilder;

  modeStringToContent = {
    "normal": "Normal",
    'insert': "Insert",
    'insert.replace': "Replace",
    'visual': "Visual",
    "visual.characterwise": "Visual Char",
    "visual.linewise": "Visual Line",
    "visual.blockwise": "Visual Block",
    "operator-pending": "Operator Pending"
  };

  module.exports = StatusBarManager = (function() {
    ElementBuilder.includeInto(StatusBarManager);

    StatusBarManager.prototype.prefix = 'status-bar-vim-mode-plus';

    function StatusBarManager() {
      this.container = this.div({
        id: "" + this.prefix + "-container",
        classList: ['inline-block']
      });
      this.container.appendChild(this.element = this.div({
        id: this.prefix
      }));
    }

    StatusBarManager.prototype.initialize = function(statusBar) {
      this.statusBar = statusBar;
    };

    StatusBarManager.prototype.update = function(mode, submode) {
      var modeString;
      modeString = mode;
      if (submode != null) {
        modeString += "." + submode;
      }
      this.element.className = "" + this.prefix + "-" + mode;
      return this.element.textContent = modeStringToContent[modeString];
    };

    StatusBarManager.prototype.attach = function() {
      return this.tile = this.statusBar.addRightTile({
        item: this.container,
        priority: 20
      });
    };

    StatusBarManager.prototype.detach = function() {
      return this.tile.destroy();
    };

    return StatusBarManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9zdGF0dXMtYmFyLW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFEQUFBOztBQUFBLEVBQUMsaUJBQWtCLE9BQUEsQ0FBUSxTQUFSLEVBQWxCLGNBQUQsQ0FBQTs7QUFBQSxFQUVBLG1CQUFBLEdBQ0U7QUFBQSxJQUFBLFFBQUEsRUFBVSxRQUFWO0FBQUEsSUFDQSxRQUFBLEVBQVUsUUFEVjtBQUFBLElBRUEsZ0JBQUEsRUFBa0IsU0FGbEI7QUFBQSxJQUdBLFFBQUEsRUFBVSxRQUhWO0FBQUEsSUFJQSxzQkFBQSxFQUF3QixhQUp4QjtBQUFBLElBS0EsaUJBQUEsRUFBbUIsYUFMbkI7QUFBQSxJQU1BLGtCQUFBLEVBQW9CLGNBTnBCO0FBQUEsSUFPQSxrQkFBQSxFQUFvQixrQkFQcEI7R0FIRixDQUFBOztBQUFBLEVBWUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLElBQUEsY0FBYyxDQUFDLFdBQWYsQ0FBMkIsZ0JBQTNCLENBQUEsQ0FBQTs7QUFBQSwrQkFDQSxNQUFBLEdBQVEsMEJBRFIsQ0FBQTs7QUFHYSxJQUFBLDBCQUFBLEdBQUE7QUFDWCxNQUFBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsRUFBQSxFQUFJLEVBQUEsR0FBRyxJQUFDLENBQUEsTUFBSixHQUFXLFlBQWY7QUFBQSxRQUE0QixTQUFBLEVBQVcsQ0FBQyxjQUFELENBQXZDO09BQUwsQ0FBYixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsU0FBUyxDQUFDLFdBQVgsQ0FBdUIsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxFQUFBLEVBQUksSUFBQyxDQUFBLE1BQUw7T0FBTCxDQUFsQyxDQURBLENBRFc7SUFBQSxDQUhiOztBQUFBLCtCQU9BLFVBQUEsR0FBWSxTQUFFLFNBQUYsR0FBQTtBQUFjLE1BQWIsSUFBQyxDQUFBLFlBQUEsU0FBWSxDQUFkO0lBQUEsQ0FQWixDQUFBOztBQUFBLCtCQVNBLE1BQUEsR0FBUSxTQUFDLElBQUQsRUFBTyxPQUFQLEdBQUE7QUFDTixVQUFBLFVBQUE7QUFBQSxNQUFBLFVBQUEsR0FBYSxJQUFiLENBQUE7QUFDQSxNQUFBLElBQStCLGVBQS9CO0FBQUEsUUFBQSxVQUFBLElBQWMsR0FBQSxHQUFNLE9BQXBCLENBQUE7T0FEQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULEdBQXFCLEVBQUEsR0FBRyxJQUFDLENBQUEsTUFBSixHQUFXLEdBQVgsR0FBYyxJQUZuQyxDQUFBO2FBR0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULEdBQXVCLG1CQUFvQixDQUFBLFVBQUEsRUFKckM7SUFBQSxDQVRSLENBQUE7O0FBQUEsK0JBZUEsTUFBQSxHQUFRLFNBQUEsR0FBQTthQUNOLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxZQUFYLENBQXdCO0FBQUEsUUFBQSxJQUFBLEVBQU0sSUFBQyxDQUFBLFNBQVA7QUFBQSxRQUFrQixRQUFBLEVBQVUsRUFBNUI7T0FBeEIsRUFERjtJQUFBLENBZlIsQ0FBQTs7QUFBQSwrQkFrQkEsTUFBQSxHQUFRLFNBQUEsR0FBQTthQUNOLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFBLEVBRE07SUFBQSxDQWxCUixDQUFBOzs0QkFBQTs7TUFkRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/status-bar-manager.coffee
