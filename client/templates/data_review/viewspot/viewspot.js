
// if (Meteor.isClient) {
//   Meteor.startup(function () {
//     Session.set('submitted', true);
//   });
// }

Viewspot = new Mongo.Collection('Viewspot');
Viewspot.initEasySearch('zhName', {
  'limit' : 5,
  'use' : 'mongo-db'
});


// Template.reviewCity.helpers({
//   cityDetails: function() {
//     var currentCityId = Session.get('currentCityId');
//     if (currentCityId == undefined) {
//       return;
//     }
//     var cityDetailInfo = Locality.findOne({
//       '_id': new Mongo.ObjectID(currentCityId)
//     });
//     return cityDetailInfo;
//   }
// });

// Template.reviewCity.events({
//   "click .city-name": function(e) {
//     // TODO 通过判断键位的设置来判断是否修改，未修改，可以自由切换

//     // 重复点击
//     var mid = $(e.target).attr('id');
//     if (mid === Session.get('currentID')) {
//       return;
//     } else {
//       Session.set('currentID', mid);
//     }

//     // 是否提交
//     if (!Session.get('submitted')) {
//       var res = confirm('尚未保存, 是否放弃本次编辑?');
//       if(res){
//         Session.set('submitted', true);
//       }else{
//         return;
//       }
//     }
//     Session.set('submitted', false);

//     $(e.target).addClass("active");
//     $(e.target).siblings().removeClass('active');
//     Session.set('currentCityId', mid);
//     Meteor.subscribe("cityDetail", mid);
//     Locality.findOne({
//       '_id': new Mongo.ObjectID(mid)
//     });
//   },

//   "click .navi-tabs": function(e) {
//     console.log(e.target);
//     var par = $(e.target).parent(),
//       clsName = par.attr('class');
//     par.addClass("active");
//     par.siblings().removeClass("active");


//     console.log(clsName);
//     $('div.' + clsName).removeClass('hidden').addClass("show");
//     $('div.' + clsName).siblings().removeClass('show').addClass("hidden");
//   }
// });


// isSubmitted = function(){
//   return Session.get('submitted');
// }