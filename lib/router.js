Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading', // 等待数据时，显示的菊花
  notFoundTemplate: 'notFound',
  waitOn: function() {
    return [Meteor.subscribe('notifications'), ];
  }
});

PostsListController = RouteController.extend({
  template: 'postsList',
  increment: 5,
  postsLimit: function() {
    return parseInt(this.params.postsLimit) || this.increment;
  },
  findOptions: function() {
    return {
      sort: this.sort,
      limit: this.postsLimit()
    };
  },
  waitOn: function() {
    return Meteor.subscribe('posts', this.findOptions());
  },
  subscriptions: function() {
    this.postsSub = Meteor.subscribe('posts', this.findOptions());
  },
  posts: function() {
    return Posts.find({}, this.findOptions());
  },
  data: function() {
    var hasMore = this.posts().count() === this.postsLimit();
    // var nextPath = this.route.path({
    //   postsLimit: this.postsLimit() + this.increment
    // });
    return {
      posts: this.posts(),
      ready: this.postsSub.ready,
      nextPath: hasMore ? this.nextPath() : null
    };
  }
});

NewPostsController = PostsListController.extend({
  sort: {
    submitted: -1,
    _id: -1
  },
  nextPath: function() {
    return Router.routes.newPosts.path({
      postsLimit: this.postsLimit() + this.increment
    });
  }
});

BestPostsController = PostsListController.extend({
  sort: {
    votes: -1,
    submitted: -1,
    _id: -1
  },
  nextPath: function() {
    return Router.routes.bestPosts.path({
      postsLimit: this.postsLimit() + this.increment
    })
  }
});

Router.route('/', {
  name: 'home',
  controller: NewPostsController
});

Router.route('/new/:postsLimit?', {
  name: 'newPosts'
});
Router.route('/best/:postsLimit?', {
  name: 'bestPosts'
});

Router.route('/posts/:_id', {
  name: 'postPage',
  data: function() {
    return Posts.findOne({
      '_id': this.params._id
    }); // this 对应于当前匹配的路由对象
  },
  waitOn: function() {
    return [
      Meteor.subscribe('comments', this.params._id),
      Meteor.subscribe('singlePost', this.params._id)
    ]
  }
});

Router.route('/posts/:_id/edit', {
  name: 'postEdit',
  data: function() {
    return Posts.findOne({
      _id: this.params._id
    })
  },
  waitOn: function() {
    return Meteor.subscribe('singlePost', this.params._id);
  }
});

Router.route('/submit', {
  name: 'postSubmit'
});

// ------------------------爱走CMS-----------------------
// ------------------------爱走CMS-----------------------

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
  name: 'ViewSpotDetail',
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
  name: 'LocalityDetail',
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

var requireLogin = function() {
  if (!Meteor.user()) {
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
    } else {
      this.render('accessDenied');
    }
  } else {
    this.next();
  }
};

Router.onBeforeAction('dataNotFound', {
  only: 'postPage'
});
Router.onBeforeAction(requireLogin, {
  only: 'postSubmit'
});