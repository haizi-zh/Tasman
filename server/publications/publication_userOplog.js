/**
 * 发布需要的oplog数据
 * @param  {object} query		譬如{userId:... , ts:... , ...}
 * @return {[type]}        [description]
 */
Meteor.publish('userOplog', function(query) {
	check(query, Object);
  return CmsOplog.find(query);
});
