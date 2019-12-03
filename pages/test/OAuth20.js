Page({
  data: {

  },
  onLoad: function (options) {
    wx.request({
      url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx1ff5bbcd726e1ec7&secret=f009966739b06b8b681dc3c0c7c5755e',
      method: "GET",
      success: function (res) {
        console.log("xxx");
        console.log(res);
        that.setData({
          access_token: res.data.access_token,//获取到的access_token
        })
      }
    })
  }
})