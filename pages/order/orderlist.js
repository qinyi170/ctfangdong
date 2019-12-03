const app = getApp();
var utils = require("../../utils/util.js");
Page({
  data: {
    allDataList: [],
    tabitems: ["待入住","已入住","已退房","已取消"],
    currentTopItem: "0",
    scrollheight: "height:" + (app.globalData.pheight - 170) + "px",
    movableheight: (app.globalData.pheight - 80 - 44 - 48) + "px",
    currentTopItems:["0","1","2","3"],
    morestate:"1",
    imagesmadel:"1",
    orderid:"",
    medalstate: "1",
    nowdays: 0,
    ordernethouseid:"",
    orderstarttime: "",
    orderstoptime: "",
    ordermoney: "",
    tt1:""
  },
  onShow:function(){
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
  //点击tab
  switchTab: function (e) {
    this.setData({
      currentTopItem: e.currentTarget.dataset.idx,
      morestate: "1"
    });
    this.refreshNewData();
  },
  //加载数据
  refreshNewData: function () {
    utils.showLoading();
    var athis = this;
    var fundatas={};
    if (athis.data.morestate == "1"){
      athis.setData({
        allDataList: []
      });
      fundatas={
        "check_state": athis.data.currentTopItem * 1 + 1,
        "skey": app.globalData.skey,
        "startSize":"0"
      }
    }else{
      fundatas = {
        "check_state": athis.data.currentTopItem * 1 + 1,
        "skey": app.globalData.skey,
        "startSize": athis.data.allDataList.length
      }
    }
    utils.request1("/weboperate/showOrder", fundatas, function (e) {
      console.log(e)
      wx.hideLoading();
      if (e.data.result=="0") { 
        if (e.data.errorCode == "0202001") {
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
        if (athis.data.morestate=="1"){
          athis.setData({
            allDataList: e.data.dataObject
          })
        }else{
          if (e.data.dataObject == "" || e.data.dataObject == null){
            wx.showToast({
              title: "没有更多数据",
              icon: "none",
            });
            return;
          }
          athis.setData({
            allDataList: athis.data.allDataList.concat(e.data.dataObject)
          })  
        } 
      } else if (e.data.result == "2") {
        utils.alertView("提示", "你已退出，请点击“确认”重新登录", function () {
          app.getLogin();
          //athis.refreshNewData();
        })
      } else {
        utils.alertViewNosucces("提示", e.data.message + " ", false);
      }
    })
  },
  //加载更多操作
  loadMoreData: function () {
    this.setData({
      morestate:"2"
    })
    this.refreshNewData();
  },
  //滑动切换
  swiperTab: function (e) {
    console.log(e)
    if (e.detail.source =="touch"){
      this.setData({
        currentTopItem: e.detail.current,
        morestate: "1"
      });
      this.refreshNewData();
    } 
  },
  //创建订单时，判断经营者信息是否登记，是否有绑定锁的房源
  addroomorder: function () {
    var athis = this;
    utils.request1("/weboperate/queryAvailableHouse", {
      "skey": app.globalData.skey
    }, function (e) {
      if (e.data.result == "0") {
        if (e.data.errorCode == "0202001") {
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
        if (e.data.errorCode == "0102016") {
          utils.alertViewNosucces("提示", e.data.message, false);
          return;
        }
        if (e.data.errorCode == "0102004") {
          utils.alertViewNosucces("提示", "您没有绑定门锁的房源，暂不能添加订单", false);
          return;
        }
        wx.navigateTo({
          url: '../order/ordercreate'
        });
      } else if (e.data.result == "2") {
        utils.alertView("提示", "你已退出，请点击“确认”重新登录", function () {
          app.getLogin();
        })
      } else {
        utils.alertViewNosucces("提示", e.data.message + " ", false);
      }
    })
  },
  //取消订单
  cancelorder:function(e){
    var athis = this;
    wx.showModal({
      title: '提示',
      content: '确定取消手机号为' + e.currentTarget.dataset.residephone+'顾客的订单吗?',
      success(res) {
        if (res.confirm) {
          utils.showLoading("请稍等")
          utils.request1("/weboperate/updateOrder", {
            "order_id": e.currentTarget.dataset.roomcode,
            "type":"cancel",
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
  },
  //退房
  exitorder: function (e) {
    var athis = this;
    wx.showModal({
      title: '提示',
      content: '确定要退手机号为' + e.currentTarget.dataset.residephone +'顾客的订单吗?',
      success(res) {
        if (res.confirm) {
          utils.showLoading("请稍等")
          utils.request1("/weboperate/retreatOrder", {
            "order_id": e.currentTarget.dataset.roomcode,
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
  },
  //换房
  updatehouse:function(e){
    this.setData({
      morestate: "1"
    })
    wx.navigateTo({
      url: '../room/roomnamelist?orderid=' + e.currentTarget.dataset.roomcode + "&nethousename=" + e.currentTarget.dataset.nethousename + "&backtype=1",
    })
  },
  //订单详情
  ordermsg: function (e) {
    wx.navigateTo({
      url: '../order/ordermsg?orderid=' + e.currentTarget.dataset.roomcode,
    })
  },

  //打开房源模态框
  openmodal: function (e) {
    this.setData({
      medalstate: "2",
      nowdays: 0,
      ordernethouseid: e.currentTarget.dataset.nethouseid,
      orderid: e.currentTarget.dataset.roomcode,
      orderstarttime: utils.getAllDateTime(e.currentTarget.dataset.resideretreatdate,0,0),
      orderstoptime: utils.getAllDateTime(e.currentTarget.dataset.resideretreatdate,0,0),
      ordermoney: e.currentTarget.dataset.price,
      tt1: "tt1"
    })
  },
  removedays: function () {
    var nowdays = this.data.nowdays;
    if (nowdays == 1){
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
      "net_house_id": athis.data.ordernethouseid,
      "order_id": athis.data.orderid,
      "startDate": athis.data.orderstarttime,
      "endDate": athis.data.orderstoptime,
      "type":"extend"
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



  //点击分享订单，打开弹出
  shareorder: function (e) {
    wx.navigateTo({
      url: '../order/shareorder?orderid=' + e.currentTarget.dataset.orderid,
    })
  },
  //关闭打开弹出
  hideModal: function () {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
  },
  //转发给好友，关闭分享点击弹出框
  opentypeshare:function(){
    this.setData({
      showModalStatus: false
    })
  },
  //生成二维码转发给好友
  getqrcode:function(){
    var athis=this;
    utils.showLoading("请稍等")
    utils.request1("/weboperate/createqrcode", {
      "resultdata": athis.data.orderid,
      "skey": app.globalData.skey
    }, function (res1) {
      wx.hideLoading()
      if (res1.data.result == "0") {
        athis.setData({
          imgqrcode: res1.data.dataObject.base64img,
          imagesmadel: "2",
          showModalStatus: false
        })
        var aa = wx.getFileSystemManager();
        aa.writeFile({
          filePath: wx.env.USER_DATA_PATH + '/orderqrcode.png',
          data: res1.data.dataObject.base64img,
          encoding: 'base64',
          success: res => {
            wx.saveImageToPhotosAlbum({
              filePath: wx.env.USER_DATA_PATH + '/orderqrcode.png',
              success: function (res) {
                wx.showToast({
                  title: '保存成功',
                })
              },
              fail: function (err) {
                console.log(err)
              }
            })
          }, fail: err => {
            console.log(err)
          }
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
  closeqrcode:function(){
    this.setData({
      imagesmadel: "1",
    });
  },
  //图片最大化显示
  previewImage: function (e) {
    var athis=this
    var aa = wx.getFileSystemManager();
    aa.writeFile({
      filePath: wx.env.USER_DATA_PATH + '/orderqrcode.png',
      data: athis.data.imgqrcode,
      encoding: 'base64',
      success: res => {
        console.log(res);
        console.log(wx.env.USER_DATA_PATH + '/orderqrcode.png')
        wx.previewImage({
          current: wx.env.USER_DATA_PATH + '/orderqrcode.png', // 当前显示图片的http链接
          urls: [wx.env.USER_DATA_PATH + '/orderqrcode.png']
          // 需要预览的图片http链接  使用split把字符串转数组。不然会报错
        })
      }, fail: err => {
        console.log(err)
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
  }
})