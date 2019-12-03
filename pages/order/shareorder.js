const app = getApp();
var utils = require("../../utils/util.js");
Page({
  data:{
    or_derid:"",
    scrollheight: "height:" + (app.globalData.pheight-50) + "px"
  },
  onLoad: function (e) {
    if (e.orderid != undefined) {
      this.activeorder(e.orderid)
    }
  },
  activeorder: function (or_derid){
    var athis = this;
    utils.showLoading("请稍等")
    utils.request1("/weboperate/createqrcode", {
      "resultdata": or_derid,
      "skey": app.globalData.skey
    }, function (res1) {
      wx.hideLoading()
      if (res1.data.result == "0") {
        athis.setData({
          imgqrcode: res1.data.dataObject.base64img
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
  previewImage: function () {
    var athis = this
    var aa = wx.getFileSystemManager();
    aa.writeFile({
      filePath: wx.env.USER_DATA_PATH + '/orderqrcode.png',
      data: athis.data.imgqrcode,
      encoding: 'base64',
      success: res => {
        wx.previewImage({
          current: wx.env.USER_DATA_PATH + '/orderqrcode.png',
          urls: [wx.env.USER_DATA_PATH + '/orderqrcode.png']
        })
      }, fail: err => {
        console.log(err)
      }
    })
  },
})