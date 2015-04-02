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
    index = this.index;
    _time = setTimeout(function(){
      cropShow($image);
      cropLocate();
      selectFrameLocate($image.index);
      keyEvent();//enter&esc
      initJcrop($image);
    }, 400);
    
    $('#' + $image.id).Jcrop({
      onChange: changeCoords,
      onSelect: changeCoords,
      // onRelease: clearCoords
      aspectRatio: cropScale[cropScaleIndex]
    },function(){
      jcrop_api = this;
    });
  }
})