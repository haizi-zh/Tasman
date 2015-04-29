Template.admin.helpers({

});

Template.admin.events({

});


Template.rightOptions.onRendered(function() {

});

Template.userRightElement.events({
  'click .delete-btn': function(e) {
    e.preventDefault();
    var uid = $(e.target).attr('id'),
        username = $(e.target).attr('data-username');
    if(confirm('是否删除用户：' + username + " ?")){
      Meteor.call('deleteUser', uid, function(err, res) {
        if(err) return;
        if(res && res.code === 0) {
          alert(username + ' 已经删除！');
        }else{
          alert(username + ' 删除失败！')
        }
      });
    }
  }
});


Template.rightOptions.events({
  'change .rightOptions': function(e, template) {
    var uid = Template.parentData()._id;
    var right = $(e.target).val();
    if (right !== 'empty'){
      Meteor.call('addUserRight', right, uid);
    }
  },
});


Template.rightElements.events({
  'click .selected_item': function(e) {
    var right = $(e.target).parent().attr('id');
    var uid = Template.parentData()._id;
    Meteor.call('removeUserRight', right, uid);
    // 清零
    $(e.target).parent().parent().parent().find('.rightOptions')[0].selectedIndex = 0;
  }
});