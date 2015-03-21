mongoUrlGen = function(db, username, password, host, port) {
  if (!host || !db) {
    return ;
  }
  if (!username || !password) {
    return "mongodb://" + host + ":" + p + "/" + db;
  }
  var p = port || '27017';
  return "mongodb://" + username + ":" + password + "@" + host + ":" + p + "/" + db;
};