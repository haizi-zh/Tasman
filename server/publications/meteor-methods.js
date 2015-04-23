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
  },

  //
  'getCitiesByLocalityId': function(mid, abroad) {
    check(mid, String);
    check(abroad, Boolean);
    var selector, index;
    if(abroad) {
      selector = {'locList._id': new Mongo.ObjectID(mid), 'locList': {'$size': 2}};
      index = 1;
    } else {
      selector = {'locList._id': new Mongo.ObjectID(mid), 'locList': {'$size': 3}};
      index = 2;
    }
    var options = {'sort': {'hotness': 1}, 'fields': {'locList': true} }
    // var s = ViewSpot.distinct('locList.2', {'locList._id': new Mongo.ObjectID(mid), 'locList': {'$size': 3}});
    var data = ViewSpot.find(selector, options).fetch();
    var names = data.map(
      function(x) {
        return x.locList[index].zhName;
      }
    );
    var ids = data.map(
      function(x) {
        return x.locList[index]._id._str;
      }
    );

    names = _.uniq(names);
    ids = _.uniq(ids);
    var temp = [];
    for (var i = 0, len = ids.length; i < len; i++) {
      temp.push({'zhName': names[i], '_id': ids[i]});
    }
    return temp;
  },
});