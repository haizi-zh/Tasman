var oplog = new Mongo.Collection('oplog');

storageEngine = {
  // 获得某条记录的修改历史
  history: fnHistory,
  update: fnUpdate
};

/**
 * 获得某条记录的编辑历史
 * @param  {string} ns namespace，如'geo.Locality'
 * @param  {string} pk 主键
 */
var fnHistory = function(ns, pk) {
  Meteor.subscribe(oplog, ns, pk);
  return oplog.find({'ns': ns, 'pk': pk}, {sort: {ts: -1}});
};

/**
 * 更新某条记录
 * @param  {string} ns namespace，如'geo.Locality'
 * @param  {string} pk 主键
 * @param  {string} o  操作码：'i'：插入，'d'：删除，'u'：更新
 * @param  {string} op oplog的数据体
 */
var fnUpdate = function(ns, pk, o, op) {
  var userId = Meteor.userId();
  var entry = {
    'ts': Date.now(),
    'userId': userId,
    'status': 'staged',
    'pk': pk,
    'o': op,
    'op': op
    };
  oplog.insert(entry);
};
