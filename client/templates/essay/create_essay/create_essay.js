
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

  // 超出上限的样式改变
  if (wordLength > this.limit){
    $wordCount.addClass('color-red');
  }else{
    $wordCount.removeClass('color-red');
  }
}


Template.essayCreate.events({
  // 提交文章内容
  'click .essay-submit': function(e){
    var essay = {
      title: $('.essay-title>input').val(),
      author: $('.essay-author>input').val(),
      keywords: _.map($('.essay-keywords>input').val().split(','), function(x){
        return x.trim();
      }),
      abstract: $('.essay-abstract>textarea').val(),
      cover: $('.essay-cover>input').val(),
      contents: ue.getContent()
    }

    // 检查文章内容
    if (! checkEssayContents(essay)){
      return ;
    }

    // 去掉空白的keyword
    var keywordsTemp = [];
    for (var i = j = 0;i < essay.keywords.length;i++){
      if (! essay.keywords[i]){
        console.log(essay.keywords[i]);
        continue;
      }
      keywordsTemp[j++] = essay.keywords[i];
    }

    if (keywordsTemp.length)
      essay.keywords = keywordsTemp;
    else
      delete essay.keywords;


    // 存储文章
    Meteor.call('createEssay', essay, function(err, res){
      if (err) {
        alert('保存失败');
        return ;
      }

      alert('新建文章成功');
      console.log(res);
    });

    // console.log(ue.getContent());
    // console.log(ue.getContentTxt());
  },

  // 统计字数(input)
  'keyup input': wordCountFunction,

  // 统计字数(textarea)
  'keyup textarea': wordCountFunction,

  // 上传封面图
  'change .essay-cover-file': function(e){
    // 初始化配置
    var options = {
      bucket: ue.lxp.bucket,
      host: ue.lxp.host,
      prefix: ue.lxp.prefix.images,
      generator: 1
    }

    // 获取上传token并上传
    Meteor.call('getPicUpToken', options, function(error, result) {
      if (error) {
        return throwError(error.reason);
      }
      if (result){
        $(e.target).siblings(".picUpToken").val(result.upToken);
        $(e.target).siblings(".picUpKey").val(result.key);
        var form_data = new FormData($('#pic-up')[0]);

        //用jquery.ajax提交表单
        $.ajax({
          type: 'post',
          url: 'https://up.qbox.me/',
          async: false,
          cache: false,
          contentType: false,
          processData: false,
          data: form_data,
          success: function(data) {
            var imageUrl = result.url;
            // alert('成功上传图片' + imageUrl);
            $('.essay-cover>input').val(imageUrl);
          }
        });
      }else{
        alert("上传图片失败，请再次上传或联系程序员！");
      }
    });
  }
})

// 检查提交的文章内容是否符合
function checkEssayContents(essay){
  var checkItems = {
    'title': '标题',
    'abstract': '摘要',
    'cover': '封面图片',
    'contents': '内容'
  };

  for (item in checkItems){
    if (! essay[item]){
      alert('请输入' + checkItems[item] + '!');
      return false;
    }

    // 只有空白符
    if (! essay[item].trim()){
      alert(checkItems[item] + '不可以为空白!');
      return false;
    }
  }

  return true;
}


