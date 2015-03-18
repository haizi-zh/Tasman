Comments = new Mongo.Collection('comments');

Meteor.methods({
  commentInsert: function(commentAttributes) {
    check(this.userId, String);
    check(commentAttributes, {
      postId: String,
      body: String
    });

    var user = Meteor.user();
    var post = Posts.findOne({
      _id: commentAttributes.postId
    });
    if (!post) {
      throw new Meteor.Error("不可用的评论", "必须评论一个已有的文章");
    }
    comment = _.extend(commentAttributes, {
      userId: user._id,
      authour: user.username,
      submitted: new Date()
    });
    // 记录评论数
    Posts.update(comment.postId, {$inc: {commentsCount: 1}});
    return Comments.insert(comment);
  }
});

Comments.allow({
  insert: function(userId, doc) {
    return userId;
  }
});

Comments.deny({
  insert: function(userId, doc) {
    if (!userId || check(doc, String)) {
      return true;
    }
  }
});