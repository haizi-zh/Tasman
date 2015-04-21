
var mongoGeoUrl = mongoUrlGen(dbAuth.geo.db, dbAuth.geo.username, dbAuth.geo.password, dbAuth.geo.host, dbAuth.geo.port);
var geo = new MongoInternals.RemoteCollectionDriver(mongoGeoUrl);

var mongoPoiUrl = mongoUrlGen(dbAuth.poi.db, dbAuth.poi.username, dbAuth.poi.password, dbAuth.poi.host, dbAuth.poi.port);
var poi = new MongoInternals.RemoteCollectionDriver(mongoPoiUrl);

Locality = new Mongo.Collection("Locality", { _driver: geo });
Country = new Mongo.Collection("Country", { _driver: geo })

Hotel = new Mongo.Collection("Hotel", { _driver: poi });
Restaurant = new Mongo.Collection("Restaurant", { _driver: poi });
Shopping = new Mongo.Collection("Shopping", { _driver: poi });
ViewSpot = new Mongo.Collection("ViewSpot", { _driver: poi });

CmsOplog = new Mongo.Collection('CmsOplog');
OplogPkList = new Mongo.Collection('OplogPkList');
