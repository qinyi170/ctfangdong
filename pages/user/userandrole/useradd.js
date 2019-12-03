const app = getApp()
var utils = require("../../../utils/util.js");
Page({
  data: {
    id:"",
    operatorid: "",
    typeData:"添加",
    operator_phone:"",
    operator_name:"",
    contact_info:"",
    remarks:""
  },
  onLoad(e){
    if (e.id != undefined) {
      wx.setNavigationBarTitle({
        title: '修改子账号'
      })
      this.setData({
        id: e.id,
        operatorid: e.operatorid,
        typeData:"修改"
      })
      this.active();
    }
  },
  active(){
    var athis = this;
    utils.showLoading("请稍等")
    utils.request1("/operator/selectOperatorSubAccountDetial", {
      "skey": app.globalData.skey,
      "id": athis.data.id
    }, function (res1) {
      wx.hideLoading()
      if (res1.data.result == "0") {
        athis.setData({
          operator_phone: res1.data.dataObject.operator_phone,
          operator_name: res1.data.dataObject.operator_name,
          contact_info: res1.data.dataObject.contact_info,
          remarks: res1.data.dataObject.remarks
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
  //帐号
  getoperatorphone: function (e) {
    this.setData({
      operator_phone: e.detail.value
    })
  },
  //姓名
  getoperatorname: function (e) {
    this.setData({
      operator_name: e.detail.value
    })
  },
  //联系方式
  getcontactinfo: function (e) {
    this.setData({
      contact_info: e.detail.value
    })
  },
  //备注
  getremarks: function (e) {
    this.setData({
      remarks: e.detail.value
    })
  },
  saveusers(){
    var athis=this;
    var operator_phone = this.data.operator_phone;
    var operator_name = this.data.operator_name;
    var contact_info = this.data.contact_info;
    var remarks = this.data.remarks;
    if (operator_phone==""){
      utils.showSuccess("请输入子账号", 1500, "none");
      return;
    }
    if (!(/^1[3456789]\d{9}$/.test(operator_phone))) {
      utils.showSuccess("子账号格式错误", 1500, "none");
      return;
    } 
    if (operator_name == "") {
      utils.showSuccess("请输入姓名", 1500, "none");
      return;
    }
    if (operator_name.length >15) {
      utils.showSuccess("子账号名称不能大于15位", 1500, "none");
      return;
    }
    if (contact_info == "") {
      utils.showSuccess("请输入联系方式", 1500, "none");
      return;
    }
    if (!(/^1[3456789]\d{9}$/.test(contact_info))) {
      utils.showSuccess("联系方式格式错误", 1500, "none");
      return;
    }
    var tempurl ="/operator/createOperatorSubAccount"
    var tempdata = {
      "skey": app.globalData.skey,
      "operator_phone": operator_phone,
      "operator_name": operator_name,
      "contact_info": contact_info,
      "remarks": remarks
    }
    if (athis.data.typeData =="修改"){
      tempurl = "/operator/updateOperatorBypass"
      tempdata.operator_id = athis.data.operatorid
    }
    utils.showLoading("请稍等")
    utils.request1(tempurl, tempdata , function (res1) {
      wx.hideLoading()
      if (res1.data.result == "0" && res1.data.errorCode == "0000000") {
        utils.showSuccess("子账号"+athis.data.typeData+"成功", 1500, "success");
        setTimeout(function () {
          wx.navigateBack({
            delta: 1
          })
        }, 1500)
      } else if (res1.data.result == "0" && res1.data.errorCode == "3000008") {
        utils.showSuccess("添加失败，子账号已存在", 1500, "none");
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