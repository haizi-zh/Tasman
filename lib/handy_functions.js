mongoUrlGen = function(db, username, password, host, port) {
  if (!username || !password || !host || !db) {
    return ''
  }
  var p = port || '27017';
  return "mongodb://" + username + ":" + password + "@" + host + ":" + p + "/" + db;
};