var mongoImagestoreUrl = mongoUrlGen(dbAuth.imagestore.db, dbAuth.imagestore.username, dbAuth.imagestore.password, dbAuth.imagestore.host, dbAuth.imagestore.port);

var imagestore = new MongoInternals.RemoteCollectionDriver(mongoImagestoreUrl);

Images = new Mongo.Collection("Images", { _driver: imagestore});

Meteor.publish('Images', function(geoId) {
  check(geoId, String);
  return Images.find({'itemIds': new Mongo.ObjectID(geoId)});
  // db.Images.find({itemIds:ObjectId("5492bd35e721e7171745165b")})
});

