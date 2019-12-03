const app = getApp()
var utils = require("../../../utils/util.js");
Page({
  data: {
    operatorid:"",
    allDataList:[]
  },
  onLoad: function (options) {
    this.setData({
      operatorid: options.operatorid
    })
  },
  onShow(){
    this.active()
  },
  active() {
    var athis = this;
    utils.showLoading("请稍等")
    utils.request1("/netHouseLog/selectNetHouseLogByOperatorId", {
      "skey": app.globalData.skey,
      "operator_id": this.data.operatorid
    }, function (res1) {
      wx.hideLoading()
      if (res1.data.result == "0") {
        athis.setData({
          allDataList: res1.data.dataObject.list
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
})