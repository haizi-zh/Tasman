var helpers = {
  hotelDetail: function() {
    var mid = Session.get('currentHotelId');
    var detailInfo = storageEngine.snapshot('poi.Hotel', new Mongo.ObjectID(mid));
    var vsDetail = [];
    review('Hotel', detailInfo, vsDetail);
    createOriginTextMD5(vsDetail);
    return vsDetail;
  }
};

var events = {
  "click .city-name": function(e) {
    var mid = $(e.target).attr('id');
    // 重复点击
    if (mid === Session.get('currentHotelId')) {
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
    Session.set('currentHotelId', mid);
    $(e.target).siblings().removeClass('active');
    $(e.target).addClass("active");
    Meteor.subscribe('oplog', 'poi.Hotel', new Mongo.ObjectID(mid), 0);
    Meteor.subscribe("hotelDetail", mid);
    initOriginMD5Session();
    initOplogSession();
    Meteor.subscribe('Images', mid);
  },
};

Template.reviewHotel.helpers(helpers);
Template.reviewHotel.events(events);

Template.receiveHotel.helpers(helpers);
Template.receiveHotel.events(events);