Notifications = new Mongo.Collection('Notifications');
Template.notifications.helpers({
  notifications: function() {
    console.log('abc');
    return Notifications.find({
      userId: Meteor.userId(),
      read: false
    });
  },
  notificationCount: function() {
    return Notifications.find({
      userId: Meteor.userId(),
      read: false
    }).count();
  }
});


Template.notificationItem.helpers({
  notificationPostPath: function() {
    return Router.routes.taskRecieve.path({
      'type': this.type,
      'taskId': this.taskId
    });
  }
});
Template.notificationItem.events({
  'click a': function() {
    Notifications.update({
      _id: this._id
    }, {
      '$set': {
        read: true
      }
    });
  }
});