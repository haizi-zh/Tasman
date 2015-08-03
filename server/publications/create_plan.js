
// 新建计划的发布
Meteor.publish('createPlanResult', function(poiType, locName, query, options) {
  check(poiType, String);
  check(locName, String);
  check(query, Object);
  check(options, Object);
  console.log('城市' + locName);

  var locId = Locality.findOne({'alias': locName})._id;
  if (!locId) {
    console.log("Can't find the city: " + locName);
    return {};
  }
  query = _.extend(query, {'targets': locId});
  // 两种方式查找景点
  // db.ViewSpot.find({targets: ObjectId("5492bd2ae721e717174512dd")})
  // db.ViewSpot.find({"locality._id": ObjectId("5492bd2ae721e717174512dd")})
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


Meteor.publish('CmsGeneratedPlan', function(locName) {
  check(locName, String);
  if (locName !== 'all') {
    return CmsGenerated.find({'locName': locName});
  }
  return CmsGenerated.find({});
});