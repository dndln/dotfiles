(function() {
  var dispatch, highlightSearch, indentGuide, lineNumbers, moveToLine, moveToLineByPercent, q, qall, showInvisible, softWrap, split, toggleConfig, vsplit, w, wall, wq, wqall;

  dispatch = function(target, command) {
    return atom.commands.dispatch(target, command);
  };

  w = function(_arg) {
    var editor;
    editor = (_arg != null ? _arg : {}).editor;
    if (editor != null ? editor.getPath() : void 0) {
      return editor.save();
    } else {
      return atom.workspace.saveActivePaneItem();
    }
  };

  q = function() {
    return atom.workspace.closeActivePaneItemOrEmptyPaneOrWindow();
  };

  wq = function() {
    w();
    return q();
  };

  qall = function() {
    var item, _i, _len, _ref, _results;
    _ref = atom.workspace.getPaneItems();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      _results.push(q());
    }
    return _results;
  };

  wall = function() {
    var editor, _i, _len, _ref, _results;
    _ref = atom.workspace.getTextEditors();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      editor = _ref[_i];
      if (editor.isModified()) {
        _results.push(w({
          editor: editor
        }));
      }
    }
    return _results;
  };

  wqall = function() {
    var item, _i, _len, _ref, _results;
    _ref = atom.workspace.getPaneItems();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      w();
      _results.push(q());
    }
    return _results;
  };

  split = function(_arg) {
    var editor, editorElement;
    editor = _arg.editor, editorElement = _arg.editorElement;
    return dispatch(editorElement, 'pane:split-down-and-copy-active-item');
  };

  vsplit = function(_arg) {
    var editor, editorElement;
    editor = _arg.editor, editorElement = _arg.editorElement;
    return dispatch(editorElement, 'pane:split-right-and-copy-active-item');
  };

  toggleConfig = function(param) {
    var value;
    value = atom.config.get(param);
    return atom.config.set(param, !value);
  };

  showInvisible = function() {
    return toggleConfig('editor.showInvisibles');
  };

  highlightSearch = function() {
    return toggleConfig('vim-mode-plus.highlightSearch');
  };

  softWrap = function(_arg) {
    var editorElement;
    editorElement = _arg.editorElement;
    return dispatch(editorElement, 'editor:toggle-soft-wrap');
  };

  indentGuide = function(_arg) {
    var editorElement;
    editorElement = _arg.editorElement;
    return dispatch(editorElement, 'editor:toggle-indent-guide');
  };

  lineNumbers = function(_arg) {
    var editorElement;
    editorElement = _arg.editorElement;
    return dispatch(editorElement, 'editor:toggle-line-numbers');
  };

  moveToLine = function(vimState, count) {
    vimState.setCount(count);
    return vimState.operationStack.run('MoveToFirstLine');
  };

  moveToLineByPercent = function(vimState, count) {
    vimState.setCount(count);
    return vimState.operationStack.run('MoveToLineByPercent');
  };

  module.exports = {
    normalCommands: {
      w: w,
      wq: wq,
      wall: wall,
      wqall: wqall,
      q: q,
      qall: qall,
      split: split,
      vsplit: vsplit
    },
    toggleCommands: {
      showInvisible: showInvisible,
      softWrap: softWrap,
      indentGuide: indentGuide,
      lineNumbers: lineNumbers,
      highlightSearch: highlightSearch
    },
    numberCommands: {
      moveToLine: moveToLine,
      moveToLineByPercent: moveToLineByPercent
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5keS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzLWV4LW1vZGUvbGliL2NvbW1hbmRzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUVBO0FBQUEsTUFBQSx1S0FBQTs7QUFBQSxFQUFBLFFBQUEsR0FBVyxTQUFDLE1BQUQsRUFBUyxPQUFULEdBQUE7V0FDVCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsTUFBdkIsRUFBK0IsT0FBL0IsRUFEUztFQUFBLENBQVgsQ0FBQTs7QUFBQSxFQUtBLENBQUEsR0FBSSxTQUFDLElBQUQsR0FBQTtBQUNGLFFBQUEsTUFBQTtBQUFBLElBREkseUJBQUQsT0FBUyxJQUFSLE1BQ0osQ0FBQTtBQUFBLElBQUEscUJBQUcsTUFBTSxDQUFFLE9BQVIsQ0FBQSxVQUFIO2FBQ0UsTUFBTSxDQUFDLElBQVAsQ0FBQSxFQURGO0tBQUEsTUFBQTthQUdFLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWYsQ0FBQSxFQUhGO0tBREU7RUFBQSxDQUxKLENBQUE7O0FBQUEsRUFXQSxDQUFBLEdBQUksU0FBQSxHQUFBO1dBQ0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxzQ0FBZixDQUFBLEVBREU7RUFBQSxDQVhKLENBQUE7O0FBQUEsRUFjQSxFQUFBLEdBQUssU0FBQSxHQUFBO0FBQ0gsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1dBQ0EsQ0FBQSxDQUFBLEVBRkc7RUFBQSxDQWRMLENBQUE7O0FBQUEsRUFrQkEsSUFBQSxHQUFPLFNBQUEsR0FBQTtBQUNMLFFBQUEsOEJBQUE7QUFBQTtBQUFBO1NBQUEsMkNBQUE7c0JBQUE7QUFBQSxvQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBO0FBQUE7b0JBREs7RUFBQSxDQWxCUCxDQUFBOztBQUFBLEVBcUJBLElBQUEsR0FBTyxTQUFBLEdBQUE7QUFDTCxR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

//# sourceURL=/home/andy/.atom/packages/vim-mode-plus-ex-mode/lib/commands.coffee
