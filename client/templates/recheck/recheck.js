Template.recheck.onRendered(function(){
  
});

Template.recheck.helpers({
  collections : function(){
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
  }
});