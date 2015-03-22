var mongoPoiUrl = mongoUrlGen(dbAuth.poi.db, dbAuth.poi.username, dbAuth.poi.password, dbAuth.poi.host, dbAuth.poi.port);

var poi = new MongoInternals.RemoteCollectionDriver(mongoPoiUrl);

ViewSpot = new Mongo.Collection("ViewSpot", { _driver: poi });

Meteor.publish('vs', function(isAbroad, zoneName, pageLimit) {
  check(isAbroad, Boolean);
  check(zoneName, String);
  check(pageLimit, Number);
  if(isAbroad) {
    return ViewSpot.find({'country.zhName': zoneName}, {sort: {hotness: -1}, limit: parseInt(pageLimit), fields: {country: 1, zhName: 1}});
  } else {
    return ViewSpot.find({'locList.zhName': zoneName}, {sort: {hotness: -1}, limit: parseInt(pageLimit), fields: {locList: 1, zhName: 1}});
  }
});

Meteor.publish('vsDetail', function(mid) {
  check(mid, String);
  return ViewSpot.find({'_id': new Mongo.ObjectID(mid)});
});

ViewSpot.allow({
  update: function () {
    return false;
  }
});