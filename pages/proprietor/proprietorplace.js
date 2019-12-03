const app = getApp()
var utils = require("../../utils/util.js");
var datajson = require("../../utils/datas.js");
Page({
  data: {
    placearray:[],
    placename:""
  },
  onLoad: function (options) {
    this.setData({
      placearray: datajson.getPlaceData()
    });
  },
  checkboxChange: function (e) {
    var temparr=e.detail.value
    var temp="";
    for (var i = 0; i < temparr.length;i++){
      if (i == temparr.length-1){
        temp += temparr[i]
      }else{
        temp += temparr[i]+","
      }
    }
    this.setData({
      placename: temp
    })
    console.log(this.data.placename)
  },
  backproupdate(){
    wx.setStorageSync('placename', this.data.placename)
    wx.navigateBack({
      delta: 1
    })
  }
})