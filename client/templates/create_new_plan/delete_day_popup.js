Template.deleteDayPopup.events({
  'click .deleteNo': function(event){
    $('.delete-day-popup').remove();
  },
  'click .deleteYes': function(event){
    // 删除某一天
    var index = parseInt($(event.target).attr("day-index")),
        tempSession = Session.get('planDetail');
    tempSession.map(function(temp){
      if(temp['dayIndex'] > index) {
        temp['dayIndex'] -= 1;
      }
    });
    tempSession.splice(index - 1, 1);
    Session.set('planDetail', tempSession);
    $('.delete-day-popup').remove();

    // 保留之前的激活天
    var curDay = Session.get('planActiveDay'),
        newDayActive = 0;
    if(index >= curDay){
      newDayActive = curDay;
    }else {
      newDayActive = curDay - 1;
    }
    $($('.day-navi-element-container')[newDayActive - 1]).trigger("click");
  }
});

Template.dayNaviElement.onRendered(function(){

});