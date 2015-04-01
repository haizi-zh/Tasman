Template.admin.helpers({

});

Template.admin.events({

});


Template.rightOptions.onRendered(function() {

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