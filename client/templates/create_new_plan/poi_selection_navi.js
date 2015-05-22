Template.poiNavi.helpers({
  'naviItems': function(){
    return [
      {
        'name': '景点',
        'type': 'ViewSpot',
        'status': true
      },
      {
        'name': '美食',
        'type': 'Restaurant'
      },
      {
        'name': '酒店',
        'type': 'Hotel'
      },
      {
        'name': '购物',
        'type': 'Shopping'
      },
      {
        'name': '交通',
        'type': 'Traffic'
      },
      {
        'name': '我的收藏',
        'type': 'Collect'
      }
    ];
  }
});

Template.poiNavi.events({
  'click .list-navi-a': function(event){
    event.preventDefault();
    poiNaviAddActiveCls(event);
    var parent = $(event.target).parent(),
        type = parent.attr('data-type');
    Meteor.cmsPlan.setActivePoiType(type);
  }
});

Template.poiNavi.onRendered(function(){

});

function poiNaviAddActiveCls(event) {
  $(event.target).parent().parent().find('a').removeClass("poi-navi-active")
  $(event.target).addClass("poi-navi-active");
}