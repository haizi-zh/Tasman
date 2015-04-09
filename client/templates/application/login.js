Template.login.events({
  'click #login': function(event, template) {
    event.preventDefault();

    var password = template.find('input[name=password]').value,
      username = template.find('input[name=username]').value;

    Meteor.loginWithPassword(username, password, function(error) {
      if (error) {
        alert('账号或者密码错误');
      } else {
        Router.go('home');
      }
    });
  },

});

Template.login.onRendered(function(){
  $.material.radio();
});