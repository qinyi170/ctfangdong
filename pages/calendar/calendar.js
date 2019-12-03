const app = getApp();
var utils = require("../../utils/util.js");
Page({
  data: {
    net_house_id:"",
    net_house_name:"",
    lock_id:"",
    lock_type:"",
    year: 0,
    month: 0,
    day:0,
    date: ['日', '一', '二', '三', '四', '五', '六'],
    dateArr: [],
    dataMoneyArr:[],
    isToday: 0,
    isTodayWeek: false,
    todayIndex: 0
  },
  
  onLoad: function (options) {
    this.setData({
      net_house_id: options.nethouseid,
      net_house_name: options.nethousename,
      lock_id: options.lockid,
      lock_type: options.locktype
    })
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    let day = now.getDate();
    let week = now.getDay();
    let returned_date;
    if (week === 1) {
      returned_date = '星期一';
    } else if (week === 2) {
      returned_date = '星期二';
    } else if (week === 3) {
      returned_date = '星期三';
    } else if (week === 4) {
      returned_date = '星期四';
    } else if (week === 5) {
      returned_date = '星期五';
    } else if (week === 6) {
      returned_date = '星期六';
    } else if (week === 0) {
      returned_date = '星期日';
    }
    this.setData({
      year: year,
      oldyear: year,
      month: month,
      oldmonth: month,
      returned_date: returned_date,
      day: day,
      isToday: '' + year + month + day
    })
  },
  onShow:function(){
    this.active(this.data.year, this.data.month * 1 - 1);
  },
  active(year, month) { 
    utils.showLoading("请稍等")
    var athis = this;
    utils.request1("/weboperate/queryHouseStateById", {
      "skey": app.globalData.skey,
      "net_house_id": athis.data.net_house_id,
      "startDate": utils.changeYearAndMonth(year, month, 1),
      "type":2
    }, function (e) {
      wx.hideLoading();
      if (e.data.result == "0") {
        athis.setData({
          dataMoneyArr:e.data.dataObject.data
        })
        athis.dateInit(year, month);
      } else if (e.data.result == "2") {
        utils.alertView("提示", "你已退出，请点击“确认”重新登录", function () {
          app.getLogin();
        })
      } else {
        utils.alertViewNosucces("提示", e.data.message + " ", false);
      }
    })
  },
  dateInit: function (setYear, setMonth) {
    //全部时间的月份都是按0~11基准，显示月份才+1
    let dateArr = [];                       //需要遍历的日历数组数据
    let arrLen = 0;                         //dateArr的数组长度
    let now = setYear ? new Date(setYear, setMonth) : new Date();
    let year = setYear || now.getFullYear();
    let nextYear = 0;
    let month = setMonth || now.getMonth();                 //没有+1方便后面计算当月总天数
    let nextMonth = (month + 1) > 11 ? 1 : (month + 1);
    let startWeek = new Date(year + ',' + (month + 1) + ',' + 1).getDay();                          //目标月1号对应的星期
    let dayNums = new Date(year, nextMonth, 0).getDate();               //获取目标月有多少天
    let obj = {};
    let num = 0;
    if (month + 1 > 11) {
      nextYear = year + 1;
      dayNums = new Date(nextYear, nextMonth, 0).getDate();
    }
    arrLen = startWeek + dayNums;
    for (let i = 0; i < arrLen; i++) {
      if (i >= startWeek) {
        num = i - startWeek + 1;
        var daystate=2;
        if (setYear<this.data.oldyear){
          daystate = 1
        }
        if (setYear == this.data.oldyear){
          if ((setMonth * 1 + 1)<this.data.oldmonth) {
            daystate = 1
          }
          if ((setMonth * 1 + 1) == this.data.oldmonth) {
            if (num < this.data.day) {
              daystate = 1
            }
          }
        }
        var houseusestate = this.data.dataMoneyArr[num-1].house_use_state
        if (houseusestate != 0 && this.data.dataMoneyArr[num - 1].tonight_order==""){
          if (houseusestate!=4){
            houseusestate = 0;
          } 
        }
        if (daystate == 1){
          var temporderlist=this.data.dataMoneyArr[num - 1].orderList;
          if (temporderlist.length!=0){
            for (var j = 0; j < temporderlist.length; j++) {
              if (temporderlist[j].check_state == "retreat") {
                houseusestate = 11
              }
            }
          }
        }
        obj = {
          daystate: daystate,
          isToday: '' + year + (month + 1) + num,
          dateNum: num,
          price: "￥" + this.data.dataMoneyArr[num - 1].price,
          house_use_state: houseusestate,
          orderlist: this.data.dataMoneyArr[num - 1].orderList,
          orderid: this.data.dataMoneyArr[num - 1].tonight_order
        }
      } else {
        obj = {};
      }
      dateArr[i] = obj;
    }
    this.setData({
      dateArr: dateArr
    })
    let nowDate = new Date();
    let nowYear = nowDate.getFullYear();
    let nowMonth = nowDate.getMonth() + 1;
    let nowWeek = nowDate.getDay();
    let getYear = setYear || nowYear;
    let getMonth = setMonth >= 0 ? (setMonth + 1) : nowMonth;
    if (nowYear == getYear && nowMonth == getMonth) {
      this.setData({
        isTodayWeek: true,
        todayIndex: nowWeek
      })
    } else {
      this.setData({
        isTodayWeek: false,
        todayIndex: -1
      })
    }
  },
  /**
   * 上月切换
   */
  lastMonth: function () {
    //全部时间的月份都是按0~11基准，显示月份才+1
    let year = this.data.month - 2 < 0 ? this.data.year - 1 : this.data.year;
    let month = this.data.month - 2 < 0 ? 11 : this.data.month - 2;
    this.setData({
      year: year,
      month: (month + 1)
    })
    this.active(year, month);
  },
  /**
   * 下月切换
   */
  nextMonth: function () {
    //全部时间的月份都是按0~11基准，显示月份才+1
    let year = this.data.month > 11 ? this.data.year + 1 : this.data.year;
    let month = this.data.month > 11 ? 0 : this.data.month;
    this.setData({
      year: year,
      month: (month + 1)
    })
    this.active(year, month);
  },
  lookHuoDong: function (e) {
    console.log(e)
    var temp = e.currentTarget.dataset.housesatte;
    if (temp.daystate==1){
      if (temp.house_use_state == "11") {
        var order_id = "";
        for (var i = 0; i < temp.orderlist.length; i++) {
          if (temp.orderlist[i].check_state == "retreat") {
            order_id = temp.orderlist[i].order_id
          }
        }
        wx.navigateTo({
          url: '../order/ordermsg?orderid=' + order_id,
        })
        return;
      }
      wx.showToast({
        title: "不可订",
        icon: "none",
      });
    }else{
      if (temp.house_use_state==0){
        var startdate
        if (temp.orderlist==""){
          startdate = utils.changeYearAndMonth(this.data.year, this.data.month * 1 - 1, temp.dateNum);
          wx.navigateTo({
            url: '../order/ordercreate?nethouseid=' + this.data.net_house_id + "&nethousename=" + this.data.net_house_name + "&lockid=" + this.data.lock_id + "&locktype=" + this.data.lock_type + "&startdate=" + startdate + " 14:00:00" + "&stopdate=" + utils.getAllDate(startdate, 1) + " 12:00:00",
          })
        }else{
          var orderlist = temp.orderlist;
          var tempordertime=0;
          for (var i = 0; i < orderlist.length;i++){
            if (orderlist[i].reside_retreat_date > tempordertime){
              tempordertime = orderlist[i].reside_retreat_date;
            }
          }
          var tempdatetime = utils.changeDate1(tempordertime);
          var tempdatetimeandhour = utils.getDateWhereType("hour",tempdatetime,0);
          if (tempdatetimeandhour<12){
            startdate = utils.getAllDate(tempdatetime, 0) + " 14:00:00"
          }else{
            startdate = utils.getAllDateTime(tempdatetime, 2,1);
          }
          wx.navigateTo({
            url: '../order/ordercreate?nethouseid=' + this.data.net_house_id + "&nethousename=" + this.data.net_house_name + "&lockid=" + this.data.lock_id + "&locktype=" + this.data.lock_type + "&startdate=" + startdate + "&stopdate=" + utils.getAllDate(startdate, 1) + " 12:00:00",
          })
        }
      } else if (temp.house_use_state == 4) {
        wx.showToast({
          title: "不可订",
          icon: "none",
        });
      } else {
        wx.navigateTo({
          url: '../order/ordermsg?orderid=' + temp.orderid,
        })
      }
    }
  }
})