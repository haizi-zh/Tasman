var mongoPoiUrl = mongoUrlGen(dbAuth.poi.db, dbAuth.poi.username, dbAuth.poi.password, dbAuth.poi.host, dbAuth.poi.port);

var poi = new MongoInternals.RemoteCollectionDriver(mongoPoiUrl);

Shopping = new Mongo.Collection("Shopping", { _driver: poi });

// 搜索设置？？？
Shopping.initEasySearch(['zhName', '_id'], {
  'limit': 5,
  'use': 'mongo-db'
});

Meteor.publish('shoppings', function(isAbroad, zoneName, pageLimit) {
  check(isAbroad, Boolean);
  check(zoneName, String);
  check(pageLimit, Number);
  if(isAbroad) {
    return Shopping.find({'country.zhName': zoneName}, {sort: {hotness: -1}, limit: parseInt(pageLimit), fields: {country: 1, zhName: 1}});
  } else {
    return Shopping.find({'locality.zhName': zoneName}, {sort: {hotness: -1}, limit: parseInt(pageLimit), fields: {locality: 1, zhName: 1}});
  }
});

Meteor.publish('shoppingDetail', function(mid) {
  check(mid, String);
  return Shopping.find({'_id': new Mongo.ObjectID(mid)});
});

Shopping.allow({
  update: function () {
    return false;
  }
});