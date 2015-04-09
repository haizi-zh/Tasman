Template.compare.helpers({
  
});

Template.compare.onRendered(function() {
  Session.set('compareItems', ['location for items type']);
});

Template.compare.events({
  "click input[type='radio']": function(e) {
    var mid = $(e.target).val(),
        name = $(e.target).attr('name');
    $('.cmp_' + name).addClass("compared");
    $(e.target).parent().addClass("cmp_selected");
  }
});