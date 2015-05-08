arrangeDiv = function(){
  var baseDivs = $('.recheck-base-wrapper').find('.form-group'),
      compDivs = $('.recheck-compare-wrapper').find('.form-group'),
      diffDivs = $('.recheck-diff-wrapper').find('.form-group'),
      len = baseDivs.length == compDivs.length && baseDivs.length == diffDivs.length ? baseDivs.length : 0;

  var maxIndex = 0,
      diffHeight = [0, 0, 0];

  for(var i = 0; i < len; i = i + 1) {
    var divArray = [baseDivs[i], compDivs[i], diffDivs[i]],
        index = 0,
        maxHeight = 0;
    for(var j = 0; j < 3; j = j + 1) {
      var temp = $(divArray[j]).height();
      if(maxHeight < temp){
        maxHeight = temp;
        maxIndex = j;
      }
    }
    log(maxIndex);

    for(var k = 0; k < 3; k = k + 1) {
      $(divArray[k]).css({'top': diffHeight[k], 'position': 'relative'});
    }

    diffHeight = [
                  diffHeight[0] + $(divArray[maxIndex]).height() - $(divArray[0]).height(),
                  diffHeight[1] + $(divArray[maxIndex]).height() - $(divArray[1]).height(),
                  diffHeight[2] + $(divArray[maxIndex]).height() - $(divArray[2]).height(),
                ];
  }

  $('.pic-list').each(function(index, dom){
    $(dom).css({'top': diffHeight[index], 'position': 'relative'});
  })
}