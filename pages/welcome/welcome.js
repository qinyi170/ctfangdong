const app = getApp();
var utils = require("../../utils/util.js");
var timers;
Page({
  data: {
    loadingstate: 1,
    buttontype:1,
    scrollheight: "height:" + app.globalData.pheight + "px"
  },
  onShow:function(){
    this.checkloging();
  },
  onHide: function () {
    clearTimeout(timers);
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
    }, 10000)
    wx.login({
      success: res => {
        utils.request("/onLogin", {
          code: res.code
        }, function (ee) {
          if (ee.data.result == "0") {
            clearTimeout(timers);
            app.globalData.skey = ee.data.dataObject.skey;
            app.globalData.openid = ee.data.dataObject.openid;
            utils.request("/queryUserState", {
              "skey": ee.data.dataObject.skey
            }, function (e) {
              wx.hideLoading();
              if (e.data.result == "0") {
                if (e.data.dataObject.userState == "enroll") {
                  utils.request1("/login/smsCode", {
                    type: "3",
                    username: ee.data.dataObject.phone
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
                } else {
                  if (e.data.dataObject.wxtestpage == "testpage") {
                    wx.redirectTo({
                      url: '../login/login',
                    })
                  } else {
                    athis.setData({
                      buttontype: 2
                    });
                  }
                }
              } else if (e.data.result == "2") {
                utils.alertView("提示", "你已退出，请点击“确认”重新登录", function () {
                  app.getLogin();
                })
              } else {
                if (!e.data.result) {
                  utils.alertViewNosucces("提示", "服务未响应，请稍后再试", false);
                  return;
                }
                utils.alertViewNosucces("提示", e.data.message + "", false);
              }
            })
          } else {
            wx.hideLoading();
            if (!ee.data.result) {
              utils.alertViewNosucces("提示", "服务未响应，请稍后再试", false);
              return;
            }
            utils.alertViewNosucces("提示", ee.data.message + "", false);
          }
        })
      }
    })
  },
  //获取微信手机号回调事件
  getPhoneNumber: function (e) {
    var athis = this;
    athis.setData({
      currentTopItem: "2"
    })
    setTimeout(function () {
      athis.setData({
        currentTopItem: "1"
      })
    }, 1000)
    if (e.detail.errMsg == 'getPhoneNumber:user deny' || e.detail.errMsg == 'getPhoneNumber:fail:cancel to confirm login') {
      console.log(1)
    } else {
      utils.showLoading("请稍等");
      utils.request("/operateEnroll", {
        "encryptedData": e.detail.encryptedData,
        "iv": e.detail.iv,
        "skey": app.globalData.skey
      }, function (respass) {
        wx.hideLoading();
        if (respass.data.result == "0") {
          app.globalData.phoneNumber = respass.data.dataObject.phoneNumber;
          utils.request1("/login/smsCode", {
            type: "3",
            username: respass.data.dataObject.phoneNumber
          }, function (e) {
            wx.hideLoading();
            if (e.data.result == "0") {
              var tempe = e.data.dataObject;
              app.globalData.pcloginstate = tempe;
              if (tempe.isinfo == 1) {
                athis.goinvite(tempe);
              } else {
                wx.switchTab({
                  url: '../calendar/index',
                })
              }
            } else if (e.data.result == "2") {
              utils.alertView("提示", "你已退出，请点击“确认”重新登录", function () {
                app.getLogin();
              })
            } else {
              utils.alertViewNosucces("提示", e.data.message + " ", false);
            }
          })
        } else if (respass.data.result == "2") {
          utils.alertView("提示", "你已退出，请点击“确认”重新登录", function () {
            app.getLogin();
          })
        } else {
          utils.alertViewNosucces("提示", respass.data.message + "", false);
        }
      })
    }
  },
  getrefech:function(){
    this.checkloging();
  },
  goinvite(options) {
    var athis=this;
    utils.showLoading("请稍等");
    utils.request1("/informationController/selectSubAccountInfo", {
      "skey": app.globalData.skey
    }, function (res1) {
      wx.hideLoading()
      if (res1.data.result == "0") {
        wx.showModal({
          title: '子账号邀请',
          content: '确认要成为' + res1.data.dataObject[0].create_oper_phone + '的子账号?',
          confirmText: "接受",
          cancelText: "拒绝",
          success(res) {
            if (res.confirm) {
              athis.saveinvite(res1.data.dataObject[0].create_oper_id, 1)
            } else if (res.cancel) {
              athis.saveinvite(res1.data.dataObject[0].create_oper_id, 2)
            }
          }
        })
      } else {
        if (!res1.data.result) {
          utils.alertViewNosucces("提示", "服务未响应，请稍后再试", false);
          return;
        }
        utils.alertViewNosucces("提示", res1.data.message + "", false);
      }
    })
  },
  saveinvite(create_oper_id,typeindex){
    var athis=this;
    utils.showLoading("请稍等");
    utils.request1("/operator/updateOperatorIsPassOrReject", {
      "skey": app.globalData.skey,
      "create_oper_id": create_oper_id,
      "is_bypass": typeindex
    }, function (res1) {
      wx.hideLoading()
      if (res1.data.result == "0") {
        var tempstr="接受";
        if (typeindex==2){
          tempstr="拒绝"
        }
        utils.showSuccess(tempstr+"成功", 1500, "success");
        setTimeout(function () {
          athis.getrefech();
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
})