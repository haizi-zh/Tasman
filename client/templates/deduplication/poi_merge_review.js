Template.poiMergeReview.onRendered(function () {
  // Session.set('poiMergeInfo', {});
  Tracker.autorun(function() {
    var compareItems = Session.get('poiMergeInfo').compareItems,
        type = compareItems[0],
        items = compareItems.slice(1);

    Meteor.subscribe(type + '_Cmp', items);
    console.log('rerun');

    var ids = [];
    items.map(function(item){ids.push(new Mongo.ObjectID(item))});
    // 一次找出所有的POI，存到multiCompItems中
    var multiCompItems = ViewSpot.find({'_id': {'$in': ids}}).fetch();

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

    Meteor.setTimeout(function() {
      var fieldrefer = Session.get('poiMergeInfo').fieldrefer;
      $('.compare-key').each(function(idx, dom) {
        var key = $(dom).attr('id');
        if (fieldrefer[key] !== undefined) {
          var index = Number(fieldrefer[key]) + 1;
          $(dom).find('span').text(index);
        }
      });
      // $('#desc').click();
    }, 1000);
  });

});

PoiMergeInfo = new Mongo.Collection('PoiMergeInfo');


/*
cmpElements : allReviewItem,
      poiIndex: poiIndex,
      keyArray: keyArray,
*/

Template.poiMergeReview.helpers({
  'mergedItems': function() {
    return PoiMergeInfo.find({});
  },
  'admin': function () {
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
  }
});

Template.poiMergeReview.events({
  'click .pmr-merged-poi-item': function (e) {
    // Session.setPersistent('compareItems', this.compareItems);
    // Router.go('compare', {'id': this._id});
    var id = $(e.target).attr('data-id');
    console.log(id);
    var poiMergeInfo = PoiMergeInfo.findOne({'_id': id});
    Session.set('poiMergeInfo', poiMergeInfo);
  }
});