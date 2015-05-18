Meteor.publish('poi-item', function(type, locId){
  check(type, String);
  check(locId, String);
  return getMongoCol(type).find({'targets': new Mongo.ObjectID(locId)}, {'limit': 5, 'sort': {'hotness': -1}});
});