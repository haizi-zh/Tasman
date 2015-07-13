Template.citySelection.helpers({
  'currentCity': function(){
    return Meteor.cmsPlan.locality.get();
  }
});


Template.citySelection.events({
  'click .sel-city-letterbar a': function(event){
    event.preventDefault();
    var letter = $(event.target).text();
    var height;
    $('.sel-city-td-letter').find('div').each(function(index, dom){
      if(letter === $(dom).text()) {
        height = $(dom).position().top;
      }
    });
    $('#selCityPlaceListId').scrollTop(height);//animate({'scrollTop': height}, 1000);
  },
  'click .change-city': function(event){
    event.preventDefault();
    $('.city-selection-pannel').toggle();
  },
  'click tbody tr td a': function(event){
    var cityName = $(event.target).text();
    Meteor.cmsPlan.locality.set(cityName);
    $('.city-selection-pannel').toggle();
  }
});



Template.citySelection.onRendered(function(){
  baiduIpLocation();
});



function baiduIpLocation(){
  var baiduIPLocationUrl = 'http://api.map.baidu.com/location/ip?ak=snrbSxHneKfweSd8SQbVrKeh'
  $.ajax({
    'url': baiduIPLocationUrl,
    'method': "GET",
    'dataType': "jsonp",
    'success': function(res){
      if(res.status === 0){
        Meteor.cmsPlan.locality.set(res.address.split('|')[2]);
      }
    }
  });
}