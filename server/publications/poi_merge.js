Meteor.publish('poiMergedItems', function() {
  return PoiMergeInfo.find({});
});