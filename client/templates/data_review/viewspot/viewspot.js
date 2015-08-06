var helpers = {
  vsDetail: function() {
    var mid = Session.get('currentVsId')
    // var detailInfo = ViewSpot.findOne({
    //   '_id': new Mongo.ObjectID(mid)
    // });

    var detailInfo = storageEngine.snapshot('poi.ViewSpot', new Mongo.ObjectID(mid));
    // var detailInfo = storageEngine.snapshot('k2.ViewSpot', new Mongo.ObjectID(mid));
    var vsDetail = [];
    review('ViewSpot', detailInfo, vsDetail);
    createOriginTextMD5(vsDetail);
    return vsDetail;
  },
};

var events = {
  "click .city-name": function(e) {
    var mid = $(e.target).attr('id');
    // 重复点击
    if (mid === Session.get('currentVsId')) {
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
    Session.set('currentVsId', mid);
    $(e.target).siblings().removeClass('active');
    $(e.target).addClass("active");
    // Meteor.subscribe('oplog', 'k2.ViewSpot', new Mongo.ObjectID(mid), 0);
    Meteor.subscribe('oplog', 'poi.ViewSpot', new Mongo.ObjectID(mid), 0);

    Meteor.subscribe("viewspotDetail", mid);
    initOriginMD5Session();
    initOplogSession();

    Meteor.subscribe("Images", mid);
  },
};

Template.reviewViewSpot.helpers(helpers);
Template.reviewViewSpot.events(events);

Template.receiveViewSpot.helpers(helpers);
Template.receiveViewSpot.events(events);
