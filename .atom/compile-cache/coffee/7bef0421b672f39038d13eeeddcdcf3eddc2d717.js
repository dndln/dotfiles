(function() {
  var StatusBarManager, createDiv, settings, _;

  _ = require('underscore-plus');

  settings = require('./settings');

  createDiv = function(_arg) {
    var classList, div, id, _ref;
    id = _arg.id, classList = _arg.classList;
    div = document.createElement('div');
    if (id != null) {
      div.id = id;
    }
    if (classList != null) {
      (_ref = div.classList).add.apply(_ref, classList);
    }
    return div;
  };

  module.exports = StatusBarManager = (function() {
    StatusBarManager.prototype.prefix = 'status-bar-vim-mode-plus';

    function StatusBarManager() {
      this.container = createDiv({
        id: "" + this.prefix + "-container",
        classList: ['inline-block']
      });
      this.container.appendChild(this.element = createDiv({
        id: this.prefix
      }));
    }

    StatusBarManager.prototype.initialize = function(statusBar) {
      this.statusBar = statusBar;
    };

    StatusBarManager.prototype.update = function(mode, submode) {
      var modeString;
      this.element.className = "" + this.prefix + "-" + mode;
      modeString = (function() {
        switch (settings.get('statusBarModeStringStyle')) {
          case 'short':
            return this.getShortModeString(mode, submode);
          case 'long':
            return this.getLongModeString(mode, submode);
        }
      }).call(this);
      return this.element.textContent = modeString;
    };

    StatusBarManager.prototype.getShortModeString = function(mode, submode) {
      return (mode[0] + (submode != null ? submode[0] : '')).toUpperCase();
    };

    StatusBarManager.prototype.getLongModeString = function(mode, submode) {
      var modeString;
      modeString = _.humanizeEventName(mode);
      if (submode != null) {
        modeString += " " + _.humanizeEventName(submode);
      }
      return modeString;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9zdGF0dXMtYmFyLW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdDQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FEWCxDQUFBOztBQUFBLEVBR0EsU0FBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO0FBQ1YsUUFBQSx3QkFBQTtBQUFBLElBRFksVUFBQSxJQUFJLGlCQUFBLFNBQ2hCLENBQUE7QUFBQSxJQUFBLEdBQUEsR0FBTSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUFOLENBQUE7QUFDQSxJQUFBLElBQWUsVUFBZjtBQUFBLE1BQUEsR0FBRyxDQUFDLEVBQUosR0FBUyxFQUFULENBQUE7S0FEQTtBQUVBLElBQUEsSUFBbUMsaUJBQW5DO0FBQUEsTUFBQSxRQUFBLEdBQUcsQ0FBQyxTQUFKLENBQWEsQ0FBQyxHQUFkLGFBQWtCLFNBQWxCLENBQUEsQ0FBQTtLQUZBO1dBR0EsSUFKVTtFQUFBLENBSFosQ0FBQTs7QUFBQSxFQVNBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiwrQkFBQSxNQUFBLEdBQVEsMEJBQVIsQ0FBQTs7QUFFYSxJQUFBLDBCQUFBLEdBQUE7QUFDWCxNQUFBLElBQUMsQ0FBQSxTQUFELEdBQWEsU0FBQSxDQUFVO0FBQUEsUUFBQSxFQUFBLEVBQUksRUFBQSxHQUFHLElBQUMsQ0FBQSxNQUFKLEdBQVcsWUFBZjtBQUFBLFFBQTRCLFNBQUEsRUFBVyxDQUFDLGNBQUQsQ0FBdkM7T0FBVixDQUFiLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsV0FBWCxDQUF1QixJQUFDLENBQUEsT0FBRCxHQUFXLFNBQUEsQ0FBVTtBQUFBLFFBQUEsRUFBQSxFQUFJLElBQUMsQ0FBQSxNQUFMO09BQVYsQ0FBbEMsQ0FEQSxDQURXO0lBQUEsQ0FGYjs7QUFBQSwrQkFNQSxVQUFBLEdBQVksU0FBRSxTQUFGLEdBQUE7QUFBYyxNQUFiLElBQUMsQ0FBQSxZQUFBLFNBQVksQ0FBZDtJQUFBLENBTlosQ0FBQTs7QUFBQSwrQkFRQSxNQUFBLEdBQVEsU0FBQyxJQUFELEVBQU8sT0FBUCxHQUFBO0FBQ04sVUFBQSxVQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsR0FBcUIsRUFBQSxHQUFHLElBQUMsQ0FBQSxNQUFKLEdBQVcsR0FBWCxHQUFjLElBQW5DLENBQUE7QUFBQSxNQUNBLFVBQUE7QUFBYSxnQkFBTyxRQUFRLENBQUMsR0FBVCxDQUFhLDBCQUFiLENBQVA7QUFBQSxlQUNOLE9BRE07bUJBQ08sSUFBQyxDQUFBLGtCQUFELENBQW9CLElBQXBCLEVBQTBCLE9BQTFCLEVBRFA7QUFBQSxlQUVOLE1BRk07bUJBRU0sSUFBQyxDQUFBLGlCQUFELENBQW1CLElBQW5CLEVBQXlCLE9BQXpCLEVBRk47QUFBQTttQkFEYixDQUFBO2FBSUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULEdBQXVCLFdBTGpCO0lBQUEsQ0FSUixDQUFBOztBQUFBLCtCQWVBLGtCQUFBLEdBQW9CLFNBQUMsSUFBRCxFQUFPLE9BQVAsR0FBQTthQUNsQixDQUFDLElBQUssQ0FBQSxDQUFBLENBQUwsR0FBVSxDQUFJLGVBQUgsR0FBaUIsT0FBUSxDQUFBLENBQUEsQ0FBekIsR0FBaUMsRUFBbEMsQ0FBWCxDQUFpRCxDQUFDLFdBQWxELENBQUEsRUFEa0I7SUFBQSxDQWZwQixDQUFBOztBQUFBLCtCQWtCQSxpQkFBQSxHQUFtQixTQUFDLElBQUQsRUFBTyxPQUFQLEdBQUE7QUFDakIsVUFBQSxVQUFBO0FBQUEsTUFBQSxVQUFBLEdBQWEsQ0FBQyxDQUFDLGlCQUFGLENBQW9CLElBQXBCLENBQWIsQ0FBQTtBQUNBLE1BQUEsSUFBb0QsZUFBcEQ7QUFBQSxRQUFBLFVBQUEsSUFBYyxHQUFBLEdBQU0sQ0FBQyxDQUFDLGlCQUFGLENBQW9CLE9BQXBCLENBQXBCLENBQUE7T0FEQTthQUVBLFdBSGlCO0lBQUEsQ0FsQm5CLENBQUE7O0FBQUEsK0JBdUJBLE1BQUEsR0FBUSxTQUFBLEdBQUE7YUFDTixJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxTQUFTLENBQUMsWUFBWCxDQUF3QjtBQUFBLFFBQUEsSUFBQSxFQUFNLElBQUMsQ0FBQSxTQUFQO0FBQUEsUUFBa0IsUUFBQSxFQUFVLEVBQTVCO09BQXhCLEVBREY7SUFBQSxDQXZCUixDQUFBOztBQUFBLCtCQTBCQSxNQUFBLEdBQVEsU0FBQSxHQUFBO2FBQ04sSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFOLENBQUEsRUFETTtJQUFBLENBMUJSLENBQUE7OzRCQUFBOztNQVhGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/status-bar-manager.coffee
