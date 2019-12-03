const app = getApp()
var utils = require("../../../utils/util.js");
Page({
  data: {
    query_param: "",
    scrollheight: "height:" + (app.globalData.pheight - 185) + "px",
    allDataList: [],
    morestate: "1"
  },
  onShow() {
    this.setData({
      morestate: 1
    })
    this.refreshNewData();
  },
  refreshNewData() {
    var athis = this;
    var fundatas = {
      "skey": app.globalData.skey,
      "operator_phone": athis.data.query_param
    };
    if (athis.data.morestate == "1") {
      fundatas.startSize = "0"
    } else {
      fundatas.startSize = athis.data.allDataList.length
    }
    utils.request1("/operator/selectOperatorBypass", fundatas, function (res1) {
      wx.hideLoading()
      if (res1.data.result == "0") {
        var datainfo = res1.data.dataObject.list;
        for (var i = 0; i < datainfo.length;i++){
          datainfo[i].operatornamel = datainfo[i].operator_name.substring(0,1)
        }
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
  //子账号搜索
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
  gousermsg(e) {
    wx.navigateTo({
      url: 'usermsg?aid=' + e.currentTarget.dataset.aid,
    })
  },
  gouseradd(){
    wx.navigateTo({
      url: 'useradd',
    })
  },
  deleteuser(e) {
    var athis = this;
    wx.showModal({
      title: '提示',
      content: '确定要删除子账号?',
      success(res) {
        if (res.confirm) {
          utils.showLoading("请稍等");
          utils.request1("/operator/deleteOperatorSubAccountWechat", {
            "skey": app.globalData.skey,
            "operator_id": e.currentTarget.dataset.operatorid,
            "id": e.currentTarget.dataset.aid,
          }, function (res1) {
            wx.hideLoading()
            if (res1.data.result == "0") {
              utils.showSuccess("子账号删除成功", 1500, "success");
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
  }
})