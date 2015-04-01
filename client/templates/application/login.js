Template.login.events({
  'submit .login-form': function(event, template) {
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

  'click #forget-password': function(event, template) {
    Router.go('forgetPassword');
  },

  'click #register': function(event, template) {
    Router.go('register');
  }
});