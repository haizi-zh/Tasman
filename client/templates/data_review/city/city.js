Meteor.subscribe("cities");

Locality = new Mongo.Collection('Locality');

Template.reviewCity.helpers({
  // cities: function() {
  //   var raw = Locality.distinct({
  //     'abroad': false
  //   }, {
  //     fields: {
  //       zhName: 1
  //     }
  //   }).fetch();
  //   Session.set('citiesInChina', raw);
  //   console.log(raw);
  //   var zhNames = [];
  //   _.map(raw, function(obj) {
  //     zhNames.push(obj.zhName);
  //   });
  //   zhNames = _.uniq(zhNames);
  //   return pureArrToObjArr(zhNames, "zhName");
  // },

  cityDetails: function() {
    var currentCityId = Session.get('currentCityId');
    if (currentCityId == undefined) {
      return;
    }
    var cityDetailInfo = Locality.findOne({'_id': new Mongo.ObjectID(currentCityId)});
    return cityDetailInfo;
  }
});

Template.reviewCity.events({
  "click .city-name": function(e){
    // currentCity = Session.get('');

    // var targetCityId = e.target.cityId;
    // if (currentId == targetCityId)
    //   return;

    // // check modification status

    var mid = $(e.target).attr('id');
    Session.set('currentCityId', mid);
    Meteor.subscribe("cityDetail", mid);
    Locality.findOne({'_id': new Mongo.ObjectID(mid)});
  },
});

pureArrToObjArr = function(arr, keyName) {
  var tempArr = [],
    temp = {},
    len = arr.length;
  console.log(len);
  for(var i = 0; i < len; i++){
    temp[keyName] = arr[i];
    tempArr.push(temp);
    temp = {};
  }
  return tempArr;
}