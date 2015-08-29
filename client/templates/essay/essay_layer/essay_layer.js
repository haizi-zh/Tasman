Template.essaySelectLayer.events({
  // 点击搜索
  'click .search': function(e){
    var title = $(e.target).siblings('input.keyword').val();
    Meteor.call('findEssay', title, function(err, res){
      if (err){
        alert('搜索失败!');
        return ;
      }

      var $essayList = $('.essay-select-list')[0];
      for (var i = 0;i < res.length;i++){
        Blaze.renderWithData(Template.essayFrame, res[i], $essayList);
      }
    });
  },

  // 选择文章素材
  'click .essay-frame': function(e){
    essaySelectLayer.hide();

    var $essayContainer = $('.create-message-contents-essay');
    $essayContainer.children('.essay-select-frame').addClass('hide');
    Blaze.renderWithData(Template.essayFrame, this, $essayContainer[0]);
    $essayContainer.append('<button class="delete">删除</button>');
  }
})


Template.essayPreviewTargetLayer.events({
  // 确认发送
  'click .confirm': function(e){
    var targetId = $(e.target).siblings('input').val();
    var contents = ue.getContent();

    var options = {
      bucket: ue.lxp.bucket,
      host: ue.lxp.host,
      prefix: ue.lxp.prefix.draft,
      suffix: ue.lxp.suffix.draft,
      generator: 1
    }

    Meteor.call('getPicUpToken', options, function(error, result) {
      if (error) {
        return throwError(error.reason);
      }
      if (result){
        var form = $(e.target).siblings('.upload');
        var form_data = new FormData(form[0]);
        form_data.append('key', result.key);
        form_data.append('token', result.upToken);

        // 转成二进制流？
        // contents = Array.prototype.map.call(contents, function(c) {
        //   return c.charCodeAt(0);
        // });

        var cssStyle = '<style>' + '.essay-wrap{position: relative;width: 100%;box-sizing: border-box;margin: 0 auto;padding: 10px;background-color: #fff;padding-bottom: 100px;} img{width:100%;height:auto;}' + '</style>';

        var meta = '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">' + 
          '<meta http-equiv="X-UA-Compatible" content="IE=edge">' + 
          '<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=0" />' + 
          '<meta name="referrer" content="origin-when-cross-origin">' +
          '<link rel="shortcut icon" type="image/x-icon" href="http://res.wx.qq.com/mmbizwap/zh_CN/htmledition/images/icon/common/favicon22c41b.ico">' +
          '<meta name="apple-mobile-web-app-capable" content="yes">' +
          '<meta name="apple-mobile-web-app-status-bar-style" content="black">' +
          '<meta name="format-detection" content="telephone=no">';

        var scriptIsMobile = '<script type="text/javascript">' +
            'var isMobilePlayer = 0;' +
            '// 判断是否为移动端运行环境' +
            'if(/AppleWebKit.*Mobile/i.test(navigator.userAgent) || (/MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/.test(navigator.userAgent))){' +
                'if(window.location.href.indexOf("?mobile")<0){' +
                    'try{' +
                        'if(/Android|webOS|iPhone|iPod|iPad|BlackBerry/i.test(navigator.userAgent)){' +
                            '// 判断访问环境是 Android|webOS|iPhone|iPod|BlackBerry 则加载以下样式' +
                            'isMobilePlayer = 1;' +
                        '}' +
                        'else{' +
                            '// 判断访问环境是 其他移动设备 则加载以下样式' +
                        '}' +
                    '}' +
                    'catch(e){}' +
                '}' +
            '}' +
            'else{' +
                '// 如果以上都不是，则加载以下样式' +
            '}' +
        '</script>';
        var head = '<head>' + meta + scriptIsMobile + cssStyle + '</head>';

        var scriptMobileStyle = '<script type="text/javascript">' +
            'if (isMobilePlayer) {' +
              'document.getElementByClass("essay-wrap").style.width = "100%";' +
            '}' +
        '</script>';
        var body = '<body><div class="essay-wrap">' + contents + '</div>' + scriptMobileStyle + '</body>';

        contents = '<!DOCTYPE html>' + '<html>' + head + body + '</html>';
        form_data.append('file', contents);

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
            var msgContents ={
                title: $('.essay-title>input').val(),
                desc: $('.essay-abstract>textarea').val(),
                image: $('.essay-cover>input').val(),
                url: result.url
              };
            var msg = {
                  'receiver': Number(targetId),
                  'sender': 10000,
                  'msgType': 18,
                  'contents': JSON.stringify(msgContents),
                  'chatType': 'single'
                },
                header = {
                  'Content-Type': 'application/json',
                },
                option = {
                  'header': header,
                  'data': msg
                };

            Meteor.call('sendMsg', option, function(err, res){
              if (err){
                alert('发送预览消息失败！');
                console.log(err);
              }

              if (res){
                alert('发送成功，请在手机上预览！');
                essayPreviewTargetLayer.hide();
              }
            })
          }
        });
      }else{
        alert("上传图片失败，请再次上传或联系程序员！");
      }
    });
  },

  // 取消发送
  'click .cancel': function(e){
    essayPreviewTargetLayer.hide();
  }
})