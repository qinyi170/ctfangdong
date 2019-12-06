const app = getApp();
var utils = require("../../utils/util.js");
var plugin = requirePlugin("myPlugin");
var tiemrs
Page({
  data: {
    net_house_id: "",
    seachstate: "1",
    blesatte: "1",
    keyParams: "",
    devices:[]
  },
  onLoad: function (options) {
    console.log(options)
    this.setData({
      net_house_id: options.nethouseid,
      lock_brand: options.lockbrand
    })
  },
  onUnload() {
    clearInterval(tiemrs);
  },
  gosearchlock: function () {
    var athis = this;
    wx.openBluetoothAdapter({
      success: (res) => {
        athis.setData({
          seachstate: "2"
        })
        athis.startScanBleDevice()
      },
      fail: (res) => {
        wx.hideLoading();
        if (res.errMsg == "openBluetoothAdapter:fail:ble not available" || res.errMsg == "openBluetoothAdapter:fail:not available" || res.errCode == "10001") {
          utils.alertViewNosucces("提示", "您还没有开启蓝牙，请开启", false);
        } else {
          utils.alertViewNosucces("提示", res.errMsg, false);
        }
        wx.onBluetoothAdapterStateChange(function (res) {
          if (res.available) {
            if (athis.data.blesatte == "1") {
              athis.setData({
                blesatte: "2"
              })
              utils.showLoading("请稍等...");
              setTimeout(function () {
                wx.hideLoading();
                //this.openblue();
              }, 2000);
            }
          } else {
            athis.setData({
              blesatte: "1"
            })
          }
        })
      }
    })
  },
  startScanBleDevice: function () {
    var athis=this;
    tiemrs=setInterval(function () {
      plugin.startScanBleDevice(function (lockDevice) {
        console.log(lockDevice)
        if (!lockDevice.lockName) {
          return
        }
        var foundDevices = athis.data.devices
        var idx = inArray(foundDevices, 'deviceId', lockDevice.deviceId);
        var data={};
        console.log(idx)
        if (idx == -1) {
          data[`devices[${foundDevices.length}]`] = lockDevice
          //foundDevices[foundDevices.length] = lockDevice
        } else {
          data[`devices[${idx}]`] = lockDevice
          //foundDevices[idx] = lockDevice
        }
        athis.setData(data)
        // athis.setData({
        //   devices: foundDevices
        // });
      })
      console.log(athis.data.devices)
    }, 2000);
  },
  addlock:function(e){
    clearInterval(tiemrs);
    utils.showLoading("请稍等");
    var athis=this;
    var newlock = athis.data.devices[e.currentTarget.dataset.indexid];
    plugin.initLock(newlock, function (initLockResult) {
      console.log(initLockResult)
      if (initLockResult.resultCode==1){
        app.globalData.lockarrry = newlock;
        app.globalData.lockData = initLockResult.lockData;   
        utils.request1("/weboperate/initLock", {
          "skey": app.globalData.skey,
          "net_house_id": athis.data.net_house_id,
          "lock_data": initLockResult.lockData,
          "lock_name": newlock.lockName,
          "lock_brand": athis.data.lock_brand
        }, function (respass) {
          wx.hideLoading();
          if (respass.data.result == 0) {
            wx.navigateBack({
              delta: 1
            })
          } else {
            utils.alertViewNosucces("提示", respass.data.message, false);
          }
        })
      }else{
        utils.alertViewNosucces("提示", initLockResult.errorMsg + " ", false);
      }
    });
  }
})
function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] == val) {
      return i;
    }
  }
  return -1;
}