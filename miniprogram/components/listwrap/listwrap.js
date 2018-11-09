const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    column:{
      type: Array,
      value: [{
        list: [],
        height: 0,
      },
      {
        list: [],
        height: 0,
      },
      ]
    },
    requesturl:{
      type: String,
      value:'https://www.mymmy.cn/wx/tk/tj',
    },
    imgurllist:Array,
    scrolltopshow:Boolean,
    requestAction:{
      type:String,
      observer: function (newVal, oldVal, changedPath) {
        if (newVal != ''){
          if(newVal == "fresh"){
            var tempreqdata = this.data.requestdata
            this.setData({
              requestdata:{
                hasMore: 2018,
                limit: tempreqdata.limit,
                page: 1
              }
            })
          }else{
            if (!this.data.requestdata.hasMore){
              this.callback({ hasMore: 0 });return;
            }
          }
          this.getDataList(newVal)
        }
      }
    }
    
  },
  
  /**
   * 组件的初始数据
   */
  data: {
    requestdata: {
      page: 1,
      limit: 30,
      hasMore: 1,
    },
    screen: {},
    imgurllist:[],
    //防盗链代理地址
    fangdaourl: app.globalData.fangdaourl,
    imghost: app.globalData.imghost,
    animationOption: {
      scale: 0.95,
      maxscale: 1
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 获取原始数据 type:获取最新？加载更多
     */
    getDataList: function (type) {
      var ndata = [];
      var that = this;
      let usertoken = app.globalData.user_token || null;
      app.myrequest(that.data.requesturl + '?page=' + that.data.requestdata.page + '&limit=' +that.data.requestdata.limit, 'GET', false, function (res) {
          if (type == 'fresh') {
            //清空原始数据
            that.clearColumn();
          }
          var hasMore = 0;
          if (res.code == 0) {
            if (res.data.length) {
              ndata = that.requestDataToList(res.data);
              that.setData({ column: ndata });
              //显示数据
              if (res.data.length < that.data.requestdata.limit) {
                hasMore = 0;
              } else {
                hasMore = 1
              }
            }
            var tempreqdata = that.data.requestdata;
            that.setData({ "requestdata.hasMore": hasMore, "requestdata.page": tempreqdata.page + 1 })
            that.callback({ hasMore: hasMore });
            let scrolltip= wx.getStorageSync('scrolltip') || 0;
            scrolltip++;
            if (tempreqdata.page == 4 && scrolltip<=2){
              wx.showToast({
                title: '双击标题栏可到顶部',
                icon: 'none',
                duration:3000,
                success:function(){
                  wx.setStorageSync('scrolltip', scrolltip)
                }
              });
            }
          } else {
            that.callback({ hasMore: 1, error: true });
          }
      },(error)=>{
        that.callback({ hasMore: 1, error: true });
      },false)
    },
    /**
     * 获取玩数据的回调
     */
    callback:function(msg){
      msg.action = this.data.requestAction;
      msg.column = this.data.column;
      this.triggerEvent('callback', msg);
    },
    /**
     * 清除列表数据
     */
    clearColumn: function () {
        let kkk = [];
        this.data.column.map(function (item) {
          kkk.push({
            list: [],
            height: 0
          }) 
        })
        //重新设置请求信息
        var tempreqdata = this.data.requestdata
        this.setData({
          requestdata: {
            hasMore: 1,
            limit: tempreqdata.limit,
            page: 1
          }
        });
        //清空imgurllist
        this.setData({
          column: kkk,
          imgurllist: []
        });
    },

    /**
     * 将请求的原始数据再次封装成可用oldData
     */
    requestDataToList: function (requestData) {
      var that = this;
      let ndata = [];
      let column = this.data.column;
      // requestData.map(function (item) {
      //   let path = app.getImgPath(item);
      //   let imgw = app.globalData.screen.screenW / that.data.column.length;
      //   let imgH = app.scaleImage(item.pic_width, item.pic_height, imgw);
      //   let obj = {
      //     url: path.url,
      //     newurl: path.newurl,
      //     ourl: path.ourl,
      //     //喜欢人数
      //     up_count:item.up_count,
      //     //评论人数
      //     comment_count: item.comment_count,
      //     //自己是否喜欢了
      //     melike: Math.round(item.melike),
      //     id: item.pic_id,
      //     cintent: item.pic_content,
      //     height: imgH,
      //     width: imgw,
      //     classify_name: item.classify_name,
      //     classify_id: item.pic_classify_id,
      //   }
      //   //column = that.data.column;
      //   // let index = that.getIndexByArr(column, 'min', 'height');
      //   let index = that.getmaxscore(column);
      //   column[index].list.push(obj);
      //   //设置总体的高度
      //   column[index].height += obj.height;
      // });
      for (let i = 0; i < requestData.length; i++) {
        let path = app.getImgPath(requestData[i]);
        let imgw = app.globalData.screen.screenW / that.data.column.length;
        let imgH = app.scaleImage(requestData[i].pic_width, requestData[i].pic_height, imgw);
        let obj = {
          url: path.url,
          newurl: path.newurl,
          ourl: path.ourl,
          //喜欢人数
          up_count: requestData[i].up_count,
          //评论人数
          comment_count: requestData[i].comment_count,
          //自己是否喜欢了
          melike: Math.round(requestData[i].melike),
          id: requestData[i].pic_id,
          cintent: requestData[i].pic_content,
          height: imgH,
          width: imgw,
          classify_name: requestData[i].classify_name,
          classify_id: requestData[i].pic_classify_id,
        }
        let index = that.getmaxscore(column);
        column[index].list.push(obj);
        //设置总体的高度
        column[index].height = Math.round(column[index].height) + Math.round(obj.height);
      }
      return column;
    },
    /**
     * 根据数组中制定字段获取最大或最小的一项
     */
    getmaxscore(arrayobj){
      var maxi = 0;
      for (let i = 0;i<arrayobj.length; i++) {
        if (arrayobj[maxi].height > arrayobj[i].height) {
          maxi = i;
        }
      }
      return maxi;
    },
    // getIndexByArr: function (arr, type, where) {
    //   var whereValue = arr[0][where];
    //   var itemIndex = 0;
    //   for (var n = 0; n < arr.length; n++) {
    //     if (type == 'max' && parseInt(arr[n][where]) > whereValue) {
    //       itemIndex = n
    //     } else if (type == 'min' && parseInt(arr[n][where]) < whereValue) {
    //       itemIndex = n
    //     }
    //   }
    //   return itemIndex;
    // },
    /**
     * 创建列表数据
     */
    createColumn: function (item) {
      var listdata = this.data.imgurllist;
      listdata.push(item.newurl)
      this.setData({ imgurllist: listdata });
      var data = this.data.column;
      var index = this.getIndexByArr(data, 'min', 'height');
      data[index].list.push(item);
      //设置总体的高度
      data[index].height += item.height;
      return data;
    },

    /**
     * 改变我的😍
     */
    onChangeMeLike:function(e){
      var obj = e.detail;
      var item = this.data.column[obj.pid].list[obj.id];
      let melike = 1;
      let ilike_count = item.like_count+1;
      if (item.melike){
        melike = 0;
        ilike_count = item.like_count-1;
      }
      var like = "column[" + obj.pid + "].list[" + obj.id + "].melike"
      var like_count = "column[" + obj.pid + "].list[" + obj.id + "].like_count"
      this.setData({
        [like]: melike,
        [like_count]: ilike_count
      })
    },
    /**
   * 回到顶部
   */
    onScrollTopBack: function (e) {
      this.triggerEvent('scrollTopBack', true);
    }
  },
  
})
