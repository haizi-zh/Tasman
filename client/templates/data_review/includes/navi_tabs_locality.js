Template.naviTabsLocality.events({
  "click .navi-tabs": function(e) {
    var par = $(e.target).parent(),
      clsName = par.attr('class').split('-')[0];
    par.addClass("active");
    par.siblings().removeClass("active");
    $('div.' + clsName).removeClass('hidden').addClass("show");
    $('div.' + clsName).siblings().removeClass('show').addClass("hidden");
  },
  'click #submit-info': function(e) {
    log('Hello World');
    submitOplog();
  }
});