var vsList = [];//存储vsdetail信息
var vIdList = [];
var day;//纪录日程的总天数

Template.reviewGuide.helpers({
  guideDetail: function() {
    var mid = '54d08c1056eb6f0c680005cc';
    var detailInfo = storageEngine.snapshot('guide.GuideTemplate', new Mongo.ObjectID(mid));

    //重新组装数据
    //guideDetail
    //  title
    //  itinerary: [
    //    index
    //    items: [
    //      zhName,
    //      ...
    //    ],
    //    ...
    //  ]
    var guideDetail = {};
    guideDetail.title = detailInfo.title;
    guideDetail.itinerary = [];
    day = 0;
    if (detailInfo.itinerary){
      for(var i = 0;i < detailInfo.itinerary.length;i++){
        var item = detailInfo.itinerary[i];
        var vId = item.poi._id.toString().split('"')[1];
        vIdList.push(vId);

        if (! guideDetail.itinerary[item.dayIndex]){
          day ++;
          guideDetail.itinerary[item.dayIndex] = {
            index: item.dayIndex + 1,
            items: []
          }
        }
        guideDetail.itinerary[item.dayIndex].items.push({
          zhName: item.poi.zhName,
          id: vId,
          dayIndex: item.dayIndex + 1
        });
      }
    }

    Meteor.subscribe('viewspotDetails', vIdList, function(){
      for (i = 0;i < vIdList.length;i++){
        var vId = vIdList[i];
        var vsDetail = ViewSpot.find({'_id': new Mongo.ObjectID(vId)}).fetch()[0];
        vsList[vId] = vsDetail;

        //数据预处理
        vsList[vId].district = '';
        if (vsDetail.locList){
          for (var k = 0;k < vsDetail.locList.length;k++)
            vsList[vId].district += vsDetail.locList[k].zhName + ' '; //TODO 假如是外国景点，是否需要enName
        }
      }
      $('.itinerary-items').sortable();
    });
    return guideDetail;
  },
});

Template.reviewGuide.events({
  //点击出现景点介绍
  'click .vs-item>.drag-item': function(e){
    // var $item = ($(e.target).hasClass('vs-item')) ? $(e.target) : $(e.target).parent('.vs-item');
    var $item = $(e.target);
    if ($('.vs-detail') && $item.children('.vs-detail').length){
      $('.vs-detail').toggle();
    }else{
      $('.vs-detail').remove();
      var vId = $item.attr("data-id");
      var vsDetail = vsList[vId];
      $item.append('<div class="vs-detail"></div>');
      Blaze.renderWithData(Template.vsDetailFrame, vsDetail, $('.vs-detail')[0]);
    }
  },

  //点击删除一天行程或是一个景点
  'click .itinerary-items>li>.glyphicon-minus': function(e){
    if ($(e.target).parent('.vs-item').length){
      $(e.target).parent('li.vs-item').remove();
    } else {
      var curElem = $(e.target).parent('li.day-item');
      var preElem;
      do {
        preElem = curElem;
        curElem = preElem.next();
        preElem.remove();
      }while (!curElem.hasClass('day-item'));
      day --;
      for (var i = 0;i < day;i++){

      }
    }
  },

  //点击增加一天
  'click .add-day': function(e){
    Blaze.renderWithData(Template.dayItem, {index: ++day}, $('.itinerary-items')[0]);
  }
})






