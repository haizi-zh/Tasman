var crypto = Npm.require('crypto');
var defaultBucket = "hopeleft";
var defaultPicHost = "http://7xi9ns.com1.z0.glb.clouddn.com/";

QiniuSDK = function (ak, sk){
  this.accessKey = ak;
  this.secretKey = sk;
  
  this.returnBody = '{' +
    '"name": $(fname),' +
    '"size": $(fsize),' +
    '"w": $(imageInfo.width),' +
    '"h": $(imageInfo.height),' +
    '"hash": $(etag)' +
  '}';

  this.genPutPolicy = function(op){
    this.putPolicy = {
      scope: op && op.bucket || defaultBucket,
      deadline: (op && op.expires || 3600) + Math.floor(Date.now() / 1000),
      returnBody: op && op.returnBody || this.returnBody
    };
    return this.putPolicy;
  };

  this.getUpInfo = function(op){
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
      key: id
    };
  };

  this.getFetchInfo = function(fetchUrl, bucket){
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
      url: defaultPicHost + key
    };
  }
}

function base64ToUrlSafe(v){
  return v.replace(/\//g, '_').replace(/\+/g, '-');
}

// var Qiniu = new QiniuSDK();