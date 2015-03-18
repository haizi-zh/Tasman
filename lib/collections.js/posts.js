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
    console.log(postAttributes.url);
    var postWithSameLink = Posts.findOne({url: postAttributes.url});
    if (postWithSameLink) {
      return {
        postExists: true,
        _id: postWithSameLink._id
      }
    }

    var errors = validatePost(postAttributes);
    if (errors.title || errors.url) {
      throw new Meteor.Error('invalid-post', "你必须为你的帖子填写标题和 URL");
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
});

Posts.allow({
  update: function(userId, post){ return ownsDocument(userId, post);},
  remove: function(userId, post){ return ownsDocument(userId, post);}
});

Posts.deny({
  update: function(userId, post, fieldNames, modifier) {
    // url重复
    newUrl = modifier['$set']['url'];
    // 编辑模式下，没有改动url
    if (newUrl === post['url']){
      return false;
    }
    // 创建时，url已经存在
    return Posts.findOne({url: newUrl});
  }
});

Posts.deny({
  // 提交多个参数
  update: function(userId, post, fieldNames) {
    return (_.without(fieldNames, 'url', 'title').length > 0);
  }
});

// 编辑帖子时，在后端验证，防止console操作
Posts.deny({
  update: function(userId, post, fieldNames, modifier) {
    var errors = validatePost(modifier.$set);
    return errors.title || errors.url;
  }
});

validatePost = function (post) {
  var errors = {};
  if (!post.title) {
    errors.title = "请填写标题";
  }
  if (!post.url) {
    errors.url = "请填写URL";
  }
  return errors;
};