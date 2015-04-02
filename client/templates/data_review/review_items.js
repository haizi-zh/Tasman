itemDataType = {
  'string': 'String',
  'url': 'Url',
  'array': 'Array',     // special
  'object': 'Object',   // special
  'int': 'Int'
}


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
      'tips': ['Tips', itemDataType.array, {
        'title': ['提示', itemDataType.string],
        'desc': ['内容', itemDataType.string]
      }]
    }
  }
}