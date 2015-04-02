Template.vsBasicInfo.helpers({
 updateMD5: function(){
  var self = this;
  return function(e, editor) {
    var originText = editor.options._value;
    var originMD5 = CryptoJS.MD5(originText).toString();

    var currentText = editor.getText();
    var currentMD5 = CryptoJS.MD5(currentText).toString();

    console.log(originText);
    console.log(currentText);
    
    console.log(originMD5 === currentMD5);
    return false;
  }
  // var originText = _value;
 }
});