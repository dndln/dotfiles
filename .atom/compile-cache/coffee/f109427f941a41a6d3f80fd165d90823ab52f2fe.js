(function() {
  var CompositeDisposable, Emitter, PersistentSelectionManager, _, _ref;

  _ = require('underscore-plus');

  _ref = require('atom'), Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  module.exports = PersistentSelectionManager = (function() {
    PersistentSelectionManager.prototype.patterns = null;

    function PersistentSelectionManager(vimState) {
      var options, _ref1;
      this.vimState = vimState;
      _ref1 = this.vimState, this.editor = _ref1.editor, this.editorElement = _ref1.editorElement;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.emitter = new Emitter;
      this.markerLayer = this.editor.addMarkerLayer();
      options = {
        type: 'highlight',
        "class": 'vim-mode-plus-persistent-selection'
      };
      this.decorationLayer = this.editor.decorateMarkerLayer(this.markerLayer, options);
      this.markerLayer.onDidUpdate((function(_this) {
        return function() {
          return _this.editorElement.classList.toggle("has-persistent-selection", _this.hasMarkers());
        };
      })(this));
    }

    PersistentSelectionManager.prototype.destroy = function() {
      this.decorationLayer.destroy();
      this.disposables.dispose();
      return this.markerLayer.destroy();
    };

    PersistentSelectionManager.prototype.markBufferRange = function(range) {
      return this.markerLayer.markBufferRange(range);
    };

    PersistentSelectionManager.prototype.hasMarkers = function() {
      return this.markerLayer.getMarkerCount() > 0;
    };

    PersistentSelectionManager.prototype.getMarkers = function() {
      return this.markerLayer.getMarkers();
    };

    PersistentSelectionManager.prototype.getMarkerCount = function() {
      return this.markerLayer.getMarkerCount();
    };

    PersistentSelectionManager.prototype.clearMarkers = function() {
      var marker, _i, _len, _ref1, _results;
      _ref1 = this.markerLayer.getMarkers();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        marker = _ref1[_i];
        _results.push(marker.destroy());
      }
      return _results;
    };

    PersistentSelectionManager.prototype.getMarkerBufferRanges = function() {
      return this.markerLayer.getMarkers().map(function(marker) {
        return marker.getBufferRange();
      });
    };

    PersistentSelectionManager.prototype.getMarkerAtPoint = function(point) {
      return this.markerLayer.findMarkers({
        containsBufferPosition: point
      })[0];
    };

    return PersistentSelectionManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9wZXJzaXN0ZW50LXNlbGVjdGlvbi1tYW5hZ2VyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpRUFBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0EsT0FBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQyxlQUFBLE9BQUQsRUFBVSwyQkFBQSxtQkFEVixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHlDQUFBLFFBQUEsR0FBVSxJQUFWLENBQUE7O0FBRWEsSUFBQSxvQ0FBRSxRQUFGLEdBQUE7QUFDWCxVQUFBLGNBQUE7QUFBQSxNQURZLElBQUMsQ0FBQSxXQUFBLFFBQ2IsQ0FBQTtBQUFBLE1BQUEsUUFBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLGVBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxzQkFBQSxhQUFYLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxXQUFELEdBQWUsR0FBQSxDQUFBLG1CQURmLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsSUFBZCxDQUF2QixDQUFqQixDQUZBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFBLE9BSFgsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBQSxDQUxmLENBQUE7QUFBQSxNQU1BLE9BQUEsR0FBVTtBQUFBLFFBQUMsSUFBQSxFQUFNLFdBQVA7QUFBQSxRQUFvQixPQUFBLEVBQU8sb0NBQTNCO09BTlYsQ0FBQTtBQUFBLE1BT0EsSUFBQyxDQUFBLGVBQUQsR0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxtQkFBUixDQUE0QixJQUFDLENBQUEsV0FBN0IsRUFBMEMsT0FBMUMsQ0FQbkIsQ0FBQTtBQUFBLE1BVUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxXQUFiLENBQXlCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ3ZCLEtBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLE1BQXpCLENBQWdDLDBCQUFoQyxFQUE0RCxLQUFDLENBQUEsVUFBRCxDQUFBLENBQTVELEVBRHVCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekIsQ0FWQSxDQURXO0lBQUEsQ0FGYjs7QUFBQSx5Q0FnQkEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLE1BQUEsSUFBQyxDQUFBLGVBQWUsQ0FBQyxPQUFqQixDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUEsQ0FEQSxDQUFBO2FBRUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUEsRUFITztJQUFBLENBaEJULENBQUE7O0FBQUEseUNBdUJBLGVBQUEsR0FBaUIsU0FBQyxLQUFELEdBQUE7YUFDZixJQUFDLENBQUEsV0FBVyxDQUFDLGVBQWIsQ0FBNkIsS0FBN0IsRUFEZTtJQUFBLENBdkJqQixDQUFBOztBQUFBLHlDQTBCQSxVQUFBLEdBQVksU0FBQSxHQUFBO2FBQ1YsSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFiLENBQUEsQ0FBQSxHQUFnQyxFQUR0QjtJQUFBLENBMUJaLENBQUE7O0FBQUEseUNBNkJBLFVBQUEsR0FBWSxTQUFBLEdBQUE7YUFDVixJQUFDLENBQUEsV0FBVyxDQUFDLFVBQWIsQ0FBQSxFQURVO0lBQUEsQ0E3QlosQ0FBQTs7QUFBQSx5Q0FnQ0EsY0FBQSxHQUFnQixTQUFBLEdBQUE7YUFDZCxJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBQSxFQURjO0lBQUEsQ0FoQ2hCLENBQUE7O0FBQUEseUNBbUNBLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFDWixVQUFBLGlDQUFBO0FBQUE7QUFBQTtXQUFBLDRDQUFBOzJCQUFBO0FBQUEsc0JBQUEsTUFBTSxDQUFDLE9BQVAsQ0FBQSxFQUFBLENBQUE7QUFBQTtzQkFEWTtJQUFBLENBbkNkLENBQUE7O0FBQUEseUNBc0NBLHFCQUFBLEdBQXVCLFNBQUEsR0FBQTthQUNyQixJQUFDLENBQUEsV0FBVyxDQUFDLFVBQWIsQ0FBQSxDQUF5QixDQUFDLEdBQTFCLENBQThCLFNBQUMsTUFBRCxHQUFBO2VBQzVCLE1BQU0sQ0FBQyxjQUFQLENBQUEsRUFENEI7TUFBQSxDQUE5QixFQURxQjtJQUFBLENBdEN2QixDQUFBOztBQUFBLHlDQTBDQSxnQkFBQSxHQUFrQixTQUFDLEtBQUQsR0FBQTthQUNoQixJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsQ0FBeUI7QUFBQSxRQUFBLHNCQUFBLEVBQXdCLEtBQXhCO09BQXpCLENBQXdELENBQUEsQ0FBQSxFQUR4QztJQUFBLENBMUNsQixDQUFBOztzQ0FBQTs7TUFMRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/persistent-selection-manager.coffee
