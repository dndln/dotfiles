(function() {
  var $, $$, SelectList, SelectListView, fuzzaldrin, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  _ref = require('atom-space-pen-views'), SelectListView = _ref.SelectListView, $ = _ref.$, $$ = _ref.$$;

  fuzzaldrin = require('fuzzaldrin');

  SelectList = (function(_super) {
    __extends(SelectList, _super);

    function SelectList() {
      return SelectList.__super__.constructor.apply(this, arguments);
    }

    SelectList.prototype.initialize = function() {
      SelectList.__super__.initialize.apply(this, arguments);
      return this.addClass('vim-mode-plus-select-list');
    };

    SelectList.prototype.getFilterKey = function() {
      return 'displayName';
    };

    SelectList.prototype.cancelled = function() {
      this.vimState.emitter.emit('did-cancel-select-list');
      return this.hide();
    };

    SelectList.prototype.show = function(vimState, options) {
      var _ref1;
      this.vimState = vimState;
      if (options.maxItems != null) {
        this.setMaxItems(options.maxItems);
      }
      _ref1 = this.vimState, this.editorElement = _ref1.editorElement, this.editor = _ref1.editor;
      this.storeFocusedElement();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.setItems(options.items);
      return this.focusFilterEditor();
    };

    SelectList.prototype.hide = function() {
      var _ref1;
      return (_ref1 = this.panel) != null ? _ref1.hide() : void 0;
    };

    SelectList.prototype.viewForItem = function(_arg) {
      var displayName, filterQuery, matches, name;
      name = _arg.name, displayName = _arg.displayName;
      filterQuery = this.getFilterQuery();
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

    SelectList.prototype.confirmed = function(item) {
      this.vimState.emitter.emit('did-confirm-select-list', item);
      return this.cancel();
    };

    return SelectList;

  })(SelectListView);

  module.exports = new SelectList;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9zZWxlY3QtbGlzdC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsc0RBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0EsT0FBMEIsT0FBQSxDQUFRLHNCQUFSLENBQTFCLEVBQUMsc0JBQUEsY0FBRCxFQUFpQixTQUFBLENBQWpCLEVBQW9CLFVBQUEsRUFEcEIsQ0FBQTs7QUFBQSxFQUVBLFVBQUEsR0FBYSxPQUFBLENBQVEsWUFBUixDQUZiLENBQUE7O0FBQUEsRUFJTTtBQUNKLGlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSx5QkFBQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSw0Q0FBQSxTQUFBLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxRQUFELENBQVUsMkJBQVYsRUFGVTtJQUFBLENBQVosQ0FBQTs7QUFBQSx5QkFJQSxZQUFBLEdBQWMsU0FBQSxHQUFBO2FBQ1osY0FEWTtJQUFBLENBSmQsQ0FBQTs7QUFBQSx5QkFPQSxTQUFBLEdBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFsQixDQUF1Qix3QkFBdkIsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLElBQUQsQ0FBQSxFQUZTO0lBQUEsQ0FQWCxDQUFBOztBQUFBLHlCQVdBLElBQUEsR0FBTSxTQUFFLFFBQUYsRUFBWSxPQUFaLEdBQUE7QUFDSixVQUFBLEtBQUE7QUFBQSxNQURLLElBQUMsQ0FBQSxXQUFBLFFBQ04sQ0FBQTtBQUFBLE1BQUEsSUFBRyx3QkFBSDtBQUNFLFFBQUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxPQUFPLENBQUMs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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/select-list.coffee
