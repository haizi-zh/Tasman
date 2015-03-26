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
  'change :checkbox': function(e){
    var parentDom = $(e.target).parent(),
        dataDome = parentDom.children("a"),
        checkBox = parentDom.children("input"),
        id = dataDome.attr('data-id'),
        zhName = dataDome.html();
    e.preventDefault();
    e.stopPropagation();

    if(Session.get(id)){
      $('#' + id).remove();
      Session.set(id, false);
    } else {
      Blaze.renderWithData(
                            Template.compareItem,
                            {'id': id, 'zhName': zhName},
                            $('.add_to_compare')[0]
                          );
      Session.set(id, true);
    }
  }
});