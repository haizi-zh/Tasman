Locality = new Mongo.Collection('Locality');
Images = new Mongo.Collection('Images');

Template.reviewCity.helpers({
  cityDetails: function() {
    var mid = Session.get('currentLocalityId');

    // var detailInfo = Locality.findOne({
    //   '_id': new Mongo.ObjectID(mid)
    // });
    var detailInfo = storageEngine.snapshot('geo.Locality', new Mongo.ObjectID(mid));
    var vsDetail = [];
    review('Locality', detailInfo, vsDetail);
    createOriginTextMD5(vsDetail);
    return vsDetail;
  },
});

Template.reviewCity.events({
  "click .city-name": function(e) {
    var mid = $(e.target).attr('id');
    // 重复点击
    if (mid === Session.get('currentLocalityId')) {
      return;
    }
    // 是否做了修改
    if (_.keys(Session.get('oplog')).length) {
      var res = confirm('已做修改，尚未提交，放弃本次修改?');
      if (!res) {
        // 不放弃修改
        return;
      }
    }
    Session.set('currentLocalityId', mid);
    $(e.target).siblings().removeClass('active');
    $(e.target).addClass("active");
    Meteor.subscribe("cityDetail", mid);
    initOriginMD5Session();
    initOplogSession();
    Meteor.subscribe('Images', mid);
  },
});