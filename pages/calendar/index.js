const app = getApp();
var utils = require("../../utils/util.js");
Page({
  data: {
    startDate: utils.formatDateday(0),
    nowDate: utils.formatDateday(0),
    groupindex:0,
    goruparray:[],
    allDataList: [],
    tabitems: ["待入住", "已入住", "空闲"],
    currentTopItem: "0",
    scrollheight: "height:" + (app.globalData.pheight - 220) + "px",
    currentTopItems: ["0", "1", "2"],
    houseStates: ["4", "5", "0"],
    morestate: "1",
    query_param:"",
    group_name:"",
    medalstate:"1",
    nowdays:0,
    ordernethouseid:"",
    orderid: "",
    orderstarttime:"",
    orderstoptime: "",
    ordermoney:"",
    tt1: ""
  },
  onLoad:function(){
    this.grouplist();
  },
  onShow: function () {
    this.setData({
      allDataList: []
    });
    this.refreshNewData();
  },
  onHide: function () {
    this.setData({
      morestate: 1
    })
  },
  grouplist(){
    var athis=this;
    utils.request1("/group/groups", {
      "skey": app.globalData.skey,
    }, function (e) {
      wx.hideLoading();
      if (e.data.result == "0") {
        var tmeplist = e.data.dataObject.list;
        var temparry=["全部"];
        for (var i = 0; i < tmeplist.length;i++){
          temparry.push(tmeplist[i].group_name)
        }
        athis.setData({
          goruparray: temparry
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
  //加载数据
  refreshNewData: function () {
    utils.showLoading();
    var athis = this;
    var fundatas = {
      "houseState": athis.data.houseStates[athis.data.currentTopItem],
      "skey": app.globalData.skey,
      "pageSize": "10",
      "startDate": athis.data.startDate,
      "query_param": athis.data.query_param,
      "group_name": athis.data.group_name
    };
    if (athis.data.morestate == "1") {
      athis.setData({
        allDataList: []
      });
      fundatas.startSize=0
    } else {
      fundatas.startSize=athis.data.allDataList.length
    }
    utils.request1("/weboperate/getHouseState", fundatas, function (e) {
      wx.hideLoading();
      if (e.data.result == "0") {
        if (e.data.errorCode == "0202001"){
          wx.showModal({
            title: '提示',
            content: "未登记经营者，是否立即登记?",
            success(res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '../proprietor/proprietorupdate'
                })
              }
            }
          })
          return;
        }
        var tmeplist = e.data.dataObject
        if (tmeplist != "" || tmeplist != null){
          for (var j = 0; j < tmeplist.length; j++) {
            var tmepj = tmeplist[j];
            for (var i = 0; i < tmepj.orderList.length; i++) {
              tmeplist[j].orderList[i].reside_new_date = utils.changeDate(tmepj.orderList[i].reside_date);
              tmeplist[j].orderList[i].reside_retreat_new_date = utils.changeDate(tmepj.orderList[i].reside_retreat_date);
            }
          } 
        }
        if (athis.data.morestate == "1") {
          athis.setData({
            allDataList: tmeplist
          })
        } else {
          if (tmeplist == "" || tmeplist == null) {
            wx.showToast({
              title: "没有更多数据",
              icon: "none",
            });
            return;
          }
          athis.setData({
            allDataList: athis.data.allDataList.concat(tmeplist)
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
  //加载更多操作
  loadMoreData: function () {
    this.setData({
      morestate: "2"
    })
    this.refreshNewData();
  },
  //滑动切换
  swiperTab: function (e) {
    if (e.detail.source == "touch") {
      this.setData({
        currentTopItem: e.detail.current,
        morestate: "1"
      });
      this.refreshNewData();
    }
  },
  //点击tab
  switchTab: function (e) {
    this.setData({
      currentTopItem: e.currentTarget.dataset.idx,
      morestate: "1"
    });
    this.refreshNewData();
  },
  //选择时间
  bindMultiPickerChange1: function (e) {
    this.setData({
      startDate: e.detail.value,
      morestate: "1"
    })
    this.refreshNewData();
  },
  //组查询
  bindMultiPickerChange2: function (e) {
    this.setData({
      groupindex: e.detail.value,
      morestate: "1",
      group_name: this.data.goruparray[e.detail.value]
    })
    if (e.detail.value==0){
      this.setData({
        group_name:""
      })
    }
    this.refreshNewData();
  },
  //单条房源的房态日历展示，点击单条房源非按钮区域
  housecalendar:function(e){
    var nethouseid = e.currentTarget.dataset.nethouseid;
    var nethousename = e.currentTarget.dataset.nethousename;
    var lockid = e.currentTarget.dataset.lockid;
    var locktype = e.currentTarget.dataset.locktype;
    wx.navigateTo({
      url: '../calendar/calendar?nethouseid=' + nethouseid + "&nethousename=" + nethousename + "&lockid=" + lockid + "&locktype=" + locktype
    })
  },
  //创建订单时，判断经营者信息是否登记，是否有绑定锁的房源
  createorder: function (e) {
    var nethouseid = e.currentTarget.dataset.nethouseid;
    var nethousename = e.currentTarget.dataset.nethousename;
    var lockid = e.currentTarget.dataset.lockid;
    var locktype = e.currentTarget.dataset.locktype;
    var orderlist = e.currentTarget.dataset.orderlist;
    if (orderlist.length==0){
      wx.navigateTo({
        url: '../order/ordercreate?nethouseid=' + nethouseid + "&nethousename=" + nethousename + "&lockid=" + lockid + "&locktype=" + locktype + "&startdate=" + this.data.startDate + " 14:00:00" + "&stopdate=" + utils.getAllDate(this.data.startDate, 1) + " 12:00:00",
      })
    }else{
      var tempdate=0;
      for (var i = 0; i < orderlist.length;i++){
        if (orderlist[i].reside_retreat_date > tempdate){
          tempdate = orderlist[i].reside_retreat_date
        }
      }
      var temphour= utils.getDateWhereType("hour", utils.changeDate1(tempdate), 0);
      if (temphour<12){
        wx.navigateTo({
          url: '../order/ordercreate?nethouseid=' + nethouseid + "&nethousename=" + nethousename + "&lockid=" + lockid + "&locktype=" + locktype + "&startdate=" + this.data.startDate + " 14:00:00" + "&stopdate=" + utils.getAllDate(this.data.startDate, 1) + " 12:00:00",
        })
      }else{
        var a=utils.getAllDateTime(utils.changeDate1(tempdate),2,1)
        wx.navigateTo({
          url: '../order/ordercreate?nethouseid=' + nethouseid + "&nethousename=" + nethousename + "&lockid=" + lockid + "&locktype=" + locktype + "&startdate=" + a + "&stopdate=" + utils.getAllDate(this.data.startDate, 1) + " 12:00:00",
        })
      }
    }
    // var athis = this;
    // utils.request("/queryOperateInfo", {
    //   "skey": app.globalData.skey
    // }, function (e) {
    //   if (e.data.result == "0") {
    //     if (e.data.errorCode == "0000000") {
    //       utils.request("/queryAvailableHouse", {
    //         "skey": app.globalData.skey
    //       }, function (e) {
    //         if (e.data.result == "0") {
    //           if (e.data.errorCode == "0102004") {
    //             utils.alertViewNosucces("提示", "您没有绑定门锁的房源，暂不能添加订单", false);
    //           } else {
    //             wx.navigateTo({
    //               url: '../order/ordercreate'
    //             });
    //           }
    //         } else if (e.data.result == "2") {
    //           utils.alertView("提示", "你已退出，请点击“确认”重新登录", function () {
    //             app.getLogin();
    //           })
    //         } else {
    //           utils.alertViewNosucces("提示", e.data.message + " ", false);
    //         }
    //       })
    //     } else {
    //       utils.alertViewNosucces("提示", "你还没有经营者信息，请先登记经营者信息", false);
    //     }
    //   } else if (e.data.result == "2") {
    //     utils.alertView("提示", "你已退出，请点击“确认”重新登录", function () {
    //       app.getLogin();
    //     })
    //   } else {
    //     utils.alertViewNosucces("提示", e.data.message + " ", false);
    //   }
    // })
  },
  //换房
  updateorder(e){
    this.setData({
      morestate: "1"
    })
    wx.navigateTo({
      url: '../room/roomnamelist?orderid=' + e.currentTarget.dataset.orderid + "&nethousename=" + e.currentTarget.dataset.nethousename + "&backtype=1",
    })
  },
  //取消订单
  cancelorder: function (e) {
    var athis = this;
    utils.request1("/weboperate/queryOrderById", {
      "skey": app.globalData.skey,
      "order_id": e.currentTarget.dataset.orderid
    }, function (res) {
      if (res.data.result == "0") {
        wx.showModal({
          title: '提示',
          content: '确定取消手机号为' + res.data.dataObject.reside_info[0].reside_phone + "顾客的订单吗?",
          success(res) {
            if (res.confirm) {
              utils.showLoading("请稍等")
              utils.request1("/weboperate/updateOrder", {
                "order_id": e.currentTarget.dataset.orderid,
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
                    athis.setData({
                      morestate: "1"
                    })
                    athis.refreshNewData();
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
      } else {
        if (!res.data.result) {
          utils.alertViewNosucces("提示", "服务未响应，请稍后再试", false);
          return;
        }
        utils.alertViewNosucces("提示", res.data.message + "", false);
      }
    })
  },
  //打开房源模态框
  openmodal: function (e) {
    this.setData({
      medalstate: "2",
      nowdays:0,
      ordernethouseid: e.currentTarget.dataset.nethouseid,
      orderid: e.currentTarget.dataset.orderid,
      orderstarttime: utils.changeDate1(e.currentTarget.dataset.resideretreatdate),
      orderstoptime: utils.changeDate1(e.currentTarget.dataset.resideretreatdate),
      ordermoney: e.currentTarget.dataset.price,
      tt1: "tt1"
    })
  },
  removedays:function(){
    var nowdays = this.data.nowdays;
    if (nowdays == 1) {
      this.setData({
        tt1: "tt1"
      })
    }
    if (nowdays==0){
      this.setData({
        nowdays:0
      })
    }else{
      this.setData({
        nowdays: this.data.nowdays * 1 - 1,
        orderstoptime: utils.getAllDateTime(this.data.orderstoptime, -1,0)
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
  getDayPrice: function (){
    var athis=this
    utils.showLoading("请稍等")
    utils.request1("/weboperate/getDayPrice", {
      "skey": app.globalData.skey,
      "net_house_id": athis.data.ordernethouseid,
      "order_id": athis.data.orderid,
      "startDate": athis.data.orderstarttime,
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
  //房源搜索
  getqueryparam: function (e) {
    this.setData({
      query_param: e.detail.value,
      morestate: "1"
    })
    this.refreshNewData();
  },
  //选择房源
  chosemodal: function (e) {
    var athis = this
    utils.showLoading("请稍等")
    utils.request1("/weboperate/updateOrder", {
      "skey": app.globalData.skey,
      "order_id": athis.data.orderid,
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
          athis.setData({
            morestate: "1",
            medalstate: "1",
          })
          athis.refreshNewData();
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
  exitorder:function(e){
    var athis = this;
    utils.request1("/weboperate/queryOrderById", {
      "skey": app.globalData.skey,
      "order_id": e.currentTarget.dataset.orderid
    }, function (res) {
      if (res.data.result == "0") {
        wx.showModal({
          title: '提示',
          content: '确定要退手机号为' + res.data.dataObject.reside_info[0].reside_phone + "顾客的订单吗?",
          success(res) {
            if (res.confirm) {
              utils.showLoading("请稍等")
              utils.request1("/weboperate/retreatOrder", {
                "order_id": e.currentTarget.dataset.orderid,
                "skey": app.globalData.skey
              }, function (res1) {
                wx.hideLoading()
                if (res1.data.result == "0") {
                  wx.showToast({
                    title: "退房成功",
                    icon: "none",
                  });
                  setTimeout(function () {
                    athis.setData({
                      morestate: "1"
                    })
                    athis.refreshNewData();
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
      } else {
        if (!res.data.result) {
          utils.alertViewNosucces("提示", "服务未响应，请稍后再试", false);
          return;
        }
        utils.alertViewNosucces("提示", res.data.message + "", false);
      }
    })
  },



  //转发给好友
  onShareAppMessage: function (ops) {
    if (ops.from === 'button') {
      console.log(ops.target)
    }
    return {
      title: '网约房登记',
      path: 'pages/welcome/welcome?qinyi=qinyix',
      success: function (res) {
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function (res) {
        console.log("转发失败:" + JSON.stringify(res));
      }
    }
  },
})