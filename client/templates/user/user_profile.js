TaskHistory = new Mongo.Collection('TaskHistory');

Template.userProfile.helpers({
	'taskMessage': function() {
		var message = [];
		TaskHistory.find({}).forEach(function(doc) {
			var temp = {},
				detail = doc.detail;
			for(var i = 0, len = detail.length; i < len; i += 1) {
				console.log(Meteor.userId());
				if(detail[i].editor.id === Meteor.userId()) {
					temp.type = detail[i].type;
					temp.taskCount = detail[i].taskCount;
					temp.localityName = detail[i].localityName;
					temp.url = '/review-task/' + temp.type + "/" + doc._id._str;
					temp.desc = temp.taskCount + '个' + '位于' + temp.localityName + '的'+ Meteor.getColZhName(temp.type);
					message.push(temp);
					break;
				}
			}
		});
		return message;
	}
});

