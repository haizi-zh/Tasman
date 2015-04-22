OplogPkList = new Mongo.Collection('OplogPkList');

HomeFilter = new Meteor.FilterCollections(OplogPkList, {
  name: 'oplog-pk-list',
  template: 'recheck',
  sort: {
    order: ['desc', 'asc'],
    defaults: [
      ['ts', 'asc']
    ]
  },
  filters: {
    "editorId": {
      title: '编辑人员',
      condition: '$and',
      searchable: 'true'
    },
    "ts": {
      title: '编辑时间',
      condition: '$and',
      transform: function (value) {
        return parseInt(value);
      },
      sort: 'desc'
    },
    "ns": {
      title: '数据类型',
      condition: '$and',
      sort: 'desc',
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