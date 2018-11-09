// components/scrolltop.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    toPageValue:{
      type: Object,
      value: {
        right:50,
        bottom:50,
        img:'/public/img/index_blue.png',
        show:true,
      }
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
    onToPage:function(){
      this.triggerEvent('toPageBack', true);
    }
  }
})
