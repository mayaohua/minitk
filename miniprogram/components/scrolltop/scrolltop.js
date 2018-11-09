// components/scrolltop.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    scrollTopShow:{
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onScrollTop:function(){
      var that = this;
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 500,
      });
      setTimeout(()=>{
        that.triggerEvent('scrollTopBack', true);
      });
    }
  }
})
