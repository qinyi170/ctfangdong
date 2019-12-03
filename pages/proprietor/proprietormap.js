const app = getApp()
var utils = require("../../utils/util.js");
Page({
  onReady: function (e) {
    this.mapCtx = wx.createMapContext('myMap');//获取地图对象同canvas相似，获取后才能调用相应的方法
    this.mapCtx.moveToLocation()//将当前位置移动到地图中心

  },
  bindregionchange:function(){
    this.mapCtx.getCenterLocation({
      success: function (res) {
        console.log(res)
        console.log(res.longitude)
        console.log(res.latitude)
      }
    })
  },
  openLocation: function () {
    wx.getLocation({
      type: 'gcj02', // 返回可以用于wx.openLocation的经纬度
      success(res) {
        const latitude = res.latitude
        const longitude = res.longitude
        wx.openLocation({
          latitude,
          longitude,
          scale: 18
        })
      }
    })
  },
  getLocation: function () {
    wx.getLocation({
      success: function(res) {
        console.log(res)
      },
    })
  },
  chooseLocation:function(){
    wx.chooseLocation({
      success: function(res) {
        console.log(res)
      },
    })
  }
})