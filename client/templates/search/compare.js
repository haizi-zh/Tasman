Template.compareComfirm.events({
  'change input[name="saveTo"]': function(e){
    var name = $(e.target).next().html();
    log(name);
  }
});

Template.compare.onRendered(function() {
  Session.set('compare_select_keys', {});
  Session.set('compare-key', 'zhName');
  Session.setDefault('poiMergedInfoID', undefined);
  Session.set('compare-poi-index', 'all-poi');
  Meteor.setTimeout(function(){
    Session.set('trigger-autorun', Date.now());
    $('#zhName').trigger('click');
    $('#all-poi').trigger("click");
  }, 1000);
});


/**
 * POI + 比较的Key 的连动
 */
Tracker.autorun(function(){
  var trigger = Session.get('trigger-autorun');
  var key = Session.get('compare-key');
  var poiIndex = Session.get('compare-poi-index');
  $('.compare-items').addClass("hidden");
  $('.compare-items').each(function(index, dom){
    if(key == 'all-key' && poiIndex != 'all-poi'){
      if($(dom).attr('data-index') == poiIndex){
        $(dom).removeClass("hidden");
      }
    }else if (key != 'all-key' && poiIndex == 'all-poi'){
      if($(dom).attr('id').split('-')[0] == key){
        $(dom).removeClass("hidden");
      }
    }else if(key != 'all-key' && poiIndex != 'all-poi'){
      if($(dom).attr('data-index') == poiIndex && $(dom).attr('id').split('-')[0] == key){
        $(dom).removeClass("hidden");
      }
    }else{
      $('.compare-items').removeClass("hidden");
    }
  })
});


Template.compare.helpers({
  admin: function () {
    return _.indexOf(Meteor.user().rights, 'admin') !== -1
  },
});


Template.compare.events({
  "click input[name='select-radio']": function(e) {
    var mid = $(e.target).val(),
        name = $(e.target).attr('name');
    $('.cmp_' + name).addClass("compared");
    $(e.target).parent().addClass("cmp_selected");
  },

  "click .compare-key": function(e){
    e.preventDefault();
    var key = $(e.target).attr('id'),
        curSelectIndex = $(e.target).find('span').text();

    Session.set('compare-key', key);
    $(e.target).addClass("item-active").siblings().removeClass("item-active");
    if(curSelectIndex == '?') {
      $('input[name="select-radio"]').prop("checked", false);
    }else {
      var tempIndex = parseInt(curSelectIndex) - 1;
      $('input[name="select-radio"]').filter('[value=' + tempIndex + ']').prop('checked', true);
    }
  },

  "click .compare-poi-navi": function(e){
    e.preventDefault();
    var index = $(e.target).attr('id');
    Session.set('compare-poi-index', index);
    $(e.target).addClass("poi-active").parent().siblings().find('a').removeClass("poi-active");
  },

  'change input[name="select-radio"]': function(e){
    e.preventDefault();
    var index = $('input[name="select-radio"]:checked').val(),
        key = Session.get('compare-key');
    $('li#' + key).find("span").text(parseInt(index) + 1).addClass("label-success");
    compare_select_keys(key, parseInt(index));
  },
  'click .push-online-btn-container': function (e) {
    var id = Router.current().params.id;
    Meteor.call('pushMergedInfoOnline', id, function(err, res) {
      if (!err && res.code === 0) {
        $('.push-online-btn-container').find('span').text('上线成功');
      }
    });
  },
  'click .save-merge-info': function(e) {
    if(_.keys(Session.get('compare_select_keys')).length === 0){
      alert('未做修改！');
      return;
    }
    bootbox.dialog({
                title: "数据合并到?",
                message: Blaze.toHTMLWithData(Blaze.Template.compareComfirm, {'pois': Session.get('compareInfos')['poiIndex']}),
                buttons: {
                    cancel: {
                        label: "取消",
                        className: "btn-danger",
                        callback: function() {
                          bootbox.hideAll();
                        }
                      },
                    success: {
                        label: "确定",
                        className: "btn-success",
                        callback: function () {
                            Session.set('compare-save-to', {});
                            var saveTo = $("input[name='saveTo']:checked").attr('id');
                            var name = $("input[name='saveTo']:checked").next().html();
                            var type = Session.get('compareInfos').dbName;
                            var uselessPk = [];
                            Session.get('compareInfos')['poiIndex'].map(function(poi) {
                              if(poi.id !== saveTo) {
                                uselessPk.push(poi.id);
                              }
                            });
                            Session.set('compare-save-to', {'id': saveTo, 'name': name, 'type': type});
                            var key_val = Session.get('compare_select_keys');
                            poi_merge(key_val, saveTo, uselessPk);
                        }
                    },
                }
            });
    $('.ui.checkbox').checkbox();
    $('input[name="saveTo"]').checkbox();
    $("input[name='saveTo']").on('click', function(){
      $('.ui.checkbox').checkbox('enable');
      $("input[name='saveTo']:checked").siblings("div").checkbox('uncheck').checkbox('disable');
    })
  },
  'click .push-data-online': function (e) {
    e.stopPropagation();
    var newFieldrefer = Session.get('compare_select_keys'),
        oldFieldrefer = Session.get('poiMergeInfo').fieldrefer,
        mid = Session.get('poiMergeInfo')._id,
        updateFields = {};

    // 判断是否有改动
    var diffTag = false;
    // 有字段改变
    Object.keys(newFieldrefer).forEach(function(k) {
      if (!oldFieldrefer.hasOwnProperty(k) || oldFieldrefer[k] !== newFieldrefer[k]) {
        diffTag = true;
      }
    });
    // 长度不一致
    if (Object.keys(newFieldrefer).length !== Object.keys(oldFieldrefer).length) {
      diffTag = true;
    }
    var info = {
      mid: mid,
      diffTag: diffTag,
    };
    if (diffTag) {
      info.newFieldrefer = newFieldrefer;
    }

    Meteor.call('push-merge-info-online', info, function (err, res) {
      if (!err && res.code === 0) {
        throwError('合并成功');
      }
    });
  }
});

// 设置Session相应的key-Value
function compare_select_keys (key, index) {
  var temp = Session.get('compare_select_keys') || {};
  temp[key] = index;
  Session.set('compare_select_keys', temp);
}


// 整合函数
function poi_merge (key_val, saveTo, uselessPk) {
  var compareInfos = Session.get('compareInfos'),
      dbName = compareInfos['dbName'],
      itemInfo = compareInfos['itemInfo'],
      keys = compareInfos['keys'],
      poiIndex = compareInfos['poiIndex'];
  var updateFields = merged_fields(key_val, itemInfo);
  update_db(dbName, saveTo, updateFields, uselessPk);
}


// 组合数据
function merged_fields (key_val, items_arr) {
  var updateFields = {},
      keys = _.keys(key_val);
  for(var i = 0, len = keys.length; i < len; i++) {
    updateFields[keys[i]] = items_arr[key_val[keys[i]]][keys[i]];
  }
  return updateFields;
}


// 更新数据库：更新，删除冗余的POI
function update_db (dbName, saveTo, updateFields, uselessPk) {
  var pois = Session.get('compareInfos').poiIndex,
      desc = '',
      poiType = dbName,
      mainPoi = {},
      mergedPois = [],
      mergedFields = updateFields;

  var desc_merged_poi_name = '[';
  var desc_main_poi_name = '';
  // 获取mainPoi, mergedPois和构建desc的数据
  pois.forEach(function (poi) {
    if (poi.id !== saveTo) {
      mergedPois.push({
        'id': new Mongo.ObjectID(poi.id),
        'zhName': poi.zhName
      });
      desc_merged_poi_name += poi.zhName + '，';
    } else {
      desc_main_poi_name = poi.zhName;
      mainPoi = {
        'id': new Mongo.ObjectID(poi.id),
        'zhName': poi.zhName
      };
    }
  });
  desc_merged_poi_name = desc_merged_poi_name.substr(0, desc_merged_poi_name.length - 1) + ']';
  desc = desc_main_poi_name + ' <<< ' + desc_merged_poi_name;
  alias = [];
  // _.union
  Session.get('compareInfos').itemInfo.map(function (item) {
    alias.push(item.alias);
  });
  mergedFields.alias = _.uniq(_.flatten(alias));
  var infos = {
    '_id': Session.get('poiMergedInfoID'),
    'desc': desc,
    'poiType': poiType,
    'mainPoi': mainPoi,
    'mergedPois': mergedPois,
    'mergedFields': mergedFields,
    'compareItems': Session.get('compareItems'),
    'fieldrefer': Session.get('compare_select_keys')
  };

  Meteor.call('submitPoiMergeInfo', infos, function(err, res) {
    if (!err && res.code === 0) {
      alert('合并成功');
      Session.set('poiMergedInfoID', res.mid);
    }
  });
}


function urlForDetail (type, id){
  return '/' + type + '/' + id;
}
