Tracker.autorun(function(){
  var baseV = Session.get('recheckBaseVersion'),
      compV = Session.get('recheckCompareVersion');
  if(baseV === 0 && compV !== 0) {
    $('.scroll-back').removeClass("glyphicon-resize-horizontal").addClass("glyphicon-arrow-left");
    $('.scroll-back').css({'cursor': "pointer"});
    $('.scroll-back').attr("title", "回滚");
  }else{
    $('.scroll-back').removeClass("glyphicon-arrow-left").addClass("glyphicon-resize-horizontal");
    $('.scroll-back').css({'cursor': ''});
  }
});

Tracker.autorun(function(){

});

Template.compareWrapper.helpers({

  itemData: function(){
    var item = Session.get('recheckItem');
    // 0 ：对应base中的线上数据，对应compare中的待review数据
    Session.set('recheckBaseVersion', 0);
    Session.set('recheckCompareVersion', 0);
    return 1;
  },

  releaseList: function() {
    var item = Session.get('recheckItem');
    return OplogPkList.findOne({'pk': item.pk}).branch;
  },

  //提供对照用的数据
  baseData: function(){
    var snapshotId = Session.get('recheckBaseVersion');
    var item = Session.get('recheckItem');
    var db = item.ns.split('.')[0];
    var coll = item.ns.split('.')[1];
    var mid = item.pk;
    var conn = getMongoClient(db, coll);

    Meteor.subscribe(coll.toLowerCase() + "Detail", mid);

    var detailInfo;
    if(snapshotId === 0){
      detailInfo = conn.findOne({_id: new Mongo.ObjectID(mid)});
    }else{
      detailInfo = storageEngine.snapshot(item.ns, new Mongo.ObjectID(item.pk), {}, snapshotId);
    }

    var baseData = [];
    review(coll, detailInfo, baseData);

    // 添加readonly标志
    for(var i = 0;i < baseData.length;i++){
      baseData[i].notWrite = true;
    }

    // 存储base数据到session中
    Session.set('recheckBaseData', baseData);
    return baseData;
  },

  basePic: function(){
    var snapshotId = Session.get('recheckBaseVersion');
    var item = Session.get('recheckItem');
    var db = item.ns.split('.')[0];
    var coll = item.ns.split('.')[1];
    var mid = item.pk;
    var conn = getMongoClient(db, coll);

    Meteor.subscribe(coll.toLowerCase() + "Detail", mid);

    var detailInfo;
    if(snapshotId === 0){
      detailInfo = conn.findOne({_id: new Mongo.ObjectID(mid)});
    }else{
      detailInfo = storageEngine.snapshot(item.ns, new Mongo.ObjectID(item.pk), {}, snapshotId);
    }

    var images = detailInfo.images;
    if (images){
      for (var i = 0;i < images.length;i++){
        images[i].url = pictures_host + images[i].key;
      }
    }
    return images;
  },


	compareData: function(){
    var snapshotId = Session.get('recheckCompareVersion');
    var item = Session.get('recheckItem');
    var coll = item.ns.split('.')[1];
    var mid = item.pk;


    // 所有的数据库发布detail时，命名应为 coll.toLowerCase + "Detail" 的形式！
    Meteor.subscribe(coll.toLowerCase() + "Detail", mid);

    var detailInfo;
    if(snapshotId === 0){
      detailInfo = storageEngine.snapshot(item.ns, new Mongo.ObjectID(item.pk));
    }else{
      detailInfo = storageEngine.snapshot(item.ns, new Mongo.ObjectID(item.pk), {}, snapshotId);
    }

    var compareData = [];
    review(coll, detailInfo, compareData);

    // 存储compare数据到session中
    Session.set('recheckCompareData', compareData);
    // 存储数据的MD5值，在提交修改时判重使用
    createOriginTextMD5(compareData);

    return compareData;
  },

  comparePic: function(){
    var snapshotId = Session.get('recheckCompareVersion');
    var item = Session.get('recheckItem');
    var coll = item.ns.split('.')[1];
    var mid = item.pk;

    Meteor.subscribe(coll.toLowerCase() + "Detail", mid);

    var detailInfo;
    if(snapshotId === 0){
      detailInfo = storageEngine.snapshot(item.ns, new Mongo.ObjectID(item.pk));
    }else{
      detailInfo = storageEngine.snapshot(item.ns, new Mongo.ObjectID(item.pk), {}, snapshotId);
    }

    var images = detailInfo.images;
    if (images){
      for (var i = 0;i < images.length;i++){
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
      if (compareData[i].zhLabel){
        diffData[i].zhLabel = compareData[i].zhLabel;
      }

      tempBase = baseData[i].value;
      tempCompare = compareData[i].value;

      //如果是str_Array
      if (_.isArray(baseData[i].value)){
        //字符串数组转字符串
        tempBase = baseData[i].value.join();
        tempCompare = compareData[i].value.join();
      }

      //整型转字符串
      if (_.isNumber(baseData[i].value)){
        //字符串数组转字符串
        tempBase = baseData[i].value.toString();
        tempCompare = compareData[i].value.toString();
      }

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

  'change #baseRelease': function(e) {
    var snapshotId = $(e.target).val();
    log(snapshotId);
    Session.set('recheckBaseVersion', parseInt(snapshotId));
  },

  'change #compareRelease': function(e) {
    var snapshotId = $(e.target).val();
    log(snapshotId);
    Session.set('recheckCompareVersion', parseInt(snapshotId));
  },

  'click #submit-info': function(e) {
    e.preventDefault();
    log('上传数据!');
    var item = Session.get('recheckItem'),
        pk = item.pk,
        ns = item.ns;
    submitOplog(ns, pk);
  },

  'click #upload-data': function(e) {
    e.preventDefault();
    var item = Session.get('recheckItem'),
        pk = item.pk;
    // 将线上数据进行修改
    Meteor.call('updateOnlineData', pk, function(err, res){
      if(!err && 0 === res.code) {
        alert('上传成功');
      }else {
        alert('上传失败');
      }
    });
  },

  'click #reject-info': function(e) {
    e.preventDefault();
    var item = Session.get('recheckItem'),
        pk = item.pk;
    if(confirm('删除这些编辑信息？')){
      Meteor.call('rejectEditInfo', pk, function (err, res) {
        if(!err && 0 === res.code) {
          alert('删除成功');
        }else{
          alert('删除失败');
        }
      });
    }
  },

  'click .scroll-back': function(e) {
    e.preventDefault();
    var baseV = Session.get('recheckBaseVersion'),
        compV = Session.get('recheckCompareVersion'),
        item = Session.get('recheckItem');
    if(baseV !== 0 || compV === 0) {return;}
    if(confirm('是否要回滚到版本[ ' + compV + ' ]?')){
      Meteor.call('scrollBack', item, compV, function(err, res){
        if(!err && 0 === res.code) {
          alert('回滚成功');
        }else{
          alert('回滚失败');
        }
      });
    }
  },

  'click #edit-pic-btn': function(e) {
    var item = Session.get('recheckItem');
    window.open("/" + item.ns.split('.')[1] + "/" + item.pk);
    // window.open(Router.url(item.ns.split('.')[1].toLowerCase() + 'Detail', {'id': item.pk}));
  },

  'click #showModified': function(e) {
    var diffChildDom = $('.recheck-diff-wrapper').children('div.form-group');
    var compareChlidDom = $('.recheck-compare-wrapper').children('div.form-group');
    var baseChildDom = $('.recheck-base-wrapper').children('div.form-group');
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
    Meteor.setTimeout(arrangeDiv, 100);
  },

  //点击图片，进入预览状态
  'click .pic-wrap': function(e) {
    showPreviewPic(this);
    locatePreviewPic();
  },

  //图片预览状态下，点击阴影关闭操作
  "click .preview-pic-shadow": function(e){
    $('.preview-pic-window').hide();
    $('.preview-pic-shadow').hide();
  },
})

/**
 * [展示预览图片]
 * @param  {object} image w,h,key,url,crophint等图片相关的信息
 * @return {[type]}       [description]
 */
function showPreviewPic(image){
  //initial：容器，阴影的控制
  $('.preview-pic-window').empty();
  $('.preview-pic-window').show();
  $('.preview-pic-shadow').show();

  //裁剪参数的获取
  if (image.cropHint){
    var cropW = image.cropHint.right - image.cropHint.left;
    var cropH = image.cropHint.bottom - image.cropHint.top;
    var cropLeft = image.cropHint.left;
    var cropTop = image.cropHint.top;
  } else {
    var cropW = image.w;
    var cropH = image.h;
    var cropLeft = 0;
    var cropTop = 0;
  }

  //缩放比例
  if (cropW > 800 || cropH > 600) {
    var r = Math.max(cropW / 800, cropH / 600);
  } else {
    var r = 1;
  }

  //等比例转换裁剪参数
  cropW = cropW / r;
  cropH = cropH / r;
  cropLeft = cropLeft / r;
  cropTop = cropTop / r;

  //插入图片
  $('.preview-pic-window').append('<img src="' + pictures_host + image.key +
      '?imageMogr2/thumbnail/!' + parseInt(100/r) + 'p' +
      '/crop/!' + cropW + 'x' + cropH +
        'a' + cropLeft + 'a' + cropTop + '">');
}

//居中放置预览图片
function locatePreviewPic(){
  var windowW = $(window).width();
  var windowH = $(window).height();

  $('.preview-pic-shadow').css('width', windowW);
  $('.preview-pic-shadow').css('height', windowH);

  var previewW = $('.preview-pic-window img').width();
  var previewH = $('.preview-pic-window img').height();

  if (previewW && previewH){
    $('.preview-pic-window').css('left', (windowW - previewW)/2);
    $('.preview-pic-window').css('top', (windowH - previewH)/2);
  }
}


