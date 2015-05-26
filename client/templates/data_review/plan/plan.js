
Template.reviewPlan.helpers({
  planDetail: function() {
    var mid = Session.get('currentPlanId');
    var detailInfo = storageEngine.snapshot('plan.Plan', new Mongo.ObjectID(mid));
    log('输出信息');
    log(detailInfo);

    if(detailInfo.details){
      for (var i = 0;i < detailInfo.details.length;i++){
        detailInfo.details[i].index = i + 1;
        detailInfo.details[i].items = [];
        for (var j = 0;j < detailInfo.details[i].actv.length;j++){
          var vId = detailInfo.details[i].actv[j].item.id.toString().split('"')[1];
          Meteor.subscribe('viewspotDetail', vId);
          var vsDetailInfo = storageEngine.snapshot('poi.ViewSpot', new Mongo.ObjectID(vId));
          var address = vsDetailInfo.address;
          var desc = vsDetailInfo.desc;
          var alias = vsDetailInfo.alias;
          var distinct = '';
          if (vsDetailInfo.locList){
            for (var k = 0;k < vsDetailInfo.locList.length;k++)
              distinct += vsDetailInfo.locList[k].zhName; //TODO 假如是外国景点，是否需要enName
          }
          detailInfo.details[i].actv[j].item.address = address;
          detailInfo.details[i].actv[j].item.desc = desc;
          detailInfo.details[i].actv[j].item.alias = alias;
          detailInfo.details[i].actv[j].item.distinct = distinct;
          detailInfo.details[i].items[j] = detailInfo.details[i].actv[j].item.zhName;
        }
      }
    }

    return detailInfo;
  },
});


Template.reviewPlan.events({
  'click .edit-btn': function(e){

  }
})