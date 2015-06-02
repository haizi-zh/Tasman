/**
 * 获取对应省份或者国家的locality列表
 * @param  {Boolean} isAbroad      [description]
 * @param  {[type]}  parentName  	省份名/国家名，由isAbroad来定
 * @return {[type]}                [description]
 */
Meteor.publish('childLocalities', function(isAbroad, parentName) {
  check(isAbroad, Boolean);
  check(parentName, String);
  if (isAbroad) {
  	return LocalityRelations.find({'country.zhName': parentName});
  } else {
  	return LocalityRelations.find({'province.zhName': parentName});
  }
});
