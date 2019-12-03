const app = getApp()
var utils = require("../../utils/util.js");
Page({
  formSubmit: function (e) {
    var formval = e.detail.value;
    formval.skey = app.globalData.skey;
    console.log(formval)
    if (formval.account==""){
      utils.showSuccess("请输入手机号信息", 1500, "none");
      return;
    }
    if (!(/^1[3456789]\d{9}$/.test(formval.account))) {
      utils.showSuccess("子账号格式错误", 1500, "none");
      return;
    } 
    if (formval.userpwd == "") {
      utils.showSuccess("请输入密码信息", 1500, "none");
      return;
    }
    utils.showLoading("请稍等")
    utils.request("/testLogin", formval, function (e) {
      console.log(e)
      wx.hideLoading();
      if (e.data.result == "0") {
        utils.request1("/login/smsCode", {
          type: "3",
          username: formval.account
        }, function (eee) {
          wx.hideLoading();
          if (eee.data.result == "0") {
            var tempe = eee.data.dataObject;
            app.globalData.pcloginstate = tempe;
            if (tempe.isinfo == 1) {
              athis.goinvite(tempe);
            } else {
              wx.switchTab({
                url: '../calendar/index',
              })
            }
          }
        })
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