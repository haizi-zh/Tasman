Meteor.publish('essayDetail', function(uid) {
  check(uid, String);
  return Essay.find({'uuid': uid});
});

Meteor.FilterCollections.publish(Essay, {
  name: 'essayList',
  callbacks: {/*...*/}
});