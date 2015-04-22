Template.searchTpl.helpers({
  collections: function() {
    _.keys(colSelection).map(function(key) {
      colSelection[key] = false
    });
    colSelection[Session.get('curSearchCollection')] = true;
    return colSelection;
  }
});


Template.searchTpl.events({
  'change .sort-select': function(e) {
    var curCol = $(e.target).val();
    Session.set('curSearchCollection', curCol);
  },
  'click .search-btn': function(e) {
    e.preventDefault();

    var curSearchCollection = Session.get('curSearchCollection'),
        curSearchContent = $('#searchContent').val();

    Meteor.call('search', curSearchCollection, curSearchContent, function(err, result) {
      result && result.length && result.map(function(x){x.collection = curSearchCollection});
      Session.set('searchResults', result);
      Router.go('/searchResult');
    });

  }
});




// searchResult
Template.searchResult.helpers({
  collections: function() {
    Session.get('curSearchCollection')
    return colSelection;
  },
  urlGen: function(type, id) {
    return '/' + type + '/' + id;
  },
  hasCompareItem: function() {
    return Session.get('compareItems').length > 1;
  },
  searchResults: function() {
    return Session.get('searchResults');
  }
});

Template.searchResult.events({
  'change :checkbox': function(e) {
    var parentDom = $(e.target).parent(),
      dataDome = parentDom.children("a"),
      checkBox = parentDom.children("input"),
      id = dataDome.attr('data-id'),
      type = dataDome.attr('data-type'),
      zhName = dataDome.html();
    e.preventDefault();
    e.stopPropagation();

    if (Session.get('compareItems').indexOf(id) !== -1) {
      $('#' + id).remove();
      Session.set('compareItems', _.without(Session.get('compareItems'), id));
    } else {
      Blaze.renderWithData(
        Template.compareItem, {
          'id': id,
          'zhName': zhName
        },
        $('.add_to_compare')[0]
      );
      var temp = Session.get('compareItems');
      temp.push(id);
      Session.set('compareItems', temp);
    }
  },
  'click .compare_btn': function(e) {
    e.preventDefault();
    // 挑战前，先将compareItems中的
    var temp = Session.get('compareItems');
    temp[0] = Session.get('curSearchCollection');
    Session.set('compareItems', temp);
    console.log(Session.get('compareItems'));
    // 需要比较的数据存放在session里，进入路由后提取并清空
    Router.go('compare');
  }
});