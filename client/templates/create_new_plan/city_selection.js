Tracker.autorun(function() {
  var cityName = Session.get('curCity');
  Meteor.call('cityName-to-cityId', cityName, function(err, res){
    if(!err && res) {
      Session.set('curCityId', res._id._str);
    }
  });
});


Template.citySelection.helpers({
  'currentCity': function(){
    return Session.get('curCity');
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
        log($(dom));
      }
    });
    console.log(height);
    // $('#selCityPlaceListId').scrollTop(0);
    // TODO：现在的滚动存在问题
    $('#selCityPlaceListId').scrollTop(height);//animate({'scrollTop': height}, 1000);
  },
  'click .change-city': function(event){
    event.preventDefault();
    $('.city-selection-pannel').toggle();
  },
  'click tbody tr td a': function(event){
    var cityName = $(event.target).text();
    Session.set('curCity', cityName);
    $('.city-selection-pannel').toggle();
  }
});



Template.citySelection.onRendered(function(){
  baiduIpLocaltion();
});



function baiduIpLocaltion(){
  var baiduIPLocationUrl = 'http://api.map.baidu.com/location/ip?ak=snrbSxHneKfweSd8SQbVrKeh'
  $.ajax({
    'url': baiduIPLocationUrl,
    'method': "GET",
    'dataType': "jsonp",
    'success': function(res){
      if(res.status === 0){
        Session.set('curCity', res.address.split('|')[2]);
      }
    }
  });
}