Template.poiSearch.helpers({
  'targetName': function() {
    return Meteor.getColZhName();
  },
  'hasNoSearchText': function() {
  	return !Session.get('checkSearchField');
  }
});

Template.poiSearch.onRendered(function(){
	Session.set('checkSearchField', false);
});


Template.poiSearch.events({
	'click .active-search': function(event) {
		event.preventDefault();
		event.stopPropagation();
		var kw = $.trim($('input[name="poi-search"]').val());
		console.log(kw);
		if(kw){
			Meteor.cmsPlan.search.setKeyWord(kw);
		}
	},
	'keyup input[name="poi-search"]': function(event) {
		event.preventDefault();
		event.stopPropagation();
		var kw = $.trim($('input[name="poi-search"]').val());
		if(kw) {
			Session.set('checkSearchField', true);
		}else{
			Session.set('checkSearchField', false);
		}
	},
	'click .poi-search-clear': function(event) {
		event.preventDefault();
		$('input[name="poi-search"]').val('');
		Session.set('checkSearchField', false);
		Meteor.cmsPlan.search.clear();
	}
})