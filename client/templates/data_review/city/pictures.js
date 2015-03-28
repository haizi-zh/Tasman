var _time = null;
var cropHints = [];//记录多个crop结果
var cropCoords = {};//记录单个crop数据
var index = -1;//记录第几个图片
var selected = [];


var AccessToken = "";

Template.pictures.events({
  "dblclick .raw-picture-container": function(e){
  	clearTimeout(_time);
    var $picShadow = $(e.target).parent().children(".pic-shadow");
    if ($picShadow.css("display") == "none"){
      //insert the cropped image
      $picShadow.show();
      var imageElement = 
        '<li class="selected-picture-container" data-index="' + this.index + '">' + 
          '<img src="' + this.url + '?imageView2/1/w/100/h/100" width="100px" height="100px" class="img-rounded" data-id="' + this.id + '">' +
        '</li>';
      $(".selected-container").append(imageElement);
    }else{
      //delete the cropped image
      $picShadow.hide();
      var selected = $(".selected-picture-container");
      var flag;
      for (var i = 0;i < selected.length;i++){
        if ($(selected[i]).attr("data-index") == this.index){
          flag = true;
          $(selected[i]).remove();
          break;
        }
      }
    }
  },

  "click .raw-picture-container": function(e){
  	clearTimeout(_time);
    var $image = this;
    index = this.index;
    _time = setTimeout(function(){
      cropShow($image);
      cropLocate();
      selectLocate($image.index);
      keyEvent();

      //loading jCrop
      $('#' + $image.id).Jcrop({
        onChange: changeCoords,
        onSelect: changeCoords
        // onRelease: clearCoords
      },function(){
        jcrop_api = this;
      });
    }, 400);
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

  "click .btn-pic-sort": function(e){
    $('.selected-container').sortable().bind('sortupdate');
  },

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
      }else{
        alert("上传图片失败，请再次上传或联系程序员！");   
      }
    });

    // if (fetch){
      // alert("保存成功,链接为:" + fetchUrl);
    // }

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

//show cropWindow
function cropShow($image){
  $('.crop-frame').empty();
  $('.small-frame').empty();
  $('.crop-shadow').show();
  $('.crop-window').show();      

  //insert the image Element
  var imageElement = '<img src="' + $image.url + '?imageView2/2/w/800/h/600/interlace/1" id="' + $image.id + '"/>';
  $(".crop-frame").append(imageElement);
  $(".small-frame").append('<img src="' + $image.url + '?imageView2/2/w/800/h/600/interlace/1" id="preview"/>');
}

function cropLocate(){
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

function selectLocate(index){
  cropCoords = cropHints[index] || 0;
  var r = max(cropCoords.w, cropCoords.h) / 200;
  $('.small-frame').css({
    width: Math.round(cropCoords.w / r) + 'px',
    height: Math.round(cropCoords.h / r) + 'px'
  });

  $('#preview').css({
    width: Math.round(cropCoords.cw / r) + 'px',
    height: Math.round(cropCoords.ch / r) + 'px',
    marginLeft: '-' + Math.round(cropCoords.x1 / r) + 'px',
    marginTop: '-' + Math.round(cropCoords.y1 / r) + 'px'
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

function showPreview(coords){
  var r = max(cropCoords.w, cropCoords.h) / 200;
  $('.small-frame').css({
    width: Math.round(cropCoords.w / r) + 'px',
    height: Math.round(cropCoords.h / r) + 'px'
  });

  $('#preview').css({
    width: Math.round(cropCoords.cw / r) + 'px',
    height: Math.round(cropCoords.ch / r) + 'px',
    marginLeft: '-' + Math.round(cropCoords.x1 / r) + 'px',
    marginTop: '-' + Math.round(cropCoords.y1 / r) + 'px'
  });
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
  showPreview(c);
}