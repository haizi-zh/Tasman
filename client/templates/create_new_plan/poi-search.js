Template.poiSearch.helpers({
  'targetName': function(){
    return searchPlaceholderText();
  }
});


function searchPlaceholderText() {
  var type = Session.get('poi-navi-active').toLowerCase(),
      text= '';
  switch(type){
    case 'viewspot': text = "景点";break;
    case 'restaurant': text = "美食";break;
    case 'shopping': text = "购物";break;
    case 'hotel': text = "酒店";break;
    case 'traffic': text = "交通";break;
    case 'collect': text = "收藏";break;
  }
  return text;
}