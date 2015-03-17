Posts = new Mongo.Collection('posts');

// 关键字 var 限制对象的作用域在文件范围内。
// 我们想要 Posts 作用于整个应用范围内，因此我们在这里不要 Var 这个关键字

Meteor.methods({
  postInsert: function(postAttributes) {
    check(Meteor.userId(), String);
    check(postAttributes, {
      title: String,
      url: String
    });

    var postWithSameLink = Posts.findOne({url: postAttributes.url});
    if (postWithSameLink) {
      return {
        postExists: true,
        _id: postWithSameLink._id
      }
    }

    var user = Meteor.user();
    var post = _.extend(postAttributes, {
      userId: user._id,
      author: user.username,
      submitted: new Date()
    });
    var postId = Posts.insert(post);

    return {_id: postId};
  }
})