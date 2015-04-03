itemDataType = {
  'string': 'String',
  'url': 'Url',
  'str_array': 'strArray',     // 字符串构成的数组
  'obj_array': 'objArray',     // 字典对象构成的数组
  'object': 'Object',   // special
  'int': 'Int'
};

itemClassify = {
  'basic': 'basic',
  'traffic': 'traffic',
  'feature': 'feature'
};


reviewItems = {

  // 城市
  'Locality': {
    'basic': {
      'zhName': ['名字：', itemDataType.string, false],
      'desc': ['描述：', itemDataType.string, false],
      'timeCostDesc': ['建议游玩时间：', itemDataType.string, false],
      'travelMonth': ['最佳旅游季节：', itemDataType.string, false],
    },
    'traffic': {
      'trafficIntro': ['交通提示：', itemDataType.string, true],
      'localTraffic': ['当地交通：', itemDataType.obj_array, false, {
        'title': ['交通方式：', itemDataType.string, false],
        'desc': ['描述：', itemDataType.string, true]
      }],
      'remoteTraffic': ['远程交通：', itemDataType.obj_array, false, {
        'title': ['交通方式：', itemDataType.string, false],
        'desc': ['描述：', itemDataType.string, true]
      }],
    },
    'feature': {
      'activities': ['特色活动：', itemDataType.obj_array, false, {
        // 'images'  TODO  组织图片的URL
        'title': ['活动标题：', itemDataType.string, false],
        'desc': ['活动内容：', itemDataType.string, true],
      }],
      'tips': ['Tips：', itemDataType.obj_array, false, {
        // 'images'  TODO  组织图片的URL
        'title': ['提示标题：', itemDataType.string, false],
        'desc': ['提示内容：', itemDataType.string, true]
      }],
      'geoHistory': ['地理人文信息', itemDataType.obj_array, false, {
        // 'images'  TODO  组织图片的URL
        'title': ['标题：', itemDataType.string, false],
        'desc': ['内容：', itemDataType.string, true]
      }],
    }
  },

  // 景点
  'ViewSpot': {
    'basic': {
      'zhName': ['名字', itemDataType.string, false],
      'desc': ['描述', itemDataType.string, false],
      'openTime': ['开放时间', itemDataType.string, false],
      'timeCostDesc': ['建议游玩时长', itemDataType.string, false],
      'travelMonth': ['最佳游玩时间', itemDataType.string, false],
      'priceDesc': ['价格', itemDataType.string, false],
    },
    'traffic': {
      'trafficInfo': ['交通信息', itemDataType.string, true]
    },
    'feature': {
      'tips': ['Tips', itemDataType.obj_array, false, {
        'title': ['提示的标题', itemDataType.string, false],
        'desc': ['提示的内容', itemDataType.string, true]
      }]
    }
  },

  // 购物
  'Shopping': {
    'basic': {
      'zhName': ['名字', itemDataType.string, false],
      'address': ['地址', itemDataType.string, false],
      'style': ['风格', itemDataType.string, false],
    },
    'traffic': {

    },
    'feature': {

    }
  },

  // 餐馆
  'Restaurant': {
    'basic': {
      'zhName': ['名字', itemDataType.string, false],
      'address': ['地址', itemDataType.string, false],
      'style': ['风格', itemDataType.string, false],
    },
    'traffic': {

    },
    'feature': {

    }
  },
};

itemIndex = {
  'zhDesc': 0,
  'dataType': 1,
  'richEditor': 2,
  'childInfo': 3
}