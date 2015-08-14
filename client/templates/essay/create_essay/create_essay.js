
Template.essayCreate.rendered = function(){
  ue = UE.getEditor('ueContainer');

  // 存储自用的ue相关的变量参数
  Meteor.call('getEssayConfig', function(err, res){
    ue.lxp = {
      bucket: res.bucket,
      host: res.host,
      prefix: {
        images: 'static/images/'
      }
    };  
  })
  
  ue.ready(function(){
    //设置编辑器的内容
    ue.setContent('请在此编辑文章!');
  });
}


Template.essayCreate.helpers({
  'title': function(){
    return {
      'limit': 60
    }
  },
  'author': function(){
    return {
      'limit': 16
    }
  },
  'abstract': function(){
    return {
      'limit': 120
    }
  }
})


// 文本框统计字数的绑定事件
var wordCountFunction = function(e){
  var $input = $(e.target);
  var $wordCount = $input.prevAll('.word-count');
  var wordLength = $input.val().length;

  $wordCount.text(wordLength);
  if (wordLength > this.limit){
    $wordCount.addClass('color-red');
  }else{
    $wordCount.removeClass('color-red');
  }
}


Template.essayCreate.events({
  // 提交文章内容
  'click .essay-submit': function(e){
    console.log(ue.getContent());
    console.log(ue.getContentTxt());
  },

  // 统计字数(input)
  'keyup input': wordCountFunction,

  // 统计字数(textarea)
  'keyup textarea': wordCountFunction
})
