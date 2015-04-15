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
  }
});