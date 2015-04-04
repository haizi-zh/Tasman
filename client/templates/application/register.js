Template.register.events({
  'click #register': function(event, template) {
    event.preventDefault();

    var username = template.find('input[name=username]').value,
        password = template.find('input[name=password]').value,
        rpassword = template.find('input[name=rpassword]').value,
        email = template.find('input[name=email]').value;
    if (!username) {
      alert('请输入用户名');
      return;
    }

    if (password.length < 6) {
      alert('密码长度不够');
      return;
    } else if(!istrue(password)) {
      alert('密码必须是数字和字母的组合');
      return;
    }
    // TODO use hash code
    if(password !== rpassword) {
      alert('两次输入的密码不对');
      return;
    }

    if (!email || !isEmail(email)) {
      alert('请输入正确的邮箱地址');
      return;
    };
    Accounts.createUser({
      username: username,
      email: email,
      password: password,
    }, function(error) {
      if(error){
        alert('注册失败');
        return;
      }
      Router.go('home');
    });
  }
});

function istrue(str){
  var reg=/^([a-z]+(?=[0-9])|[0-9]+(?=[a-z]))[a-z0-9]+$/ig;
  return reg.test(str);
}

function isEmail(str){
  var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
  return reg.test(str);
}
