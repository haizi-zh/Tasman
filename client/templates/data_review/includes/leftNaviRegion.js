var arr = ['ViewSpotleftRegionNavi', 'LocalityleftRegionNavi', 'HotelleftRegionNavi', 'ShoppingleftRegionNavi', 'RestaurantleftRegionNavi'];

var helpers = {
  province: function() {
    return province;
  },
  continent: function() {
    var countries = continent;
    Meteor.call('getCountriesByContinent', countries, function(error, result) {
      Session.set('countries', result);
      return result;
    });
    return Session.get('countries');
  },
};

var events = {
  'click #tag-domestic': function() {
    $('.abroad').addClass("hidden");
    $('.domestic').removeClass("hidden");
    $('.fc-filter-reset').trigger('click');// 清空国内的筛选
    $('#tag-domestic').css({'background-color': '#337ab7', 'color': 'white'});
    $('#tag-abroad').css({'background-color': '#ccc', 'color': '#333333'});

  },

  'click #tag-abroad': function() {
    $('.domestic').addClass("hidden");
    $('.abroad').removeClass("hidden");
    $('.fc-filter-reset').trigger('click');// 清空国外的筛选
    $('#tag-abroad').css({'background-color': '#337ab7', 'color': 'white'});
    $('#tag-domestic').css({'background-color': '#ccc', 'color': '#333333'});
  },

  'click .continent-tag': function(event) {
    var id = $(event.target).attr('id');
    var lastActive;
    if(id === Session.get('curContinentTag')){
      return;
    }
    if(Session.get('curContinentTag')){
      lastActive = Session.get('curContinentTag');
      $('#countries-' + lastActive).addClass('hidden');
      $('#' + lastActive).css({'background-color': '#ccc', 'color': '#333333'});
    }

    $(event.target).css({'background-color': '#337ab7', 'color': 'white'});
    Session.set('curContinentTag', id);
    $('#countries-' + id).removeClass("hidden");
  },

  'click a.filter-options': function(event) {
    var id = $(event.target).attr('id');
    var lastActive;
    if(id === Session.get('curFilterTag')){
      return;
    }
    if(Session.get('curFilterTag')){
      lastActive = Session.get('curFilterTag');
      $('#' + lastActive).css({'background-color': 'transparent', 'color': '#23527c'});
    }
    $(event.target).css({'background-color': '#337ab7', 'color': '#ffffff'});
    Session.set('curFilterTag', id);
  },
};


for (var i = 0, len = arr.length; i < len; i++ ){
  Template[arr[i]].helpers(helpers);
  Template[arr[i]].events(events);
}