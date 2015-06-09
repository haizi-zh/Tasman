Meteor.publish('Images', function(geoId) {
  check(geoId, String);
  // console.log(Images.find({'itemIds': new Mongo.ObjectID(geoId)}).fetch());
  return Images.find({'itemIds': new Mongo.ObjectID(geoId)});
});

Qiniu = new QiniuSDK(accessKey, secretKey, bucket, pictures_host);
Meteor.methods({
  /**
   * 根据网址用qiniu抓取图片
   * @param  {string} fetchUrl 要抓取的图片的url
   * @return {object}          图片的相关信息：w,h,key,url等
   */
  'fetchPic': function(fetchUrl){
    check(fetchUrl, String);
    var fetchInfo = Qiniu.getFetchInfo(fetchUrl);
    return fetchInfo;
  },

  /**
   * 获取表单上传图片要用的数据
   * @return {object} uptoken,key,url等
   */
  'getPicUpToken': function(){
    var options = {
      expires: 1800
    };
    return Qiniu.getUpInfo(options);
  },

  /**
   * 存储本地上传的图片
   * @param  {[type]} mid [description]
   * @param  {[type]} key [description]
   * @return {[type]}     [description]
   */
  'saveUpLocalImage': function(mid, key){
    check(mid, String);
    check(key, String);
    return saveIntoDB(mid, key);
  },

  /**
   * 存储网上爬取的图片
   * @param  {[type]} mid [description]
   * @param  {[type]} key [description]
   * @param  {[type]} url [description]
   * @return {[type]}     [description]
   */
  'saveFetchImage': function(mid, key, url){
    check(mid, String);
    check(key, String);
    check(url, String);
    return saveIntoDB(mid, key, url);
  }
})

/**
 * 将"上传文件"的信息存入数据库
 * @param  {String} mid 数据库中的ObjectId
 * @param  {String} key qiniu对应的key
 * @param  {String} url fetch的图片的url
 * @return {[type]}     [description]
 */
function saveIntoDB(mid, key, url){
  var fileInfo = Qiniu.getFileInfo(key);
  var imageBasicInfo = Qiniu.getImageBasicInfo(key);
  var imageData = {
    "_id" : new Mongo.ObjectID(),
    "key" : key,
    "url_hash": key, //for indexes
    "itemIds" : [new Mongo.ObjectID(mid)],
    "hash" : fileInfo.hash,
    "cTime" : parseInt(fileInfo.putTime / 10000),//100ns => ms
    "type" : fileInfo.mimeType,
    "size" : fileInfo.fsize,
    "cm" : imageBasicInfo.colorModel,
    "h" : imageBasicInfo.height,
    "fmt" : imageBasicInfo.format,
    "w" : imageBasicInfo.width
  };
  if (url) imageData['url'] = url;

  console.log(imageData);
  return Images.insert(imageData);
}