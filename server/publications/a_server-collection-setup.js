// address, replicaSet, readPreference
var mongoGeoUrl = mongoUrlGen(dbAuth.k2.db, dbAuth.k2.username, dbAuth.k2.password, dbAuth.k2.address, dbAuth.k2.replicaSet, dbAuth.k2.readPreference);
var k2 = new MongoInternals.RemoteCollectionDriver(mongoGeoUrl);

var mongoGeoUrl = mongoUrlGen(dbAuth.geo.db, dbAuth.geo.username, dbAuth.geo.password, dbAuth.geo.address, dbAuth.geo.replicaSet, dbAuth.geo.readPreference);
var geo = new MongoInternals.RemoteCollectionDriver(mongoGeoUrl);

var mongoPoiUrl = mongoUrlGen(dbAuth.poi.db, dbAuth.poi.username, dbAuth.poi.password, dbAuth.poi.address, dbAuth.poi.replicaSet, dbAuth.poi.readPreference);
var poi = new MongoInternals.RemoteCollectionDriver(mongoPoiUrl);


//攻略路线
var mongoPlanUrl = mongoUrlGen(dbAuth.plan.db, dbAuth.plan.username, dbAuth.plan.password, dbAuth.plan.address, dbAuth.plan.replicaSet, dbAuth.plan.readPreference);
var plan = new MongoInternals.RemoteCollectionDriver(mongoPlanUrl);

//模板路线
var mongoGuideUrl = mongoUrlGen(dbAuth.guide.db, dbAuth.guide.username, dbAuth.guide.password, dbAuth.guide.address, dbAuth.guide.replicaSet, dbAuth.guide.readPreference);
var guide = new MongoInternals.RemoteCollectionDriver(mongoGuideUrl);

// CMS 用户及其它数据所在
var mongoCmsUrl = mongoUrlGen(dbAuth.cms.db, dbAuth.cms.username, dbAuth.cms.password, dbAuth.cms.address, dbAuth.cms.replicaSet, dbAuth.cms.readPreference);
var cms = new MongoInternals.RemoteCollectionDriver(mongoCmsUrl);

// 图片
var mongoImagestoreUrl = mongoUrlGen(dbAuth.imagestore.db, dbAuth.imagestore.username, dbAuth.imagestore.password, dbAuth.imagestore.address, dbAuth.imagestore.replicaSet, dbAuth.imagestore.readPreference);
var imagestore = new MongoInternals.RemoteCollectionDriver(mongoImagestoreUrl);

Images = new Mongo.Collection("Images", { _driver: imagestore});

//省市，国家结构存储表
LocalityRelations = new Mongo.Collection("LocalityRelations", { _driver: geo });

Locality = new Mongo.Collection("Locality", { _driver: k2 });
Country = new Mongo.Collection("Country", { _driver: k2 });

Hotel = new Mongo.Collection("Hotel", { _driver: poi });
Restaurant = new Mongo.Collection("Restaurant", { _driver: k2 });
Shopping = new Mongo.Collection("Shopping", { _driver: k2 });
ViewSpot = new Mongo.Collection("ViewSpot", { _driver: k2 });
// ViewSpot = new Mongo.Collection("ViewSpot", { _driver: poi });
// ViewSpot = new Mongo.Collection("ViewSpot1", { _driver: poi });

CmsOplog = new Mongo.Collection('CmsOplog');
OplogPkList = new Mongo.Collection('OplogPkList');

// 游记规划,已审核
GuideTemplate = new Mongo.Collection('GuideTemplate', {_driver: k2, idGeneration: 'MONGO'});

// 游记，待审核
Plan = new Mongo.Collection('Plan', {_driver: plan});

// 存放CMS新建的游记规划
CmsGenerated = new Mongo.Collection('CmsGenerated', {_driver: plan});

// 任务分配
TaskPool = new Mongo.Collection('TaskPool', {_driver: cms});

// 任务历史记录
TaskHistory = new Mongo.Collection('TaskHistory', {_driver: cms});

//消息机制
Notifications = new Mongo.Collection('Notifications', {_driver: cms});

// POI 合并存放的合并数据
PoiMergeInfo = new Mongo.Collection('PoiMergeInfo');

ownsDocument = function(userId, doc) {
  console.log(doc);
  return doc && doc.userId === userId;
};

Notifications.allow({
  update: function(userId, doc, fieldNames, modifier) {
    return ownsDocument(userId, doc) && fieldNames.length === 1 && fieldNames[0] === 'read';
  },
  insert: function(userId, doc){
    check(userId, String);
    check(doc, String);
    return true;
  }
});
