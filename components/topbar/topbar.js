// components/topbar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    bgcolor:String
  },

  /**
   * 组件的初始数据
   */
  data: {
    topBarH: getApp().globalData.screen.topBarH,
    title:'消息',
    lineH:  getApp().globalData.screen.topBarH - getApp().globalData.screen.barH,
    imgw: getApp().globalData.screen.topBarH - getApp().globalData.screen.barH-10,
    imgh: getApp().globalData.screen.topBarH - getApp().globalData.screen.barH-10,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    back:function(e){
      wx.navigateBack({
        delta: 1,
      })
    }
  }
})
