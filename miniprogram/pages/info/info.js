//获取应用实例
const app = getApp();
const util = require('../../utils/util.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    infodata:{},
    pic_id : 0,
    comment:[],
    commenttip:'评论正在疯狂加载中',
    commentMaxTextLen:60,
    pCommentMaxTextLen:10,
    //说说显示字数
    content:{
      maxlen: 60,
    },
    com_des:false,
    barH: app.globalData.screen.barH,
    isshare : false,
    topageValue: {
      right: 50,
      bottom: 100,
      img: '/public/img/index_blue.png',
      show: true
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //显示转发按钮
    wx.showShareMenu({
      withShareTicket: true
    })
    wx.showLoading({
      title: '数据加载中',
      mask: true,
    });
    let topageshow = options.share?true:false;
    this.setData({
      pic_id: options.id,
      'topageValue.show' : topageshow
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
    this.getInfo();
  },
  getcomment:function(){
    var that = this;
    var comm = [];
    let des = this.data.com_des ? 'esc' : 'desc';
    app.myrequest('https://www.mymmy.cn/wx/tk/commentlist/' + this.data.pic_id + '?des=' + des, 'GET', false, function (res) {
      if (res.code == 0) {
        let data = res.data;
        if (!data.length){
          that.setData({ commenttip: '还没有评论哦，快来抢沙发吧' })
        }
        data = that.resetcomment(data);
        that.setData({ comment: data })
      } else {
        that.setData({ commenttip: '评论获取失败，请稍后重试' })
      }
    })
  },

  getInfo:function(){
    var that = this;
    app.myrequest('https://www.mymmy.cn/wx/tk/info?id=' + this.data.pic_id,'GET',false,function(res){
      if (res.code == 0) {
        let data = res.data;
        // 重新设置图片宽高
        let imgw = app.globalData.screen.screenW;
        let imgh = app.scaleImage(data.pic_width, data.pic_height, imgw);
        data['imgw'] = imgw;
        data['imgh'] = imgh;
        //重新设置链接
        let path = app.getImgPath(data);
        data.url = path.url;
        data.newurl = path.newurl;
        data.ourl = path.ourl;
        //图片存为临时图片
        that.imgtotemp(data.url)
        data.mehost = path.mehost;
        console.log(path)
        //重新设置文字
        let content = util.spliceText(data.pic_content, that.data.content.maxlen);
        if(content != false){
          data.spliceText = content;
        }
        that.setData({'content.showAll':false});
        that.setListData('comment_item', { id: data.pic_id, action: data.comment_count });
        that.setData({
          infodata: data
        });
        wx.hideLoading();
        //加载评论
        that.getcomment();
      } else {
        wx.hideLoading();
        wx.showToast({
          title: '获取失败，请稍候重试',
          icon: 'none',
        });
        setTimeout(function(){
          if(that.data.topageValue.show){
            that.onToIndexPage();
          }else{
            wx.navigateBack({
              delta: 1,
            })
          }
        })

      }
    })
  },
  resetcomment: function(data){
    for (let i = 0; i < data.length;i++){
      //重新设置文字
      let content = util.spliceText(data[i].com_content, this.data.commentMaxTextLen);
      if (content != false) {
        data[i].spliceText = content;
        data[i].showAll = false;
      }
      if (!data[i].pcom){continue;}
      let content2 = util.spliceText(data[i].pcom.com_content, this.data.pCommentMaxTextLen);
      if (content2 != false) {
        data[i].pcom.spliceText = content2;
        data[i].pcom.showAll = false;
      }
    }
    return data;
  },
  getCom:function(com,scomarr,arr){
    for (var i = 0; i < scomarr.length;i++){
      if (com['com_id'] == scomarr[i].com_pid){
        scomarr[i]['to_user_nike'] = com['user_nike'];
        scomarr[i]['to_user_pic'] = com['user_pic'];
        scomarr[i]['ping'] = (com['com_pid'] == 0) ? 1: 0;
        arr.push(scomarr[i]);
        this.getCom(scomarr[i], scomarr, arr)
      }
    }
    return arr;
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
      let data = this.data.up_item || false
      if (data) {
          wx.setStorageSync('up_item', data);
      }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
      wx.getSavedFileList({
          success: function(res) {
              res.fileList.map(item => {
                  wx.removeSavedFile({
                      filePath: item.filePath
                  })
              })
          },
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
  onShareAppMessage: function (ops) {
    var that = this;
    return {
      title: app.globalData.shareText,
      path: '/pages/info/info?id=' + that.data.pic_id+'&share=1',
      success: function (res) {
        app.addShareCount(()=>{
          that.setData({ isshare: true })
        })
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    }
  },

  /**
   * 点赞操作
   */
  onMeLike: function(e){
    wx.showLoading({
      title: '加载中',
      mask: true,
    });
    var that = this;
    let data = this.data.infodata;
    let msg = "";
    app.myrequest('https://www.mymmy.cn/wx/tk/me_thumbs_up?id=' + data.pic_id, 'GET', false, function (res) {
      wx.hideLoading();
      if (res.code == 0) {
        if (data.me_thumbs_up) {
          that.setData({
            'infodata.me_thumbs_up': 0,
            'infodata.up_count': --that.data.infodata.up_count
          });
          msg = '取消点赞成功';
          --app.globalData.userOtherInfo.melike_count;
        } else {
          that.setData({
            'infodata.me_thumbs_up': 1,
            'infodata.up_count': ++that.data.infodata.up_count
          });
          msg = '点赞成功';
          ++app.globalData.userOtherInfo.melike_count;
        }
        that.setListData( 'up_item', { id: data.pic_id, action: res.data });
        //that.setData({ up_item: { id: data.pic_id,action:res.data}})
        wx.showToast({
          title: msg,
          icon: 'success',
        })
      } else {
        wx.showToast({
          title: '点赞失败，请稍后重试',
          icon: 'none',
        })
      }
    })
  },
  setListData: function(action,data){
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    if (!prevPage || (prevPage.route != "pages/case/caselist/caselist" && prevPage.route != 'pages/index/index')){
      return;
    }
    var column = prevPage.data.column;
    prevPage.data.column.map(function(item,index){
      item.list.map((ite,ind)=>{
        if (ite.id == data.id){
          if (action == 'up_item'){
            if(data.action == 'a'){
              ++column[index]['list'][ind]['up_count'];
              column[index]['list'][ind]['melike'] = 1
            }else{
              --column[index]['list'][ind]['up_count'];
              column[index]['list'][ind]['melike'] = 0
            }
          } else if (action == 'comment_item'){
             column[index]['list'][ind]['comment_count'] = data.action;
          }
        }
      })
    })
    prevPage.setData({ column: column})
  },
  /**
   * 说说文字 显示和隐藏
   */
  onConTextAll: function(e){
    this.setData({ 'content.showAll': !this.data.content.showAll })
  },
  /**
   * 
   */
  onComTextAll:function(e){
    console.log(e)
    let who = e.currentTarget.dataset.who;
    let index = e.currentTarget.dataset.index;
    if(who==1){
      //其他
      let key = 'comment[' + index + '].pcom.showAll';
      this.setData({
        [key]: !this.data.comment[index].pcom.showAll
      })
    }else{
      let key = 'comment[' + index + '].showAll';
      this.setData({
        [key]: !this.data.comment[index].showAll
      })
    }
  },
  changeDes:function(e){
    let des = this.data.com_des;
    this.setData({ com_des: !des});
    wx.showLoading({
      title: '数据加载中',
      mask: true,
    });
    this.getcomment();
  },
  preview:function(e){
    let ourl = this.data.infodata.ourl;
    //let ourl = this.data.infodata.url.split('?url=')[1];
    let temp = this.data.tempImgUrl;
    let w = this.data.infodata.imgw;
    let h = this.data.infodata.imgh;
    let mehost = this.data.infodata.mehost;
    let isshare = Number(this.data.isshare);
    let pic_id = this.data.pic_id;
    if(!temp){return;}
    wx.navigateTo({
      url: '/picInfoPack/pages/info/preview/preview?ourl=' + ourl + '&temp=' + temp + '&w=' + w + '&h=' + h + '&mehost=' + mehost + '&isshare=' + isshare +'&pic_id='+pic_id,
    })
  },
  /**
   * 将图片存为临时图片
   */
  imgtotemp: function(url){
    var that = this;
    wx.downloadFile({
      url: url,
      header: {},
      success: function(res) {
        wx.saveFile({
          tempFilePath: res.tempFilePath,
          success: function (res) {
              setTimeout(function(){
                  that.setData({ 'tempImgUrl': res.savedFilePath })
              },500)
            
          },
          fail: function (res) {
            wx.showToast({
              title: '图片加载失败',
              icon: 'none',
            });
            wx.getSavedFileList({
              success: function(res) {
                console.log(res);
                
              },
            })
            
          },
          complete: function (res) { },
        })
      },
      fail: function(res) {
        wx.showToast({
          title: '图片加载失败',
          icon: 'none',
        });
      },
      complete: function(res) {},
    })
  },
  /**
   * 返回回调
   */
  onToIndexPage:function(){
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
})