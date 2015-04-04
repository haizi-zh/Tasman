// var needed?
CmsOplog = new Mongo.Collection('CmsOplog');

/**
 * 发布oplog信息
 * @param  {string} ns     oplog对应的namespace，如'geo.Locality'
 * @param  {ObjectId} pk     oplog对应数据的主键
 * @param  {int} count 取最后多少条记录。如果为undefined，则取所有记录
 */
Meteor.publish('oplog', function(ns, pk, count) {
  var query = {'ns': ns, 'pk': pk};
  if (count === undefined) {
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