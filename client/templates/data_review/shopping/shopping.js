Shopping = new Mongo.Collection('Shopping');
Shopping.initEasySearch('zhName', {
  'limit' : 5,
  'use' : 'mongo-db'
});


Template.reviewShopping.helpers({
  shoppingDetail: function() {
    var mid = Session.get('currentShoppingId')
    var detailInfo = Shopping.findOne({
      '_id': new Mongo.ObjectID(mid)
    });
    var vsDetail = [];
    review('Shopping', detailInfo, vsDetail);
    createOriginTextMD5(vsDetail);
    return vsDetail;
  }
});


Template.reviewShopping.events({
  "click .city-name": function(e) {
    var mid = $(e.target).attr('id');
    // 重复点击
    if (mid === Session.get('currentShoppingId')) {
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
    Session.set('currentShoppingId', mid);
    $(e.target).siblings().removeClass('active');
    $(e.target).addClass("active");
    Meteor.subscribe("shoppingDetail", mid);
    initOriginMD5Session();
    initOplogSession();
    Meteor.subscribe('Images', mid);
  },
});