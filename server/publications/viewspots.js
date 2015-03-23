var mongoPoiUrl = mongoUrlGen(dbAuth.poi.db, dbAuth.poi.username, dbAuth.poi.password, dbAuth.poi.host, dbAuth.poi.port);

var poi = new MongoInternals.RemoteCollectionDriver(mongoPoiUrl);

Viewspot = new Mongo.Collection("ViewSpot", { _driver: poi });

// 搜索设置
Viewspot.initEasySearch('zhName', {
  'limit' : 5,
  'use' : 'mongo-db'
});


Meteor.publish('vs', function(isAbroad, zoneName, pageLimit) {
  check(isAbroad, Boolean);
  check(zoneName, String);
  check(pageLimit, Number);
  if(isAbroad){
    return Viewspot.find({'country.zhName': zoneName}, {sort: {hotness: -1}, limit: parseInt(pageLimit), fields: {zhName: 1}});
  } else {
    return Viewspot.find({'locList.zhName': zoneName}, {sort: {hotness: -1}, limit: parseInt(pageLimit), fields: {zhName: 1}});
  }
});

Meteor.publish('vsDetail', function(mid) {
  check(mid, String);
  return Viewspot.find({'_id': new Mongo.ObjectID(mid)});
});

Viewspot.allow({
  update: function () {
    return false;
  }
});