
Meteor.publish('restaurants', function(isAbroad, zoneName, pageLimit) {
  check(isAbroad, Boolean);
  check(zoneName, String);
  check(pageLimit, Number);
  if(isAbroad) {
    return Restaurant.find({'country.zhName': zoneName}, {sort: {hotness: -1}, limit: parseInt(pageLimit), fields: {country: 1, zhName: 1}});
  } else {
    return Restaurant.find({'locality.zhName': zoneName}, {sort: {hotness: -1}, limit: parseInt(pageLimit), fields: {locality: 1, zhName: 1}});
  }
});

Meteor.publish('restaurantDetail', function(mid) {
  check(mid, String);
  return Restaurant.find({'_id': new Mongo.ObjectID(mid)});
});

Restaurant.allow({
  update: function () {
    return false;
  }
});