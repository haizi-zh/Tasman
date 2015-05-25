// if(!ViewSpot) {
//   ViewSpot = new Mongo.Collection('ViewSpot');
// }
Plan = new Mongo.Collection('Plan');
GuideTemplate = new Mongo.Collection('GuideTemplate');

ViewSpot = new Mongo.Collection('ViewSpot');
Locality = new Mongo.Collection('Locality');
Hotel = new Mongo.Collection('Hotel');
Shopping = new Mongo.Collection('Shopping');
Restaurant = new Mongo.Collection('Restaurant');

var reviewItems = ['Locality', 'ViewSpot', 'Restaurant', 'Hotel', 'Shopping'];
var conn = [Locality, ViewSpot, Restaurant, Hotel, Shopping];

for(var i = 0, len = reviewItems.length; i < len; i++) {
  (function(dbConn, colName){
    new Meteor.FilterCollections(dbConn, {
      name:  colName + '-list',
      template: colName + 'leftRegionNavi',
      sort: {
        order: ['desc', 'asc'],
        defaults: [
          ['hotness', 'desc']
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