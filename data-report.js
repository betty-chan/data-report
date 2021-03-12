/*
  自定义埋点简易sdk，基于jQuery
  使用方式：
  1. 页面元素中添加[rp-view],[rp-click],[rp-click-one]属性。 eg:
  <button rp-click="{ event: 'click_add_to_cart', label: 'button' }">button</button>
  <div rp-view="{ event: 'impression', label: 'view' }>views</div>
  2. 手动上报 eg:
  $.track({
    event: 'click_add_to_cart',
    label: 'button'
  })
*/
;(function(){
    var isDev = false;//是否开发环境
    var rp_url = "";//数据上报地址
    var Report = {
      // 初始化页面事件
      init: function() {
        $(document).ready(function() {
          //曝光方法
          Report.intersectionObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
              if (entry.intersectionRatio < 0.8) return;
              Report.intersectionObserver.unobserve(entry.target);
              var reportData = null;
              try { reportData = JSON.parse($(entry.target).attr('rp-view')) } catch(e) {console.log(e);}
              Report.track(reportData);
            })
          }, {
            threshold: [0.8]
          });
          $('body').on('click', '[rp-click]', function() {
            var reportData = null;
            try { reportData = JSON.parse($(this).attr('rp-click')) } catch(e) {console.log(e);}
            Report.track(reportData);
          }).one('click', '[rp-click-one]', function() {
            var reportData = null;
            try { reportData = JSON.parse($(this).attr('rp-click-one')) } catch(e) {console.log(e);}
            Report.track(reportData);
          }).on('change', '[rp-change]', function() {
            var reportData = null;
            try { reportData = JSON.parse($(this).attr('rp-change')) } catch(e) {console.log(e);}
            Report.track(reportData);
          });
          // 开启元素曝光事件
          Report.initViewEvent();
          // 开启页面浏览事件
          Report.track({
            event: 'show_page',
            currency_page: window.PAGE_DATA.currencyPage,
            cur_lang: window.PAGE_DATA.lang,
            cate_id: window.PAGE_DATA.cate_id,
            goods_id: window.PAGE_DATA.goods_id,
            browser_kernel: navigator.userAgent,
            timestamp_start: Date.now(),
          })
        })
      },
      // 上报埋点的方法
      track: function(params) {
        if(!params) return;
        var defalutValue = {
          user_id: $.cookie('my_user_id'),
          session_id: $.cookie('GALAXY_SESSIONID'),
          version: '1.0.0',
        }
        var reportData = {
          ...defalutValue,
          ...params
        }
        isDev && console.log('report event <'+reportData.event+'>:', reportData);
        $.post({
          url: rp_url,
          type: 'POST',
          headers: {
            'Token': '',//根据项目
            'Data-Source': window.SITE_NAME
          },
          data: reportData
        })
      },
      // 重新初始化元素曝光事件，在所需元素动态生成时调用
      initViewEvent: function() {
        $('[rp-view]').each(function() {
          Report.intersectionObserver.observe($(this)[0]);
        });
      }
    };
    Report.init();
    // track方法挂载到jquery上以便全局调用
    $.extend({track: Report.track, trackInitView: Report.initViewEvent})
  })();
