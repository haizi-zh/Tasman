var naviBarConfig = [{
  name: "数据审核",
  url: "/data-review",
  routeName: "dataReview",
  subItem: [{
    name: "国家数据",
    url: "/data-review/country",
    routeName: "reviewCountry"
  }, {
    name: "城市数据",
    url: "/data-review/city/china",
    routeName: "reviewCity"
  }, {
    name: "景点数据",
    url: "/data-review/viewspot/china",
    routeName: "reviewViewspot"
  }, {
    name: "美食数据",
    url: "/data-review/food",
    routeName: "reviewFood"
  }, {
    name: "购物数据",
    url: "/data-review/shopping",
    routeName: "reviewShopping"
  }, {
    name: "酒店数据",
    url: "/data-review/hotel",
    routeName: "reviewHotel"
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
  activeTag: ''
});