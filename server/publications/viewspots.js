
Meteor.publish('viewspot', function(isAbroad, zoneName, pageLimit) {
  check(isAbroad, Boolean);
  check(zoneName, String);
  check(pageLimit, Number);
  if(isAbroad) {
    return ViewSpot.find({'country.zhName': zoneName}, {sort: {hotness: -1}, limit: parseInt(pageLimit), fields: {country: 1, zhName: 1}});
  } else {
    return ViewSpot.find({'locList.zhName': zoneName}, {sort: {hotness: -1}, limit: parseInt(pageLimit), fields: {locList: 1, zhName: 1}});
  }
});

Meteor.publish('viewspotDetail', function(mid) {
  check(mid, String);
  return ViewSpot.find({'_id': new Mongo.ObjectID(mid)});
});


Meteor.publish('viewspotDetails', function(vIdList) {
  check(vIdList, Array);
  if(vIdList.length !== 0) {
    var ids = [];
    vIdList.map(function(vid){ids.push(new Mongo.ObjectID(vid))});
    return ViewSpot.find({'_id': {'$in': ids}});
  }
});


Meteor.publish('ViewSpot_Cmp', function(items) {
  check(items, Array);
  if(items.length !== 0) {
    var ids = [];
    items.map(function(item){ids.push(new Mongo.ObjectID(item))});
    return ViewSpot.find({'_id': {'$in': ids}});
  }
});

ViewSpot.allow({
  update: function () {
    return false;
  }
});