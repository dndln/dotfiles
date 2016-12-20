(function() {
  var Motion, Search, SearchBackwards, SearchBase, SearchCurrentWord, SearchCurrentWordBackwards, SearchModel, getCaseSensitivity, getNonWordCharactersForCursor, saveEditorState, settings, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  _ref = require('./utils'), saveEditorState = _ref.saveEditorState, getNonWordCharactersForCursor = _ref.getNonWordCharactersForCursor;

  SearchModel = require('./search-model');

  settings = require('./settings');

  Motion = require('./base').getClass('Motion');

  getCaseSensitivity = function(searchName) {
    if (settings.get("useSmartcaseFor" + searchName)) {
      return 'smartcase';
    } else if (settings.get("ignoreCaseFor" + searchName)) {
      return 'insensitive';
    } else {
      return 'sensitive';
    }
  };

  SearchBase = (function(_super) {
    __extends(SearchBase, _super);

    function SearchBase() {
      return SearchBase.__super__.constructor.apply(this, arguments);
    }

    SearchBase.extend(false);

    SearchBase.prototype.jump = true;

    SearchBase.prototype.backwards = false;

    SearchBase.prototype.useRegexp = true;

    SearchBase.prototype.configScope = null;

    SearchBase.prototype.landingPoint = null;

    SearchBase.prototype.defaultLandingPoint = 'start';

    SearchBase.prototype.relativeIndex = null;

    SearchBase.prototype.isBackwards = function() {
      return this.backwards;
    };

    SearchBase.prototype.isIncrementalSearch = function() {
      return this["instanceof"]('Search') && !this.isRepeated() && settings.get('incrementalSearch');
    };

    SearchBase.prototype.initialize = function() {
      SearchBase.__super__.initialize.apply(this, arguments);
      return this.onDidFinishOperation((function(_this) {
        return function() {
          return _this.finish();
        };
      })(this));
    };

    SearchBase.prototype.getCount = function() {
      var count;
      count = SearchBase.__super__.getCount.apply(this, arguments);
      if (this.isBackwards()) {
        return -count;
      } else {
        return count;
      }
    };

    SearchBase.prototype.isCaseSensitive = function(term) {
      switch (getCaseSensitivity(this.configScope)) {
        case 'smartcase':
          return term.search('[A-Z]') !== -1;
        case 'insensitive':
          return false;
        case 'sensitive':
          return true;
      }
    };

    SearchBase.prototype.finish = function() {
      var _ref1;
      if (this.isIncrementalSearch() && settings.get('showHoverSearchCounter')) {
        this.vimState.hoverSearchCounter.reset();
      }
      this.relativeIndex = null;
      if ((_ref1 = this.searchModel) != null) {
        _ref1.destroy();
      }
      return this.searchModel = null;
    };

    SearchBase.prototype.getLandingPoint = function() {
      return this.landingPoint != null ? this.landingPoint : this.landingPoint = this.defaultLandingPoint;
    };

    SearchBase.prototype.getPoint = function(cursor) {
      var point, range;
      if (this.searchModel != null) {
        this.relativeIndex = this.getCount() + this.searchModel.getRelativeIndex();
      } else {
        if (this.relativeIndex == null) {
          this.relativeIndex = this.getCount();
        }
      }
      if (range = this.search(cursor, this.input, this.relativeIndex)) {
        point = range[this.getLandingPoint()];
      }
      this.searchModel.destroy();
      this.searchModel = null;
      return point;
    };

    SearchBase.prototype.moveCursor = function(cursor) {
      var input, point;
      input = this.getInput();
      if (!input) {
        return;
      }
      if (point = this.getPoint(cursor)) {
        cursor.setBufferPosition(point, {
          autoscroll: false
        });
      }
      if (!this.isRepeated()) {
        this.globalState.set('currentSearch', this);
        this.vimState.searchHistory.save(input);
      }
      return this.globalState.set('lastSearchPattern', this.getPattern(input));
    };

    SearchBase.prototype.getSearchModel = function() {
      return this.searchModel != null ? this.searchModel : this.searchModel = new SearchModel(this.vimState, {
        incrementalSearch: this.isIncrementalSearch()
      });
    };

    SearchBase.prototype.search = function(cursor, input, relativeIndex) {
      var fromPoint, searchModel;
      searchModel = this.getSearchModel();
      if (input) {
        fromPoint = this.getBufferPositionForCursor(cursor);
        return searchModel.search(fromPoint, this.getPattern(input), relativeIndex);
      } else {
        this.vimState.hoverSearchCounter.reset();
        return searchModel.clearMarkers();
      }
    };

    return SearchBase;

  })(Motion);

  Search = (function(_super) {
    __extends(Search, _super);

    function Search() {
      this.handleConfirmSearch = __bind(this.handleConfirmSearch, this);
      return Search.__super__.constructor.apply(this, arguments);
    }

    Search.extend();

    Search.prototype.configScope = "Search";

    Search.prototype.requireInput = true;

    Search.prototype.initialize = function() {
      Search.__super__.initialize.apply(this, arguments);
      if (this.isComplete()) {
        return;
      }
      if (this.isIncrementalSearch()) {
        this.restoreEditorState = saveEditorState(this.editor);
        this.onDidCommandSearch(this.handleCommandEvent.bind(this));
      }
      this.onDidConfirmSearch(this.handleConfirmSearch.bind(this));
      this.onDidCancelSearch(this.handleCancelSearch.bind(this));
      this.onDidChangeSearch(this.handleChangeSearch.bind(this));
      return this.vimState.searchInput.focus({
        backwards: this.backwards
      });
    };

    Search.prototype.handleCommandEvent = function(commandEvent) {
      var direction, operation;
      if (!this.input) {
        return;
      }
      switch (commandEvent.name) {
        case 'visit':
          direction = commandEvent.direction;
          if (this.isBackwards() && settings.get('incrementalSearchVisitDirection') === 'relative') {
            direction = (function() {
              switch (direction) {
                case 'next':
                  return 'prev';
                case 'prev':
                  return 'next';
              }
            })();
          }
          switch (direction) {
            case 'next':
              return this.getSearchModel().updateCurrentMatch(+1);
            case 'prev':
              return this.getSearchModel().updateCurrentMatch(-1);
          }
          break;
        case 'occurrence':
          operation = commandEvent.operation;
          if (operation != null) {
            this.vimState.occurrenceManager.resetPatterns();
          }
          this.vimState.occurrenceManager.addPattern(this.getPattern(this.input));
          this.vimState.searchHistory.save(this.input);
          this.vimState.searchInput.cancel();
          if (operation != null) {
            return this.vimState.operationStack.run(operation);
          }
      }
    };

    Search.prototype.handleCancelSearch = function() {
      if (!(this.isMode('visual') || this.isMode('insert'))) {
        this.vimState.resetNormalMode();
      }
      if (typeof this.restoreEditorState === "function") {
        this.restoreEditorState();
      }
      this.vimState.reset();
      return this.finish();
    };

    Search.prototype.isSearchRepeatCharacter = function(char) {
      var searchChar;
      if (this.isIncrementalSearch()) {
        return char === '';
      } else {
        searchChar = this.isBackwards() ? '?' : '/';
        return char === '' || char === searchChar;
      }
    };

    Search.prototype.handleConfirmSearch = function(_arg) {
      this.input = _arg.input, this.landingPoint = _arg.landingPoint;
      if (this.isSearchRepeatCharacter(this.input)) {
        this.input = this.vimState.searchHistory.get('prev');
        if (!this.input) {
          atom.beep();
        }
      }
      return this.processOperation();
    };

    Search.prototype.handleChangeSearch = function(input) {
      this.input = input;
      if (this.input.startsWith(' ')) {
        this.input = this.input.replace(/^ /, '');
        this.useRegexp = false;
      }
      this.vimState.searchInput.updateOptionSettings({
        useRegexp: this.useRegexp
      });
      if (this.isIncrementalSearch()) {
        return this.search(this.editor.getLastCursor(), this.input, this.getCount());
      }
    };

    Search.prototype.getPattern = function(term) {
      var modifiers;
      modifiers = this.isCaseSensitive(term) ? 'g' : 'gi';
      if (term.indexOf('\\c') >= 0) {
        term = term.replace('\\c', '');
        if (__indexOf.call(modifiers, 'i') < 0) {
          modifiers += 'i';
        }
      }
      if (this.useRegexp) {
        try {
          return new RegExp(term, modifiers);
        } catch (_error) {
          null;
        }
      }
      return new RegExp(_.escapeRegExp(term), modifiers);
    };

    return Search;

  })(SearchBase);

  SearchBackwards = (function(_super) {
    __extends(SearchBackwards, _super);

    function SearchBackwards() {
      return SearchBackwards.__super__.constructor.apply(this, arguments);
    }

    SearchBackwards.extend();

    SearchBackwards.prototype.backwards = true;

    return SearchBackwards;

  })(Search);

  SearchCurrentWord = (function(_super) {
    __extends(SearchCurrentWord, _super);

    function SearchCurrentWord() {
      return SearchCurrentWord.__super__.constructor.apply(this, arguments);
    }

    SearchCurrentWord.extend();

    SearchCurrentWord.prototype.configScope = "SearchCurrentWord";

    SearchCurrentWord.prototype.getInput = function() {
      var wordRange;
      return this.input != null ? this.input : this.input = (wordRange = this.getCurrentWordBufferRange(), wordRange != null ? (this.editor.setCursorBufferPosition(wordRange.start), this.editor.getTextInBufferRange(wordRange)) : '');
    };

    SearchCurrentWord.prototype.getPattern = function(term) {
      var modifiers, pattern;
      modifiers = this.isCaseSensitive(term) ? 'g' : 'gi';
      pattern = _.escapeRegExp(term);
      if (/\W/.test(term)) {
        return new RegExp("" + pattern + "\\b", modifiers);
      } else {
        return new RegExp("\\b" + pattern + "\\b", modifiers);
      }
    };

    SearchCurrentWord.prototype.getCurrentWordBufferRange = function() {
      var cursor, found, nonWordCharacters, point, scanRange, wordRegex;
      cursor = this.editor.getLastCursor();
      point = cursor.getBufferPosition();
      nonWordCharacters = getNonWordCharactersForCursor(cursor);
      wordRegex = new RegExp("[^\\s" + (_.escapeRegExp(nonWordCharacters)) + "]+", 'g');
      found = null;
      scanRange = this.editor.bufferRangeForBufferRow(point.row);
      this.editor.scanInBufferRange(wordRegex, scanRange, function(_arg) {
        var range, stop;
        range = _arg.range, stop = _arg.stop;
        if (range.end.isGreaterThan(point)) {
          found = range;
          return stop();
        }
      });
      return found;
    };

    return SearchCurrentWord;

  })(SearchBase);

  SearchCurrentWordBackwards = (function(_super) {
    __extends(SearchCurrentWordBackwards, _super);

    function SearchCurrentWordBackwards() {
      return SearchCurrentWordBackwards.__super__.constructor.apply(this, arguments);
    }

    SearchCurrentWordBackwards.extend();

    SearchCurrentWordBackwards.prototype.backwards = true;

    return SearchCurrentWordBackwards;

  })(SearchCurrentWord);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9tb3Rpb24tc2VhcmNoLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw4TEFBQTtJQUFBOzs7eUpBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUVBLE9BQW1ELE9BQUEsQ0FBUSxTQUFSLENBQW5ELEVBQUMsdUJBQUEsZUFBRCxFQUFrQixxQ0FBQSw2QkFGbEIsQ0FBQTs7QUFBQSxFQUdBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVIsQ0FIZCxDQUFBOztBQUFBLEVBSUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBSlgsQ0FBQTs7QUFBQSxFQUtBLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUixDQUFpQixDQUFDLFFBQWxCLENBQTJCLFFBQTNCLENBTFQsQ0FBQTs7QUFBQSxFQU9BLGtCQUFBLEdBQXFCLFNBQUMsVUFBRCxHQUFBO0FBRW5CLElBQUEsSUFBRyxRQUFRLENBQUMsR0FBVCxDQUFjLGlCQUFBLEdBQWlCLFVBQS9CLENBQUg7YUFDRSxZQURGO0tBQUEsTUFFSyxJQUFHLFFBQVEsQ0FBQyxHQUFULENBQWMsZUFBQSxHQUFlLFVBQTdCLENBQUg7YUFDSCxjQURHO0tBQUEsTUFBQTthQUdILFlBSEc7S0FKYztFQUFBLENBUHJCLENBQUE7O0FBQUEsRUFnQk07QUFDSixpQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxVQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUFBLHlCQUNBLElBQUEsR0FBTSxJQUROLENBQUE7O0FBQUEseUJBRUEsU0FBQSxHQUFXLEtBRlgsQ0FBQTs7QUFBQSx5QkFHQSxTQUFBLEdBQVcsSUFIWCxDQUFBOztBQUFBLHlC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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/motion-search.coffee
