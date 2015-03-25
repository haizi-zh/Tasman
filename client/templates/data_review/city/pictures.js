var _time = null;
var cropHints = [];//记录多个crop结果
var cropCoords = {};//记录单个crop数据
var index = -1;//记录第几个图片
var selected = [];

Template.pictures.events({
  "dblclick .raw-picture-container": function(e){
  	clearTimeout(_time);
    var $picShadow = $(e.target).parent().children(".pic-shadow");
    if ($picShadow.css("display") == "none"){
      $picShadow.show();
      var imageElement = 
        '<li class="selected-picture-container">' + 
          '<img src="' + this.url + '?imageView2/1/w/100/h/100" width="100px" height="100px" class="img-rounded" data-id="' + this.id 
            + '" data-index="' + this.index + '">' +
        '</li>';
      $(".selected-container").append(imageElement);
    }else{
      $picShadow.hide();
      var selected = $(".selected-picture-container");
      for (var i = 0;i < selected.length;i++){
        if ($(selected[i]).children("img").attr("data-index") == this.index){
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
  }
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
