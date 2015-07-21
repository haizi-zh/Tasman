Meteor.methods({
  'search': function(collection, keyword){
    check(collection, String);
    check(keyword, String);
    var regexContent = '^' + keyword,
        re = new RegExp(regexContent),
        curDB = getMongoCol(collection);

    return ('Hotel' === collection)
      //hotel数据没有alias字段
      ? curDB.find({'zhName': {'$regex': re}}, {fields: {zhName: 1, desc: 1}, sort: {hotness: -1}}).fetch()
      : curDB.find({'alias': {'$regex': re}}, {fields: {zhName: 1, desc: 1}, sort: {hotness: -1}}).fetch();
  },
  // 根据洲的名字，查找国家
  'getCountriesByContinent': function(continents) {
    check(continents, Array);
    continents.map(function(ct) {
      var name = ct['continentName'];
      ct['countries'] = Country.find({'zhCont': name},  {'fields': {'zhName': 1, '_id': 1}}).fetch();
    })
    return continents;
  },

  //获取区域导航信息
  'getCitiesByLocalityId': function(mid, abroad) {
    check(mid, String);
    check(abroad, Boolean);
    var selector, index;
    if(abroad) {
      selector = {'locList._id': new Mongo.ObjectID(mid), 'locList': {'$size': 2}};
      index = 1;
    } else {
      selector = {'locList._id': new Mongo.ObjectID(mid), 'locList': {'$size': 3}};
      index = 2;
    }
    var options = {'sort': {'hotness': 1}, 'fields': {'locList': true} }
    // var s = ViewSpot.distinct('locList.2', {'locList._id': new Mongo.ObjectID(mid), 'locList': {'$size': 3}});
    var data = ViewSpot.find(selector, options).fetch();
    var names = data.map(
      function(x) {
        return x.locList[index].zhName;
      }
    );
    var ids = data.map(
      function(x) {
        return x.locList[index]._id._str;
      }
    );

    names = _.uniq(names);
    ids = _.uniq(ids);
    var temp = [];
    for (var i = 0, len = ids.length; i < len; i++) {
      temp.push({'zhName': names[i], '_id': ids[i]});
    }
    return temp;
  },
  'OplogPkList.update': function(ts, ns, userId, pk, zhName){
    check(ts, Number);
    check(ns, String);
    check(userId, String);
    check(pk, Meteor.Collection.ObjectID);
    check(zhName, String);
    var query = {'ns': ns, 'pk': pk._str};
    if(OplogPkList.findOne(query)){
      OplogPkList.update(query, {'$set': {'lastModified': ts, status: 'review'}, '$addToSet': {'editorId': userId}, '$inc': {'opCount': 1}}, {'upsert': true});
    }else{
      OplogPkList.update(query, {'$set': {'ts': ts, 'zhName': zhName, status: 'review'}, '$addToSet': {'editorId': userId}, '$inc': {'opCount': 1}}, {'upsert': true});
    }
  },
  // update online data, optional: desc
  'updateOnlineData': function(pk, desc) {
    check(pk, String);
    var entry = OplogPkList.findOne({'pk': pk});
    if(!entry) return;
    var ns = entry.ns,
        commitInfo = desc || (moment().unix() * 1000).toString(),
        col = ns.split('.')[1],
        branchCount = entry.branch && entry.branch.length || 0,
        snapshotId = branchCount + 1,
        updateContent = Meteor.call('stagedContent', ns, new Mongo.ObjectID(pk));
    updateContent['taoziEna'] = true;
    // omit _id for secure
    var resFromOnline = getMongoCol(col).update({'_id': new Mongo.ObjectID(pk)}, {'$set': _.omit(updateContent, '_id')});
    // update CmsOplog
    var resFromCmsOplog = CmsOplog.update(
                              {'pk': new Mongo.ObjectID(pk), 'status': 'staged'},
                              {'$set': {'status': 'merged', 'snapshotId': snapshotId}},
                              {'multi': true});
    // update OplogList
    var resFromOplogPkList = OplogPkList.update(
                                {'pk': pk},
                                {'$addToSet': {'branch': {'snapshotId': snapshotId, 'desc': commitInfo}},
                                '$set': {opCount: 0, status: 'uploaded'}});
    if(resFromOnline >= 1 && resFromCmsOplog >= 1 && resFromOplogPkList >= 1) {
      return {'code': 0};
    }else{
      return {'code': 1};
    }
  },
  // get staged content from CmsOplog collection
  'stagedContent': function(ns, pk){
    check(ns, String);
    check(pk, Meteor.Collection.ObjectID);
    return storageEngine.snapshot(ns, pk);
  },
  'snapshotInfo': function(ns, pk, snapshotId){
    check(ns, String);
    check(pk, Meteor.Collection.ObjectID);
    check(snapshotId, Number);
    return storageEngine.snapshot(ns, pk, {}, snapshotId);
  },
  'scrollBack': function(item, snapshotId){
    check(item, Object);
    check(snapshotId, Number);
    var col = item.ns.split('.')[1];
    var updateContent = Meteor.call('snapshotInfo', item.ns, new Mongo.ObjectID(item.pk), snapshotId);
    var resFromOnline = getMongoCol(col).update({'_id': new Mongo.ObjectID(item.pk)}, {'$set': _.omit(updateContent, '_id')});
    var list = OplogPkList.findOne({'pk': item.pk});
    if(list.branch && list.branch.length === 1) {
      snapshotId = 0;
    }
    var opCntAdded = CmsOplog.update(
                    {'pk': new Mongo.ObjectID(item.pk), 'status': 'merged', 'snapshotId': {'$gt': snapshotId}},
                    {'$set': {'status': 'staged'}, '$unset': {'snapshotId': ''}},
                    {'multi': true});
    OplogPkList.update(
                    {'pk': item.pk},
                    {'$set': {'status': 'review'},'$inc': {'opCount': opCntAdded}, '$pull': {'branch': {'snapshotId': {'$gt': snapshotId}}}});
    if(resFromOnline === 1){
      return {'code': 0};
    } else {
      return {'code': 1};
    }
  },
  'deleteUser': function(userId){
    check(userId, String);
    var cnt = Meteor.users.remove({_id: userId});
    if(cnt === 1){
      return {'code': 0};
    } else {
      return {'code': 1};
    }
  },
  'rejectEditInfo': function(pk){
    check(pk, String);
    var resFromCmsOplog = CmsOplog.update(
        {'pk': new Mongo.ObjectID(pk), 'status': 'staged'},
        {'$set': {'status': 'rejected'}},
        {'multi': true});
    if(resFromCmsOplog >= 1) {
      OplogPkList.update({'pk': pk}, {'$inc': {opCount: - resFromCmsOplog}})
      return {'code': 0};
    }else{
      return {'code': 1};
    }
  },
  'ready-online': function(pk){
    check(pk, String);
    OplogPkList.update({'pk': pk}, {'$set': {'status': 'checked'}});
  },
  'unready-online': function(pk){
    check(pk, String);
    OplogPkList.update({'pk': pk}, {'$set': {'status': 'review'}});
  },
  'checkedItemCnt': function(){
    return OplogPkList.find({'status': 'checked'}).fetch().length;
  },
  // 批量上线
  'bulk-upload': function(){
    var count = 0;
    OplogPkList.find({'status': 'checked'}, {'pk': 1}).forEach(function(entry){
      if(Meteor.call('updateOnlineData', entry.pk)['code'] == 0){
        count = count + 1;
      }
    });
    return {count: count};
  },
  'cityName-to-cityId': function(cityName) {
    check(cityName, String);
    return Locality.findOne({'alias': cityName}, {fields: {'_id': 1}});
  },
  'getPlanById': function(id) {
    check(id, String);
    var res = Plan.findOne({'_id': new Mongo.ObjectID(id)});
    return {'code': 0, 'data': res};
  },
  'saveNewPlan': function(planInfo) {
    check(planInfo, Object);
    var cnt = CmsGenerated.update({'_id': new Mongo.ObjectID(planInfo._id)},{'$set': _.omit(planInfo, '_id')}, {upsert: true});
    if(cnt === 1) {
      return {code: 0};
    }
    return {code: -1};
  },
  'createNewPlan': function(timeObj) {
    check(timeObj, Object);
    var newId = new Mongo.ObjectID(),
        cnt = CmsGenerated.update({'_id': newId}, {'$set': timeObj}, {upsert: true});
    if(cnt === 1) {
      return {code: 0, _id: newId};
    }
    return {code: -1, msg: '初始化失败'};
  },
  'saveEditedPlan': function(planInfo) {
    check(planInfo, Object);
    var title = planInfo.title,
        locName = planInfo.locName,
        detail = planInfo.detail,
        tempDetail = [];

    for(var i = 0, len = detail.length; i < len; i += 1) {
      var tempOneDay = detail[i].pois,
          lenOneDay = tempOneDay.length,
          oneDayRes = [];
      for(var j = 0; j < lenOneDay; j += 1) {
        var tempPoi = tempOneDay[j],
            poiDetail = getMongoCol(tempPoi.type).findOne({'_id': new Mongo.ObjectID(tempPoi.id)}),
            poi = {
              'lat': poiDetail.location.coordinates[0],
              'lng': poiDetail.location.coordinates[1],
              'type': tempPoi.type,
              'picKey': tempPoi.picKey,
              'item': {
                    '_id': poiDetail._id,
                    'id': poiDetail._id,
                    'zhName': poiDetail.zhName
                  },
              'locality': poiDetail.locality,
              'country': poiDetail.country
            };
        oneDayRes.push(poi);
      }
      tempDetail.push({'actv': oneDayRes});
    }

    var updateInfo = {
      'title': title,
      'details': tempDetail,
      'days': tempDetail.length,
      'locName': locName
    }
    var cnt = Plan.update({'_id': new Mongo.ObjectID(planInfo._id)}, {'$set': updateInfo});
    if(cnt === 1){
      return {'code': 0};
    }
    return {'code': -1};
  },
  'commonDBQuery': function(colName, query, options) {
    check(colName, String);
    check(query, Object);
    check(options, Object);
    var count = 0,
        dbCol = getMongoCol(colName);
    if (dbCol) {
      dbCol.find({'targets': new Mongo.ObjectID(query.localityId), 'cmsStatus': undefined}, options).forEach(function(doc) {
        doc.itemId = doc._id;
        doc.localityId = query.localityId;
        doc.localityName = query.localityName;
        _.omit(doc, '_id');
        dbCol.update({'_id': doc.itemId}, {'$set': {'cmsStatus': true}});
        count += TaskPool.update({'_id': doc.itemId}, {'$set': _.extend(doc, {'status': 'unassgined', 'type': colName})}, {'upsert': true});
      });
      return {'code': 0, 'taskCount': count};
    }
    return {'code': -1};
  },
  'readyToAssign': function(pk) {
    check(pk, String);
    TaskPool.update({'_id': new Mongo.ObjectID(pk)}, {'$set': {'status': 'ready'}});
  },
  'unreadyToAssign': function(pk) {
    check(pk, String);
    TaskPool.update({'_id': new Mongo.ObjectID(pk)}, {'$set': {'status': 'unassgined'}});
  },
  'taskAssign': function(editorInfo) {
    check(editorInfo, Object);
    TaskPool.update({'status': 'ready'}, {'$set': {'editorId': editorInfo.editorId, 'editorName': editorInfo.editorName,'status': 'assigned'}}, {'multi': true});
    var cnt = TaskPool.find({'editorId': editorInfo.editorId, 'status': 'assigned'}).count();
    return {'code': 0, 'count': cnt};
  },
  'taskCheckAll': function(checkStatus) {
    check(checkStatus, Boolean);
    var cnt;
    if (checkStatus) {
      cnt = TaskPool.update({'status': 'unassgined'}, {'$set': {'status': 'ready'}}, {'multi': true});
    } else {
      cnt = TaskPool.update({'status': 'ready'}, {'$set': {'status': 'unassgined'}}, {'multi': true});
    }
    return {'code': 0, 'count': cnt};
  },
  'editorTaskCount': function(eid) {
    check(eid, String);
    var cnt = TaskPool.find({'editorId': eid, 'status': 'assigned'}).count();
    return {'code': 0, 'count': cnt};
  },
  'pullTaskBackToPool': function(pk) {
    check(pk, String);
    TaskPool.update({'_id': new Mongo.ObjectID(pk)}, {'$set': {'status': 'ready'},'$unset': {'editorId': '', 'editorName': ''}});
  },
  'taskConfirm': function() {
    var assignDetail = [],
        editor = {};
    TaskPool.find({'status': 'assigned'}).forEach(function(doc) {
      if(!editor[doc.editorId]) {
        editor[doc.editorId] = {'type': doc.type, 'name': doc.editorName, 'localityName': doc.localityName};
      }
    });
    _.keys(editor).map(function(eid) {
      var cnt = TaskPool.find({'editorId': eid, 'status': 'assigned'}).count();
      var temp = {
        'editor': {'name': editor[eid].name, 'id': eid},
        'type': editor[eid].type,
        'typeZhname': Meteor.getColZhName(editor[eid].type),
        'taskCount': cnt,
        'localityName': editor[eid].localityName
      };
      assignDetail.push(temp);
    });
    return {'code': 0, 'data': assignDetail};
  },
  'taskPublish': function(detail, desc) {
    check(detail, Array);
    check(desc, String);

    // create one doc in TaskHistory
    var time = Date.now(),
        id = new Mongo.ObjectID(),
        editor = [];
    TaskHistory.update({'_id': id}, {'$set': { 'desc': desc, 'detail': detail, 'createTime': time}}, {'upsert': true});
    // set assigned task with id
    var count = TaskPool.update({'status': 'assigned'}, {'$set': {'taskId': new Mongo.ObjectID(id._str), 'status': 'doing'}}, {'multi': true});
    // send message
    detail.map(function(ele) {
      var editorId = ele.editor.id,
          taskId = id._str;
      Notifications.update({'_id': new Mongo.ObjectID()}, {'$set': {
          'userId': editorId,
          'read': false,
          'type': 'taskAssign',
          'detail': {
            'taskId': taskId,
            'dataType': ele.type,
            'taskCount': ele.taskCount,
            'localityName': ele.localityName
          },
          'desc':ele.taskCount + '个位于' + ele.localityName + '的'+ Meteor.getColZhName(ele.type),
          'url': '/review-task/' + ele.type + "/" + taskId
        }
      },
      {'upsert': true})
    });
    return {'code': 0}
  },
  'TaskPool.update.status': function(pk) {
    check(pk, Mongo.Collection.ObjectID);
    TaskPool.update({'itemId': new Mongo.ObjectID(pk._str)}, {'$set': {'editStatus': true}});
  },
  'removeUnpublishedTask': function() {
    TaskPool.find({'taskId': undefined}).forEach(function(doc) {
      getMongoCol(doc.type).update({'_id': new Mongo.ObjectID(doc.itemId._str)}, {'$unset': {'cmsStatus': ''}})
    });
    TaskPool.remove({'taskId': undefined});
  },

  // 景点去重，获取区域列表
  'dedupOnlineInfo': function () {
    var host = process.env.LXP_API_HOST,
        domesticOnlineCityUrl = host + '/app/geo/localities/domestic',
        abroadOnlineCityUrl = host + '/app/geo/localities/abroad',
        domesticOnlineCity = HTTP.get(domesticOnlineCityUrl).data,
        abroadOnlineCity = HTTP.get(abroadOnlineCityUrl).data;
    if (domesticOnlineCity.code === 0 && abroadOnlineCity.code === 0) {
      return {
        'code': 0,
        'data': {
          'domestic': domesticOnlineCity.result,
          'abroad': abroadOnlineCity.result
        }
      };
    }
    return {'code': -1, 'data': '去重页面的城市级联数据请求失败'};
  },

  /**
   * poi合并的前端信息提交及后端入库操作
   */
  'submitPoiMergeInfo': function (infos) {
    check(infos, {
      _id: Match.Optional(String),
      desc: String,
      poiType: String,
      mergedPois: [{
        id: Meteor.Collection.ObjectID,
        zhName: String
      }],
      mainPoi: {
        id: Meteor.Collection.ObjectID,
        zhName: String
      },
      mergedFields: Object,
      compareItems: Array,
      fieldrefer: Object
    });
    var editor = Meteor.userId();
    var ts = Date.now();
    var mainPoiInfo = getMongoCol(infos.poiType).findOne({'_id': infos.mainPoi.id});
    var keys = Object.keys(infos.mergedFields);
    var originData = {};
    keys.forEach(function(key) {
      originData[key] = mainPoiInfo[key];
    });
    // var reviewItems = getReviewItems(infos.poiType);
    // var comparations = [];
    // reviewItems.forEach(function (ele) {
    //   if (keys.indexOf(ele.value) !== -1) {
    //     comparations.push({
    //       'origin': originData[ele.value],
    //       'new': infos.mergedFields[ele.value],
    //       'tagName': ele.zhName
    //     });
    //   }
    // });
    infos = _.extend(infos, {
      'editor': editor,
      'ts': ts,
      // 'comparations': comparations,
      'onlineStatus': false,
      'originData': originData
    });
    var mid = '';
    if (infos._id) {
      var cnt = PoiMergeInfo.update(infos._id, {'$set': infos});
      if (cnt === 1) {
        return {'code': 0};
      }
    } else {
      mid = PoiMergeInfo.insert(_.omit(infos, '_id'));
      if (mid) {
        return {'code': 0, 'mid': mid};
      }
    }
    return {'code': -1};
  },

  /**
   * 将合并的数据上线
   */
  'pushMergedInfoOnline': function(id) {
    check(id, String);
    var poiMergeInfo = PoiMergeInfo.findOne(id);
    if (!poiMergeInfo) {
      return {code: -1};
    }
    var dbName = poiMergeInfo.poiType;
    var db = getMongoCol(dbName);
    var updateFields = poiMergeInfo.mergedFields;
    var uselessPk = [];
    poiMergeInfo.mergedPois.map(function (ele) {
      uselessPk.push(ele.id);
    });
    var pk = poiMergeInfo.mainPoi.id;
    updateFields = _.extend(updateFields, {'isKey': true, 'exIds': uselessPk, 'update': true});
    var cnt = db.update({'_id': pk}, {'$set': updateFields});
    var uselessCnt = 0;
    uselessPk.map(function(id) {
      db.update({'_id': id}, {'$set': {'iskey': false}});
      uselessCnt = uselessCnt + 1;
    });
    if(cnt == 1 && uselessCnt == uselessPk.length) {
      PoiMergeInfo.update({'_id': id}, {'$set': {'onlineStatus': true}});
      return {code: 0};
    }else {
      return {code: -1};
    }

  },
  /**
   * 复审数据
   */
  'push-merge-info-online': function (info) {
    check(info, {
      mid: String,
      diffTag: Boolean,
      newFieldrefer: Match.Optional(Object)
    });
    var doc = PoiMergeInfo.findOne({'_id': info.mid});
    if (!doc) return {'code': -1};
    // 有改动
    if (info.diffTag) {
      var updateFields = {},
          items_arr = [],
          keys = _.keys(info.newFieldrefer);
      // 获取items_arr
      var type = doc.compareItems[0],
          poiKeys = doc.compareItems.splice(1),
          db = getMongoCol(type),
          key_val = info.newFieldrefer;
      items_arr = poiKeys.map(function(id) {
        return db.findOne({'_id': new Mongo.ObjectID(id)});
      });
      // 获取updateFields
      for(var i = 0, len = keys.length; i < len; i++) {
        updateFields[keys[i]] = items_arr[key_val[keys[i]]][keys[i]];
      }
      var updateInfo = {
        fieldrefer: info.newFieldrefer,
        mergedFields: updateFields
      };
      PoiMergeInfo.update({'_id': info.mid}, {'$set': updateInfo});
    }
    // 无改动，直接上线
    var res = Meteor.call('pushMergedInfoOnline', info.mid);
    return res;
  },
  /*
   * 上传游记
   */
  'push-plan-online': function (pid) {
    check(pid, String);
    console.log(pid);
    var plan = CmsGenerated.findOne({'_id': new Mongo.ObjectID(pid)});
    var title = plan.locName;
    var locality = Locality.findOne({'zhName': title});
    var locId;
    if (locality) {
      locId = locality._id;
    } else {
      return {'code': -1, 'msg': '找不到地点信息'};
    };
    var itinerary = [];
    var tempImages = [];
    var images = [];
    // 提取行程信息
    plan.detail.forEach(function(oneDay) {
      var dayIndex = oneDay.dayIndex - 1;
      oneDay.pois.forEach(function(poi) {
        tempImages.push({'key': poi.picKey});
        itinerary.push({
          'dayIndex': dayIndex,
          'poi': {
            'className' : 'models.poi.' + poi.type,
            '_id': new Mongo.ObjectID(poi.id),
            'type': poi.type === 'ViewSpot' ? 'vs' : poi.type.toLowerCase(),
            'zhName': poi.name
          }
        });
      });
    });

    tempImages.forEach(function(image) {
      var img = Images.findOne({'key': image.key});
      if (img) {
        if (img.cropHint) {
          images.push({'key': image.key, 'h': img.h, 'w': img.w, 'cropHint': img.cropHint});
        } else {
          images.push({'key': image.key, 'h': img.h, 'w': img.w});
        }
      }
    });
    var planInfo = {};
    planInfo.title = title;
    planInfo.locId = locId;
    planInfo.itinerary = itinerary;
    planInfo.className = 'models.guide.GuideTemplate';
    planInfo.enabled = true;
    planInfo.images = images;
    // 更新或者插入游记模板
    var cntUpdate = GuideTemplate.update({'title': title}, {'$set': planInfo}, {'upsert': true});
    // 更新当前选中的游记，标记为线上版本
    cntUpdate += CmsGenerated.update({'_id': new Mongo.ObjectID(pid)}, {'$set': {'online': true}});
    // 将之前的线上版本撤下
    CmsGenerated.find({'locName': title}).forEach(function(plan) {
      var planId = plan._id;
      if (planId._str !== pid && plan.online) {
        CmsGenerated.update({'_id': planId}, {'$set': {'online': false}});
      }
    });
    return {'code': cntUpdate === 2 ? 0 : -1, 'msg': cntUpdate === 2 ? '上线成功' : '上线失败'};
  },
  /*
   * 删除游记
   */
  'del-plan': function (pid) {
    check(pid, String);
    var cnt = CmsGenerated.remove({'_id': new Mongo.ObjectID(pid)});
    return {'code': cnt - 1, 'msg': cnt === 1 ? '删除成功': '删除失败'};
  },
  /*
   * 获取路线中包含的城市信息，作为筛选条件
   */
  'citiesHasPlan': function() {
    var loc = {};
    CmsGenerated.find({'locName': {'$exists': true}}).forEach(function(plan) {
      if (loc[plan.locName] === true) {return;}
      if (!loc.hasOwnProperty(plan.locName)) {
        loc[plan.locName] = plan.online ? true : false;
      }
    });
    var locArr = [{'name': 'all'}];
    for(var l in loc) {
      if (loc.hasOwnProperty(l)) {
        locArr.push({'name': l, 'online': loc[l]});
      }
    }
    return locArr;
  }

});
