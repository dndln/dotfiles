(function() {
  var CompositeDisposable, Emitter, Mutation, MutationTracker, Point, swrap, _ref;

  _ref = require('atom'), Point = _ref.Point, Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  swrap = require('./selection-wrapper');

  module.exports = MutationTracker = (function() {
    function MutationTracker(vimState) {
      this.vimState = vimState;
      this.editor = this.vimState.editor;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.emitter = new Emitter;
      this.markerLayer = this.editor.addMarkerLayer();
      this.mutationsBySelection = new Map;
    }

    MutationTracker.prototype.destroy = function() {
      var _ref1;
      this.reset();
      return _ref1 = {}, this.mutationsBySelection = _ref1.mutationsBySelection, this.editor = _ref1.editor, this.vimState = _ref1.vimState, _ref1;
    };

    MutationTracker.prototype.init = function(options) {
      this.options = options;
      return this.reset();
    };

    MutationTracker.prototype.reset = function() {
      var marker, _i, _len, _ref1;
      _ref1 = this.markerLayer.getMarkers();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        marker = _ref1[_i];
        marker.destroy();
      }
      return this.mutationsBySelection.clear();
    };

    MutationTracker.prototype.saveInitialPointForSelection = function(selection) {
      var point;
      if (this.vimState.isMode('visual')) {
        point = swrap(selection).getBufferPositionFor('head', {
          fromProperty: true,
          allowFallback: true
        });
      } else {
        if (!this.options.isSelect) {
          point = swrap(selection).getBufferPositionFor('head');
        }
      }
      if (this.options.useMarker) {
        point = this.markerLayer.markBufferPosition(point, {
          invalidate: 'never'
        });
      }
      return point;
    };

    MutationTracker.prototype.getInitialPointForSelection = function(selection) {
      var _ref1;
      return (_ref1 = this.mutationsBySelection.get(selection)) != null ? _ref1.initialPoint : void 0;
    };

    MutationTracker.prototype.setCheckPoint = function(checkPoint) {
      var createdAt, initialPoint, mutation, options, selection, _i, _len, _ref1, _results;
      _ref1 = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        selection = _ref1[_i];
        if (!this.mutationsBySelection.has(selection)) {
          createdAt = checkPoint;
          initialPoint = this.saveInitialPointForSelection(selection);
          options = {
            selection: selection,
            initialPoint: initialPoint,
            createdAt: createdAt,
            markerLayer: this.markerLayer
          };
          this.mutationsBySelection.set(selection, new Mutation(options));
        }
        mutation = this.mutationsBySelection.get(selection);
        _results.push(mutation.update(checkPoint));
      }
      return _results;
    };

    MutationTracker.prototype.getMutationForSelection = function(selection) {
      return this.mutationsBySelection.get(selection);
    };

    MutationTracker.prototype.getMarkerBufferRanges = function() {
      var ranges;
      ranges = [];
      this.mutationsBySelection.forEach(function(mutation, selection) {
        var range, _ref1;
        if (range = (_ref1 = mutation.marker) != null ? _ref1.getBufferRange() : void 0) {
          return ranges.push(range);
        }
      });
      return ranges;
    };

    MutationTracker.prototype.restoreInitialPositions = function() {
      var point, selection, _i, _len, _ref1, _results;
      _ref1 = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        selection = _ref1[_i];
        if (point = this.getInitialPointForSelection(selection)) {
          _results.push(selection.setBufferPosition(point));
        }
      }
      return _results;
    };

    MutationTracker.prototype.restoreCursorPositions = function(options) {
      var clipToMutationEnd, i, isBlockwise, mutation, mutationEnd, point, points, selection, stay, strict, _i, _j, _len, _len1, _ref1, _ref2, _ref3, _results, _results1;
      stay = options.stay, strict = options.strict, clipToMutationEnd = options.clipToMutationEnd, isBlockwise = options.isBlockwise, mutationEnd = options.mutationEnd;
      if (isBlockwise) {
        points = [];
        this.mutationsBySelection.forEach(function(mutation, selection) {
          var _ref1;
          return points.push((_ref1 = mutation.checkPoint['will-select']) != null ? _ref1.start : void 0);
        });
        points = points.sort(function(a, b) {
          return a.compare(b);
        });
        points = points.filter(function(point) {
          return point != null;
        });
        if (this.vimState.isMode('visual', 'blockwise')) {
          if (point = points[0]) {
            return (_ref1 = this.vimState.getLastBlockwiseSelection()) != null ? _ref1.setHeadBufferPosition(point) : void 0;
          }
        } else {
          if (point = points[0]) {
            return this.editor.setCursorBufferPosition(point);
          } else {
            _ref2 = this.editor.getSelections();
            _results = [];
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              selection = _ref2[_i];
              if (!selection.isLastSelection()) {
                _results.push(selection.destroy());
              } else {
                _results.push(void 0);
              }
            }
            return _results;
          }
        }
      } else {
        _ref3 = this.editor.getSelections();
        _results1 = [];
        for (i = _j = 0, _len1 = _ref3.length; _j < _len1; i = ++_j) {
          selection = _ref3[i];
          if (!(mutation = this.mutationsBySelection.get(selection))) {
            continue;
          }
          if (strict && mutation.createdAt !== 'will-select') {
            selection.destroy();
            continue;
          }
          if (point = mutation.getRestorePoint({
            stay: stay,
            clipToMutationEnd: clipToMutationEnd,
            mutationEnd: mutationEnd
          })) {
            _results1.push(selection.cursor.setBufferPosition(point));
          } else {
            _results1.push(void 0);
          }
        }
        return _results1;
      }
    };

    return MutationTracker;

  })();

  Mutation = (function() {
    function Mutation(options) {
      this.selection = options.selection, this.initialPoint = options.initialPoint, this.createdAt = options.createdAt, this.markerLayer = options.markerLayer;
      this.checkPoint = {};
      this.marker = null;
    }

    Mutation.prototype.update = function(checkPoint) {
      var _ref1;
      if (!this.selection.getBufferRange().isEmpty()) {
        if ((_ref1 = this.marker) != null) {
          _ref1.destroy();
        }
        this.marker = null;
      }
      if (this.marker == null) {
        this.marker = this.markerLayer.markBufferRange(this.selection.getBufferRange(), {
          invalidate: 'never'
        });
      }
      return this.checkPoint[checkPoint] = this.marker.getBufferRange();
    };

    Mutation.prototype.getMutationEnd = function() {
      var range;
      range = this.marker.getBufferRange();
      if (range.isEmpty()) {
        return range.end;
      } else {
        return range.end.translate([0, -1]);
      }
    };

    Mutation.prototype.getRestorePoint = function(options) {
      var clipToMutationEnd, mutationEnd, point, stay, _ref1;
      if (options == null) {
        options = {};
      }
      stay = options.stay, clipToMutationEnd = options.clipToMutationEnd, mutationEnd = options.mutationEnd;
      if (stay) {
        if (this.initialPoint instanceof Point) {
          point = this.initialPoint;
        } else {
          point = this.initialPoint.getHeadBufferPosition();
        }
        if (clipToMutationEnd) {
          return Point.min(this.getMutationEnd(), point);
        } else {
          return point;
        }
      } else {
        if (mutationEnd) {
          return this.getMutationEnd();
        } else {
          return (_ref1 = this.checkPoint['did-select']) != null ? _ref1.start : void 0;
        }
      }
    };

    return Mutation;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9tdXRhdGlvbi10cmFja2VyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwyRUFBQTs7QUFBQSxFQUFBLE9BQXdDLE9BQUEsQ0FBUSxNQUFSLENBQXhDLEVBQUMsYUFBQSxLQUFELEVBQVEsZUFBQSxPQUFSLEVBQWlCLDJCQUFBLG1CQUFqQixDQUFBOztBQUFBLEVBQ0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUixDQURSLENBQUE7O0FBQUEsRUFjQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSx5QkFBRSxRQUFGLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxXQUFBLFFBQ2IsQ0FBQTtBQUFBLE1BQUMsSUFBQyxDQUFBLFNBQVUsSUFBQyxDQUFBLFNBQVgsTUFBRixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsV0FBRCxHQUFlLEdBQUEsQ0FBQSxtQkFGZixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FBdkIsQ0FBakIsQ0FIQSxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBQSxPQUpYLENBQUE7QUFBQSxNQU1BLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQUEsQ0FOZixDQUFBO0FBQUEsTUFPQSxJQUFDLENBQUEsb0JBQUQsR0FBd0IsR0FBQSxDQUFBLEdBUHhCLENBRFc7SUFBQSxDQUFiOztBQUFBLDhCQVVBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLEtBQUE7QUFBQSxNQUFBLElB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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/mutation-tracker.coffee
