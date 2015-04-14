Template.aizouTag.events({
  'click .aizouTag-container': function(event, template) {
    event.preventDefault();
    $('.suggestionItems').show();
    $('input[name=search-input]').focus();
  },

  'mousedown .at-sugg-item': function(event, template) {
    var uid = $(event.target).attr('data-uid'),
        username = $(event.target).text();
    if(isSelected(uid)){
      event.preventDefault();
      return;
    }
    var selectItem = {'uid': uid, 'username': username};
    session_addProperty('aizouTag', uid, username);
    $(event.target).css(disableCss);
    Blaze.renderWithData(Template.aizouTag_selected_item, selectItem, $('.at-selection')[0], $('.at-search-inline')[0]);
  },

  'blur input[name=search-input]': function(event, template) {
    event.preventDefault();
    $('.suggestionItems').hide();
  },

  'click .at-selected-remove': function(event, template){
    var parentDom = $(event.target).parent(),
        uid = parentDom.attr('uid');
    parentDom.remove();
    session_deleteProperty('aizouTag', uid);
    $('#atTag-' + uid).css(enableCss);
  },
});


Template.aizouTag.helpers({

});

Template.aizouTag.onRendered(function() {
  Session.set('aizouTag', {});

  $('.at-sugg-item').each(function(i, obj) {
    $(obj).hover(
      function() {
        $(this).addClass("list-group-item-success");
      },
      function() {
        $(this).removeClass("list-group-item-success")
      }
    );
  });
})

function session_addProperty(sessionName, key, value) {
  check(key, String);
  if (!Session.get(sessionName)) {
    Session.set(sessionName, {key: value});
  } else {
    var tempSession = Session.get(sessionName);
    tempSession[key] = value;
    Session.set(sessionName, tempSession);
  }
}

function session_deleteProperty(sessionName, key) {
  check(key, String);
  if (!Session.get(sessionName)) {
    return;
  } else {
    var tempSession = Session.get(sessionName);
    delete tempSession[key];
    Session.set(sessionName, tempSession);
  }
}

function isSelected(id) {
  check(id, String);
  log(_.keys(Session.get('aizouTag')).indexOf(id) !== -1);
  return _.keys(Session.get('aizouTag')).indexOf(id) !== -1
}

var disableCss = {
  'cursor': 'no-drop',
  'color': '#ccc',
}
var enableCss = {
  'cursor': 'pointer',
  'color': '#666666',
}