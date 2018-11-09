const app = getApp();
const util = require('../../../../utils/util.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    limit: 10,
    requestURL : 'https://www.mymmy.cn/wx/tk/mecomment',
    items:[],
    loadmore: 'loading',
    loadover:true,
    hasMore:1,
    maxlen:80,
    com_desc: true,
    comment_count:0,
    scrolltopshow:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.startPullDownRefresh({
      success: function(res) {
        wx.stopPullDownRefresh();
      }
    });
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
    this.setData({ items: [], page: 1, hasMore: 1 });
    this.getDataList(() => {
      wx.stopPullDownRefresh();
      this.setData({ loadover:true})
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getDataList(()=>{
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
  getDataList:function(callback){
    if(!this.data.loadover || !this.data.hasMore){return false;}
    let self = this;
    self.setData({ loadmore: 'loading', loadover:false});
    app.myrequest(this.data.requestURL + '?page=' + this.data.page + '&limit=' + this.data.limit + '&desc=' + Number(this.data.com_desc), 'GET', false, function (res) {
      if (res.code == 0){
        let loadmore = res.data.hasMore==1 ? 'over' :'nomore';
        let oitems = self.data.items;
        let newdata = self.resetData(res.data.list);
        let item = oitems.concat(newdata);
        let page = res.data.hasMore == 1 ? ++self.data.page : self.data.page;
        self.setData({ items: item, loadmore: loadmore, page: page, hasMore: res.data.hasMore, comment_count:res.data.count});
        callback && callback();
      }else{
        let loadmore = 'fail';
        self.setData({loadmore: loadmore});
        callback && callback();
      }
    },error=>{
      let loadmore = 'fail';
      self.setData({ loadmore: loadmore });
      callback && callback();
    });
  },
  /**
   * 点击重试
   */
  onRetry: function (e) {
    this.getDataList(() =>{
      this.setData({ loadover: true })
    });
  },
  resetData:function(data){
    let maxlen = this.data.maxlen;
    return data.map((item)=>{
      //重新设置链接
      let path = app.getImgPath(item,30);
      item.url = path.url;
      item.newurl = path.newurl;
      item.ourl = path.ourl;
      var crtTime = new Date(item.com_created_at);
      item.com_created_date = util.formatTime("yyyy年MM月dd日 hh:mm", crtTime);
      //重新设置文字
      let content = util.spliceText(item.com_content,maxlen);
      if (content != false) { item.spliceText = content; item.showAll = false;}
      return item;
    })
  },
  onComTextAll:function(e){
    let who = e.currentTarget.dataset.who;
    let index = e.currentTarget.dataset.index;
    let key = 'items[' + index + '].showAll';
    this.setData({
      [key]: !this.data.items[index].showAll
    })
  },
  changeDesc:function(e){
    let desc = this.data.com_desc;
    this.setData({ com_desc: !desc});
    this.setData({ items: [], page: 1 ,hasMore:1});
    this.getDataList(() => {
      wx.stopPullDownRefresh();
      this.setData({ loadover: true })
    });
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
    setTimeout(()=>{
      wx.startPullDownRefresh({
        success: function (res) {
          wx.stopPullDownRefresh();
        }
      });
    },1000)
  }
})