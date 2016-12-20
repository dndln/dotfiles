(function() {
  var MultiCursor, WorkspaceView;

  MultiCursor = require('../lib/multi-cursor');

  WorkspaceView = require('atom').WorkspaceView;

  describe("MultiCursor", function() {
    var activationPromise, view, workspaceElement, _ref;
    _ref = [], workspaceElement = _ref[0], view = _ref[1], activationPromise = _ref[2];
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      view = atom.workspace.openSync('spec/files/test.txt');
      view.setCursorBufferPosition([0, 0]);
      return activationPromise = atom.packages.activatePackage('multi-cursor');
    });
    return describe("when the multi-cursor:expandDown event is triggered", function() {
      return it("When there's 1 cursor and down command is activated", function() {
        jasmine.attachToDOM(workspaceElement);
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          expect(view.getCursors().length).toBe(1);
          atom.commands.dispatch(workspaceElement, 'multi-cursor:expandDown');
          return expect(view.getCursors().length).toBe(2);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy9tdWx0aS1jdXJzb3Ivc3BlYy9tdWx0aS1jdXJzb3Itc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsMEJBQUE7O0FBQUEsRUFBQSxXQUFBLEdBQWMsT0FBQSxDQUFRLHFCQUFSLENBQWQsQ0FBQTs7QUFBQSxFQUNDLGdCQUFpQixPQUFBLENBQVEsTUFBUixFQUFqQixhQURELENBQUE7O0FBQUEsRUFRQSxRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBLEdBQUE7QUFDdEIsUUFBQSwrQ0FBQTtBQUFBLElBQUEsT0FBOEMsRUFBOUMsRUFBQywwQkFBRCxFQUFtQixjQUFuQixFQUF5QiwyQkFBekIsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QixDQUFuQixDQUFBO0FBQUEsTUFDQSxJQUFBLEdBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFmLENBQXdCLHFCQUF4QixDQURQLENBQUE7QUFBQSxNQUVBLElBQUksQ0FBQyx1QkFBTCxDQUE2QixDQUFDLENBQUQsRUFBRyxDQUFILENBQTdCLENBRkEsQ0FBQTthQUdBLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixjQUE5QixFQUpYO0lBQUEsQ0FBWCxDQUZBLENBQUE7V0FRQSxRQUFBLENBQVMscURBQVQsRUFBZ0UsU0FBQSxHQUFBO2FBQzlELEVBQUEsQ0FBRyxxREFBSCxFQUEwRCxTQUFBLEdBQUE7QUFDeEQsUUFBQSxPQUFPLENBQUMsV0FBUixDQUFvQixnQkFBcEIsQ0FBQSxDQUFBO0FBQUEsUUFFQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxrQkFEYztRQUFBLENBQWhCLENBRkEsQ0FBQTtlQUtBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxVQUFBLE1BQUEsQ0FBTyxJQUFJLENBQUMsVUFBTCxDQUFBLENBQWlCLENBQUMsTUFBekIsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyxDQUF0QyxDQUFBLENBQUE7QUFBQSxVQUNBLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixnQkFBdkIsRUFBeUMseUJBQXpDLENBREEsQ0FBQTtpQkFFQSxNQUFBLENBQU8sSUFBSSxDQUFDLFVBQUwsQ0FBQSxDQUFpQixDQUFDLE1BQXpCLENBQWdDLENBQUMsSUFBakMsQ0FBc0MsQ0FBdEMsRUFIRztRQUFBLENBQUwsRUFOd0Q7TUFBQSxDQUExRCxFQUQ4RDtJQUFBLENBQWhFLEVBVHNCO0VBQUEsQ0FBeEIsQ0FSQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/andy/.atom/packages/multi-cursor/spec/multi-cursor-spec.coffee
