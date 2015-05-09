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
      result && result.length && result.map(function(x){
        x.collection = curSearchCollection;
        x.descShort = x.desc && x.desc.length ? x.desc.substr(0, 30) + '...' : "暂无简介";
      });
      Session.set('searchResults', result);
      Router.go('/searchResult');
    });

  }
});

Template.searchResult.onRendered(function(){
  Session.set('compareItems', ['location for items type']);
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
    var parentDom = $(e.target).parent().parent(),
      dataDome = parentDom.find('a'),
      checkBox = parentDom.find("input"),
      id = dataDome.attr('data-id'),
      type = dataDome.attr('data-type'),
      zhName = parentDom.find("label").html();

    e.preventDefault();
    e.stopPropagation();

    if (Session.get('compareItems').indexOf(id) !== -1) {
      $('#' + id).parent().remove();
      Session.set('compareItems', _.without(Session.get('compareItems'), id));
    } else {
      Blaze.renderWithData(
        Template.compareItem, {
          'id': id,
          'zhName': zhName
        },
        $('.add_to_compare_ul')[0]
      );
      var temp = Session.get('compareItems');
      temp.push(id);
      Session.set('compareItems', temp);
    }
  },
  'click .compare_btn': function(e) {
    e.preventDefault();
    var temp = Session.get('compareItems');
    temp[0] = Session.get('curSearchCollection');
    Session.set('compareItems', temp);
    // console.log(Session.get('compareItems'));
    // 需要比较的数据存放在session里，进入路由后提取并清空
    Router.go('compare');
  }
});