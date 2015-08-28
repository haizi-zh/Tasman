
// 导航栏下拉列表配置
var naviBarConfig = [{
  name: "数据审核",
  url: "/data-review",
  routeName: "dataReview",
  subItem: [{
    name: "城市数据",
    url: "/data-review/city",
    routeName: "reviewCity"
  }, {
    name: "景点数据",
    url: "/data-review/viewspot",
    routeName: "reviewViewspot"
  }, {
    name: "美食数据",
    url: "/data-review/restaurant",
    routeName: "reviewRestaurant"
  }, {
    name: "购物数据",
    url: "/data-review/shopping",
    routeName: "reviewShopping"
  }, {
    name: "酒店数据",
    url: "/data-review/hotel",
    routeName: "reviewHotel"
    // disable: true
  }]
}, {
  name: "行程攻略",
  url: "/editPlan",
  routeName: "createNewPlan",
  subItem: [{
    name: "审核模板",
    url: "/",
    routeName: ""
  }, {
    name: "新建模板",
    url: "/createNewPlan",
    routeName: "createNewPlan"
  }, {
    name: "编辑攻略",
    url: "/data-review/plan",
    routeName: "reviewPlan"
  // }, {
  //   name: "路线模板",
  //   url: "/data-review/guide",
  //   routeName: "reviewGuide"
  }]
  // subItem: []
}, {
  name: "POI去重",
  url: "#",
  routeName: "",
  subItem: [{
    name: "景点去重",
    url: "/deduplication/viewspot",
    routeName: "dedupViewspot"
  }]
}, {
  name: "运营文章",
  url: "#",
  routeName: "",
  subItem: [{
    name: "文章一览",
    url: "/essay/list",
    routeName: "essayList"
  },{
    name: "文章发布",
    url: "/essay/publish",
    routeName: "essayList"
  }]
}];

Template.header.helpers({
  activeRouteClass: function( /* route names */ ) {
    var args = Array.prototype.slice.call(argumentsessay, 0);
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