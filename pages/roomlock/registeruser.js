const app = getApp()
var utils = require("../../utils/util.js");
Page({
  data: {
    net_house_id:"",
    userName: "",
    code: "",
    password: "",
    bizId:"",
    codevalue:"获取",
    codedisabled: true,
    condeindex: "1",
    numbers: 59,
  },
  onLoad: function (options) {
    this.setData({
      net_house_id: options.nethouseid
    })
  },
  //获取手机号
  getphone: function (e) {
    this.setData({
      userName: e.detail.value
    })
  },
  //获取验证码
  getcode: function (e) {
    this.setData({
      code: e.detail.value
    })
  },
  //获取密码
  getpass: function (e) {
    this.setData({
      password: e.detail.value
    })
  },
  //发送设置的手机号码，
  getphonecode: function () {
    var athis = this;
    if (athis.data.userName ==""){
      utils.showSuccess("请输入手机号", 2000, "none");
      return;
    }
    utils.showLoading("请稍等");
    utils.request1("/weboperate/sendMsg", {
      "skey": app.globalData.skey,
      "phone": athis.data.userName
    }, function (respass) {
      wx.hideLoading();
      if (respass.data.result == 0) {
        athis.setData({
          codedisabled: false,
          condeindex: "2",
          numbers: "60",
          bizId: respass.data.dataObject.bizId
        })
        athis.times()
      } else {
        utils.alertViewNosucces("提示", respass.data.message, false);
      }
    })
  },
  saveform:function(){
    var athis = this;
    if (athis.data.userName == "") {
      utils.showSuccess("请输入手机号",2000,"none");
      return;
    }
    utils.showLoading("请稍等")
    utils.request1("/weboperate/saveLockUser", {
      "skey": app.globalData.skey,
      "net_house_id": athis.data.net_house_id,
      "userName": athis.data.userName,
      "password": athis.data.password,
      "code": athis.data.code,
      "bizId": athis.data.bizId
    }, function (res) {
      if (res.data.result == 0) {
        utils.showSuccess("注册成功", 1500, "success");
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
  times: function () {
    var athis = this;
    var tiemrs = setInterval(function () {
      if (athis.data.numbers == 0) {
        clearInterval(tiemrs);
        athis.setData({
          codevalue: "重新获取",
          condeindex: "1"
        })
        return;
      }
      var numberss = (athis.data.numbers - 1)
      athis.setData({
        numbers: numberss,
        codevalue: athis.data.numbers + "秒"
      })
    }, 1000)
  },
})