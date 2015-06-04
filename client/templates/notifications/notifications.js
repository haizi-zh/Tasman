Notifications = new Mongo.Collection('Notifications');
Template.notifications.helpers({
  notifications: function() {
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
    return this.url;
  },
  msgZhDesc: function() {
    var zhTips = '';

    switch(this.type){
      case 'taskAssign':
        zhTips = '任务安排';break;
      default:
        break;
    }
    console.log('---==---' + this.type + zhTips);
    return zhTips;
  }
});
Template.notificationItem.events({
  'click a': function() {
    console.log(this._id);
    Notifications.update({
      _id: this._id
    }, {
      '$set': {
        read: true
      }
    });
  }
});