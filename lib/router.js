Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading', // 等待数据时，显示的菊花
  notFoundTemplate: 'notFound',
  waitOn: function() {
    return [Meteor.subscribe('notifications'), Meteor.subscribe('userData')];
  }
});

// ------------------------爱走CMS-----------------------
// ------------------------爱走CMS-----------------------

///////////////////////// login and user admin /////////////////////////////////////////////
Router.route('/login', {
  name: 'login'
});

Router.route('/', {
  name: 'home',
  title: '首页'
});

Router.route('/register', {
  name: 'register'
});

Router.route('/forget-password', {
  name: 'forgetPassword'
});

Router.route('/deduplication/viewspot', {
  name: 'dedupViewspot',
  title: '景点去重',
  parent: 'home',
});


Router.route('/user-profile', {
  name: 'userProfile',
  title: '用户界面',
  parent: 'home',
  waitOn: function() {
    return [Meteor.subscribe('taskMessage'),]
  },
  data: function() {
    // var taskMessage = TaskHistory.find({});
    // return {
    //   'taskMessage': taskMessage
    // };
  }
});


Router.route('/reviewTemplate', {
  name: 'reviewTemplate',
  title: '复审游记',
  parent: 'home'
});


Router.route('/admin', {
  name: 'admin',
  title: '用户管理',
  parent: 'home',
  waitOn: function() {
    return Meteor.subscribe('allUsers');
  },
  data: function() {
    // var curUserId = new Mongo.ObjectID(Meteor.userId());
    return {
      users: Meteor.users.find()
    }
  }
});

Router.route('/accessDenied', {
  name: 'accessDenied'
});

Router.route('/searchResult', {
  name: 'searchResult',
  title: '搜索',
  parent: 'home'
});



Router.route('/editPlan/:planId', {
  name: 'editPlan',
  template: 'createNewPlan',
  title: '编辑游记规划',
  parent: 'home'
});

Router.route('/createNewPlan', {
  name: 'createPlan',
  template: 'createNewPlan',
  title: '新建游记规划',
  parent: 'home'
});

Router.route('/taskAssgin', {
  name: 'taskAssgin',
  template: 'taskAssignment',
  title: '任务分配',
  waitOn: function() {
    return Meteor.subscribe('editor');
  },
  parent: 'home',
  data: function() {
    return {
      'editor': Meteor.users.find({'rights': "editor"}, {fields: {'username': 1, '_id': 1, 'rights': 1}})
    }
  }
});

TaskRecieveBaseController = RouteController.extend({
  pageSize: 10,
  pageNaviSize: 7,
  waitOn: function () {
    return [Meteor.subscribe('recieveTask', this.params.taskId), ];
  },
  currentPage: function() {
    return this.params.query.page || 1;
  },
  skipNum: function() {
    return (this.currentPage() - 1) * this.pageSize;
  },
  option: function() {
    return {
      'skip': this.skipNum(),
      'limit': this.pageSize,
      'sort': {
        'hotnessTag': 1
      }
    };
  },
  curUrlRoute: function() {
    var typeIndex = -2,
        urlSplit = this.originalUrl.split('/'),
        type = urlSplit[urlSplit.length + typeIndex];
    return 'receive' + type;
  },
  query: function() {
    return {
      'taskId': new Mongo.ObjectID(this.params.taskId),
      'status': 'doing',
      'editorId': Meteor.userId()
    };
  },
  totalTask: function() {
    var query = this.query();
    return TaskPool.find(query).count();
  },
  completedTaskCnt: function() {
    var query = this.query();
    query = _.extend(query, {'editStatus': true});
    return TaskPool.find(query).count();
  },
  taskList: function() {
    var query = this.query();
    return TaskPool.find(query, this.option());
  },
  pageNavi: function() {
    var curPage = Number(this.currentPage()),
        pageNum = Math.ceil(this.totalTask() / this.pageSize),
        pages = [],
        taskId = this.params.taskId,
        routeName = this.curUrlRoute();

    var begin, end, temp = (Math.ceil(this.pageNaviSize / 2) - 1);
    if(pageNum <= this.pageNaviSize) {
      begin = 1;
      end = pageNum;
    }else if(curPage <= temp) {
      begin = 1;
      end = this.pageNaviSize;
    }else if(curPage > temp) {
      begin = curPage - temp;
      if(curPage + temp > pageNum) {
        end = pageNum;
      }else{
        end = curPage + temp + 1;
      }
    }

    for(var i = begin; i <= end; i += 1) {
      pages.push({
        'index': i ,
        'active': i === curPage,
        'url': Router.routes[routeName].path({'taskId': taskId, 'type': this.params.type}) + '?page=' + i
      });
    }
    return pages;
  },
  firstPage: function() {
    var routeName = this.curUrlRoute();
    return {'url': Router.routes[routeName].path({'taskId': this.params.taskId}) + '?page=' + 1};
  },
  lastPage: function() {
    var routeName = this.curUrlRoute();
    return {'url': Router.routes[routeName].path({'taskId': this.params.taskId}) + '?page=' + Math.ceil(this.totalTask() / this.pageSize)};
  },
  data: function () {
    var taskList = this.taskList(),
        totalTask = this.totalTask(),
        completedTaskCnt = this.completedTaskCnt(),
        pageNavi = this.pageNavi(),
        firstPage = this.firstPage(),
        lastPage = this.lastPage();
    return {
      'taskList': taskList,
      'totalTask': totalTask,
      'completedTaskCnt': completedTaskCnt,
      'pageNavi': pageNavi,
      'firstPage': firstPage,
      'lastPage': lastPage
    };
  },
});


['ViewSpot', 'Locality', 'Hotel', 'Restaurant', 'Shopping'].map(function(type){
  Router.route('/review-task/' + type + '/:taskId', {
    name: 'receive' + type,
    title: '接收任务',
    parent: 'home',
    template: 'receive' + type,
    controller: TaskRecieveBaseController
  });
});

///////////////////////// login and user admin //////////////////////


///////////////////////// review-end ////////////////////////////////
// TODO implement data
Router.route('/data-review', {
  name: 'dataReview',
  title: '数据审核',
  parent: 'home'
})

// 城市数据审核
Router.route('/data-review/city', {
  name: 'reviewLocality',
  title: '城市审核',
  parent: 'dataReview'
});

Router.route('/data-review/viewspot', {
  name: 'reviewViewSpot',
  title: '景点审核',
  parent: 'dataReview'
});

Router.route('/data-review/restaurant', {
  name: 'reviewRestaurant',
  title: '美食审核',
  parent: 'dataReview'
});

Router.route('/data-review/shopping', {
  name: 'reviewShopping',
  title: '购物审核',
  parent: 'dataReview'
});

Router.route('/data-review/hotel', {
  name: 'reviewHotel',
  title: '酒店审核',
  parent: 'dataReview'
});

Router.route('/data-review/plan', {
  name: 'reviewPlan',
  title: '攻略路线',
  parent: 'home'
});

Router.route('/data-review/guide', {
  name: 'reviewGuide',
  title: '路线模板',
  parent: 'home',
});

///////////////////////// review-end ///////////////////////////////


///////////////////////// 搜索，单个详情－begin //////////////////////

// 搜索：景点详情
Router.route('/ViewSpot/:id', {
  name: 'viewspotDetail',
  title: '景点详情',
  parent: 'home',
  waitOn: function() {
    return [Meteor.subscribe('viewspotDetail', this.params.id), Meteor.subscribe('oplog', 'k2.ViewSpot', new Mongo.ObjectID(this.params.id), 0)];
    // return [Meteor.subscribe('viewspotDetail', this.params.id), Meteor.subscribe('oplog', 'poi.ViewSpot', new Mongo.ObjectID(this.params.id), 0)];
  },
  data: function() {
    Session.set('oplog', {});
    var Items = [];
    // var detailInfo = ViewSpot.findOne({
    //     "_id": new Mongo.ObjectID(this.params.id)
    //   });

    var detailInfo = storageEngine.snapshot('k2.ViewSpot', new Mongo.ObjectID(this.params.id));
    // var detailInfo = storageEngine.snapshot('poi.ViewSpot', new Mongo.ObjectID(this.params.id));
    if(detailInfo){
      review('ViewSpot', detailInfo, Items);
      createOriginTextMD5(Items);
    }
    // 激活获取图片
    Meteor.subscribe("Images", this.params.id);
    Session.set('currentVsId', this.params.id);

    return {
      'vsDetail': Items
    };
  }
});

// 搜索：美食详情
Router.route('/Restaurant/:id', {
  name: 'restaurantDetail',
  title: '美食详情',
  parent: 'home',
  waitOn: function() {
    return [Meteor.subscribe('restaurantDetail', this.params.id), Meteor.subscribe('oplog', 'k2.Restaurant', new Mongo.ObjectID(this.params.id), 0)];
  },
  data: function() {
    Session.set('oplog', {});
    var Items = [];
    // var detailInfo = Restaurant.findOne({
    //     "_id": new Mongo.ObjectID(this.params.id)
    //   });
    var detailInfo = storageEngine.snapshot('k2.Restaurant', new Mongo.ObjectID(this.params.id));
    if(detailInfo){
      review('Restaurant', detailInfo, Items);
      createOriginTextMD5(Items);
    }
    // 激活获取图片
    Meteor.subscribe("Images", this.params.id);
    Session.set('currentRestaurantId', this.params.id);
    return {
      'restaurantDetail': Items
    };
  }
});

// 搜索：城市详情
Router.route('/Locality/:id', {
  name: 'localityDetail',
  title: '城市详情',
  parent: 'home',
  waitOn: function() {
    return [Meteor.subscribe('localityDetail', this.params.id), Meteor.subscribe('oplog', 'k2.Locality', new Mongo.ObjectID(this.params.id), 0)];
  },
  data: function() {
    Session.set('oplog', {});
    var Items = [];
    // var detailInfo = Locality.findOne({
    //     "_id": new Mongo.ObjectID(this.params.id)
    //   });
    var detailInfo = storageEngine.snapshot('k2.Locality', new Mongo.ObjectID(this.params.id));
    if(detailInfo){
      review('Locality', detailInfo, Items);
      createOriginTextMD5(Items);
    }
    // 激活获取图片
    Meteor.subscribe("Images", this.params.id);
    Session.set('currentLocalityId', this.params.id);
    return {
      'cityDetails': Items
    };
  }
});

// 搜索：购物详情
Router.route('/Shopping/:id', {
  name: 'shoppingDetail',
  title: '购物详情',
  parent: 'home',
  waitOn: function(){
    return [Meteor.subscribe('shoppingDetail', this.params.id), Meteor.subscribe('oplog', 'k2.Shopping', new Mongo.ObjectID(this.params.id), 0)];
  },
  data: function(){
    Session.set('oplog', {});
    var Items = [];
    // var detailInfo = Shopping.findOne({
    //     "_id": new Mongo.ObjectID(this.params.id)
    //   });
    var detailInfo = storageEngine.snapshot('k2.Shopping', new Mongo.ObjectID(this.params.id));
    if(detailInfo){
      review('Shopping', detailInfo, Items);
      createOriginTextMD5(Items);
    }
    // 激活获取图片
    Meteor.subscribe("Images", this.params.id);
    Session.set('currentShoppingId', this.params.id);
    return {
      'shoppingDetail': Items
    };
  }
});

// 搜索：酒店详情
Router.route('/Hotel/:id', {
  name: 'hotelDetail',
  title: '酒店详情',
  parent: 'home',
  waitOn: function(){
    return [Meteor.subscribe('hotelDetail', this.params.id), Meteor.subscribe('oplog', 'poi.Hotel', new Mongo.ObjectID(this.params.id), 0)];
  },
  data: function(){
    Session.set('oplog', {});
    var Items = [];
    var detailInfo = storageEngine.snapshot('poi.Hotel', new Mongo.ObjectID(this.params.id));
    if(detailInfo){
      review('Hotel', detailInfo, Items);
      createOriginTextMD5(Items);
    }
    // 激活获取图片
    Meteor.subscribe("Images", this.params.id);
    Session.set('currentHotelId', this.params.id);
    return {
      'hotelDetail': Items
    };
  }
});
///////////////////////// 搜索，单个详情－end ////////////////////////////////


Router.route('/compare/:id?', {
  name: 'compare',
  parent: 'home',
  title: 'poi比较与合并',
  waitOn: function() {
    if (this.params.id) {
      return Meteor.subscribe('getPoiMergedItemById', this.params.id);
    }else{
      var compareItems = Session.get('compareItems'),
          type = compareItems[0],
          items = compareItems.slice(1);
      return Meteor.subscribe(type + '_Cmp', items);
    }
  },
  data: function() {
    var compareItems;
    if (this.params.id) {
      var mergedInfo = PoiMergeInfo.findOne({'_id': this.params.id});
      if (mergedInfo) {
        compareItems = mergedInfo.compareItems;
      }
    } else {
      compareItems = Session.get('compareItems');
    }
    var type = compareItems[0],
        items = compareItems.slice(1);
    if (this.params.id) {
      Meteor.subscribe(type + '_Cmp', items);
    }
    // items.map(function(item){ids.push(new Mongo.ObjectID(item))});
    // 一次找出所有的POI，存到multiCompItems中
    var multiCompItems = items.map(function(item) {
      return ViewSpot.findOne({'_id': new Mongo.ObjectID(item)});
    });

    var resArray = [],
        poiIndex = [];
    for(var i = 0, len = multiCompItems.length; i < len; i++) {
      poiIndex.push({'index': i, 'zhName': multiCompItems[i].zhName, 'id': multiCompItems[i]._id._str});
      var vsDetail = [];
      // 调用已经写好的函数（poi编辑中也用到这个函数），构建poi展示信息的数据结构，存在vsDetail中
      review(type, multiCompItems[i], vsDetail);
      resArray.push(vsDetail);
    }
    var allReviewItem = [];
    for(var row = 0, rowLen = resArray.length; row < rowLen; row++) {
      var tempPOI = resArray[row];
      for(var col = 0, colLen = tempPOI.length; col < colLen; col++) {
        tempPOI[col]['belongIndex'] = row;
        allReviewItem.push(tempPOI[col]);
      }
    }
    // function defined in review_items.js，不需要合并名称和别名
    var keyArray = getReviewItems(type).filter(function(key){
      return key.value !== 'zhName' && key.value !== 'alias';
    });
    delete keyArray.zhName, delete keyArray.alias;
    Session.set('compareInfos', {'dbName': type, 'itemInfo': multiCompItems, 'keys': keyArray, 'poiIndex': poiIndex});
      // 在没有Id的前提下，是空的
    return {
      cmpElements : allReviewItem,
      poiIndex: poiIndex,
      keyArray: keyArray,
      mergedInfo: mergedInfo
    }
  }
});

// Router.onBeforeAction("loading");


Router.route('/poi-merged-list', {
  name: 'poiMergeReview',
  parent: 'home',
  title: 'poi合并复审',
  waitOn: function() {
    return [Meteor.subscribe('editor'),]
  },
  data: function() {
    var editors = Meteor.users.find({'rights': 'editor'}, {fields: {username: 1, _id: 1}});
    return {
      editors: editors,
    };
  }
});
//////////////////////// compare poi end ////////////////////////////////

// ------------------------爱走CMS-----------------------
// ------------------------爱走CMS-----------------------

// var requireEditRight = function() {
//   if (!Meteor.user()) {
//     if (Meteor.loggingIn()) {
//       this.render(this.loadingTemplate);
//     } else {
//       this.render('accessDenied');
//     }
//   } else {
//     this.next();
//   }
// };

var requireEditRight = function() {
  if (!Meteor.user()) {
    this.render('login');
  } else if (_.indexOf(Meteor.user().rights, 'editor') === -1) {
    this.render('accessDenied');
  } else {
    this.next();
  }
};

var requireAdminRight = function(){
  if (!Meteor.user()) {
    this.render('login');
  } else if (_.indexOf(Meteor.user().rights, 'admin') === -1) {
    this.render('accessDenied');
  } else {
    this.next();
  }
}

var requireLogin = function() {
  if (!Meteor.userId()) {
    this.render('Login');
  } else {
    this.next();
  }
};

var initSession = function() {
  // 
  Session.set('currentLocalityId', undefined);
  Session.set('currentVsId', undefined);
  Session.set('currentRestaurantId', undefined);
  Session.set('currentShoppingId', undefined);
  Session.set('currentHotelId', undefined);
  Session.set('poiMergedInfoID', undefined);

  //recheck复审页面进入的初始化,
  Session.set('recheckBaseData', []);
  Session.set('recheckCompareData', []);
  this.next();

  //statistics的时间初始化
  Session.set("statisticsStartDate", moment().startOf('day').subtract((moment().day() || 7)- 1, 'day').unix());
  Session.set("statisticsEndDate", moment().startOf('day').add(7 - (moment().day() || 7), 'day').unix());

  // essay
  Session.set('currentEssayDetailContents', '');
  Session.set('ueReady', false);
}

// 全部需要登录
Router.onBeforeAction(requireLogin, {
  except: ['login', 'register', 'forgetPassword', ]
});

// Router.onBeforeAction('dataNotFound', {
//   only: 'postPage'
// });

// 刷新session
Router.onBeforeAction(initSession, {
  except: []
});

// 需要edit权限的路由
Router.onBeforeAction(requireEditRight, {
  except: ['admin', 'login', 'register', 'forgetPassword', ]
});

// 需要admin权限的路由
Router.onBeforeAction(requireAdminRight, {
  only: ['admin', 'recheck', 'taskAssgin', 'statistics', 'poiMergeReview', ]
});


//////////////////////// Recheck begin ///////////////////////////
Router.route('/recheck', {
  name: 'recheck',
  title: '数据复审',
  parent: 'home',
  waitOn: function(){
    return [Meteor.subscribe('editor'),]
  },
  data: function(){
    var editors = Meteor.users.find({'rights': 'editor'}, {fields: {username: 1, _id: 1}});
    return {
      editors: editors,
    }
  }
});
//////////////////////// Recheck end ///////////////////////////


//////////////////////// Statistics begin ///////////////////////////
Router.route('/statistics', {
  name: 'statistics',//template name
  title: '任务统计',//for the bread crumbs
  parent: 'home',

  waitOn: function(){
    return [Meteor.subscribe('editor'), Meteor.subscribe('taskAssginHistory')];
  },
  data: function(){
    var editors = Meteor.users.find({'rights': 'editor'}, {fields: {username: 1, _id: 1, title: 1}}),
        items = OplogPkList.find({}),
        historyTaskList = [];
    TaskHistory.find({}, {'sort': {'createTime': -1}}).forEach(function(task) {
      var tempTask = task,
          detail = task.detail,
          taskId = task._id._str,
          tempDetail = [];
      Meteor.subscribe('taskByTaskId', taskId);
      detail.map(function(editorInfo) {
        var editorId = editorInfo.editor.id,
            totalTask = editorInfo.taskCount,
            completeTask = TaskPool.find({'taskId': new Mongo.ObjectID(taskId), 'editorId': editorId, 'editStatus': true}).count();
        editorInfo.completeTask = completeTask;
        editorInfo.completePercent = (completeTask / totalTask) * 100;
        tempDetail.push(editorInfo);
      });
      tempTask.detail = tempDetail;
      historyTaskList.push(tempTask);
    });

    return {
      editors: editors,
      items: items,
      historyTaskList: historyTaskList
    }
  }
});
//////////////////////// Statistics end ///////////////////////////



//////////////////////// Statistics begin ///////////////////////////
// Router.route('/essay/create', {
//   name: 'essayCreate',
//   title: '新建文章',
//   parent: 'home'
// });

Router.route('/essay/edit/:id', {
  name: 'essayEdit',
  title: '编辑文章',
  parent: 'home',
  // template: 'essayEdit', // 和route name不一样的时候需要
  waitOn: function() {
    return Meteor.subscribe('essayDetail', this.params.id);
  },
  data: function() {
    var essayDetail = Essay.findOne({uuid: this.params.id});
    if (essayDetail){
      console.log(essayDetail);
      Session.set('currentEssayDetailContents', essayDetail.contents);
      essayDetail.titleCount = essayDetail.title.length;
      essayDetail.authorCount = essayDetail.author.length;
      essayDetail.abstractCount = essayDetail.abstract.length;
    }
    return {
      'essayDetail': essayDetail,
      'uuid': this.params.id
    };
  }
});

Router.route('/essay/list', {
  name: 'essayList',
  title: '文章一览',
  parent: 'home'
});

Router.route('/essay/publish', {
  name: 'essayPublish',
  title: '发布文章',
  parent: 'home'
});

//////////////////////// Statistics end ///////////////////////////



