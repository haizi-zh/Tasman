var arr = ['ViewSpotleftRegionNavi', 'LocalityleftRegionNavi', 'HotelleftRegionNavi', 'ShoppingleftRegionNavi', 'RestaurantleftRegionNavi'];

var helpers = {
  // country.js中
  province: function() {
    return provinceArray;
  },

  // 一次全部获取!
  continent: function() {
    Meteor.call('getCountriesByContinent', continentArray, function(error, result) {
      Session.set('countries', result);
    });
    return Session.get('countries');
  },

  // 根据省份(国内)/国家(国外)的选择查找相应locality
  cities: function() {
    var mid = Session.get('curFilterTag');
    console.log('输出Id' + mid);
    Meteor.call('getCitiesByLocalityId', mid, Session.get('abroad'), function(err, res){
      Session.set('navi-cities', res);
    });
    return Session.get('navi-cities');
  }
};

var events = {
  // 切换国内
  'click #tag-domestic': function() {
    $('.abroad').addClass("hidden");
    $('.domestic').removeClass("hidden");
    $('.fc-filter-reset').trigger('click');// 清空国内的筛选
    $('#tag-domestic').css({'background-color': '#337ab7', 'color': 'white'});
    $('#tag-abroad').css({'background-color': '#ccc', 'color': '#333333'});

  },

  // 切换国外
  'click #tag-abroad': function() {
    $('.domestic').addClass("hidden");
    $('.abroad').removeClass("hidden");
    $('.fc-filter-reset').trigger('click');// 清空国外的筛选
    $('#tag-abroad').css({'background-color': '#337ab7', 'color': 'white'});
    $('#tag-domestic').css({'background-color': '#ccc', 'color': '#333333'});
  },

  // 选择"大洲"
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

  // 选择"国家"(国外)或者"省份"(国内)
  'click a.filter-options': function(event) {
    var id = $(event.target).attr('id');
    Session.set('abroad', $(event.target).attr('data-abroad') == '1');
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

  // 选择"城市"
  'click a.filter-city': function(event) {
    var id = $(event.target).attr('id');
    var lastActive;
    if(id === Session.get('curFilterCityTag')){
      return;
    }
    if(Session.get('curFilterCityTag')){
      lastActive = Session.get('curFilterCityTag');
      $('#' + lastActive).css({'background-color': 'transparent', 'color': '#23527c'});
    }
    $(event.target).css({'background-color': '#337ab7', 'color': '#ffffff'});
    Session.set('curFilterCityTag', id);
  },
};


for (var i = 0, len = arr.length; i < len; i++ ){
  Template[arr[i]].helpers(helpers);
  Template[arr[i]].events(events);
}




