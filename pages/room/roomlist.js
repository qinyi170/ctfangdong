const app = getApp()
var utils = require("../../utils/util.js");
const bluetooth = require("../../utils/bluetooth.js");
var plugin = requirePlugin("myPlugin");
let platform = '';
let scanDeviceTimer = null;
let dev = {};
const serviceId = '0000FFE0-0000-1000-8000-00805F9B34FB';
const write = '0000FFE1-0000-1000-8000-00805F9B34FB';
const notify = '0000FFE2-0000-1000-8000-00805F9B34FB';
Page({
  data: {
    allDataList: [],
    scrollheight: "height:" + (app.globalData.pheight - 185) + "px",
    movableheight: (app.globalData.pheight - 70 - 48 - 53) + "px",
    morestate: "1",
    roomstate: "3",//状态
    medalstate: "1",
    medaltitle: "1",
    medalshowstate: "1",
    phone_operate: "",
    searchtitle: "",
    keyParams: "",
    medalstate1: "1",
    medalmsg: "1",
    enablestate: "立即开门",
    enable: true,
    state: '请点击按钮开锁',
  },
  onLoad: function (options) {
    platform = wx.getSystemInfoSync().system.split(' ')[0].toLowerCase();
  },
  onShow: function () {
    this.setData({
      allDataList: []
    });
    this.queryOperateInfo();
  },
  onHide: function () {
    this.setData({
      morestate: 1
    })
  },
  //下拉刷新
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.setData({
      morestate: 1
    })
    this.refreshNewData();
  },
  //判断是否登记
  queryOperateInfo: function () {
    var athis = this;
    utils.request1("/weboperate/queryOperateInfo", {
      "skey": app.globalData.skey
    }, function (e) {
      console.log("queryOperateInfo", e)
      wx.hideLoading();
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
        } else {
          athis.setData({
            medalstate: "1",
            medaltitle: "1",
            roomstate: "3",
          })
          athis.refreshNewData();
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
        "startSize": "0",
        "query_param": athis.data.searchtitle
      }
    } else {
      fundatas = {
        "skey": app.globalData.skey,
        "startSize": athis.data.allDataList.length,
        "query_param": athis.data.searchtitle
      }
    }
    utils.request1("/weboperate/queryOperateNetHouser", fundatas, function (e) {
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
      wx.hideLoading();
      if (e.data.result == "0") {
        if (e.data.errorCode == "0103005") {
          if (athis.data.medalshowstate == "1") {
            athis.setData({
              medalstate: "2",
              medaltitle: "1",
              medalshowstate: "2"
            });
          }
          athis.setData({
            roomstate: "2",
            phone_operate: e.data.dataObject.phone_operate
          });
        } else {
          var datainfo = e.data.dataObject;
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
  //加载更多房源
  loadMoreData: function () {
    this.setData({
      morestate: "2"
    })
    this.refreshNewData();
  },
  //
  crolltoupper: function () {
    console.log(1)
  },
  //通过搜索框检索数据
  getsearchcon: function (e) {
    this.setData({
      morestate: "1",
      searchtitle: e.detail.value
    })
    this.refreshNewData();
  },
  //房源详情
  roommsg: function (e) {
    wx.navigateTo({
      url: '../room/roommsgmodel?nethouseid=' + e.currentTarget.dataset.nethouseid
    })
  },
  //创建房源
  createroom: function (e) {
    var athis = this;
    utils.request1("/weboperate/queryOperateInfo", {
      "skey": app.globalData.skey
    }, function (e) {
      wx.hideLoading();
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
        if (e.data.errorCode == "0202002") {
          wx.showModal({
            title: '提示',
            content: '您的经营者信息正在审核中，是否要创建房源？',
            success(res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '../room/roomupdate'
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        } else {
          wx.navigateTo({
            url: '../room/roomupdate'
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
  //绑定门锁
  bindlock: function (e) {
    wx.navigateTo({
      url: '../room/bindlock?nethouseid=' + e.currentTarget.dataset.nethouseid + "&locktype=" + e.currentTarget.dataset.locktype
    })
  },
  //绑定经营者手机号
  gobindphone: function () {
    this.setData({
      medalstate: "1"
    })
    wx.navigateTo({
      url: '../user/bindphone'
    })
  },
  //绑定经营者信息
  gocreateproprietor: function () {
    this.setData({
      medalstate: "1"
    })
    wx.navigateTo({
      url: '../proprietor/proprietorupdate',
    })
  },

  openLockSitong() {
    let that = this;
    let { lockid, lockname, locktype, nethouseid } = that.data;
    bluetooth.openBluetoothAdapter(bluetooth.startBluetoothDevicesDiscovery, ({ devices }) => {
      that.setData({
        enable: false,
        state: '正在开启蓝牙设备',
        enablestate: "开启中"
      });

      let device
      for (let i = 0, len = devices.length; i < len; i++) {
        device = devices[i];
        if (device.name.trim() == lockname) {
          break;
        }
      }
      if (device.name.trim() != lockname) return
      bluetooth.stopBluetoothDevicesDiscovery();

      let deviceId = device.deviceId;
      bluetooth.createBLEConnection({
        lockname,
        deviceId,
        serviceId,
        notifyCharacteristicId: notify,
        createBLEConnectionSuccess: () => { dev.deviceId = deviceId },
        onBLECharacteristicValueChange: hex => {
          console.log("接收到蓝牙回调。。。");
          //   将16进制字符串发送到服务器
          utils.request1("/weboperate/openLockCallback", {
            "skey": app.globalData.skey,
            "lock_id": lockid,
            "hexStr": hex,
            "net_house_id": nethouseid,
            "lock_name": lockname
          }, ({ data: { result, errorCode, message, dataObject: hexStr } }) => {
            console.log(result, errorCode, message, hexStr);
            if (result == "0") {
              if (errorCode == "0000000") {
                if (hexStr == 24) { // 获取令牌成功，调用开锁接口
                  console.log("开锁...");
                  utils.request1("/weboperate/openLockByBluetooth", {
                    "skey": app.globalData.skey,
                    "lock_id": lockid,
                    "net_house_id": nethouseid,
                    "lock_name": lockname
                  }, ({ data: { result, errorCode, message, dataObject: hexStr } }) => {
                    console.log(result, errorCode, message, hexStr);
                    if (result == "0") {
                      if (errorCode == "0000000") {
                        that.writeBLECharacteristicValue(deviceId, bluetooth.hexStr2byte(hexStr), () => console.log("输出开锁命令成功"));
                      }
                    } else if (result == "2") {
                      utils.alertView("提示", "你已退出，请点击“确认”重新登录", () => app.getLogin());
                    } else {
                      utils.alertViewNosucces("提示", message, false);
                    }
                  });
                } else if (hexStr == 31) { // 开锁成功，删除所有开锁密码
                  console.log("开锁成功，删除所有开锁密码...");
                  utils.request1("/weboperate/deleteAllPwd", {
                    "skey": app.globalData.skey,
                    "lock_id": lockid,
                    "net_house_id": nethouseid,
                    "lock_name": lockname
                  }, ({ data: { result, errorCode, message, dataObject: hexStr } }) => {
                    console.log(result, errorCode, message, hexStr);
                    if (result == "0") {
                      if (errorCode == "0000000") {
                        setTimeout(() => { // 等待关锁
                          that.writeBLECharacteristicValue(deviceId, bluetooth.hexStr2byte(hexStr), () => console.log("输出删除所有密码命令成功"));
                        }, 8000);
                      }
                    } else if (result == "2") {
                      utils.alertView("提示", "你已退出，请点击“确认”重新登录", () => app.getLogin());
                    } else {
                      utils.alertViewNosucces("提示", message, false);
                    }
                  });
                } else if (hexStr == 116) { // 删除成功，设置新的开锁密码（分两步：1、设置密码id,2、设置密码）
                  console.log("删除成功，设置新的开锁密码ID...");
                  utils.request1("/weboperate/addPwdId", {
                    "skey": app.globalData.skey,
                    "lock_id": lockid,
                    "net_house_id": nethouseid,
                    "lock_name": lockname
                  }, ({ data: { result, errorCode, message, dataObject: hexStr } }) => {
                    console.log(result, errorCode, message, hexStr);
                    if (result == "0") {
                      if (errorCode == "0000000") {
                        that.writeBLECharacteristicValue(deviceId, bluetooth.hexStr2byte(hexStr), () => console.log("输出密码ID成功"));
                      }
                    } else if (result == "2") {
                      utils.alertView("提示", "你已退出，请点击“确认”重新登录", () => app.getLogin());
                    } else {
                      utils.alertViewNosucces("提示", message, false);
                    }
                  });
                } else if (hexStr == 113) {// 开锁密码ID设置成功，设置新的开锁密码
                  console.log("开锁密码ID设置成功，设置新的开锁密码...");
                  utils.request1("/weboperate/addPwd", {
                    "skey": app.globalData.skey,
                    "lock_id": lockid,
                    "net_house_id": nethouseid,
                    "lock_name": lockname
                  }, ({ data: { result, errorCode, message, dataObject: hexStr } }) => {
                    console.log(result, errorCode, message, hexStr);
                    if (result == "0") {
                      if (errorCode == "0000000") {
                        that.writeBLECharacteristicValue(deviceId, bluetooth.hexStr2byte(hexStr), () => console.log("输出密码成功"));
                      }
                    } else if (result == "2") {
                      utils.alertView("提示", "你已退出，请点击“确认”重新登录", () => app.getLogin());
                    } else {
                      utils.alertViewNosucces("提示", message, false);
                    }
                  });
                } else {
                  that.setData({ enable: true });
                  wx.closeBLEConnection({ // 断开蓝牙连接
                    deviceId: deviceId
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
        success: () => {
          setTimeout(() => {
            utils.request1("/weboperate/getAdminPwd", {
              "skey": app.globalData.skey,
              "lock_id": lockid,
              "lock_name": lockname
            }, ({ data: { result, errorCode, message, dataObject } }) => {
              if (result == "0") {
                // 将二进制报文发送到蓝牙设备
                that.writeBLECharacteristicValue(deviceId, bluetooth.hexStr2byte(dataObject.adminPwd), () => console.log("输出管理员命令成功"));
              } else if (result == "2") {
                utils.alertView("提示", "你已退出，请点击“确认”重新登录", () => app.getLogin());
              } else {
                utils.alertViewNosucces("提示", message, false);
              }
            });
          }, 500);
        }
      });
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

  //一键开门
  openroom: function ({ currentTarget: { dataset: { lockid, lockname, locktype, nethouseid } } }) {
    var athis = this;
    if (lockid == 12) {
      athis.setData({
        medalstate1: "2",
        lockid,
        lockname,
        locktype,
        nethouseid
      })
      // this.openLockSitong({ lockid, lockname, locktype, nethouseid });
      return;
    }
    if (locktype == "0000") {
      utils.showLoading("请稍等");
      utils.request1("/weboperate/openLockByBluetooth", {
        "skey": app.globalData.skey,
        "net_house_id": nethouseid
      }, function (res1) {
        wx.hideLoading();
        if (res1.data.result == "0") {
          var s = res1.data.dataObject
          var roomss = {
            "lockMac": s.lockMac,
            "uid": s.uid,
            lockName: s.lockName,
            "lockVersion": {
              "showAdminKbpwdFlag": s.lockVersion.showAdminKbpwdFlag,
              "groupId": s.lockVersion.groupId,
              "protocolVersion": s.lockVersion.protocolVersion,
              "protocolType": s.lockVersion.protocolType,
              "orgId": s.lockVersion.orgId,
              "logoUrl": s.lockVersion.logoUrl,
              "scene": s.lockVersion.scene
            },
            timezoneRawOffSet: s.timezoneRawOffset,
            "startDate": s.startDate,
            "endDate": s.endDate,
            "lockKey": s.lockKey,
            lockFlagPos: s.lockFlagPos,
            aesKeyStr: s.aesKeyStr
          }
          athis.setData({
            keyParams: roomss,
            medalstate1: "2",
            medalmsg: "1",
            seqNum: s.seqNum,
            lock_brand: s.lock_brand,
            open_net_house_id: nethouseid
          })
        } else {
          if (!res1.data.result) {
            utils.alertViewNosucces("提示", "服务未响应，请稍后再试", false);
            return;
          }
          utils.alertViewNosucces("提示", res1.data.message + "", false);
        }
      })
    } else if (locktype == "0100") {
      athis.setData({
        medalstate1: "2",
        medalmsg: "2"
      })
    } else if (locktype == "0200") {
      utils.showLoading("请稍等");
      utils.request1("/weboperate/openLockByPassword", {
        "skey": app.globalData.skey,
        "net_house_id": nethouseid
      }, function (res1) {
        wx.hideLoading();
        if (res1.data.result == "0") {
          athis.setData({
            mima: JSON.parse(res1.data.dataObject).pwd,
            medalstate1: "2",
            medalmsg: "3"
          })
        } else {
          if (!res1.data.result) {
            utils.alertViewNosucces("提示", "服务未响应，请稍后再试", false);
            return;
          }
          utils.alertViewNosucces("提示", res1.data.message + "", false);
        }
      })
    } else if (locktype == "9999") {
      athis.otherLock(roomcode);
    } else {
      utils.alertViewNosucces("提示", "请先绑定门锁", false);
    }
  },
  //判断其它锁的情况
  otherLock: function (oauthcode) {
    utils.request1("/weboperate/order/otherLock", {
      "skey": app.globalData.skey,
      "oauth_code": oauthcode
    }, function (res2) {
      console.log("otherLock", res2)
      if (res2.data.result == "0") {
        utils.alertViewNosucces("提示", res2.data.message + "", false);
      } else {
        if (!res2.data.result) {
          utils.alertViewNosucces("提示", "服务未响应，请稍后再试", false);
          return;
        }
        utils.alertViewNosucces("提示", res2.data.message + "", false);
      }
    })
  },
  //关闭弹出框
  closemedal: function () {
    dev.deviceId && wx.closeBLEConnection({
      deviceId: dev.deviceId
    })
    this.setData({
      medalstate: "1",
      medalstate1: "1",
      enable: true
    })
  },


  /**
     * iOS搜索设备该接口回调目前ios有效
     */
  scanDeviceForExist() {
    let that = this;
    wx.onBluetoothDeviceFound(function (res) {
      that.scanForTargetDevice(res);
    })
  },

  /**
   * 搜索设备该接口回调android使用，非三代锁执行
   */
  scanDeviceForDynamic() {
    let that = this
    wx.getBluetoothDevices({
      success: function (res) {
        that.scanForTargetDevice(res);
      },
      fail: function (res) {
        clearTimeout(scanDeviceTimer);
        wx.stopBluetoothDevicesDiscovery({});
        this.setData({
          state: '搜索不到相关设备',
          enable: true
        });
      }
    })
  },

  /**
   * 搜索设备该接口回调android使用，非三代锁执行
   */
  scanForTargetDevice(res) {
    let that = this;
    that.setData({
      state: '设备搜索中...'
    });

    let DeviceArray = res.devices;
    for (let i = 0; i < DeviceArray.length; i++) {
      console.log("-扫描周边蓝牙设备---devices==" + DeviceArray[i].name);
      if (DeviceArray[i].name == that.data.keyParams.lockName) {
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

  /**
   *  开锁借口调用
   */
  connect2BleLock(deviceId) {
    let that = this
    console.log('正在开锁---' + that.data.keyParams.lockName);
    console.log(that.data.keyParams);
    plugin.UnlockBleLock(deviceId, that.data.keyParams.uid, that.data.keyParams.lockVersion, that.data.keyParams.startDate, that.data.keyParams.endDate, that.data.keyParams.lockKey, that.data.keyParams.lockFlagPos, that.data.keyParams.aesKeyStr, that.data.keyParams.timezoneRawOffSet, that.openDoorResultCallBack);
  },
  /**
   * 开锁结果回调
   * @params res 开锁返回结果参数
   */
  openDoorResultCallBack(res) {
    var athis = this;
    console.log('开锁返回结果', res);
    if (res.success === 1) {
      utils.showLoading("请稍等");
      utils.request1("/weboperate/openLockCallback", {
        "skey": app.globalData.skey,
        "ackNum": athis.data.seqNum,
        "lockDate": res.lockDate,
        "success": res.success,
        "errCode": res.errCode,
        "errorMsg": res.errorMsg,
        "lock_brand": athis.data.lock_brand,
        "net_house_id": athis.data.open_net_house_id
      }, function (res1) {
        wx.hideLoading();
        if (res1.data.result == "0") {

        } else {
          if (!res1.data.result) {
            utils.alertViewNosucces("提示", "服务未响应，请稍后再试", false);
            return;
          }
          utils.alertViewNosucces("提示", res1.data.message + "", false);
        }
      })

      setTimeout(function () {
        athis.setData({
          enable: true,
          state: "开锁成功",
          enablestate: "立即开门"
        });
      }, 5000)
    } else {
      setTimeout(function () {
        athis.setData({
          enable: true,
          state: "开锁失败",
          enablestate: "立即开门"
        });
      }, 5000)
    }
  },

  /** 
   * 执行开锁操作（入口）
   */
  lanyaopen() {
    let that = this;
    if (that.data.lockid == 12) {
      this.openLockSitong({});
      return;
    }

    that.setData({
      enable: false,
      state: '正在开启蓝牙设备',
      enablestate: "开启中"
    });

    wx.openBluetoothAdapter({
      success: function (res) {
        /** 三代锁并且是android 则可以直接连接 **/
        if (plugin.getLockType(that.data.keyParams.lockVersion) === plugin.LOCK_TYPE_V3 && platform === "android") {
          that.setData({
            state: '安卓搜索三代锁并尝试开启中...'
          });
          that.connect2BleLock(that.data.keyParams.lockMac);
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
                  enable: true
                })
              }, 10000)

              /** 获取设备平台信息android和ios有部分回调表现有差异 **/
              if (platform == "ios") {
                that.scanDeviceForExist(that.data.keyParams);
              } else {
                that.scanDeviceForDynamic(that.data.keyParams);
              }
            },
            fail: function (res) {
              that.setData({
                state: '开启蓝牙设备搜索失败',
                enable: true
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
          enablestate: "立即开启",
          enable: true,
          state: '开启蓝牙设备失败',
        });
      }
    })
  },
  //转发功能
  onShareAppMessage: function (ops) {
    if (ops.from === 'button') {
      console.log(ops.target)
    }
    return {
      title: '网约房登记',
      path: 'pages/welcome/welcome',
      success: function (res) {
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function (res) {
        console.log("转发失败:" + JSON.stringify(res));
      }
    }
  }
})
