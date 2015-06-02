Template.deleteDayPopup.events({
  'click .deleteNo': function(event){
    $('.delete-day-popup').remove();
  },
  'click .deleteYes': function(event){
    // 删除某一天
    var index = parseInt($(event.target).attr("day-index"));
    Meteor.cmsPlan.deleteOneDay(index);
    $('.delete-day-popup').remove();
    $($('.day-navi-element-container')[Meteor.cmsPlan.getActiveDay() - 1]).trigger("click");
  }
});
