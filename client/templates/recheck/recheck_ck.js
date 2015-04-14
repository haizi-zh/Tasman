Template.recheck.onRendered(function(){
  Session.set('recheckItem', undefined);
});


Template.recheck.helpers({
  collections: function(){
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

  // items: function(){
  //   return [
  //     {'pk': 1, 'zhName': 'Hello', 'opCount': 3},
  //     {'pk': 2, 'zhName': 'World', 'opCount': 7}
  //   ]
  // }
});
// Session.set('aizouTag', {});

Template.recheck.events({
  'click .recheck-items': function(event, template) {
    var mid = $(event.target).attr('id');
    // TODO 判断session的改变，触发helper运行

  },
});