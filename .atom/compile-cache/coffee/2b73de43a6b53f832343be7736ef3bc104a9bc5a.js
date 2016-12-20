(function() {
  var Hover, HoverElement, emoji, emojiFolder, registerElement, settings, swrap,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  emoji = require('emoji-images');

  emojiFolder = 'atom://vim-mode-plus/node_modules/emoji-images/pngs';

  registerElement = require('./utils').registerElement;

  settings = require('./settings');

  swrap = require('./selection-wrapper');

  Hover = (function(_super) {
    __extends(Hover, _super);

    function Hover() {
      return Hover.__super__.constructor.apply(this, arguments);
    }

    Hover.prototype.createdCallback = function() {
      this.className = 'vim-mode-plus-hover';
      this.text = [];
      return this;
    };

    Hover.prototype.initialize = function(vimState) {
      var _ref;
      this.vimState = vimState;
      _ref = this.vimState, this.editor = _ref.editor, this.editorElement = _ref.editorElement;
      return this;
    };

    Hover.prototype.getPoint = function() {
      var _ref;
      if (this.vimState.isMode('visual', 'blockwise')) {
        return (_ref = this.vimState.getLastBlockwiseSelection()) != null ? _ref.getHeadSelection().getHeadBufferPosition() : void 0;
      } else {
        return swrap(this.editor.getLastSelection()).getBufferPositionFor('head', {
          fromProperty: true,
          allowFallback: true
        });
      }
    };

    Hover.prototype.add = function(text, point) {
      if (point == null) {
        point = this.getPoint();
      }
      this.text.push(text);
      return this.show(point);
    };

    Hover.prototype.replaceLastSection = function(text, point) {
      this.text.pop();
      return this.add(text);
    };

    Hover.prototype.convertText = function(text, lineHeight) {
      text = String(text);
      if (settings.get('showHoverOnOperateIcon') === 'emoji') {
        return emoji(text, emojiFolder, lineHeight);
      } else {
        return text.replace(/:(.*?):/g, function(s, m) {
          return "<span class='icon icon-" + m + "'></span>";
        });
      }
    };

    Hover.prototype.show = function(point) {
      if (this.marker == null) {
        this.marker = this.createOverlay(point);
        this.lineHeight = this.editor.getLineHeightInPixels();
        this.setIconSize(this.lineHeight);
        this.style.marginTop = (this.lineHeight * -2.2) + 'px';
      }
      if (this.text.length) {
        return this.innerHTML = this.text.map((function(_this) {
          return function(text) {
            return _this.convertText(text, _this.lineHeight);
          };
        })(this)).join('');
      }
    };

    Hover.prototype.withTimeout = function(point, options) {
      var _ref;
      this.reset();
      if (options.classList.length) {
        (_ref = this.classList).add.apply(_ref, options.classList);
      }
      this.add(options.text, point);
      if (options.timeout != null) {
        return this.timeoutID = setTimeout((function(_this) {
          return function() {
            return _this.reset();
          };
        })(this), options.timeout);
      }
    };

    Hover.prototype.createOverlay = function(point) {
      var decoration, marker;
      marker = this.editor.markBufferPosition(point);
      decoration = this.editor.decorateMarker(marker, {
        type: 'overlay',
        item: this
      });
      return marker;
    };

    Hover.prototype.setIconSize = function(size) {
      var selector, style, _ref;
      if ((_ref = this.styleElement) != null) {
        _ref.remove();
      }
      this.styleElement = document.createElement('style');
      document.head.appendChild(this.styleElement);
      selector = '.vim-mode-plus-hover .icon::before';
      size = "" + (size * 0.8) + "px";
      style = "font-size: " + size + "; width: " + size + "; hegith: " + size + ";";
      return this.styleElement.sheet.addRule(selector, style);
    };

    Hover.prototype.isVisible = function() {
      return this.marker != null;
    };

    Hover.prototype.reset = function() {
      var _ref, _ref1, _ref2;
      this.text = [];
      clearTimeout(this.timeoutID);
      this.className = 'vim-mode-plus-hover';
      this.textContent = '';
      if ((_ref = this.marker) != null) {
        _ref.destroy();
      }
      if ((_ref1 = this.styleElement) != null) {
        _ref1.remove();
      }
      return _ref2 = {}, this.marker = _ref2.marker, this.lineHeight = _ref2.lineHeight, this.timeoutID = _ref2.timeoutID, this.styleElement = _ref2.styleElement, _ref2;
    };

    Hover.prototype.destroy = function() {
      var _ref;
      this.reset();
      _ref = {}, this.vimState = _ref.vimState, this.lineHeight = _ref.lineHeight;
      return this.remove();
    };

    return Hover;

  })(HTMLElement);

  HoverElement = registerElement("vim-mode-plus-hover", {
    prototype: Hover.prototype
  });

  module.exports = {
    HoverElement: HoverElement
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9ob3Zlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEseUVBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsY0FBUixDQUFSLENBQUE7O0FBQUEsRUFFQSxXQUFBLEdBQWMscURBRmQsQ0FBQTs7QUFBQSxFQUdDLGtCQUFtQixPQUFBLENBQVEsU0FBUixFQUFuQixlQUhELENBQUE7O0FBQUEsRUFJQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FKWCxDQUFBOztBQUFBLEVBS0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUixDQUxSLENBQUE7O0FBQUEsRUFPTTtBQUNKLDRCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxvQkFBQSxlQUFBLEdBQWlCLFNBQUEsR0FBQTtBQUNmLE1BQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxxQkFBYixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsSUFBRCxHQUFRLEVBRFIsQ0FBQTthQUVBLEtBSGU7SUFBQSxDQUFqQixDQUFBOztBQUFBLG9CQUtBLFVBQUEsR0FBWSxTQUFFLFFBQUYsR0FBQTtBQUNWLFVBQUEsSUFBQTtBQUFBLE1BRFcsSUFBQyxDQUFBLFdBQUEsUUFDWixDQUFBO0FBQUEsTUFBQSxPQUE0QixJQUFDLENBQUEsUUFBN0IsRUFBQyxJQUFDLENBQUEsY0FBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLHFCQUFBLGFBQVgsQ0FBQTthQUNBLEtBRlU7SUFBQSxDQUxaLENBQUE7O0FBQUEsb0JBU0EsUUFBQSxHQUFVLFNBQUEsR0FBQTtBQUNSLFVBQUEsSUFBQTtBQUFBLE1BQUEsSUFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBaUIsUUFBakIsRUFBMkIsV0FB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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/hover.coffee
