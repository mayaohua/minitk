
//获取应用实例
const app = getApp()
Page({
  data: {
    column: [{
      list: [],
      height: 0,
    },
    {
      list: [],
      height: 0,
    }
    ],
    cid:0,
    requesturl: 'caselist/',
    requestAction: '', //load fresh
    loadmore: 'loading',
    scrolltopshow:false,
  },
  onLoad: function (options) {
    var that = this;
    let list = wx.getStorageSync('list' + options.cid) || null;
    if (list) { this.setData({ column: list }) } else { wx.startPullDownRefresh();}
    wx.setNavigationBarTitle({
      title: options.case_name
    })
    that.setData({
      requesturl: that.data.requesturl + options.cid,
      cid: options.cid
    });
  },
  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    if (this.data.requestAction != "") { return false; }
    this.setData({ loadmore: 'loading' })
    this.setData({ requestAction: "fresh" });
  },
  /**
   * 上拉加载
   */
  onReachBottom: function () {
    var that = this;
    //判断上一次请求是否加载完成了
    if (this.data.requestAction != "") { return false; }
    this.setData({ loadmore: 'loading' })
    this.setData({ requestAction: "load" });
  },
  onReqBack: function (e) {
    var msg = e.detail;
    var that = this;
    this.setData({
      requestAction: '',
      column: msg.column
    });
    wx.setStorageSync('list'+that.data.cid, msg.column);
    if (msg.action == 'fresh') {
      wx.hideLoading({
        complete: function () {
          wx.stopPullDownRefresh();
        }
      })
    }
    if (msg.error) {
      that.setData({ loadmore: 'fail' })
    } else {
      if (msg.hasMore) {
        that.setData({ loadmore: 'over' })
      } else {
        that.setData({ loadmore: 'nomore' })
      }
    }
  },
  /**
   * 点击重试
   */
  onRetry: function (e) {
    if (this.data.requestAction != "") { return false; }
    this.setData({ loadmore: 'loading' })
    this.setData({ requestAction: "load" });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (ops) {
    var that = this;
    return {
      title: app.globalData.shareText,
      success: function (res) {
        app.addShareCount()
      },
      fail: function (res) {
        
      }
    }
  },
  // 监听滚动条坐标
  onPageScroll: function (e) {
    var that = this
    var scrollTop = e.scrollTop
    var scrolltopshow = scrollTop > 500 ? true : false
    this.setData({
      scrolltopshow: scrolltopshow
    })
  },
  /**
   * 滚动回调
   */
  onScrollTopBack: function (e) {
    setTimeout(() => {
      wx.startPullDownRefresh();
    }, 1000)
  }
})