
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    maxwordlen:200,
    wordlen:0,
    content : '',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isLogin:false,
    share_count:0,
    share_count_min:0,
    melike_count:0,
    mecomment_count:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
    let isLogin = app.globalData.userInfo ? true : false;
    if (app.globalData.userOtherInfo){
      this.setData({
        isLogin: isLogin,
        share_count: app.globalData.userOtherInfo.share_count || 0,
        share_count_min: app.globalData.minshare || 0,
        melike_count: app.globalData.userOtherInfo.melike_count || 0,
        mecomment_count: app.globalData.userOtherInfo.mecomment_count || 0
      })
    }else{
      this.setData({
        isLogin: isLogin,
      })
    }
    
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
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
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

  formSubmit: function(e) {
    var that = this;
    let content = e.detail.value.content.trim()
    if (content.length==0){
      return false;
    }
    wx.showToast({
      title: '请稍候',
      icon: 'loading',
    });
    wx.request({
      url: 'msg',
      method: "POST",
      data: {
        content : content
      },
      success:(res)=>{
        wx.hideLoading()
        if (res.data.code == 0){
          wx.showToast({
            title: '提交成功',
            duration: 3000
          });
        }else{
          wx.showToast({
            title: '提交失败',
            duration: 3000
          });
        }
      },
      fail : (error)=>{
        wx.hideLoading()
        wx.showToast({
          title: '提交失败',
          duration: 3000
        });
      },
      complete: ()=>{
        that.setData({
          content:'',
          wordlen:0
        })
      }
    })
  },
  bindWordLimit: function(e){
    var newdlen = e.detail.value.length;
    this.setData({
      wordlen: newdlen
    })
  },
  clearStro: function(e) { 
    wx.showLoading({
      title: '缓存清除中',
      mask: true,
      success: function(res) {
        let info = wx.getStorageInfoSync();
        info.keys.map(item => {
          if (item != 'user_token' && item != "userInfo") {
            wx.removeStorageSync(item);
          }
        })
        wx.getSavedFileList({
            success: function (res) {
                res.fileList.map(item => {
                    wx.removeSavedFile({
                        filePath: item.filePath
                    })
                })
            },
        })
      },
    })
    wx.showToast({
      title: '清除完毕',
      icon: 'success',
    })
  },
  onGetUserInfo: function(e) {
    var that = this;
    if (e.detail.errMsg == 'getUserInfo:ok') {
      wx.setStorage({
        key: 'userInfo',
        data: JSON.parse(e.detail.rawData),
        success: function(res) {
          app.onSetUserInfo();
          setTimeout(function(){
            that.setData({
              isLogin: true,
            })
          })
        },
        fail: function(res) {
          console.log(res)
        },
      });
    }else{
      wx.showToast({
        title: '授权失败',
        icon: 'none',
      })
    }
  },
  onHide:function(){
    
  },
  /**
   * 我的喜欢
   */
  onToMeLike: function(e){
    if (!app.userActionBefore()) { return; }
    wx.navigateTo({
      url: '/settingPack/pages/setting/melike/melike',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  /**
   * 我的喜欢
   */
  onToMeComment: function (e) {
    if (!app.userActionBefore()) { return; }
    wx.navigateTo({
      url: '/settingPack/pages/setting/mecomment/mecomment',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  }
})