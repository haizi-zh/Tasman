var mongoImagestoreUrl = mongoUrlGen(dbAuth.imagestore.db, dbAuth.imagestore.username, dbAuth.imagestore.password, dbAuth.imagestore.host, dbAuth.imagestore.port);

var imagestore = new MongoInternals.RemoteCollectionDriver(mongoImagestoreUrl);

Images = new Mongo.Collection("Images", { _driver: imagestore});

Meteor.publish('Images', function(geoId) {
  check(geoId, String);
  return Images.find({'itemIds': new Mongo.ObjectID(geoId)});
});

var Qiniu = new QiniuSDK(accessKey, secretKey);
Meteor.methods({

  //TODO 此处应该把发送http请求部分也封装！！！
  //
  //
  'fetchPic': function(fetchUrl){
    check(fetchUrl, String);
    var fetchInfo = Qiniu.getFetchInfo(fetchUrl);
    // var fetchInfo = Qiniu.getFetchInfo(fetchUrl, "hopeleft");
    var postUrl = 'http://iovip.qbox.me' + fetchInfo.path;
    var options = {
      headers: {
        'Authorization': 'QBox ' + fetchInfo.accessToken,
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    };

    try{
      var result = HTTP.call('POST', postUrl, options);
      var imageInfo = Qiniu.getImageBasicInfo(fetchInfo.key);
      // return result.statusCode === 200 && fetchInfo.url;
      return {
        key: fetchInfo.key,
        w: imageInfo.width,
        h: imageInfo.height,
        url: fetchInfo.url
      };
    }catch(e){
      console.log("Fail in fetching images from remote url to qiniu!");
      console.log(e);
      return false;
    }

  },
  'getPicUpToken': function(){
    var options = {
      // bucket: hopeleft,
      expires: 1800//s
    };
    return Qiniu.getUpInfo(options);
  }
})