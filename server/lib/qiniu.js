//使用node的crypto包
var crypto = Npm.require('crypto');

//当前默认空间(bucket)以及对应的默认host
// var defaultBucket = "hopeleft";
// var defaultPicHost = "http://7xi9ns.com1.z0.glb.clouddn.com/"; //在外面有用到
// var defaultBucket = bucket;
// var defaultPicHost = pictures_host; //在外面有用到

/**
 * Qiniu对象
 * @param {string} ak   accessKey
 * @param {string} sk   secretKey
 * @param {string} bk   存储图片的bucket
 * @param {string} host bucket对应的host
 */
QiniuSDK = function (ak, sk, bk, host){
  this.accessKey = ak;
  this.secretKey = sk;
  this.defaultBucket = bk;
  this.defaultPicHost = host;

  //默认定义returnBody：返回的信息
  this.returnBody = '{' +
    '"name": $(fname),' +
    '"size": $(fsize),' +
    '"w": $(imageInfo.width),' +
    '"h": $(imageInfo.height),' +
    '"fmt": $(imageInfo.format),' +
    '"cm": $(imageInfo.colorModel),' +
    '"hash": $(etag)' +
  '}';

  /**
   * 生成上传策略
   * @param  {object} op 上传相关参数:bucket,expires(单位:s),returnbody等
   * @return {object}    scope:上传空间(bucket);deadline:有效截至日期;returnBody:相应报文
   */
  this.genPutPolicy = function(op){
    this.putPolicy = {
      scope: op && op.bucket || this.defaultBucket,
      deadline: (op && op.expires || 3600) + Math.floor(Date.now() / 1000),
      returnBody: op && op.returnBody || this.returnBody
    };
    return this.putPolicy;
  };

  /**
   * 本地上传(表单上传) —— 获取token和key
   * @param  {object} op    上传相关参数:bucket,expires,returnbody等，新增:prefix,generator
   * @param  {string} host  对应的七牛的host
   * @return {object}       upToken:上传令牌;key:根据uuid生成的key,作为bucket中的唯一标识
   */
  this.getUpInfo = function(op, host){
    var flags = JSON.stringify(this.genPutPolicy(op));
    var encodedFlags = base64ToUrlSafe(new Buffer(flags).toString('base64'));
    var encoded = crypto.createHmac("sha1", this.secretKey).update(encodedFlags).digest('base64');
    var encodedSign = base64ToUrlSafe(encoded);
    // var encodedSign = base64ToUrlSafe(new Buffer(encoded).toString('base64'));说好的加密呢？
    var upToken = this.accessKey + ':' + encodedSign + ':' + encodedFlags;


    switch (op.generator){
      //时间戳
      case 1:
        var id = new Date().getTime();
        break;

      //默认为uuid
      default:
        var id = uuid.v1();
    }
    // var id2 = uuid.v4();

    return {
      upToken: upToken,
      key: op.prefix + id,
      url: (host || this.defaultPicHost) + op.prefix + id
    };
  };

  /**
   * 网上图片上传(fetch) —— 获取path, token, url
   * @param  {string} url   图片原本url
   * @param  {string} bk    bucket-要上传的七牛空间
   * @param  {string} host  空间对应的host
   * @return {objetc}       path:
   */
  this.getFetchInfo = function(url, bk, host){
    // 获取fetch的相关参数
    var encodedURL = getUrlsafeBase64Encode(url);//image source
    var key = crypto.createHash('md5').update(url).digest('hex');

    var bucket = bk || this.defaultBucket;
    var encodedEntryURI = getEncodedEntryURI(key, bucket);//image destination

    var path = '/fetch/' + encodedURL + '/to/' + encodedEntryURI;
    var accessToken = this.getAccessToken(path);

    //发送post请求，fetch图片
    var postUrl = 'http://iovip.qbox.me' + path;
    var options = {
      headers: {
        'Authorization': 'QBox ' + accessToken,
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    };

    try{
      var result = HTTP.call('POST', postUrl, options);
      var imageInfo = this.getImageBasicInfo(key);
      return {
        key: key,
        w: imageInfo.width,
        h: imageInfo.height,
        url: (host || this.defaultPicHost) + key,
        hash: imageInfo.hash
      };
    }catch(e){
      console.log("Fail in fetching images from remote url to qiniu!");
      console.log(e);
      return false;
    }
  };

  /**
   * 获取图片的基本信息
   * @param  {string} key  图片在空间中的key
   * @param  {string} host 所在空间对应的host
   * @return {object}
   */
  this.getImageBasicInfo = function(key, host){
    var host = host || this.defaultPicHost;
    var url = host + key + '?imageInfo';
    try{
      var result = HTTP.call('GET', url);
      return result.data;
    }catch(e){
      console.log("Fail in getting this image's basic info from qiniu! Key:" + key);
      console.log(e);
      return false;
    }
  };

  /**
   * 获取文件信息
   * @param  {[type]} key  [description]
   * @param  {[type]} host [description]
   * @param  {[type]} bk   [description]
   * @return {[type]}      [description]
   */
  this.getFileInfo = function(key, host, bk){
    var bucket = bk || this.defaultBucket;
    var encodedEntryURI = getEncodedEntryURI(key, bucket);
    var host = host || this.defaultPicHost;
    var path = '/stat/' + encodedEntryURI;
    var url = 'http://rs.qiniu.com' + path;
    var accessToken = this.getAccessToken(path);
    var options = {
      headers: {
        'Authorization': 'QBox ' + accessToken
      }
    };

    try {
      var result = HTTP.call('GET', url, options);
      return result.data;
    } catch(e) {
      console.log("Fail in getting this file's info from qiniu! Key:" + key);
      console.log(e);
      return false;
    }
  };

  /**
   * 获取管理凭证
   * @param  {string} path 发起请求的url中的<path>或<path>?<query>部分
   * @return {string}      accessToken:管理凭证
   */
  this.getAccessToken = function(path){
    var signingStr = path + '\n';
    var sign = crypto.createHmac("sha1", this.secretKey).update(signingStr).digest('base64');
    var encodedSign = base64ToUrlSafe(sign);
    var accessToken = this.accessKey + ":" + encodedSign;
    return accessToken;
  };
}

function getEncodedEntryURI(key, bk){
  var entry = bk + ':' + key;
  return getUrlsafeBase64Encode(entry);
}

/**
 * 获取url安全的base64编码
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
function getUrlsafeBase64Encode(str){
  return base64ToUrlSafe(new Buffer(str).toString('base64'));
}

function base64ToUrlSafe(v){
  return v.replace(/\//g, '_').replace(/\+/g, '-');
}

// var Qiniu = new QiniuSDK();
