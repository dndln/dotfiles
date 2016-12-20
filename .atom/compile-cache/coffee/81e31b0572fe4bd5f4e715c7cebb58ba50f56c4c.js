(function() {
  var QuickSort;

  QuickSort = (function() {
    function QuickSort() {}

    QuickSort.prototype.sort = function(items) {
      var current, left, pivot, right;
      if (items.length <= 1) {
        return items;
      }
      pivot = items.shift();
      left = [];
      right = [];
      while (items.length > 0) {
        current = items.shift();
        if (current < pivot) {
          left.push(current);
        } else {
          right.push(current);
        }
      }
      return sort(left).concat(pivot).concat(sort(right));
    };

    QuickSort.prototype.noop = function() {};

    return QuickSort;

  })();

  exports.modules = quicksort;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvZml4dHVyZXMvc2FtcGxlLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQVFBO0FBQUEsTUFBQSxTQUFBOztBQUFBLEVBQU07MkJBQ0o7O0FBQUEsd0JBQUEsSUFBQSxHQUFNLFNBQUMsS0FBRCxHQUFBO0FBQ0osVUFBQSwyQkFBQTtBQUFBLE1BQUEsSUFBZ0IsS0FBSyxDQUFDLE1BQU4sSUFBZ0IsQ0FBaEM7QUFBQSxlQUFPLEtBQVAsQ0FBQTtPQUFBO0FBQUEsTUFFQSxLQUFBLEdBQVEsS0FBSyxDQUFDLEtBQU4sQ0FBQSxDQUZSLENBQUE7QUFBQSxNQUdBLElBQUEsR0FBTyxFQUhQLENBQUE7QUFBQSxNQUlBLEtBQUEsR0FBUSxFQUpSLENBQUE7QUFRQSxhQUFNLEtBQUssQ0FBQyxNQUFOLEdBQWUsQ0FBckIsR0FBQTtBQUNFLFFBQUEsT0FBQSxHQUFVLEtBQUssQ0FBQyxLQUFOLENBQUEsQ0FBVixDQUFBO0FBQ0EsUUFBQSxJQUFHLE9BQUEsR0FBVSxLQUFiO0FBQ0UsVUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsQ0FBQSxDQURGO1NBQUEsTUFBQTtBQUdFLFVBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxPQUFYLENBQUEsQ0FIRjtTQUZGO01BQUEsQ0FSQTthQWVBLElBQUEsQ0FBSyxJQUFMLENBQVUsQ0FBQyxNQUFYLENBQWtCLEtBQWxCLENBQXdCLENBQUMsTUFBekIsQ0FBZ0MsSUFBQSxDQUFLLEtBQUwsQ0FBaEMsRUFoQkk7SUFBQSxDQUFOLENBQUE7O0FBQUEsd0JBa0JBLElBQUEsR0FBTSxTQUFBLEdBQUEsQ0FsQk4sQ0FBQTs7cUJBQUE7O01BREYsQ0FBQTs7QUFBQSxFQXNCQSxPQUFPLENBQUMsT0FBUixHQUFrQixTQXRCbEIsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus/spec/fixtures/sample.coffee
