const app = getApp()
var utils = require("../../utils/util.js");
Page({
  onShow:function(){
    this.getphone();
    this.queryOperateInfo();
  },
  getphone:function(){
    var athis=this;
    utils.showLoading("请稍等")
    utils.request1("/weboperate/checkPhone", {
      "skey": app.globalData.skey,
    }, function (respass) {
      wx.hideLoading();
      if (respass.data.result == "0") {
        athis.setData({
          user_phone: respass.data.dataObject.user_phone
        })
      } else if (respass.data.result == "2") {
        utils.alertView("提示", "你已退出，请点击“确认”重新登录", function () {
          app.getLogin();
        })
      } else {
        utils.alertViewNosucces("提示", respass.data.message, false);
      }
    })
  },
  //查询登记状态
  queryOperateInfo: function () {
    var athis = this;
    utils.request1("/weboperate/queryOperateInfo", {
      "skey": app.globalData.skey
    }, function (e) {
      console.log(e)
      wx.hideLoading();
      if (e.data.result == "0") {
        athis.setData({
          proprietorstate: e.data.errorCode
        });
        if (e.data.errorCode != "0202001"){
          athis.setData({
            is_check: e.data.dataObject.is_check
          });
          if (e.data.dataObject.is_check == "0") {
            athis.setData({
              proprietormsg: "已审核"
            });
          } else if (e.data.dataObject.is_check == "1") {
            athis.setData({
              proprietormsg: "未审核"
            });
          } else if (e.data.dataObject.is_check == "2") {
            athis.setData({
              proprietormsg: "审核中"
            });
          } else {
            athis.setData({
              proprietormsg: "无需审核"
            });
          }
        }else{
          athis.setData({
            proprietormsg: "未登记"
          });
        }
      } else if (e.data.result == "2") {
        utils.alertView("提示", "你已退出，请点击“确认”重新登录", function () {
          app.getLogin();
        })
      } else {
        utils.alertViewNosucces("提示", e.data.message + " ", false);
      }
    })
  },

  phonecallevent: function () {
    wx.makePhoneCall({
      phoneNumber: "4000915055"
    })
  },
  gosuggestion:function(){
    wx.showModal({
      title: '提示',
      content: "开发中...",
      showCancel: false
    })
  },
  gorecord:function(){
    if (this.data.proprietorstate == "0202001") {
      wx.navigateTo({
        url: '../proprietor/proprietorupdate'
      })
    } else {
      wx.navigateTo({
        url: '../proprietor/proprietormsg'
      })
    }
  },
  updatephone:function(){
    wx.navigateTo({
      url: '../user/bindphone',
    })
  },
  onShareAppMessage: function (ops) {
    if (ops.from === 'button') {
      console.log(ops.target)
    }
    return {
      title: '网约房登记',
      path: 'pages/welcome/welcome',
      success: function (res) {
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function (res) {
        console.log("转发失败:" + JSON.stringify(res));
      }
    }
  },
  usersystem:function(){
    wx.navigateTo({
      url: '../user/userandrole',
    })
  },
  locksystem: function () {
    wx.navigateTo({
 //     url: '../user/lockadmin', 
      url: '../roomlock/locklist'
    })
  },
  changeuser(){
    var athis = this;
    wx.showModal({
      title: '提示',
      content: '确定要切换账号吗?',
      success(res) {
        if (res.confirm) {
          wx.navigateTo({
            url: 'changeuser',
          })
        }
      }
    })
  },
  updateorderdate(){
    wx.navigateTo({
      url: '../user/updateorderdate',
    })
  },
})