Template.postItem.helpers({

  domain: function() {
    var a = document.createElement('a');
    a.href = this.url; // this 指向当前代码快，由each分配
    return a.hostname;
  },

  ownPost: function() {
    return this.userId === Meteor.userId();
  }

});