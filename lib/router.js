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
});

Router.route('/register', {
  name: 'register'
});

Router.route('/forget-password', {
  name: 'forgetPassword'
});

Router.route('/user-profile', {
  name: 'userProfile'
});

Router.route('/admin', {
  name: 'admin',
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


///////////////////////// login and user admin /////////////////////////////////////////////


///////////////////////// review-city-begin ////////////////////////////////
reviewCityBaseController = RouteController.extend({
  waitOn: function() {
    return Meteor.subscribe('cities', this.isAbroad(), this.pageLimit());
  },
  increment: 10,
  isAbroad: function() {
    return this.params.countryRegion !== "china";
  },
  pageLimit: function() {
    return parseInt(this.params.pageLimit) || this.increment;
  },
  findOptions: function() {
    return {
      region: {
        'abroad': this.isAbroad()
      },
      limit: {
        'limit': this.pageLimit(),
        'fields': {
          'zhName': 1,
          '_id': 1
        },
        // 'sort': {'hotness': -1}
      }
    }
  },
  nextPath: function() {
    return this.route.path({
      countryRegion: this.params.countryRegion,
      pageLimit: this.pageLimit() + this.increment
    });
  },
  subscriptions: function() {
    this.citiesSub = Meteor.subscribe('cities', this.isAbroad(), this.pageLimit());
  },
  cities: function() {
    return Locality.find(this.findOptions().region, this.findOptions().limit);
  },
  data: function() {
    var hasMore = this.cities().count() === this.pageLimit();
    return {
      isAbroad: this.isAbroad(),
      cities: this.cities(),
      ready: this.citiesSub.ready,
      nextPath: hasMore ? this.nextPath() : null
    };
  }
});
// 继承
reviewCityController = reviewCityBaseController.extend({});
// 城市数据审核
Router.route('/data-review/city/:countryRegion/:pageLimit?', {
  name: 'reviewCity',
  controller: reviewCityController
});

///////////////////////// review-city-end ////////////////////////////////


///////////////////////// review-vs-begin ////////////////////////////////

reviewViewspotBaseController = RouteController.extend({
  waitOn: function() {
    // if (!this.params.zoneName) {
    //   this.render('reviewViewspot');
    // }
    // TODO 一开始返回城市列表和所有工作的进度
    return Meteor.subscribe('vs', this.isAbroad(), this.params.zoneName, this.pageLimit());
  },
  increment: 10,
  isAbroad: function() {
    return this.params.countryRegion !== "china";
  },
  pageLimit: function() {
    return parseInt(this.params.pageLimit) || this.increment;
  },
  findOptions: function() {
    var query = {};
    if (this.isAbroad()) {
      query = {
        'country.zhName': this.params.zoneName
      };
    } else {
      query = {
        'locList.zhName': this.params.zoneName
      };
    }
    return {
      query: query,
      limit: {
        'limit': this.pageLimit(),
        'fields': {
          'zhName': 1,
          '_id': 1
        },
        // 'sort': {'hotness': -1}
      }
    }
  },
  nextPath: function() {
    return this.route.path({
      countryRegion: this.params.countryRegion,
      pageLimit: this.pageLimit() + this.increment,
      zoneName: this.params.zoneName
    });
  },
  subscriptions: function() {
    this.viewspotsSub = Meteor.subscribe('vs', this.isAbroad(), this.params.zoneName, this.pageLimit());
  },
  viewspots: function() {
    return ViewSpot.find(this.findOptions().query, this.findOptions().limit);
  },
  data: function() {
    var hasMore = this.viewspots().count() === this.pageLimit();
    return {
      isAbroad: this.isAbroad(),
      viewspots: this.viewspots(),
      ready: this.viewspotsSub.ready,
      nextPath: hasMore ? this.nextPath() : null
    };
  }
});

reviewViewspotController = reviewViewspotBaseController.extend({});

Router.route('/data-review/viewspot/:countryRegion/:zoneName?/:pageLimit?', {
  name: 'reviewViewspot',
  controller: reviewViewspotController
})


///////////////////////// review-vs-end ////////////////////////////////


///////////////////////// 搜索，单个详情－begin ////////////////////////////////

// 搜索：景点详情
Router.route('/ViewSpot/:id', {
  name: 'viewspotDetail',
  waitOn: function() {
    return Meteor.subscribe('vsDetail', this.params.id);
  },
  data: function() {
    Session.set('oplog', {});
    var Items = [];
    var detailInfo = ViewSpot.findOne({
        "_id": new Mongo.ObjectID(this.params.id)
      });
    if(detailInfo){
      review('ViewSpot', detailInfo, Items);
      createOriginTextMD5(Items);
    }
    return {
      'vsDetail': Items
    };
  }
});

// 搜索：美食详情
Router.route('/Restaurant/:id', {
  name: 'restaurantDetail',
  waitOn: function() {
    return Meteor.subscribe('restaurantDetail', this.params.id);
  },
  data: function() {
    Session.set('oplog', {});
    var Items = [];
    var detailInfo = Restaurant.findOne({
        "_id": new Mongo.ObjectID(this.params.id)
      });
    if(detailInfo){
      review('Restaurant', detailInfo, Items);
      createOriginTextMD5(Items);
    }
    return {
      'restaurantDetail': Items
    };
  }
});

// 搜索：城市详情
Router.route('/Locality/:id', {
  name: 'localityDetail',
  waitOn: function() {
    return Meteor.subscribe('cityDetail', this.params.id);
  },
  data: function() {
    Session.set('oplog', {});
    var Items = [];
    var detailInfo = Locality.findOne({
        "_id": new Mongo.ObjectID(this.params.id)
      });
    if(detailInfo){
      review('Locality', detailInfo, Items);
      createOriginTextMD5(Items);
    }
    return {
      'cityDetails': Items
    };
  }
});

// 搜索：酒店详情
Router.route('/Shopping/:id', {
  name: 'shoppingDetail',
  waitOn: function(){
    Meteor.subscribe('shoppingDetail', this.params.id);
  },
  data: function(){
    Session.set('oplog', {});
    var Items = [];
    var detailInfo = Shopping.findOne({
        "_id": new Mongo.ObjectID(this.params.id)
      });
    if(detailInfo){
      review('Shopping', detailInfo, Items);
      createOriginTextMD5(Items);
    }
    return {
      'shoppingDetail': Items
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
        items = compareItems.slice(1);
      var ids = [];
      items.map(function(item){ids.push(new Mongo.ObjectID(item))});
      return {
        cmpElements : ViewSpot.find({'_id': {'$in': ids}}),
        cmpItems : compareItems[type]
      }
    }
  })
///////////////////////// compare poi end ////////////////////////////////












/**************** edit by @lyn **********************/
/****************** review-restaurant-begin *****************/
reviewRestaurantBaseController = RouteController.extend({
  increment: 10,
  waitOn: function() {
    // if (!this.params.zoneName) {
    //   this.render('reviewViewspot');
    // }
    // TODO 一开始返回城市列表和所有工作的进度
    return Meteor.subscribe('restaurants', this.isAbroad(), this.params.zoneName, this.pageLimit());
  },
  isAbroad: function() {
    return this.params.countryRegion !== "china";
  },
  pageLimit: function() {
    return parseInt(this.params.pageLimit) || this.increment;
  },
  findOptions: function() {
    var query = {};
    if(this.isAbroad()){
      query = {'country.zhName': this.params.zoneName};
    } else {
      query = {'locality.zhName': this.params.zoneName};
    }
    return {
      query: query,
      limit: {
        'limit': this.pageLimit(),
        'fields': {'zhName': 1, '_id': 1},
        // 'sort': {'hotness': -1}
      }
    }
  },
  nextPath: function() {
    return this.route.path({
      countryRegion: this.params.countryRegion,
      pageLimit: this.pageLimit() + this.increment,
      zoneName: this.params.zoneName
    });
  },
  subscriptions: function() {
    this.restaurantsSub = Meteor.subscribe('restaurants', this.isAbroad(), this.params.zoneName, this.pageLimit());
  },
  restaurants : function() {
    return Restaurant.find(this.findOptions().query, this.findOptions().limit);
  },
  data: function() {
    var hasMore = this.restaurants().count() === this.pageLimit();
    return {
      isAbroad: this.isAbroad(),
      restaurants: this.restaurants(),
      ready: this.restaurantsSub.ready,
      nextPath: hasMore ? this.nextPath() : null
    };
  }
});

reviewRestaurantController = reviewRestaurantBaseController.extend({});

Router.route('/data-review/restaurant/:countryRegion/:zoneName?/:pageLimit?', {
  name: 'reviewRestaurant',
  controller: reviewRestaurantController
})
/****************** review-restaurant-end *****************/



/****************** review-shopping-begin *****************/
reviewShoppingBaseController = RouteController.extend({
  increment: 10,
  waitOn: function() {
    // if (!this.params.zoneName) {
    //   this.render('reviewViewspot');
    // }
    // TODO 一开始返回城市列表和所有工作的进度
    return Meteor.subscribe('shoppings', this.isAbroad(), this.params.zoneName, this.pageLimit());
  },
  isAbroad: function() {
    return this.params.countryRegion !== "china";
  },
  pageLimit: function() {
    return parseInt(this.params.pageLimit) || this.increment;
  },
  findOptions: function() {
    var query = {};
    if(this.isAbroad()){
      query = {'country.zhName': this.params.zoneName};
    } else {
      query = {'locality.zhName': this.params.zoneName};
    }
    return {
      query: query,
      limit: {
        'limit': this.pageLimit(),
        'fields': {'zhName': 1, '_id': 1},
        // 'sort': {'hotness': -1}
      }
    }
  },
  nextPath: function() {
    return this.route.path({
      countryRegion: this.params.countryRegion,
      pageLimit: this.pageLimit() + this.increment,
      zoneName: this.params.zoneName
    });
  },
  subscriptions: function() {
    this.shoppingsSub = Meteor.subscribe('shoppings', this.isAbroad(), this.params.zoneName, this.pageLimit());
  },
  shoppings : function() {
    return Shopping.find(this.findOptions().query, this.findOptions().limit);
  },
  data: function() {
    var hasMore = this.shoppings().count() === this.pageLimit();
    /***************** ??? 不一定正好等于吧 ??? *****************/
    return {
      isAbroad: this.isAbroad(),
      shoppings: this.shoppings(),
      ready: this.shoppingsSub.ready,
      nextPath: hasMore ? this.nextPath() : null
    };
  }
});

reviewShoppingController = reviewShoppingBaseController.extend({});

Router.route('/data-review/shopping/:countryRegion/:zoneName?/:pageLimit?', {
  name: 'reviewShopping',
  controller: reviewShoppingController
})
/****************** review-shopping-end *****************/
/**************** edit by @lyn **********************/





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
    Session.set('currentCityId', undefined);
    Session.set('currentVsId', undefined);
    Session.set('currentRestaurantId', undefined);
    Session.set('currentShoppingId', undefined);
  }
};

var requireLogin = function() {
  if (!Meteor.userId()) {
    this.render('Login');
  } else {
    this.next();
  }
};

// 全部需要登录
Router.onBeforeAction(requireLogin, {
  except: ['login', 'register', 'forgetPassword', ]
});

// Router.onBeforeAction('dataNotFound', {
//   only: 'postPage'
// });

// 需要edit权限的路由
Router.onBeforeAction(requireEditRight, {
  only: ['reviewCity', 'reviewViewspot', 'viewspotDetail', 'localityDetail', ]
});