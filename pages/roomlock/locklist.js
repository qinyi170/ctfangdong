const app = getApp()
const utils = require("../../utils/util.js");
const plugin = requirePlugin("myPlugin");
const bluetooth = require("../../utils/bluetooth.js");

const serviceId = '0000FFE0-0000-1000-8000-00805F9B34FB';
const write = '0000FFE1-0000-1000-8000-00805F9B34FB';
const notify = '0000FFE2-0000-1000-8000-00805F9B34FB';
let platform = '';
Page({

  // 页面的初始数据
  data: {
    allDataList: []
  },
  onLoad(options) {
    platform = wx.getSystemInfoSync().system.split(' ')[0].toLowerCase();
    const data = {};
    if (options.lockbrand) {
      data.lockbrand = options.lockbrand;
    }
    if (options.username) {
      data.username = options.username
    }
    this.setData(data);
  },
  onShow() {
    this.setData({
      allDataList: []
    });
    this.refreshNewData();
  },
  onHide() {
    this.setData({
      allDataList: []
    })
  },

  refreshNewData() {
    utils.showLoading();
    const that = this;
    const { allDataList } = that.data;
    utils.request1("/weboperate/queryLockList", {
      "skey": app.globalData.skey,
      "startSize": allDataList.length,
      "lock_brand": that.data.lockbrand,
      "username": that.data.username
    }, ({ data: { result, errorCode, message, dataObject: dataList } }) => {
      wx.hideLoading();
      if (result == "0") {
        if (dataList == "" || dataList == null) {
          wx.showToast({
            title: "没有更多数据",
            icon: "none",
          });
          return;
        }
        that.setData({
          allDataList: allDataList.concat(dataList)
        });
      } else if (result == "2") {
        utils.alertView("提示", "你已退出，请点击“确认”重新登录", () => app.getLogin());
      } else {
        utils.alertViewNosucces("提示", message + "", false);
      }
    });
  },
  changeuser() {
    wx.navigateTo({
      url: '../user/lockadmin'
    });
  },
  //加载更多房源
  loadMoreData: function () {
    this.refreshNewData();
  },
  deletelock(e) {
    const that = this;
    const dataset = e.currentTarget.dataset;

    wx.showModal({
      title: '提示',
      content: '确定要删除锁？',
      success({ confirm, cancel }) {
        if (cancel) { // 点击取消按钮
          return;
        }
        const lockid = dataset.lockid;
        if (lockid == 1) {        // 蓝牙密码锁
          that.deletelock1(dataset);
        } else if (lockid == 8) { // 密码锁
          that.deletelock8(dataset);
        } else if (lockid == 9) { // 其它
          that.deletelock9(dataset);
        } else if (lockid == 10) {// 身份证锁
          that.deletelock10(dataset);
        } else if (lockid == 11) {// 猫眼身份证锁
          that.deletelock10(dataset);
        } else if (lockid == 12) {// 蓝牙锁
          that.deletelock12(dataset);
        }
      }
    });
  },
  deletelock1({ lockid, lockname, username }) {
    utils.showLoading("请稍等");
    const that = this;
    that.setData({
      "lockid": lockid,
      "username": username,
      "lockname": lockname
    });
    utils.request1("/weboperate/resetLock", {
      "skey": app.globalData.skey,
      "lock_id": lockid,
      "userName": username,
      "lock_name": lockname
    }, e => {
      const { result, message, dataObject: keyParams } = e.data;
      if (result == "0") {
        wx.openBluetoothAdapter({
          success: res => {
            that.lanyaopen(keyParams);
          },
          fail: err => {
            wx.hideLoading();
            if (
              err.errMsg == "openBluetoothAdapter:fail:ble not available" ||
              err.errMsg == "openBluetoothAdapter:fail:not available" ||
              err.errCode == "10001"
            ) {
              utils.alertViewNosucces("提示", "您还没有开启蓝牙，请开启", false);
            } else {
              utils.alertViewNosucces("提示", err.errMsg, false);
            }
            wx.onBluetoothAdapterStateChange(res => {
              if (res.available) {
                utils.showLoading("请稍等...");
                setTimeout(() => wx.hideLoading(), 2000);
              }
            })
          }
        })
      } else if (result == "2") {
        utils.alertView("提示", "你已退出，请点击“确认”重新登录", () => app.getLogin());
      } else {
        utils.alertViewNosucces("提示", message + " ", false);
      }
    })
  },
  deletelock8({ lockid, lockname }) { },
  deletelock9({ lockid, lockname }) { },
  deletelock10({ lockid, lockname }) {
    const that = this;
    utils.showLoading("请稍等...");
    utils.request1("/weboperate/delLock", {
      "skey": app.globalData.skey,
      "lock_id": lockid,
      "lock_name": lockname
    }, ({ data: { result, errorCode, message, dataObject } }) => {
      wx.hideLoading();
      if (result == "0") {
        setTimeout(function () {
          if (errorCode == "0000000") {
            utils.showSuccess("锁删除成功", 2000, "success");
            that.setData({ state: "锁删除成功" });
            that.setData({
              allDataList: []
            });
            that.refreshNewData();
          }
        }, 2000);
      } else if (result == "2") {
        utils.alertView("提示", "你已退出，请点击“确认”重新登录", () => app.getLogin());
      } else {
        utils.alertViewNosucces("提示", message + " ", false);
      }
    })
  },
  deletelock11({ lockid, lockname }) { },
  deletelock12({ lockid, lockname }) {
    utils.showLoading("请稍等");
    let that = this;
    utils.request1("/weboperate/delLock", {
      "skey": app.globalData.skey,
      "lock_id": lockid,
      "lock_name": lockname
    }, ({ data: { result, errorCode, message, dataObject: hexStr } }) => {
      wx.hideLoading();
      if (result == "0") {
        setTimeout(function () {
          if (errorCode == "0000000") {
            utils.showSuccess("锁删除成功", 2000, "success");
            that.setData({ state: "锁删除成功" });
            that.setData({
              allDataList: []
            });
            that.refreshNewData();
          }
        }, 2000);
      } else if (result == "2") {
        utils.alertView("提示", "你已退出，请点击“确认”重新登录", () => app.getLogin());
      } else {
        utils.alertViewNosucces("提示", message, false);
      }
    });
  },

  writeBLECharacteristicValue(deviceId, value, success) {
    wx.writeBLECharacteristicValue({
      deviceId: deviceId,
      serviceId: serviceId,
      characteristicId: write,
      value: value,
      success: success,
      fail: res => console.log(res)
    });
  },


  //--删除蓝牙密码锁
  /** 执行开锁操作（入口）*/
  lanyaopen(keyParams) {
    let that = this;
    that.setData({
      state: '正在开启蓝牙设备',
    });
    wx.openBluetoothAdapter({
      success: function (res) {
        /** 三代锁并且是android 则可以直接连接 **/
        if (plugin.getLockType(keyParams.lockVersion) === plugin.LOCK_TYPE_V3 && platform === "android") {
          that.setData({
            state: '安卓搜索三代锁并尝试开启中...'
          });
          that.connect2BleLock(keyParams);
        } else {
          /** 开启蓝牙设备搜索 **/
          that.setData({
            state: '正在开启蓝牙设备搜索...'
          });
          wx.startBluetoothDevicesDiscovery({
            services: [plugin.LOCK_BLE_UUID],
            allowDuplicatesKey: false,
            interval: 0,
            success: function (res) {
              // 搜索设备超时
              scanDeviceTimer = setTimeout(() => {
                wx.stopBluetoothDevicesDiscovery({});
                that.setData({
                  state: '搜索不到相关设备,停止搜索',
                })
              }, 10000)
              /** 获取设备平台信息android和ios有部分回调表现有差异 **/
              if (platform == "ios") {
                that.scanDeviceForExist(keyParams);
              } else {
                that.scanDeviceForDynamic(keyParams);
              }
            },
            fail: function (res) {
              that.setData({
                state: '开启蓝牙设备搜索失败',
              })
            }
          })
        }
      },
      fail: function (res) {
        utils.alertViewNosucces("提示", "您还没有开启蓝牙，请开启", false);
        wx.onBluetoothAdapterStateChange(function (res) {
          if (res.available) {
            utils.showLoading("开启中...");
            setTimeout(function () {
              wx.hideLoading();
            }, 4000);
          }
        })
        that.setData({
          state: '开启蓝牙设备失败',
        });
      }
    })
  },
  /**重置借口调用*/
  connect2BleLock(keyParams) {
    let that = this
    console.log('正在重置---' + keyParams.lockName);
    console.log(keyParams);
    plugin.resetLock(keyParams.lockMac, keyParams.uid, keyParams.lockVersion, keyParams.adminPwd, keyParams.lockKey, keyParams.lockFlagPos, keyParams.aesKeyStr, that.openDoorResultCallBack);
  },
  /**iOS搜索设备该接口回调目前ios有效*/
  scanDeviceForExist(keyParams) {
    let that = this;
    wx.onBluetoothDeviceFound(res => that.scanForTargetDevice(res, keyParams));
  },
  /**搜索设备该接口回调android使用，非三代锁执行*/
  scanDeviceForDynamic(keyParams) {
    let that = this
    wx.getBluetoothDevices({
      success: function (res) {
        that.scanForTargetDevice(res, keyParams);
      },
      fail: function (res) {
        clearTimeout(scanDeviceTimer);
        wx.stopBluetoothDevicesDiscovery({});
        this.setData({
          state: '搜索不到相关设备',
        });
      }
    })
  },
  /**搜索设备该接口回调android使用，非三代锁执行*/
  scanForTargetDevice(res, keyParams) {
    let that = this;
    that.setData({
      state: '设备搜索中...'
    });
    let DeviceArray = res.devices;
    for (let i = 0; i < DeviceArray.length; i++) {
      console.log("-扫描周边蓝牙设备---devices==" + DeviceArray[i].name);
      if (DeviceArray[i].name == keyParams.lockName) {
        that.setData({
          state: '设备已找到, 正在开锁...'
        });
        clearTimeout(scanDeviceTimer);
        that.connect2BleLock(DeviceArray[i].deviceId);
        wx.stopBluetoothDevicesDiscovery({});
        return;
      }
    }
  },
  /**重置结果回调*/
  openDoorResultCallBack(res) {
    var that = this;
    console.log('重置锁返回结果', res);
    if (res.resultCode == 1) {
      utils.request1("/weboperate/delLock", {
        "skey": app.globalData.skey,
        "lock_id": that.data.lockid,
        "userName": that.data.username,
        "lock_name": that.data.lockname
      }, function (e) {
        wx.hideLoading();
        if (e.data.result == "0") {
          utils.showSuccess("锁删除成功", 2000, "success");
          setTimeout(function () {
            that.setData({
              state: "锁删除成功",
            });
            that.setData({
              allDataList: []
            });
            that.refreshNewData();
          }, 2000);
        } else if (e.data.result == "2") {
          utils.alertView("提示", "你已退出，请点击“确认”重新登录", () => app.getLogin());
        } else {
          utils.alertViewNosucces("提示", e.data.message + " ", false);
        }
      })
    } else {
      wx.hideLoading();
      setTimeout(function () {
        that.setData({
          state: "锁删除失败"
        });
      }, 5000)
    }
  },
});