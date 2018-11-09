// pages/components/loadmore/loadmore.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    index:String
  },

  /**
   * 组件的初始数据
   */
  data: {
    loadmore: {
      none:{show: false,text: '', showtype: 1},
      loading:{ text: "数据加载中", showtype: 1, show: true },
      fail: { text: "获取失败，点击重试", showtype: 2, show: true },
      nomore: { text: "没有更多了", showtype: 2, show: true },
      over: { text: "加载完毕", showtype: 2, show: true },
   },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //点击重试
    onretry:function(){
      if (this.data.index == 'fail'){
        this.triggerEvent('retry', true);
      }
    }
  }
})
