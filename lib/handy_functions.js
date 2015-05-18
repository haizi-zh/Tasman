mongoUrlGen = function(db, username, password, host, port) {
  var p = port || '27017';
  if (!host || !db) {
    return ;
  }
  if (!username || !password) {
    return "mongodb://" + host + ":" + p + "/" + db;
  }
  return "mongodb://" + username + ":" + password + "@" + host + ":" + p + "/" + db;
};

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