ViewSpot = new Mongo.Collection('ViewSpot');
ViewSpot.initEasySearch('zhName', {
  'limit': 5,
  'use': 'mongo-db'
});

Template.reviewViewspot.helpers({
  vsDetail: function() {
    var mid = Session.get('currentVsId')
    var detailInfo = ViewSpot.findOne({
      '_id': new Mongo.ObjectID(mid)
    });
    var vsDetail = [];
    review('ViewSpot', detailInfo, vsDetail);
    createOriginTextMD5(vsDetail);
    return vsDetail;
  }
});

Template.reviewViewspot.events({
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

    Meteor.subscribe("vsDetail", mid);
    initOriginMD5Session();
    initOplogSession();


    /************* for pictures by lyn ************/
    Meteor.subscribe("Images", mid);
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
    Blaze.renderWithData(Template.pictures, {imageList:images}, $('div.pic')[0]);
    /************* for pictures by lyn ************/

  },
});


createOriginTextMD5 = function(arrayData) {
  var tempObj = {};
  for (var i in arrayData) {
    var temp = arrayData[i];
    tempObj[temp.keyChain] = cmsMd5(temp.value);
  }
  Session.set('originMD5', tempObj);
};

cmsMd5 = function(string) {
  return CryptoJS.MD5(string).toString();
};

initOplogSession = function() {
  Session.set('oplog', {});
};

initOriginMD5Session = function() {
  Session.set('originMD5', {});
};


// 递归实现自动render模版，
/**
@params: {object} items
@params: {Number} index 数组字段的元素索引
*/
organizeReviewData = function(items, tabName, data, outPutData, keyChain, index) {
  var inheritKey = keyChain || '';
  var keys = _.keys(items); // 当前dom要展示的数据的key
  for (var i in keys) {
    var key = keys[i];
    var zhLabel = items[key][itemIndex.zhDesc];
    var dataType = items[key][itemIndex.dataType];
    var tplData = {};
    if (dataType === itemDataType.string || dataType === itemDataType.int) {
      var newKey = inheritKey ? (inheritKey + '-' + key) : key;
      tplData = {
          'zhLabel': zhLabel,
          'keyChain': index ? newKey + '-' + (index -1) : newKey,
          'value': data[key],
          'tabName': {},
          'index': index,
          'richEditor': items[key][itemIndex.richEditor]
        }
        // 放入到特定的Tab中
      tplData.tabName[tabName] = true;
      outPutData.push(tplData);
    }
    if (dataType === itemDataType.obj_array) {
      var tempData = data[key]; //递归使用的数据
      var tempItems = items[key][itemIndex.childInfo];
      var tempIndex = 0;
      for (var i in tempData) {
        var element = tempData[i];
        tempIndex = tempIndex + 1;
        organizeReviewData(tempItems, tabName, element, outPutData, key, tempIndex);
      }
    }
    // TODO 实现更多的规则
  }
};


review = function(type, data, outPutData) {
  var itemsForReview = reviewItems[type];
  var classify = _.keys(itemsForReview);
  for (var index in classify) { // 选择dom区域
    var tabName = classify[index];
    var items = itemsForReview[tabName]; // 当前dom要展示的数据
    organizeReviewData(items, tabName, data, outPutData);
  }
};
