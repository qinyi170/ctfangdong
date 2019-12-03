const app = getApp()
var utils = require("../../utils/util.js");
Page({
  data: {
    order_id:"",
    order_phone:"",
    net_old_house_name:"",
    net_new_house_id: "",
    net_new_house_name: "",
    backtype:"",
    query_param:"",
    scrollheight: "height:" + (app.globalData.pheight -140) + "px",
    allDataList:[],
    morestate:"1",
    medalstate: "1",
    order_house_password:""
  },
  onLoad: function (options) {
    this.setData({
      order_id: options.orderid,
      net_old_house_name: options.nethousename,
      backtype: options.backtype
    });
    this.refreshNewData();
    this.active();
  },
  active(){
    var athis=this;
    utils.request1("/weboperate/queryOrderById", {
      "skey": app.globalData.skey,
      "order_id": athis.data.order_id
    }, function (res1) {
      wx.hideLoading()
      if (res1.data.result == "0") {
        athis.setData({
          order_phone: res1.data.dataObject.reside_info[0].reside_phone
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
  refreshNewData(){
    var athis=this;
    var fundatas = {
      "skey": app.globalData.skey,
      "query_param": athis.data.query_param,
      "houseState":"0"
    };
    if (athis.data.morestate == "1") {
      fundatas.startSize = "0"
    } else {
      fundatas.startSize = athis.data.allDataList.length
    }
    utils.request1("/weboperate/getHouseState", fundatas, function (res1) {
      wx.hideLoading()
      if (res1.data.result == "0") {
        var datainfo = res1.data.dataObject;
        if (athis.data.morestate == "1") {
          if (datainfo == "" || datainfo == null) {
            athis.setData({
              allDataList: []
            });
            return;
          } else {
            athis.setData({
              allDataList: datainfo
            })
          }
        } else {
          if (datainfo == "" || datainfo == null) {
            wx.showToast({
              title: "没有更多数据",
              icon: "none",
            });
            return;
          }
          athis.setData({
            allDataList: athis.data.allDataList.concat(datainfo)
          })
        }
      } else {
        if (!res1.data.result) {
          utils.alertViewNosucces("提示", "服务未响应，请稍后再试", false);
          return;
        }
        utils.alertViewNosucces("提示", res1.data.message + "", false);
      }
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
  //加载更多操作
  loadMoreData: function () {
    this.setData({
      morestate: "2"
    })
    this.refreshNewData();
  },
  isWritePass: function (e) {
    var athis = this;
    var temp = e.currentTarget.dataset
    utils.request1("/weboperate/LockNeedPwd", {
      "skey": app.globalData.skey,
      "lock_id": temp.lockid,
      "lock_type": temp.locktype
    }, function (e) {
      wx.hideLoading();
      if (e.data.result == "0") {
        if (temp.locktype == "0200") {
          if (e.data.errorCode == "0000000") {
            athis.setData({
              medalstate: "2",
              net_new_house_id: temp.nethouseid,
              net_new_house_name: temp.nethousename
            })
          } else {
            athis.choosehouse(0, temp.nethouseid, temp.nethousename)
          }
        } else {
          athis.choosehouse(0, temp.nethouseid, temp.nethousename)
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
  //获取价格
  gethousepass: function (e) {
    this.setData({
      order_house_password: e.detail.value
    })
  },
  //关闭房源模态框
  closemedal: function () {
    this.setData({
      medalstate: "1",
    })
  },
  chosemodal(){
    if (this.data.order_house_password==""){
      wx.showToast({
        title: '请输入密码',
        icon: "none"
      })
      return;
    }
    this.setData({
      medalstate: "1",
    })
    this.choosehouse(1, this.data.net_new_house_id, this.data.net_new_house_name)
  },
  choosehouse(istype,nethouseid, nethousename){
    var athis = this;
    var fundata={
      "skey": app.globalData.skey,
      "order_id": athis.data.order_id,
      "net_house_id": nethouseid
    }
    if (istype==1){
      fundata.order_house_password = athis.data.order_house_password
    }   
    wx.showModal({
      title: '提示',
      content: '确定要把手机号为' + athis.data.order_phone + "顾客的订单，由房间" + athis.data.net_old_house_name +"换成" + nethousename + "吗？",
      success(res) {
        if (res.confirm) {
          utils.showLoading("请稍等")
          utils.request1("/weboperate/updateChangeHouse", fundata, function (e) {
            wx.hideLoading();
            if (e.data.result == "0") {
              wx.showToast({
                title: "换房成功",
                icon: "none",
              });
              setTimeout(function () {
                if (athis.data.backtype==1){
                  wx.navigateBack({
                    delta: 1
                  })
                }else{
                  wx.navigateBack({
                    delta: 2
                  })
                }
              }, 1500)
            } else if (e.data.result == "2") {
              utils.alertView("提示", "你已退出，请点击“确认”重新登录", function () {
                app.getLogin();
              })
            } else {
              utils.alertViewNosucces("提示", e.data.message + " ", false);
            }
          })
        }
      }
    })
  },
})