var _time = null;
var cropHints = [];//记录多个crop结果
var cropCoords = {};//记录单个crop数据
var index = -1;//记录第几个图片
var selected = [];

var AccessToken = "";
var cropScale = [1, 3/2, 4/3, 2];//width:height
var cropScaleIndex = -1;

Template.pictures.helpers({
  imageList: function(task) {
    var mid = Session.get('currentLocalityId') || Session.get('currentVsId')
    || Session.get('currentRestaurantId') || Session.get('currentShoppingId');
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
    log(images.length > 0);
    return images;
  }
});

Template.pictures.events({
  "dblclick .raw-picture-container": function(e){
  	clearTimeout(_time);
    var $picShadow = $(e.target).parent().children(".pic-shadow");
    if ($picShadow.css("display") == "none"){
      //insert the cropped image
      $picShadow.show();
      Blaze.renderWithData(Template.selectedPictures, this, $('ul.selected-container')[0]);
      $('.selected-container').sortable().bind('sortupdate');
    }else{
      //delete the cropped image
      $picShadow.hide();
      var selected = $(".selected-picture-container");
      for (var i = 0;i < selected.length;i++){
        if ($(selected[i]).attr("data-index") == this.index){
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

  "click #crop-submit": function(e){
    cropHints[index] = cropCoords;
    $("#crop-close").trigger("click");
  },

  // "click .btn-pic-sort": function(e){
  //   $('.selected-container').sortable().bind('sortupdate');
  // },

  "click .btn-pic-submit": function(e){
    var selected = $(".selected-picture-container");
    console.log(cropHints);
    for (var i = 0;i < selected.length;i++){
      console.log($(selected[i]).attr("data-index"));
      console.log(cropHints[ $(selected[i]).attr("data-index") ]);
    }
  },

  "click #pic-up-sub": function(e){
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
          url: 'http://upload.qiniu.com/',
          async: false,
          cache: false,
          contentType: false,
          processData: false,
          data: form_data,
          success: function(data) {
            var image_url = "http://7xi9ns.com1.z0.glb.clouddn.com/";
            console.log(data);
            alert("上传成功！链接：" + image_url + data.key);
          }
        });
      }else{
        console.log("获取token失败！");
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
        alert("成功上传图片！");
        console.log(result);
        // 将上传的图片加入 图片列表中，包括未选和已选
        // 讲图片数据插入数据库中！
      }else{
        alert("上传图片失败，请再次上传或联系程序员！");
      }
    });

    // var encodedURL = "aHR0cHM6Ly9zczEuYmFpZHUuY29tLzl2bzNkU2FnX3hJNGtoR2tvOVdUQW5GNmhoeS9zdXBlci93aGZwZiUzRDQyNSUyQzI2MCUyQzUwL3NpZ249ZGNkOGUxODA3N2YwODIwMjJkYzdjMjdmMmRjNmNmZGYvZGM1NDU2NGU5MjU4ZDEwOWMyNGRhYzExZDU1OGNjYmY2ZDgxNGRlMi5qcGc=";
    // var encodedEntryURI = "aG9wZWxlZnQ6YWJjZGU=";
    // var path = '/fetch/' + encodedURL + '/to/' + encodedEntryURI;
    // var accessToken = 'TchpexGkbyuY0nMt-T1_xIpbsgN90lBg3QyD3utE:7-GNext63FOeELw-ahdI8I-4p34=';

    // var url = 'http://iovip.qbox.me' + path;
    // var options = {
    //   headers: {
    //     'Authorization': 'QBox TchpexGkbyuY0nMt-T1_xIpbsgN90lBg3QyD3utE:7-GNext63FOeELw-ahdI8I-4p34=',
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //   }
    // };

    // $.ajax({
    //   type: 'post',
    //   url: 'http://iovip.qbox.me' + path,
    //   beforeSend:function(xhr){
    //     xhr.setRequestHeader('Authorization', "QBox " + accessToken);
    //     console.log(xhr);
    //   },
    //   // POST /fetch/<EncodedURL>/to/<EncodedEntryURI>
    //   // async: false,
    //   // cache: false,
    //   // contentType: false,
    //   contentType: 'application/x-www-form-urlencoded',
    //   // processData: false,
    //   // data: form_data,
    //   // data: null,
    //   // Authorization: QBox <AccessToken>,
    //   // headers: {
    //   //   'Authorization': "QBox " + AccessToken
    //   // },
    //   // beforeSend:function(xhr){
    //   //   xhr.setRequestHeader('Authorization', "QBox " + AccessToken);
    //   //   console.log(xhr);
    //   // },
    //   success: function(data) {
    //     var image_url = "http://7xi9ns.com1.z0.glb.clouddn.com/";
    //     console.log(image_url + "abcde");
    //   }
    // });
  },
})

Template.selectedPictures.events({
  "click .glyphicon-minus": function(e){
    $(e.target).parent().remove();
    var picForSelect = $(".raw-picture-container");
    for (var i = 0;i < picForSelect.length;i++){
      if ($(picForSelect[i]).attr("id") == this.index){
        $(picForSelect[i]).children(".pic-shadow").hide();
        break;
      }
    }
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
  index = $image.index;
  cropShow($image);
  cropCoords = {};
  $('#crop-small-1').empty();
  $('#crop-small-2').empty();
  if (cropHints[$image.index]){
    $("#crop-small-2").append('<img src="' + $image.url + '?imageView2/2/w/800/h/600/interlace/1" class="preview"/>'); 
    showSmallFrame(cropHints[$image.index], '#crop-small-2');
  }
  $("#crop-small-1").append('<img src="' + $image.url + '?imageView2/2/w/800/h/600/interlace/1" class="preview"/>');
  cropLocation();
  keyEvent();//enter&esc
  createJcrop($image);
}
