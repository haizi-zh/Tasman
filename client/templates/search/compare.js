Template.compareComfirm.events({
  'change input[name="saveTo"]': function(e){
    log('23')
    var name = $(e.target).next().html();
    log(name);
  }
});

Template.compare.onRendered(function() {
  Session.set('compare-key', 'zhName');
  Session.set('compare-poi-index', 'all-poi');
  Meteor.setTimeout(function(){
    Session.set('trigger-autorun', Date.now());
    $('#zhName').trigger('click');
    $('#all-poi').trigger("click");
  }, 1000);
});

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
  'click .merge-btn-container': function(e) {
    bootbox.dialog({
                title: "POI 合并",
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
                            Session.set('compare-save-to', {'id': saveTo, 'name': name, 'type': type});
                            var deleteIds = [];
                            var key_val = Session.get('compare_select_keys');
                            $('input[class="poi-checked-delete"]:checked').each(function(index, dom){
                              deleteIds.push($(dom).attr('id'));
                            })
                            log(deleteIds)
                            poi_merge(key_val, saveTo, deleteIds);
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
    var targetInfo = Session.get('compare-save-to'),
      name = targetInfo.name,
      id = targetInfo.id,
      type = targetInfo.type,
      directUrl = urlForDetail(type, id);
    var redirectInfo = {
      'desc': '即将跳转到合并后POI',
      'content': name,
      'directUrl': directUrl,
      'limitTime': 5,
    };

  Meteor.call('poi-merge-update', dbName, pk, updateFields, uselessPk, function(err, res) {

    if(!err && res.code == 0){
      bootbox.dialog({
          title: "界面跳转",
          message: Blaze.toHTMLWithData(Blaze.Template.redirect, redirectInfo),
          buttons: {
              success: {
                  label: "立即跳转",
                  className: "btn-success",
                  callback: function () {
                      Router.go(type.toLowerCase() + 'Detail', {'id': id});
                  }
              },
          }
      });
      timeCountDown(5, function(){
        Router.go(type.toLowerCase() + 'Detail', {'id': id});
        bootbox.hideAll();
      });
    }
  });
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

urlForDetail = function(type, id){
  return '/' + type + '/' + id;
}
