var mongoImagestoreUrl = mongoUrlGen(dbAuth.imagestore.db, dbAuth.imagestore.username, dbAuth.imagestore.password, dbAuth.imagestore.host, dbAuth.imagestore.port);

var imagestore = new MongoInternals.RemoteCollectionDriver(mongoImagestoreUrl);

Images = new Mongo.Collection("Images", { _driver: imagestore});

Meteor.publish('Images', function(geoId) {
  check(geoId, String);
  return Images.find({'itemIds': new Mongo.ObjectID(geoId)});
});

var Qiniu = new QiniuSDK(accessKey, secretKey, bucket, pictures_host);
Meteor.methods({
  //TODO 此处应该把发送http请求部分也封装！！！
  'fetchPic': function(fetchUrl){
    check(fetchUrl, String);
    var fetchInfo = Qiniu.getFetchInfo(fetchUrl);
    return fetchInfo;
  },
  'getPicUpToken': function(){
    var options = {
      expires: 1800
    };
    return Qiniu.getUpInfo(options);
  }
})