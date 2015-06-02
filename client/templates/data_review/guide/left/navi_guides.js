
Template.naviGuides.helpers({
  guides: function() {
    var naviLocalityId = Session.get('naviLocalityId');

    if (window.location.pathname.indexOf('guide') != -1){
      var guideList = GuideTemplate.find({'locId': new Mongo.ObjectID(naviLocalityId)}).fetch();
    }
    if (window.location.pathname.indexOf('plan') != -1){
      var guideList = Plan.find({'targets.id': new Mongo.ObjectID(naviLocalityId)}, {sort: {forkedCnt: -1}}).fetch();
    }
    
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

    if (window.location.pathname.indexOf('guide')){
      var guideTemplateId = this.id;
      Session.set('GuideTemplateId', guideTemplateId);
    }
    if (window.location.pathname.indexOf('plan')){
      var planId = this.id;
      Session.set('currentPlanId', planId);
    }
  },
})