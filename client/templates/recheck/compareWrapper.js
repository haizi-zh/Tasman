Template.compareWrapper.helpers({

  // 订阅recheckItem，并且推动compareData和baseData
  itemData: function(){
    // 订阅recheckItem
    var item = Session.get('recheckItem');

    // 当前状态为列表内容被修改, compareStatus为全局变量, set前应先更新状态！
    // compareStatus = 0;

    // 推动compareData和baseData
    Session.set('recheckBaseVersion', 'master');
    Session.set('recheckCompareVersion', 'current');

    return 1;
  },


  //提供对照用的数据
  baseData: function(){
    // 订阅对照版本号baseVersion
    var baseVersion = Session.get('recheckBaseVersion');

    // 线上版本时 (baseVersion == 'master')
    var item = Session.get('recheckItem');
    var db = item.ns.split('.')[0];
    var coll = item.ns.split('.')[1];
    var mid = item.pk;

    Meteor.subscribe(coll.toLowerCase() + "Detail", mid);

    var conn = getMongoClient(db, coll);
    var detailInfo = conn.findOne({_id: new Mongo.ObjectID(mid)});

    var baseData = [];
    
    console.log(detailInfo);

    // 处理原始的base数据
    review(coll, detailInfo, baseData);

    // 添加readonly标志
    for(i = 0;i < baseData.length;i++){
      baseData[i].notWrite = true;
    }

    console.log(baseData);

    // 存储base数据到session中
    Session.set('recheckBaseData', baseData);
    return baseData;
  },

  basePic: function(){
    // 订阅对照版本号baseVersion
    var baseVersion = Session.get('recheckBaseVersion');

    // 线上版本时 (baseVersion == 'master')
    var item = Session.get('recheckItem');
    var db = item.ns.split('.')[0];
    var coll = item.ns.split('.')[1];
    var mid = item.pk;

    Meteor.subscribe(coll.toLowerCase() + "Detail", mid);

    var conn = getMongoClient(db, coll);
    var detailInfo = conn.findOne({_id: new Mongo.ObjectID(mid)});
    
    var images = detailInfo.images;
    if (images){
      for (i = 0;i < images.length;i++){
        images[i].url = pictures_host + images[i].key;
      }
    }
    return images;
  },

  //提供编辑过的数据
	compareData: function(){
    // 订阅编辑版本号compareVersion
    var compareVersion = Session.get('recheckCompareVersion');

    // 当前版本时 (compareVersion == 'current')
    var item = Session.get('recheckItem');
    var coll = item.ns.split('.')[1];
    var mid = item.pk;

    // 订阅数据，以供snapshot使用,snapshot只会订阅cmsoplog，这部分应该放在rechek.js中，因为订阅一次即可?

    // 所有的数据库发布detail时，命名应为 coll.toLowerCase + "Detail" 的形式！
    Meteor.subscribe(coll.toLowerCase() + "Detail", mid);

    var detailInfo = storageEngine.snapshot(item.ns, new Mongo.ObjectID(item.pk));
    var compareData = [];

    console.log(detailInfo);

    // 处理原始的compare数据
    review(coll, detailInfo, compareData);
    
    console.log(compareData);

    // 存储compare数据到session中
    Session.set('recheckCompareData', compareData);

    // 存储数据的MD5值，在提交修改时判重使用
    createOriginTextMD5(compareData);

    return compareData;
  },

  comparePic: function(){
    var compareVersion = Session.get('recheckCompareVersion');

    // 当前版本时 (compareVersion == 'current')
    var item = Session.get('recheckItem');
    var coll = item.ns.split('.')[1];
    var mid = item.pk;

    // 订阅数据，以供snapshot使用,snapshot只会订阅cmsoplog，这部分应该放在rechek.js中，因为订阅一次即可?

    // 所有的数据库发布detail时，命名应为 coll.toLowerCase + "Detail" 的形式！
    Meteor.subscribe(coll.toLowerCase() + "Detail", mid);

    var detailInfo = storageEngine.snapshot(item.ns, new Mongo.ObjectID(item.pk));
    
    var images = detailInfo.images;
    if (images){
      for (i = 0;i < images.length;i++){
        images[i].url = pictures_host + images[i].key;
      }
    }
    return images;
  },

  // 提供diff数据
  diffData: function(){
    // 取出两组数据
    var baseData =  Session.get('recheckBaseData');
    var compareData = Session.get('recheckCompareData');

    // 获取两个数据的区别，以html的形式返回字符串
    var dataLength = baseData.length;
    var diff, diffData = [];
    var tempBase, tempCompare;
    for (var i = 0;i < dataLength;i++){

      //初始化diffData
      diffData[i] = {};
      diffData[i].value = [];
      if (compareData[i].zhLabel)
        diffData[i].zhLabel = compareData[i].zhLabel;

      
      
      tempBase = baseData[i].value;
      tempCompare = compareData[i].value;

      //如果是str_Array
      if (_.isArray(baseData[i].value)){
        //字符串数组转字符串
        console.log(baseData[i].value);
        tempBase = baseData[i].value.join();
        console.log(compareData[i].value);
        tempCompare = compareData[i].value.join();
      }

      //整型转字符串 may be need
      //
      //

      // 调用第三方模块jsDiff
      diff = JsDiff.diffChars(tempBase, tempCompare);
      var isModified = false;
      diff.forEach(function(part){
        var className = 
              part.added ? 'added' :
                part.removed ? 'removed' : 'common';
        diffData[i].value.push({
          diffClass: className,
          diffValue: part.value 
        });
        if(className !== 'common'){
          isModified = true;
        }
      });
      diffData[i].isModified = isModified;
    }
    console.log(diffData);
    return diffData;
  }
});



Template.compareWrapper.events({
  //保存非富文本框的修改
  "blur textarea": function(e){
    var recheckCompareData = Session.get("recheckCompareData");
    for (i = 0;i < recheckCompareData.length;i++) {
      if (recheckCompareData[i].keyChain == this.keyChain) {
        var curText = (this.strArray) ? $(e.target).val().split(',') : $(e.target).val();
        recheckCompareData[i].value = curText;
        Session.set("recheckCompareData", recheckCompareData);
        break;
      }
    }
  },

  //保存富文本框的修改
  'blur .froala-view': function(e){
    var recheckCompareData = Session.get("recheckCompareData");
    for (i = 0;i < recheckCompareData.length;i++) {
      if (recheckCompareData[i].keyChain == this.keyChain) {
        var curHTML = $(e.target).html();
        recheckCompareData[i].value = curHTML;
        Session.set("recheckCompareData", recheckCompareData);
        break;
      }
    }
  },

  'click #submit-info': function(e) {
    e.preventDefault();
    log('上传数据!');
    var item = Session.get('recheckItem');
    submitOplog(item.ns, item.pk);
    //将线上数据进行修改！
  },

  'click #edit-pic-btn': function(e) {
    var item = Session.get('recheckItem');
    // window.location.href = "/" + item.ns.split('.')[1] + "/" + item.pk;
    // window.open("/" + item.ns.split('.')[1] + "/" + item.pk);
    window.open(Router.url(item.ns.split('.')[1].toLowerCase() + 'Detail', {'id': item.pk}));
  },

  'click #showModified': function(e) {
    var diffChildDom = $('.recheck-diff-wrapper').children('div');
    var compareChlidDom = $('.recheck-compare-wrapper').children('div');
    var baseChildDom = $('.recheck-base-wrapper').children('div');
    if(e.target.checked) {
      for(var i = 0, len = diffChildDom.length; i < len; i++){
        var tempDom = diffChildDom[i];
        if(!$(tempDom).hasClass('modified')) {
          $(tempDom).addClass("hidden");
          $(compareChlidDom[i]).addClass("hidden");
          $(baseChildDom[i]).addClass("hidden");
        }
      }
    }else{
      $(diffChildDom).removeClass("hidden");
      $(compareChlidDom).removeClass("hidden");
      $(baseChildDom).removeClass("hidden");
    }
  }
})