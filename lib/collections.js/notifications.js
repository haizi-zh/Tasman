Notifications = new Mongo.Collection('notifications');

Notifications.allow({
  update: function(userId, doc, fieldNames, modifier) {
    return ownsDocument(userId, doc) && fieldNames.length === 1 && fieldNames[0] === 'read';
  },
  insert: function(userId, doc){
    check(userId, String);
    check(doc, String);
    return true;
  }
});

createCommentNotification = function(comment){
  var post = Posts.findOne(comment.postId);
  if (comment.userId !== post.userId){
    console.log('Yes');
    Notifications.insert({
      userId: post.userId,
      postId: post._id,
      commentId: comment._id,
      commenterName: comment.author,
      read: false
    });
  }
};