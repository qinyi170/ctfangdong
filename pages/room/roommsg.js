const app = getApp()
var utils = require("../../utils/util.js");
var timers;
Page({
  data:{
    loadingstate: 1,
    roominfo:{},
    nethouseid:"",
    gotype:"",
    houseRentoutArr: ["整套房屋", "独立房间", "合住房间"],
    houseBedIndex:"",
    houseLayoutArr: ["室", "厅", "卫"],
    houseLayoutIndex: "",
    houseSourceArr: ["转租", "自营"],
    houseFacilityArr:[],
  },
  onLoad: function (e) {
    console.log(e)
    this.setData({
      nethouseid: e.nethouseid,
      gotype: e.gotype
    })
    if (e.gotype == 0) {
      this.getHouseFacility();
    } else {
      this.checkloging();
    }
  },
  onHide: function () {
    clearTimeout(timers);
  },
  onUnload: function () {
    clearTimeout(timers);
  },
  // 登录
  checkloging: function () {
    var athis = this;
    utils.showLoading("请稍等")
    timers = setTimeout(function () {
      wx.hideLoading()
      if (athis.data.loadingstate == 1) {
        utils.alertView("提示", "请求失败，请点击“确定”重新请求", function () {
          athis.checkloging();
        })
      }
    }, 10000)
    wx.login({
      success: res => {
        utils.request("/onLogin", {
          code: res.code
        }, function (ee) {
          if (ee.data.result == "0") {
            clearTimeout(timers);
            app.globalData.skey = ee.data.dataObject.skey;
            app.globalData.openid = ee.data.dataObject.openid;
            utils.request("/queryUserState", {
              "skey": ee.data.dataObject.skey
            }, function (e) {
              wx.hideLoading();
              if (e.data.result == "0") {
                if (e.data.dataObject.userState == "enroll") {
                  utils.request1("/login/smsCode", {
                    type: "3",
                    username: ee.data.dataObject.phone
                  }, function (eee) {
                    wx.hideLoading();
                    if (eee.data.result == "0") {
                      var tempe = eee.data.dataObject;
                      app.globalData.pcloginstate = tempe;
                      athis.getHouseFacility();
                    }
                  })
                } else {
                  if (e.data.dataObject.wxtestpage == "testpage") {
                    wx.redirectTo({
                      url: '../login/login',
                    })
                  } else {
                    athis.setData({
                      buttontype: 2
                    });
                  }
                }
              } else if (e.data.result == "2") {
                utils.alertView("提示", "你已退出，请点击“确认”重新登录", function () {
                  app.getLogin();
                })
              } else {
                if (!e.data.result) {
                  utils.alertViewNosucces("提示", "服务未响应，请稍后再试", false);
                  return;
                }
                utils.alertViewNosucces("提示", e.data.message + "", false);
              }
            })
          } else {
            wx.hideLoading();
            if (!ee.data.result) {
              utils.alertViewNosucces("提示", "服务未响应，请稍后再试", false);
              return;
            }
            utils.alertViewNosucces("提示", ee.data.message + "", false);
          }
        })
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
        //床型
        var tempbedval=0
        if (templist.house_bed == null || templist.house_bed == "") {
          tempbedval=""
        } else {
          var house_bed = templist.house_bed.split(",");
          for (var i in house_bed) {
            if (house_bed[i] != 0) {
              tempbedval = tempbedval * 1 + house_bed[i] * 1
            }
          }
        }
        //房源户型
        var templayoutval=""
        if (templist.house_layout == null || templist.house_layout == "") {
          templayoutval=""
        } else {
          var house_layout = templist.house_layout.split(",");
          for (var i in house_layout.splice(3)) {
            if (house_layout[i] != 0) {
              templayoutval += house_layout[i] + athis.data.houseLayoutArr[i]
            }
          }
        }
        //便利设施
        var tempfacilityval=[];
        if (templist.house_facility == null || templist.house_facility == "") {
          tempfacilityval = []
        } else {
          var house_facility = templist.house_facility.split(",");
          var houseFacilityArr = athis.data.houseFacilityArr;
          var tempval = ""
          for (var i in house_facility) {
            for (var j in houseFacilityArr) {
              if (house_facility[i] == houseFacilityArr[j].id) {
                tempfacilityval.push(houseFacilityArr[j]);
                break;
              }
            }
          }
        }
        athis.setData({
          houseBedIndex: tempbedval,
          houseLayoutIndex: templayoutval,
          house_markers: [{
            id: 1,
            latitude: templist.house_latitude,
            longitude: templist.house_longitude,
            callout: {
              padding: 1,
              content: templist.net_house_name,
              bgColor: "#ffffff",
              color: "#000000",
              display: "ALWAYS"
            },
          }],
          houseFacilityNowArr: tempfacilityval,
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
  backhome(){
    if (this.data.gotype == 0) {
      wx.navigateBack({
        delta: 1
      }) 
    } else {
      wx.switchTab({
        url: '../calendar/index',
      })
    }
  },
  //转发功能
  onShareAppMessage: function (ops) {
    if (ops.from === 'button') {
      console.log(ops.target)
    }
    return {
      title: '网约房登记',
      path: 'pages/room/roommsg?nethouseid=' + this.data.nethouseid + "&gotype=1",
      success: function (res) {
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function (res) {
        console.log("转发失败:" + JSON.stringify(res));
      }
    }
  }
})