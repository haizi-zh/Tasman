CmsOplog = new Mongo.Collection('CmsOplog');
// OplogPkList = new Mongo.Collection('OplogPkList');

/**
 * 发布oplog信息
 * @param  {string} ns     oplog对应的namespace，如'geo.Locality'
 * @param  {ObjectId} pk     oplog对应数据的主键
 * @param  {int} count 取最后多少条记录。如果为undefined，则取所有记录
 */
Meteor.publish('oplog', function(ns, pk, count) {
  check(ns, String);
  check(pk, Meteor.Collection.ObjectID);
  check(count, Number);
  var query = {'ns': ns, 'pk': pk};
  if (count === 0) {
    return CmsOplog.find(query, {sort: {ts: -1}});
  } else {
    return CmsOplog.find(query, {sort: {ts: -1}, limit: count});
  }
});

// TODO allow settings
CmsOplog.allow({
  insert: function(){
    return true;
  },
  update: function(){
    return true;
  }
});


Meteor.methods({
  'OplogPkList.update': function(ts, ns, userId, pk, zhName){
    check(ts, Number);
    check(ns, String);
    check(userId, String);
    console.log(pk);
    check(pk, Meteor.Collection.ObjectID);
    check(zhName, String);
    var query = {'ns': ns, 'pk': pk._str};
    OplogPkList.update(query, {'$set': {'ts': ts, 'zhName': zhName}, '$addToSet': {'editorId': userId}, '$inc': {'opCount': 1}}, {'upsert': true});
  },
});

Meteor.publish('oplog-pk-list', function(){
  return OplogPkList.find({});
});

// TODO allow settings
OplogPkList.allow({
  insert: function(){
    return true;
  },
  update: function(){
    return true;
  }
});