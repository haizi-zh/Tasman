setting = {
  callUrl: 'http://192.168.100.2:2379/v2/keys/project-conf/tasman?recursive=true',
  dbAuth: {
    // geo: ['db', 'username', 'password', 'host', 'port', 'replicaSet', 'readPreference'],
    geo: ['db', 'username', 'password', 'host', 'port'],
    poi: ['db', 'username', 'password', 'host', 'port'],
    imagestore: ['db', 'username', 'password', 'host', 'port'],
    guide: ['db', 'username', 'password', 'host', 'port'],
    plan: ['db', 'username', 'password', 'host', 'port'],
    cms: ['db', 'username', 'password', 'host', 'port']
  },
  qiniu: {
    'pictures_host': '/qiniu/url',
    'accessKey': '/qiniu/accessKey',
    'secretKey': '/qiniu/secretKey',
    'bucket': '/qiniu/bucket'
  }
}

/** 
 * 解析当前数据，并返回path对应的配置值
 * @param  {string} path   配置所对应的绝对路径，如: /project-conf/tasman/dbauth/geo/db
 * @param  {object} object 当前对应的以json格式存储的目录
 * @return {string}        对应的value值
 */
getSettingValue = function(path, object){
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

//获取tasman工程需要的配置信息
try{
  var callUrl = setting.callUrl;
  var settings = HTTP.call('GET', callUrl).data.node;
  var dir = settings.key;//如'/project-conf/tasman'
}catch(e){
  console.log('Fail in getting the project settings!');
  console.log(e);
}


// ['qiniu', 'url']  =>  /qiniu/url
// 获取qiniu的相关参数
pictures_host = getSettingValue(dir + setting.qiniu.pictures_host, settings);
accessKey = getSettingValue(dir + setting.qiniu.accessKey, settings);
secretKey = getSettingValue(dir + setting.qiniu.secretKey, settings);
bucket = getSettingValue(dir + setting.qiniu.bucket, settings);

console.log(pictures_host);
console.log(accessKey);
console.log(secretKey);
console.log(bucket);


//法二

// /**
//  * 根据表名，获取数据库的相应配置
//  * @param  {[type]} dbname [description]
//  * @return {[type]}        [description]
//  */
// getDBSettingFromName = function(dbname){
//   var dbauthUrl = 'http://192.168.100.2:2379/v2/keys/project-conf/tasman/dbauth/' + dbname;

//   try{
//     var username = HTTP.call('GET', dbauthUrl + '/username').data.node.value;
//   }catch(e){
//     var username = '';
//     console.log('Fail in getting username of db:' + dbname);
//     console.log(e);
//   }

//   try{
//     var password = HTTP.call('GET', dbauthUrl + '/password').data.node.value;
//   }catch(e){
//     var password = '';
//     console.log('Fail in getting password of db:' + dbname);
//     console.log(e);
//   }

//   try{
//     var host = HTTP.call('GET', dbauthUrl + '/host').data.node.value;
//   }catch(e){
//     var host = '';
//     console.log('Fail in getting host of db:' + dbname);
//     console.log(e);
//   }

//   try{
//     var port = HTTP.call('GET', dbauthUrl + '/port').data.node.value;
//   }catch(e){
//     var port = '';
//     console.log('Fail in getting port of db:' + dbname);
//     console.log(e);
//   }
//   return {
//     db: dbname,
//     username: username,
//     password: password,
//     host: host,
//     port: port
//   }
// }

// // db connections
// var imagestoreDB = getDBSettingFromName('imagestore');
// var geoDB = getDBSettingFromName('geo');
// var poiDB = getDBSettingFromName('poi');
// var planDB = getDBSettingFromName('plan');
// var guideDB = getDBSettingFromName('guide');

// dbAuth = {
//   geo: geoDB,
//   poi: poiDB,
//   guide: guideDB,
//   plan: planDB,
//   imagestore: imagestoreDB
// };


//法一


/**
 * 根据层次结构获取的params，获取相应的value值(string)
 * @param  {object} params [description]
 * @return {string}        [description]
 */
// getValueOf = function(params){
//   var tasmanUrl = 'http://192.168.100.2:2379/v2/keys/project-conf/tasman';
//   var paramsStr = '';
//   for (var i = 0;i < params.length;i++) paramsStr += '/' + params[i];
//   var callUrl = tasmanUrl + paramsStr;

//   try{
//     var value = HTTP.call('GET', callUrl).data.node.value;
//   }catch(e){
//     console.log('Fail in getting the value of: ' + paramsStr);
//     console.log(e);
//   }
// }

//pictures
// pictures_host = getValueOf(['qiniu', 'url']);
// accessKey = getValueOf(['qiniu', 'accessKey']);
// secretKey = getValueOf(['qiniu', 'secretKey']);
// bucket = getValueOf(['qiniu', 'bucket']);
