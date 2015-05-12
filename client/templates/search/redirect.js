timeCountDown = function(second, callback){
  var t = second;
  $('.redirect-time-limit').html(t);
  if(t > 0){
    t = t - 1;
  }else{
    return callback && callback();
  }
  Meteor.setTimeout(function(){
    timeCountDown(t, callback);
  }, 1000);
};