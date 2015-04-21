//使用node的crypto包
var crypto = Npm.require('crypto');

//当前默认空间(bucket)以及对应的默认host
var defaultBucket = "hopeleft";
var defaultPicHost = "http://7xi9ns.com1.z0.glb.clouddn.com/"; //在外面有用到

QiniuSDK = function (ak, sk){
  this.accessKey = ak;
  this.secretKey = sk;
  
  //默认定义returnBody：返回的信息
  this.returnBody = '{' +
    '"name": $(fname),' +
    '"size": $(fsize),' +
    '"w": $(imageInfo.width),' +
    '"h": $(imageInfo.height),' +
    '"hash": $(etag)' +
  '}';

  /**
   * 生成上传策略
   * @param  {object} op 上传相关参数:bucket,deadline,returnbody等
   * @return {object}    scope:上传空间(bucket);deadline:有效截至日期;returnBody:相应报文
   */
  this.genPutPolicy = function(op){
    this.putPolicy = {
      scope: op && op.bucket || defaultBucket,
      deadline: (op && op.expires || 3600) + Math.floor(Date.now() / 1000),
      returnBody: op && op.returnBody || this.returnBody
    };
    return this.putPolicy;
  };

  /**
   * 本地上传(表单上传) —— 获取token和key
   * @param  {object} op 上传相关参数:bucket,deadline,returnbody等
   * @return {object}    upToken:上传令牌;key:根据uuid生成的key,作为bucket中的唯一标识
   */
  this.getUpInfo = function(op, host){
    var flags = JSON.stringify(this.genPutPolicy(op));
    var encodedFlags = base64ToUrlSafe(new Buffer(flags).toString('base64'));
    var encoded = crypto.createHmac("sha1", this.secretKey).update(encodedFlags).digest('base64');
    var encodedSign = base64ToUrlSafe(encoded);
    // var encodedSign = base64ToUrlSafe(new Buffer(encoded).toString('base64'));说好的加密呢？
    var upToken = this.accessKey + ':' + encodedSign + ':' + encodedFlags;
    var id = uuid.v1();
    // var id2 = uuid.v4();

    return {
      upToken: upToken,
      key: id,
      url: host || defaultPicHost + id
    };
  };

  /**
   * 网上图片上传(fetch) —— 获取path, token, url
   * @param  {string} fetchUrl 图片原本url
   * @param  {string} bucket   要上传的七牛空间
   * @param  {string} host     空间对应的host
   * @return {objetc}          path:
   */
  this.getFetchInfo = function(fetchUrl, bucket, host){
    var encodedURL = base64ToUrlSafe(new Buffer(fetchUrl).toString('base64'));//from url
    var key = crypto.createHash('md5').update(fetchUrl).digest('hex');
    var entry = (bucket || defaultBucket) + ':' + key;
    var encodedEntryURI = base64ToUrlSafe(new Buffer(entry).toString('base64'));//to space
    var path = '/fetch/' + encodedURL + '/to/' + encodedEntryURI;
    var signingStr = path + '\n';
    var sign = crypto.createHmac("sha1", this.secretKey).update(signingStr).digest('base64');
    var encodedSign = base64ToUrlSafe(sign);
    var accessToken = this.accessKey + ":" + encodedSign;

    return {
    	path: path,
    	accessToken: accessToken,
      url: host || defaultPicHost + key,
      key: key
    };
  },

  /**
   * [getImageBasicInfo description]
   * @param  {string} key  图片在空间中的key
   * @param  {string} host 所在空间对应的host
   * @return {object}
   */
  this.getImageBasicInfo = function(key, host){
    var host = host || defaultPicHost;
    var url = host + key + '?imageInfo';
    try{
      var result = HTTP.call('GET', url);
      return result.data;
    }catch(e){
      console.log("Fail in getting image's basic info from qiniu!");
      console.log(e);
      return false;
    }
  }
}

function base64ToUrlSafe(v){
  return v.replace(/\//g, '_').replace(/\+/g, '-');
}

// var Qiniu = new QiniuSDK();
