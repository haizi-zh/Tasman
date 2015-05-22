// Meteor.createPlan = function() {
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
      totalItems = new ReactiveVar(0, function(o, n){return o === n;}),
      pageSize = new ReactiveVar(10, function(o, n){return o === n;}),
      poiItems = new ReactiveVar([]),

      sub = {'result': {}, 'count': {}},
      poiIds = {},
      plan = {},
      autorun,
      query;

  var ItemCount = new Mongo.Collection('ItemCount');


  plan.init = function() {
    activePoiType.set('ViewSpot');
    planDetail.set([]);
    plan.addOneDay();
    activeDay.set(1);
    poiIds = {};

    if(!autorun) {
      autorun = Tracker.autorun(function(){
        plan.subscribe();
      });
    }
  };

  plan.subscribe = function() {
    var poiType = activePoiType.get(),
        locName = activeCity.get(),
        limit = pageSize.get(),
        skip = plan.page.getOffsetStart(),
        //query = {'targets': new Mongo.ObjectID(locId)},
        options = {'skip': skip, 'limit': limit};

    sub.result = Meteor.subscribe('createPlanResult', poiType, locName, options);
    sub.count = Meteor.subscribe('createPlanCount', poiType, locName, options);

    if(sub.result.ready()) {
      plan.setPoiItems(getMongoCol(poiType).find({}).fetch());
    }
    if(sub.count.ready()) {
      plan.page.setTotalItems(ItemCount.findOne({}).count);
    }
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
  plan.getCurDayInfo = function() {
    return planDetail.get()[activeDay.get() - 1].pois;
  };
  plan.getActivePoiType = function() {
    return activePoiType.get();
  };
  plan.setActivePoiType = function(type) {
    activePoiType.set(type);
    plan.page.moveTo(1);
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
    console.log(activeDay.get());
    var dayIndex = activeDay.get(),
        curDayPoiCnt = plan.poiCountOneDay(activeDay.get()),
        type = activePoiType.get(),
        poiContent = _.extend(poiInfo, {'dayIndex': dayIndex, 'index': curDayPoiCnt, 'type': type}),
        tempPlan = planDetail.get();
    console.log(dayIndex);
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
    },
    'active': function() {
      // 激活搜索
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
        this.setCurPage(n);
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
          currentPage = this.getCurPage(),
          pageCnt = this.getPageCnt(),
          pageSize = this.getPageSize();
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

Meteor.getColZhName = function(colName) {
  var type = colName || Meteor.cmsPlan.getActivePoiType(),
      text= '';
  switch(type.toLowerCase()){
    case 'viewspot': text = "景点";break;
    case 'restaurant': text = "美食";break;
    case 'shopping': text = "购物";break;
    case 'hotel': text = "酒店";break;
    case 'traffic': text = "交通";break;
    case 'collect': text = "收藏";break;
  }
  return text;
};
