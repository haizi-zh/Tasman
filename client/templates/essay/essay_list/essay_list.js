// Template.essayList.helpers({
//  'essayList': function(){
//    Meteor.subscribe('essayList', 10);
//    return Essay.find({}).fetch();
//  }
// })

Template.essayList.events({
  // 点击进入编辑页面
  'click .essay-frame': function(){
    Router.go('/essay/edit/' + this._id._str);
  },

  // 新建文章的跳转
  'click .essay-create': function(){
    var uid = uuid.v1();
    console.log(uid);
    Router.go('/essay/edit/' + uid);
  }
})