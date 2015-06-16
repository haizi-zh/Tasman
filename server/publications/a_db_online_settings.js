//db的初始配置
dbAuth = {
  geo: {
    db: 'geo',
    replicaSet: 'aizou',
    readPreference: 'primaryPreferred'
  },
  poi: {
    db: 'poi',
    replicaSet: 'aizou',
    readPreference: 'primaryPreferred'
  },
  imagestore: {
    db: 'imagestore',
    replicaSet: 'aizou',
    readPreference: 'primaryPreferred'
  },
  guide: {
    db: 'guide',
    replicaSet: 'aizou',
    readPreference: 'primaryPreferred'
  },
  plan: {
    db: 'plan',
    replicaSet: 'aizou',
    readPreference: 'primaryPreferred'
  },
  cms: {
    db: 'nebula',
    replicaSet: 'aizou',
    readPreference: 'primaryPreferred'
  }
};

// console.log(process.env);
//etcd配置
var host = process.env.ETCD_URL;
var backendsUrl = host + '/v2/keys/backends';
var configUrl = host + '/v2/keys/project-conf';
// console.log(host);

// 需要通过请求获取的配置信息
var settings = {
  backends: {
    callUrl: backendsUrl + '/mongo' + '?recursive=true'
  },
  config: {
    callUrl: configUrl + '/tasman' + '?recursive=true',
    qiniu: {
      'pictures_host': '/qiniu/url',
      'accessKey': '/qiniu/accessKey',
      'secretKey': '/qiniu/secretKey',
      'bucket': '/qiniu/bucket'
    }
  }
}


/**********Start 获取tasman工程需要的配置信息 Start***********/
try{
  var callUrl = settings.config.callUrl;
  var result = HTTP.call('GET', callUrl).data.node;
  var dir = result.key;//如'/project-conf/tasman'
}catch(e){
  console.log(callUrl);
  // console.log("Fail in getting the project Tasman's settings!");
  // console.log(e);
}

// 获取qiniu的相关参数
bucket = getSettingValue(dir + settings.config.qiniu.bucket, result);
accessKey = getSettingValue(dir + settings.config.qiniu.accessKey, result);
secretKey = getSettingValue(dir + settings.config.qiniu.secretKey, result);
pictures_host = getSettingValue(dir + settings.config.qiniu.pictures_host, result);

/** 
 * 解析etcd返回的数据，并返回path对应的配置值
 * @param  {string} path   配置所对应的绝对路径，如: /project-conf/tasman/dbauth/geo/db
 * @param  {object} object 当前对应的以json格式存储的目录
 * @return {string}        对应的value值
 */
function getSettingValue(path, object){
  // console.log(path);
  // console.log(object);
  // 路径完全匹配
  if (path === object.key){
    return object.value;
  }

  // 路径符合父目录的标准
  if (object.dir && path.indexOf(object.key) > -1){
    if (object.nodes.length > 0){
      for (var i = 0;i < object.nodes.length;i++){
        var value = getSettingValue(path, object.nodes[i]);
        if (value){
          return value; 
        }
      }
    } else {
      return getSettingValue(path, object.node);
    } 
  }

  return false;
}
/**************End 获取tasman工程需要的配置信息 End**************/



/**********Start 获取mongo的host:port信息 Start***********/
try{
  var callUrl = settings.backends.callUrl;
  var result = HTTP.call('GET', callUrl).data.node.nodes;
}catch(e){
  console.log("Fail in getting the mongodb's settings!");
  console.log(e);
}

// 获取mongo的所有host
var mongoUrl = getMongoUrl(result);
console.log(mongoUrl);
for (var db in dbAuth){
  dbAuth[db].address = mongoUrl;
}

/**
 * 从etcd获取mongourl
 * @param  {[type]} object [description]
 * @return {[type]}        [description]
 */
function getMongoUrl(object){
  if (object != null){
    var url = [];
    object.map(function(x){
      url.push(x.value);
    })
    return url;
  }
  return false;
}
/**************End 获取tasman工程需要的配置信息 End**************/
