if (Meteor.isClient) {
  Meteor.startup(function () {
    Session.set('submitted', true);
    Session.set('curSearchCollection', 'Locality');
    
  });
}