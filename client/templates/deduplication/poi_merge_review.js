PoiMergeInfo = new Mongo.Collection('PoiMergeInfo');


/**
 * 分页操作
 */
new Meteor.FilterCollections(PoiMergeInfo, {
  name: 'PoiMergeInfo-list',
  template: 'poiMergeReview',
  sort: {
    order: ['desc', 'asc'],
    defaults: [
      ['ts', 'asc']
    ],
  },
  pager: {
    itemsPerPage: 8,
  },
  filters: {
    "editor": {
      title: '编辑人员',
      condition: '$and',
    },
    "ts": {
      title: '编辑时间',
      condition: '$and',
      transform: function (value) {
        return parseInt(value);
      },
    },
    'onlineStatus': {
      title: '上线状态',
      condition: '$and',
      transform: function (value) {
        return parseInt(value) === 1;
      },
    },
  }
});

Template.poiMergeReview.onRendered(function () {
  Tracker.autorun(function() {
    if (!Session.get('poiMergeInfo')) {
      return;
    }
    var compareItems = Session.get('poiMergeInfo').compareItems,
        type = compareItems[0],
        items = compareItems.slice(1);

    Meteor.subscribe(type + '_Cmp', items);
    // console.log('rerun');

    // var ids = [];
    // items.map(function(item){ids.push(new Mongo.ObjectID(item))});
    // 一次找出所有的POI，存到multiCompItems中
    // var multiCompItems = ViewSpot.find({'_id': {'$in': ids}}).fetch();
    var multiCompItems = items.map(function(item) {
      return ViewSpot.findOne({'_id': new Mongo.ObjectID(item)});
    });

    var resArray = [],
        poiIndex = [];
    for(var i = 0, len = multiCompItems.length; i < len; i++) {
      poiIndex.push({'index': i, 'zhName': multiCompItems[i].zhName, 'id': multiCompItems[i]._id._str});
      var vsDetail = [];
      // 调用已经写好的函数（poi编辑中也用到这个函数），构建poi展示信息的数据结构，存在vsDetail中
      review(type, multiCompItems[i], vsDetail);
      resArray.push(vsDetail);
    }
    var allReviewItem = [];
    for(var row = 0, rowLen = resArray.length; row < rowLen; row++) {
      var tempPOI = resArray[row];
      for(var col = 0, colLen = tempPOI.length; col < colLen; col++) {
        tempPOI[col]['belongIndex'] = row;
        allReviewItem.push(tempPOI[col]);
      }
    }
    // function defined in review_items.js，不需要合并名称和别名
    var keyArray = getReviewItems(type).filter(function(key){
      return key.value !== 'zhName' && key.value !== 'alias';
    });
    delete keyArray.zhName, delete keyArray.alias;
    // Session.set('compareInfos', {'dbName': type, 'itemInfo': multiCompItems, 'keys': keyArray, 'poiIndex': poiIndex});
    Session.set('poiIndex', poiIndex);
    Session.set('keyArray', keyArray);
    Session.set('cmpElements', allReviewItem);

    Session.set('compare_select_keys', Session.get('poiMergeInfo').fieldrefer);

    Meteor.setTimeout(function() {
      var fieldrefer = Session.get('poiMergeInfo').fieldrefer;
      $('.compare-key').each(function(idx, dom) {
        var key = $(dom).attr('id');
        $(dom).find('span').text('?');
        $(dom).find('span').removeClass("label-success");
        if (fieldrefer[key] !== undefined) {
          console.log(fieldrefer[key]);
          var index = Number(fieldrefer[key]) + 1;
          $(dom).find('span').addClass("label-success").text(index);
        }
      });
    }, 1000);
  });

});

Template.poiMergeReview.helpers({
  'reviewStatus': function () {
    return true;
  },
  'cmpElements': function () {
    return Session.get('cmpElements');
  },
  'poiIndex': function() {
    return Session.get('poiIndex');
  },
  'keyArray': function() {
    return Session.get('keyArray');
  },
  'timeLimits': function() {
    return [
      {
        'timeLimit': moment().subtract(1, 'd').startOf('day').unix() * 1000,
        'name': '最近一天',
        'operator': '$gt'
      },
      {
        'timeLimit': moment().subtract(3, 'd').startOf('day').unix() * 1000,
        'name': '最近三天',
        'operator': '$gt'
      },
      {
        'timeLimit': moment().subtract(7, 'd').startOf('day').unix() * 1000,
        'name': '最近一周',
        'operator': '$gt'
      }
    ]
  },
  'dataStatus': function() {
    return [
      {
        'status': 1,
        'name': '已上线'
      },
      {
        'status': 0,
        'name': '未上线'
      },
    ]
  },

});

Template.poiMergeReview.events({
  'click .pmr-merged-poi-item': function (e) {
    e.preventDefault();
    e.stopPropagation();
    var id = $(e.target).attr('data-id');
    var poiMergeInfo = PoiMergeInfo.findOne({'_id': id});
    Session.set('poiMergeInfo', poiMergeInfo);
  }
});