
Meteor.publish('localities', function(isAbroad, pageLimit) {
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