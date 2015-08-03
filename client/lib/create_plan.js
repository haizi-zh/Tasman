// 封装了新建计划的逻辑
CreatePlan = function() {
  var that = this,
      activePoiType = new ReactiveVar('ViewSpot', function(o, n){return o === n;}),
      activeDay = new ReactiveVar(0, function(o, n){return o === n;}),
      planDetail = new ReactiveVar([]),
      activeCity = new ReactiveVar('', function(o, n){return o === n;}),
      sort = new ReactiveVar({}),
      options = new ReactiveVar({}),
      keyword = new ReactiveVar('', function(o, n){return o === n;}),
      totalPage = new ReactiveVar(0, function(o, n){return o === n;}),
      curPage = new ReactiveVar(1, function(o, n){return o === n;}),
      curSearchPage = new ReactiveVar(1, function(o, n){return o === n;}),
      totalItems = new ReactiveVar(0, function(o, n){return o === n;}),
      pageSize = new ReactiveVar(10, function(o, n){return o === n;}),
      poiItems = new ReactiveVar([]),
      title = new ReactiveVar('', function(o, n){return o === n;}),

      sub = {'result': {}, 'count': {}},
      poiIds = {},
      plan = {},
      isNew = true,
      planId,
      autorun,
      query;

  var ItemCount = new Mongo.Collection('ItemCount');


  plan.init = function() {
    activePoiType.set('ViewSpot');
    planDetail.set([]);
    plan.addOneDay();
    activeDay.set(1);
    poiIds = {};

    planId = Router.current().params['planId'];
    if(planId) {
      plan.getExistedPlanById(planId);
    }else{
      Meteor.call('createNewPlan', {'editTime': Date.now()}, function(err, res){
        if(!err && res.code === 0){
          planId = res._id._str;
        }
      });
    }

    if(!autorun) {
      autorun = Tracker.autorun(function(){
        plan.subscribe();
      });
    }
  };

  // 订阅逻辑
  plan.subscribe = function() {
    var poiType = activePoiType.get(),
        locName = activeCity.get(),
        limit = pageSize.get(),
        skip = plan.page.getOffsetStart(),
        options = {'skip': skip, 'limit': limit},
        query = {};

    // 搜索部分
    var kw = keyword.get();
    if($.trim(kw) !== '') {
      var regexContent = '^' + kw,
        re = new RegExp(regexContent);
      query = {'alias': {'$regex': kw}};
      options.skip = (curSearchPage.get() - 1) * pageSize.get();  // 去除上次的skip
    }

    sub.result = Meteor.subscribe('createPlanResult', poiType, locName, query, options);
    sub.count = Meteor.subscribe('createPlanCount', poiType, locName, query, options);

    if(sub.result.ready()) {
      plan.setPoiItems(getMongoCol(poiType).find({}).fetch());
    }
    if(sub.count.ready()) {
      plan.page.setTotalItems(ItemCount.findOne({}).count);
    }
  };

  plan.savePlanTitle = function(text) {
    title.set(text);
  };
  plan.getPlanTitle = function(text) {
    return title.get();
  };

  plan.getPoiItems = function() {
    return poiItems.get();
  };
  plan.setPoiItems = function(res) {
      poiItems.set(res);
  };
  plan.getPlan = function() {
    return planDetail.get();
  };
  plan.setPlan = function(arr) {
    return planDetail.set(arr);
  };
  plan.getCurDayInfo = function() {
    return planDetail.get()[activeDay.get() - 1];
  };
  plan.saveTips = function(dayIndex, content) {
    var temp = planDetail.get();
    temp[dayIndex - 1].tips = content;
    planDetail.set(temp);
  };
  plan.getActivePoiType = function() {
    return activePoiType.get();
  };
  plan.setActivePoiType = function(type) {
    activePoiType.set(type);
    plan.page.moveTo(1);
    plan.search.clear();
    $('.poi-search-clear').trigger("click");
  };
  plan.setActiveDay = function(dayIndex) {
    activeDay.set(dayIndex);
  };
  plan.getActiveDay = function() {
    return activeDay.get();
  };
  plan.addPoiId = function(id, info) {
    poiIds[id] = info;
  };
  plan.deletePoiId = function(id) {
    poiIds[id] && delete poiIds[id];
  };
  plan.getPoiById = function(id) {
    return poiIds[id];
  };
  plan.hasPoi = function(id) {
    return poiIds[id];
  };
  plan.getAllPoiId = function() {
    return poiIds;
  };
  plan.dayCount = function() {
    return planDetail.get().length;
  };
  plan.addOneDay = function() {
    var dayIndex = plan.dayCount() + 1,
        tempPlan = planDetail.get();
    tempPlan.push({'dayIndex': dayIndex, 'pois': []});
    planDetail.set(tempPlan);
  };
  plan.deleteOneDay = function(dayIndex) {
    var tempPlan = planDetail.get();
    // 从id中删除
    tempPlan[dayIndex - 1].pois.map(function(ele){
      delete poiIds[ele.id];
    });
    tempPlan.splice(dayIndex - 1, 1);
    planDetail.set(tempPlan);
    plan.reDayIndex();
    plan.modActDayAfDelOneDay(dayIndex);

  };
  plan.reDayIndex = function() {
    var tempPlan = planDetail.get(),
        tempIndex = 1;
    tempPlan.map(function(day){
      day.dayIndex = tempIndex;
      tempIndex += 1;
    });
    planDetail.set(tempPlan);
  };
  plan.modActDayAfDelOneDay = function(delDayIndex) {
    var curActiveDay = activeDay.get();
    delDayIndex === curActiveDay ? activeDay.set(1) : (delDayIndex < curActiveDay ? activeDay.set(curActiveDay - 1) : '');
  };
  plan.poiCountOneDay = function(dayIndex) {
    return planDetail.get()[dayIndex - 1].pois.length;
  };
  plan.addPoi = function(poiInfo) {
    var dayIndex = activeDay.get(),
        curDayPoiCnt = plan.poiCountOneDay(activeDay.get()),
        type = activePoiType.get(),
        poiContent = _.extend(poiInfo, {'dayIndex': dayIndex, 'index': curDayPoiCnt, 'type': type}),
        tempPlan = planDetail.get();
    tempPlan[dayIndex - 1].pois.push(poiContent);
    planDetail.set(tempPlan);
    plan.addPoiId(poiInfo.id, poiContent);
  };
  plan.deletePoi = function(dayIndex, index) {
    var tempPlan = planDetail.get(),
        tempIndex = 0;
    plan.deletePoiId(tempPlan[dayIndex - 1].pois[index].id);
    tempPlan[dayIndex - 1].pois.splice(index, 1);
    tempPlan[dayIndex - 1].pois.map(function(poi){ // 重排序
      poi.index = tempIndex;
      tempIndex += 1;
    });
    planDetail.set(tempPlan);
  };
  plan.resort = function(dayIndex, from, to) {
    var tempPlanDetail = plan.getPlan(),
        tempDayObj = $.extend(true, {}, tempPlanDetail[dayIndex - 1]),
        tempDay = tempDayObj.pois,
        target = tempDay[from - 1];

    // 删除
    tempDay.splice(from - 1, 1);
    // 删除后重判断插入位置
    var insertLocationAfterDelete = to - 1;
    // 截成两段
    var childAfter = tempDay.slice(insertLocationAfterDelete);
    var childBefore = tempDay.slice(0, insertLocationAfterDelete);
    // 插入元素
    childBefore.push(target);
    // 重组
    tempDay = childBefore.concat(childAfter);
    // 更新index
    _.map(tempDay, function(val, key){
      val.index = key;
    });
    // 更新整体数据
    tempPlanDetail[dayIndex - 1].pois = tempDay;
    // plan.setPlan(tempPlanDetail);
    planDetail.set(tempPlanDetail);
  };

  plan.savePlan = function(id) {
    if(isNew) {
      // 全新的游记
      console.log('保存全新游记');
      plan.saveNewPlan();
    }else {
      // 保存至已有游记
      console.log('保存已有游记');
      plan.saveEditedPlan();
    }
  };

  /*
  * 保存到plan.Plan.CmsGenerated
  */
  plan.saveNewPlan = function() {
    var newPlan = {
      _id: planId,
      title: title.get(),
      locName: activeCity.get(),
      detail: planDetail.get(),
      author: Meteor.user().username
    };
    Meteor.call('saveNewPlan', newPlan, function(err, res){
      if(!err && res.code === 0) {
        alert('保存成功');
      }
    });
  };

  plan.saveEditedPlan = function() {
    var newPlan = {
      _id: planId,
      title: title.get(),
      locName: activeCity.get(),
      detail: planDetail.get(),
      author: Meteor.user().username
    };
    Meteor.call('saveEditedPlan', newPlan, function(err, res){
      if(!err && res.code === 0) {
        alert('保存成功');
      }
    });
  };

  plan.recievePlanData = function(planInfo) {
    // 设置计划是否为新, id, 标题继承自已有数据
    isNew = false;
    activeCity.set(planInfo.locName);
    title.set(planInfo.title);
    var rawData = planInfo.details,
        temp = [];

    rawData.map(function(ele, index) {
      var dayIndex = index + 1,
          poiInfo = ele.actv;
      if(dayIndex > temp.length) {
        temp.push({'dayIndex': dayIndex, 'pois': []});
        index = 0;
      }

      poiInfo.map(function(val, idx) {
        var index = temp[dayIndex - 1].pois.length;
        var info = {
          'id':       val.item._id._str,
          'dayIndex': dayIndex,
          'index':    index,
          'name':     val.item.zhName,
          'type':     val.type === 'vs' ? "ViewSpot" : ''
        };
        temp[dayIndex - 1].pois.push(info);
        plan.addPoiId(info['id'], info);  //加入到id中
      });

    });
    planDetail.set(temp);
  };

  plan.getExistedPlanById = function(id) {
    Meteor.call('getPlanById', id, function(err, res) {
      if(!err && res.code === 0) {
        console.log('输出获得的原始模板数据');
        plan.recievePlanData(res.data);
      }
    });
  };

  // 城市
  plan.locality = {
    'set': function(name) {
      activeCity.set(name);
      plan.page.moveTo(1);
    },
    'get': function() {
      return activeCity.get();
    }
  };

  // 搜索
  plan.search = {
    'getKeyWord': function() {
      return keyword.get();
    },
    'clear': function() {
      keyword.set('');
      curSearchPage.set(1);
    },
    'setKeyWord': function(kw) {
      keyword.set(kw);
    },
    'active': function() {
      // 激活搜索
    },
    'hasSearchText': function() {
      return keyword.get() !== '';
    }
  };

  // page
  plan.page = {
    'init': function() {
      // TODO
    },

    'setTotalItems': function(n) {
      totalItems.set(n);
      this.setPageCnt();
    },
    'getTotalItems': function() {
      return totalItems.get();
    },

    'getCurPage': function() {
      return curPage.get();
    },
    'setCurPage': function(n) {
      curPage.set(n);
    },

    'getPageCnt': function() {
      return totalPage.get();
    },
    'setPageCnt': function() {
      var total = Math.ceil(this.getTotalItems() / pageSize.get());
      totalPage.set(total);
    },

    'getPageSize': function() {
      return pageSize.get();
    },
    'setPageSize': function(n) {
      pageSize.set(n);
    },

    'hasNextPage': function() {
      if(this.getPageCnt() - this.getCurPage() < 1) {
        return false;
      }
      return true;
    },
    'hasPreviousPage': function() {
      if(this.getCurPage() !== 1) {
        return false;
      }
      return true;
    },

    'nextPage': function() {
      if(this.hasNextPage()) {
        this.setCurPage(this.getCurPage() + 1);
      }
    },
    'previousPage': function() {
      if(!this.hasPreviousPage()) {
        this.setCurPage(this.getCurPage() - 1);
      }
    },

    'checkValid': function(n) {
      if(typeof n === 'string') {
        console.log('请输入数字');
        return;
      }
      if(typeof n !== 'number' || n < 1 || n > this.getPageCnt()){
        return false;
      }
      return true;
    },

    'moveTo': function(n) {
      if(this.checkValid(n)) {
        if(!plan.search.hasSearchText()) {
          this.setCurPage(n);
        }else {
          curSearchPage.set(n);
        }
      }
    },

    'firstPage': function() {
      this.setCurPage(1);
    },
    'lastPage': function() {
      this.setCurPage(this.getPageCnt());
    },

    'getOffsetStart': function() {
      return (this.getCurPage() - 1) * this.getPageSize();
    },
    'getOffsetEnd': function() {
      var num = this.getCurPage() * this.getPageSize(),
          total = this.getTotalItems();
      return num > total ? total : num;
    },
    'getPageNavi': function() {
      var pages = [],
          pageCnt = this.getPageCnt(),
          pageSize = this.getPageSize(),
          currentPage = this.getCurPage();

      if(plan.search.hasSearchText()) {
        currentPage = curSearchPage.get();
      }

      var start, end;
      start = currentPage + 1 - Math.ceil(pageSize / 2);
      if(start < 1) {
        start = 1;
        end = pageSize;
      }
      end = currentPage + Math.ceil(pageSize / 2) < pageSize ? pageSize : currentPage + Math.ceil(pageSize / 2);
      if(end > pageCnt) {
        end = pageCnt;
      }
      for (var i = start; i <= end; i++) {
        var status = (currentPage === i) ? 'active' : '';
        pages.push({
          page: i,
          status: status
        });
      }
      return pages;
    }
  };

  return plan;
};

// 绑定
Meteor.cmsPlan = CreatePlan();
