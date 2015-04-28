var _time, cropCoords, currentIndex, currentSource, cropScale, cropScaleIndex;
var cropHints, selectedCropHints, upCropHints;
//w,h:裁剪的宽高（对应于cw,ch的）
//cw,ch:现在的宽高（最大值为800）
//ow,oh:原有的宽高

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
};

Template.pictures.helpers({
  //原有已选择图片
  selectedImageList: function(){
    initial();
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

        if (cropHint.ow >= 800 || cropHint.oh >= 800){
          var r = max(cropHint.ow/800, cropHint.oh/800);
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
      Blaze.renderWithData(Template.selectedPicture, image, $('ul.selected-container')[0]);
      $('.selected-container').sortable().bind('sortupdate');
    };
    return images;
  },

  //可选择图片
  imageList: function() {
    var mid = Session.get('currentLocalityId') || Session.get('currentVsId')
        || Session.get('currentRestaurantId') || Session.get('currentShoppingId');
    var imageList = Images.find({ 'itemIds': new Mongo.ObjectID(mid) }).fetch();
    var image, images = [], cropHint;

    for (var i = 0;i < imageList.length;i++){
      image = {
        // id: imageList[i]._id._str,
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
  "dblclick .raw-picture-container": function(e){
  	clearTimeout(_time);
    var $picShadow = $(e.target).parent().children(".pic-shadow");

    if ($picShadow.length <= 0){  //加入已选择队列
      //判断是否存在相同的！若有，则提示已有！
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
    }else{  //从已选择队列中删除
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

  "click .raw-picture-container": function(e){
  	clearTimeout(_time);
    var $image = this;
    _time = setTimeout(function(){
      loadJcrop($image);
    }, 400);
  },

  "click .radio input": function(e){
    cropScaleIndex = $(e.target).attr("value");
    jcrop_api.setOptions({
      aspectRatio: cropScale[cropScaleIndex]
    });
  },

  "click #crop-close": function(e){
    $('.crop-window').hide();
    $('.crop-shadow').hide();
  },

  "click .crop-shadow": function(e){
    $("#crop-close").trigger("click");
  },

  //更新裁剪结果
  "click #crop-submit": function(e){
    if(currentSource == "geo")
      selectedCropHints[currentIndex] = selectedCropHints[currentIndex] ? _.extend(selectedCropHints[currentIndex], cropCoords) : selectedCropHints[index] = cropCoords;
    else if (currentSource == "imageStore")
      cropHints[currentIndex] = cropHints[currentIndex] ? _.extend(cropHints[currentIndex], cropCoords) : cropHints[currentIndex] = cropCoords;
    else if (currentSource == "upload")
      upCropHints[currentIndex] = upCropHints[currentIndex] ? _.extend(upCropHints[currentIndex], cropCoords) : upCropHints[currentIndex] = cropCoords;
    $("#crop-close").trigger("click");
  },

  "click .btn-pic-submit": function(e){
    var selected = $(".selected-picture-container");
    var subImages = [];
    var subImage, cropHint;
    var left, right, top, bottom, r, coord;
    for (var i = 0;i < selected.length;i++){
      if ($(selected[i]).attr("data-from") == "geo")
        cropHint = selectedCropHints[$(selected[i]).attr("data-index")];
      else if ($(selected[i]).attr("data-from") == "imageStore")
        cropHint = cropHints[$(selected[i]).attr("data-index")];
      else if ($(selected[i]).attr("data-from") == "upload")
        cropHint = upCropHints[$(selected[i]).attr("data-index")];
      if (cropHint.x1){
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
      if (coord){
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
    var tempOplog = Session.get('oplog');
    tempOplog.images = subImages;
    Session.set('oplog', tempOplog);
    log(tempOplog);
  },

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
            //data中有w,h,size,hash值
            alert("上传成功！链接：" + result.url);

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
          }
        });
      }else{
        alert("上传图片失败，请再次上传或联系程序员！");
      }
    });
  },

  "click #pic-fet-sub": function(e){
    var fetchUrl = $('#fet-pic-url').val();
    Meteor.call('fetchPic', fetchUrl, function(error, result) {
      if (error) {
        return throwError(error.reason);
      }
      if (result){
        alert("上传成功！链接：" + result.url);

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
      }else{
        console.log(result);
        alert("上传图片失败，请再次上传或联系程序员！");
      }
    });
  }
})

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
  
  "click img": function(e){
    var $image = this;
    loadJcrop($image);
  }
})

//show cropWindow
function cropShow($image){
  $('.crop-frame').empty();
  $('.crop-shadow').show();
  $('.crop-window').show();

  //insert the image Element
  var imageElement = '<img src="' + $image.url + '?imageView2/2/w/800/h/600/interlace/1" id="' + $image.id + '"/>';
  $(".crop-frame").append(imageElement);
}

function cropLocation(){
  var wWidth = $(window).width();
  var wHeight = $(window).height();

  //init shadow
  $('.crop-shadow').css('width', wWidth);
  $('.crop-shadow').css('height', wHeight);

  //fix crop-window
  var cropWindowWid = $('.crop-window').width();
  var cropWindowHei = $('.crop-window').height();
  $('.crop-window').css('left', (wWidth - cropWindowWid)/2);
  $('.crop-window').css('top', (wHeight - cropWindowHei)/2);
}

function showSmallFrame(coords, object){
  var r = max(coords.w, coords.h) / 200;
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

//bind the keyEvent
function keyEvent(){
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

function max(x, y){
  return (x > y) ? x : y;
}

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

function loadJcrop($image){
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
  keyEvent();//enter&esc
  createJcrop($image);
}


//////
Template.pictures.events({
  'click #delete-last-pic-url': function() {
    $('#fet-pic-url').val("");
  },
});
//////
