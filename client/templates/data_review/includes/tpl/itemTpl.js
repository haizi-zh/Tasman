Template.stringTpl.helpers({
  UpdateMD5: function() {
    // $('textarea').flexText();

    // 记录富文本框的数据修改
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
  // 有奇怪的问题:行数太多时会有点不够长的现象，大部分情况都还好
  $('textarea').flexText();

  // 记录非富文本的文本框的数据修改
  if (!this.data.richEditor) {
    var keyChain = this.data.keyChain;
    var isStrs = this.data.strArray;
    $('textarea#' + keyChain).on('blur', function(e) {
      var curText = $(e.target).val();
      updateOplog(keyChain, curText, isStrs);
    })
  }
});

/**
 * [updateOplog description]
 * @param  {[type]}  key    数据库中的字段名
 * @param  {[type]}  value  当前值
 * @param  {Boolean} isStrs 是否为字符串数组
 * @return {[type]}         [description]
 */
updateOplog = function(key, value, isStrs) {
  var dotKey = formatDot(key); // 'xxx-xx-x' >>>> 'xxx.xx.x'
  if (cmsMd5(value) !== Session.get('originMD5')[key]) {
    //字符串数组需要划分成数组
    var tempValue = (isStrs) ? value.split(',') : value;
    addOplog(dotKey, tempValue);
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