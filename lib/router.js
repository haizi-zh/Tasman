Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',  // 等待数据时，显示的菊花
  notFoundTemplate: 'notFound',
  waitOn: function() {
    return Meteor.subscribe('posts');
  }
});

Router.route('/', {name: 'postsList'});

Router.route('/posts/:_id', {
  name: 'postPage',
  data: function() {
    return Posts.findOne({'_id': this.params._id});  // this 对应于当前匹配的路由对象
  }
});

Router.onBeforeAction('dataNotFound', {only: 'postPage'});
