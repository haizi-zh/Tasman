TaskPool = new Mongo.Collection('TaskPool');

taskAssign = (function() {
    var TA = {},
        _dataType = new ReactiveVar({}),
        _curDataType = new ReactiveVar({}, function(o, n) {return o === n;}),
        _taskCount = new ReactiveVar(0, function(o, n) {return o === n;}),
        _foundedTaskCount = new ReactiveVar(0, function(o, n) {return o === n;}),
        _locality = new ReactiveVar({}, function(o, n) {return o === n;}),
        _tasks = new ReactiveVar([], function(o, n) {return o === n;}),
        _checkAll = new ReactiveVar(false, function(o, n) {return o === n;}),
        _filtrEditorId = new ReactiveVar('', function(o, n) {return o === n;}),
        _publishData = [];

    TA.init = function() {
        _curDataType.set({'type': 'ViewSpot', 'name': '景点'});
        _dataType.set({
            'ViewSpot':     {'name': '景点', 'select': true},
            'Locality':     {'name': '城市', 'select': false},
            'Hotel':        {'name': '酒店', 'select': false},
            'Restaurant':   {'name': '美食', 'select': false},
            'Shopping':     {'name': '购物', 'select': false}
        });
        _taskCount.set(0);
        // TODO

        var getTaskAutoRun = Tracker.autorun(function() {
            TA.getTaskFromDB();
        });

        // var groupCheckAutoRun = Tracker.autorun(function() {
        //     TA.getTaskFromDB();
        // });
    };

    TA.getDataType = function() {
        console.log(_dataType.get());
        return _dataType.get();
    };

    TA.getCurDataType = function() {
        return _curDataType.get();
    };

    TA.setCurDataType = function(type) {
        var temp = _dataType.get();
        for (var key in temp) {
            if (temp.hasOwnProperty(key)) {
                temp[key].select = false;
            }
        }
        temp[type].select = true;
        _curDataType.set({'type': type, 'name': temp[type].name});
        _dataType.set(temp);
    };

    TA.setTaskCount = function(count) {
        _taskCount.set(count);
    };

    TA.getTaskCount = function() {
        return _taskCount.get();
    };

    TA.setTasks = function(tasks) {
        _tasks.set(tasks);
    };

    TA.getTasks = function() {
        return _tasks.get();
    };

    TA.setLocality = function(locality) {
        _locality.set(locality);
    };

    TA.getLocality = function() {
        return _locality.get();
    };

    TA.getFoundedTaskCount = function() {
        return _foundedTaskCount.get();
    };

    TA.setFoundedTaskCount = function(count) {
        _foundedTaskCount.set(count);
    };

    TA.getTaskFromDB = function() {
        var taskCount = _taskCount.get();
        if (taskCount === 0) {
            return;
        }
        var localityId = _locality.get().localityId,
            dataType = _curDataType.get().type,
            query = {'localityId': localityId, 'localityName': _locality.get().zhName}, //TODO 'cmsStatus': undefined放置在Meteor Method中
            options = {
                'limit': taskCount,
                'fields': {'_id': 1, 'zhName': 1, 'hotnessTag': 1, 'targets': 1},
                'sort': {'hotnessTag': 1}   // 升序，越冷门
            };
        Meteor.call('commonDBQuery', dataType, query, options, function(err, res) {
            if(!err && res.code === 0) {
                console.log('本次提取到的任务个数:' + res.taskCount);
                _foundedTaskCount.set(res.taskCount);
                TA.subscribeTask();
                _taskCount.set(0);
            } else {
                console.log({'msg': '在提取任务时出错', 'more': {'type': dataType, 'query': query, 'options': options}});
            }
        });
    };

    TA.subscribeTask = function(query, options) {
        query = query || {};
        options = options || {};
        Meteor.subscribe('taskPool', query, options);
    };

    TA.getTaskFromTaskPool = function(query, options) {
        query = query || {};
        options = options || {};
        query = _.extend(query, {'status': {'$in': ['ready', 'unassgined']}});
        return TaskPool.find(query, options);
    };

    TA.taskReady = function(pk) {
        Meteor.call('readyToAssign', pk);
    };

    TA.taskUnready = function(pk) {
        Meteor.call('unreadyToAssign', pk);
    };

    TA.getReadyTask = function() {
        return TaskPool.find({'status': 'ready'}).count();
    };

    TA.taskAssign = function(editorId, editorName) {
        var user = Meteor.user(),
            editorInfo = {
            'editorId': editorId,
            'editorName': editorName,
        };
        Meteor.call('taskAssign', editorInfo, function(err, res) {
            if (!err && res.code === 0) {
                var dom = $('#' + editorInfo.editorId + '-task');
                dom.text(res.count);
            }
        });
    };

    TA.groupCheck = function() {
        var flag = _checkAll.get();
        Meteor.call('taskCheckAll', !flag, function(err, res) {
            if(!err && res.code === 0) {
                _checkAll.set(!flag);
            }
        });
    };

    TA.getGroupCheckStatus = function() {
        return _checkAll.get();
    };

    TA.setEditorFilter = function(eid) {
        _filtrEditorId.set(eid);
        Meteor.subscribe('editorTask', eid);
        Meteor.call('editorTaskCount', eid, function(err, res) {
            if (!err && res.code === 0) {
                var dom = $('#' + eid + '-task');
                dom.text(res.count);
            }
        });
    };

    TA.getEditorTask = function() {
        var eid = _filtrEditorId.get();
        return TaskPool.find({'editorId': eid, 'status': 'assigned'});
    };

    TA.pullTaskBackToPool = function(pk) {
        Meteor.call('pullTaskBackToPool', pk, function(err, res) {
            if(err) return;
            var eid = _filtrEditorId.get(),
                dom = $('#' + eid + '-task'),
                tempCnt = Number(dom.text());
            tempCnt > 0 ? dom.text(tempCnt - 1) : '';
        });
    };

    TA.taskConfirm = function(callback) {
        check(callback, Function);
        Meteor.call('taskConfirm', function(err, res) {
            if (!err && res.code === 0) {
                _publishData = res.data;
                callback && callback(res.data);
            }
        });
    };

    TA.taskPublish = function() {
        var desc = $('#ta-tacd-assign-desc').val();
        if(! $.trim(desc)) {
            alert('请对这次任务进行描述，便于管理员今后查看!');
            return;
        }
        Meteor.call('taskPublish', _publishData, desc, function(err, res) {
            if (!err && res.code === 0) {
                alert('发布成功');
            }
        });
    };

    TA.removeUnpublishedTask = function() {
        Meteor.call('removeUnpublishedTask');
    }


    return TA;


}());

taskAssign.init();


