(function() {
  var CompositeDisposable, Emitter, OccurrenceManager, scanEditor, shrinkRangeEndToBeforeNewLine, _, _ref, _ref1;

  _ = require('underscore-plus');

  _ref = require('atom'), Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  _ref1 = require('./utils'), scanEditor = _ref1.scanEditor, shrinkRangeEndToBeforeNewLine = _ref1.shrinkRangeEndToBeforeNewLine;

  module.exports = OccurrenceManager = (function() {
    OccurrenceManager.prototype.patterns = null;

    function OccurrenceManager(vimState) {
      var options, _ref2;
      this.vimState = vimState;
      _ref2 = this.vimState, this.editor = _ref2.editor, this.editorElement = _ref2.editorElement;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.emitter = new Emitter;
      this.patterns = [];
      this.markerLayer = this.editor.addMarkerLayer();
      options = {
        type: 'highlight',
        "class": 'vim-mode-plus-occurrence-match'
      };
      this.decorationLayer = this.editor.decorateMarkerLayer(this.markerLayer, options);
      this.onDidChangePatterns((function(_this) {
        return function(_arg) {
          var marker, newPattern, range, _i, _j, _len, _len1, _ref3, _ref4, _results, _results1;
          newPattern = _arg.newPattern;
          if (newPattern) {
            _ref3 = scanEditor(_this.editor, newPattern);
            _results = [];
            for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
              range = _ref3[_i];
              _results.push(_this.markerLayer.markBufferRange(range));
            }
            return _results;
          } else {
            _ref4 = _this.markerLayer.getMarkers();
            _results1 = [];
            for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
              marker = _ref4[_j];
              _results1.push(marker.destroy());
            }
            return _results1;
          }
        };
      })(this));
      this.markerLayer.onDidUpdate((function(_this) {
        return function() {
          return _this.editorElement.classList.toggle("has-occurrence", _this.hasMarkers());
        };
      })(this));
    }

    OccurrenceManager.prototype.onDidChangePatterns = function(fn) {
      return this.emitter.on('did-change-patterns', fn);
    };

    OccurrenceManager.prototype.destroy = function() {
      this.decorationLayer.destroy();
      this.disposables.dispose();
      return this.markerLayer.destroy();
    };

    OccurrenceManager.prototype.getMarkerRangesIntersectsWithRanges = function(ranges, exclusive) {
      if (exclusive == null) {
        exclusive = false;
      }
      return this.getMarkersIntersectsWithRanges(ranges, exclusive).map(function(marker) {
        return marker.getBufferRange();
      });
    };

    OccurrenceManager.prototype.hasPatterns = function() {
      return this.patterns.length > 0;
    };

    OccurrenceManager.prototype.resetPatterns = function() {
      this.patterns = [];
      return this.emitter.emit('did-change-patterns', {});
    };

    OccurrenceManager.prototype.addPattern = function(pattern) {
      if (pattern == null) {
        pattern = null;
      }
      this.patterns.push(pattern);
      return this.emitter.emit('did-change-patterns', {
        newPattern: pattern
      });
    };

    OccurrenceManager.prototype.buildPattern = function() {
      var source;
      source = this.patterns.map(function(pattern) {
        return pattern.source;
      }).join('|');
      return new RegExp(source, 'g');
    };

    OccurrenceManager.prototype.hasMarkers = function() {
      return this.markerLayer.getMarkerCount() > 0;
    };

    OccurrenceManager.prototype.getMarkers = function() {
      return this.markerLayer.getMarkers();
    };

    OccurrenceManager.prototype.getMarkerCount = function() {
      return this.markerLayer.getMarkerCount();
    };

    OccurrenceManager.prototype.getMarkersIntersectsWithRanges = function(ranges, exclusive) {
      var markers, range, results, _i, _len;
      if (exclusive == null) {
        exclusive = false;
      }
      ranges = ranges.map(function(range) {
        return shrinkRangeEndToBeforeNewLine(range);
      });
      results = [];
      for (_i = 0, _len = ranges.length; _i < _len; _i++) {
        range = ranges[_i];
        markers = this.markerLayer.findMarkers({
          intersectsBufferRange: range
        }).filter(function(marker) {
          return range.intersectsWith(marker.getBufferRange(), exclusive);
        });
        results.push.apply(results, markers);
      }
      return results;
    };

    OccurrenceManager.prototype.getMarkerAtPoint = function(point) {
      return this.markerLayer.findMarkers({
        containsBufferPosition: point
      })[0];
    };

    return OccurrenceManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9vY2N1cnJlbmNlLW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBHQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxPQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLGVBQUEsT0FBRCxFQUFVLDJCQUFBLG1CQURWLENBQUE7O0FBQUEsRUFHQSxRQUdJLE9BQUEsQ0FBUSxTQUFSLENBSEosRUFDRSxtQkFBQSxVQURGLEVBRUUsc0NBQUEsNkJBTEYsQ0FBQTs7QUFBQSxFQVFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixnQ0FBQSxRQUFBLEdBQVUsSUFBVixDQUFBOztBQUVhLElBQUEsMkJBQUUsUUFBRixHQUFBO0FBQ1gsVUFBQSxjQUFBO0FBQUEsTUFEWSxJQUFDLENBQUEsV0FBQSxRQUNiLENBQUE7QUFBQSxNQUFBLFFBQTRCLElBQUMsQ0FBQSxRQUE3QixFQUFDLElBQUMsQ0FBQSxlQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEsc0JBQUEsYUFBWCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlLEdBQUEsQ0FBQSxtQkFEZixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FBdkIsQ0FBakIsQ0FGQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBQSxPQUhYLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxRQUFELEdBQVksRUFKWixDQUFBO0FBQUEsTUFN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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/occurrence-manager.coffee
