(function() {
  var Match, MatchList, getIndex, getVisibleBufferRange, highlightRanges, scanInRanges, smartScrollToBufferPosition, _ref,
    __slice = [].slice;

  _ref = require('./utils'), getIndex = _ref.getIndex, highlightRanges = _ref.highlightRanges, smartScrollToBufferPosition = _ref.smartScrollToBufferPosition, getVisibleBufferRange = _ref.getVisibleBufferRange, scanInRanges = _ref.scanInRanges;

  MatchList = (function() {
    MatchList.prototype.index = null;

    MatchList.prototype.entries = null;

    MatchList.prototype.pattern = null;

    MatchList.fromScan = function(editor, _arg) {
      var countOffset, current, direction, fromPoint, index, pattern, range, ranges, scanRanges, _i, _j, _len;
      fromPoint = _arg.fromPoint, pattern = _arg.pattern, direction = _arg.direction, countOffset = _arg.countOffset, scanRanges = _arg.scanRanges;
      index = 0;
      if (scanRanges.length) {
        ranges = scanInRanges(editor, pattern, scanRanges);
      } else {
        ranges = [];
        editor.scan(pattern, function(_arg1) {
          var range;
          range = _arg1.range;
          return ranges.push(range);
        });
      }
      if (direction === 'backward') {
        for (_i = ranges.length - 1; _i >= 0; _i += -1) {
          range = ranges[_i];
          if (!(range.start.isLessThan(fromPoint))) {
            continue;
          }
          current = range;
          break;
        }
        if (current == null) {
          current = ranges.slice(-1)[0];
        }
      } else if (direction === 'forward') {
        for (_j = 0, _len = ranges.length; _j < _len; _j++) {
          range = ranges[_j];
          if (!(range.start.isGreaterThan(fromPoint))) {
            continue;
          }
          current = range;
          break;
        }
        if (current == null) {
          current = ranges[0];
        }
      }
      index = ranges.indexOf(current);
      index = getIndex(index + countOffset, ranges);
      return new this(editor, ranges, index, pattern);
    };

    function MatchList(editor, ranges, index, pattern) {
      var first, last, others, _i, _ref1;
      this.editor = editor;
      this.index = index;
      this.pattern = pattern;
      this.entries = [];
      if (!ranges.length) {
        return;
      }
      this.entries = ranges.map((function(_this) {
        return function(range) {
          return new Match(_this.editor, range);
        };
      })(this));
      _ref1 = this.entries, first = _ref1[0], others = 3 <= _ref1.length ? __slice.call(_ref1, 1, _i = _ref1.length - 1) : (_i = 1, []), last = _ref1[_i++];
      first.first = true;
      if (last != null) {
        last.last = true;
      }
    }

    MatchList.prototype.getPattern = function() {
      return this.pattern;
    };

    MatchList.prototype.isEmpty = function() {
      return this.entries.length === 0;
    };

    MatchList.prototype.setIndex = function(index) {
      return this.index = getIndex(index, this.entries);
    };

    MatchList.prototype.get = function(direction) {
      var match;
      if (direction == null) {
        direction = null;
      }
      this.entries[this.index].current = false;
      switch (direction) {
        case 'next':
          this.setIndex(this.index + 1);
          break;
        case 'prev':
          this.setIndex(this.index - 1);
      }
      match = this.entries[this.index];
      match.current = true;
      return match;
    };

    MatchList.prototype.getCurrentStartPosition = function() {
      return this.get().getStartPoint();
    };

    MatchList.prototype.getCurrentEndPosition = function() {
      return this.get().getEndPoint();
    };

    MatchList.prototype.getVisible = function() {
      var range;
      range = getVisibleBufferRange(this.editor);
      return this.entries.filter(function(match) {
        return range.intersectsWith(match.range);
      });
    };

    MatchList.prototype.refresh = function() {
      var match, _i, _len, _ref1, _results;
      this.reset();
      _ref1 = this.getVisible();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        match = _ref1[_i];
        _results.push(match.show());
      }
      return _results;
    };

    MatchList.prototype.reset = function() {
      var match, _i, _len, _ref1, _results;
      _ref1 = this.entries;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        match = _ref1[_i];
        _results.push(match.reset());
      }
      return _results;
    };

    MatchList.prototype.destroy = function() {
      var match, _i, _len, _ref1, _ref2;
      _ref1 = this.entries;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        match = _ref1[_i];
        match.destroy();
      }
      return _ref2 = {}, this.entries = _ref2.entries, this.index = _ref2.index, this.editor = _ref2.editor, _ref2;
    };

    MatchList.prototype.getCounterText = function() {
      return "" + (this.index + 1) + "/" + this.entries.length;
    };

    return MatchList;

  })();

  Match = (function() {
    var markersForFlash;

    Match.prototype.first = false;

    Match.prototype.last = false;

    Match.prototype.current = false;

    function Match(editor, range) {
      this.editor = editor;
      this.range = range;
    }

    Match.prototype.getClassList = function() {
      var classes;
      classes = [];
      if (this.first) {
        classes.push('first');
      }
      if (!this.first && this.last) {
        classes.push('last');
      }
      if (this.current) {
        classes.push('current');
      }
      return classes;
    };

    Match.prototype.compare = function(other) {
      return this.range.compare(other.range);
    };

    Match.prototype.isEqual = function(other) {
      return this.range.isEqual(other.range);
    };

    Match.prototype.getStartPoint = function() {
      return this.range.start;
    };

    Match.prototype.getEndPoint = function() {
      return this.range.end;
    };

    Match.prototype.scrollToStartPoint = function() {
      var point;
      point = this.getStartPoint();
      this.editor.unfoldBufferRow(point.row);
      return smartScrollToBufferPosition(this.editor, point);
    };

    markersForFlash = null;

    Match.prototype.flash = function(options) {
      var _ref1;
      if (markersForFlash != null) {
        if ((_ref1 = markersForFlash[0]) != null) {
          _ref1.destroy();
        }
      }
      return markersForFlash = highlightRanges(this.editor, this.range, {
        "class": options["class"],
        timeout: options.timeout
      });
    };

    Match.prototype.show = function() {
      var classes, _ref1;
      classes = (_ref1 = ['vim-mode-plus-search-match']).concat.apply(_ref1, this.getClassList());
      this.marker = this.editor.markBufferRange(this.range);
      return this.editor.decorateMarker(this.marker, {
        type: 'highlight',
        "class": classes.join(" ")
      });
    };

    Match.prototype.reset = function() {
      var _ref1;
      return (_ref1 = this.marker) != null ? _ref1.destroy() : void 0;
    };

    Match.prototype.destroy = function() {
      var _ref1;
      this.reset();
      return _ref1 = {}, this.marker = _ref1.marker, this.range = _ref1.range, this.editor = _ref1.editor, this.first = _ref1.first, this.last = _ref1.last, this.current = _ref1.current, _ref1;
    };

    return Match;

  })();

  module.exports = {
    MatchList: MatchList
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9tYXRjaC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsbUhBQUE7SUFBQSxrQkFBQTs7QUFBQSxFQUFBLE9BTUksT0FBQSxDQUFRLFNBQVIsQ0FOSixFQUNFLGdCQUFBLFFBREYsRUFFRSx1QkFBQSxlQUZGLEVBR0UsbUNBQUEsMkJBSEYsRUFJRSw2QkFBQSxxQkFKRixFQUtFLG9CQUFBLFlBTEYsQ0FBQTs7QUFBQSxFQVFNO0FBQ0osd0JBQUEsS0FBQSxHQUFPLElBQVAsQ0FBQTs7QUFBQSx3QkFDQSxPQUFBLEdBQVMsSUFEVCxDQUFBOztBQUFBLHdCQUVBLE9BQUEsR0FBUyxJQUZULENBQUE7O0FBQUEsSUFJQSxTQUFDLENBQUEsUUFBRCxHQUFXLFNBQUMsTUFBRCxFQUFTLElBQVQsR0FBQTtBQUNULFVBQUEsbUdBQUE7QUFBQSxNQURtQixpQkFBQSxXQUFXLGVBQUEsU0FBUyxpQkFBQSxXQUFXLG1CQUFBLGFBQWEsa0JBQUEsVUFDL0QsQ0FBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLENBQVIsQ0FBQTtBQUNBLE1BQUEsSUFBRyxVQUFVLENBQUMsTUFBZDtBQUNFLFFBQUEsTUFBQSxHQUFTLFlBQUEsQ0FBYSxNQUFiLEVBQXFCLE9BQXJCLEVBQThCLFVBQTlCLENBQVQsQ0FERjtPQUFBLE1BQUE7QUFHRSxRQUFBLE1BQUEsR0FBUyxFQUFULENBQUE7QUFBQSxRQUNBLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBWixFQUFxQixTQUFDLEtBQUQsR0FBQTtBQUNuQixjQUFBLEtBQUE7QUFBQSxVQURxQixRQUFELE1BQUMsS0FDckIsQ0FBQTtpQkFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLEtBQVosRUFEbUI7UUFBQSxDQUFyQixDQURBLENBSEY7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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/match.coffee
