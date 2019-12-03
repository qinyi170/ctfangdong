const app = getApp()
var utils = require("../../utils/util.js");
var datajson = require("../../utils/datas.js");
Page({
  data: {
    roomInfo: {},
  },
  onLoad: function () {
    this.infomsg();
  },
  //获取经营者信息详情
  infomsg: function () {
    var athis = this;
    utils.showLoading("请稍等")
    utils.request1("/weboperate/queryOperateInfo", {
      "skey": app.globalData.skey,
    }, function (e) {
      console.log(e)
      wx.hideLoading();
      if (e.data.result == "0") {
        athis.setData({
          placearr: e.data.dataObject.operateBusinessAddressCheck
        })
        if (e.data.dataObject.operate_nation!=""){
          if (e.data.dataObject.operate_nation != null) {
            var operate_nation_index = e.data.dataObject.operate_nation * 1 - 1;
            if (operate_nation_index == 96) {
              operate_nation_index = 56
            }
            if (operate_nation_index == 97) {
              operate_nation_index = 57
            }
            athis.setData({
              operate_nation: datajson.getNationData()[operate_nation_index].name,
              roomInfo: e.data.dataObject
            })
          }
        }
        if (e.data.dataObject.unit_legal_person_nation != "") {
          if (e.data.dataObject.unit_legal_person_nation != null) {
            var unit_legal_person_nation_index = e.data.dataObject.unit_legal_person_nation * 1 - 1;
            if (unit_legal_person_nation_index == 96) {
              unit_legal_person_nation_index = 56
            }
            if (unit_legal_person_nation_index == 97) {
              unit_legal_person_nation_index = 57
            }
            athis.setData({
              unit_legal_person_nation: datajson.getNationData()[unit_legal_person_nation_index].name,
              roomInfo: e.data.dataObject
            })
          }
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
  //审核失败时，修改经营者信息
  updateproprietor:function(e){
    wx.navigateTo({
      url: '../proprietor/proprietorupdate?ischeck=' + e.currentTarget.dataset.ischeck,
    })
  },
})