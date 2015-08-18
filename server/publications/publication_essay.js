// 根据修改时间
// TODO 应该再加上一个createTime新建时间
// TODO 发布时间publishTime => 顺便定时发布！

// Meteor.publish('essayList', function(pageLimit) {
//   check(pageLimit, Number);
//   console.log(Essay.find({}, {sort: {timeStamp: -1}, limit: parseInt(pageLimit), fields: {title: 1, author: 1, abstract: 1, cover: 1}}).fetch());
//   return Essay.find({}, {sort: {timeStamp: -1}, limit: parseInt(pageLimit), fields: {title: 1, author: 1, abstract: 1, cover: 1}});
// });

Meteor.publish('essayDetail', function(uid) {
  check(uid, String);
  return Essay.find({'uuid': uid});
});

Meteor.FilterCollections.publish(Essay, {
  name: 'essayList',
  callbacks: {/*...*/}
});