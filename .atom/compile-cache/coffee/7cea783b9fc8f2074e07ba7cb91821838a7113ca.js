(function() {
  var AutoComplete, fs, helpers, os, path, uuid;

  fs = require('fs-plus');

  path = require('path');

  os = require('os');

  uuid = require('node-uuid');

  helpers = require('./spec-helper');

  AutoComplete = require('../lib/autocomplete');

  describe("autocomplete functionality", function() {
    beforeEach(function() {
      this.autoComplete = new AutoComplete(['taba', 'tabb', 'tabc']);
      this.testDir = path.join(os.tmpdir(), "atom-ex-mode-spec-" + (uuid.v4()));
      this.testFile1 = path.join(this.testDir, "atom-ex-testfile-a.txt");
      this.testFile2 = path.join(this.testDir, "atom-ex-testfile-b.txt");
      return runs((function(_this) {
        return function() {
          fs.makeTreeSync(_this.testDir);
          fs.closeSync(fs.openSync(_this.testFile1, 'w'));
          fs.closeSync(fs.openSync(_this.testFile2, 'w'));
          spyOn(_this.autoComplete, 'resetCompletion').andCallThrough();
          spyOn(_this.autoComplete, 'getFilePathCompletion').andCallThrough();
          return spyOn(_this.autoComplete, 'getCommandCompletion').andCallThrough();
        };
      })(this));
    });
    afterEach(function() {
      return fs.removeSync(this.testDir);
    });
    describe("autocomplete commands", function() {
      beforeEach(function() {
        return this.completed = this.autoComplete.getAutocomplete('tab');
      });
      it("returns taba", function() {
        return expect(this.completed).toEqual('taba');
      });
      return it("calls command function", function() {
        return expect(this.autoComplete.getCommandCompletion.callCount).toBe(1);
      });
    });
    describe("autocomplete commands, then autoComplete again", function() {
      beforeEach(function() {
        this.completed = this.autoComplete.getAutocomplete('tab');
        return this.completed = this.autoComplete.getAutocomplete('tab');
      });
      it("returns tabb", function() {
        return expect(this.completed).toEqual('tabb');
      });
      return it("calls command function", function() {
        return expect(this.autoComplete.getCommandCompletion.callCount).toBe(1);
      });
    });
    describe("autocomplete directory", function() {
      beforeEach(function() {
        var filePath;
        filePath = path.join(os.tmpdir(), 'atom-ex-mode-spec-');
        return this.completed = this.autoComplete.getAutocomplete('tabe ' + filePath);
      });
      it("returns testDir", function() {
        var expected;
        expected = 'tabe ' + this.testDir + path.sep;
        return expect(this.completed).toEqual(expected);
      });
      return it("clears autocomplete", function() {
        return expect(this.autoComplete.resetCompletion.callCount).toBe(1);
      });
    });
    describe("autocomplete directory, then autocomplete again", function() {
      beforeEach(function() {
        var filePath;
        filePath = path.join(os.tmpdir(), 'atom-ex-mode-spec-');
        this.completed = this.autoComplete.getAutocomplete('tabe ' + filePath);
        return this.completed = this.autoComplete.getAutocomplete(this.completed);
      });
      it("returns test file 1", function() {
        return expect(this.completed).toEqual('tabe ' + this.testFile1);
      });
      return it("lists files twice", function() {
        return expect(this.autoComplete.getFilePathCompletion.callCount).toBe(2);
      });
    });
    return describe("autocomplete full directory, then autocomplete again", function() {
      beforeEach(function() {
        var filePath;
        filePath = path.join(this.testDir, 'a');
        this.completed = this.autoComplete.getAutocomplete('tabe ' + filePath);
        return this.completed = this.autoComplete.getAutocomplete(this.completed);
      });
      it("returns test file 2", function() {
        return expect(this.completed).toEqual('tabe ' + this.testFile2);
      });
      return it("lists files once", function() {
        return expect(this.autoComplete.getFilePathCompletion.callCount).toBe(1);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy9leC1tb2RlL3NwZWMvYXV0b2NvbXBsZXRlLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlDQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFFQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FGTCxDQUFBOztBQUFBLEVBR0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxXQUFSLENBSFAsQ0FBQTs7QUFBQSxFQUtBLE9BQUEsR0FBVSxPQUFBLENBQVEsZUFBUixDQUxWLENBQUE7O0FBQUEsRUFNQSxZQUFBLEdBQWUsT0FBQSxDQUFRLHFCQUFSLENBTmYsQ0FBQTs7QUFBQSxFQVFBLFFBQUEsQ0FBUyw0QkFBVCxFQUF1QyxTQUFBLEdBQUE7QUFDckMsSUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxJQUFDLENBQUEsWUFBRCxHQUFvQixJQUFBLFlBQUEsQ0FBYSxDQUFDLE1BQUQsRUFBUyxNQUFULEVBQWlCLE1BQWpCLENBQWIsQ0FBcEIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJLENBQUMsSUFBTCxDQUFVLEVBQUUsQ0FBQyxNQUFILENBQUEsQ0FBVixFQUF3QixvQkFBQSxHQUFtQixDQUFDLElBQUksQ0FBQyxFQUFMLENBQUEsQ0FBRCxDQUEzQyxDQURYLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFDLENBQUEsT0FBWCxFQUFvQix3QkFBcEIsQ0FGYixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsU0FBRCxHQUFhLElBQUks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

//# sourceURL=/home/andy/.atom/packages/ex-mode/spec/autocomplete-spec.coffee
