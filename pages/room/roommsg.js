const app = getApp()
var utils = require("../../utils/util.js");
Page({
  data:{
    roominfo:{},
    nethouseid:"",
    houseTypeArr: ["-", "普通公寓", "酒店式公寓", "精品客栈", "乡间名宿", "别墅", "loft复式", "房车", "四合院"],
    houseLayoutArr: ["室", "厅", "卫", "厨房", "书房", "阳台"],
    houseBedArr: ["大型双人床", "标准双人床", "单人床", "上下铺", "沙发床", "榻榻米", "其他"],
    houseFacilityArr:[]
  },
  onLoad: function (e) {
    this.setData({
      nethouseid: e.nethouseid
    })
  },
  onReady:function (e) {
    this.getHouseFacility();
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
        if (templist.house_type==""){
          templist.house_type=0
        } else if (templist.house_type.length > 2) {
          templist.house_type=0
        }
        //房源户型
        if (templist.house_layout != null) {
          var house_layout = templist.house_layout.split(",");
          var tempval = ""
          for (var i in house_layout) {
            if (house_layout[i] != 0) {
              tempval += house_layout[i] + athis.data.houseLayoutArr[i]
            }
          }
          templist.house_layout = tempval
        } else {
          templist.house_layout = "-"
        }
        //床型
        if (templist.house_bed != null) {
          var house_bed = templist.house_bed.split(",");
          var tempval = ""
          for (var i in house_bed) {
            if (house_bed[i] != 0) {
              tempval += house_bed[i] + athis.data.houseBedArr[i]
            }
          }
          templist.house_bed = tempval
        } else {
          templist.house_bed = "-"
        }
        //便利设施
        if (templist.house_facility != null) {
          var house_facility = templist.house_facility.split(",");
          var houseFacilityArr = athis.data.houseFacilityArr;
          var tempval = ""
          for (var i in house_facility) {
            for (var j in houseFacilityArr) {
              if (house_facility[i] == houseFacilityArr[j].id){
                tempval += houseFacilityArr[j].name+'、';
                break;
              }
            }
          }
          templist.house_facility = tempval.substring(0, tempval.length-1)
        } else {
          templist.house_facility = "-"
        }
        if (templist.price_common == null){
          templist.price_common=''
        }
        if (templist.price_holiday == null) {
          templist.price_holiday = ''
        }

        athis.setData({
          roomInfo: templist,
          tiems: e.data.dataObject.start_date.substring(0, 10) + "～" + e.data.dataObject.stop_date.substring(0, 10)
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
  //便利设施--加载所有便利设施
  getHouseFacility() {
    var athis = this;
    utils.showLoading("请稍等")
    utils.request1("/weboperate/queryFacility", {
      "skey": app.globalData.skey
    }, function (e) {
      wx.hideLoading();
      if (e.data.result == "0") {
        var tempdata = e.data.dataObject;
        athis.setData({
          houseFacilityArr: tempdata
        })
        athis.roommsg(athis.data.nethouseid);
      } else if (e.data.result == "2") {
        utils.alertView("提示", "你已退出，请点击“确认”重新登录", function () {
          app.getLogin();
        })
      } else {
        utils.alertViewNosucces("提示", e.data.message + " ", false);
      }
    })
  },
  previewImage: function (e) {
    var athis = this
    var aa = wx.getFileSystemManager();
    aa.writeFile({
      filePath: wx.env.USER_DATA_PATH + '/orderqrcode.png',
      data: e.currentTarget.dataset.src,
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
  updateroom:function(e){
    wx.navigateTo({
      url: '../room/roomupdate?nethouseid=' + this.data.nethouseid +"&ischeck="+e.target.dataset.ischeck,
    })
  },
  deleteroom:function(){
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
  auditingroom(e){
    var tempstr ="确定要将该房源提交审核？"
    if (e.target.dataset.cid=="1"){
      tempstr ="确定要再次提交审核？"
    }
    var athis = this;
    wx.showModal({
      title: '提示',
      content: tempstr,
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
  }
})