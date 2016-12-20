(function() {
  var IncreaseOperators, IndentOperators, InputOperators, Operators, Put, Replace, _;

  _ = require('underscore-plus');

  IndentOperators = require('./indent-operators');

  IncreaseOperators = require('./increase-operators');

  Put = require('./put-operator');

  InputOperators = require('./input');

  Replace = require('./replace-operator');

  Operators = require('./general-operators');

  Operators.Put = Put;

  Operators.Replace = Replace;

  _.extend(Operators, IndentOperators);

  _.extend(Operators, IncreaseOperators);

  _.extend(Operators, InputOperators);

  module.exports = Operators;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS9saWIvb3BlcmF0b3JzL2luZGV4LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw4RUFBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0EsZUFBQSxHQUFrQixPQUFBLENBQVEsb0JBQVIsQ0FEbEIsQ0FBQTs7QUFBQSxFQUVBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSxzQkFBUixDQUZwQixDQUFBOztBQUFBLEVBR0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxnQkFBUixDQUhOLENBQUE7O0FBQUEsRUFJQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxTQUFSLENBSmpCLENBQUE7O0FBQUEsRUFLQSxPQUFBLEdBQVUsT0FBQSxDQUFRLG9CQUFSLENBTFYsQ0FBQTs7QUFBQSxFQU1BLFNBQUEsR0FBWSxPQUFBLENBQVEscUJBQVIsQ0FOWixDQUFBOztBQUFBLEVBUUEsU0FBUyxDQUFDLEdBQVYsR0FBZ0IsR0FSaEIsQ0FBQTs7QUFBQSxFQVNBLFNBQVMsQ0FBQyxPQUFWLEdBQW9CLE9BVHBCLENBQUE7O0FBQUEsRUFVQSxDQUFDLENBQUMsTUFBRixDQUFTLFNBQVQsRUFBb0IsZUFBcEIsQ0FWQSxDQUFBOztBQUFBLEVBV0EsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxTQUFULEVBQW9CLGlCQUFwQixDQVhBLENBQUE7O0FBQUEsRUFZQSxDQUFDLENBQUMsTUFBRixDQUFTLFNBQVQsRUFBb0IsY0FBcEIsQ0FaQSxDQUFBOztBQUFBLEVBYUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FiakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/andy/.atom/packages/vim-mode/lib/operators/index.coffee
