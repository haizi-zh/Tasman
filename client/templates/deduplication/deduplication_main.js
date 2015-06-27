Template.dedupViewspot.onRendered(function () {
  // 初始化Session
  Session.setDefault('isAbroad', false);
  // 一级区域
  Session.setDefault('domesticProvinces', []);  // 国内省份
  Session.setDefault('abroadCountries', []);    // 国外国家
  // 二级区域
  Session.setDefault('cities', {'abroad': {}, 'domestic': {}});
  // 当前一级、二级区域选择
  Session.setDefault('curLevelOne', '');
  Session.setDefault('curLevelTwo', '');
  // Session 赋值
  Meteor.call('dedupOnlineInfo', function(err, res) {
    if (!err && res && res.code === 0) {
      var data = res.data,
          abroadData = data.abroad,
          domesticData = data.domestic;
      // Session: domesticProvinces, abroadCountries数据处理
      domesticProvinces(domesticData);
      abroadCountries(abroadData);
      // Session: cities 数据处理
      cities(data);
    }
  });
  // poi比较 Session
  Session.set('compareItems', ['location for items type']);
  Session.set('curSearchCollection', 'ViewSpot');
  // 帅选 和 排序用的Session
  Session.set('onlyAutoViewSpot', false);
  Session.set('sort-open', false);  //是否打开排序，打开后的值为：1->名字 | 2->热门
  Session.set('sort-zhName', false);
  Session.set('sort-hotness', false);
  Session.set('sortSetting', {});
  Session.set('dedup-query', {});
  Session.set('dedup-options', {});
  // 跟踪排序帅选
  Tracker.autorun(function () {
    var sortSetting = {},
        status = Session.get('sort-open'),
        zhNameSort = Session.get('sort-zhName'),
        hotnessSort = Session.get('sort-hotness');
    // 确定排序的状态
    if (status) {
      sortSetting.status = true;
      sortSetting.zhNameSort = zhNameSort;
      sortSetting.hotnessSort = hotnessSort;
    }
    Session.set('sortSetting', sortSetting);
    // 确定最终的数据查询状态
    var query = {},
        options = {'sort': {}},
        onlyAutoViewSpot = Session.get('onlyAutoViewSpot');
    if (onlyAutoViewSpot) {
      query.isKey = true;
    }
    Session.set('dedup-query', query);
    switch (status) {
      case 1: options.sort.zhName = zhNameSort ? 1 : -1; break;
      case 2: options.sort.hotnessTag = hotnessSort ? -1 : 1; break;
      default: options.sort.zhName = -1;break;
    }
    Session.set('dedup-options', options);
  });
});


Template.dedupViewspot.helpers({
  'isAbroad': function () {
    return Session.get('isAbroad');
  },
  'zones': function () {
    return Session.get('isAbroad') ? Session.get('abroadCountries') : Session.get('domesticProvinces');
  },
  'cities': function () {
    var zoneType = Session.get('isAbroad') ? 'abroad' : 'domestic';
    return Session.get('cities')[zoneType][Session.get('curLevelOne')];
  },
  'vs': function() {
    var query = Session.get('dedup-query'),
        options = Session.get('dedup-options');
    return ViewSpot.find(query, options);
  },
  'cityName': function () {
    return Session.get('cityName');
  },
  'count': function() {
    return ViewSpot.find({}).fetch().length;
  },
  'hasCompareItem': function() {
    return Session.get('compareItems').length > 1;
  },
  'sortSetting': function () {
    return Session.get('sortSetting');
  },
  'sortByName': function () {
    return Session.get('sort-open') === 1 ? true : false;
  },
  'sortByHotness': function () {
    return Session.get('sort-open') === 2 ? true : false;
  }
});

Template.dedupViewspot.events({
  'change #J_domesticORbroad': function (e) {
    e.target.value === 'abroad' ? Session.set('isAbroad', true) : Session.set('isAbroad', false);
    Session.set('curLevelTwo', '');
    $('#J_zoneSelect').val('default');
    $('#J_citySelect').val('default');
  },
  'change #J_zoneSelect': function (e) {
    Session.set('curLevelOne', e.target.value);
    Session.set('curLevelTwo', '');
    $('#J_citySelect').val('default');
  },
  'change #J_citySelect': function (e) {
    if (e.target.value === 'default') return;
    var target = e.target.value.split('-');
        id = target[0],
        zhName = target[1];
    Session.set('curLevelTwo', {'id': id, 'zhName': zhName});
  },
  'click #J_dedup_look_up': function (e) {
    e.preventDefault();
    e.stopPropagation();
    var id = Session.get('curLevelTwo').id;
    if (id) {
      Meteor.subscribe('dedupViewspot', {'id': id}, function(err, res) {
        if (err) return;
        Session.set('cityName', Session.get('curLevelTwo').zhName);
      });
    }else {
      alert('请选择城市！');
    }
  },
  'click .dedup-viewspot-info': function (e) {
    // 不能存在，否则下面的checkbox就无法显示信息
    // e.preventDefault();
    var id = $(e.target).attr('id'),
        dom = $('#desc-' + id);
    dom.hasClass("hidden") ? dom.removeClass("hidden") : dom.addClass("hidden");
  },
  'click .dedup-checkbox': function(e) {
    var id = $(e.target).attr('data-id'),
        zhName = $(e.target).attr('data-zhName');

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
    // window.open(Router.url('compare'));
    Router.go('compare');
  },
  'click .dedup-fileter-name': function (e) {
    e.preventDefault();
    Session.set('sort-open', 1);
    var t = Session.get('sort-zhName');
    Session.set('sort-zhName', !t);
  },
  'click .dedup-fileter-hotness': function (e) {
    e.preventDefault();
    Session.set('sort-open', 2);
    var t = Session.get('sort-hotness');
    Session.set('sort-hotness', !t);
  },
  'click .dedup-auto-merge-by-machine': function (e) {
    var status = e.target.checked;
    Session.set('onlyAutoViewSpot', status);
  }
});


// 获取国内省份列表
function domesticProvinces (domesticData) {
  var provinces = {};
  domesticData.map(function (ele) {
    provinces[ele.province] = true;
  });
  Session.set('domesticProvinces', Object.keys(provinces));
}

// 获取国外国家列表
function abroadCountries (abroadData) {
  var countries = {};
  abroadData.map(function(ele) {
    countries[ele.zhName] = true;
  });
  Session.set('abroadCountries', Object.keys(countries));
}

// 城市综合处理
function cities (data) {
  var cities = {'abroad': {}, 'domestic': {}};
  var abroadData = data.abroad,
      domesticData = data.domestic;
  abroadData.map(function (ele) {
    cities.abroad[ele.zhName] = ele.destinations;
  });
  domesticData.map(function(ele) {
    if (!cities.domestic[ele.province]) {
      cities.domestic[ele.province] = [];
    }
    cities.domestic[ele.province].push({'zhName': ele.zhName, 'id': ele.id});
  });
  Session.set('cities', cities);
}


