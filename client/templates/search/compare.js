Template.compare.helpers({
  
});

Template.compare.onRendered(function() {
  Session.set('compare-key', 'zhName');
  Session.set('compare-poi-index', '0');
});

Tracker.autorun(function(){
  var key = Session.get('compare-key');
  var poiIndex = Session.get('compare-poi-index');
  $('.compare-items').addClass("hidden");
  $('.compare-items').each(function(index, dom){
    if(key == 'all' && poiIndex != 'all'){
      if($(dom).attr('data-index') == poiIndex){
        $(dom).removeClass("hidden");
      }
    }else if (key != 'all' && poiIndex == 'all'){
      if($(dom).attr('id').split('-')[0] == key){
        $(dom).removeClass("hidden");
      }
    }else if(key != 'all' && poiIndex != 'all'){
      if($(dom).attr('data-index') == poiIndex && $(dom).attr('id').split('-')[0] == key){
        $(dom).removeClass("hidden");
      }
    }
  })
});

Template.compare.events({
  "click input[type='radio']": function(e) {
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
    log(index);
    Session.set('compare-poi-index', index);
    $(e.target).addClass("poi-active").parent().siblings().find('a').removeClass("poi-active");
  },

  'change input[name="select-radio"]': function(e){
    e.preventDefault();
    var index = $('input[name="select-radio"]:checked').val(),
        key = Session.get('compare-key');
    log(index);
    log(key);
    $('li#' + key).find("span").text(parseInt(index) + 1).addClass("label-success");
    compare_select_keys(key, parseInt(index));
  },
  'click .btn-container': function(e) {
    bootbox.dialog({
                title: "合并POI",
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
                            var name = $('#name').val();
                            var saveTo = $("input[name='saveTo']:checked").attr('id');
                            var deleteIds = [];
                            var key_val = Session.get('compare_select_keys');
                            $('input[class="poi-checked-delete"]:checked').each(function(index, dom){
                              deleteIds.push($(dom).attr('id'));
                            })
                            log(deleteIds);
                            poi_merge(key_val, saveTo, deleteIds);
                            // bootbox.hideAll();
                        }
                    },
                }
            });
    $('.ui.checkbox').checkbox();
    $('input[name="saveTo"]').checkbox();
  }
});


// 提取相应的keyValue
compare_select_keys = function(key, index) {
  // body...
  log(key);log(index);
  var temp = Session.get('compare_select_keys') || {};
  temp[key] = index;
  Session.set('compare_select_keys', temp);
};

// 组合数据
merged_fields = function(key_val, items_arr) {
  // body...
  var updateFields = {},
      keys = _.keys(key_val);
  for(var i = 0, len = keys.length; i < len; i++) {
    updateFields[keys[i]] = items_arr[key_val[keys[i]]][keys[i]];
  }
  return updateFields;
};

// 更新数据库：更新，删除冗余的POI
update_db = function(dbName, pk, updateFields, uselessPk) {
  // body...
  Meteor.call('poi-merge-update', dbName, pk, updateFields, uselessPk, function(err, res) {
    if(!err && res.code == 0){
      bootbox.alert("合并成功", function() {

      });
    }
  })
};

// 整合函数
poi_merge = function(key_val, saveTo, uselessPk){
  var compareInfos = Session.get('compareInfos'),
      dbName = compareInfos['dbName'],
      itemInfo = compareInfos['itemInfo'],
      keys = compareInfos['keys'],
      poiIndex = compareInfos['poiIndex'];

  var updateFields = merged_fields(key_val, itemInfo);
  update_db(dbName, saveTo, updateFields, uselessPk);
}
