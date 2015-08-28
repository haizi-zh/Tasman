
mongoUrlGen = function(db, username, password, address, replicaSet, readPreference, authSource) {
  // var p = port || '27017';
  if (!db || !address.length) {
    return ;
  }
  var mongoUrl = '',
      hostAndPort = '';

  // if(address) {
  //   address.map(function(h) {
  //     hostAndPort += h.host + ':' + h.port + ',';
  //   });
  // }
  if(address) {
    hostAndPort = address.toString();
  }

  hostAndPort += '/' + db + '?replicaSet=' + replicaSet + '&readPreference=' + readPreference + ((authSource) ? ('&authSource=' + authSource) : '');

  if (!username || !password) {
    mongoUrl = "mongodb://" + hostAndPort;
  }else{
    mongoUrl = "mongodb://" + username + ":" + password + "@" + hostAndPort;
  }

  return mongoUrl
};

// 根据db NAME获取相应的mongo对象
getMongoCol = function(col){
  check(col, String);
  var curDB;
  if("ViewSpot" === col) {
    curDB = ViewSpot;
  }else if('Locality' === col) {
    curDB = Locality;
  }else if('Hotel' === col) {
    curDB = Hotel;
  }else if('Shopping' === col) {
    curDB = Shopping;
  }else if('Restaurant' === col) {
    curDB = Restaurant;
  }
  return curDB;
};

/**
 * 获取格式化的时间,当前格式为YYYYMMDDhhmmssms
 * @return {[string]} [description]
 */
getFormatTime = function(){
  var tempDate = new Date();
  var Y = getFormatTimeUnit(tempDate.getFullYear(), 4);    //获取完整的年份(4位,1970-????)
  var M = getFormatTimeUnit(tempDate.getMonth() + 1, 2);       //获取当前月份(0-11,0代表1月)
  var D = getFormatTimeUnit(tempDate.getDate(), 2);        //获取当前日(1-31)
  var h = getFormatTimeUnit(tempDate.getHours(), 2);       //获取当前小时数(0-23)
  var m = getFormatTimeUnit(tempDate.getMinutes(), 2);     //获取当前分钟数(0-59)
  var s = getFormatTimeUnit(tempDate.getSeconds(), 2);     //获取当前秒数(0-59)
  var ms = getFormatTimeUnit(tempDate.getMilliseconds(), 3);    //获取当前毫秒数(0-999)
  return Y + M + D + h + m + s + ms;
}

/**
 * 获得格式化(定长)的时间单元(年，月，日，时，分，秒)
 * @param  {[number]} timeUnit 原时间单元数值
 * @param  {[number]} l        长度
 * @return {[string]}          格式化的时间单元字符串
 */
getFormatTimeUnit = function(timeUnit, l){
  var temp = (timeUnit) ? timeUnit + '' : '';
  for (var i = 1;i < l;i++){
    temp = parseInt(temp / 10);
    if (!temp)
      timeUnit = '0' + timeUnit;
  }
  return timeUnit;
}

