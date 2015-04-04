Template.naviTabsViewSpot.events({
  // 切换tabs
  "click .navi-tabs": function(e) {
    var par = $(e.target).parent(),
      clsName = par.attr('class').split('-')[0];
    par.addClass("active");
    par.siblings().removeClass("active");

    $('div.' + clsName).removeClass('hidden').addClass("show");
    $('div.' + clsName).siblings().removeClass('show').addClass("hidden");
  },

  'click #submit-info': function(e) {
    e.preventDefault();
    log('Hello World');
    submitOplog();
  }
});

CmsOplog = new Mongo.Collection('CmsOplog');

submitOplog = function() {
  // 判断是否做了改动
  var op = checkEditStatus();
  if (!op) {
    return;
  }
  var info = sessionInfo();
  var ns = info['ns'],
    pk = info['pk'],
    oriData = info['oriData'];

  op = opLogFormat(oriData, op);

  var o = 'u';
  var custom = {
    'zhName': $('li#' + pk).text()
  }
  storageEngine.update(ns, pk, o, op, custom);
}

// @return: 没有编辑，返回null， 否则返回编辑纪录数据
checkEditStatus = function() {
  var op = Session.get('oplog');
  if (_.keys(op).length === 0) {
    return null;
  } else {
    return op;
  }
};


sessionInfo = function() {
  var ns, pk, oriData;
  if (Session.get('currentVsId')) {
    ns = 'poi.ViewSpot';
    pk = Session.get('currentVsId');
    oriData = ViewSpot.findOne({
      '_id': new Mongo.ObjectID(pk)
    });
  } else if (Session.get('currentShoppingId')) {
    ns = 'poi.Shopping';
    pk = Session.get('currentShoppingId');
    oriData = Shopping.findOne({
      '_id': new Mongo.ObjectID(pk)
    });
  } else if (Session.get('currentLocalityId')) {
    ns = 'geo.Locality';
    pk = Session.get('currentLocalityId');
    oriData = Locality.findOne({
      '_id': new Mongo.ObjectID(pk)
    });
  } else if (Session.get('currentRestaurantId')) {
    ns = 'poi.Restaurant';
    pk = Session.get('currentRestaurantId');
    oriData = Restaurant.findOne({
      '_id': new Mongo.ObjectID(pk)
    });
  }
  return {
    ns: ns,
    pk: pk,
    oriData: oriData
  }
};


// 格式化oplog，特别是处理数组字段被改变的情况
// 只适合二级查询 xxx.xx
opLogFormat = function(oriData, op) {
  check(oriData, Object);
  var filteredKeys = keyWithDot(op);
  var specailKeys = [];
  // 修改oriData中对应key
  for (index in filteredKeys) {
    var tempEle = filteredKeys[index];
    var tempKeyArr = tempEle.split('.');
    var mainKey = tempKeyArr[0];
    specailKeys.push(mainKey);
    var index = parseInt(tempKeyArr[2]);
    var subKey = tempKeyArr[1];
    oriData[mainKey][index][subKey] = op[tempEle];
    delete op[tempEle]; // 删除不再需要
  }
  // 更改op
  for (key in specailKeys) {
    var tempMainKey = specailKeys[key];
    op[tempMainKey] = oriData[tempMainKey];
  }
  log(op);
  return op;
}

keyWithDot = function(op) {
  var keys = _.keys(op);
  return keys.filter(function(ele) {
    return ele.split('.').length > 1;
  });
}