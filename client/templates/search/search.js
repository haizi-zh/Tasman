colSelection = {};

Meteor.startup(function () {
  cols = ['ViewSpot', 'Locality', 'Restaurant', 'Shopping', 'Hotel'];
  cols.map(function(key){colSelection[key] = false});
  colSelection['Locality'] = true;
});


Template.searchTpl.helpers({
  collections: function(){
    _.keys(colSelection).map(function(key){colSelection[key] = false});
    colSelection[Session.get('curSearchCollection')] = true;
    return colSelection;
  }
});



Template.searchTpl.events({
  'change .sort-select': function(e) {
    var curCol = $(e.target).val();
    Session.set('curSearchCollection', curCol);
  }
});


// searchResult
Template.searchResult.helpers({
  collections: function(){
    Session.get('curSearchCollection')
    return colSelection;
  },
  urlGen: function(type, id){
    return '/' + type + '/' + id;
  }
});

Template.searchResult.events({
  // TODO 
});