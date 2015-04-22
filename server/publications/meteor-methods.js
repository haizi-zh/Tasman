Meteor.methods({
  'search': function(collection, keyword){
    check(collection, String);
    check(keyword, String);

    var regexContent = '^' + keyword,
        re = new RegExp(regexContent),
        curDB;
    if(collection === "ViewSpot") {
      curDB = ViewSpot;
    }else if('Locality' === collection) {
      curDB = Locality;
    }else if('Hotel' === collection) {
      curDB = Hotel;
    }else if('Shopping' === collection) {
      curDB = Shopping;
    }else if('Restaurant' === collection) {
      curDB = Restaurant;
    }
    return curDB.find({'alias': {'$regex': re}}, {fields: {zhName: 1, desc: 1}, sort: {hotness: -1}}).fetch();
  },
  // 根据洲的名字，查找国家
  'getCountriesByContinent': function(continents) {
    check(continents, Array);
    continents.map(function(ct) {
      var name = ct['continentName'];
      ct['countries'] = Country.find({'zhCont': name},  {'fields': {'zhName': 1, '_id': 1}}).fetch();
    })
    return continents;
  }
});