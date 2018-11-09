//app.js
App({
  onLaunch: function () {
    wx.onUserCaptureScreen(function (res) {
      console.log(res)
    //   wx.showToast({
    //     title: '用户截屏了',
    //     icon: 'none',
    //   })
    })
    //获取设备信息
    this.getSySinfo();
    //删除临时返回页面
    this.globalData.action_data = null;
    //wx.clearStorage();
    typeof cb == "function" && cb(this.globalData.action_data);
    this.login();
  },
  /**
   * 全局数据
   */
  globalData: {
    userInfo: null,
    user_token: null,
    screen: {},
    fangdaourl: 'https://www.mymmy.cn/wx/tk/showimg?url=',
    action_data: false,
    userOtherInfo: null,
    minshare: 20,
  },
  /**
   * 获取设备信息
   */
  getSySinfo: function () {
    wx.getSystemInfo({
      success: res => {
        console.log(res)
        //获取屏幕的宽度
        this.globalData.screen = {
          screenW: res.screenWidth,
          screenH: res.screenHeight,
          wW:res.windowWidth,
          wH:res.windowHeight,
        }
      }
    })
  },
  /**
   * 登录
   */
  login: function () {
    // 获取用户openid
    this.globalData.user_token = wx.getStorageSync('user_token') || null;
    typeof cb == "function" && cb(this.globalData.user_token)
    if (this.globalData.user_token) {
      //检查用户登录态是否过期
      this.userLogin();
    } else {
      this.getUserOpenId();
    }
  },
  /**
   * 判断用户是否存在登陆态
   */
  userLogin: function () {
    var that = this;
    wx.checkSession({
      success: function () {
        //获取并更新用户资料
        that.onSetUserInfo();
      },
      fail: function () {
        //不存在登陆态
        console.log('用户登陆态不存在了重新获取，正在登陆获取');
        wx.removeStorageSync('user_token');
        that.globalData.user_token = null;
        that.login();
      }
    })
  },
  /**
   * 获取用户openid
   */
  getUserOpenId: function () {
    wx.showLoading({
      title: '登录中',
    });
    var that = this;
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          //发起网络请求
          wx.request({
            url: 'https://www.mymmy.cn/wx/tk/login?code=' + res.code,
            data: {},
            success: function (result) {
              console.log('登录成功');
              wx.setStorageSync('user_token', result.data.data.user_token);
              that.globalData.user_token = result.data.data.user_token;
              typeof cb == "function" && cb(that.globalData.user_token);
              //重新请求
              let action_data = that.globalData.action_data || null;
              if (action_data && that.globalData.userInfo) {
                let action_name = '';
                let options = [];
                for (let index in action_data){
                  action_name = index;
                  for (let ind in action_data[action_name]) {
                    options.push(action_data[action_name][ind]);
                  }
                }
                wx.showLoading({
                  title: '数据加载中',
                });
                that[action_name].apply(that[action_name],options)
                that.globalData.action_data = null;
                typeof cb == "function" && cb(that.globalData.action_data);
              }
              //获取并更新用户资料
              that.onSetUserInfo();
            }, fail: function () {
              console.log('登录失败');
            }
          })
        } else {
          console.log('小程序登陆失败:' + res.errMsg)
        }
      },fail:error=>{
        console.log(error)
        //that.userLogin();
        console.log('小程序登陆失败:' + error.errMsg)
      }
    });
  },
  /**
   * 获取用户资料
   */
  onSetUserInfo: function (callback) {
    //获取用户openID
    let openid = this.globalData.user_token
    //判断接口是否存在
    var that = this;
    that.globalData.userInfo = wx.getStorageSync('userInfo') || null;
    typeof cb == "function" && cb(that.globalData.userInfo);
    if (that.globalData.userInfo) {
      //保存信息到服务器
      console.log('用户资料获取成功');
      that.saveUserInfoToServer(callback)
    }
  },
  /**
   * 保存信息到服务器
   */
  saveUserInfoToServer: function (callback) {
    wx.showLoading({
      title: '资料更新中',
    });
    //获取临时跳转页面
    var that = this;
    wx.request({
      url: 'https://www.mymmy.cn/wx/tk/user',
      method: 'POST',
      data: {
        user_token: this.globalData.user_token,
        userInfo: this.globalData.userInfo
      },
      success: function (result) {
        if (result.data.code == 0) {
          console.log('同步用户数据成功');
          wx.hideLoading();
          //获取并设置用户分享次数
          that.globalData.userOtherInfo = result.data.data;
          typeof cb == "function" && cb(that.globalData.userOtherInfo);
          callback && callback()
        }else{
          console.error('同步用户数据失败');
            console.log(result)
          
        }
      }, fail: function (e) {
          
        console.error('同步用户数据失败');
      }
    })
  },
  
  /**
   * 判断用户是否权限操作
   */
  userActionBefore: function () {

    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];
    let that = this;
    this.globalData.user_token = wx.getStorageSync('user_token') || null;
    typeof cb == "function" && cb(that.globalData.user_token);
    this.globalData.userInfo = wx.getStorageSync('userInfo') || null;
    typeof cb == "function" && cb(that.globalData.userInfo);

    if (!this.globalData.user_token || !this.globalData.userInfo) {
      if (!that.globalData.user_token) {
        //重新获取
        that.login();
      }
      if (!this.globalData.userInfo){
        wx.showModal({
          title: '登录权限提示',
          content: '检测到您还没有授权，不能进行操作，是否进行授权登录？',
          success: function (res) {
            if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/userbang/userbang'
                })
            } else if (res.cancel) {
              wx.showToast({
                title: '授权失败',
                icon: 'none',
              });
              if (currPage.route == 'pages/info/info') {
                wx.switchTab({
                  url: '/pages/index/index'
                })
              }
            }
          }
        })
      }
      return false;
    } else {
      return true;
    }
  },
  /**
   * 对图片进行等比缩放('设置宽度和高度')
   */
  scaleImage: function (imgW, imgH, width) {
    //设置总体的高度
    var scale = width / imgW;
    var imgH = imgH * scale;
    return imgH;
  },
  getImgPath: function (item,size) {
    let url = "";
    let newurl = "";
    let ourl = "";
    let mehost = 1;
    size = size ? size :'300';
    // if (item.pic_urls == "") {
      var hz = item.pic_photo.split('.').splice(-1);
      var startindex = item.pic_photo.indexOf(hz);
      var path1 = item.pic_photo.substr(0, startindex);
      var path2 = 'thumb.'+size+'_0.' + hz;
      var path = path1 + path2;
      url = this.globalData.fangdaourl + path
      newurl = this.globalData.fangdaourl + item.pic_photo
      ourl = item.pic_photo;
      mehost = 0;
    return { url, newurl, ourl ,mehost }
  },
  myrequest: function (url, method, data, success,fail,check) {
    //保存请求到内存
    let action_data = { 'myrequest': { 'url': url, 'method': method, 'data': data, 'success': success, 'fail': fail, 'check': check} }
    this.globalData.action_data = action_data;
    typeof cb == "function" && cb(this.globalData.action_data);
    //是否需要验证权限
    if(check==undefined){check = true}
    if(check){
      if (!this.userActionBefore()) { return; }
    }
    let usertoken = this.globalData.user_token;
    let that = this;
    let reqdata = (data == false) ? {} : data;
    wx.request({
      url: url,
      method: method,
      data: reqdata,
      header: {
        Authorization: usertoken
      },
      success: res => {
        if (res.data.code == -2) {
          wx.showLoading({
            title: '登录中',
          });
          try{
            wx.removeStorageSync('user_token');
            that.globalData.user_token = null;
            that.login();
          }catch(error){
            console.log(error);
          }
        } else {
          wx.hideLoading();
          success && success(res.data);
        }
      },
      fail: error => {
        wx.hideLoading();
        if (fail){
          fail(error);
        }else{
          wx.showToast({
            title: '数据获取失败，请稍后重试',
            icon: '',
          })
        }
      }
    })
  },
  addShareCount:function(success,fail){
    wx.showLoading({
      title: '分享中',
      mask: true,
    })
    var that = this;
    this.myrequest('https://www.mymmy.cn/wx/tk/share', 'POST', false, function (res) {
      if (res.code == 0) {
        wx.showToast({
          title: '分享成功',
          icon: 'success',
        });
        that.globalData.userOtherInfo.share_count += 1;
        typeof cb == "function" && cb(that.globalData.userOtherInfo.share_count);
        success && success();
      } else {
        console.log(res);
        wx.showToast({
          title: '分享失败',
          icon: 'none',
        });
        fail && fail();
      }
    })


    
  }
})
  //delete from pic_pic_copy where pic_id not in (select minid from (select min(pic_id) as minid from pic_pic_copy group by pic_photo) b);
  //custom