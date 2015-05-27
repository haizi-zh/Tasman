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
  title: 'AiZouCMS'
});

Router.route('/register', {
  name: 'register'
});

Router.route('/forget-password', {
  name: 'forgetPassword'
});

Router.route('/user-profile', {
  name: 'userProfile',
  title: '个人配置',
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
  parent: 'home',
});

Router.route('/createNewPlan', {
  name: 'createPlan',
  template: 'createNewPlan',
  title: '新建游记规划',
  parent: 'home',
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
  name: 'reviewViewspot',
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
  parent: 'dataReview'
});

Router.route('/data-review/guide', {
  name: 'reviewGuide',
  title: '路线模板',
  parent: 'dataReview',
});

///////////////////////// review-end ///////////////////////////////


///////////////////////// 搜索，单个详情－begin //////////////////////

// 搜索：景点详情
Router.route('/ViewSpot/:id', {
  name: 'viewspotDetail',
  title: '景点详情',
  parent: 'home',
  waitOn: function() {
    return [Meteor.subscribe('viewspotDetail', this.params.id), Meteor.subscribe('oplog', 'poi.ViewSpot', new Mongo.ObjectID(this.params.id), 0)];
  },
  data: function() {
    Session.set('oplog', {});
    var Items = [];
    // var detailInfo = ViewSpot.findOne({
    //     "_id": new Mongo.ObjectID(this.params.id)
    //   });
    var detailInfo = storageEngine.snapshot('poi.ViewSpot', new Mongo.ObjectID(this.params.id));
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
    return [Meteor.subscribe('restaurantDetail', this.params.id), Meteor.subscribe('oplog', 'poi.Restaurant', new Mongo.ObjectID(this.params.id), 0)];
  },
  data: function() {
    Session.set('oplog', {});
    var Items = [];
    // var detailInfo = Restaurant.findOne({
    //     "_id": new Mongo.ObjectID(this.params.id)
    //   });
    var detailInfo = storageEngine.snapshot('poi.Restaurant', new Mongo.ObjectID(this.params.id));
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
    return [Meteor.subscribe('localityDetail', this.params.id), Meteor.subscribe('oplog', 'geo.Locality', new Mongo.ObjectID(this.params.id), 0)];
  },
  data: function() {
    Session.set('oplog', {});
    var Items = [];
    // var detailInfo = Locality.findOne({
    //     "_id": new Mongo.ObjectID(this.params.id)
    //   });
    var detailInfo = storageEngine.snapshot('geo.Locality', new Mongo.ObjectID(this.params.id));
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
    return [Meteor.subscribe('shoppingDetail', this.params.id), Meteor.subscribe('oplog', 'poi.Shopping', new Mongo.ObjectID(this.params.id), 0)];
  },
  data: function(){
    Session.set('oplog', {});
    var Items = [];
    // var detailInfo = Shopping.findOne({
    //     "_id": new Mongo.ObjectID(this.params.id)
    //   });
    var detailInfo = storageEngine.snapshot('poi.Shopping', new Mongo.ObjectID(this.params.id));
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

///////////////////////// compare poi start //////////////////////////////

Router.route('/compare', {
    name: 'compare',
    waitOn: function() {
      var compareItems = Session.get('compareItems'),
        type = compareItems[0],
        items = compareItems.slice(1);
      Meteor.subscribe(type + '_Cmp', items);
    },
    data: function() {
      var compareItems = Session.get('compareItems'),
        type = compareItems[0],
        items = compareItems.slice(1),
        ids = [];

      items.map(function(item){ids.push(new Mongo.ObjectID(item))});
      var multiCompItems = ViewSpot.find({'_id': {'$in': ids}}).fetch();

      var resArray = [],
          poiIndex = [];
      for(var i = 0, len = multiCompItems.length; i < len; i++) {
        poiIndex.push({'index': i, 'zhName': multiCompItems[i].zhName, 'id': multiCompItems[i]._id._str});
        var vsDetail = [];
        review(type, multiCompItems[i], vsDetail);
        resArray.push(vsDetail);
      }

      var allReviewItem = [];
      for(var row = 0, rowLen = resArray.length; row < rowLen; row++){
        var tempPOI = resArray[row];
        for(var col = 0, colLen = tempPOI.length; col < colLen; col++){
          tempPOI[col]['belongIndex'] = row;
          allReviewItem.push(tempPOI[col]);
        }
      }

      var keyArray = getReviewItems(type); // function defined in review_items.js
      Session.set('compareInfos', {'dbName': type, 'itemInfo': multiCompItems, 'keys': keyArray, 'poiIndex': poiIndex});
      return {
        cmpElements : allReviewItem,
        poiIndex: poiIndex,
        keyArray: keyArray

      }
    }
  })
///////////////////////// compare poi end ////////////////////////////////

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
  Session.set('currentLocalityId', undefined);
  Session.set('currentVsId', undefined);
  Session.set('currentRestaurantId', undefined);
  Session.set('currentShoppingId', undefined);
  Session.set('currentHotelId', undefined);

  //recheck复审页面进入的初始化,
  Session.set('recheckBaseData', []);
  Session.set('recheckCompareData', []);
  this.next();

  //statistics的时间初始化
  Session.set("statisticsStartDate", moment().startOf('day').subtract((moment().day() || 7)- 1, 'day').unix());
  Session.set("statisticsEndDate", moment().startOf('day').add(7 - (moment().day() || 7), 'day').unix());
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

// 需要edit权限的路由
Router.onBeforeAction(requireAdminRight, {
  only: ['admin', 'recheck',]
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
    return [Meteor.subscribe('editor'),];
  },
  data: function(){
    var editors = Meteor.users.find({'rights': 'editor'}, {fields: {username: 1, _id: 1, title: 1}});
    var items = OplogPkList.find({});
    return {
      editors: editors,
      items: items
    }
  }
});
//////////////////////// Statistics end ///////////////////////////
