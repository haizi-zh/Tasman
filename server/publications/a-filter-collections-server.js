Meteor.FilterCollections = {};

Meteor.FilterCollections.publish = function (collection, options) {

  var self = this;

  options = options || {};

  var callbacks = options.callbacks || {};


  // Publish Name
  var name = (options.name) ? options.name : collection._name;
  var publisherResultsId = 'fc-' + name + '-results';
  var publisherCountId = 'fc-' + name + '-count';
  var publisherCountCollectionName = name + 'CountFC';

  /**
   * Publish query results.
   */

  Meteor.publish(publisherResultsId, function (query) {
    check(query, Object);
    var allow = true;

    log('publish result query:');
    log(query);

    if (callbacks.allow && _.isFunction(callbacks.allow))
      allow = callbacks.allow(query, this);

    if(!allow){
      throw new Meteor.Error(417, 'Not allowed');
    }

    query = (query && !_.isEmpty(query)) ? query : {};

    query.selector = query.selector || {};

    query.options = query.options || {
      sort: [],
      skip: 0,
      limit: 10
    };

    if (callbacks.beforePublish && _.isFunction(callbacks.beforePublish))
      query = callbacks.beforePublish(query, this) || query;

    var cursor = collection.find(query.selector, query.options);

    log('publish results:');
    log(cursor.fetch());

    if (callbacks.afterPublish && _.isFunction(callbacks.afterPublish))
      cursor = callbacks.afterPublish('results', cursor, this) || cursor;

    return cursor;
  });

  /**
   * Publish result count.
   */

  Meteor.publish(publisherCountId, function (query) {
    check(query, Object);
    var self = this;
    var allow = true;
    var cursor = {};

    if (callbacks.allow && _.isFunction(callbacks.allow))
      allow = callbacks.allow(query, this);

    if(!allow){
      throw new Meteor.Error(417, 'Not allowed');
    }

    query = (query && !_.isEmpty(query)) ? query : {};
    query.selector = query.selector || {};

    if(callbacks.beforePublish && _.isFunction(callbacks.beforePublish))
      query = callbacks.beforePublish(query, this) || query;

    count = collection.find(query.selector).count() || 0;

    if(callbacks.afterPublish && _.isFunction(callbacks.afterPublish))
      cursor = callbacks.afterPublish('count', cursor, this) || cursor;

    self.added(publisherCountCollectionName, Meteor.uuid(), {
      count: count,
      query: query
    });

    this.ready();
  });
};
