const app = getApp()
var utils = require("../../utils/util.js");
Page({
  data: {
    net_house_id:"",
    lock_brand:"",
    username:"",
    uaserpassword:""
  },
  onLoad: function (options) {
    console.log(options)
    this.setData({
      net_house_id: options.nethouseid,
      lock_brand: options.lockbrand
    })
  },
  //获取门锁帐号
  getusername: function (e) {
    this.setData({
      username: e.detail.value
    })
  },
  //获取门锁密码
  getuserpass: function (e) {
    this.setData({
      uaserpassword: e.detail.value
    })
  },
  gosrarchlock:function(){
    var athis = this;
    if (athis.data.username == "") {
      utils.showSuccess("请输入手机号", 2000, "none");
      return;
    }
    if (athis.data.uaserpassword == "") {
      utils.showSuccess("请输入密码", 2000, "none");
      return;
    }
    utils.showLoading("请稍等")
    utils.request1("/weboperate/bindOperate", {
      "skey": app.globalData.skey,
      "net_house_id": athis.data.net_house_id,
      "userName": athis.data.username,
      "password": athis.data.uaserpassword,
      "lock_brand": athis.data.lock_brand
    }, function (res) {
      if (res.data.result == 0) {
        utils.showSuccess("绑定帐号成功", 1500, "success");
        setTimeout(function () {
          wx.redirectTo({
            url: '../roomlock/addlock?nethouseid=' + athis.data.net_house_id
          })
        }, 1500)
      } else {
        wx.hideLoading();
        utils.alertViewNosucces("提示", res.data.message, false);
      }
    })
  },
  goupdatepwd:function(){
    wx.navigateTo({
      url: '../roomlock/editpwduser?nethouseid=' + this.data.net_house_id + "&lockbrand=" + this.data.lock_brand
    })
  },
  goregisteruser: function () {
    wx.redirectTo({
      url: '../roomlock/registeruser?nethouseid=' + this.data.net_house_id + "&lockbrand=" + this.data.lock_brand
    })
  }
})