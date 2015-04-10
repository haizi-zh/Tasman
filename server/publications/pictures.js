var mongoImagestoreUrl = mongoUrlGen(dbAuth.imagestore.db, dbAuth.imagestore.username, dbAuth.imagestore.password, dbAuth.imagestore.host, dbAuth.imagestore.port);

var imagestore = new MongoInternals.RemoteCollectionDriver(mongoImagestoreUrl);

Images = new Mongo.Collection("Images", { _driver: imagestore});

Meteor.publish('Images', function(geoId) {
  check(geoId, String);
  return Images.find({'itemIds': new Mongo.ObjectID(geoId)});
});

var Qiniu = new QiniuSDK(accessKey, secretKey);
Meteor.methods({
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
      return result.statusCode === 200 && fetchInfo.url;
    }catch(e){
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