
Template.naviGuides.helpers({
  guides: function() {
    var naviLocalityId = Session.get('naviLocalityId');

    var guideList = GuideTemplate.find({'locId': new Mongo.ObjectID(naviLocalityId)}).fetch();
    var guides = [];
    guideList.map(function(x) {
      guides.push({
        'name': x.title,
        'id': x._id._str
      });
    });
    return guides;
  }
})

Template.naviGuides.events({
  'click .list-group-item': function(e){
    $('.navi-guides .list-group-item').removeClass('selected-bg');
    $(e.target).addClass('selected-bg');
    var guideTemplateId = this.id;
    Session.set('GuideTemplateId', guideTemplateId);
  },
})