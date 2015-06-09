Meteor.publish('current-yun-ying-slide', function() {
	return Column.find({'onlineStatus': true});
});