Template.poiMergeReview.onRendered(function () {

});

PoiMergeInfo = new Mongo.Collection('PoiMergeInfo');

Template.poiMergeReview.helpers({
  'mergedItems': function() {
    return PoiMergeInfo.find({});
  }
});

Template.poiMergeReview.events({
  'click .pmr-merged-poi-item': function (e) {
    // Session.setPersistent('compareItems', this.compareItems);
    Router.go('compare', {'id': this._id});
  }
});