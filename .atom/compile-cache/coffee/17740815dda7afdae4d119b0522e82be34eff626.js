(function() {
  var CompositeDisposable, Emitter, SearchModel, getIndex, getVisibleBufferRange, highlightRange, scanInRanges, settings, smartScrollToBufferPosition, _ref, _ref1;

  _ref = require('atom'), Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  _ref1 = require('./utils'), highlightRange = _ref1.highlightRange, scanInRanges = _ref1.scanInRanges, getVisibleBufferRange = _ref1.getVisibleBufferRange, smartScrollToBufferPosition = _ref1.smartScrollToBufferPosition, getIndex = _ref1.getIndex;

  settings = require('./settings');

  module.exports = SearchModel = (function() {
    var flashMarker;

    SearchModel.prototype.relativeIndex = 0;

    SearchModel.prototype.onDidChangeCurrentMatch = function(fn) {
      return this.emitter.on('did-change-current-match', fn);
    };

    function SearchModel(vimState, options) {
      var _ref2;
      this.vimState = vimState;
      this.options = options;
      this.emitter = new Emitter;
      _ref2 = this.vimState, this.editor = _ref2.editor, this.editorElement = _ref2.editorElement;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.editorElement.onDidChangeScrollTop(this.updateView.bind(this)));
      this.disposables.add(this.editorElement.onDidChangeScrollLeft(this.updateView.bind(this)));
      this.markerLayer = this.editor.addMarkerLayer();
      this.onDidChangeCurrentMatch((function(_this) {
        return function() {
          var hoverOptions;
          if (_this.options.incrementalSearch) {
            _this.updateView();
          }
          _this.vimState.hoverSearchCounter.reset();
          if (_this.currentMatch == null) {
            if (settings.get('flashScreenOnSearchHasNoMatch')) {
              _this.flashScreen();
            }
            return;
          }
          if (settings.get('showHoverSearchCounter')) {
            hoverOptions = {
              text: "" + (_this.currentMatchIndex + 1) + "/" + _this.matches.length,
              classList: _this.classNamesForRange(_this.currentMatch)
            };
            if (!_this.options.incrementalSearch) {
              hoverOptions.timeout = settings.get('showHoverSearchCounterDuration');
            }
            _this.vimState.hoverSearchCounter.withTimeout(_this.currentMatch.start, hoverOptions);
          }
          _this.editor.unfoldBufferRow(_this.currentMatch.start.row);
          smartScrollToBufferPosition(_this.editor, _this.currentMatch.start);
          if (settings.get('flashOnSearch')) {
            return _this.flashRange(_this.currentMatch);
          }
        };
      })(this));
    }

    flashMarker = null;

    SearchModel.prototype.flashRange = function(range) {
      if (flashMarker != null) {
        flashMarker.destroy();
      }
      return flashMarker = highlightRange(this.editor, range, {
        "class": 'vim-mode-plus-flash',
        timeout: settings.get('flashOnSearchDuration')
      });
    };

    SearchModel.prototype.destroy = function() {
      this.markerLayer.destroy();
      return this.disposables.dispose();
    };

    SearchModel.prototype.clearMarkers = function() {
      var marker, _i, _len, _ref2, _results;
      _ref2 = this.markerLayer.getMarkers();
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        marker = _ref2[_i];
        _results.push(marker.destroy());
      }
      return _results;
    };

    SearchModel.prototype.classNamesForRange = function(range) {
      var classNames;
      classNames = [];
      if (range === this.firstMatch) {
        classNames.push('first');
      } else if (range === this.lastMatch) {
        classNames.push('last');
      }
      if (range === this.currentMatch) {
        classNames.push('current');
      }
      return classNames;
    };

    SearchModel.prototype.updateView = function() {
      var range, _i, _len, _ref2, _results;
      this.clearMarkers();
      _ref2 = this.getVisibleMatchRanges();
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        range = _ref2[_i];
        _results.push(this.decorateRange(range));
      }
      return _results;
    };

    SearchModel.prototype.getVisibleMatchRanges = function() {
      var visibleMatchRanges, visibleRange;
      visibleRange = getVisibleBufferRange(this.editor);
      return visibleMatchRanges = this.matches.filter(function(range) {
        return range.intersectsWith(visibleRange);
      });
    };

    SearchModel.prototype.decorateRange = function(range) {
      var classNames, _ref2;
      classNames = this.classNamesForRange(range);
      classNames = (_ref2 = ['vim-mode-plus-search-match']).concat.apply(_ref2, classNames);
      return this.editor.decorateMarker(this.markerLayer.markBufferRange(range), {
        type: 'highlight',
        "class": classNames.join(' ')
      });
    };

    SearchModel.prototype.search = function(fromPoint, pattern, relativeIndex) {
      var currentMatch, range, _i, _j, _len, _ref2, _ref3, _ref4;
      this.pattern = pattern;
      this.matches = [];
      this.editor.scan(this.pattern, (function(_this) {
        return function(_arg) {
          var range;
          range = _arg.range;
          return _this.matches.push(range);
        };
      })(this));
      _ref2 = this.matches, this.firstMatch = _ref2[0], this.lastMatch = _ref2[_ref2.length - 1];
      currentMatch = null;
      if (relativeIndex >= 0) {
        _ref3 = this.matches;
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          range = _ref3[_i];
          if (!(range.start.isGreaterThan(fromPoint))) {
            continue;
          }
          currentMatch = range;
          break;
        }
        if (currentMatch == null) {
          currentMatch = this.firstMatch;
        }
        relativeIndex--;
      } else {
        _ref4 = this.matches;
        for (_j = _ref4.length - 1; _j >= 0; _j += -1) {
          range = _ref4[_j];
          if (!(range.start.isLessThan(fromPoint))) {
            continue;
          }
          currentMatch = range;
          break;
        }
        if (currentMatch == null) {
          currentMatch = this.lastMatch;
        }
        relativeIndex++;
      }
      this.currentMatchIndex = this.matches.indexOf(currentMatch);
      this.updateCurrentMatch(relativeIndex);
      this.initialCurrentMatchIndex = this.currentMatchIndex;
      return this.currentMatch;
    };

    SearchModel.prototype.updateCurrentMatch = function(relativeIndex) {
      this.currentMatchIndex = getIndex(this.currentMatchIndex + relativeIndex, this.matches);
      this.currentMatch = this.matches[this.currentMatchIndex];
      return this.emitter.emit('did-change-current-match');
    };

    SearchModel.prototype.getRelativeIndex = function() {
      return this.currentMatchIndex - this.initialCurrentMatchIndex;
    };

    SearchModel.prototype.flashScreen = function() {
      var options;
      options = {
        "class": 'vim-mode-plus-flash',
        timeout: 100
      };
      highlightRange(this.editor, getVisibleBufferRange(this.editor), options);
      return atom.beep();
    };

    return SearchModel;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9zZWFyY2gtbW9kZWwuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRKQUFBOztBQUFBLEVBQUEsT0FBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQyxlQUFBLE9BQUQsRUFBVSwyQkFBQSxtQkFBVixDQUFBOztBQUFBLEVBQ0EsUUFNSSxPQUFBLENBQVEsU0FBUixDQU5KLEVBQ0UsdUJBQUEsY0FERixFQUVFLHFCQUFBLFlBRkYsRUFHRSw4QkFBQSxxQkFIRixFQUlFLG9DQUFBLDJCQUpGLEVBS0UsaUJBQUEsUUFORixDQUFBOztBQUFBLEVBUUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBUlgsQ0FBQTs7QUFBQSxFQVVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixRQUFBLFdBQUE7O0FBQUEsMEJBQUEsYUFBQSxHQUFlLENBQWYsQ0FBQTs7QUFBQSwwQkFDQSx1QkFBQSxHQUF5QixTQUFDLEVBQUQsR0FBQTthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLDBCQUFaLEVBQXdDLEVBQXhDLEVBQVI7SUFBQSxDQUR6QixDQUFBOztBQUdhLElBQUEscUJBQUUsUUFBRixFQUFhLE9BQWIsR0FBQTtBQUNYLFVBQUEsS0FBQTtBQUFBLE1BRFksSUFBQyxDQUFBLFdBQUEsUUFDYixDQUFBO0FBQUEsTUFEdUIsSUFBQyxDQUFBLFVBQUEsT0FDeEIsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUFBLENBQUEsT0FBWCxDQUFBO0FBQUEsTUFFQSxRQUE0QixJQUFDLENBQUEsUUFBN0IsRUFBQyxJQUFDLENBQUEsZUFBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLHNCQUFBLGFBRlgsQ0FBQTtBQUFBLE1BR0Es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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/search-model.coffee
