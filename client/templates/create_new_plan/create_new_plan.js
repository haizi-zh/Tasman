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
    var temp = Meteor.cmsPlan.getPoiItems();
    temp.map(function(val, idx){
      val.picKey = val.images && val.images.length && val.images[0].key;
    });
    return temp;
  },
  // 显示天数导航
  'planDetail': function() {
    return Meteor.cmsPlan.getPlan();
  },
  // 显示某一天的POI
  'curDayInfo': function() {
    var res = Meteor.cmsPlan.getCurDayInfo();
    res.pois.length ? res.isEmpty = false : res.isEmpty = true;
    return res;
  },
  'pageNavi': function() {
    return Meteor.cmsPlan.page.getPageNavi();
  },
  'title': function() {
    return Meteor.cmsPlan.getPlanTitle();
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
    var dayIndex = parseInt($(event.target).attr('day-index'));
    Meteor.cmsPlan.setActiveDay(dayIndex);
    Meteor.setTimeout(enableSortable, 1000);
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
          picKey = $(event.target).attr('poi-picKey'),
          poiInfo = {'id': poiId, 'name': poiName, 'picKey': picKey};

      Meteor.cmsPlan.addPoi(poiInfo);
    }else {
      var temp = Meteor.cmsPlan.getPoiById(poiId);
      alert('[' + Meteor.getColZhName() + "] : [" + temp.name + '] 已经加入到[第' + temp.dayIndex + ']天');
    }
    Meteor.setTimeout(enableSortable, 1000);
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
  },
  'blur #one-day-tips': function(event) {
    var curDay = Meteor.cmsPlan.getActiveDay();
    var text = $(event.target).val();
    Meteor.cmsPlan.saveTips(curDay, $.trim(text));
  },
  'blur .plan-name': function(event) {
    event.stopPropagation();
    event.preventDefault();
    var text = $(event.target).val();
    Meteor.cmsPlan.savePlanTitle(text);
  },
  'click .save-plan': function(event) {
    event.preventDefault();
    Meteor.cmsPlan.savePlan();
  }
});


// 可拖动排序
function enableSortable() {
  // 注销上次绑定
  $('.poi-zoom').unbind('sortupdate');
  // 解除上次排序
  $('.poi-zoom').sortable('destroy');
  // 绑定更新信息
  $('.poi-zoom').sortable().bind('sortupdate', function() {
      //Triggered when the user stopped sorting and the DOM position has changed.
      Meteor.setTimeout(resort, 1000);
      Meteor.setTimeout(enableSortable, 1500);
  });
}

function resort() {
  var dayIndex = Meteor.cmsPlan.getActiveDay(),
      from,
      to,
      flag = [];
  $('.select-poi-info-container').each(function(idx, val) {
    var index = parseInt($(val).attr('data-index'));
    flag.push(index + 1);
  });
  if(!flag.length) return;
  if(flag[0] === 1) {
    for(var i = 0, len = flag.length; i < len; i++) {
      if(i + 1 !== flag[i]) {
        from = flag[i];
        to = i + 1;
        break;
      }
    }
  }else if(flag[0] === 2) {
    from = 1;
    for(var i = 0, len = flag.length; i < len; i++) {
      if(i + 2 !== flag[i]) {
        to = i + 1;
        break;
      }
    }
  }else {
    from = flag[0];
    to = 1;
  }
  console.log(flag);
  console.log('dayIndex:' + dayIndex);
  console.log('from:' + from);
  console.log('to:' + to);
  Meteor.cmsPlan.resort(dayIndex, from, to);

}
