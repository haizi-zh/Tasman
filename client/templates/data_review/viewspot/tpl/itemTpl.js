Template.stringTpl.helpers({
  updateMD5: function() {
    var self = this;
    return function (e, editor) {

      var curHTML = editor.getHTML(); // 嵌入了编译器的标签
      var curText = editor.getText();    // 去除了所有html标签（包括本身就带有的），只有纯文本，
      var oriContent = editor.options._value;  // 最开始的值
      if (cmsMd5(oriContent) !== cmsMd5(curText)) {
        var keyChain = editor.options.keyChain;
        var newSession = Session.get('oplog');
        newSession[keyChain] = curHTML;
        Session.set('oplog', newSession);
        log(Session.get('oplog'));
      }

      return false; // Stop Froala Editor from POSTing to the Save URL
    }
  }
});