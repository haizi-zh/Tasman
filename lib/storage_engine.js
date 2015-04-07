/**
 * 获得某条记录的编辑历史
 * @param  {string} ns namespace，如'geo.Locality'
 * @param  {string} pk 主键
 */
fnHistory = function(ns, pk) {
  Meteor.subscribe('oplog', ns, pk);
  return CmsOplog.find({
    'ns': ns,
    'pk': pk
  }, {
    sort: {
      ts: -1
    }
  });
};

/**
 * 更新某条记录
 * @param  {string} ns namespace，如'geo.Locality'
 * @param  {string} pk 主键
 * @param  {string} o  操作码：'i'：插入，'d'：删除，'u'：更新
 * @param  {string} op oplog的数据体
 * @param  {object} custom 其它需要上穿的数据
 */
fnUpdate = function(ns, pk, o, op, custom) {
  check(ns, String);
  check(pk, String);
  check(o, String);
  check(op, String);
  var userId = Meteor.userId();
  var entry = {
    'ts': Date.now(),
    'ns': ns,
    'userId': userId,
    'status': 'staged',
    'pk': pk,
    'o': o,
    'op': op,
  };
  if (custom !== undefined) {
    check(custom, Object);
    entry.custom = custom;
  }
  CmsOplog.insert(entry);
};

storageEngine = {
  // 获得某条记录的修改历史
  'history': fnHistory,
  'update': fnUpdate
};