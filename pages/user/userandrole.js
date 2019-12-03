const app = getApp()
var utils = require("../../utils/util.js");
Page({
  goRoleAdmin(){
    wx.navigateTo({
      url: '../user/userandrole/rolelist',
    })
  },
  goUserAdmin(){
    wx.navigateTo({
      url: '../user/userandrole/userlist',
    })
  },
})