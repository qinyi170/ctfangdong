const app = getApp()
var utils = require("../../utils/util.js");
Page({
  data:{
    roominfo:{},
    nethouseid:""
  },
  onLoad: function (e) {
    this.setData({
      nethouseid: e.nethouseid
    })
  },
  onReady:function (e) {
    this.roommsg(this.data.nethouseid);
  },
  //获取房源列表
  roommsg: function (data) {
    var athis = this;
    utils.showLoading("请稍等")
    utils.request1("/weboperate/queryNetHouseById", {
      "skey": app.globalData.skey,
      "net_house_id": data
    }, function (e) {
      console.log(e)
      wx.hideLoading();
      if (e.data.result == "0") {
        var templist = e.data.dataObject;
        athis.setData({
          roomInfo: templist,
          tiems: e.data.dataObject.start_date.substring(0, 10) + "～" + e.data.dataObject.stop_date.substring(0, 10)
        })
        
      } else if (e.data.result == "2") {
        utils.alertView("提示", "你已退出，请点击“确认”重新登录", function () {
          app.getLogin();
        })
      } else {
        utils.alertViewNosucces("提示", e.data.message + " ", false);
      }
    })
  },
  previewImage: function (e) {
    var athis = this
    var aa = wx.getFileSystemManager();
    aa.writeFile({
      filePath: wx.env.USER_DATA_PATH + '/orderqrcode.png',
      data: e.currentTarget.dataset.src,
      encoding: 'base64',
      success: res => {
        wx.previewImage({
          current: wx.env.USER_DATA_PATH + '/orderqrcode.png',
          urls: [wx.env.USER_DATA_PATH + '/orderqrcode.png']
        })
      }, fail: err => {
        console.log(err)
      }
    })
  },
  updateroom:function(e){
    wx.navigateTo({
      url: '../room/roomupdate?nethouseid=' + this.data.nethouseid +"&ischeck="+e.target.dataset.ischeck,
    })
  },
  deleteroom:function(){
    var athis = this;
    wx.showModal({
      title: '提示',
      content: '删除房源时将同时删除与该房源相关的订单，确定要删除该房源？',
      success(res) {
        if (res.confirm) {
          utils.showLoading("请稍等")
          utils.request1("/weboperate/deleteNetHouseById", {
            "net_house_id": athis.data.nethouseid,
            "skey": app.globalData.skey
          }, function (res1) {
            wx.hideLoading()
            if (res1.data.result == "0") {
              wx.showToast({
                title: "删除成功",
                icon: "none",
              });
              setTimeout(function () {
                wx.switchTab({
                  url: '../room/roomlist',
                })
              }, 1500)
            } else {
              if (!res1.data.result) {
                utils.alertViewNosucces("提示", "服务未响应，请稍后再试", false);
                return;
              }
              utils.alertViewNosucces("提示", res1.data.message + "", false);
            }
          })
        }
      }
    })
  },
  auditingroom(e){
    var tempstr ="确定要将该房源提交审核？"
    if (e.target.dataset.cid=="1"){
      tempstr ="确定要再次提交审核？"
    }
    var athis = this;
    wx.showModal({
      title: '提示',
      content: tempstr,
      success(res) {
        if (res.confirm) {
          utils.showLoading("请稍等")
          utils.request1("/weboperate/reportHouseState", {
            "net_house_id": athis.data.nethouseid,
            "skey": app.globalData.skey
          }, function (res1) {
            wx.hideLoading()
            if (res1.data.result == "0") {
              wx.showToast({
                title: "房源成功提交审核",
                icon: "none",
              });
              setTimeout(function () {
                wx.switchTab({
                  url: '../room/roomlist',
                })
              }, 1500)
            } else {
              if (!res1.data.result) {
                utils.alertViewNosucces("提示", "服务未响应，请稍后再试", false);
                return;
              }
              utils.alertViewNosucces("提示", res1.data.message + "", false);
            }
          })
        }
      }
    })
  }
})