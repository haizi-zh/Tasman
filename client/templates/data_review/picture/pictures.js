var _time, cropCoords, currentIndex, currentSource, cropScale, cropScaleIndex;

// cropHints, selectedCropHints, upCropHints:imagestore图片, poi/geo图片, 上传图片的裁剪信息
var cropHints, selectedCropHints, upCropHints;
// cropHint{
//  w,h:裁剪的宽高（对应于cw,ch的）
//  cw,ch:现在的宽高（最大值为800）
//  ow,oh:原有的宽高
// }

//初始化部分数据
function initial(){
  _time = null;
  cropCoords = {};//记录单个crop数据
  currentIndex = -1;//记录第几个图片
  currentSource = "geo";//记录当前的图片来源,默认为geo
  cropScale = [1, 3/2, 4/3, 2];//width:height
  cropScaleIndex = -1;

  cropHints = [];//记录可选图片的crophints
  selectedCropHints = [];//记录原有已选图片的crophints
  upCropHints = [];//记录上传图片的crophints
  $('.selected-container').empty();
  Session.set('selectedPicToCurSelected', []);
};

// 为搜索单个poi提供onRender监听 ——（当blaze时，模板尚未渲染出来，因此blaze失败！）
Template.pictures.onRendered(function(){
  var images = Session.get('selectedPicToCurSelected'),
      parentDom = $('ul.selected-container')[0];

  for (var i = 0, len = images.length; i < len; i++) {
    if (images[i].w && images[i].h){
      //假如没有w,h数据就先不选择
      console.log(images[i]);
      Blaze.renderWithData(Template.selectedPicture, images[i], parentDom);
    }
  };
  $('.selected-container').sortable().bind('sortupdate');
})


//可选图片模板
Template.pictures.helpers({
  //原有已选择图片
  selectedImageList: function(){
    initial();

    //获取数据
    var nsAndPk = getNsAndPk();
    var selectedImageList = sessionInfo(nsAndPk.ns, nsAndPk.pk).oriData.images;
    if (!selectedImageList)
      return null;

    var image, images = [], cropHint, selectedCropHint;
    var r, x1, x2, y1, y2, cw, ch;
    for (var i = 0;i < selectedImageList.length;i++){
      //模板的数据
      image = {
        url: pictures_host + selectedImageList[i].key,
        key: selectedImageList[i].key,
        w: selectedImageList[i].w,
        h: selectedImageList[i].h,
        index: i,
        source: "geo"
      }
      images.push(image);

      //存储已选图片的原有的数据
      cropHint = {
        ow: selectedImageList[i].w,
        oh: selectedImageList[i].h,
        key: selectedImageList[i].key
      }
      selectedCropHints[i] = cropHint;

      //假如已有裁剪的尺寸
      if (selectedImageList[i].cropHint){
        selectedCropHint = selectedImageList[i].cropHint;

        //不同尺寸图片的处理
        if (cropHint.ow >= 800 || cropHint.oh >= 800){
          var r = Math.max(cropHint.ow / 800, cropHint.oh / 800);
          //对于裁剪的图像返回偶数数据
          x1 = parseInt(selectedCropHint.left / r);
          x1 = (x1 % 2) ? (x1 + 1) : x1;
          x2 = parseInt(selectedCropHint.right / r);
          x2 = (x2 % 2) ? (x2 - 1) : x2;
          y1 = parseInt(selectedCropHint.top / r);
          y1 = (y1 % 2) ? (y1 + 1) : y1;
          y2 = parseInt(selectedCropHint.bottom / r);
          y2 = (y2 % 2) ? (y2 - 1) : y2;
          cw = parseInt(cropHint.ow / r);
          ch = parseInt(cropHint.oh / r);
        }else{
          x1 = selectedCropHint.left;
          x2 = selectedCropHint.right;
          y1 = selectedCropHint.top;
          y2 = selectedCropHint.bottom;
          cw = cropHint.ow;
          ch = cropHint.oh;
        }

        selectedCropHint = {
          x1: x1,
          x2: x2,
          y1: y1,
          y2: y2,
          cw: cw,
          ch: ch,
          w: x2 - x1,
          h: y2 - y1
        };
        selectedCropHints[i] = _.extend(selectedCropHints[i], selectedCropHint);
      }else{
        //...原数据没有crophint，则对应crophint为空！
      }

      //假如没有w,h数据就先不选择
      if (image.w && image.h){
        console.log(image);
        Blaze.renderWithData(Template.selectedPicture, image, $('ul.selected-container')[0]);
      }
      $('.selected-container').sortable().bind('sortupdate');
    };
    Session.set('selectedPicToCurSelected', images);
    return images;
  },

  //可选择图片
  imageList: function() {
    //获取数据
    var mid = Session.get('currentLocalityId') || Session.get('currentVsId')
        || Session.get('currentRestaurantId') || Session.get('currentShoppingId');
    var imageList = Images.find({ 'itemIds': new Mongo.ObjectID(mid) }).fetch();

    var image, images = [], cropHint;
    for (var i = 0;i < imageList.length;i++){
      image = {
        url: pictures_host + imageList[i].key,
        w: imageList[i].w,
        h: imageList[i].h,
        key: imageList[i].key,
        index: i,
        source: "imageStore"
      }
      images.push(image);

      cropHint = {
        ow: imageList[i].w,
        oh: imageList[i].h,
        key: imageList[i].key
      }
      cropHints[i] = cropHint;
    };
    return images;
  }
});


Template.pictures.events({
  //双击图片"添加"or"删除"
  "dblclick .raw-picture-container": function(e){
  	clearTimeout(_time);
    var $picShadow = $(e.target).parent().children(".pic-shadow");

    //假如非选中态(没有阴影)：加入已选择队列
    if ($picShadow.length <= 0){
      //判断是否已选过相同的图片！若有，则提示已有！
      var selected = $(".selected-picture-container");
      var flag = true;
      for (var i = 0;i < selected.length;i++){
        if ($(selected[i]).attr("data-key") == this.key){
          flag = false;
          break;
        }
      }

      if (flag){
        $(e.target).parent().prepend('<div class="pic-shadow"></div>');

        if (this.source == "geo"){
          selectedCropHints[this.index] = (selectedCropHints[this.index]) 
            ? _.extend(selectedCropHints[this.index], {ow: this.w, oh: this.h, key: this.key}) 
            : {ow: this.w, oh: this.h, key: this.key};
        }else{
          cropHints[this.index] = (cropHints[this.index]) 
            ? _.extend(cropHints[this.index], {ow: this.w, oh: this.h, key: this.key}) 
            : {ow: this.w, oh: this.h, key: this.key};  
        }

        Blaze.renderWithData(Template.selectedPicture, this, $('ul.selected-container')[0]);
        $('.selected-container').sortable().bind('sortupdate');
      }else{
        alert("该图已选择！");
      } 
    }else{
      //假如为选中态：从已选择队列中删除
      $picShadow.remove();
      var selected = $(".selected-picture-container");
      for (var i = 0;i < selected.length;i++){
        if ($(selected[i]).attr("data-key") == this.key){
          $(selected[i]).remove();
          break;
        }
      }
    }
  },

  //单击图片，加载裁剪层
  "click .raw-picture-container": function(e){
  	clearTimeout(_time);
    var $image = this;
    _time = setTimeout(function(){
      loadJcrop($image);
    }, 400);
  },

  //选择裁剪框的比例
  "click .radio input": function(e){
    cropScaleIndex = $(e.target).attr("value");
    jcrop_api.setOptions({
      aspectRatio: cropScale[cropScaleIndex]
    });
  },

  //点击x,关闭裁剪层
  "click #crop-close": function(e){
    $('.crop-window').hide();
    $('.crop-shadow').hide();
  },

  //点击阴影蒙层，关闭裁剪层
  "click .crop-shadow": function(e){
    $("#crop-close").trigger("click");
  },

  //更新单个图片裁剪结果，并且关闭裁剪层
  "click #crop-submit": function(e){
    if(currentSource == "geo")
      selectedCropHints[currentIndex] = selectedCropHints[currentIndex] ? _.extend(selectedCropHints[currentIndex], cropCoords) : selectedCropHints[index] = cropCoords;
    else if (currentSource == "imageStore")
      cropHints[currentIndex] = cropHints[currentIndex] ? _.extend(cropHints[currentIndex], cropCoords) : cropHints[currentIndex] = cropCoords;
    else if (currentSource == "upload")
      upCropHints[currentIndex] = upCropHints[currentIndex] ? _.extend(upCropHints[currentIndex], cropCoords) : upCropHints[currentIndex] = cropCoords;
    $("#crop-close").trigger("click");
  },

  //提交该地点的图片信息修改
  "click .btn-pic-submit": function(e){
    var selected = $(".selected-picture-container");
    var subImages = [];
    var subImage, cropHint;
    var left, right, top, bottom, r, coord;

    for (var i = 0;i < selected.length;i++){
      //根据图片来源，获取裁剪信息
      switch ( $(selected[i]).attr("data-from") ) {
        case 'geo':
          cropHint = selectedCropHints[$(selected[i]).attr("data-index")];
          break;
        case 'imageStore':
          cropHint = cropHints[$(selected[i]).attr("data-index")];
          break;
        case 'upload':
          cropHint = upCropHints[$(selected[i]).attr("data-index")];
          break;
        default:
          cropHint = {};
      }

      //initial: 每次都需要重新初始化
      coord = {};

      //warning: 此处不可以用x1作判断，可能为0
      if (cropHint.x2){
        r = cropHint.ow / cropHint.cw;
        //对于裁剪的图像返回偶数数据
        left = parseInt(cropHint.x1 * r);
        left = (left % 2) ? (left + 1) : left;
        right = parseInt(cropHint.x2 * r);
        right = (right % 2) ? (right - 1) : right;
        top = parseInt(cropHint.y1 * r);
        top = (top % 2) ? (top + 1) : top;
        bottom = parseInt(cropHint.y2 * r);
        bottom = (bottom % 2) ? (bottom - 1) : bottom;

        coord = {
          left: left,
          right: right,
          top: top,
          bottom: bottom
        };
      }

      //是否有裁剪信息
      if (coord.left){
        subImage = {
          h: cropHint.oh,
          w: cropHint.ow,
          key: cropHint.key,
          cropHint: coord
        }
      }else{
        subImage = {
          h: cropHint.oh,
          w: cropHint.ow,
          key: cropHint.key
        }
      }
      subImages.push(subImage);
    }

    //提交图片修改信息到session中
    var tempOplog = Session.get('oplog');
    tempOplog.images = subImages;
    Session.set('oplog', tempOplog);
    alert('成功上传图片信息！');
    log(tempOplog);
  },

  //本地上传图片
  "click #pic-up-sub": function(e){
    //从服务器获取token和key
    Meteor.call('getPicUpToken', function(error, result) {
      if (error) {
        return throwError(error.reason);
      }
      if (result){
        $("#picUpToken").val(result.upToken);
        $("#picUpKey").val(result.key);
        var form_data = new FormData($('#pic-up')[0]);

        //用jquery.ajax提交表单
        $.ajax({
          type: 'post',
          // url: '//upload.qiniu.com/',
          url: 'https://up.qbox.me/',
          async: false,
          cache: false,
          contentType: false,
          processData: false,
          data: form_data,
          success: function(data) {
            console.log(data);

            //初始化新增图片的crophint
            var cropHint = {
              ow: data.w,
              oh: data.h,
              key: result.key
            };
            upCropHints.push(cropHint);

            //新增已选图片
            var imageInfo = {
              key: result.key,
              index: upCropHints.length - 1,
              source: "upload",
              url: result.url
            };
            Blaze.renderWithData(Template.selectedPicture, imageInfo, $('ul.selected-container')[0]);

            //存入数据库
            var url = result.url;
            var mid = Session.get('currentLocalityId') || Session.get('currentVsId')
                  || Session.get('currentRestaurantId') || Session.get('currentShoppingId');
            Meteor.call('saveUpLocalImage', mid, result.key, function(error, result) {
              if (result) {
                alert('成功存入图片' + url);
                console.log(result);
              } else {
                alert('存入数据库失败！');
              };
            })
          }
        });
      }else{
        alert("上传图片失败，请再次上传或联系程序员！");
      }
    });
  },

  //上传远端图片
  "click #pic-fet-sub": function(e){
    var fetchUrl = $('#fet-pic-url').val();
    var timeOut = 0;

    //超时响应，3s内没有上传成功，视作上传失败!
    timeFetchPic = function(){
      timeOut = 1;
      alert('该图无法上传！请使用本地上传。');
    };
    var t = setTimeout('timeFetchPic()', 3000);

    //服务端上传图片
    Meteor.call('fetchPic', fetchUrl, function(error, result) {
      //上传成功
      if ( !timeOut ) {
        //并未超时
        clearTimeout(t);
        if (error) {
          return throwError(error.reason);
        }
        if (result) {
          //初始化新增图片的crophint
          var cropHint = {
            ow: result.w,
            oh: result.h,
            key: result.key
          };
          upCropHints.push(cropHint);

          //新增已选图片
          var imageInfo = {
            key: result.key,
            index: upCropHints.length - 1,
            source: "upload",
            url: result.url
          };
          Blaze.renderWithData(Template.selectedPicture, imageInfo, $('ul.selected-container')[0]);

          var url = result.url;
          var mid = Session.get('currentLocalityId') || Session.get('currentVsId')
                || Session.get('currentRestaurantId') || Session.get('currentShoppingId');
          Meteor.call('saveFetchImage', mid, result.key, fetchUrl , function(error, result) {
            if (result) {
              alert('上传成功: 图片链接为' + url);
              console.log(result);
            } else {
              alert('存入数据库失败！');
            };
          });
        } else {
          alert("上传图片失败，请再次上传或联系程序员！");
        }
      } else {
        //上传成功，但是已经超时
      }
    });
  }
})

//已选图片模板
Template.selectedPicture.events({
  //删除已选图片事件
  "click .glyphicon-minus": function(e){
    var picForSelect;
    if (this.source == "geo")
      //当图片为geo中已选图片时
      picForSelect = $(".pre-selected-container .raw-picture-container");
    else if (this.source == "imageStore")
      //当图片为imagestore中可选图片时
      picForSelect = $(".pic-for-selection .raw-picture-container");
    else if (this.source == "upload")
      //当图片为上传图片时
      picForSelect = [];

    for (var i = 0;i < picForSelect.length;i++){
      if ($(picForSelect[i]).attr("data-key") == this.key){
        $(picForSelect[i]).children(".pic-shadow").remove();
        break;
      }
    }

    $(e.target).parent().remove();
  },

  //点击图片，加载裁剪层
  "click img": function(e){
    var $image = this;
    loadJcrop($image);
  }
})

//展示裁剪层
function cropShow($image){
  $('.crop-frame').empty();
  $('.crop-shadow').show();
  $('.crop-window').show();

  //添加图片元素
  var imageElement = '<img src="' + $image.url + '?imageView2/2/w/800/h/600/interlace/1" id="' + $image.id + '"/>';
  $(".crop-frame").append(imageElement);
}

//裁剪层、阴影蒙层大小、位置信息的设置
function cropLocation(){
  var wWidth = $(window).width();
  var wHeight = $(window).height();

  //阴影蒙层的初始化
  $('.crop-shadow').css('width', wWidth);
  $('.crop-shadow').css('height', wHeight);

  //固定裁剪层位置
  var cropWindowWid = $('.crop-window').width();
  var cropWindowHei = $('.crop-window').height();
  $('.crop-window').css('left', (wWidth - cropWindowWid)/2);
  $('.crop-window').css('top', (wHeight - cropWindowHei)/2);
}

//展示预览效果图
function showSmallFrame(coords, object){
  var r = Math.max(coords.w, coords.h) / 200;
  $(object).css({
    width: Math.round(coords.w / r) + 'px',
    height: Math.round(coords.h / r) + 'px'
  });

  $(object + ' .preview').css({
    width: Math.round(coords.cw / r) + 'px',
    height: Math.round(coords.ch / r) + 'px',
    marginLeft: '-' + Math.round(coords.x1 / r) + 'px',
    marginTop: '-' + Math.round(coords.y1 / r) + 'px'
  });
}

//绑定键盘事件
function cropKeyEvent(){
  $(document).unbind('keydown'); //取消上一次的监听
  $(document).keydown(function(event) {
      var e = event || window.event;
      var k = e.keyCode || e.which;
      switch(k){
        case 13:
          $("#crop-submit").trigger("click");
          break;
        case 27:
          $("#crop-close").trigger("click");
          break;
      }
  });
}

//设置裁剪框改变的触发事件
function changeCoords(c){
  cropCoords = {
    x1: c.x,
    y1: c.y,
    x2: c.x2,
    y2: c.y2,
    w: c.w,
    h: c.h,
    cw: jcrop_api.getBounds()[0],
    ch: jcrop_api.getBounds()[1]
  };
  showSmallFrame(cropCoords, '#crop-small-1');
}

//创建裁剪对象
function createJcrop($image){
  $('#' + $image.id).Jcrop({
    onChange: changeCoords,
    onSelect: changeCoords,
    // onRelease: clearCoords
    aspectRatio: cropScale[cropScaleIndex]
  },function(){
    jcrop_api = this;
  });
}

//加载裁剪层
function loadJcrop($image){
  //initial
  currentIndex = $image.index;
  currentSource = $image.source;
  cropShow($image);
  $('#crop-small-1').empty();
  $('#crop-small-2').empty();

  if ($image.source == "geo"){
    if (selectedCropHints[$image.index] && selectedCropHints[$image.index].h){
      $("#crop-small-2").append('<img src="' + $image.url + '?imageView2/2/w/800/h/600/interlace/1" class="preview"/>');
      showSmallFrame(selectedCropHints[$image.index], '#crop-small-2');
    }
  }else if ($image.source == "imageStore"){
    if (cropHints[$image.index] && cropHints[$image.index].h){
      $("#crop-small-2").append('<img src="' + $image.url + '?imageView2/2/w/800/h/600/interlace/1" class="preview"/>'); 
      showSmallFrame(cropHints[$image.index], '#crop-small-2');
    }
  }else if ($image.source == "upload"){
    if (upCropHints[$image.index] && upCropHints[$image.index].h){
      $("#crop-small-2").append('<img src="' + $image.url + '?imageView2/2/w/800/h/600/interlace/1" class="preview"/>');
      showSmallFrame(upCropHints[$image.index], '#crop-small-2');
    }
  }

  $("#crop-small-1").append('<img src="' + $image.url + '?imageView2/2/w/800/h/600/interlace/1" class="preview"/>');
  cropLocation();
  cropKeyEvent();//enter&esc
  createJcrop($image);
}


//////
Template.pictures.events({
  'click #delete-last-pic-url': function() {
    $('#fet-pic-url').val("");
  },
});
//////
