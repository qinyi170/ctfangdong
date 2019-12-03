const app = getApp()
var utils = require("../../utils/util.js");
var datajson = require("../../utils/datas.js");
Page({
  data: {
    ischeck: false,
    tabitems: ["个人", "企业"],
    currentTopItem: "0",
    addrmsg: {},//选择地址
    addrstate: 1,
    idcardarray: ["身份证", "港澳通行证", "护照", "其他"],
    idcardarrayindex: ["111","513" , "414", '990'],
    idcardindex: 0,
    idcard: "111",//证件类型
    medalstate:1,
    checkid: "01",
    checkname: "汉族",
    placeshow:false,
    placestate:"1",
    placename: "请选择经营地",
    placestate1: "1",
    placename1: "请选择经营地",
    type:""
  },
  onLoad:function(e){
    console.log(e)
    this.setData({
      nationarray: datajson.getNationData()
    });
    if (e.ischeck != undefined) {
      this.setData({
        placeshow: true,
        type: "update",
      })
      if (e.ischeck == 0){
        this.setData({
          ischeck: true
        })
      }
      this.proprietormsg()
    }
  },
  onShow(){
    var placename = wx.getStorageSync('placename')
    if(placename!=""){
      wx.setStorageSync('placename', "")
      if (this.data.currentTopItem==0){
        this.setData({
          placestate: "2",
          placename: placename,
        })
      }else{
        this.setData({
          placestate1: "2",
          placename1: placename,
        })
      }
    }
  },
  //修改时，经营者信息的回显
  proprietormsg:function(){
    var athis = this;
    utils.showLoading("请稍等")
    utils.request1("/weboperate/queryOperateInfo", {
      "skey": app.globalData.skey,
    }, function (e) {
      console.log(e)
      wx.hideLoading();
      if (e.data.result == "0") {
        var infos = e.data.dataObject;
        if (infos.operate_email=="--"){
          infos.operate_email="";
        }
        athis.setData({
          proprietorinfo: infos
        })
        if (infos.operate_type==1){
          athis.setData({
            currentTopItem: 0,
            tempcurrentTopItem:0,
            addrstate: 2,
            addrmsg: {
              address: infos.operate_addr.substring(0, infos.operate_addr.indexOf("-")),
              name: infos.operate_addr.substring(infos.operate_addr.indexOf("-") + 1)
            },
            tempaddrmsg: {
              address: infos.operate_addr.substring(0, infos.operate_addr.indexOf("-")),
              name: infos.operate_addr.substring(infos.operate_addr.indexOf("-") + 1)
            },
            placename: infos.operateBusinessAddress.substring(0, infos.operateBusinessAddress.lastIndexOf(","))
          })
        }else{
          athis.setData({
            currentTopItem: 1,
            tempcurrentTopItem: 1,
            addrstate: 2,
            addrmsg: {
              address: infos.unit_legal_person_id_addr.substring(0, infos.unit_legal_person_id_addr.indexOf("-")),
              name: infos.unit_legal_person_id_addr.substring(infos.unit_legal_person_id_addr.indexOf("-") + 1)
            },
            tempaddrmsg: {
              address: infos.unit_legal_person_id_addr.substring(0, infos.unit_legal_person_id_addr.indexOf("-")),
              name: infos.unit_legal_person_id_addr.substring(infos.unit_legal_person_id_addr.indexOf("-") + 1)
            },
            placename1: infos.operateBusinessAddress.substring(0, infos.operateBusinessAddress.lastIndexOf(","))
          })
        }
        //民族
        for (var i = 0; i < athis.data.nationarray.length; i++) {
          if (infos.unit_legal_person_nation!=''){
            if (athis.data.nationarray[i].id == infos.unit_legal_person_nation) {
              athis.setData({
                checkname: athis.data.nationarray[i].name,
                checkid: infos.unit_legal_person_nation,
                tempcheckname: athis.data.nationarray[i].name,
                tempcheckid: infos.unit_legal_person_nation
              })
              break;
            }
          }
          if (infos.operate_nation != '') {
            if (athis.data.nationarray[i].id == infos.operate_nation) {
              athis.setData({
                checkname: athis.data.nationarray[i].name,
                checkid: infos.operate_nation,
                tempcheckname: athis.data.nationarray[i].name,
                tempcheckid: infos.operate_nation
              })
              break;
            }
          }
        }
        //证件种类
        for (var i = 0; i < athis.data.idcardarrayindex.length; i++) {
          if (infos.unit_legal_person_id_type!=''){
            if (athis.data.idcardarrayindex[i] == infos.unit_legal_person_id_type) {
              athis.setData({
                idcardindex: i,
                idcard: infos.unit_legal_person_id_type,
                tempidcardindex: i,
                tempidcard: infos.unit_legal_person_id_type
              })
              break;
            }
          }
          if (infos.operate_id_type != '') {
            if (athis.data.idcardarrayindex[i] == infos.operate_id_type) {
              athis.setData({
                idcardindex: i,
                idcard: infos.operate_id_type,
                tempidcardindex: i,
                tempidcard: infos.operate_id_type
              })
              break;
            }
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
  //点击tab
  switchTab: function (e) {
    if (e.currentTarget.dataset.idx == this.data.tempcurrentTopItem){
      this.setData({
        currentTopItem: this.data.tempcurrentTopItem,
        checkid: this.data.tempcheckid,
        checkname: this.data.tempcheckname,
        idcardindex: this.data.tempidcardindex,
        idcard: this.data.tempidcard,
        addrstate: 2,
        addrmsg: this.data.tempaddrmsg
      });
    }else{
      this.setData({
        currentTopItem: e.currentTarget.dataset.idx,
        checkid: "01",
        checkname: "汉族",
        idcardindex: 0,
        idcard: "111",
        addrstate: 1,
        addrmsg: {}
      });
    }
  },
  choosePlace:function(){
    wx.navigateTo({
      url: '../proprietor/proprietorplace',
    })
  },
  //打开名族模态框
  openmodal: function () {
    this.setData({
      medalstate: "2"
    })
  },
  //选择房源
  chosemodal: function (e) {
    this.setData({
      medalstate: "1",
      checkid: e.currentTarget.dataset.nationid,
      checkname: e.currentTarget.dataset.nationname
    })
  },
  //关闭房源模态框
  closemedal: function () {
    this.setData({
      medalstate: "1"
    })
  },
  //选择地址
  choosemap: function () {
    var athis = this
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success(e) {
              // wx.navigateTo({
              //   url: '../list/createroommap',
              // })
              wx.chooseLocation({
                success: function (res) {
                  athis.setData({
                    addrstate: 2,
                    addrmsg: res
                  })
                },
              })
            }, fail(e) {
              if (e.errMsg == "authorize:fail:auth deny" || e.errMsg == "authorize:fail auth deny") {
                utils.alertViewNosucces("权限申请", "请在我的-授权设置中开启位置信息权限，以正常使用地址选择功能", false);
              }
            }
          })
        } else {
          wx.chooseLocation({
            success: function (res) {
              athis.setData({
                addrstate: 2,
                addrmsg: res
              })
            },
          })
        }
      }
    })
  },
  //产权人证件类型
  bindPickerChange3(e) {
    this.setData({
      idcardindex: e.detail.value,
      idcard: this.data.idcardarrayindex[e.detail.value]
    })
  },
  //跳页及表单提交
  formSubmit: function (e) {
    console.log(e)
    var athis = this;
    var jsondata = e.detail.value;
    if (athis.data.currentTopItem==0){
      if (jsondata.operate_name == "") {
        utils.alertViewNosucces("提示", "请输入实际经营人姓名信息", false);
        return;
      }
      if (athis.data.type = "" && jsondata.operate_business_address == "请选择经营地") {
        utils.alertViewNosucces("提示", "请选择经营地", false);
        return;
      }
      if (jsondata.operate_id_num == "") {
        utils.alertViewNosucces("提示", "请输入证件号码信息", false);
        return;
      }
      if (jsondata.operate_phone == "") {
        utils.alertViewNosucces("提示", "请输入联系电话信息", false);
        return;
      }
      if (jsondata.operate_email != '' && !utils.checkEmial(jsondata.operate_email)) {
        utils.alertViewNosucces("提示", "请输入正确格式的邮箱", false);
        return;
      }
      if (jsondata.operate_addr.length == 1) {
        utils.alertViewNosucces("提示", "请选择居住地址", false);
        return;
      }
      if (jsondata.operate_roomId == "") {
        utils.alertViewNosucces("提示", "请输入门牌号信息", false);
        return;
      }
    }else{
      if (jsondata.unit_name == "") {
        utils.alertViewNosucces("提示", "请输入经营单位名称信息", false);
        return;
      }
      if (jsondata.unit_legal_person_id == "") {
        utils.alertViewNosucces("提示", "请输入统一社会信用代码信息", false);
        return;
      }
      if (athis.data.type="" && jsondata.unit_legal_operate_business_address == "请选择经营地") {
        utils.alertViewNosucces("提示", "请选择经营地", false);
        return;
      }
      if (jsondata.unit_phone == "") {
        utils.alertViewNosucces("提示", "请输入单位联系电话信息", false);
        return;
      }
      if (jsondata.unit_legal_person_name == "") {
        utils.alertViewNosucces("提示", "请输入法定代表人信息", false);
        return;
      }
      if (jsondata.unit_legal_person_id_num == "") {
        utils.alertViewNosucces("提示", "请输入证件号码信息", false);
        return;
      }
      if (jsondata.unit_legal_person_id_addr.length == 1) {
        utils.alertViewNosucces("提示", "请选择居住地址", false);
        return;
      }
      if (jsondata.unit_legal_person_roomId == "") {
        utils.alertViewNosucces("提示", "请输入门牌号信息", false);
        return;
      }
      if (jsondata.unit_legal_person_phone == "") {
        utils.alertViewNosucces("提示", "请输入法人联系电话信息", false);
        return;
      }
    }
    jsondata.skey = app.globalData.skey;
    if (athis.data.currentTopItem==0){
      jsondata.operate_type = "1";
    }else{
      jsondata.operate_type = "2";
    }
    utils.showLoading("请稍等");
    utils.request1("/weboperate/saveOperateInfo", jsondata , function (respass) {
      wx.hideLoading();
      var ress = respass.data;
      if (ress.result == "0") {
        if (ress.dataObject == "" || ress.dataObject == null){
          wx.switchTab({
            url: '../user/user',
          })
        }else{
          wx.showModal({
            title: '提示',
            content: "您添加的经营地“" + ress.dataObject.address + "”需要审核，是否提交审核",
            success(res) {
              if (res.confirm) {
                utils.showLoading("请稍等")
                utils.request1("/weboperate/reportBusinessAddress", {
                  "skey": app.globalData.skey,
                  "operate_business_address": ress.dataObject.address,
                  "type": "submit"
                }, function (res1) {
                  wx.hideLoading()
                  if (res1.data.result == "0") {
                    wx.showToast({
                      title: "已提交审核",
                      icon: "none",
                    });
                    setTimeout(function () {
                      wx.switchTab({
                        url: '../user/user',
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
      } else if (ress.result == "2") {
        utils.alertView("提示", "你已退出，请点击“确认”重新登录", function () {
          app.getLogin();
        })
      } else {
        if (!ress.result) {
          utils.alertViewNosucces("提示", "服务未响应，请稍后再试", false);
          return;
        }
        utils.alertViewNosucces("提示", ress.message + " ", false);
      }
    })
  },
})