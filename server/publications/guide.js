
Meteor.publish('guideTemps', function(mid) {
  check(mid, String);
  return GuideTemplate.find({'locId': new Mongo.ObjectID(mid)});
});

Meteor.publish('guideDetail', function(mid) {
  check(mid, String);
  return GuideTemplate.find({'_id': new Mongo.ObjectID(mid)});
});

GuideTemplate.allow({
  update: function () {
    return false;
  }
});