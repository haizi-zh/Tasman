Locality = new Mongo.Collection('Locality');
Images = new Mongo.Collection('Images');

Locality.initEasySearch('zhName', {
  'limit': 5,
  'use': 'mongo-db'
});


Template.reviewCity.helpers({
  cityDetails: function() {
    var mid = Session.get('currentCityId');
    var detailInfo = Locality.findOne({
      '_id': new Mongo.ObjectID(mid)
    });
    var vsDetail = [];
    review('Locality', detailInfo, vsDetail);
    createOriginTextMD5(vsDetail);
    return vsDetail;
  },

  imageList: function() {
    log('rerun------------');
    var mid = Session.get('currentCityId');
    var imageList = Images.find({
      'itemIds': new Mongo.ObjectID(mid)
    }).fetch();
    var image,
        images = [];
    for (var i = 0;i < imageList.length;i++){
      image = {
        id: imageList[i]._id._str,
        url: pictures_host + imageList[i].key,
        index: i
      }
      images.push(image);
    }
    $('div.pic').empty();
    log(images);
    return images;
  }
});

Template.reviewCity.events({
  "click .city-name": function(e) {
    var mid = $(e.target).attr('id');
    // 重复点击
    if (mid === Session.get('currentCityId')) {
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
    Session.set('currentCityId', mid);
    $(e.target).siblings().removeClass('active');
    $(e.target).addClass("active");
    Meteor.subscribe("cityDetail", mid);
    initOriginMD5Session();
    initOplogSession();
    // $('div.basic-info').trigger('basic');
    /************* for pictures by lyn ************/
    Meteor.subscribe("Images", mid);
    // var imageList = Images.find({
    //   'itemIds': new Mongo.ObjectID(mid)
    // }).fetch();
    // var image,
    //     images = [];
    // for (var i = 0;i < imageList.length;i++){
    //   image = {
    //     id: imageList[i]._id._str,
    //     url: pictures_host + imageList[i].key,
    //     index: i
    //   }
    //   images.push(image);
    // }
    // $('div.pic').empty();
    // log(images)
    // Blaze.renderWithData(Template.pictures, {imageList:images}, $('div.pic')[0]);
    /************* for pictures by lyn ************/
  },
});