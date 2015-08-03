
mongoUrlGen = function(db, username, password, address, replicaSet, readPreference) {
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
  hostAndPort += '/' + db + '?replicaSet=' + replicaSet + '&readPreference=' + readPreference;

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