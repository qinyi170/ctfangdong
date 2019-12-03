const app = getApp();
var utils = require("../../utils/util.js");
var timers;
Page({
  data: {
    loadingstate: 1,
    scrollheight: "height:" + app.globalData.pheight + "px"
  },
  onLoad: function (e) {
    this.checkloging();
  },
  onUnload: function () {
    clearTimeout(timers);
  },
  // 登录
  checkloging: function () {
    var athis = this;
    utils.showLoading("请稍等")
    timers = setTimeout(function () {
      wx.hideLoading()
      if (athis.data.loadingstate == 1) {
        utils.alertView("提示", "请求失败，请点击“确定”重新请求", function () {
          athis.checkloging();
        })
      }
    }, 15000)
    wx.login({
      success: res => {
        utils.request("/onLogin", {
          code: res.code
        }, function (e) {
          if (e.data.result == "0") {
            clearTimeout(timers);
            app.globalData.skey = e.data.dataObject.skey;
            utils.request("/queryUserState", {
              "skey": app.globalData.skey
            }, function (e) {
              wx.hideLoading();
              if (e.data.result == "0") {
                if (e.data.dataObject.userState == "enroll") {
                  wx.switchTab({
                    url: '../room/roomlist',
                  })
                }else{
                  wx.redirectTo({
                    url: '../login/login',
                  })
                }
              } else {
                if (!e.data.result) {
                  utils.alertViewNosucces("提示", "服务未响应，请稍后再试", false);
                  return;
                }
                utils.alertViewNosucces("提示", e.data.message + "", false);
              }
            })
          } else if (e.data.result == "2") {
            utils.alertView("提示", "你已退出，请点击“确认”重新登录", function () {
              app.getLogin();
            })
          } else {
            wx.hideLoading();
            if (!e.data.result) {
              utils.alertViewNosucces("提示", "服务未响应，请稍后再试", false);
              return;
            }
            utils.alertViewNosucces("提示", e.data.message + "", false);
          }
        })
      }
    })
  }
})