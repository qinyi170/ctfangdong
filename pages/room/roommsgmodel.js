const app = getApp()
var utils = require("../../utils/util.js");
Page({
  data: {
    roominfo: {},
    nethouseid: "",
    houseitem1: "2",
    houseitem2: "2",
    houseitem3: "2",
    houseitem4: "2",
    houseRentoutType: ["","整套房屋", "独立房间","合住房间"],
    houseTypeArr: ["","普通公寓", "酒店式公寓", "精品客栈", "乡间名宿", "别墅", "loft复式", "房车", "四合院"],
    houseLayoutArr: ["室", "厅", "卫"],
    houseLayoutIndex:"",
    houseSourceArr: ["转租", "自营"],
  },
  onLoad: function (e) {
    this.setData({
      nethouseid: e.nethouseid
    });
    this.roommsg(this.data.nethouseid);
  },
  //获取房源列表
  roommsg: function (data) {
    var athis = this;
    utils.showLoading("请稍等")
    utils.request1("/weboperate/queryNetHouseById", {
      "skey": app.globalData.skey,
      "net_house_id": data
    }, function (e) {
      console.log(e)
      wx.hideLoading();
      if (e.data.result == "0") {
        var templist = e.data.dataObject;
        wx.setNavigationBarTitle({
          title: templist.net_house_name
        })
        //房源户型
        if (templist.house_layout != null) {
          var house_layout = templist.house_layout.split(",");
          var tempval = ""
          for (var i in house_layout.splice(3)) {
            if (house_layout[i] != 0) {
              tempval += house_layout[i] + athis.data.houseLayoutArr[i]
            }
          }
          athis.setData({
            houseLayoutIndex: tempval
          })
        } else {
          athis.setData({
            houseLayoutIndex: ""
          })
        }
        if (templist.net_house_name != '' && templist.house_basic_declare != '' && templist.head_pic != '' && templist.house_photo.length!=0){
          athis.setData({
            houseitem1:"1"
          })
        }
        if (templist.net_house_addr != "" && templist.room_id!=""){
          athis.setData({
            houseitem2: "1"
          })
        }
        if (templist.house_type.length>2) {
          templist.house_type = ""
        }
        if (templist.house_layout==null){
          templist.house_layout ="0,0,0,0,0,0"
        }
        if (templist.house_bed == null) {
          templist.house_bed = "0,0,0,0,0,0,0"
        }
        if (templist.house_facility == null) {
          templist.house_facility = ""
        }
        if (templist.price_common == null) {
          templist.price_common = ""
        }
        if (templist.price_holiday == null) {
          templist.price_holiday = ""
        }
        if (templist.house_rentout_type != '' && templist.house_type != '' && templist.house_layout != '0,0,0,0,0,0' && templist.house_acreage != "" && templist.house_bed != '0,0,0,0,0,0,0' && templist.reside_num_max != "0" && templist.house_facility != "" && templist.price_common != "" && templist.price_holiday != "") {
          athis.setData({
            houseitem3: "1"
          })
        }
        if (templist.house_source != '' && templist.house_property_type != '' && templist.house_property_nation != '' && templist.house_property_name != "" && templist.house_property_id_type != '' && templist.house_property_id_num != "" && templist.house_property_phone != "" && templist.no_property_credentice_id != "" && templist.house_property_unit_name != "" && templist.house_property_legal_person_id != "" && templist.house_property_photo != "") {
          athis.setData({
            houseitem4: "1"
          })
        }
        athis.setData({
          roomInfo: templist,
        })
      } else if (e.data.result == "2") {
        utils.alertView("提示", "你已退出，请点击“确认”重新登录", function () {
          app.getLogin();
        })
      } else {
        utils.alertViewNosucces("提示", e.data.message + " ", false);
      }
    })
  },
  updateroom:function(e){
    wx.navigateTo({
      url: '../room/roomupdate?nethouseid=' + this.data.nethouseid + "&ischeck=" + this.data.roomInfo.is_check + "&houseitemid=" + e.currentTarget.dataset.houseitemid,
    })
  },
  deleteroom: function () {
    var athis = this;
    wx.showModal({
      title: '提示',
      content: '删除房源时将同时删除与该房源相关的订单，确定要删除该房源？',
      success(res) {
        if (res.confirm) {
          utils.showLoading("请稍等")
          utils.request1("/weboperate/deleteNetHouseById", {
            "net_house_id": athis.data.nethouseid,
            "skey": app.globalData.skey
          }, function (res1) {
            wx.hideLoading()
            if (res1.data.result == "0") {
              wx.showToast({
                title: "删除成功",
                icon: "none",
              });
              setTimeout(function () {
                wx.switchTab({
                  url: '../room/roomlist',
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
  },
  auditingroom() {
    var athis = this;
    wx.showModal({
      title: '提示',
      content: "确定要将该房源提交审核？",
      success(res) {
        if (res.confirm) {
          utils.showLoading("请稍等")
          utils.request1("/weboperate/reportHouseState", {
            "net_house_id": athis.data.nethouseid,
            "skey": app.globalData.skey
          }, function (res1) {
            wx.hideLoading()
            if (res1.data.result == "0") {
              wx.showToast({
                title: "房源成功提交审核",
                icon: "none",
              });
              setTimeout(function () {
                wx.switchTab({
                  url: '../room/roomlist',
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
  },
  msgroom: function () {
    wx.navigateTo({
      url: '../room/roommsg?nethouseid=' + this.data.nethouseid +"&gotype=0",
    })
  },
})