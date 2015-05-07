Template.recheck.onRendered(function(){
  Session.set('recheckItem', {});
});


Template.recheck.helpers({
  collections: function() {
    return [
      {
        'conn': 'poi.ViewSpot',
        'name': '景点'
      },
      {
        'conn': 'poi.Restaurant',
        'name': '美食'
      },
      {
        'conn': 'poi.Shopping',
        'name': '购物'
      },
      {
        'conn': 'poi.Hotel',
        'name': '酒店'
      },
      {
        'conn': 'geo.Locality',
        'name': '城市'
      }
    ]
  },
  'timeLimits': function() {
    return [
      {
        'timeLimit': moment().subtract(3, 'd').startOf('day').unix() * 1000,
        'name': '最近三天',
        'operator': '$gt'
      },
      {
        'timeLimit': moment().subtract(7, 'd').startOf('day').unix() * 1000,
        'name': '最近一周',
        'operator': '$gt'
      },
      {
        'timeLimit': moment().subtract(14, 'd').startOf('day').unix() * 1000,
        'name': '最近两周',
        'operator': '$gt'
      }
    ]
  },
  'checkedItemCnt': function() {
    Session.get('trigger-cal-checked');
    Meteor.call('checkedItemCnt', function(err, res){
      if(!err){
        Session.set('checkedItemCnt', res);
      }
    });
    return Session.get('checkedItemCnt');
  }
});

// Tracker.autorun(function(){
//   Meteor.call('checkedItemCnt', function(err, res){
//     if(!err){
//       Session.set('checkedItemCnt', res);
//     }
//   })
// })

Template.recheck.events({
  'click .recheck-items': function(event) {
    var mid = $(event.target).attr('id');
    if(Session.get('recheckItem') && Session.get('recheckItem').pk === mid) {
      return;
    }
    $(event.target).siblings().removeClass("active");
    $(event.target).addClass("active");

    $('#showModified').prop('checked', false); //将只看修改的按钮取消
    var ns = $(event.target).attr('data-ns');
    Session.set('recheckItem', {'pk': mid, 'ns': ns});
    Meteor.subscribe('oplog', ns, new Mongo.ObjectID(mid), 0);
  },
  'click input[name="ready-online"]': function(event){
    event.preventDefault();
    event.stopPropagation();
    var pk = $(event.target).parent().attr('id');
    if(event.target.checked){
      Meteor.call('ready-online', pk);
    }else{
      Meteor.call('unready-online', pk);
    }
    Session.set('trigger-cal-checked', Date.now());
  },
  'click .select-all': function(event){
    event.preventDefault();
    if($(event.target).hasClass("all-in")){
      // 点击‘全不选’ 的逻辑
      $(event.target).removeClass("all-in");
      $(event.target).text('全选');
      $('input[name="ready-online"]').each(function(index, elem){
        if($(elem).is(':checked')){
          $(elem).trigger('click');
        }
      });
    }else{
      // 点击‘全选’ 的逻辑
      $(event.target).addClass("all-in");
      $(event.target).text('全不选');
      $('input[name="ready-online"]').each(function(index, elem){
        if(!$(elem).is(':checked')){
          $(elem).trigger('click');
        }
      });
    }
  },
  'click .upload-btn': function(event){
    Meteor.call('bulk-upload', function(err, res){
      if(!err){
        alert('上线' + res.count + '个数据');
        Session.set('trigger-cal-checked', Date.now());
      }else{
        alert('批量上线出错');
      }
    });
  }
  // 'click .fc-pager-page': function(event){
  //   event.preventDefault();
  //   $('input[name="ready-online"]').each(function(index, elem){
  //     if(!$(elem).is(':checked')){
  //       $('.select-all').removeClass("all-in");
  //       $('.select-all').text('全选');
  //       return;
  //     }
  //   });
  //   $('.select-all').addClass("all-in");
  //   $('.select-all').text('全不选');
  // }
});