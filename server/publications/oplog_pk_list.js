OplogPkList = new Mongo.Collection('OplogPkList');

Meteor.FilterCollections.publish(OplogPkList, {
  name: 'oplog-pk-list'
});