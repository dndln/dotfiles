(function() {
  var AutoComplete, Ex, fs, os, path;

  fs = require('fs');

  path = require('path');

  os = require('os');

  Ex = require('./ex');

  module.exports = AutoComplete = (function() {
    function AutoComplete(commands) {
      this.commands = commands;
      this.resetCompletion();
    }

    AutoComplete.prototype.resetCompletion = function() {
      this.autoCompleteIndex = 0;
      this.autoCompleteText = null;
      return this.completions = [];
    };

    AutoComplete.prototype.expandTilde = function(filePath) {
      if (filePath.charAt(0) === '~') {
        return os.homedir() + filePath.slice(1);
      } else {
        return filePath;
      }
    };

    AutoComplete.prototype.getAutocomplete = function(text) {
      var cmd, filePath, parts;
      if (!this.autoCompleteText) {
        this.autoCompleteText = text;
      }
      parts = this.autoCompleteText.split(' ');
      cmd = parts[0];
      if (parts.length > 1) {
        filePath = parts.slice(1).join(' ');
        return this.getCompletion((function(_this) {
          return function() {
            return _this.getFilePathCompletion(cmd, filePath);
          };
        })(this));
      } else {
        return this.getCompletion((function(_this) {
          return function() {
            return _this.getCommandCompletion(cmd);
          };
        })(this));
      }
    };

    AutoComplete.prototype.filterByPrefix = function(commands, prefix) {
      return commands.sort().filter((function(_this) {
        return function(f) {
          return f.startsWith(prefix);
        };
      })(this));
    };

    AutoComplete.prototype.getCompletion = function(completeFunc) {
      var complete;
      if (this.completions.length === 0) {
        this.completions = completeFunc();
      }
      complete = '';
      if (this.completions.length) {
        complete = this.completions[this.autoCompleteIndex % this.completions.length];
        this.autoCompleteIndex++;
        if (complete.endsWith('/') && this.completions.length === 1) {
          this.resetCompletion();
        }
      }
      return complete;
    };

    AutoComplete.prototype.getCommandCompletion = function(command) {
      return this.filterByPrefix(this.commands, command);
    };

    AutoComplete.prototype.getFilePathCompletion = function(command, filePath) {
      var baseName, basePath, basePathStat, err, files;
      filePath = this.expandTilde(filePath);
      if (filePath.endsWith(path.sep)) {
        basePath = path.dirname(filePath + '.');
        baseName = '';
      } else {
        basePath = path.dirname(filePath);
        baseName = path.basename(filePath);
      }
      try {
        basePathStat = fs.statSync(basePath);
        if (basePathStat.isDirectory()) {
          files = fs.readdirSync(basePath);
          return this.filterByPrefix(files, baseName).map((function(_this) {
            return function(f) {
              filePath = path.join(basePath, f);
              if (fs.lstatSync(filePath).isDirectory()) {
                return command + ' ' + filePath + path.sep;
              } else {
                return command + ' ' + filePath;
              }
            };
          })(this));
        }
        return [];
      } catch (_error) {
        err = _error;
        return [];
      }
    };

    return AutoComplete;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy9leC1tb2RlL2xpYi9hdXRvY29tcGxldGUuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhCQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFFQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FGTCxDQUFBOztBQUFBLEVBR0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxNQUFSLENBSEwsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxJQUFBLHNCQUFDLFFBQUQsR0FBQTtBQUNYLE1BQUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxRQUFaLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FEQSxDQURXO0lBQUEsQ0FBYjs7QUFBQSwyQkFJQSxlQUFBLEdBQWlCLFNBQUEsR0FBQTtBQUNmLE1BQUEsSUFBQyxDQUFBLGlCQUFELEdBQXFCLENBQXJCLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQURwQixDQUFBO2FBRUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxHQUhBO0lBQUEsQ0FKakIsQ0FBQTs7QUFBQSwyQkFTQSxXQUFBLEdBQWEsU0FBQyxRQUFELEdBQUE7QUFDWCxNQUFBLElBQUcsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsQ0FBaEIsQ0FBQSxLQUFzQixHQUF6QjtBQUNFLGVBQU8sRUFBRSxDQUFDLE9BQUgsQ0FBQSxDQUFBLEdBQWUsUUFBUSxDQUFDLEtBQVQsQ0FBZSxDQUFmLENBQXRCLENBREY7T0FBQSxNQUFBO0FBR0UsZUFBTyxRQUFQLENBSEY7T0FEVztJQUFBLENBVGIs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

//# sourceURL=/home/andy/.atom/packages/ex-mode/lib/autocomplete.coffee
