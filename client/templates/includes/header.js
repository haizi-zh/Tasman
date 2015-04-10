var naviBarConfig = [{
  name: "数据审核",
  url: "/data-review",
  routeName: "dataReview",
  subItem: [{
    name: "城市数据",
    url: "/data-review/city/china",
    routeName: "reviewCity"
  }, {
    name: "景点数据",
    url: "/data-review/viewspot/china/北京",
    routeName: "reviewViewspot"
  }, {
    name: "美食数据",
    url: "/data-review/restaurant/china/北京",
    routeName: "reviewRestaurant"
  }, {
    name: "购物数据",
    url: "/data-review/shopping/china/北京",
    routeName: "reviewShopping"
  }, {
    name: "酒店数据－暂无",
    url: "/data-review/hotel/china/北京",
    routeName: "reviewHotel",
    disable: true
  }]
}, {
  name: "IM运营",
  url: "/im",
  routeName: "im",
  subItem: []
}];

Template.header.helpers({
  activeRouteClass: function( /* route names */ ) {
    var args = Array.prototype.slice.call(arguments, 0);
    args.pop();

    var active = _.any(args, function(name) {
      return Router.current() && Router.current().route.getName() === name
    });

    return active && 'active';
  },
  naviBarConfig: function() {
    return naviBarConfig;
  },
  activeTag: '',
  admin : function(){
    return _.indexOf(Meteor.user().rights, 'admin') !== -1
  },
});

Template.header.events({
  'click #logout': function(event, template) {
    Meteor.logout(function(error){
      if(error){
        // TODO
      }
      Router.go('login');
    });
  }
});