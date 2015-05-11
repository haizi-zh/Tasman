

//TODO  根据targets订阅plans
Meteor.publish('plans', function(mid, pageLimit) {
  check(mid, String);
  check(pageLimit, Number);

  //TODO 作hotness的数据，按理说每个地方就几个好点的路线就好了！先精再全
  return Plan.find({'_id': new Mongo.ObjectID(mid)}, {sort: {hotness: -1}, limit: parseInt(pageLimit), fields: {targets: 1, zhName: 1}});
});

// Meteor.publish('plans', function(isAbroad, zoneName, pageLimit) {
//   check(isAbroad, Boolean);
//   check(zoneName, String);
//   check(pageLimit, Number);
//   if(isAbroad) {
//     return Shopping.find({'country.zhName': zoneName}, {sort: {hotness: -1}, limit: parseInt(pageLimit), fields: {country: 1, zhName: 1}});
//   } else {
//     return Shopping.find({'locality.zhName': zoneName}, {sort: {hotness: -1}, limit: parseInt(pageLimit), fields: {locality: 1, zhName: 1}});
//   }
// });

Meteor.publish('planDetail', function(mid) {
  check(mid, String);
  return Plan.find({'_id': new Mongo.ObjectID(mid)});
});

Plan.allow({
  update: function () {
    return false;
  }
});