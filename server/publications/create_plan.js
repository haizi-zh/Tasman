Meteor.publish('createPlanResult', function(poiType, locName, query, options) {
  check(poiType, String);
  check(locName, String);
  check(query, Object);
  check(options, Object);
  console.log('城市' + locName);

  var locId = Locality.findOne({'alias': locName})._id;
  query = _.extend(query, {'targets': locId});
  return getMongoCol(poiType).find(query, options);
});

Meteor.publish('createPlanCount', function(poiType, locName, query, options) {
  check(poiType, String);
  check(locName, String);
  check(query, Object);
  check(options, Object);
  var locId = Locality.findOne({'alias': locName})._id,
      self = this;
  query = _.extend(query, {'targets': locId});
  var count = getMongoCol(poiType).find(query).count() || 0;
  console.log('一共找到了:' + count);

  self.added('ItemCount', Meteor.uuid(), {
    'count': count,
  });
    this.ready();
});

Meteor.publish('poi-item', function(type, locId){
  check(type, String);
  check(locId, String);
  return getMongoCol(type).find({'targets': new Mongo.ObjectID(locId)}, {'limit': 5, 'sort': {'hotness': -1}});
});