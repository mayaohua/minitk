const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    img:null,
    isshare:false,
    shuiurl:'/public/img/minit.jpg',
    shuisize:[50,50],
    downloadPercent: '高清下载中 0 %',
    showTopTips:true,
    tipbgcolor:'skyblue',
    pic_id:0,
    topageValue: {
        right: 100,
        bottom: 100,
        img: '/public/img/down_blue.png',
        show: false
    }
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '',
    })
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#000000',
    });
    wx.hideTabBar({});
    let url = (options.mehost==1 ? app.globalData.imghost : app.globalData.fangdaourl) + options.ourl;
    let img = {
      w : options.w,
      h : options.h,
      mehost: options.mehost,
      url: url,
      temp:options.temp,
    }
    let isshare = options.isshare == 0?false:true;
    if (app.globalData.userOtherInfo.share_count >= app.globalData.minshare) { isshare = true;}
    this.setData({ img: img, isshare: isshare, pic_id: options.pic_id});
    this.loadimg();
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
      this.globalData.imgTask.abort();
      let that = this;
      wx.removeSavedFile({
          filePath: this.data.tempImgUrl
      })
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
  onShareAppMessage: function () {
  
  },
  /**
   * 加载图片
   */
  loadimg:function(){
    var that = this;
    //获取图片详细信息
    const imgTask = wx.downloadFile({
      url: this.data.img.url,
      success: (res)=> {
        this.drawImg(res.tempFilePath);
      },
      fail: function(res) {
        that.setData({
          downloadPercent: '高清图片下载失败',   //toFixed(2)取小数点后两位，更新wxml中progress组件的进度值
          tipbgcolor: 'red',
          showTopTips: true,
          "topageValue.show":true,
        });
        setTimeout(() => {
          that.setData({ showTopTips: false })
        }, 2000)
      }
    })
    this.globalData.imgTask = imgTask;
    typeof cb == "function" && cb(this.globalData.imgTask)
    imgTask.onProgressUpdate((res) => {
      var size = ((res.totalBytesWritten / res.totalBytesExpectedToWrite) * 100).toFixed(0);
      var showTopTips = size >= 100?false:true;
      this.setData({
        downloadPercent: '高清下载中 ' + size+' %',
        showTopTips: showTopTips,
      });
    //   if(!showTopTips){
    //     if (!wx.getStorageSync('saveimgtip') || wx.getStorageSync('saveimgtip') < 2) {
    //       wx.showToast({
    //         title: '长按图片即可保存',
    //         icon: 'none',
    //         duration:2000,
    //         mask: true,
    //         success: function (res) {
    //           let count = wx.getStorageSync('saveimgtip') || 0;
    //           wx.setStorageSync('saveimgtip', ++count);
    //         },
    //       })
    //     }
    //   }
    })
  },
  /**
   * 绘制图片
   */
  drawImg :function(imgpath){
    let date =new Date();
    var that = this;
    let ctx = wx.createCanvasContext('firstCanvas');
    //将图片src放到cancas内，宽高为图片大小
    let w = parseInt(this.data.img.w);
    let h = parseInt(this.data.img.h);
    ctx.drawImage(imgpath, 0, 0, w, h);
     //将声明的时间放入canvas
    ctx.drawImage(this.data.shuiurl, this.data.img.w - this.data.shuisize[0], this.data.img.h - this.data.shuisize[1], this.data.shuisize[0], this.data.shuisize[1]);
    ctx.draw(true, function(){
        that.setImgFilePath(imgpath);
    });
  },
  setImgFilePath:function(imgpath){
    var that = this;
    wx.canvasToTempFilePath({
      canvasId: 'firstCanvas',
      fileType: 'jpg',
      success: (res) => {
        this.setData({
          downloadPath: res.tempFilePath,
          "topageValue.show": true,
        })
          console.log(res.tempFilePath)
          that.imgtotemp(imgpath);
        if (!that.data.isshare && app.globalData.userOtherInfo.share_count < app.globalData.minshare){
            that.setData({
                downloadPercent: '点击右上角转发后即可下载高清无水印图片',
                tipbgcolor: 'skyblue',
                showTopTips: true,
            })
        }
      },
      fail: (e) => {
        that.setData({
          downloadPercent: '高清图片下载失败',   //toFixed(2)取小数点后两位，更新wxml中progress组件的进度值
          tipbgcolor:'red',
          showTopTips: true,
          "topageValue.show": true,
        });
        setTimeout(() => {
          that.setData({ showTopTips: false })
        }, 2000)
      },
    })
  },


  saveimage:function(){
    var that = this;
    var file = this.data.isshare ? (this.data.tempImgUrl || this.data.img.temp) : (this.data.downloadPath || this.data.img.temp);
      console.log(file)
    wx.saveImageToPhotosAlbum({
      filePath: file,
      success: function(res) {
        console.log(res)
      },
      fail: function(res) {
        that.setData({
          downloadPercent: '保存图片失败,请开启保存权限',   //toFixed(2)取小数点后两位，更新wxml中progress组件的进度值
          tipbgcolor: 'red',
          showTopTips: true,
        });
        setTimeout(() => {
          that.setData({ showTopTips: false })
        }, 2000)
      },
      complete: function(res) {
        that.setData({
          actionSheetHidden: !that.data.actionSheetHidden
        })
      },
    })
  },
  /**
   * 分享按钮
   */
  shareimage:function(){
    // this.setData({
    //   actionSheetHidden: !this.data.actionSheetHidden
    // })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (ops) {
    if (ops.from === 'button') {
      // 来自页面内转发按钮
      console.log(ops.target)
    }
    var that = this;
    let pic_id = this.data.pic_id;
    let img = this.data.tempImgUrl;
    return {
      title: app.globalData.shareText,
      path: '/pages/info/info?id=' + pic_id+'&share=1',
      imageUrl: img,
      success: function (res) {
        app.addShareCount(() => {
          that.setData({ isshare: true })
          var pages = getCurrentPages();
          var currPage = pages[pages.length - 1];
          var lastpage = pages[pages.length - 2];
          lastpage.setData({ isshare: true })
          that.setData({
            downloadPercent: '',
            tipbgcolor: 'red',
            showTopTips: false,
          });
        })
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
        wx.showToast({
          title: '转发失败',
          icon: 'none',
        });
      }
    }
  },
  globalData:{
    imgTask:null
  },
  /**
   * 打开操作选项
   */
  openAction: function () {
    var that = this;
    wx.showActionSheet({
      itemList: ['保存图片'],
      success: function (res) {
        console.log(res)
        if (!res.cancel) {
          if (res.tapIndex == 0){
            that.saveimage();
          }
        }
      }
    });
  },
  /**
   * 将图片存为临时图片
   */
  imgtotemp: function (url) {
    var that = this;
    wx.saveFile({
      tempFilePath: url,
      success: function (res) {
        that.setData({ 'tempImgUrl': res.savedFilePath })
      },
      fail: function (res) {
        wx.showToast({
          title: '图片下载失败',
          icon: 'none',
        })
      },
      complete: function (res) { },
    })
  },
  /**
   * 预览图片
   */
  prevImg:function(){
   
    // let url = this.data.isshare ? (this.data.tempImgUrl || this.data.img.temp)  : (this.data.downloadPath || this.data.img.temp);
    // wx.previewImage({
    //   current: url,
    //   urls: [url],
    //   success: function(res) {

    //   },
    // })
  }
})