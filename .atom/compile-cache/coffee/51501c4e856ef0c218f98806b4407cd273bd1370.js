(function() {
  var CompositeDisposable, Emitter, Mutation, MutationManager, Point, swrap, _ref;

  _ref = require('atom'), Point = _ref.Point, Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  swrap = require('./selection-wrapper');

  module.exports = MutationManager = (function() {
    function MutationManager(vimState) {
      this.vimState = vimState;
      this.editor = this.vimState.editor;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.emitter = new Emitter;
      this.markerLayer = this.editor.addMarkerLayer();
      this.mutationsBySelection = new Map;
    }

    MutationManager.prototype.destroy = function() {
      var _ref1;
      this.reset();
      return _ref1 = {}, this.mutationsBySelection = _ref1.mutationsBySelection, this.editor = _ref1.editor, this.vimState = _ref1.vimState, _ref1;
    };

    MutationManager.prototype.init = function(options) {
      this.options = options;
      return this.reset();
    };

    MutationManager.prototype.reset = function() {
      var marker, _i, _len, _ref1;
      _ref1 = this.markerLayer.getMarkers();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        marker = _ref1[_i];
        marker.destroy();
      }
      return this.mutationsBySelection.clear();
    };

    MutationManager.prototype.saveInitialPointForSelection = function(selection) {
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

    MutationManager.prototype.getInitialPointForSelection = function(selection) {
      var _ref1;
      return (_ref1 = this.mutationsBySelection.get(selection)) != null ? _ref1.initialPoint : void 0;
    };

    MutationManager.prototype.setCheckPoint = function(checkPoint) {
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

    MutationManager.prototype.getMutationForSelection = function(selection) {
      return this.mutationsBySelection.get(selection);
    };

    MutationManager.prototype.getMarkerBufferRanges = function() {
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

    MutationManager.prototype.restoreInitialPositions = function() {
      var point, selection, _i, _len, _ref1, _results;
      _ref1 = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        selection = _ref1[_i];
        if (point = this.getInitialPointForSelection(selection)) {
          _results.push(selection.cursor.setBufferPosition(point));
        }
      }
      return _results;
    };

    MutationManager.prototype.restoreCursorPositions = function(options) {
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

    return MutationManager;

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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9tdXRhdGlvbi1tYW5hZ2VyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwyRUFBQTs7QUFBQSxFQUFBLE9BQXdDLE9BQUEsQ0FBUSxNQUFSLENBQXhDLEVBQUMsYUFBQSxLQUFELEVBQVEsZUFBQSxPQUFSLEVBQWlCLDJCQUFBLG1CQUFqQixDQUFBOztBQUFBLEVBQ0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUixDQURSLENBQUE7O0FBQUEsRUFjQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSx5QkFBRSxRQUFGLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxXQUFBLFFBQ2IsQ0FBQTtBQUFBLE1BQUMsSUFBQyxDQUFBLFNBQVUsSUFBQyxDQUFBLFNBQVgsTUFBRixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsV0FBRCxHQUFlLEdBQUEsQ0FBQSxtQkFGZixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FBdkIsQ0FBakIsQ0FIQSxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBQSxPQUpYLENBQUE7QUFBQSxNQU1BLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQUEsQ0FOZixDQUFBO0FBQUEsTUFPQSxJQUFDLENBQUEsb0JBQUQsR0FBd0IsR0FBQSxDQUFBLEdBUHhCLENBRFc7SUFBQSxDQUFiOztBQUFBLDhCQVVBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLEtBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxLQUFELENBQUEsQ0FBQSxDQUFBO2FBQ0EsUUFBOEMsRUFBOUMsRUFBQyxJQUFDLENBQUEsNkJBQUEsb0JBQUYsRUFBd0IsSUFBQyxDQUFBLGVBQUEsTUFBekIsRUFBaUMsSUFBQyxDQUFBLGlCQUFBLFFBQWxDLEVBQUEsTUFGTztJQUFBLENBVlQsQ0FBQTs7QUFBQSw4QkFjQSxJQUFBLEdBQU0sU0FBRSxPQUFGLEdBQUE7QUFDSixNQURLLElBQUMsQ0FBQSxVQUFBLE9BQ04sQ0FBQTthQUFBLElBQUMsQ0FBQSxLQUFELENBQUEsRUFESTtJQUFBLENBZE4sQ0FBQTs7QUFBQSw4QkFpQkEsS0FBQSxHQUFPLFNBQUEsR0FBQTtBQUNMLFVBQUEsdUJBQUE7QUFBQTtBQUFBLFdBQUEsNENBQUE7MkJBQUE7QUFBQSxRQUFBLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBQSxDQUFBO0FBQUEsT0FBQTthQUNBLElBQUMsQ0FBQSxvQkFBb0IsQ0FBQyxLQUF0QixDQUFBLEVBRks7SUFBQSxDQWpCUCxDQUFBOztBQUFBLDhCQXFCQSw0QkFBQSxHQUE4QixTQUFDLFNBQUQsR0FBQTtBQUM1QixVQUFBLEtBQUE7QUFBQSxNQUFBLElBQUcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLFFBQWpCLENBQUg7QUFDRSxRQUFBLEtBQUEsR0FBUSxLQUFBLENBQU0sU0FBTixDQUFnQixDQUFDLG9CQUFqQixDQUFzQyxNQUF0QyxFQUE4QztBQUFBLFVBQUEsWUFBQSxFQUFjLElBQWQ7QUFBQSxVQUFvQixhQUFBLEVBQWUsSUFBbkM7U0FBOUMsQ0FBUixDQURGO09BQUEsTUFBQTtBQUdFLFFBQUEsSUFBQSxDQUFBLElBQThELENBQUEsT0FBTyxDQUFDLFFBQXRFO0FBQUEsVUFBQSxLQUFBLEdBQVEsS0FBQSxDQUFNLFNBQU4sQ0FBZ0IsQ0FBQyxvQkFBakIsQ0FBc0MsTUFBdEMsQ0FBUixDQUFBO1NBSEY7T0FBQTtBQUlBLE1BQUEsSUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVo7QUFDRSxRQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsV0FBVyxDQUFDLGtCQUFiLENBQWdDLEtBQWhDLEVBQXVDO0FBQUEsVUFBQSxVQUFBLEVBQVksT0FBWjtTQUF2QyxDQUFSLENBREY7T0FKQTthQU1BLE1BUDRCO0lBQUEsQ0FyQjlCLENBQUE7O0FBQUEsOEJBOEJBLDJCQUFBLEdBQTZCLFNBQUMsU0FBRCxHQUFBO0FBQzNCLFVBQUEsS0FBQTsrRUFBb0MsQ0FBRSxzQkFEWDtJQUFBLENBOUI3QixDQUFBOztBQUFBLDhCQWlDQSxhQUFBLEdBQWUsU0FBQyxVQUFELEdBQUE7QUFDYixVQUFBLGdGQUFBO0FBQUE7QUFBQTtXQUFBLDRDQUFBOzhCQUFBO0FBQ0UsUUFBQSxJQUFBLENBQUEsSUFBUSxDQUFBLG9CQUFvQixDQUFDLEdBQXRCLENBQTBCLFNBQTFCLENBQVA7QUFDRSxVQUFBLFNBQUEsR0FBWSxVQUFaLENBQUE7QUFBQSxVQUNBLFlBQUEsR0FBZSxJQUFDLENBQUEsNEJBQUQsQ0FBOEIsU0FBOUIsQ0FEZixDQUFBO0FBQUEsVUFFQSxPQUFBLEdBQVU7QUFBQSxZQUFDLFdBQUEsU0FBRDtBQUFBLFlBQVksY0FBQSxZQUFaO0FBQUEsWUFBMEIsV0FBQSxTQUExQjtBQUFBLFlBQXNDLGFBQUQsSUFBQyxDQUFBLFdBQXRDO1dBRlYsQ0FBQTtBQUFBLFVBR0EsSUFBQyxDQUFBLG9CQUFvQixDQUFDLEdBQXRCLENBQTBCLFNBQTFCLEVBQXlDLElBQUEsUUFBQSxDQUFTLE9BQVQsQ0FBekMsQ0FIQSxDQURGO1NBQUE7QUFBQSxRQUtBLFFBQUEsR0FBVyxJQUFDLENBQUEsb0JBQW9CLENBQUMsR0FBdEIsQ0FBMEIsU0FBMUIsQ0FMWCxDQUFBO0FBQUEsc0JBTUEsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsVUFBaEIsRUFOQSxDQURGO0FBQUE7c0JBRGE7SUFBQSxDQWpDZixDQUFBOztBQUFBLDhCQTJDQSx1QkFBQSxHQUF5QixTQUFDLFNBQUQsR0FBQTthQUN2QixJQUFDLENBQUEsb0JBQW9CLENBQUMsR0FBdEIsQ0FBMEIsU0FBMUIsRUFEdUI7SUFBQSxDQTNDekIsQ0FBQTs7QUFBQSw4QkE4Q0EscUJBQUEsR0FBdUIsU0FBQSxHQUFBO0FBQ3JCLFVBQUEsTUFBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLEVBQVQsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLG9CQUFvQixDQUFDLE9BQXRCLENBQThCLFNBQUMsUUFBRCxFQUFXLFNBQVgsR0FBQTtBQUM1QixZQUFBLFlBQUE7QUFBQSxRQUFBLElBQUcsS0FBQSw0Q0FBdUIsQ0FBRSxjQUFqQixDQUFBLFVBQVg7aUJBQ0UsTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFaLEVBREY7U0FENEI7TUFBQSxDQUE5QixDQURBLENBQUE7YUFJQSxPQUxxQjtJQUFBLENBOUN2QixDQUFBOztBQUFBLDhCQXFEQSx1QkFBQSxHQUF5QixTQUFBLEdBQUE7QUFDdkIsVUFBQSwyQ0FBQTtBQUFBO0FBQUE7V0FBQSw0Q0FBQTs4QkFBQTtZQUE4QyxLQUFBLEdBQVEsSUFBQyxDQUFBLDJCQUFELENBQTZCLFNBQTdCO0FBQ3BELHdCQUFBLFNBQVMsQ0FBQyxNQUFNLENBQUMsaUJBQWpCLENBQW1DLEtBQW5DLEVBQUE7U0FERjtBQUFBO3NCQUR1QjtJQUFBLENBckR6QixDQUFBOztBQUFBLDhCQXlEQSxzQkFBQSxHQUF3QixTQUFDLE9BQUQsR0FBQTtBQUN0QixVQUFBLCtKQUFBO0FBQUEsTUFBQyxlQUFBLElBQUQsRUFBTyxpQkFBQSxNQUFQLEVBQWUsNEJBQUEsaUJBQWYsRUFBa0Msc0JBQUEsV0FBbEMsRUFBK0Msc0JBQUEsV0FBL0MsQ0FBQTtBQUNBLE1BQUEsSUFBRyxXQUFIO0FBSUUsUUFBQSxNQUFBLEdBQVMsRUFBVCxDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsb0JBQW9CLENBQUMsT0FBdEIsQ0FBOEIsU0FBQyxRQUFELEVBQVcsU0FBWCxHQUFBO0FBQzVCLGNBQUEsS0FBQTtpQkFBQSxNQUFNLENBQUMsSUFBUCw2REFBOEMsQ0FBRSxjQUFoRCxFQUQ0QjtRQUFBLENBQTlCLENBREEsQ0FBQTtBQUFBLFFBR0EsTUFBQSxHQUFTLE1BQU0sQ0FBQyxJQUFQLENBQVksU0FBQyxDQUFELEVBQUksQ0FBSixHQUFBO2lCQUFVLENBQUMsQ0FBQyxPQUFGLENBQVUsQ0FBVixFQUFWO1FBQUEsQ0FBWixDQUhULENBQUE7QUFBQSxRQUlBLE1BQUEsR0FBUyxNQUFNLENBQUMsTUFBUCxDQUFjLFNBQUMsS0FBRCxHQUFBO2lCQUFXLGNBQVg7UUFBQSxDQUFkLENBSlQsQ0FBQTtBQUtBLFFBQUEsSUFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBaUIsUUFBakIsRUFBMkIsV0FBM0IsQ0FBSDtBQUNFLFVBQUEsSUFBRyxLQUFBLEdBQVEsTUFBTyxDQUFBLENBQUEsQ0FBbEI7c0ZBQ3VDLENBQUUscUJBQXZDLENBQTZELEtBQTdELFdBREY7V0FERjtTQUFBLE1BQUE7QUFJRSxVQUFBLElBQUcsS0FBQSxHQUFRLE1BQU8sQ0FBQSxDQUFBLENBQWxCO21CQUNFLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBZ0MsS0FBaEMsRUFERjtXQUFBLE1BQUE7QUFHRTtBQUFBO2lCQUFBLDRDQUFBO29DQUFBO0FBQ0UsY0FBQSxJQUFBLENBQUEsU0FBb0MsQ0FBQyxlQUFWLENBQUEsQ0FBM0I7OEJBQUEsU0FBUyxDQUFDLE9BQVYsQ0FBQSxHQUFBO2VBQUEsTUFBQTtzQ0FBQTtlQURGO0FBQUE7NEJBSEY7V0FKRjtTQVRGO09BQUEsTUFBQTtBQW1CRTtBQUFBO2FBQUEsc0RBQUE7K0JBQUE7Z0JBQWlELFFBQUEsR0FBVyxJQUFDLENBQUEsb0JBQW9CLENBQUMsR0FBdEIsQ0FBMEIsU0FBMUI7O1dBQzFEO0FBQUEsVUFBQSxJQUFHLE1BQUEsSUFBVyxRQUFRLENBQUMsU0FBVCxLQUF3QixhQUF0QztBQUNFLFlBQUEsU0FBUyxDQUFDLE9BQVYsQ0FBQSxDQUFBLENBQUE7QUFDQSxxQkFGRjtXQUFBO0FBSUEsVUFBQSxJQUFHLEtBQUEsR0FBUSxRQUFRLENBQUMsZUFBVCxDQUF5QjtBQUFBLFlBQUMsTUFBQSxJQUFEO0FBQUEsWUFBTyxtQkFBQSxpQkFBUDtBQUFBLFlBQTBCLGFBQUEsV0FBMUI7V0FBekIsQ0FBWDsyQkFDRSxTQUFTLENBQUMsTUFBTSxDQUFDLGlCQUFqQixDQUFtQyxLQUFuQyxHQURGO1dBQUEsTUFBQTttQ0FBQTtXQUxGO0FBQUE7eUJBbkJGO09BRnNCO0lBQUEsQ0F6RHhCLENBQUE7OzJCQUFBOztNQWhCRixDQUFBOztBQUFBLEVBMkdNO0FBQ1MsSUFBQSxrQkFBQyxPQUFELEdBQUE7QUFDWCxNQUFDLElBQUMsQ0FBQSxvQkFBQSxTQUFGLEVBQWEsSUFBQyxDQUFBLHVCQUFBLFlBQWQsRUFBNEIsSUFBQyxDQUFBLG9CQUFBLFNBQTdCLEVBQXdDLElBQUMsQ0FBQSxzQkFBQSxXQUF6QyxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsVUFBRCxHQUFjLEVBRGQsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUZWLENBRFc7SUFBQSxDQUFiOztBQUFBLHVCQUtBLE1BQUEsR0FBUSxTQUFDLFVBQUQsR0FBQTtBQUdOLFVBQUEsS0FBQTtBQUFBLE1BQUEsSUFBQSxDQUFBLElBQVEsQ0FBQSxTQUFTLENBQUMsY0FBWCxDQUFBLENBQTJCLENBQUMsT0FBNUIsQ0FBQSxDQUFQOztlQUNTLENBQUUsT0FBVCxDQUFBO1NBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFEVixDQURGO09BQUE7O1FBSUEsSUFBQyxDQUFBLFNBQVUsSUFBQyxDQUFBLFdBQVcsQ0FBQyxlQUFiLENBQTZCLElBQUMsQ0FBQSxTQUFTLENBQUMsY0FBWCxDQUFBLENBQTdCLEVBQTBEO0FBQUEsVUFBQSxVQUFBLEVBQVksT0FBWjtTQUExRDtPQUpYO2FBS0EsSUFBQyxDQUFBLFVBQVcsQ0FBQSxVQUFBLENBQVosR0FBMEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQUEsRUFScEI7SUFBQSxDQUxSLENBQUE7O0FBQUEsdUJBZUEsY0FBQSxHQUFnQixTQUFBLEdBQUE7QUFDZCxVQUFBLEtBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBQSxDQUFSLENBQUE7QUFDQSxNQUFBLElBQUcsS0FBSyxDQUFDLE9BQU4sQ0FBQSxDQUFIO2VBQ0UsS0FBSyxDQUFDLElBRFI7T0FBQSxNQUFBO2VBR0UsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFWLENBQW9CLENBQUMsQ0FBRCxFQUFJLENBQUEsQ0FBSixDQUFwQixFQUhGO09BRmM7SUFBQSxDQWZoQixDQUFBOztBQUFBLHVCQXNCQSxlQUFBLEdBQWlCLFNBQUMsT0FBRCxHQUFBO0FBQ2YsVUFBQSxrREFBQTs7UUFEZ0IsVUFBUTtPQUN4QjtBQUFBLE1BQUMsZUFBQSxJQUFELEVBQU8sNEJBQUEsaUJBQVAsRUFBMEIsc0JBQUEsV0FBMUIsQ0FBQTtBQUNBLE1BQUEsSUFBRyxJQUFIO0FBQ0UsUUFBQSxJQUFHLElBQUMsQ0FBQSxZQUFELFlBQXlCLEtBQTVCO0FBQ0UsVUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLFlBQVQsQ0FERjtTQUFBLE1BQUE7QUFHRSxVQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsWUFBWSxDQUFDLHFCQUFkLENBQUEsQ0FBUixDQUhGO1NBQUE7QUFLQSxRQUFBLElBQUcsaUJBQUg7aUJBQ0UsS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFDLENBQUEsY0FBRCxDQUFBLENBQVYsRUFBNkIsS0FBN0IsRUFERjtTQUFBLE1BQUE7aUJBR0UsTUFIRjtTQU5GO09BQUEsTUFBQTtBQVdFLFFBQUEsSUFBRyxXQUFIO2lCQUNFLElBQUMsQ0FBQSxjQUFELENBQUEsRUFERjtTQUFBLE1BQUE7d0VBRzJCLENBQUUsZUFIN0I7U0FYRjtPQUZlO0lBQUEsQ0F0QmpCLENBQUE7O29CQUFBOztNQTVHRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/mutation-manager.coffee
