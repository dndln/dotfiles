(function() {
  var $, $$, MAX_ITEMS, SelectListView, View, fuzzaldrin, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  _ref = require('atom-space-pen-views'), SelectListView = _ref.SelectListView, $ = _ref.$, $$ = _ref.$$;

  fuzzaldrin = require('fuzzaldrin');

  MAX_ITEMS = 5;

  module.exports = View = (function(_super) {
    __extends(View, _super);

    function View() {
      return View.__super__.constructor.apply(this, arguments);
    }

    View.prototype.initialInput = null;

    View.prototype.schedulePopulateList = function() {
      if (this.initialInput) {
        if (this.isOnDom()) {
          this.populateList();
        }
        return this.initialInput = false;
      } else {
        return View.__super__.schedulePopulateList.apply(this, arguments);
      }
    };

    View.prototype.initialize = function() {
      this.setMaxItems(MAX_ITEMS);
      this.commands = require('./commands');
      this.addClass('vim-mode-plus-ex-mode');
      return View.__super__.initialize.apply(this, arguments);
    };

    View.prototype.getFilterKey = function() {
      return 'displayName';
    };

    View.prototype.cancelled = function() {
      return this.hide();
    };

    View.prototype.toggle = function(vimState, commandKind) {
      var _ref1, _ref2;
      this.vimState = vimState;
      this.commandKind = commandKind;
      if ((_ref1 = this.panel) != null ? _ref1.isVisible() : void 0) {
        return this.cancel();
      } else {
        _ref2 = this.vimState, this.editorElement = _ref2.editorElement, this.editor = _ref2.editor;
        return this.show();
      }
    };

    View.prototype.show = function() {
      this.initialInput = true;
      this.count = null;
      this.storeFocusedElement();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.setItems(this.getItemsFor(this.commandKind));
      return this.focusFilterEditor();
    };

    View.prototype.getItemsFor = function(kind) {
      var commands, humanize;
      commands = _.keys(this.commands[kind]);
      humanize = function(name) {
        return _.humanizeEventName(_.dasherize(name));
      };
      switch (kind) {
        case 'normalCommands':
          return commands.map(function(name) {
            return {
              name: name,
              displayName: name
            };
          });
        case 'toggleCommands':
        case 'numberCommands':
          return commands.map(function(name) {
            return {
              name: name,
              displayName: humanize(name)
            };
          });
      }
    };

    View.prototype.executeCommand = function(kind, name) {
      var action;
      action = this.commands[kind][name];
      return action(this.vimState, this.count);
    };

    View.prototype.hide = function() {
      var _ref1;
      return (_ref1 = this.panel) != null ? _ref1.hide() : void 0;
    };

    View.prototype.getCommandKindFromQuery = function(query) {
      if (query.match(/^!/)) {
        return 'toggleCommands';
      } else if (query.match(/(\d+)(%)?$/)) {
        return 'numberCommands';
      } else {
        return null;
      }
    };

    View.prototype.getEmptyMessage = function(itemCount, filteredItemCount) {
      var filterQuery, items, number, percent, query, _ref1;
      query = this.getFilterQuery();
      if (!(this.commandKind = this.getCommandKindFromQuery(query))) {
        return;
      }
      items = this.getItemsFor(this.commandKind);
      switch (this.commandKind) {
        case 'toggleCommands':
          filterQuery = query.slice(1);
          items = fuzzaldrin.filter(items, filterQuery, {
            key: this.getFilterKey()
          });
          break;
        case 'numberCommands':
          _ref1 = query.match(/(\d+)(%)?$/).slice(1, 3), number = _ref1[0], percent = _ref1[1];
          this.count = Number(number);
          items = items.filter(function(_arg) {
            var name;
            name = _arg.name;
            if (percent != null) {
              return name === 'moveToLineByPercent';
            } else {
              return name === 'moveToLine';
            }
          });
      }
      this.setError(null);
      this.setFallbackItems(items);
      return this.selectItemView(this.list.find('li:first'));
    };

    View.prototype.setFallbackItems = function(items) {
      var item, itemView, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        itemView = $(this.viewForItem(item));
        itemView.data('select-list-item', item);
        _results.push(this.list.append(itemView));
      }
      return _results;
    };

    View.prototype.viewForItem = function(_arg) {
      var displayName, filterQuery, matches;
      displayName = _arg.displayName;
      filterQuery = this.getFilterQuery();
      if (filterQuery.startsWith('!')) {
        filterQuery = filterQuery.slice(1);
      }
      matches = fuzzaldrin.match(displayName, filterQuery);
      return $$(function() {
        var highlighter;
        highlighter = (function(_this) {
          return function(command, matches, offsetIndex) {
            var lastIndex, matchIndex, matchedChars, unmatched, _i, _len;
            lastIndex = 0;
            matchedChars = [];
            for (_i = 0, _len = matches.length; _i < _len; _i++) {
              matchIndex = matches[_i];
              matchIndex -= offsetIndex;
              if (matchIndex < 0) {
                continue;
              }
              unmatched = command.substring(lastIndex, matchIndex);
              if (unmatched) {
                if (matchedChars.length) {
                  _this.span(matchedChars.join(''), {
                    "class": 'character-match'
                  });
                }
                matchedChars = [];
                _this.text(unmatched);
              }
              matchedChars.push(command[matchIndex]);
              lastIndex = matchIndex + 1;
            }
            if (matchedChars.length) {
              _this.span(matchedChars.join(''), {
                "class": 'character-match'
              });
            }
            return _this.text(command.substring(lastIndex));
          };
        })(this);
        return this.li({
          "class": 'event',
          'data-event-name': name
        }, (function(_this) {
          return function() {
            return _this.span({
              title: displayName
            }, function() {
              return highlighter(displayName, matches, 0);
            });
          };
        })(this));
      });
    };

    View.prototype.confirmed = function(_arg) {
      var name;
      name = _arg.name;
      this.cancel();
      return this.executeCommand(this.commandKind, name);
    };

    return View;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzLWV4LW1vZGUvbGliL3ZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJEQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLE9BQTBCLE9BQUEsQ0FBUSxzQkFBUixDQUExQixFQUFDLHNCQUFBLGNBQUQsRUFBaUIsU0FBQSxDQUFqQixFQUFvQixVQUFBLEVBRHBCLENBQUE7O0FBQUEsRUFFQSxVQUFBLEdBQWEsT0FBQSxDQUFRLFlBQVIsQ0FGYixDQUFBOztBQUFBLEVBSUEsU0FBQSxHQUFZLENBSlosQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiwyQkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsbUJBQUEsWUFBQSxHQUFjLElBQWQsQ0FBQTs7QUFBQSxtQkFHQSxvQkFBQSxHQUFzQixTQUFBLEdBQUE7QUFDcEIsTUFBQSxJQUFHLElBQUMsQ0FBQSxZQUFKO0FBQ0UsUUFBQSxJQUFtQixJQUFDLENBQUEsT0FBRCxDQUFBLENBQW5CO0FBQUEsVUFBQSxJQUFDLENBQUEsWUFBRCxDQUFBLENBQUEsQ0FBQTtTQUFBO2VBQ0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsTUFGbEI7T0FBQSxNQUFBO2VBSUUsZ0RBQUEsU0FBQSxFQUpGO09BRG9CO0lBQUEsQ0FIdEIsQ0FBQTs7QUFBQSxtQkFVQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSxJQUFDLENBQUEsV0FBRCxDQUFhLFNBQWIsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZLE9BQUEsQ0FBUSxZQUFSLENBRFosQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFFB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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus-ex-mode/lib/view.coffee
