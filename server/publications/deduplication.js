Meteor.publish('dedupViewspot', function (query) {
  check(query, Object);
  var id = query.id,
      options = query.options || {};
  if (!id) return this.ready();
  options = _.extend(options, {'fields': {'zhName': 1, 'address': 1, 'desc': 1, 'hotnessTag': 1, 'isKey': 1, 'update': 1, 'exIds': 1}});
  return ViewSpot.find({'targets': new Mongo.ObjectID(id)}, options);
});