/**
 * 点击删除的‘X’图标，将比较的POI从列表中删除
 */

Template.compareItem.events({
  'click .selected_item': function(e) {
    e.preventDefault();
    e.stopPropagation();
    var curDOm = $(e.target),
        id = curDOm.attr('id');
    Session.set('compareItems', _.without(Session.get('compareItems'), id));
    curDOm.parent().remove();
    $('input[type=checkbox]').each(function(index) {
      if($(this).attr('data-id') === id) {
        $(this).attr('checked', false);
      }
    });
  }
});