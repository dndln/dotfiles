(function() {
  var CompositeDisposable, HighlightSearchManager, matchScopes, scanEditor, settings, _ref;

  CompositeDisposable = require('atom').CompositeDisposable;

  _ref = require('./utils'), scanEditor = _ref.scanEditor, matchScopes = _ref.matchScopes;

  settings = require('./settings');

  module.exports = HighlightSearchManager = (function() {
    function HighlightSearchManager(vimState) {
      var options, _ref1;
      this.vimState = vimState;
      _ref1 = this.vimState, this.editor = _ref1.editor, this.editorElement = _ref1.editorElement, this.globalState = _ref1.globalState;
      this.disposables = new CompositeDisposable;
      this.markerLayer = this.editor.addMarkerLayer();
      options = {
        type: 'highlight',
        invalidate: 'inside',
        "class": 'vim-mode-plus-highlight-search'
      };
      this.decorationLayer = this.editor.decorateMarkerLayer(this.markerLayer, options);
      this.disposables.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.disposables = this.globalState.onDidChange((function(_this) {
        return function(_arg) {
          var name, newValue;
          name = _arg.name, newValue = _arg.newValue;
          if (name === 'highlightSearchPattern') {
            if (newValue) {
              return _this.refresh();
            } else {
              return _this.clearMarkers();
            }
          }
        };
      })(this));
    }

    HighlightSearchManager.prototype.destroy = function() {
      this.decorationLayer.destroy();
      this.disposables.dispose();
      return this.markerLayer.destroy();
    };

    HighlightSearchManager.prototype.hasMarkers = function() {
      return this.markerLayer.getMarkerCount() > 0;
    };

    HighlightSearchManager.prototype.getMarkers = function() {
      return this.markerLayer.getMarkers();
    };

    HighlightSearchManager.prototype.clearMarkers = function() {
      var marker, _i, _len, _ref1, _results;
      _ref1 = this.markerLayer.getMarkers();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        marker = _ref1[_i];
        _results.push(marker.destroy());
      }
      return _results;
    };

    HighlightSearchManager.prototype.refresh = function() {
      var pattern, range, _i, _len, _ref1, _results;
      this.clearMarkers();
      if (!settings.get('highlightSearch')) {
        return;
      }
      if (!this.vimState.isVisible()) {
        return;
      }
      if (!(pattern = this.globalState.get('highlightSearchPattern'))) {
        return;
      }
      if (matchScopes(this.editorElement, settings.get('highlightSearchExcludeScopes'))) {
        return;
      }
      _ref1 = scanEditor(this.editor, pattern);
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        range = _ref1[_i];
        _results.push(this.markerLayer.markBufferRange(range));
      }
      return _results;
    };

    return HighlightSearchManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9oaWdobGlnaHQtc2VhcmNoLW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9GQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFDQSxPQUE0QixPQUFBLENBQVEsU0FBUixDQUE1QixFQUFDLGtCQUFBLFVBQUQsRUFBYSxtQkFBQSxXQURiLENBQUE7O0FBQUEsRUFFQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FGWCxDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEsZ0NBQUUsUUFBRixHQUFBO0FBQ1gsVUFBQSxjQUFBO0FBQUEsTUFEWSxJQUFDLENBQUEsV0FBQSxRQUNiLENBQUE7QUFBQSxNQUFBLFFBQTBDLElBQUMsQ0FBQSxRQUEzQyxFQUFDLElBQUMsQ0FBQSxlQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEsc0JBQUEsYUFBWCxFQUEwQixJQUFDLENBQUEsb0JBQUEsV0FBM0IsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFdBQUQsR0FBZSxHQUFBLENBQUEsbUJBRGYsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBQSxDQUZmLENBQUE7QUFBQSxNQUlBLE9BQUEsR0FDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFdBQU47QUFBQSxRQUNBLFVBQUEsRUFBWSxRQURaO0FBQUEsUUFFQSxPQUFBLEVBQU8sZ0NBRlA7T0FMRixDQUFBO0FBQUEsTUFRQSxJQUFDLENBQUEsZUFBRCxHQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLG1CQUFSLENBQTRCLElBQUMsQ0FBQSxX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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/highlight-search-manager.coffee
