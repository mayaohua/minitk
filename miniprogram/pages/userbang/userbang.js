const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo')
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
                  wx.navigateBack();
                });
              },500)
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
})