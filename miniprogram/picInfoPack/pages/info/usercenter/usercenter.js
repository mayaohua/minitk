
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    item:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let user_id = options.id;
    var that = this;
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#8de1ff',
    });
    if (!user_id){
      wx.showToast({
        title: '用户不存在',
        icon: 'none',
        mask: true,
        success: function (res) {
          setTimeout(function () {
            wx.navigateBack({
              delta: 1,
            })
          }, 1000)
        }
      })
    }else{
      app.myrequest('https://www.mymmy.cn/wx/tk/usercenter?user_id=' + user_id, 'GET', false, function (res) {
        if (res.code == 0) {
          that.setData({ item: res.data })
        } else {
          wx.showToast({
            title: '用户不存在',
            icon: 'none',
            mask: true,
            success: function (res) {
              setTimeout(function () {
                wx.navigateBack({
                  delta: 1,
                })
              },1000)
            }
          })
        }
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
  onHide: function () {

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
})