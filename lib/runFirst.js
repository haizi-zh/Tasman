if (Meteor.isClient) {
  Meteor.startup(function () {
    Session.set('submitted', true);
    Session.set('curSearchCollection', 'Locality');
    // 下方的Session初始化是一个数组，用一个字符串做占位符，后面用items的类型进行替换
    Session.set('compareItems', ['location for items type']);
  });
  cols = ['ViewSpot', 'Locality', 'Restaurant', 'Shopping', 'Hotel'];
  colSelection = {};
  cols.map(function(key) {
    colSelection[key] = false
  });
  colSelection['Locality'] = true;
}

if (Meteor.isClient) {
  Meteor.startup(function() {
    Session.set('vsIds', {'p': 'not empty'});
    Session.set('oplog', {});

    // diff中session初始化
    Session.set('recheckBaseData', []);
    Session.set('recheckCompareData', []);

    // statistic中的session初始化
    var curWeekDay = moment().day();//今天是周几
    Session.set("statisticsStartDate", moment().startOf('day').subtract((curWeekDay || 7)- 1, 'day').unix());
    Session.set("statisticsEndDate", moment().startOf('day').add(7 - (moment().day() || 7), 'day').unix());
  })
}

if (Meteor.isClient) {
  Meteor.startup(function() {
    CmsOplog = new Mongo.Collection('CmsOplog');
  })
}

Meteor.startup(function(){
  log = function(msg){
    console.log(msg);
  }
})