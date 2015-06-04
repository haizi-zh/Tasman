Template.statistics.events({
  'click #last-week-btn': function(e){
    var startDate = Session.get("statisticsStartDate");
    var lastWeekMonday = moment(startDate * 1000).subtract(7, 'day').unix();
    var lastWeekSunday = moment(startDate * 1000).subtract(1, 'day').unix();
    Session.set('statisticsStartDate', lastWeekMonday);
    Session.set('statisticsEndDate', lastWeekSunday);
  },
  'click #next-week-btn': function(e){
    var endDate = Session.get("statisticsEndDate");
    var nextWeekMonday = moment(endDate * 1000).add(1, 'day').unix();
    var nextWeekSunday = moment(endDate * 1000).add(7, 'day').unix();
    Session.set('statisticsStartDate', nextWeekMonday);
    Session.set('statisticsEndDate', nextWeekSunday);
  },
  'click .task-element': function(e) {
    e.preventDefault();
    e.stopPropagation();
    var taskId = $(e.target).attr('task-id');
    $('.task-element-detail').addClass("hidden");
    $('#' + taskId).removeClass("hidden");
  }
});

// Template.statistics.helpers({
//   //编辑次数
//   'UserWorkStatistics': function (e){
//     //获取要查看的编辑人员
//     Meteor.subscribe('editor');
//     var editors = Meteor.users.find({}).fetch();

//     var startDate = Session.get("statisticsStartDate");//统计开始的时间（周一）
//     var endDate = Session.get("statisticsEndDate");//统计结束的时间（周日）

//     //分别获取相应人员,相应时间的数据
//     var chartData = [];
//     var sundayDay = moment(endDate * 1000).unix() * 1000;
//     var mondayDay = moment(startDate * 1000).unix() * 1000;
//     for (i = 0;i < editors.length;i++){
//       //订阅需要的数据
//       var query = {
//         userId: editors[i]._id,
//         ts: {
//           "$lt": sundayDay,
//           "$gte": mondayDay
//         }
//       }
//       Meteor.subscribe('userOplog', query);


//       var count = [];
//       var firstDay = moment(mondayDay);

//       for (j = 0;j < 7;j++){
//         var a = CmsOplog.find({
//           userId: editors[i]._id,
//           ts: {
//             "$gte": firstDay.unix() * 1000,
//             "$lt": firstDay.add(1, 'day').unix() * 1000
//           }
//         }).count();
//         count.push(a);
//       }

//       chartData.push({
//         name: editors[i].username,
//         data: count
//       });
//     };

//     //highChart的参数格式
//     var data = {
//       chart: {
//           type: 'column'
//       },

//       title: {
//           text: '工作量总结'
//       },

//       subtitle: {
//           text: '每周'
//       },

//       credits: {
//           enabled: false
//       },

//       xAxis: {
//           categories: [
//               '周一',
//               '周二',
//               '周三',
//               '周四',
//               '周五',
//               '周六',
//               '周日',
//           ]
//       },

//       yAxis: {
//           min: 0,
//           title: {
//               text: '个数:'
//           }
//       },

//       tooltip: {
//           headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
//           pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
//               '<td style="padding:0"><b>{point.y:.0f} 个</b></td></tr>',
//           footerFormat: '</table>',
//           shared: true,
//           useHTML: true
//       },

//       plotOptions: {
//           column: {
//               pointPadding: 0.2,
//               borderWidth: 0
//           }
//       },

//       // TODO 从数据库中提取数据替换
//       series: chartData
//     };
//     Session.set('statisticsData', data);

//     return {
//       startTs: startDate, //时间戳
//       endTs: endDate,
//       startDate: moment(startDate * 1000).format('YYYY.MM.DD'),//日期
//       endDate: moment(endDate * 1000).format('YYYY.MM.DD')
//     };
//   },
// });

// Tracker.autorun(function(){
//   var basedata = Session.get('statisticsData');
//   $('#static-graph').empty();
//   $('#static-graph').highcharts(basedata);
// })