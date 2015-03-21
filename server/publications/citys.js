var mongoGeoUrl = mongoUrlGen(dbAuth.geo.db, dbAuth.geo.username, dbAuth.geo.password, dbAuth.geo.host, dbAuth.geo.port);

var geo = new MongoInternals.RemoteCollectionDriver(mongoGeoUrl);

Locality = new Mongo.Collection("Locality", { _driver: geo });

Meteor.publish('cities', function() {
  return Locality.find({}, {fields: {abroad: 1, zhName: 1, superAdm: 1}});
});

Locality.allow({
  update: function () {
    return false;
  }
});