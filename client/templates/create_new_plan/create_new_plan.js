Template.createNewPlan.onRendered(function() {
  Meteor.cmsPlan.init();
  $('.day-navi-element-container').trigger("click")
});

Template.registerHelper('poiType', function() {
  return Meteor.cmsPlan.getActivePoiType();
});

Template.createNewPlan.helpers({
  // 需要展示的POI
  'poiItems': function() {
    return Meteor.cmsPlan.getPoiItems();
  },
  // 显示天数导航
  'planDetail': function() {
    return Meteor.cmsPlan.getPlan();
  },
  // 显示某一天的POI
  'poiDisplay': function() {
    return Meteor.cmsPlan.getCurDayInfo();
  },
  'pageNavi': function() {
    return Meteor.cmsPlan.page.getPageNavi();
  }
});

Template.createNewPlan.events({
  // 增加一天
  'click .btn-add-one-day': function(event) {
    event.preventDefault();
    Meteor.cmsPlan.addOneDay();
  },
  'mouseleave .day-navi-element-container': function(event) {
    event.preventDefault();
    $(event.target).find('.delete-one-day').addClass("hidden");
  },
  'mouseenter .day-navi-element-container, mouseenter .day-index': function(event) {
    event.preventDefault();
    $(event.target).find('.delete-one-day').removeClass('hidden');
  },
  // 点击某一天事件，修改了Session
  'click .day-navi-element-container': function(event) {
    event.stopPropagation();
    $(event.target).addClass("day-ative").siblings().removeClass("day-ative");
    var dayIndex = parseInt($(event.target).attr('day-index'))
    Meteor.cmsPlan.setActiveDay(dayIndex);

  },
  // 点击删除一天，会弹出确认窗口，删除逻辑在确认窗口中
  'click .delete-one-day': function(event) {
    event.stopPropagation();
    var dayIndex = $(event.target).parent().attr('day-index');
    var left = event.clientX - 50 + "px",
        top = event.clientY - 83 + "px";
    Blaze.renderWithData(Template.deleteDayPopup, {'dayIndex': dayIndex, 'left': left, 'top': top}, $(document.body)[0]);
  },
  // 添加POI带某一天的行程
  'click .add-poi-to-plan': function(event) {
    event.preventDefault();
    var poiId = $(event.target).attr('poi-id');
    if(!Meteor.cmsPlan.hasPoi(poiId)) {
      var poiName = $(event.target).attr('poi-name'),
          poiType = $(event.target).attr('poi-type'),
          poiInfo = {'id': poiId, 'name': poiName};
      Meteor.cmsPlan.addPoi(poiInfo);
    }else {
      var temp = Meteor.cmsPlan.getPoiById(poiId);
      alert('[' + Meteor.getColZhName() + "] : [" + temp.name + '] 已经加入到[第' + temp.dayIndex + ']天');
    }

  },
  'mouseenter .select-poi-name': function(event) {
    event.preventDefault();
    event.stopPropagation();
    $(event.target).find('.delete-one-poi').removeClass("hidden");
  },
  'mouseleave .select-poi-name': function(event) {
    event.preventDefault();
    event.stopPropagation();
    $(event.target).find('.delete-one-poi').addClass("hidden");
  },
  // 删除一个POI
  'click .delete-one-poi': function() {
    event.preventDefault();
    event.stopPropagation();
    var dayIndex = $(event.target).attr('day-index'),
        index = $(event.target).attr('data-index');
    Meteor.cmsPlan.deletePoi(dayIndex, index);
  },
  // 分页操作
  'click .fc-pager-page': function(event) {
    var pageIndex = $(event.target).attr('data-fc-pager-page');
    Meteor.cmsPlan.page.moveTo(parseInt(pageIndex));
  },
  'click .fc-pager-first': function(event) {
    Meteor.cmsPlan.page.firstPage();
  },
  'click .fc-pager-last': function(event) {
    Meteor.cmsPlan.page.lastPage();
  }
});
