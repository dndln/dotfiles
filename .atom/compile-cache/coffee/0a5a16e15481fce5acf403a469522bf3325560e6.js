(function() {
  var SearchHistoryManager, settings, _;

  _ = require('underscore-plus');

  settings = require('./settings');

  module.exports = SearchHistoryManager = (function() {
    SearchHistoryManager.prototype.idx = null;

    function SearchHistoryManager(vimState) {
      this.vimState = vimState;
      this.globalState = this.vimState.globalState;
      this.idx = -1;
    }

    SearchHistoryManager.prototype.get = function(direction) {
      var _ref;
      switch (direction) {
        case 'prev':
          if ((this.idx + 1) !== this.getSize()) {
            this.idx += 1;
          }
          break;
        case 'next':
          if (!(this.idx === -1)) {
            this.idx -= 1;
          }
      }
      return (_ref = this.globalState.get('searchHistory')[this.idx]) != null ? _ref : '';
    };

    SearchHistoryManager.prototype.save = function(entry) {
      if (_.isEmpty(entry)) {
        return;
      }
      this.replaceEntries(_.uniq([entry].concat(this.getEntries())));
      if (this.getSize() > settings.get('historySize')) {
        return this.getEntries().splice(settings.get('historySize'));
      }
    };

    SearchHistoryManager.prototype.reset = function() {
      return this.idx = -1;
    };

    SearchHistoryManager.prototype.clear = function() {
      return this.replaceEntries([]);
    };

    SearchHistoryManager.prototype.getSize = function() {
      return this.getEntries().length;
    };

    SearchHistoryManager.prototype.getEntries = function() {
      return this.globalState.get('searchHistory');
    };

    SearchHistoryManager.prototype.replaceEntries = function(entries) {
      return this.globalState.set('searchHistory', entries);
    };

    SearchHistoryManager.prototype.destroy = function() {
      return this.idx = null;
    };

    return SearchHistoryManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9zZWFyY2gtaGlzdG9yeS1tYW5hZ2VyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpQ0FBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBRFgsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixtQ0FBQSxHQUFBLEdBQUssSUFBTCxDQUFBOztBQUVhLElBQUEsOEJBQUUsUUFBRixHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsV0FBQSxRQUNiLENBQUE7QUFBQSxNQUFDLElBQUMsQ0FBQSxjQUFlLElBQUMsQ0FBQSxTQUFoQixXQUFGLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxHQUFELEdBQU8sQ0FBQSxDQURQLENBRFc7SUFBQSxDQUZiOztBQUFBLG1DQU1BLEdBQUEsR0FBSyxTQUFDLFNBQUQsR0FBQTtBQUNILFVBQUEsSUFBQTtBQUFBLGNBQU8sU0FBUDtBQUFBLGFBQ08sTUFEUDtBQUNtQixVQUFBLElBQWlCLENBQUMsSUFBQyxDQUFBLEdBQUQsR0FBTyxDQUFSLENBQUEsS0FBYyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQS9CO0FBQUEsWUFBQSxJQUFDLENBQUEsR0FBRCxJQUFRLENBQVIsQ0FBQTtXQURuQjtBQUNPO0FBRFAsYUFFTyxNQUZQO0FBRW1CLFVBQUEsSUFBQSxDQUFBLENBQWtCLElBQUMsQ0FBQSxHQUFELEtBQVEsQ0FBQSxDQUFULENBQWpCO0FBQUEsWUFBQSxJQUFDLENBQUEsR0FBRCxJQUFRLENBQVIsQ0FBQTtXQUZuQjtBQUFBLE9BQUE7dUZBRzBDLEdBSnZDO0lBQUEsQ0FOTCxDQUFBOztBQUFBLG1DQVlBLElBQUEsR0FBTSxTQUFDLEtBQUQsR0FBQTtBQUNKLE1BQUEsSUFBVSxDQUFDLENBQUMsT0FBRixDQUFVLEtBQVYsQ0FBVjtBQUFBLGNBQUEsQ0FBQTtPQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsY0FBRCxDQUFnQixDQUFDLENBQUMsSUFBRixDQUFPLENBQUMsS0FBRCxDQUFPLENBQUMsTUFBUixDQUFlLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBZixDQUFQLENBQWhCLENBREEsQ0FBQTtBQUVBLE1BQUEsSUFBRyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQUEsR0FBYSxRQUFRLENBQUMsR0FBVCxDQUFhLGFBQWIsQ0FBaEI7ZUFDRSxJQUFDLENBQUEsVUFBRCxDQUFBLENBQWEsQ0FBQyxNQUFkLENBQXFCLFFBQVEsQ0FBQyxHQUFULENBQWEsYUFBYixDQUFyQixFQURGO09BSEk7SUFBQSxDQVpOLENBQUE7O0FBQUEsbUNBa0JBLEtBQUEsR0FBTyxTQUFBLEdBQUE7YUFDTCxJQUFDLENBQUEsR0FBRCxHQUFPLENBQUEsRUFERjtJQUFBLENBbEJQLENBQUE7O0FBQUEsbUNBcUJBLEtBQUEsR0FBTyxTQUFBLEdBQUE7YUFDTCxJQUFDLENBQUEsY0FBRCxDQUFnQixFQUFoQixFQURLO0lBQUEsQ0FyQlAsQ0FBQTs7QUFBQSxtQ0F3QkEsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUNQLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBYSxDQUFDLE9BRFA7SUFBQSxDQXhCVCxDQUFBOztBQUFBLG1DQTJCQSxVQUFBLEdBQVksU0FBQSxHQUFBO2FBQ1YsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLGVBQWpCLEVBRFU7SUFBQSxDQTNCWixDQUFBOztBQUFBLG1DQThCQSxjQUFBLEdBQWdCLFNBQUMsT0FBRCxHQUFBO2FBQ2QsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLGVBQWpCLEVBQWtDLE9BQWxDLEVBRGM7SUFBQSxDQTlCaEIsQ0FBQTs7QUFBQSxtQ0FpQ0EsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUNQLElBQUMsQ0FBQSxHQUFELEdBQU8sS0FEQTtJQUFBLENBakNULENBQUE7O2dDQUFBOztNQUxGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/lib/search-history-manager.coffee
