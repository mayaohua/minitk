//获取应用实例
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object,
      observer: function (newVal, oldVal, changedPath) {
        var data = [];
      }
    },
    pid:Number,
    imgurllist:Array,
  },
  /**
   * 组件的初始数据
   */
  data: {
    itemImg: {
      like: ['/public/img/like.png', '/public/img/like_on.png'],
      comment: ['/public/img/message.png', '/public/img/message_on.png'],
      follow: ['/public/img/follow.png', '/public/img/follow_on.png'],
      sex: ['/public/img/man.png', '/public/img/woman.png']
    },
    // 触摸开始时间
    touchStartTime: 0,
    // 触摸结束时间
    touchEndTime: 0,
    // 最后一次单击事件点击发生时间
    lastTapTime: 0,
    // 单击事件点击后要触发的函数
    lastTapTimeoutFunc: null,
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 图片预览
     */
    previewImage: function (pic_id) {
      wx.navigateTo({
        url: '/pages/info/info?id=' + pic_id,
      })
    },
    /// 单击、双击
    multipleTap: function (e) {
      if (!app.userActionBefore()) { return; }
      var that = this
      var id = e.currentTarget.dataset.id;
      var pid = e.currentTarget.dataset.pid;
      var pic_id = e.currentTarget.dataset.pic_id;
      // 控制点击事件在350ms内触发，加这层判断是为了防止长按时会触发点击事件
      if (that.data.touchEndTime - that.data.touchStartTime < 350) {
        // 当前点击的时间
        var currentTime = e.timeStamp
        var lastTapTime = that.data.lastTapTime
        // 更新最后一次点击时间
        that.data.lastTapTime = currentTime
        var url = e.currentTarget.dataset.src;
        // 如果两次点击时间在300毫秒内，则认为是双击事件
        if (currentTime - lastTapTime < 300) {
          // 成功触发双击事件时，取消单击事件的执行
          clearTimeout(that.data.lastTapTimeoutFunc);
          that.likeItem(id, pid, pic_id)
        } else {
          // 单击事件延时300毫秒执行，这和最初的浏览器的点击300ms延时有点像。
          that.data.lastTapTimeoutFunc = setTimeout(function () {
            that.previewImage(pic_id)
          }, 300);
        }
      }
    },

    likeItem: function (id, pid, pic_id){
      this.triggerEvent('changemelike', { id: id, pid: pid });
    }
  }
})