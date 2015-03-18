Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading', // 等待数据时，显示的菊花
  notFoundTemplate: 'notFound',
  waitOn: function() {
    return [Meteor.subscribe('notifications')];
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
      sort: {
        submitted: -1
      },
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
    var nextPath = this.route.path({
      postsLimit: this.postsLimit() + this.increment
    });
    return {
      posts: this.posts(),
      ready: this.postsSub.ready,
      nextPath: hasMore ? nextPath : null
    };
  }
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

Router.route('/:postsLimit?', {
  name: 'postsList',
});

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