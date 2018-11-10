const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    uploadpath:null,
    dis:false,
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
   * 选择反馈图片
   */
  uploadImg:function(e){
    let that = this;
    wx.chooseImage({
      count: 1,
      sizeType: [],
      sourceType: [],
      success: function(res) {
        console.log(res);
        that.setData({
          uploadpath: res.tempFilePaths[0]
        })
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  /**
   * 提交内容
   */
  onsub:function(e){
     let content = e.detail.value.content.trim();
    if (content.length < 5){
       wx.showToast({
         title: '建议反馈内容最少5个字符',
         icon: 'none'
       });
       return false;
     }
    //上传图片
    // if (this.data.uploadpath){
    //   let pic = this.data.uploadpath;
    // }
    var that = this ;
    that.setData({ dis: true });
    wx.showLoading({
      title: '正在提交',
    })
    app.myrequest('usertalk', 'POST',{
      content: content,
      contact: e.detail.value.contact.trim(),
    }, function (res) {
      if (res.code == 0) {
        wx.showToast({
          title: '感谢反馈',
          icon: 'success'
        });
       setTimeout(()=>{
         wx.navigateBack({
           delta: 1,
         })
       },1500);
      } else {
        that.setData({ dis: false })
        wx.showToast({
          title: '提交失败，请稍后重试',
          icon: 'none'
        });
      }
    },()=>{
      that.setData({dis:false})
    })
  }
})