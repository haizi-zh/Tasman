// 新建计划的发布，当前页结果的展示
Meteor.publish('createPlanResult', function(poiType, locName, query, options) {
  check(poiType, String);
  check(locName, String);
  check(query, Object);
  check(options, Object);
  console.log('城市/国家' + locName);

  var loc = getLocIdFromName(locName);
  if (!loc) {
    console.log("Can't find the city/coutry: " + locName);
    return {};
  }
  var locId = loc[0]._id;

  query = _.extend(query, {'targets': locId});
  // query = _.extend(query, {'locList.zhName': locName});

  // 三种方式查找景点
  // db.ViewSpot.find({targets: ObjectId("5492bd2ae721e717174512dd")}) locality和locList的合集
  // db.ViewSpot.find({"locality._id": ObjectId("5492bd2ae721e717174512dd")}) 所在locality
  // db.ViewSpot.find({"locList.zhName": ObjectId("5492bd2ae721e717174512dd")}) 所在国、省、市
  var db = getMongoCol(poiType);
  return getMongoCol(poiType).find(query, options);
});

// 新建计划的发布，统计页数和总数
Meteor.publish('createPlanCount', function(poiType, locName, query, options) {
  check(poiType, String);
  check(locName, String);
  check(query, Object);
  check(options, Object);

  var self = this;
  var loc = getLocIdFromName(locName);
  if (!loc) {
    console.log("Can't find the city/coutry: " + locName);
    return {};
  }
  var locId = loc[0]._id;

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

function getLocIdFromName(locName) {
  var loc = Locality.find({'zhName': locName}).fetch();

  if (!loc){
    loc = Locality.find({'alias': locName}).fetch();
  }

  if (!loc){
    loc = Country.find({'zhName': locName}).fetch();
  }

  if (!loc){
    loc = Country.find({'alias': locName}).fetch();
  }
  return loc;
}

