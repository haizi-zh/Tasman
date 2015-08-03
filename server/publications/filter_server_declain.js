//

Meteor.FilterCollections.publish(ViewSpot, {
  name: 'ViewSpot-list'
});

Meteor.FilterCollections.publish(Locality, {
  name: 'Locality-list'
});

Meteor.FilterCollections.publish(Hotel, {
  name: 'Hotel-list'
});

Meteor.FilterCollections.publish(Restaurant, {
  name: 'Restaurant-list'
});

Meteor.FilterCollections.publish(Shopping, {
  name: 'Shopping-list'
});

Meteor.FilterCollections.publish(OplogPkList, {
  name: 'oplog-pk-list'
});

Meteor.FilterCollections.publish(PoiMergeInfo, {
  name: 'PoiMergeInfo-list'
});