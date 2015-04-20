var mongoGeoUrl = mongoUrlGen(dbAuth.geo.db, dbAuth.geo.username, dbAuth.geo.password, dbAuth.geo.host, dbAuth.geo.port);

var geo = new MongoInternals.RemoteCollectionDriver(mongoGeoUrl);

Locality = new Mongo.Collection("Locality", { _driver: geo });
// 搜索设置
Locality.initEasySearch(['zhName', '_id'], {
  'limit' : 5,
  'use' : 'mongo-db'
});

Meteor.publish('cities', function(isAbroad, pageLimit) {
  check(isAbroad, Boolean);
  check(pageLimit, Number);
  return Locality.find({'abroad': isAbroad}, {sort: {hotness: -1}, limit: parseInt(pageLimit), fields: {zhName: 1, abroad: 1, superAdm: 1}});
});

Meteor.publish('localityDetail', function(mid) {
  check(mid, String);
  return Locality.find({'_id': new Mongo.ObjectID(mid)});
});

Locality.allow({
  update: function () {
    return false;
  }
});