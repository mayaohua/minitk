const app = getApp();
const util = require('../../utils/util.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    msgtype:1,
    page: 1,
    limit: 10,
      requestURL: 'usermsg',
    items: [],
    loadmore: 'loading',
    loadover: true,
    hasMore: 1,
    maxlen: 80,
    com_desc: true,
    comment_count: 0,
    is_read:false,
    isLogin:false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let isLogin = app.globalData.userInfo ? true : false;
      if (app.globalData.userOtherInfo) {
          this.setData({
              isLogin: isLogin,
          })
      } else {
          this.setData({
              isLogin: isLogin,
          })
      }
  },

    onGetUserInfo: function (e) {
        if (e.detail.errMsg == 'getUserInfo:ok') {
            wx.showLoading({
                title: '用户授权中',
            })
            wx.setStorage({
                key: 'userInfo',
                data: JSON.parse(e.detail.rawData),
                success: function (res) {
                    wx.hideLoading();
                    wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        success: function () {
                            setTimeout(() => {
                                app.onSetUserInfo(function (res) {
                                    wx.switchTab({
                                        url: '/pages/setting/setting',
                                    })
                                });
                            }, 500)
                        }
                    })
                },
                fail: function (res) {
                    console.log(res)
                },
            })
        } else {
            wx.showToast({
                title: '授权失败',
                icon: 'none',
            })
        }
    },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      wx.startPullDownRefresh({
          success: function (res) {
              wx.stopPullDownRefresh();
          },
          fail: function (res) { },
          complete: function (res) {
          },
      });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    let is_read = this.data.items.length>0?true:false;
    this.setData({ items: [], page: 1, hasMore: 1, is_read: is_read });
    this.getDataList(() => {
      wx.stopPullDownRefresh();
      this.setData({ loadover: true })
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getDataList(() => {
      this.setData({ loadover: true })
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (ops) {
    var that = this;
    return {
      title: app.globalData.shareText,
      path: '/pages/index/index',
      success: function (res) {
        app.addShareCount()
      },
      fail: function (res) {

      }
    }
  },

  /**
   * 获取数据
   */
  getDataList: function (callback) {
    if (!this.data.loadover || !this.data.hasMore) { return false; }
    let self = this;
    self.setData({ loadmore: 'loading', loadover: false });
      app.myrequest(this.data.requestURL + '?page=' + this.data.page + '&limit=' + this.data.limit + '&desc=' + Number(this.data.com_desc) + '&is_read=' + Number(this.data.is_read), 'GET', false, function (res) {
      if (res.code == 0) {
        let loadmore = res.data.hasMore == 1 ? 'over' : 'nomore';
        let oitems = self.data.items;
        let newdata = self.resetData(res.data.list);
        let item = oitems.concat(newdata);
        let page = res.data.hasMore == 1 ? ++self.data.page : self.data.page;
          self.setData({ items: item, loadmore: loadmore, page: page, hasMore: res.data.hasMore, comment_count: res.data.count, is_read: false });
        callback && callback();
      } else {
        let loadmore = 'fail';
          self.setData({ loadmore: loadmore, is_read:false });
        callback && callback();
      }
    }, error => {
      let loadmore = 'fail';
      self.setData({ loadmore: loadmore });
      callback && callback();
    });
  },
  /**
   * 点击重试
   */
  onRetry: function (e) {
    this.getDataList(() => {
      this.setData({ loadover: true })
    });
  },
  resetData: function (data) {
    //let maxlen = this.data.maxlen;
    return data.map((item) => {
        item.msg_content = JSON.parse(item.msg_content);
        if(item.msg_type!=1){
            //重新设置链接
            let path = app.getImgPath(item.msg_content,'30');
            item.msg_content.url = path.url;
            item.msg_content.newurl = path.newurl;
            item.msg_content.ourl = path.ourl;
        }
      return item;
    })
  },
  onComTextAll: function (e) {
    let who = e.currentTarget.dataset.who;
    let index = e.currentTarget.dataset.index;
    let key = 'items[' + index + '].showAll';
    this.setData({
      [key]: !this.data.items[index].showAll
    })
  },
  changeDesc: function (e) {
    let desc = this.data.com_desc;
    this.setData({ com_desc: !desc });
    this.setData({ items: [], page: 1, hasMore: 1 });
    this.getDataList(() => {
      wx.stopPullDownRefresh();
      this.setData({ loadover: true })
    });
  },
  changeMsgType:function(e){
    let msgtype = e.currentTarget.dataset.type;
    if (msgtype != this.data.msgtype){
      this.setData({ msgtype: msgtype });
      this.setData({ items: [], page: 1, hasMore: 1 });
      this.getDataList(() => {
        wx.stopPullDownRefresh();
        this.setData({ loadover: true })
      });
    }
  }
})