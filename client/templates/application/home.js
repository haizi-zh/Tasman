Template.home.helpers({
  updateMD5: function(){
    var self = this;
    return function (e, editor) {
      // Get edited HTML from Froala-Editor
      var newHTML = editor.getHTML();
      var newText = editor.getText();
      // Do something to update the edited value provided by the Froala-Editor plugin, if it has changed:
      if (!_.isEqual(newHTML, 'Hello World')) {
        console.log('changed');
      }
      return false; // Stop Froala Editor from POSTing to the Save URL
    }
  }
})