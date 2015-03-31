var mongoImagestoreUrl = mongoUrlGen(dbAuth.imagestore.db, dbAuth.imagestore.username, dbAuth.imagestore.password, dbAuth.imagestore.host, dbAuth.imagestore.port);

var imagestore = new MongoInternals.RemoteCollectionDriver(mongoImagestoreUrl);

Images = new Mongo.Collection("Images", { _driver: imagestore});

Meteor.publish('Images', function(geoId) {
  check(geoId, String);
  return Images.find({'itemIds': new Mongo.ObjectID(geoId)});
  // db.Images.find({itemIds:ObjectId("5492bd35e721e7171745165b")})
});

//config.file
var expires = 1800;//30mins
var returnBody = '{' +
  '"name": $(fname),' +
  '"size": $(fsize),' +
  '"w": $(imageInfo.width),' +
  '"h": $(imageInfo.height),' +
  '"hash": $(etag)' +
'}';


var crypto = Npm.require('crypto');
Meteor.methods({
  'fetchPic': function(fetchUrl){
    check(fetchUrl, String);
    var encodedURL = base64ToUrlSafe(new Buffer(fetchUrl).toString('base64'));//from url
    var key = crypto.createHash('md5').update(fetchUrl).digest('hex');
    var entry = bucket + ':' + key;
    var encodedEntryURI = base64ToUrlSafe(new Buffer(entry).toString('base64'));//to space
    var path = '/fetch/' + encodedURL + '/to/' + encodedEntryURI;
    var signingStr = path + '\n';
    //hamac_sha1
    var sign = crypto.createHmac("sha1", secretKey).update(signingStr).digest('base64');
    //base64encdode
    var encodedSign = base64ToUrlSafe(sign);
    var accessToken = accessKey + ":" + encodedSign;

    //post
    var postUrl = 'http://iovip.qbox.me' + path;
    var options = {
      headers: {
        'Authorization': 'QBox ' + accessToken,
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    };

    try{
      var result = HTTP.call('POST', postUrl, options);
      return result.statusCode === 200;
    }catch(e){
      return false;
    }
  },
  'getPicUpToken': function(){
    var expire = expires || 3600;
    var deadline = expire + Math.floor(Date.now() / 1000);
    var putPolicy = {
          scope: bucket,
          deadline: deadline,
          returnBody: returnBody
        };
    var flags = JSON.stringify(putPolicy);
    var encodedFlags = base64ToUrlSafe(new Buffer(flags).toString('base64'));
    var encoded = crypto.createHmac("sha1", secretKey).update(encodedFlags).digest('base64');
    var encodedSign = base64ToUrlSafe(encoded);
    // var encodedSign = base64ToUrlSafe(new Buffer(encoded).toString('base64'));说好的加密呢？
    var upToken = accessKey + ':' + encodedSign + ':' + encodedFlags;

    var id = uuid.v1();
    // var id2 = uuid.v4();s
    return {
      upToken: upToken,
      key: id
    };
  }
})

function base64ToUrlSafe(v){
  return v.replace(/\//g, '_').replace(/\+/g, '-');
}










