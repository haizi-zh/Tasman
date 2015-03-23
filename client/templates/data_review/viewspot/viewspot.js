ViewSpot = new Mongo.Collection('ViewSpot');
ViewSpot.initEasySearch('zhName', {
  'limit' : 5,
  'use' : 'mongo-db'
});

Template.reviewViewspot.helpers({
  vsDetail: function() {
    var currentVsId = Session.get('currentID');
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
      Session.set('currentID', mid);
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
    $(e.target).siblings().removeClass('active');
    $(e.target).addClass("active");
    Session.set('currentVsId', mid);
    Meteor.subscribe("vsDetail", mid);
  },

  "click .navi-tabs": function(e) {
    console.log(e.target);
    var par = $(e.target).parent(),
      clsName = par.attr('class');
    par.addClass("active");
    par.siblings().removeClass("active");


    console.log(clsName);
    $('div.' + clsName).removeClass('hidden').addClass("show");
    $('div.' + clsName).siblings().removeClass('show').addClass("hidden");
  }
});


isSubmitted = function(){
  return Session.get('submitted');
}
