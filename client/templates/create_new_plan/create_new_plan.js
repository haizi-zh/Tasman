Template.createNewPlan.onRendered(function() {
  function initSession() {
    Session.set('poi-navi-active', 'ViewSpot');
    Session.set('poi-create-day-index', 0);
    Session.set('planDetail', []);
    Session.set('planActiveDay', 1);
  }
  initSession();
});

Template.registerHelper('poiType', function() {
  return Session.get('poi-navi-active');
});

Template.createNewPlan.helpers({
  'poiItems': function() {
    var type = Session.get('poi-navi-active'),
        locId = Session.get('curCityId');
    Meteor.subscribe('poi-item', type, locId);
    return getMongoCol(type).find({'targets': new Mongo.ObjectID(locId)}, {'limit': 5, 'sort': {'hotness': -1}});
  },
  'planDetail': function(){
    return Session.get('planDetail');
  },
  'poiDisplay': function(){
    var tempSession = Session.get('planDetail'),
        curDay = Session.get('planActiveDay');
    console.log(tempSession[curDay - 1].pois);
    return tempSession[curDay - 1].pois;
  }
});

Template.createNewPlan.events({
  'click .btn-add-one-day': function(event){
    event.preventDefault();
    var temp = Session.get('planDetail') || [];
    temp.push({'dayIndex': temp.length + 1, 'pois': []});
    Session.set('planDetail', temp);
  },
  'mouseleave .day-navi-element-container': function(event) {
    event.preventDefault();
    $(event.target).find('.delete-one-day').addClass("hidden");
  },
  'mouseenter .day-navi-element-container, mouseenter .day-index': function(event) {
    event.preventDefault();
    $(event.target).find('.delete-one-day').removeClass('hidden');
  },
  'click .day-navi-element-container': function(event) {
    event.stopPropagation();
    $(event.target).addClass("day-ative").siblings().removeClass("day-ative");
    Session.set('planActiveDay', parseInt($(event.target).attr('day-index')));
  },
  'click .delete-one-day': function(event) {
    event.stopPropagation();
    var dayIndex = $(event.target).parent().attr('day-index');
    var left = event.clientX - 50 + "px",
        top = event.clientY - 83 + "px";
    Blaze.renderWithData(Template.deleteDayPopup, {'dayIndex': dayIndex, 'left': left, 'top': top}, $(document.body)[0]);
  },
  'click .add-poi-to-plan': function(event) {
    event.preventDefault();
    var tempSession = Session.get('planDetail'),
        curDay = Session.get('planActiveDay'),
        poiName = $(event.target).attr('poi-name'),
        poiId = $(event.target).attr('poi-id'),
        poiType = $(event.target).attr('poi-type'),
        length = tempSession[curDay - 1].pois.length;
    tempSession[curDay - 1].pois.push({'id': poiId, 'name': poiName, 'type': poiType, 'dayIndex': curDay, 'index': length});
    Session.set('planDetail', tempSession);
  },
  'mouseenter .select-poi-name': function(event) {
    event.preventDefault();
    event.stopPropagation();
    $(event.target).find('.delete-one-poi').removeClass("hidden");
  },
  'mouseleave .select-poi-name': function(event) {
    event.preventDefault();
    event.stopPropagation();
    $(event.target).find('.delete-one-poi').addClass("hidden");
  },
  'click .delete-one-poi': function() {
    event.preventDefault();
    event.stopPropagation();
    log('123');
    var poiId = $(event.target).attr('data-id'),
        poiType = $(event.target).attr('data-id'),
        dayIndex = $(event.target).attr('day-index'),
        index = $(event.target).attr('data-index');
    var tempSession = Session.get('planDetail');
    tempSession[dayIndex - 1].pois.splice(index, 1);
    // 更新index
    for(var i = 0, len = tempSession[dayIndex - 1].pois.length; i < len; i++) {
      tempSession[dayIndex - 1].pois[i].index = i;
    }
    Session.set('planDetail', tempSession);
  }
});
