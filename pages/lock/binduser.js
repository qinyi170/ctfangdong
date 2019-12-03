const app = getApp()
var utils = require("../../utils/util.js");
// pages/lock/binduser.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		net_house_id: '',
		userName:'',
		password:''

	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (e) {
		this.setData({
			net_house_id: e.net_house_id
		})
	},

	//获取用戶名
	getUserName: function (e) {
		this.setData({
			userName: e.detail.value
		})
	},
	//获取密碼
	getPassword: function (e) {
		this.setData({
			password: e.detail.value
		})
	},

	//表单提交
	loginBtnClick: function () {
		var athis = this;
		console.log("net_house_id= " + athis.data.net_house_id)
		if (athis.data.userName == "" || athis.data.userName.length ==0) {
			utils.alertViewNosucces("提示", "请输入用户名", false);
			return;
		}
		if (athis.data.password == "" || athis.data.password.length == 0) {
			utils.alertViewNosucces("提示", "请输入密码", false);
			return;
		}
		utils.showLoading("请稍等");
		var datass = {
			"skey": app.globalData.skey,
			"net_house_id": athis.data.net_house_id,
			"userName": athis.data.userName,
			"password": athis.data.password
		}
    utils.request1("/weboperate/bindOperate", datass, function (respass) {
			console.log("bindOperate", datass)
			wx.hideLoading();
			var ress = respass.data;
			if (ress.result == "0") {
				wx.switchTab({
					url: '../room/roomlist',
				})
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

	

	//表单提交
	bindOperate: function (data) {
		console.log("net_house_id= " + data.detail.value.net_house_id)//  {username: "hgj", password: "fsdfsd"}
		var userName = data.detail.value.userName
		var password = data.detail.value.password;
		var athis = this;
		if (userName == "") {
			utils.alertViewNosucces("提示", "请输入用户名", false);
			return;
		}
		if (password == "") {
			utils.alertViewNosucces("提示", "请输入密码", false);
			return;
		}
		utils.showLoading("请稍等");
		var datass = {
			"skey": app.globalData.skey,
			"net_house_id": data.detail.value.net_house_id,
			"userName": userName,
			"password": password
		}
    utils.request1("/weboperate/bindOperate", datass, function (respass) {
			console.log("bindOperate", datass)
			wx.hideLoading();
			var ress = respass.data;
			if (ress.result == "0") {
				wx.switchTab({
					url: '../room/roomlist',
				})
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
})