Template.naviTabsLocality.events({
  "click .navi-tabs": function(e) {
    var par = $(e.target).parent(),
      clsName = par.attr('class');
    par.addClass("active");
    par.siblings().removeClass("active");
    $('div.' + clsName).removeClass('hidden').addClass("show");
    $('div.' + clsName).siblings().removeClass('show').addClass("hidden");
  }
});