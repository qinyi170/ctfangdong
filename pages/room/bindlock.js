const app = getApp()
const utils = require("../../utils/util.js");
Page({
  data: {
    medalstate: "1",
    lockstate: "1",
    onetype: "1",
    lock_brand: "",
    lock_version: "",
    lock_type: "",
    lock_name: "",
    locktitle: 1,
    addandedit: "0",
    codedisabled: false,
    type: ""
  },
  onLoad: function (e) {
    if (e.nethouseid != undefined) {
      this.setData({
        "net_house_id": e.nethouseid,
        "locktype": e.locktype
      })
      if (e.locktype != "0") {
        this.setData({
          "addandedit": "1"
        })
      }
    }
    // 设置扫描图标位置（绝对定位，右对齐）
    const query = wx.createSelectorQuery(), that = this;
    query.select('.posi').boundingClientRect(rect => {
      that.setData({
        right: rect.left + 'px'
      })
    }).exec();
    this.queryLockbrand();
  },
  onShow: function () {
    if (app.globalData.lockData != "") {
      this.setData({
        addandedit: "1",
        locktitle: 1,
        codedisabled: true,
        lock_brand: app.globalData.lock_brand,
        lock_name: app.globalData.lockarrry.lockName
      })
      this.queryLocktype(app.globalData.lock_brand, this.data.lock_version, 1)
    }
  },
  onUnload() {
    if (app.globalData.lockData != "") {
      app.globalData.lockData = "";
    }
  },
  //初始化门锁品牌
  queryLockbrand: function () {
    utils.showLoading("请稍等");
    var athis = this;
    utils.request1("/weboperate/queryLock", {
      "skey": app.globalData.skey
    }, function (e) {
      console.log("queryLock", e);
      wx.hideLoading();
      if (e.data.result == "0") {
        let { data: { dataObject: arr } } = e;
        athis.setData({
          lockbrandarray: arr,
          lock_brand: arr[0].lock_brand,
          lock_version: arr[0].lock_version,
          locktitle: arr[0].lock_id,
        })
        app.globalData.lock_brand = arr[0].lock_brand;
        if (arr[0].biz_type == "2") {//密码锁绑定
          athis.queryLockversion(athis.data.lock_brand, 1)
        } else {
          athis.gobindlock();
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
  //初始化锁型号
  queryLockversion: function (lockbrand, index) {
    var athis = this;
    utils.request1("/weboperate/queryLock", {
      "skey": app.globalData.skey,
      "lock_brand": lockbrand
    }, function (e) {
      wx.hideLoading();
      if (e.data.result == "0") {
        athis.setData({
          lockversionarray: e.data.dataObject,
          lock_version: e.data.dataObject[0].lock_version
        })
        athis.queryLocktype(athis.data.lock_brand, athis.data.lock_version, index);
      } else if (e.data.result == "2") {
        utils.alertView("提示", "你已退出，请点击“确认”重新登录", function () {
          app.getLogin();
        })
      } else {
        utils.alertViewNosucces("提示", e.data.message + " ", false);
      }
    })
  },
  //初始化锁显示方式
  queryLocktype: function (lockbrand, lockversion, index) {
    var athis = this;
    utils.request1("/weboperate/queryLock", {
      "skey": app.globalData.skey,
      "lock_brand": lockbrand,
      "lock_version": lockversion
    }, function (e) {
      wx.hideLoading();
      if (e.data.result == "0") {
        console.log(index)
        if (index == 1) {
          athis.setData({
            locktypearray: e.data.dataObject[0],
            lock_type: e.data.dataObject[0].lock_type_default
          })
        }
        if (athis.data.locktype != 0 && athis.data.onetype == "1") {
          athis.setData({
            onetype: "2",
            type: "update"
          })
          athis.queryHouseLock();
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
  //打开门锁品牌模态框
  openlockbrandmodal: function () {
    this.setData({
      medalstate: "2"
    })
  },
  //选择门锁品牌
  choselockbrandmodal: function ({
    currentTarget: { dataset: { lockid, lockbrand, biztype, lockversion, locktype } }
  }) {
    app.globalData.lock_brand = lockbrand;
    if (lockid == 1) { // 科技侠-公寓锁
      this.setData({
        locktitle: lockid,
        lock_version: lockversion,
        lock_type: "",
        lock_name: "",
      })
    } else if (lockid == 8) {// 密码锁-密码
      this.setData({
        locktitle: lockid
      })
      this.queryLockversion(lockbrand, 1)
    } else {
      this.setData({
        locktitle: lockid,
        lock_version: lockversion,
        lock_type: locktype,
        lock_name: "",
        lockname: "",
        gateway: "",
        camera: ""
      })
    }
    this.setData({
      lock_brand: lockbrand,
      medalstate: "1"
    })
  },
  //打开门锁型号模态框
  openlockversionmodal: function () {
    this.setData({
      medalstate: "3"
    })
  },
  //选择门锁型号
  choselockversionmodal: function (e) {
    this.setData({
      lock_version: e.currentTarget.dataset.lockversion,
      medalstate: "1"
    })
    this.queryLocktype(this.data.lock_brand, e.currentTarget.dataset.lockversion, 1)
  },
  //关闭模态框
  closemodal: function () {
    this.setData({
      medalstate: "1"
    })
  },
  //修改锁时查询
  queryHouseLock: function () {
    var athis = this;
    utils.request1("/weboperate/queryHouseLock", {
      "skey": app.globalData.skey,
      "net_house_id": athis.data.net_house_id
    }, function (e) {
      let { data: { dataObject } } = e;
      let { lock_id, lock_brand, lock_version, lock_type_default, lock_name } = dataObject;
      console.log("queryHouseLock", e)
      wx.hideLoading();
      if (e.data.result == "0") {
        athis.setData({
          lock_brand: lock_brand,
          lock_version: lock_version,
          lock_type: lock_type_default,
          locktypearray: dataObject,
          lock_name: lock_name,
          locktitle: lock_id
        })
        if (lock_id == 10) {
          utils.request1("/weboperate/getAdditionalByLockName", {
            "skey": app.globalData.skey,
            "lock_name": lock_name,
            "lock_id": lock_id
          }, ({ data: { dataObject: additional } }) => {
            athis.setData({
              gateway: additional
            });
          });
          athis.queryLockversion(lock_brand, 2)
        } else if (lock_id == 11) {
          utils.request1("/weboperate/getAdditionalByLockName", {
            "skey": app.globalData.skey,
            "lock_name": lock_name,
            "lock_id": lock_id
          }, ({ data: { dataObject: additional } }) => {
            let [gateway, camera] = additional.split(",");
            athis.setData({
              gateway: gateway,
              camera: camera,
              locktitle: lock_id
            });
          });
          athis.queryLockversion(lock_brand, 2)
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
  //选择门锁显示方式
  radioChange(e) {
    this.setData({
      lock_type: e.detail.value
    })
  },
  //获取门锁编号
  getroomlockid: function (e) {
    this.setData({
      lock_name: e.detail.value
    })
  },
  // 扫描网关二维码
  scanCodeGateway() {
    this.scanCode("gateway");
  },
  // 扫描门锁二维码
  scanCodeLock() {
    this.scanCode("lockname");
  },
  // 扫描摄像头二维码
  scanCodeCamera() {
    this.scanCode("camera");
  },
  scanCode(key) {
    const that = this;
    wx.scanCode({
      success: ({ result: value }) => {
        const obj = {};
        obj[key] = value;
        that.setData(obj);
      }
    })
  },
  //表单提交
  saverooms: function () {
    var athis = this;
    if ((athis.data.lock_id == 11 || athis.data.lock_id == 10) && athis.data.gateway == "") {
      utils.alertViewNosucces("提示", "请扫描网关序列号", false);
      return;
    }
    if ((athis.data.lock_id == 11 || athis.data.lock_id == 10) && athis.data.lock_name == "") {
      utils.alertViewNosucces("提示", "请输入门锁编码", false);
      return;
    }
    if ((athis.data.lock_id == 11) && athis.data.camera == "") {
      utils.alertViewNosucces("提示", "请扫描猫眼序列号", false);
      return;
    }
    utils.showLoading("请稍等");
    var datass = {
      "skey": app.globalData.skey,
      "net_house_id": athis.data.net_house_id,
      "lock_brand": athis.data.lock_brand,
      "lock_version": athis.data.lock_version,
      "lock_type": athis.data.lock_type,
      "lock_name": athis.data.lock_name || athis.data.lockname,
      "type": athis.data.type,
      "gateway": athis.data.gateway,
      "camera": athis.data.camera
    }
    var urls = "/bindHouseLock"
    if (app.globalData.lockData != "") {
      datass.lock_data = app.globalData.lockData;
      urls = "/bindBlueLock"
    }
    console.log(datass)
    wx.hideLoading();
    utils.request(urls, datass, function (respass) {
      wx.hideLoading();
      console.log(urls, respass)
      var ress = respass.data;
      if (ress.result == "0") {
        if (ress.errorCode == '0000001') {//需要绑定账号
          wx.navigateTo({
            url: '../lock/binduser?net_house_id=' + ress.dataObject
          })
        } else {
          if (app.globalData.lockData != "") {
            app.globalData.lockData = "";
          }
          wx.switchTab({
            url: '../room/roomlist',
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
  gobindlock: function (e) {
    var athis = this;
    if (e.currentTarget.dataset.locktitle == 12) {
      wx.navigateTo({
        url: '../roomlock/addBluetooth?nethouseid=' + athis.data.net_house_id + "&lockbrand=" + athis.data.lock_brand
      })
      return;
    }
    utils.showLoading("请稍等");
    var datass = {
      "skey": app.globalData.skey,
      "net_house_id": athis.data.net_house_id,
      "lock_brand": athis.data.lock_brand,
      "lock_version": athis.data.lock_version,
      "lock_type": athis.data.lock_type,
      "lock_name": athis.data.lock_name,
    }
    wx.hideLoading();
    utils.request1("/weboperate/bindHouseLock", datass, function (respass) {
      wx.hideLoading();
      var ress = respass.data;
      if (ress.result == "0") {
        if (ress.errorCode == '0000001') {//到绑定账号
          wx.navigateTo({
            url: '../roomlock/binduser?nethouseid=' + athis.data.net_house_id + "&lockbrand=" + athis.data.lock_brand
          })
        } else if (ress.errorCode == '0000002') {//到绑锁页面
          wx.navigateTo({
            url: '../roomlock/addlock?nethouseid=' + athis.data.net_house_id + "&lockbrand=" + athis.data.lock_brand
          })
        } else {
          wx.switchTab({
            url: '../room/roomlist'
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
  Twobindlock: function () {
    wx.redirectTo({
      url: '../room/bindlock?nethouseid=' + this.data.net_house_id + "&locktype=0"
    })
  }
})