const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navTitle :'',
    placeText:'',
    disabled:true,
    maxLength:250,
    nowLength:0,
    content:'',
    minLength:4,
    options:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var navTitle = options.pid != 0 ?'回复 '+options.user_nike:'评论动态';
    var placeText = options.pid != 0 ? '@' + options.user_nike+':' : '请输入评论';
    console.log(options)
    wx.setNavigationBarTitle({
      title: options.pid != 0 ? '回复评论' : '评论动态',
    });
    this.setData({
      navTitle: navTitle,
      placeText: placeText,
      options: options,
    })
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
      path:'/pages/index/index',
      success: function (res) {
        app.addShareCount()
      },
      fail: function (res) {

      }
    }
  },

  /**
   * 提交评论
   */
  onSubmit: function(e){
    var content = this.data.content.trim();
    if(content.length<this.data.minLength){
      wx.showToast({
        title: '字数不能少于'+this.data.minLength+'个字',
        icon: 'none'
      });

      this.setData({ content: content, disabled: true });
    }else{
      let requestData = {};
      if (this.data.options.pid == 0){
        requestData.pic_id = this.data.options.pic_id;
        requestData.content = content;
      }else{
        requestData.pid = this.data.options.pid;
        requestData.pic_id = this.data.options.pic_id;
        requestData.content = content;
      }
      wx.showLoading({
        title: '数据加载中',
        mask: true,
      });
      this.setData({
        disabled: true,
      });
      var that = this;
      //提交数据
      app.myrequest('addcomment','POST',requestData, function (res) {
        if (res.code == 0) {
          ++app.globalData.userOtherInfo.mecomment_count;
          wx.showToast({
            title: '评论成功',
            icon: 'success',
            success:function(){
              setTimeout(function(){
                wx.navigateBack();
              },500);
            }
          });
        } else {
          that.setData({
            disabled: false,
          })
          wx.showToast({
            title: res.msg,
            icon: 'none'
          });
        }
      },()=>{
        that.setData({
          disabled: false,
        })
        wx.showToast({
          title: '评论失败，请稍后重试',
          icon: 'none'
        });
      })
    }
  },

  /**
   * 字数检测
   */
  bindWordLimit: function (e) {
    let content = e.detail.value;
    var newdlen = content.length;
    let disabled = false;
    if (newdlen < this.data.minLength){
      disabled = true;
    }
    this.setData({
      content: content,
      nowLength: newdlen,
      disabled: disabled,
    })
  },
})