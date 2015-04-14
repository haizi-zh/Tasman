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
        'name': '酒店'
      },
      {
        'conn': 'poi.Shopping',
        'name': '购物'
      },
      {
        'conn': 'poi.Hotel',
        'name': '住宿'
      },
      {
        'conn': 'geo.Locality',
        'name': '城市'
      },
    ]
  },
  timeLimits: function() {
    return [
      {
        'timeLimit': moment().day(-3).unix() * 1000 + moment().milliseconds(),
        'name': '最近三天',
        'operator': '$gt'
      },
      {
        'timeLimit': moment().day(-7).unix() * 1000 + moment().milliseconds(),
        'name': '最近一周',
        'operator': '$gt'
      },
      {
        'timeLimit': moment().day(-14).unix() * 1000 + moment().milliseconds(),
        'name': '最近两周',
        'operator': '$gt'
      }
    ]
  },
});

Template.recheck.events({
  'click .recheck-items': function(event, template) {
    var mid = $(event.target).attr('id');
    if(Session.get('recheckItem') && Session.get('recheckItem').pk === mid) {
      return;
    }
    var ns = $(event.target).attr('data-ns');
    Session.set('recheckItem', {'pk': mid, 'ns': ns});
    log('当前的recheckItem Session');
    log(Session.get('recheckItem'));
  },
});