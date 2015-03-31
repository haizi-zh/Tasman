Meteor.subscribe("cities");
Locality = new Mongo.Collection('Locality');

Images = new Mongo.Collection('Images');

Template.reviewCity.helpers({
  cityDetails: function() {
    var currentCityId = Session.get('currentCityId');
    console.log('hello world');
    if (currentCityId == undefined) {
      return;
    }
    var cityDetailInfo = Locality.findOne({
      '_id': new Mongo.ObjectID(currentCityId)
    });
    return cityDetailInfo;
  }
});

Template.reviewCity.events({
  "click .city-name": function(e) {
    // TODO 通过判断键位的设置来判断是否修改，未修改，可以自由切换

    // 重复点击
    var mid = $(e.target).attr('id');
    if (mid === Session.get('currentCityId')) {
      return;
    }

    // 是否提交
    if (!Session.get('submitted')) {
      var res = confirm('尚未保存, 是否放弃本次编辑?');
      if(!res){
        return;
      }
    }
    Session.set('submitted', false);
    Meteor.subscribe("cityDetail", mid);
    Session.set('currentCityId', mid);

    $(e.target).siblings().removeClass('active');
    $(e.target).addClass("active");

    /************* for pictures by lyn ************/
    Meteor.subscribe("Images", mid);
    var imageList = Images.find({
      'itemIds': new Mongo.ObjectID(mid)
    }).fetch();
    var image,
        images = [];
    for (var i = 0;i < imageList.length;i++){
      image = {
        id: imageList[i]._id._str,
        url: pictures_host + imageList[i].key,
        index: i
      }
      images.push(image);
    }
    $('div.pic').empty();
    Blaze.renderWithData(Template.pictures, {imageList:images}, $('div.pic')[0]);
    /************* for pictures by lyn ************/
  },
});

isSubmitted = function(){
  return Session.get('submitted');
}