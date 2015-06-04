Meteor.publish('taskPool', function(query, options) {
	check(query, Object);
	check(options, Object);
	var self = this;
	return TaskPool.find(query, options);
    // self.added('TaskPool', doc._id, doc);
    // self.ready();
});

Meteor.publish('editorTask', function(eid) {
	check(eid, String);
	return TaskPool.find({'editorId': eid, 'status': 'assigned'});
});

Meteor.publish('recieveTask', function(taskId) {
	check(taskId, String);
	return TaskPool.find({'taskId': new Mongo.ObjectID(taskId), 'editorId': this.userId});
});

Meteor.publish('taskByTaskId', function(tid){
	check(tid, String);
	return TaskPool.find({'taskId': new Mongo.ObjectID(tid)});
});

Meteor.publish('taskMessage', function() {
	return TaskHistory.find({'detail.editor.id': this.userId}, {'sort': {'createTime': -1}});
});

Meteor.publish('taskAssginHistory', function() {
	return TaskHistory.find({});
});
