const app = getApp()
var utils = require("../../utils/util.js");
Page({
  data: {
    getwxphone: "",//手机号
    phonecodes: "",//验证码
    codedisabled: true,
    codevalue: "获取验证码",
    condeindex: "1",
    bizId: "",
    numbers: 59,
    Length: 6,    //输入框个数 
    isFocus: true,  //聚焦 
    Value: ""   //输入的内容
    
  },
  Focus(e) {
    var that = this;
    var inputValue = e.detail.value;
    that.setData({
      Value: inputValue,
    })
  },
  Tap() {
    var that = this;
    that.setData({
      isFocus: true,
    })
  },
  //获取输入的手机号
  userphone: function (e) {
    this.setData({
      getwxphone: e.detail.value
    })
  },
  //发送设置的手机号码，
  getphonecode: function () {
    var athis = this;
    if (athis.data.getwxphone==''){
      utils.alertViewNosucces("提示", "请输入手机号", false);
      return;
    }
    utils.showLoading("请稍等")
    setTimeout(function () {
      wx.hideLoading()
    }, 1000);
    utils.request1("/weboperate/sendMsg", {
      "skey": app.globalData.skey,
      "phone": athis.data.getwxphone
    }, function (respass) {
      if (respass.data.result == "0") {
        athis.setData({
          codedisabled: false,
          condeindex: "2",
          numbers: "60",
          bizId: respass.data.dataObject.bizId
        })
        athis.times()
      } else if (respass.data.result == "2") {
        utils.alertView("提示", "你已退出，请点击“确认”重新登录", function () {
          app.getLogin();
        })
      } else {
        utils.alertViewNosucces("提示", respass.data.message, false);
      }
    })
  },
  //获取手机号验证码
  userphonecode: function (e) {
    this.setData({
      phonecodes: e.detail.value
    })
  },
  //输入手机号验证码，点击提交
  getphonemsg: function () {
    if (this.data.phonecodes == "") {
      utils.alertViewNosucces("提示", "请输入手机号验证码", false);
    } else {
      utils.showLoading("请稍等")
      var athis = this;
      utils.request1("/weboperate/bindPhone", {
        "skey": app.globalData.skey,
        "phone": athis.data.getwxphone,
        "code": athis.data.phonecodes,
        "bizId": athis.data.bizId
      }, function (res) {
        console.log(res)
        wx.hideLoading();
        if (res.data.result == 0) {
          wx.switchTab({
            url: '../user/user',
          })
        } else if (res.data.result == "2") {
          utils.alertView("提示", "你已退出，请点击“确认”重新登录", function () {
            app.getLogin();
          })
        } else {
          utils.alertViewNosucces("提示", res.data.message, false);
        }
      })
    }
  },
  //倒计时
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
        codevalue: athis.data.numbers + "s"
      })
    }, 1000)
  }
})