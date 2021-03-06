Images = new Mongo.Collection('Images');

createOriginTextMD5 = function(arrayData) {
  var tempObj = {};
  for (var i in arrayData) {
    var temp = arrayData[i];
    var tempValue = temp.value;

    //假如该数据的该字段没有定义，则temp.value为undefined
    tempObj[temp.keyChain] = tempValue ? cmsMd5(tempValue.toString()) : tempValue;
  }
  Session.set('originMD5', tempObj);
};

cmsMd5 = function(string) {
  return CryptoJS.MD5($.trim(string)).toString();
};

initOplogSession = function() {
  Session.set('oplog', {});
};

initOriginMD5Session = function() {
  Session.set('originMD5', {});
};


// 递归实现自动render模版，
/**
@params: {object} items
@params: {Number} index 数组字段的元素索引
*/

/*
@params: {object} items 以当前结点为根结点的树结构，来自reviewItems
@params: {string} tabName basic/traffic/feature
@params: {object} data 当前树结构对应的数据
@params: {object} outPutData 所有要输出的数据数组
@params: {object} keyChain 当前数据(string or int)对应的键
@params: {object} index 
*/
organizeReviewData = function(items, tabName, data, outPutData, keyChain, index) {
  var inheritKey = keyChain || '';
  var keys = _.keys(items); // 当前dom要展示的数据的key
  for (var i in keys) {
    var key = keys[i];
    var zhLabel = items[key][itemIndex.zhDesc];
    var dataType = items[key][itemIndex.dataType];
    var tplData = {};

    //当前数据为字符串(string), 整型(int), 字符串数组(str_array)时
    if (dataType === itemDataType.string || dataType === itemDataType.int || dataType === itemDataType.str_array) {
      var newKey = inheritKey ? (inheritKey + '-' + key) : key;
      tplData = {
          'zhLabel': zhLabel,
          'keyChain': index ? newKey + '-' + (index -1) : newKey,
          'value': data[key] || " ",// 保证所有字段存在数据，否则本次数据为空时，刷新数据时会保留上次的数据
          'tabName': {},
          'index': index,
          'dataType': dataType,
          'richEditor': items[key][itemIndex.richEditor],
          'strArray': dataType === itemDataType.str_array
        }
        // 放入到特定的Tab中
      tplData.tabName[tabName] = true;
      outPutData.push(tplData);
    }

    //当前数据为对象数组(obj_array)时
    if (dataType === itemDataType.obj_array) {
      var tempData = data[key]; //递归使用的数据
      var tempItems = items[key][itemIndex.childInfo];
      var tempIndex = 0;
      for (var i in tempData) {
        var element = tempData[i];
        tempIndex = tempIndex + 1;
        organizeReviewData(tempItems, tabName, element, outPutData, key, tempIndex);
      }
    }

    // TODO 实现更多的规则
  }
};

/**
 * 将数据格式化
 * @param  {String} type       poiType: 'Locality','Restaurant','Shopping','ViewSpot'
 * @param  {Object} data       poiData: storageEngine获取的修改过的数据
 * @param  {Object} outPutData 返回的数据
 */
review = function(type, data, outPutData) {
  var itemsForReview = reviewItems[type];
  var classify = _.keys(itemsForReview);
  for (var index in classify) { // 选择dom区域:basic,traffic,feature
    var tabName = classify[index];
    var items = itemsForReview[tabName]; // 当前dom要展示的数据
    organizeReviewData(items, tabName, data, outPutData);
  }
};
