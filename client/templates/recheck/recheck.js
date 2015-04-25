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
});

Template.recheck.events({
  'click .recheck-items': function(event, template) {
    var mid = $(event.target).attr('id');
    if(Session.get('recheckItem') && Session.get('recheckItem').pk === mid) {
      return;
    }
    var ns = $(event.target).attr('data-ns');
    Session.set('recheckItem', {'pk': mid, 'ns': ns});
  },
});