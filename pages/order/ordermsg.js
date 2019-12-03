const app = getApp();
var utils = require("../../utils/util.js");
Page({
  data: {
    order_id:"",
    net_house_id: "",
    net_house_name:"",
    money:"",
    starttime:"",
    stoptime:"",
    orderstarttime:"",
    orderstoptime:"",
    orderoldstoptime:"",
    roomInfo: {},
    isneedpwd: 2,
    check_state:"",
    medalstate: "1",
    nowdays: 0,
    tt1: ""
  },
  onLoad: function (e) {
    this.setData({
      order_id: e.orderid
    })
    this.activemsg(e.orderid);
  },
  activemsg: function (orderid) {
    var athis = this;
    utils.showLoading("请稍等");
    utils.request1("/weboperate/queryOrderById", {
      "skey": app.globalData.skey,
      "order_id": orderid
    }, function (res1) {
      console.log(res1)
      wx.hideLoading();
      if (res1.data.result == "0") {
        athis.setData({
          starttime: res1.data.dataObject.reside_date.substring(0, 4) + "-" + res1.data.dataObject.reside_date.substring(4, 6) + "-" + res1.data.dataObject.reside_date.substring(6, 8),
          starthour: res1.data.dataObject.reside_date.substring(8, 10),
          startminute: res1.data.dataObject.reside_date.substring(10, 12),
          stoptime: res1.data.dataObject.reside_retreat_date.substring(0, 4) + "-" + res1.data.dataObject.reside_retreat_date.substring(4, 6) + "-" + res1.data.dataObject.reside_retreat_date.substring(6, 8),
          stophour: res1.data.dataObject.reside_retreat_date.substring(8, 10),
          stopminute: res1.data.dataObject.reside_retreat_date.substring(10, 12),
          orderstarttime: utils.changeDate1(res1.data.dataObject.reside_date),
          orderoldstoptime: utils.changeDate1(res1.data.dataObject.reside_retreat_date),
          orderstoptime: utils.changeDate1(res1.data.dataObject.reside_retreat_date),
          roomInfo: res1.data.dataObject,
          check_state: res1.data.dataObject.check_state,
          net_house_id: res1.data.dataObject.net_house_id,
          net_house_name: res1.data.dataObject.net_house_name,
          orderoldmoney: res1.data.dataObject.money,
          ordermoney: res1.data.dataObject.money,
        })
        athis.isWritePass(res1.data.dataObject.lock_id, res1.data.dataObject.lock_type)
      } else {
        if (!res1.data.result) {
          utils.alertViewNosucces("提示", "服务未响应，请稍后再试", false);
          return;
        }
        utils.alertViewNosucces("提示", res1.data.message + "", false);
      }
    })
  },
  isWritePass: function (lockid, locktype) {
    var athis = this;
    utils.request1("/weboperate/LockNeedPwd", {
      "skey": app.globalData.skey,
      "lock_id": lockid,
      "lock_type": locktype
    }, function (e) {
      console.log(e)
      wx.hideLoading();
      if (e.data.result == "0") {
        if (locktype == "0200") {
          if (e.data.errorCode == "0000000") {
            athis.setData({
              isneedpwd: 1
            })
          } else {
            athis.setData({
              isneedpwd: 2
            })
          }
        } else {
          athis.setData({
            isneedpwd: 2
          })
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
  //编辑订单
  orderupdate: function () {
    wx.navigateTo({
      url: '../order/orderupdate?orderid=' + this.data.order_id,
    })
  },
  //换房
  updateorder() {
    wx.navigateTo({
      url: '../room/roomnamelist?orderid=' + this.data.order_id + "&nethousename=" + this.data.net_house_name+"&backtype=2",
    })
  },
  //取消订单
  cancelorder: function (e) {
    var athis = this;
    wx.showModal({
      title: '提示',
      content: "确定取消手机号为" + e.currentTarget.dataset.orderphone+"顾客的订单吗?",
      success(res) {
        if (res.confirm) {
          utils.showLoading("请稍等")
          utils.request1("/weboperate/updateOrder", {
            "order_id": athis.data.order_id,
            "type": "cancel",
            "skey": app.globalData.skey
          }, function (res1) {
            wx.hideLoading()
            if (res1.data.result == "0") {
              wx.showToast({
                title: "取消成功",
                icon: "none",
              });
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
      }
    })
  },
  //打开房源模态框
  openmodal: function () {
    this.setData({
      medalstate: "2",
      nowdays: 0,
      orderstoptime:this.data.orderoldstoptime,
      ordermoney: this.data.orderoldmoney,
      tt1: "tt1"
    })
  },
  removedays: function () {
    var nowdays = this.data.nowdays;
    if (nowdays == 1) {
      this.setData({
        tt1: "tt1"
      })
    }
    if (nowdays == 0) {
      this.setData({
        nowdays: 0
      })
    } else {
      this.setData({
        nowdays: this.data.nowdays * 1 - 1,
        orderstoptime: utils.getAllDateTime(this.data.orderstoptime, -1, 0)
      })
      this.getDayPrice();
    }
  },
  adddays: function () {
    this.setData({
      nowdays: this.data.nowdays * 1 + 1,
      orderstoptime: utils.getAllDateTime(this.data.orderstoptime, 1, 0),
      tt1: "",
    })
    this.getDayPrice();
  },
  getDayPrice: function () {
    var athis = this
    utils.showLoading("请稍等")
    utils.request1("/weboperate/getDayPrice", {
      "skey": app.globalData.skey,
      "net_house_id": athis.data.net_house_id,
      "order_id": athis.data.order_id,
      "startDate": athis.data.orderoldstoptime,
      "endDate": athis.data.orderstoptime,
      "type": "extend"
    }, function (res1) {
      wx.hideLoading()
      if (res1.data.result == "0") {
        athis.setData({
          ordermoney: res1.data.dataObject.totalPrice
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
  //获取价格
  getordermoney: function (e) {
    this.setData({
      ordermoney: e.detail.value
    })
  },
  //选择房源
  chosemodal: function (e) {
    var athis = this
    utils.showLoading("请稍等")
    utils.request1("/weboperate/updateOrder", {
      "skey": app.globalData.skey,
      "order_id": athis.data.order_id,
      "reside_retreat_date": athis.data.orderstoptime,
      "type": "extended",
      "money": athis.data.ordermoney
    }, function (res1) {
      wx.hideLoading()
      if (res1.data.result == "0") {
        wx.showToast({
          title: "续住成功",
          icon: "none",
        });
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
  },
  //关闭房源模态框
  closemedal: function () {
    this.setData({
      medalstate: "1",
    })
  },
  //退房
  exitorder: function (e) {
    var athis = this;
    wx.showModal({
      title: '提示',
      content: "确定要退手机号为" + e.currentTarget.dataset.orderphone + "顾客的订单吗?",
      success(res) {
        if (res.confirm) {
          utils.showLoading("请稍等")
          utils.request1("/weboperate/retreatOrder", {
            "order_id": athis.data.order_id,
            "skey": app.globalData.skey
          }, function (res1) {
            wx.hideLoading()
            if (res1.data.result == "0") {
              wx.showToast({
                title: "退房成功",
                icon: "none",
              });
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
      }
    })
  },
})