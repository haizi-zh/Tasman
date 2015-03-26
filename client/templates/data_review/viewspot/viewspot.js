ViewSpot = new Mongo.Collection('ViewSpot');
ViewSpot.initEasySearch('zhName', {
  'limit' : 5,
  'use' : 'mongo-db'
});

Template.reviewViewspot.helpers({
  vsDetail: function() {
    var currentVsId = Session.get('currentID');
    console.log('hello ---');
    if (currentVsId == undefined) {
      return;
    }
    var detailInfo = ViewSpot.findOne({
      '_id': new Mongo.ObjectID(currentVsId)
    });
    return detailInfo;
  }
});

Template.reviewViewspot.events({
  "click .city-name": function(e) {
    // TODO 通过判断键位的设置来判断是否修改，未修改，可以自由切换

    // 重复点击
    var mid = $(e.target).attr('id');
    if (mid === Session.get('currentID')) {
      return;
    } else {
      // Session.set('currentID', mid);
    }

    // 是否提交
    if (!Session.get('submitted')) {
      var res = confirm('尚未保存, 是否放弃本次编辑?');
      if(res){
        Session.set('submitted', true);
      }else{
        return;
      }
    }
    Session.set('submitted', false);
    Meteor.subscribe("vsDetail", mid);
    $(e.target).siblings().removeClass('active');
    $(e.target).addClass("active");
    Session.set('currentID', mid);
    console.log(mid);
    console.log($(e.target).html());
  },
});


isSubmitted = function(){
  return Session.get('submitted');
}
