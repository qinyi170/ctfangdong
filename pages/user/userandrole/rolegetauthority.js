const app = getApp()
var utils = require("../../../utils/util.js");
Page({
  data: {
    roleid:"",
    allDataList: [],
    scrollheight: "height:" + (app.globalData.pheight - 140) + "px",
  },
  onLoad: function (e) {
    this.setData({
      roleid: e.roleid
    })
    this.refreshNewData();
  },
  refreshNewData() {
    var athis = this;
    utils.request1("/menu/selectMenuPermissionByOperator", {
      "skey": app.globalData.skey,
      "rid": athis.data.roleid
    }, function (res1) {
      wx.hideLoading()
      if (res1.data.result == "0") {
        var templist = res1.data.dataObject;
        athis.setData({
          allDataList: templist
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
  switchChange: function (e) {
    console.log('switch2 发生 change 事件，携带值为', e.detail.value)
  },
  switchtap(e){
    var temppindex = e.currentTarget.dataset.pindex;
    var index = e.currentTarget.dataset.index;
    var allDataList = this.data.allDataList;
    if (allDataList[temppindex].zi[index].isChoose==1){  
      if (allDataList[temppindex].zi[index].permission_ == "list"){
        for (var i = 0; i < allDataList[temppindex].zi.length;i++){
          allDataList[temppindex].zi[i].isChoose=0
        }
        allDataList[temppindex].fu.isChoose = 0
      }else{
        allDataList[temppindex].zi[index].isChoose = 0;
        var ad=0;
        for (var j = 0; j < allDataList[temppindex].zi.length; j++) {
          if (allDataList[temppindex].zi[j].isChoose==1){
            ad=1;
            break;
          }
        }
        allDataList[temppindex].fu.isChoose = ad
      }    
    }else{
      allDataList[temppindex].zi[index].isChoose = 1;
      allDataList[temppindex].fu.isChoose = 1
    }
    this.setData({
      allDataList: allDataList
    })
  },
  saverole(){
    var athis=this;
    var allDataList = this.data.allDataList;
    var tempstr = "";
    for (var ii = 0; ii < allDataList.length; ii++) {
      if (allDataList[ii].fu.isChoose == 1) {
        tempstr += allDataList[ii].fu.id + ","
        for (var jj = 0; jj < allDataList[ii].zi.length; jj++) {
          if (allDataList[ii].zi[jj].isChoose == 1) {
            tempstr += allDataList[ii].zi[jj].id + ","
          }
        }
      }
    }
    tempstr = tempstr.substring(0, tempstr.lastIndexOf(","))
    utils.showLoading("请稍等")
    utils.request1("/menu/updateMenuPermission", {
      "skey": app.globalData.skey,
      "rid": athis.data.roleid,
      "menuIds": tempstr
    }, function (res1) {
      wx.hideLoading()
      if (res1.data.result == "0") {
        utils.showSuccess("角色授权成功", 1500, "success");
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