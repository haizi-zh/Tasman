Template.stringTpl.helpers({
  UpdateMD5: function() {
    return function(e, editor) {
      var curHTML = editor.getHTML(); // 嵌入了编译器的标签
      var curText = editor.getText(); // 去除了所有html标签（包括本身就带有的），只有纯文本，
      var keyChain = editor.options.keyChain;
      // var index = editor.options.index;
      updateOplog(keyChain, curHTML);
      return false; // Stop Froala Editor from POSTing to the Save URL
    }
  }
});

Template.stringTpl.onRendered(function() {
  if (!this.data.richEditor) {
    var keyChain = this.data.keyChain;
    $('textarea#' + keyChain).on('blur', function(e) {
      var curText = $(e.target).val();
      updateOplog(keyChain, curText);
    })
  }
});

/*
@ key: 数据库中的字段名
@ value: 当前值
*/

updateOplog = function(key, value) {
  var dotKey = formatDot(key); // 'xxx-xx-x' >>>> 'xxx.xx.x'
  if (cmsMd5(value) !== Session.get('originMD5')[key]) {
    addOplog(dotKey, value);
    log(Session.get('oplog'));
  } else {
    deleteOplog(dotKey);
    log(Session.get('oplog'));
  }
};

addOplog = function(key, value) {
  var newSession = Session.get('oplog');
  newSession[key] = value;
  Session.set('oplog', newSession);
};

deleteOplog = function(key) {
  var newSession = Session.get('oplog');
  newSession[key] = undefined;
  Session.set('oplog', newSession);
};

formatDot = function(str) {
  return str.replace(/-/g, '.');
};