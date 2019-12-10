const app = getApp();
const utils = require("../../utils/util.js");
const bluetooth = require("../../utils/bluetooth.js");

const dev = {};

const serviceId = '0000FFE0-0000-1000-8000-00805F9B34FB';
const write = '0000FFE1-0000-1000-8000-00805F9B34FB';
const notify = '0000FFE2-0000-1000-8000-00805F9B34FB';

Page({
  //页面的初始数据
  data: {
    net_house_id: "",
    lock_brand: "",
    seachstate: "1",
    blesatte: "1",
    keyParams: "",
    devices: [],
    modalHidden: 0
  },

  // 生命周期函数--监听页面加载
  onLoad(options) {
    console.log(options)
    this.setData({
      net_house_id: options.nethouseid,
      lock_brand: options.lockbrand
    });
  },
  gosearchlock() {
    var that = this;
    bluetooth.openBluetoothAdapter(bluetooth.startBluetoothDevicesDiscovery, ({ devices }) => {
      this.setData({ seachstate: 2 });
      let device;
      const foundDevices = that.data.devices

      for (let i = 0, len = devices.length; i < len; i++) {
        device = devices[i];
        device.name = device.name.trim();
        console.log(device);
        if (!device.name || !device.name.startsWith("XY_")) {
          break;
        }
        console.log(device);
        const idx = inArray(foundDevices, 'deviceId', device.deviceId)
        const data = {}
        idx === -1 && (data[`devices[${foundDevices.length}]`] = device) || (data[`devices[${idx}`] = device)
        that.setData(data);
      }
    });
  },

  addlock({ currentTarget: { dataset: { lockname, deviceid: deviceId } } }) {
    // getAdminPwd
    // 如果是初始密码，重置密码，否则跟蓝牙锁交互判断密码是否正确
    let that = this;
    utils.showLoading("请稍等");
    let lock_brand = this.data.lock_brand;
    utils.request1("/weboperate/getAdminPwd", {
      "skey": app.globalData.skey,
      "lock_brand": lock_brand,
      "lock_name": lockname
    }, ({ data: { result, errorCode, message, dataObject } }) => {
      if (result == "0") {
        if (errorCode == "0000000") {
          let { status, adminPwd } = dataObject;
          if (status == 0) { // 需要设置管理员密码
            console.log("需要设置管理员密码")
            that.connection(deviceId, lock_brand, adminPwd, lockname, () => {
              wx.hideLoading();
              console.log("弹出输入密码框");
              that.setData({
                modalHidden: 1,
                lockname,
                deviceId
              });
              console.log(that.data.modalHidden)
            });
          } else {
            console.log("可以直接绑锁");
            that.connection(deviceId, lock_brand, adminPwd, lockname, () => {

              utils.request1("/weboperate/initLock", {
                "skey": app.globalData.skey,
                "net_house_id": that.data.net_house_id,
                "lock_name": lockname,
                "adminPwd": adminPwd,
                "lock_brand": lock_brand
              }, ({ data: { result, errorCode, message } }) => {
                if (result == "0") {
                  if (errorCode != "0000000") {
                    wx.hideLoading();
                    utils.alertViewNosucces("提示", message, false);
                  }
                  utils.request1("/weboperate/bindHouseLock", {
                    "skey": app.globalData.skey,
                    "net_house_id": that.data.net_house_id,
                    "lock_brand": lock_brand,
                    "lock_name": lockname,
                    "lock_version": "蓝牙锁",
                    "lock_type": "0000"
                  }, ({ data: { result, errorCode, message } }) => {
                    wx.closeBLEConnection({ // 断开蓝牙连接
                      deviceId: deviceId
                    });
                    if (result == "0") {
                      if (errorCode != "0000000") {
                        wx.hideLoading();
                        utils.alertViewNosucces("提示", message, false);
                      }
                      wx.hideLoading();
                      that.setData({ modalHidden: 0 });
                      wx.navigateBack({ delta: 2 });
                    } else if (result == "2") {
                      utils.alertView("提示", "你已退出，请点击“确认”重新登录", () => app.getLogin());
                    } else {
                      utils.alertViewNosucces("提示", message, false);
                    }
                  });
                } else if (result == "2") {
                  utils.alertView("提示", "你已退出，请点击“确认”重新登录", () => app.getLogin());
                } else {
                  utils.alertViewNosucces("提示", message, false);
                }
              });
            });
          }
        }
      } else if (result == "2") {
        utils.alertView("提示", "你已退出，请点击“确认”重新登录", () => app.getLogin());
      } else {
        utils.alertViewNosucces("提示", message, false);
      }
    });
  },

  connection(deviceId, lock_brand, pwd, lockname, callback) {
    let that = this;
    bluetooth.stopBluetoothDevicesDiscovery();
    // 先断开之前的蓝牙连接
    bluetooth.createBLEConnection({
      lockname: lockname,
      deviceId: deviceId,
      serviceId: serviceId,
      notifyCharacteristicId: notify,
      createBLEConnectionSuccess: () => {
        console.log("连接建立成功")
        dev.deviceId = deviceId;
        console.log(dev);
      },
      onBLECharacteristicValueChange: hex => {
        console.log("接收到蓝牙返回");
        // 将16进制字符串发送到服务器
        utils.request1("/weboperate/openLockCallback", {
          "skey": app.globalData.skey,
          "lock_brand": lock_brand,
          "net_house_id": that.data.net_house_id,
          "lock_name": lockname,
          hexStr: hex
        }, ({ data: { result, errorCode, message, dataObject: dat } }) => {
          console.log("获取到后台返回", result, errorCode, message, dat);
          if (result == "0") {
            if (errorCode == "0000000") {
              if (dat == 24) {
                callback();
              } else {
                let { cmd, code } = dat;
                if (cmd == 32 && code == 17) {
                  that.writeHigh();
                }
              }
            } else {
              wx.hideLoading();
              utils.alertViewNosucces("提示", message, false);
            }
          } else if (result == "2") {
            utils.alertView("提示", "你已退出，请点击“确认”重新登录", () => app.getLogin());
          } else {
            utils.alertViewNosucces("提示", message, false);
          }
        });
      },
      success: () => {
        setTimeout(() => {
          wx.writeBLECharacteristicValue({
            deviceId: deviceId,
            serviceId: serviceId,
            characteristicId: write,
            value: bluetooth.hexStr2byte(pwd),
            success: res => {
              console.log("发送报文成功");
            },
            fail: res => {
              console.log("发送报文失败", res)
            }
          });
        }, 500);
      }
    });
  },

  confirm() {
    utils.showLoading("请稍等");
    const that = this;
    const reg = /^\d+(\.\d+)?$/
    let { lock_brand, lockname: lock_name, adminPwd, net_house_id } = that.data;
    if (!adminPwd || adminPwd.length != 6 || !reg.test(adminPwd)) {
      utils.alertViewNosucces("提示", "请输入6位数字", false);
      wx.hideLoading();
      return;
    }
    utils.request1("/weboperate/changeAdminPwd", {
      "skey": app.globalData.skey,
      "lock_brand": lock_brand,
      "adminPwd": adminPwd,
      "lock_name": lock_name
    }, ({ data: { result, errorCode, message, dataObject: { high, low } } }) => {
      if (result == "0") {
        if (errorCode == "0000000") {
          that.setData({
            high: bluetooth.hexStr2byte(high),
            low: bluetooth.hexStr2byte(low)
          });
          that.writeLow();
        } else {
          wx.hideLoading();
          utils.alertViewNosucces("提示", message, false);
        }
      } else if (result == "2") {
        utils.alertView("提示", "你已退出，请点击“确认”重新登录", () => app.getLogin());
      } else {
        utils.alertViewNosucces("提示", message, false);
      }
    });
  },
  writeLow() {
    console.log("开始发送低位...");
    let that = this;
    wx.writeBLECharacteristicValue({
      deviceId: dev.deviceId,
      serviceId: serviceId,
      characteristicId: write,
      value: this.data.low,
      success: res => {
        console.log("低位发送成功...");
      },
      fail: res => console.log(res)
    });
  },
  writeHigh() {
    let that = this;
    let { lock_brand, lockname: lock_name, adminPwd, net_house_id } = that.data;
    console.log("开始发送高位...");
    wx.writeBLECharacteristicValue({
      deviceId: dev.deviceId,
      serviceId: serviceId,
      characteristicId: write,
      value: this.data.high,
      success: res => {
        console.log("高位发送成功...");
        utils.request1("/weboperate/initLock", {
          "skey": app.globalData.skey,
          "net_house_id": net_house_id,
          "lock_name": lock_name,
          "adminPwd": adminPwd,
          "lock_brand": lock_brand
        }, ({ data: { result, errorCode, message } }) => {
          if (result == "0") {
            if (errorCode != "0000000") {
              wx.hideLoading();
              utils.alertViewNosucces("提示", message, false);
            }
            utils.request1("/weboperate/bindHouseLock", {
              "skey": app.globalData.skey,
              "net_house_id": net_house_id,
              "lock_brand": lock_brand,
              "lock_name": lock_name,
              "lock_version": "蓝牙锁",
              "lock_type": "0000"
            }, ({ data: { result, errorCode, message } }) => {
              if (result == "0") {
                if (errorCode != "0000000") {
                  utils.alertViewNosucces("提示", message, false);
                }
                wx.closeBLEConnection({ // 断开蓝牙连接
                  deviceId: dev.deviceId
                });
                wx.hideLoading();
                that.setData({ modalHidden: 0 });
                wx.navigateBack({ delta: 2 });
              } else if (result == "2") {
                utils.alertView("提示", "你已退出，请点击“确认”重新登录", () => app.getLogin());
              } else {
                utils.alertViewNosucces("提示", message, false);
              }
            });
          } else if (result == "2") {
            utils.alertView("提示", "你已退出，请点击“确认”重新登录", () => app.getLogin());
          } else {
            utils.alertViewNosucces("提示", message, false);
          }
        });
      },
      fail: res => console.log(res)
    });
  },
  cancel() {
    this.setData({
      modalHidden: 0
    });
  },
  adminPwdInput(e) {
    this.setData({
      adminPwd: e.detail.value
    });
  }
})
function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
}