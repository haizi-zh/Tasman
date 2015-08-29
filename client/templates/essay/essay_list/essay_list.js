// Template.essayList.helpers({
//  'essayList': function(){
//    Meteor.subscribe('essayList', 10);
//    return Essay.find({}).fetch();
//  }
// })

Template.essayList.events({
  // 点击进入编辑页面
  'click .essay-frame': function(){
    // 为了解决UE 没法重新刷新的问题
    // Router.go('/essay/edit/' + this.uuid);
    window.open('/essay/edit/' + this.uuid);
  },

  // 新建文章的跳转
  'click .essay-create': function(){
    var uid = uuid.v1();
    // Router.go('/essay/edit/' + uid);
    window.open('/essay/edit/' + uid);
  }
})