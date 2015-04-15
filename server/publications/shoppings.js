
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