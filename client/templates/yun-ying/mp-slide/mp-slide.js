Column = new Mongo.Collection('Column_CMS_Test');

Template.mpSlide.onRendered(function() {
    var height = $(window).height() - 100;
    $('.mp-slide-container').css({
        'height': height
    });
});

Template.mpSlide.events({
    'click .wx-url-confirm': function(e) {
        e.preventDefault();
        e.stopPropagation();
        var wxUrl = $.trim($('.wx-url').val());
        var picUrls = {};
        if(!wxUrl) {
            alert('地址不能为空');
            return;
        }
        Meteor.call('wxUrlContent', wxUrl, function(err, res) {
            var htmlString = res.data;
            var htmlDom = $.parseHTML(htmlString);
            $('.wx-content-container').append(htmlDom);
            $('.wx-content-container').find('img').map(function(index, ele) {
                var tempImgDom = $(ele)[0];
                if(tempImgDom.hasAttribute('data-src')) {
                    picUrls[index] = $(tempImgDom).attr('data-src');
                }
            });
            // 更新URL，并且删除多余的微信信息
            Meteor.call('wxUrlParse', picUrls, function(err, res) {
                var newUrls = res.data;
                $('.wx-content-container').find('img').map(function(index, ele) {
                    if(! newUrls[index]) return;
                    var tempImgDom = $(ele)[0];
                    if(tempImgDom.hasAttribute('data-src')) {
                        $(tempImgDom).attr('data-src', '');
                        $(tempImgDom).attr('src', newUrls[index]);
                        $(tempImgDom).css({
                            'margin': '3px 0px'
                        });
                    }
                });
                $('.rich_media_meta_list').remove();
                $('#activity-name').remove();
                $('.qr_code_pc').remove();
                Meteor.call('saveHTMLFile', $('.wx-content-container').html(), function(err, res){
                    if(err) {
                        alert('未知错误失败');
                        return;
                    }
                    if(res && res.code === 0) {
                        $('.wx-content-container').empty();
                        $('#wx-parsed-url').attr('href', res.data);
                        $('.wx-parse-preview').removeClass("hidden");
                    }else {
                        alert(res.data);
                    }
                });
            });
        });
    }
});