var mongoPoiUrl = mongoUrlGen(dbAuth.poi.db, dbAuth.poi.username, dbAuth.poi.password, dbAuth.poi.host, dbAuth.poi.port);

var poi = new MongoInternals.RemoteCollectionDriver(mongoPoiUrl);

Hotel = new Mongo.Collection("Hotel", { _driver: poi });

Hotel.initEasySearch(['zhName', '_id'], {
  'limit': 5,
  'use': 'mongo-db'
});

Meteor.publish('hotels', function(isAbroad, zoneName, pageLimit) {
  check(isAbroad, Boolean);
  check(zoneName, String);
  check(pageLimit, Number);
  if(isAbroad) {
    return Hotel.find({'country.zhName': zoneName}, {sort: {hotness: -1}, limit: parseInt(pageLimit), fields: {country: 1, zhName: 1}});
  } else {
    return Hotel.find({'locality.zhName': zoneName}, {sort: {hotness: -1}, limit: parseInt(pageLimit), fields: {locality: 1, zhName: 1}});
  }
});

Meteor.publish('hotelDetail', function(mid) {
  check(mid, String);
  return Hotel.find({'_id': new Mongo.ObjectID(mid)});
});

Hotel.allow({
  update: function () {
    return false;
  }
});