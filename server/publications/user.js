Meteor.publish("userData", function() {
  if (this.userId) {
    return Meteor.users.find({
      _id: this.userId
    }, {
      fields: {
        'rights': 1,
      }
    });
  } else {
    this.ready();
  }
});

Meteor.publish('allUsers', function(){
  return Meteor.users.find({}, {fields: {'rights': 1, 'username': 1}});
});

Meteor.methods({
  addUserRight: function(rightName, uid) {
    check(rightName, String);
    check(uid, String);
    Meteor.users.update({'_id': uid}, {'$addToSet': {'rights': rightName}});
  },
  removeUserRight: function(rightName, uid) {
    check(rightName, String);
    check(uid, String);
    Meteor.users.update({'_id': uid}, {'$pullAll': {'rights': [rightName,]}});
  },
});

Meteor.users.allow({
  update: function(){
    return true;
  }
})