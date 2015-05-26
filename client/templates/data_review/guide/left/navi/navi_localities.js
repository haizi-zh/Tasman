
Template.naviLocalities.helpers({
  localities: function() {
    var naviLocalityParent = Session.get('naviLocalityParent');//省份或者城市

    if ( !naviLocalityParent.isAbroad ){
      var localities = LocalityRelations.find({'province.zhName': naviLocalityParent.parentName}).fetch();
      var localityName = [];
      localities.map(function(x) {
        localityName.push({
          'name': x.locality.zhName,
          //为什么这里是  ._Id  ???
          'id': x.locality._Id._str
        })
      });
    } else {
      var localities = LocalityRelations.find({'country.zhName': naviLocalityParent.parentName}).fetch();
      var localityName = [];
      localities.map(function(x) {
        localityName.push({
          'name': x.locality.zhName,
          'id': x.locality._id._str
        })
      });
    }
    return localityName;
  }
})

Template.naviLocalities.events({
  'click .list-group-item': function(e){
    $('.navi-localities .list-group-item').removeClass('selected-bg');
    $(e.target).addClass('selected-bg');
    var localityId = this.id;
    Meteor.subscribe('guideTemps', localityId);
    Session.set('naviLocalityId', localityId);
  },
})