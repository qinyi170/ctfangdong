const app = getApp()
var utils = require("../../../utils/util.js");
Page({
  data: {
    query_param:""
  },
  getqueryparam: function (e) {
    this.setData({
      query_param: e.detail.value,
    })
  },
  saverole(){
    var athis=this;
    if (athis.data.query_param==""){
      utils.showSuccess("角色名称不能为空", 1500, "none");
      return;
    }
    if (athis.data.query_param.length > 15) {
      utils.showSuccess("角色名称不能大于15位", 1500, "none");
      return;
    }
    utils.showLoading("请稍等")
    utils.request1("/role/insertRole", {
      "skey": app.globalData.skey,
      "name": athis.data.query_param
    }, function (res1) {
      wx.hideLoading()
      if (res1.data.result == "0") {
        utils.showSuccess("角色添加成功", 1500, "success");
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
})