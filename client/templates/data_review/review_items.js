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
  // TODO: add more items
  'ViewSpot': {
    'basic': {
      'zhName': ['名字', itemDataType.string],
      'desc': ['描述', itemDataType.string],
      'openTime': ['开放时间', itemDataType.string],
      'timeCostDesc': ['建议游玩时长', itemDataType.string],
      'travelMonth': ['最佳游玩时间', itemDataType.string],
      'priceDesc': ['价格', itemDataType.string],
    },
    'traffic': {
      'trafficInfo': ['交通信息', itemDataType.string]
    },
    'feature': {
      'tips': ['Tips', itemDataType.obj_array, {
        'title': ['提示的标题', itemDataType.string],
        'desc': ['提示的内容', itemDataType.string]
      }]
    }
  }
};