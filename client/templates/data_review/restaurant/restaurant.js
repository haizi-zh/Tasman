var helpers = {
  restaurantDetail: function() {
    var mid = Session.get('currentRestaurantId');
    // var detailInfo = Restaurant.findOne({
    //   '_id': new Mongo.ObjectID(mid)
    // });
    var detailInfo = storageEngine.snapshot('k2.Restaurant', new Mongo.ObjectID(mid));
    var vsDetail = [];
    review('Restaurant', detailInfo, vsDetail);
    createOriginTextMD5(vsDetail);
    return vsDetail;
  }
};

var events = {
  "click .city-name": function(e) {
    var mid = $(e.target).attr('id');
    // 重复点击
    if (mid === Session.get('currentRestaurantId')) {
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
    Session.set('currentRestaurantId', mid);
    $(e.target).siblings().removeClass('active');
    $(e.target).addClass("active");
    Meteor.subscribe('oplog', 'k2.Restaurant', new Mongo.ObjectID(mid), 0);
    Meteor.subscribe("restaurantDetail", mid);
    initOriginMD5Session();
    initOplogSession();
    Meteor.subscribe('Images', mid);
  },
};
Template.reviewRestaurant.helpers(helpers);
Template.reviewRestaurant.events(events);

Template.receiveRestaurant.helpers(helpers);
Template.receiveRestaurant.events(events);