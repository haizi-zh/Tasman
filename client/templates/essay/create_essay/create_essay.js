Template.essayCreate.rendered = function(){
  ue = UE.getEditor('ueContainer');

  // 存储自用的ue相关的变量参数
  ue.lxp = {};
  ue.ready(function(){
    //设置编辑器的内容
    ue.setContent('请在此编辑文章!');
  });
}


Template.essayCreate.events({
  // 提交文章内容
  'click .ue-submit': function(e){

  }
})

