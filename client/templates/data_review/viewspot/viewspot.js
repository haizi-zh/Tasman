ViewSpot = new Mongo.Collection('ViewSpot');
ViewSpot.initEasySearch('zhName', {
  'limit': 5,
  'use': 'mongo-db'
});

Template.reviewViewspot.helpers({
  vsDetail: function() {
    
  }
});

Template.reviewViewspot.events({
  "click .city-name": function(e) {
    // TODO 通过判断键位的设置来判断是否修改，未修改，可以自由切换

    // 重复点击
    var mid = $(e.target).attr('id');
    if (mid === Session.get('currentVsId')) {
      return;
    }else{
      Session.set('currentVsId', mid);
    }

    // TODO 判断是否有改动
    if (!Session.get('submitted')) {
      // var res = confirm('尚未保存, 是否放弃本次编辑?');
      // if (!res) {
      //   return;
      // }
    }
    Session.set('submitted', false);

    $(e.target).siblings().removeClass('active');
    $(e.target).addClass("active");

    function display() {
      var detailInfo = ViewSpot.findOne({
        '_id': new Mongo.ObjectID(mid)
      });
      review('ViewSpot', detailInfo);
    }

    Session.set('oplog', {});

    if (Session.get('vsIds')[mid] !== true) {
      // 尚未订阅
      Meteor.subscribe("vsDetail", mid, display);
      var newSession = Session.get('vsIds');
      newSession[mid]= true;
      Session.set('vsIds', newSession);
    }else {
      // 已订阅
      display();
    }
  },
});


createOriginTextMD5 = function(type, data) {
  check(type, String);
  check(data, Object);
  if (_.keys(reviewItems).indexOf(type) === -1) {
    return;
  }
  var tempArr = [];
  reviewItems[type].map(function(x) {
    tempArr.push({
      x: CryptoJS.MD5(data[x]).toString()
    })
  });
  console.log(tempArr);
  Session.set('oriTextMD5', tempArr);
};

cmsMd5 = function(string) {
  return CryptoJS.MD5(string).toString();
}


// 递归实现自动render模版，
renderTplWithData = function(items, parentDom, data, keyChain){
  var inheritKey = keyChain || '';
  var keys = _.keys(items);     // 当前dom要展示的数据的key
  for (var i in keys) {
    var key = keys[i];
    var zhLabel = items[key][0];
    var dataType = items[key][1];
    var tplData = {};
    if (dataType === itemDataType.string || dataType === itemDataType.int) {
      tplData = {
        'zhLabel': zhLabel,
        'keyChain': inheritKey ? (inheritKey + '.' + key) : key,
        'value': data[key]
      }
      //Blaze.renderWithData(Template.stringTpl, tplData, parentDom);
      console.log('render done');
    }
    if(dataType === itemDataType.obj_array) {
      var tempData = data[key];  //递归使用的数据
      var tempItems = items[key][2];
      for (var i in tempData){
        var element = tempData[i];
        renderTplWithData(tempItems, parentDom, element, key);
      }
    }
    // TODO 实现更多的规则
  }
};


review = function(type, data) {
  var itemsForReview = reviewItems[type];
  var classify = _.keys(itemsForReview);
  for (var index in classify) {   // 选择dom区域
    var type = classify[index];
    var parentDom = $('div.' + type);
    parentDom.empty();  // 清空dom
    var items = itemsForReview[type];  // 当前dom要展示的数据
    renderTplWithData(items, parentDom[0], data);
  }
};