const app = getApp()
var utils = require("../../utils/util.js");
Page({
  data: {
    allDataList:[],
    scrollheight: "height:" + (app.globalData.pheight - 5 - 48 - 53) + "px",
    roomstate: "3",//状态,
    morestate: "1",
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
  //查询房源列表
  refreshNewData: function (e) {
    utils.showLoading();
    var athis = this;
    var fundatas = {};
    if (athis.data.morestate == "1") {
      athis.setData({
        allDataList: []
      });
      fundatas = {
        "skey": app.globalData.skey,
        "startSize": "0"
      }
    } else {
      fundatas = {
        "skey": app.globalData.skey,
        "startSize": athis.data.allDataList.length
      }
    }
    utils.request1("/weboperate/queryLockUsers", fundatas, function (e) {
      wx.hideLoading();
      if (e.data.result == "0") {
        var datainfo = e.data.dataObject;
        for (var i = 0; i < datainfo.length;i++){
          datainfo[i]["lock_brand_frist"] = datainfo[i].lock_brand.substring(0,1)
        }
        if (athis.data.morestate == "1") {
          if (datainfo == "" || datainfo == null) {
            athis.setData({
              roomstate: "2"
            });
            return;
          } else {
            athis.setData({
              roomstate: "1",
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
      } else if (e.data.result == "2") {
        utils.alertView("提示", "你已退出，请点击“确认”重新登录", function () {
          app.getLogin();
        })
      } else {
        utils.alertViewNosucces("提示", e.data.message + " ", false);
      }
    })
  },
  //加载更多房源
  loadMoreData: function () {
    this.setData({
      morestate: "2"
    })
    this.refreshNewData();
  },
  golocklist(e){
    wx.navigateTo({
      url: '../roomlock/locklist?lockbrand=' + e.currentTarget.dataset.lockbrand + "&username=" + e.currentTarget.dataset.username
    })
  },
  untying(e) {
    var athis = this;
    wx.showModal({
      title: '提示',
      content: '确定要解绑帐号？',
      success(res) {
        if (res.confirm) {
          utils.showLoading("请稍等")
          utils.request1("/weboperate/unBindLockUser", {
            "skey": app.globalData.skey,
            "lock_brand": e.currentTarget.dataset.lockbrand,
            "userName": e.currentTarget.dataset.username
          }, function (e) {
            wx.hideLoading();
            if (e.data.result == "0") {
              utils.showSuccess("解绑成功", 1500, "success");
              setTimeout(function () {
                athis.setData({
                  morestate: "1"
                })
                athis.refreshNewData();
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