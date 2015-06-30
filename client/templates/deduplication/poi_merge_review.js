Template.poiMergeReview.onRendered(function () {

});

PoiMergeInfo = new Mongo.Collection('PoiMergeInfo');

Template.poiMergeReview.helpers({
  'mergedItems': function() {
    return PoiMergeInfo.find({});
  }
});