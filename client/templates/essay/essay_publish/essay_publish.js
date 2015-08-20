essaySelectLayer = null;

Template.essayPublish.events({
  // 切换 "新建消息"、"已发布消息"
  "click .nav-tabs>li>a": function(e) {
    var $li = $(e.target).parent();
    var $liClass = $li.attr('class').split('-');
    var frameName = $liClass[0] + '-' + $liClass[1] + '-frame';

    $li.addClass("active");
    $li.siblings().removeClass("active");

    $('.' + frameName).removeClass('hidden').addClass("show");
    $('.' + frameName).siblings().removeClass('show').addClass("hidden");
  },

  // 切换"新建群消息"类型
  'click .create-message-contents-nav>ul>li>a': function(e) {
    var $li = $(e.target).parent();
    var type = $li.attr('class').split('-')[4];
    var frameName = 'create-message-contents-' + type;

    $li.addClass("active");
    $li.siblings().removeClass("active");

    $('.' + frameName).removeClass('hidden').addClass("show");
    $('.' + frameName).siblings().removeClass('show').addClass("hidden");
  },

  // 展示选择素材的弹窗
  'click .essay-select-frame>a': function(e) {
    if (essaySelectLayer) {
      essaySelectLayer.show();
    } else {
      var shareDialogInfo = {
        template: Template.essaySelectLayer,
        title: '选择素材'
      };
      essaySelectLayer = ReactiveModal.initDialog(shareDialogInfo);
      essaySelectLayer.show();
    }
  },

  // 删除选中的素材
  'click .create-message-contents-essay>.delete': function(e){
    var $deleteBtn = $(e.target);
    $deleteBtn.siblings('.essay-frame').remove();
    $deleteBtn.siblings('.essay-select-frame').removeClass('hide');
    $deleteBtn.remove();
  },

  // 发布素材
  'click .publish': function(e){

  }
})