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
  waitOn: function(){
    return Meteor.subscribe('allUsers');
  },
  data: function(){
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
      region: {'abroad': this.isAbroad()},
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
      pageLimit: this.pageLimit() + this.increment
    });
  },
  subscriptions: function() {
    this.citiesSub = Meteor.subscribe('cities', this.isAbroad(), this.pageLimit());
  },
  cities : function() {
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
    if(this.isAbroad()){
      query = {'country.zhName': this.params.zoneName};
    } else {
      query = {'locList.zhName': this.params.zoneName};
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
    this.viewspotsSub = Meteor.subscribe('vs', this.isAbroad(), this.params.zoneName, this.pageLimit());
  },
  viewspots : function() {
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


///////////////////////// detail-begin ////////////////////////////////
Router.route('/ViewSpot/:id', {
  name: 'viewspotDetail',
  waitOn: function(){
    Meteor.subscribe('vsDetail', this.params.id);
  },
  data: function(){
    return {
      'vsDetail': ViewSpot.findOne({"_id": new Mongo.ObjectID(this.params.id)})
    };
  }
});

Router.route('/Locality/:id', {
  name: 'localityDetail',
  waitOn: function(){
    Meteor.subscribe('cityDetail', this.params.id);
  },
  data: function(){
    return {
      'cityDetails': Locality.findOne({"_id": new Mongo.ObjectID(this.params.id)})
    };
  }
});
///////////////////////// detail-end ////////////////////////////////

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
  if (!Meteor.user()){
    this.render('login');
  } else if (_.indexOf(Meteor.user().rights, 'editor') === -1) {
    this.render('accessDenied');
  } else {
    this.next();
  }
};

var requireLogin = function () {
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