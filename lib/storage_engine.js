/**
 * 获得某条记录的编辑历史
 * @param  {string} ns namespace，如'geo.Locality'
 * @param  {string} pk 主键
 * @param  {object} queryStmt 其它查找条件
 * @param  {object} option    option spec
 */
fnHistory = function(ns, pk, queryStmt, option) {
  Meteor.subscribe('oplog', ns, pk, 0);
  var query = {
    'ns': ns,
    'pk': pk,
    'status': {'$ne': 'rejected'}
  };

  if (queryStmt !== undefined) {
    for (var key in queryStmt) {
      query[key] = queryStmt[key];
    }
  }

  var opt = {
      fields: {'ts': 1, 'ns': 1, 'userId': 1,  'status': 1, 'pk': 1, 'o': 1},
      sort: {'ts': -1}
    };
  if (option !== undefined) {
    for (var key in option) {
      opt[key] = option[key];
    }
  }
  return CmsOplog.find(query, opt).fetch();
};


/**
 * 获得更新前的原始数据
 * @param  {[type]} db  [db name]
 * @param  {[type]} col [collection name]
 * @return {[type]}     [description]
 */
getMongoClient = function(db, col) {
  check(db, String);
  check(col, String);
  // if(_.keys(dbAuth).indexOf(db) === -1) {
  //   throw "db named " + db + " not found";
  // }
  if(col === "ViewSpot") {
    return ViewSpot;
  }else if(col === "Locality") {
    return Locality;
  }else if(col === "Hotel") {
    return Hotel;
  }else if(col === "Shopping") {
    return Shopping;
  }else if(col === "Restaurant") {
    return Restaurant;
  }else {
    throw "Collection Not Established";
  }
};


/**
 * 获得更新前的原始数据
 * @param  {[type]} db  [description]
 * @param  {[type]} col [description]
 * @param  {[type]} pk  [description]
 * @param  {[type]} op  [description]
 * @return {[type]}     [description]
 */
var getOriginalVal = function(db, col, pk, op) {
  // Get all the fields that are updated
  var updatedFields = {};
  op = JSON.parse(op);//['$set'];
  for (var key in op) {
    for (var field in op[key]) {
      updatedFields[field] = 1;
    }
  }
  // log(updatedFields);
  // TODO Implement the code below
  var conn = getMongoClient(db, col);
  var original = conn.findOne({_id: pk}, {fields: updatedFields});
  return original;
};


/**
 * 从ns中获得db和coll的信息
 */
var extractDbInfo = function(ns) {
  var terms = ns.split('.');
  if (terms.length != 2)
    throw 'Invalid namespace: ' + ns;
  var dbName = terms[0];
  var collName = terms[1];
  return {'db': dbName, 'coll': collName};
};


/**
 * 更新某条记录
 * @param  {string} ns namespace，如'geo.Locality'
 * @param  {object} pk 主键
 * @param  {string} o  操作码：'i'：插入，'d'：删除，'u'：更新
 * @param  {string} op oplog的数据体
 * @param  {object} custom 其它需要上传的数据
 * @param  {object} custom 用户自定义数据
 */
fnUpdate = function(ns, pk, o, op, custom) {
  check(ns, String);
  check(o, String);
  check(op, String);

  var dbInfo = extractDbInfo(ns);
  var dbName = dbInfo.db;
  var collName = dbInfo.coll;

  // Get original values
  var original = getOriginalVal(dbName, collName, pk, op);

  var userId = Meteor.userId();
  var entry = {
    'ts': Date.now(),
    'ns': ns,
    'userId': userId,
    'status': 'staged',
    'pk': pk,
    'o': o,
    'op': op,
    'original': original
  };
  if (custom !== undefined) {
    check(custom, Object);
    entry.custom = custom;
  }

  // update OplogPkList
  Meteor.call('OplogPkList.update', entry.ts, entry.ns, entry.userId, entry.pk, custom.zhName);
  return CmsOplog.insert(entry);
};


/**
 * 判断一个字符串是否为整数
 */
var isInteger = function(number) {
  if (isNaN(number))
    return false;
  else {
    var fv = parseFloat(number);
    var iv = parseInt(number);
    return (fv == iv);
  }
};

/**
 * Operator模拟操作的helper
 * @param  {[type]} base     [description]
 * @param  {[type]} notation 诸如'geo.Location.0.lat'之类
 * @param  {[type]} opFunc   [description]
 * @param  {boolean} setPlaceholder 是否需要建立placeholder
 * @return {[type]}          [description]
 */
 var operatorHelper = function(base, notation, opFunc, setPlaceholder) {
  if (opFunc === undefined)
    return base;

  var fieldsList = notation.split('.');
  var parent = base;

  for (var idx=0; idx<fieldsList.length; idx++) {
    var currentField = fieldsList[idx];

    if (idx == fieldsList.length - 1) {
      if (isInteger(currentField))
        currentField = parseInt(currentField);
      opFunc(parent, currentField);
      return;
    }

    if (setPlaceholder === true) {
      var newPlaceholders;
      // 分为两种情况：currentField为数字和非数字
      if (isInteger(currentField)) {
        currentField = parseInt(currentField);
        newPlaceholders = (currentField >= parent.length);
      } else {
        newPlaceholders = !(currentField in parent);
      }

      if (newPlaceholders) {
        // 需要在当前的parent添加placeholder
        // 看看下一个notation是否为数字
        if (isInteger(fieldsList[idx+1]))
          parent[currentField] = [];
        else
          parent[currentField] = {};
      }
    }
    parent = parent[currentField];
  }
};

var setOperator = function(base, opData) {
  // $set
  if (opData === undefined)
    return;

  for (var notation in opData) {
    var value = opData[notation];
    var opFunc = function(parent, field) {
      if (Array.isArray(parent))
        throw 'Unable to apply $set on an array!';
      parent[field] = value;
    };
    operatorHelper(base, notation, opFunc, true);
  }
  return base;
};

var unsetOperator = function(base, opData) {
  // $unset
  if (opData === undefined)
    return;

  var opFunc = function(parent, field) {
    if (Array.isArray(parent))
      throw 'Unable to apply $unset on an array!';
    if (field in parent)
      delete parent[field];
  };

  for (var notation in opData) {
    if (opData[notation] != 1)
      continue;
    operatorHelper(base, notation, opFunc, false);
  }
  return base;
};

var pushOperator = function(base, opData) {
  // $push
  if (opData === undefined)
    return;

  for (var notation in opData) {
    var value = opData[notation];
    var opFunc = function(parent, field) {
      if (!(field in parent))
        parent[field] = [];
      else if (!Array.isArray(parent[field]))
        throw 'Unable to $push on a non-array.';

      if ((value instanceof Object) && ('$each' in value) &&
        (Array.isArray(value.$each))) {
        var elements = value.$each;
        for (var idx in elements)
          parent[field].push(elements[idx]);
      } else
        parent[field].push(value);
    };
    operatorHelper(base, notation, opFunc, true);
  }
};

var popOperator = function(base, opData) {
  // $pop
  if (opData === undefined)
    return;

  var removeFirst = function(elements) {
    return elements.slice(1);
  };
  var removeLast = function(elements) {
    return elements.slice(0, elements.length - 1);
  };

  for (var notation in opData) {
    var value = opData[notation];
    var opFunc = function(parent, field) {
      if (!(field in parent) || !Array.isArray(parent[field]))
        return;

      if (value == 1)
        parent[field] = removeLast(parent[field]);
      else if (value == -1)
        parent[field] = removeFirst(parent[field]);
      else
        throw 'Invalid data';
    };
    operatorHelper(base, notation, opFunc, false);
  }
};

var addToSetOperator = function(base, opData) {
  // $addToSet
  if (opData === undefined)
    return;

  for (var notation in opData) {
    var value = opData[notation];
    var opFunc = function(parent, field) {
      if (!(field in parent))
        parent[field] = [];
      else if (!Array.isArray(parent[field]))
        throw 'Unable to $push on a non-array.';

      var dictHelper = {};
      var target = parent[field];
      for (var idx in target)
        dictHelper[target[idx]] = 1;

      var candidates = [];
      if ((value instanceof Object) && ('$each' in value) &&
        (Array.isArray(value.$each))) {
        var elements = value.$each;
        for (var idx in elements)
          candidates.push(elements[idx]);
      } else
        candidates.push(value);

      for (var idx in candidates) {
        var ele = candidates[idx];
        if (ele in dictHelper)
          continue;
        target.push(ele);
        dictHelper[ele] = 1;
      }
    };
    operatorHelper(base, notation, opFunc, true);
  }
};

var operatorMap = {
  '$set': setOperator,
  '$unset': unsetOperator,
  '$push': pushOperator,
  '$pop': popOperator,
  '$addToSet': addToSetOperator
};

/**
 * 将新的操作记录应用到某条数据上
 * @param  {object} base 基底数据
 * @param  {string} o    "i", "d", "u"操作
 * @param  {object} op
 * @return {object}      新版本的数据
 */
var apply = function(base, o, op) {
  // TODO 只支持update操作
  if (o != 'u')
    throw 'Unsupported operation';
  op = JSON.parse(op);
  for (var opKey in op) {
    var func = operatorMap[opKey];
    base = func(base, op[opKey]);
  }

  return base;
};

/**
 * 获得某个版本的快照
 * @param  {String} ns   名字空间
 * @param  {object} pk   主键
 * @param  {object} option      类似于findOne方法的option
 * @param  {object} snapshotId  快照的版本。如果为undefined，表示取最新的版本。
 * @return {object}      快照数据
 */
fnSnapshot = function(ns, pk, option, snapshotId) {
  // master versioin
  var dbInfo = extractDbInfo(ns);
  var conn = getMongoClient(dbInfo.db, dbInfo.coll);
  var masterData;
  if (option === undefined)
    masterData = conn.findOne({_id: pk});
  else
    masterData = conn.findOne({_id: pk}, option);
  var query = {'status': 'staged'};
  // 获得snapshotId极其之前的操作历史
  if (snapshotId !== undefined)
    query._id = {'$lte': snapshotId};
  var opt = {
      fields: {'o': 1, 'op': 1},
      sort: {'ts': 1}
    };
  var history = fnHistory(ns, pk, query, opt);

  // TODO 修正cursor的fetch: findOne don't need fetch
  var revData = masterData;

  for (var idx in history) {
    var oplog = history[idx];
    revData = apply(revData, oplog.o, oplog.op);
  }

  return revData;
};

storageEngine = {
  // 获得某条记录的修改历史
  'history': fnHistory,
  'update': fnUpdate,
  'snapshot': fnSnapshot
};
