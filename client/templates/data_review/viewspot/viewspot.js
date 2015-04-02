ViewSpot = new Mongo.Collection('ViewSpot');
ViewSpot.initEasySearch('zhName', {
  'limit' : 5,
  'use' : 'mongo-db'
});

Template.reviewViewspot.helpers({
  vsDetail: function() {
    var currentVsId = Session.get('currentVsId');
    if (currentVsId == undefined) {
      return;
    }
    var detailInfo = ViewSpot.findOne({
      '_id': new Mongo.ObjectID(currentVsId)
    });
    //createOriginTextMD5('ViewSpot', detailInfo);
    //log(CryptoJS.MD5(detailInfo.desc).toString());
    return detailInfo;
  }
});

Template.reviewViewspot.events({
  "click .city-name": function(e) {
    // TODO 通过判断键位的设置来判断是否修改，未修改，可以自由切换

    // 重复点击
    var mid = $(e.target).attr('id');
    if (mid === Session.get('currentVsId')) {
      return;
    }

    // 是否提交
    if (!Session.get('submitted')) {
      var res = confirm('尚未保存, 是否放弃本次编辑?');
      if(!res){
        return;
      }
    }

    Session.set('submitted', false);
    Meteor.subscribe("vsDetail", mid);
    Session.set('currentVsId', mid);

    $(e.target).siblings().removeClass('active');
    $(e.target).addClass("active");
  },
});


isSubmitted = function() {
  return Session.get('submitted');
}

createOriginTextMD5 = function(type, data) {
  check(type, String);
  check(data, Object);
  if(_.keys(reviewItems).indexOf(type) === -1) {
    return ;
  }
  var tempArr = [];
  reviewItems[type].map(function(x){tempArr.push({x: CryptoJS.MD5(data[x]).toString()})});
  console.log(tempArr);
  Session.set('oriTextMD5', tempArr);
};
