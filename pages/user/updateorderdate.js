const app = getApp()
var utils = require("../../utils/util.js");
Page({
  data: {
    orderDateArr: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"],
    orderBeginDateIndex:"14",
    orderEndDateIndex: "12",
  },
  onLoad: function (options) {
    this.active();
  },
  active(){
    var athis = this;
    utils.showLoading("请稍等")
    utils.request1("/weboperate/queryResideTime", {
      "skey": app.globalData.skey
    }, function (e) {
      console.log(e)
      wx.hideLoading();
      if (e.data.result == "0") {
        athis.setData({
          orderBeginDateIndex: e.data.dataObject[0].reside_date,
          orderEndDateIndex: e.data.dataObject[0].retreate_date
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
  changeBeginDate(e) {
    this.setData({
      orderBeginDateIndex: e.detail.value
    })
  },
  changeEndDate(e) {
    this.setData({
      orderEndDateIndex: e.detail.value
    })
  },
  saveOrderDate(){
    utils.showLoading("请稍等")
    utils.request1("/weboperate/saveResideTime", {
      "skey": app.globalData.skey,
      "reside_date": this.data.orderBeginDateIndex,
      "retreate_date": this.data.orderEndDateIndex
    }, function (e) {
      wx.hideLoading();
      if (e.data.result == "0") {
        wx.showToast({
          title: "修改成功",
          icon: "none",
        });
        setTimeout(function () {
          wx.switchTab({
            url: '../user/user',
          })
        }, 1500)
      } else if (e.data.result == "2") {
        utils.alertView("提示", "你已退出，请点击“确认”重新登录", function () {
          app.getLogin();
        })
      } else {
        utils.alertViewNosucces("提示", e.data.message + " ", false);
      }
    })
  }
})