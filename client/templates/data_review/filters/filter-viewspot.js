// if(!ViewSpot) {
//   ViewSpot = new Mongo.Collection('ViewSpot');
// }

ViewSpot = new Mongo.Collection('ViewSpot');

ViewSpotFilter = new Meteor.FilterCollections(ViewSpot, {
  name: 'ViewSpot-list',
  template: 'reviewViewspot',
  sort: {
    order: ['desc', 'asc'],
    defaults: [
      ['hotness', 'desc']
    ]
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