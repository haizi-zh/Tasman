// Meteor.publish('poiMergedItems', function() {
//   return PoiMergeInfo.find({});
// });

Meteor.publish('getPoiMergedItemById', function(id) {
  check(id, String);
  return PoiMergeInfo.find({'_id': id});
});