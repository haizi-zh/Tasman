/**
 * jQuery flexText: Auto-height textareas
 * --------------------------------------
 * Requires: jQuery 1.7+
 * Usage example: $('textarea').flexText()
 * Info: https://github.com/alexdunphy/flexible-textareas
 */
;(function ($) {

    // Constructor
    function FT(elem) {
        this.$textarea = $(elem);
        this._init();
    }

    FT.prototype = {
        _init: function () {
            var _this = this;

            // Insert wrapper elem & pre/span for textarea mirroring
            // 新建一个包裹元素包裹住textarea，并且在textarea之前用 pre/span 存放一个textarea的映射(镜像)
            this.$textarea.wrap('<div class="flex-text-wrap" />').before('<pre><span /></pre>');

            // 找到包裹元素里面的span元素
            this.$span = this.$textarea.prev().find('span');

            // Add input event listeners
            // * input for modern browsers
            // * propertychange for IE 7 & 8
            // * keyup for IE >= 9: catches keyboard-triggered undos/cuts/deletes
            // * change for IE >= 9: catches mouse-triggered undos/cuts/deletions (when textarea loses focus)

            // 添加textarea的事件监听
            // * input 适用于 现代浏览器
            // * propertychange 适用于 IE7 / 8
            // * keyup 适用于 IE >= 9: 捕捉 keyboard-triggered undos/cuts/deletes
            // * change 适用于 IE >= 9: 捕捉 mouse-triggered undos/cuts/deletions (当textarea失去焦点时)

            // 自己添加了focus和mouse事件的监听
            this.$textarea.on('input propertychange keyup change focus mouseover mouseout mouseleave', function () {
                _this._mirror();
            });

            // jQuery val() strips carriage return chars by default (see http://api.jquery.com/val/)
            // This causes issues in IE7, but a valHook can be used to preserve these chars
            // jQuery 的val()默认将数据分割成字符来运输并返回？？
            // 这在IE7中将导致一些问题，不过用valHook可以保存这些字符？？
            // $.valHooks.textarea = {
            //     get: function (elem) {
            //         return elem.value.replace(/\r?\n/g, "\r\n");
            //     }
            // };

            // Mirror contents once on init
            this._mirror();
        }

        // Mirror pre/span & textarea contents
        // 将textarea的内容映射到 pre/span 中
        ,_mirror: function () {
            this.$span.text(this.$textarea.val());
        }
    };

    // jQuery plugin wrapper
    $.fn.flexText = function () {
        return this.each(function () {
            // Check if already instantiated on this elem
            // 判断该元素是否已经被实例化
            if (!$.data(this, 'flexText')) {
                // Instantiate & store elem + string
                // 实例化并且储存元素，以及文本
                $.data(this, 'flexText', new FT(this));
            }
            // 可以配合tracker.autorun
            // else {
            //     $.data(this, 'flexText')._mirror();
            // }
        });
    };

})(jQuery);