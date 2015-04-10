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
    log('上传数据!');
    submitOplog();
  }
});

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

  //op = opLogFormat(op, oriData);
  op = opLogFormat(op);

  var o = 'u';
  var custom = {
    'zhName': oriData.zhName,
  }
  var res = storageEngine.update(ns, pk, o, op, custom);
  // 上传成功，删除oplog记录
  if(res) {
    Session.set('oplog', {});
    alert("提交成功！");
  }else{
    alert("提交失败！");
    //...
  }
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
  } else if (Session.get('currentShoppingId')) {
    ns = 'poi.Shopping';
    pk = Session.get('currentShoppingId');
  } else if (Session.get('currentLocalityId')) {
    ns = 'geo.Locality';
    pk = Session.get('currentLocalityId');
  } else if (Session.get('currentRestaurantId')) {
    ns = 'poi.Restaurant';
    pk = Session.get('currentRestaurantId');
  }
  oriData = storageEngine.snapshot(ns, new Mongo.ObjectID(pk));
  console.log(oriData);
  return {
    ns: ns,
    pk: new Mongo.ObjectID(pk),
    oriData: oriData
  }
};


// 格式化oplog，特别是处理数组字段被改变的情况
opLogFormat = function(op) {
  var filteredKeys = keyWithDot(op);
  var specailKeys = [];
  /* 最大化提取修改数据 , 补充oriData参数*/
  // 修改oriData中对应key
  // for (index in filteredKeys) {
  //   var tempEle = filteredKeys[index];
  //   var tempKeyArr = tempEle.split('.');
  //   var mainKey = tempKeyArr[0];
  //   specailKeys.push(mainKey);
  //   var index = parseInt(tempKeyArr[2]);
  //   var subKey = tempKeyArr[1];
  //   oriData[mainKey][index][subKey] = op[tempEle];
  //   delete op[tempEle]; // 删除不再需要
  // }
  // // 更改op
  // for (key in specailKeys) {
  //   var tempMainKey = specailKeys[key];
  //   op[tempMainKey] = oriData[tempMainKey];
  // }

  /* 最小化提取数据 */
  for (index in filteredKeys) {
    var tempEle = filteredKeys[index];
    var tempKeyArr = tempEle.split('.');
    var formatedKeys = tempKeyArr[0] + '.' + tempKeyArr[2] + '.' + tempKeyArr[1];
    op[formatedKeys] = op[tempEle];
    delete op[tempEle]; // 删除不再需要
  }

  return JSON.stringify({
    '$set': op
  });
}

keyWithDot = function(op) {
  var keys = _.keys(op);
  return keys.filter(function(ele) {
    return ele.split('.').length > 1;
  });
}