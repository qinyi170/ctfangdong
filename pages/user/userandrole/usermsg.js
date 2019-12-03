const app = getApp()
var utils = require("../../../utils/util.js");
Page({
  data: {
    aid:"",
    allData:""
  },
  onLoad: function (e) {
    console.log(e)
    this.setData({
      aid: e.aid
    })
  },
  onShow(){
    this.active();
  },
  active(){
    var athis=this;
    utils.showLoading("请稍等")
    utils.request1("/operator/selectOperatorSubAccountDetial", {
      "skey": app.globalData.skey,
      "id": this.data.aid
    }, function (res1) {
      wx.hideLoading()
      if (res1.data.result == "0") {
        athis.setData({
          allData: res1.data.dataObject
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
  updateproprietor(e){
    wx.navigateTo({
      url: 'useradd?id=' + e.currentTarget.dataset.id + "&operatorid=" + e.currentTarget.dataset.operatorid,
    })
  },
  gousergetrole(e){
    wx.navigateTo({
      url: 'usergetrole?operatorid=' + e.currentTarget.dataset.operatorid,
    })
  },
  gousergethouse(e) {
    utils.showLoading("请稍等")
    utils.request1("/house/selectHouseByOperator", {
      "skey": app.globalData.skey,
      "operator_id": e.currentTarget.dataset.operatorid
    }, function (res1) {
      wx.hideLoading()
      if (res1.data.result == "0") {
        if (res1.data.dataObject.length!=0){
          wx.navigateTo({
            url: 'userhouselist?operatorid=' + e.currentTarget.dataset.operatorid,
          })
        }else{
          wx.navigateTo({
            url: 'usergethouse?operatorid=' + e.currentTarget.dataset.operatorid,
          })
        }
      } else {
        if (!res1.data.result) {
          utils.alertViewNosucces("提示", "服务未响应，请稍后再试", false);
          return;
        }
        utils.alertViewNosucces("提示", res1.data.message + "", false);
      }
    })
  },
  gouserlog(e) {
    wx.navigateTo({
      url: 'userlog?operatorid=' + e.currentTarget.dataset.operatorid,
    })
  },
  goinvite(e) {
    wx.showModal({
      title: '子账号邀请',
      content: '确定要重新发起子账号邀请？',
      success(res) {
        if (res.confirm) {
          utils.showLoading("请稍等")
          utils.request1("/operator/updateOperatorInvateAccountAgainWechat", {
            "skey": app.globalData.skey,
            "operator_id": e.currentTarget.dataset.operatorid,
            "operator_phone": e.currentTarget.dataset.operatorphone,
          }, function (res1) {
            wx.hideLoading()
            if (res1.data.result == "0") {
              utils.showSuccess("邀请成功", 1500, "success");
              setTimeout(function () {
                wx.navigateBack({
                  delta: 1
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