// if(!ViewSpot) {
//   ViewSpot = new Mongo.Collection('ViewSpot');
// }

Essay = new Mongo.Collection('Essay');
Plan = new Mongo.Collection('Plan');
GuideTemplate = new Mongo.Collection('GuideTemplate');
LocalityRelations = new Mongo.Collection("LocalityRelations");

ViewSpot = new Mongo.Collection('ViewSpot');
Locality = new Mongo.Collection('Locality');
Hotel = new Mongo.Collection('Hotel');
Shopping = new Mongo.Collection('Shopping');
Restaurant = new Mongo.Collection('Restaurant');

var reviewItems = ['Locality', 'ViewSpot', 'Restaurant', 'Hotel', 'Shopping'];
var conn = [Locality, ViewSpot, Restaurant, Hotel, Shopping];

EssayFilter = new Meteor.FilterCollections(Essay, {
  name: 'essayList',
  template: 'essayList',
  sort:{
    order: ['desc', 'asc'],
    defaults: [
      ['timeStamp', 'desc'],
    ]
  },
  pager: {
    options: [3, 6, 9, 15, 30],
    itemsPerPage: 3,
    currentPage: 1,
    showPages: 10
  },
  callbacks: {
    beforeSubscribe: function (query) {
      Session.set('loading', true);
      //return query (optional)
    },
    afterSubscribe: function (subscription) {
      Session.set('loading', false);
    },
    beforeResults: function(query){
      query.selector._id = {$ne: Meteor.userId()};
      return query;
    },
    afterResults: function(cursor){
      var alteredResults = cursor.fetch();
      _.each(alteredResults, function(result, idx){
        var date = new Date(alteredResults[idx].timeStamp);
        alteredResults[idx].timeStamp = getFormatTime(date);
      });
      return alteredResults;
    },
    templateCreated: function(template){},
    templateRendered: function(template){},
    templateDestroyed: function(template){}
  }
  // Other arguments explained later. See Configuration.
});

// 在模板上绑定filter
for(var i = 0, len = reviewItems.length; i < len; i++) {
  (function(dbConn, colName){
    new Meteor.FilterCollections(dbConn, {
      name:  colName + '-list',
      template: colName + 'leftRegionNavi',
      sort: {
        order: ['desc', 'asc'],
        defaults: [
          ['hotnessTag', 'asc']
        ]
      },
      pager: {
        showPages: 7,
      },
      // fields: {'fields': {'_id': 1, 'zhName': 1, 'targets': 1, 'hotness': 1}},  //必须加targets和hotness
      filters: {
        "targets": {
          title: '地理信息',
          condition: '$and',
          searchable: 'true',
          transform: function (value) {
            return new Mongo.ObjectID(value);
          },
        },
        "locList.zhName": {
          title: '国家名字',
          condition: '$and',
          searchable: 'true'
        },
        "zhName": {
          title: '名字',
          operator: ['$regex', 'i'],
          condition: '$and',
          searchable: 'required'
        },
      },
    });
  })(conn[i], reviewItems[i]);
}


/**
 * 获取格式化的时间,当前格式为YYYYMMDDhhmmssms
 * @return {[string]} [description]
 */
function getFormatTime(date){
  var Y = getFormatTimeUnit(date.getFullYear(), 4);    //获取完整的年份(4位,1970-????)
  var M = getFormatTimeUnit(date.getMonth() + 1, 2);       //获取当前月份(0-11,0代表1月)
  var D = getFormatTimeUnit(date.getDate(), 2);        //获取当前日(1-31)
  var h = getFormatTimeUnit(date.getHours(), 2);       //获取当前小时数(0-23)
  var m = getFormatTimeUnit(date.getMinutes(), 2);     //获取当前分钟数(0-59)
  var s = getFormatTimeUnit(date.getSeconds(), 2);     //获取当前秒数(0-59)
  // var ms = getFormatTimeUnit(date.getMilliseconds(), 3);    //获取当前毫秒数(0-999)
  return Y + '/' + M + '/' + D + ' ' + h + ':' + m + ':' + s;
}

/**
 * 获得格式化(定长)的时间单元(年，月，日，时，分，秒)
 * @param  {[number]} timeUnit 原时间单元数值
 * @param  {[number]} l        长度
 * @return {[string]}          格式化的时间单元字符串
 */
function getFormatTimeUnit(timeUnit, l){
  var temp = (timeUnit) ? timeUnit + '' : '';
  for (var i = 1;i < l;i++){
    temp = parseInt(temp / 10);
    if (!temp)
      timeUnit = '0' + timeUnit;
  }
  return timeUnit;
}
