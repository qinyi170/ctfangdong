App({
  onLaunch: function (res) {
    var athis = this;
    wx.getSystemInfo({
      success: function (res) {
        console.log(res)
        athis.globalData.pixelRatio = res.pixelRatio;//手机屏幕高度
        athis.globalData.pheight = res.windowHeight;//手机屏幕高度
        athis.globalData.pwidth = res.screenWidth;//手机屏幕宽度
      }
    })
  },
  onShow: function(options){
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log("1"+res.hasUpdate)
    })
    updateManager.onUpdateReady(function (e) {
      console.log(e)
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })
    updateManager.onUpdateFailed(function () {
      // 新版本下载失败
    })
    if (options.scene == "1038") {
      if (options.referrerInfo.extraData != null){
        if(this.globalData.openstate == "1"){
          this.globalData.openstate = "2"
          this.globalData.showstate = 2
          this.globalData.minroute = options.referrerInfo.extraData
        }
      }else{
        this.globalData.showstate = 1
      }
    }
  },
  globalData: {
    skey: "",
    minroute:"",
    showstate:"1",//小程序跳转成功的状态
    //urls: "https://www.anezhu.net/operate",
    //urls1: "https://www.anezhu.net",
    //urls: "https://m.useid.cn/operate",
    //urls1: "https://m.useid.cn",
    //urls: "http://192.168.1.90:9013/operate",
    //urls1: "http://192.168.1.90:8080",
    //urls: "http://192.168.1.171:9003/operate",
    //urls1: "http://192.168.1.171:8080",
    urls: "http://192.168.1.58:9003/operate",
    urls1: "http://192.168.1.58:8080",
    //urls:"http://eidop.com:9002",
    //urls: "http://192.168.1.66:9003/operate",
    openstate:"1",
    phoneNumber:"",
    lock_brand: "",
    lockarrry:"",
    lockData:"",
    pcloginstate:"",//pc端登录状态
    openid:""//用户id
  },
  getLogin: function () {
    var skeys = this;
    // 登录
    wx.login({
      success: res => {
        wx.request({
          url: skeys.globalData.urls+"/onLogin",
          method: "post",
          data: {
            code: res.code
          },
          success: function (e) {
            if (e.data.dataObject) {
              skeys.globalData.skey = e.data.dataObject.skey;
              wx.request({
                url: skeys.globalData.urls1 + '/login/smsCode',
                method: "post",
                data: {
                  type: "3",
                  username: e.data.dataObject.phone
                },
                header: {
                  'content-type': 'application/json',
                },
                success: function (ee) {
                  if (ee.data.result == "0") {
                    skeys.globalData.pcloginstate = ee.data.dataObject;
                  }
                }
              })
            }
          }
        })
      }
    })
  }
})