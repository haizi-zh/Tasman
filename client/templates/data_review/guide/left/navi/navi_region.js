
Template.naviRegion.events({
  //选择国内
  'click #tag-domestic': function() {
    $('.abroad').addClass("hidden");
    $('.domestic').removeClass("hidden");
    $('#tag-domestic').css({'background-color': '#337ab7', 'color': '#fff'});
    $('#tag-abroad').css({'background-color': '#ccc', 'color': '#333'});
  },

  //选择国外
  'click #tag-abroad': function() {
    $('.domestic').addClass("hidden");
    $('.abroad').removeClass("hidden");
    $('#tag-abroad').css({'background-color': '#337ab7', 'color': '#fff'});
    $('#tag-domestic').css({'background-color': '#ccc', 'color': '#333'});
  }
})
