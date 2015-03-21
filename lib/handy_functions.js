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