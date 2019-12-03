const app = getApp()
var utils = require("../../../utils/util.js");
Page({
  data: {
    showstate:"1",
    operatorid:"",
    allDataList:[],
    allCheckDataList:[],
    oldcheckedstr:[]
  },
  onLoad: function (e) {
    this.setData({
      operatorid: e.operatorid
    })
  },
  onShow() {
    this.active();
  },
  active() {
    var athis = this
    utils.showLoading("请稍等")
    utils.request1("/role/selectRoleAll", {
      "skey": app.globalData.skey,
      "sub_operator_id": athis.data.operatorid
    }, function (res1) {
      wx.hideLoading()
      if (res1.data.result == "0") {
        var tempdata = res1.data.dataObject;
        if (tempdata.operatorRoles.length!=0){
          athis.setData({
            showstate: "2",
            allCheckDataList: tempdata.operatorRoles
          })
        }else{
          athis.setData({
            showstate: "1",
          })
        }
        var checkedstr=[]
        for (var i = 0; i < tempdata.operatorRoles.length;i++){
          checkedstr.push(tempdata.operatorRoles[i].rid);
          for (var j = 0; j < tempdata.roles.length; j++) {
            if (tempdata.operatorRoles[i].rid == tempdata.roles[j].id){
              tempdata.roles[j].checked=true;
              break;
            }
          }
        }
        athis.setData({
          oldcheckedstr: checkedstr,
          allDataList: tempdata.roles
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
  checkboxChange: function (e) {
    this.setData({
      oldcheckedstr: e.detail.value
    })
  },
  saverole(){
    var athis=this;
    var oldcheckedstr = this.data.oldcheckedstr;
    var roles="";
    for (var i = 0; i < oldcheckedstr.length;i++){
      if (i == oldcheckedstr.length-1){
        roles += oldcheckedstr[i];
      }else{
        roles += oldcheckedstr[i]+",";
      }
    }
    utils.showLoading("请稍等")
    utils.request1("/role/updateRoleOperator", {
      "skey": app.globalData.skey,
      "operator_id": athis.data.operatorid,
      "roles": roles
    }, function (res1) {
      wx.hideLoading()
      if (res1.data.result == "0") {
        utils.showSuccess("角色分配成功", 1500, "success");
        setTimeout(function () {
          if(athis.data.oldcheckedstr.length==0){
            wx.navigateBack({
              delta:1
            })
            return;
          }
          athis.setData({
            showstate: "2"
          })
          athis.active();
        }, 1500)
      } else {
        if (!res1.data.result) {
          utils.alertViewNosucces("提示", "服务未响应，请稍后再试", false);
          return;
        }
        utils.alertViewNosucces("提示", res1.data.message + "", false);
      }
    })    
  },
  updaterole() {
    var athis = this;
    athis.setData({
      showstate: "1"
    })
  }
})