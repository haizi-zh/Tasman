
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