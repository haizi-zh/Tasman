Template.postItem.helpers({
  domain: function() {
    var a = document.createElement('a');
    a.href = this.url; // this 指向当前代码快，由each分配
    return a.hostname;
  },
  ownPost: function() {
    return this.userId === Meteor.userId();
  },
  upvotedClass: function() {
    var userId = Meteor.userId();
    if (userId && !_.include(this.upvoters, userId)) {
      return 'btn-primary upvoteable';
    } else {
      return 'disabled';
    }
  },
  hasS: function(n, text) {
    if (n <= 1) {
      return text;
    } else {
      return text + 's';
    }
  }
});

Template.postItem.events({
  'click .upvoteable': function(e) {
    e.preventDefault();
    Meteor.call('upvote', this._id);
  }
});