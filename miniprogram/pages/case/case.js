const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgH : 0,
    showNavIndex:0,
    //防盗链代理地址
    fangdaourl: app.globalData.fangdaourl,
    nav:[
    ],
    tapmsg:'',
    navChlid:[],
    loadmore:'none'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let list = wx.getStorageSync('caselist') || null;
    if (list) { this.setData({ nav: list }); this.changeChild(this.data.nav[0].classify_id) } 
    var that = this;
    wx.startPullDownRefresh({
      success: function (res) {
        that.setData({ loadmore: 'loading' });
      }
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
    var that = this;
    this.getDataList(function (error) {
      wx.hideLoading({
        complete: function () {
          wx.stopPullDownRefresh()
          if (error != undefined) {
            that.setData({ loadmore: 'fail' });
          }else{
            that.setData({ loadmore: 'none' });
            that.changeChild(that.data.nav[0].classify_id);
          }
        }
      })
    })
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
  /**
   * 图片加载完毕
   */
  imageLoad: function(e) {
    // console.log(e);
  },

  /**
   * 左侧导航点击
   */
  changePcase:function(e){
    var cid = e.currentTarget.dataset.cid;
    this.changeChild(cid);
    this.setData({
      showNavIndex : cid
    })
  },

  /**
   * 获取数据
   */
  getDataList: function (callback){
      let that = this;
      app.myrequest('case', 'GET', false, function (res) {
          if (res.code == 0) {
              var data = [];
              data = res.data.map(function (item, index) {
                  var hz = item.classify_icon_url.split('.').splice(-1);
                  var startindex = item.classify_icon_url.indexOf(hz);
                  var path1 = item.classify_icon_url.substr(0, startindex);
                  var path2 = 'thumb.224_0.' + hz;
                  item.classify_icon_url = that.data.fangdaourl + path1 + path2;
                  return item
              })
              that.setData({ nav: data });
              wx.setStorageSync('caselist', data);
              callback();
          } else {
              callback('error');
              that.setData({ nav: [], navChlid: [] });
          }
      },error=>{
          callback('error');
          that.setData({ nav: [], navChlid: [] });
      })
    
  },
  /**
   * 改变子菜单
   */
  changeChild: function(pid){
    var navChlid = [];
    this.setData({ tapmsg: '' })
    navChlid = this.data.nav.filter((item, index) => {
      if (item.classify_pid == pid) {
        return item
      }
    })
    if (!navChlid.length){
      this.setData({tapmsg: '暂无分类'})
    }
    
    this.setData({navChlid: navChlid})
    
  },
  /**
   * 点击重试
   */
  onRetry: function (e) {
    var that = this;
    wx.startPullDownRefresh({
      success: function (res) {
        that.setData({ loadmore: 'loading' });
      }
    })
  }
})