const app = getApp()
var utils = require("../../utils/util.js");
var moment = require("../../utils/moment.js");
const date = new Date();
const years = [];
const months = [];
const days = [];
const hours = [];
const minutes = [];
//获取年
for (let i = date.getFullYear(); i <= date.getFullYear() + 5; i++) {
  years.push("" + i);
}
//获取月份
for (let i = 1; i <= 12; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  months.push("" + i);
}
//获取日期
for (let i = 1; i <= 31; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  days.push("" + i);
}
//获取小时
for (let i = 0; i < 24; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  hours.push("" + i);
}
//获取分钟
for (let i = 0; i < 60; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  minutes.push("" + i);
}
Page({
  data: {
    date1time: "",
    date2time: "",
    daycount: "1晚",//天数,
    istimesize: true,
    istimetitle: "",
    date1timeview: "",
    date2timeview: "",
    starttimeArray: [years, months, days, hours],
    stoptimeArray: [years, months, days, hours],
    starttimeIndex: [0, 9, 16, 10],
    stoptimeIndex: [0, 9, 16, 10],
    starthour: "14",
    stophour: "12",
    choosestarttime: '',
    choosestoptime:"",
    array: [],
    userroomnum: "",//选择的房源
    userroompassword: "",//门锁密码
    userroomorice:"",//价格
    roompeoplelength: 1,//入住人数
    reside_num_max:"",//最大入住人数
    infomsg: [{ "reside_name": "", "reside_id_num": "", "reside_phone": "" }],
    infolength: ["1"],
    medalstate: "1",
    net_house_id: "",
    net_house_name: "",
    roomqrcode: "",//生成的房源二维码
    isneedpwd: 2,
    timestate: "0",
    createstate:1,//判断添加订单的方式
    housenamestate:"1",
  },
  onLoad: function (e) {
    console.log(e)
    if (e.nethouseid != undefined) {
      this.setData({
        createstate:2,
        net_house_id: e.nethouseid,
        net_house_name: e.nethousename,
        date1time: e.startdate,
        date2time: e.stopdate,
      })
      this.isWritePass(e.lockid, e.locktype)
    }
    this.getNowDate();
    if (this.data.createstate==1){
      this.getrooms();
    }
  },
  //获取当前时间和后一天时间
  getNowDate: function () {
    var startnowyear, stopnowyear, startnowmonth, stopnowmonth, startnowday, stopnowday, startnowhour, stopnowhour;
    var athis = this;
    utils.showLoading("请稍等")
    utils.request1("/weboperate/queryResideTime", {
      "skey": app.globalData.skey
    }, function (e) {
      console.log(e)
      wx.hideLoading();
      if (e.data.result == "0") {
        if (athis.data.createstate == 1) {
          startnowyear = utils.getDateWhereType("year", "", 0);
          stopnowyear = utils.getDateWhereType("year", "", 1);
          startnowmonth = utils.getDateWhereType("month", "", 0);
          stopnowmonth = utils.getDateWhereType("month", "", 1);
          startnowday = utils.getDateWhereType("day", "", 0);
          stopnowday = utils.getDateWhereType("day", "", 1);
          startnowhour = e.data.dataObject[0].reside_date;
          stopnowhour = e.data.dataObject[0].retreate_date;
          athis.setData({
            starthour: e.data.dataObject[0].reside_date,
            stophour: e.data.dataObject[0].retreate_date
          })
        } else {
          startnowyear = utils.getDateWhereType("year", athis.data.date1time, 0);
          stopnowyear = utils.getDateWhereType("year", athis.data.date2time, 0);
          startnowmonth = utils.getDateWhereType("month", athis.data.date1time, 0);
          stopnowmonth = utils.getDateWhereType("month", athis.data.date2time, 0);
          startnowday = utils.getDateWhereType("day", athis.data.date1time, 0);
          stopnowday = utils.getDateWhereType("day", athis.data.date2time, 0);
          startnowhour = utils.getDateWhereType("hour", athis.data.date1time, 0);
          stopnowhour = utils.getDateWhereType("hour", athis.data.date2time, 0);
          athis.setData({
            starthour: startnowhour,
            stophour: stopnowhour
          })
        }
        var stopnowyearindex, startnowmonthindex, stopnowmonthindex, startnowdayindex, stopnowdayindex, startnowhourindex, stopnowhourindex;
        var starttimeArray = athis.getNowDateDay(athis.data.starttimeArray, startnowyear, startnowmonth);
        var stoptimeArray = athis.getNowDateDay(athis.data.stoptimeArray, stopnowyear, stopnowmonth);
        athis.setData({
          starttimeArray: starttimeArray,
          stoptimeArray: stoptimeArray
        })
        for (var i = 0; i < stoptimeArray[0].length; i++) {
          if (stoptimeArray[0][i] == stopnowyear) {
            stopnowyearindex = i;
            break
          }
        }
        for (var i = 0; i < starttimeArray[1].length; i++) {
          if (starttimeArray[1][i] == startnowmonth) {
            startnowmonthindex = i;
            break
          }
        }
        for (var i = 0; i < stoptimeArray[1].length; i++) {
          if (stoptimeArray[1][i] == stopnowmonth) {
            stopnowmonthindex = i;
            break
          }
        }
        for (var i = 0; i < starttimeArray[2].length; i++) {
          if (starttimeArray[2][i] == startnowday) {
            startnowdayindex = i;
            break
          }
        }
        for (var i = 0; i < stoptimeArray[2].length; i++) {
          if (stoptimeArray[2][i] == stopnowday) {
            stopnowdayindex = i;
            break
          }
        }
        for (var i = 0; i < starttimeArray[3].length; i++) {
          if (starttimeArray[3][i] == startnowhour) {
            startnowhourindex = i;
            break
          }
        }
        for (var i = 0; i < stoptimeArray[3].length; i++) {
          if (stoptimeArray[3][i] == stopnowhour) {
            stopnowhourindex = i;
            break
          }
        }
        athis.setData({
          date1time: startnowyear + '-' + startnowmonth + '-' + startnowday + ' ' + startnowhour + ':00:00',
          date1timeview: startnowyear + '-' + startnowmonth + '-' + startnowday,
          date2time: stopnowyear + '-' + stopnowmonth + '-' + stopnowday + ' ' + stopnowhour + ':00:00',
          date2timeview: stopnowyear + '-' + stopnowmonth + '-' + stopnowday,
          starttimeIndex: [0, startnowmonthindex, startnowdayindex, startnowhourindex],
          stoptimeIndex: [stopnowyearindex, stopnowmonthindex, stopnowdayindex, stopnowhourindex]
        })
        if (athis.data.net_house_id != "") {
          athis.getNewPrice(athis.data.net_house_id, athis.data.date1time, athis.data.date2time)
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
  //获取当前时间的日期数组
  getNowDateDay: function (arry, year, month) {
    var temp = []
    if (month == "01" || month == "03" || month == "05" || month == "07" || month == "08" || month == "10" || month == "12") { //判断31天的月份
      for (let i = 1; i <= 31; i++) {
        if (i < 10) {
          i = "0" + i;
        }
        temp.push("" + i);
      }
    } else if (month == "04" || month == "06" || month == "09" || month == "11") { //判断30天的月份
      for (let i = 1; i <= 30; i++) {
        if (i < 10) {
          i = "0" + i;
        }
        temp.push("" + i);
      }
    } else if (month == "02") { //判断2月份天数
      let year = year * 1;
      if (((year % 400 == 0) || (year % 100 != 0)) && (year % 4 == 0)) {
        for (let i = 1; i <= 29; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          temp.push("" + i);
        }
      } else {
        for (let i = 1; i <= 28; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          temp.push("" + i);
        }
      }
    }
    arry[2] = temp;
    return arry
  },
  //获取房源列表
  getrooms: function () {
    var athis = this;
    utils.request1("/weboperate/queryAvailableHouse", {
      "skey": app.globalData.skey
    }, function (e) {
      wx.hideLoading();
      if (e.data.result == "0") {
        athis.setData({
          array: e.data.dataObject
        })
      } else if (e.data.result == "2") {
        utils.alertView("提示", "你已退出，请点击“确认”重新登录", function () {
          app.getLogin();
        })
      } else {
        utils.alertViewNosucces("提示", e.data.message + " ", false);
      }
    })
  },
  //判断是否显示密码
  isWritePass: function (lockid, locktype) {
    var athis = this;
    utils.request1("/weboperate/LockNeedPwd", {
      "skey": app.globalData.skey,
      "lock_id": lockid,
      "lock_type": locktype
    }, function (e) {
      wx.hideLoading();
      if (e.data.result == "0") {
        if (locktype == "0200") {
          if (e.data.errorCode == "0000000") {
            athis.setData({
              isneedpwd: 1
            })
          } else {
            athis.setData({
              isneedpwd: 2
            })
          }
        } else {
          athis.setData({
            isneedpwd: 2
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
  //获取价格
  getNewPrice: function (nethouseid, startdate, stopdate) {
    var athis=this;
    utils.request1("/weboperate/getDayPrice", {
      "skey": app.globalData.skey,
      net_house_id: nethouseid,
      startDate: startdate,
      endDate: stopdate
    }, function (e) {
      wx.hideLoading();
      if (e.data.result == "0") {
        athis.setData({
          userroomorice: e.data.dataObject.totalPrice,
          reside_num_max: e.data.dataObject.reside_num_max
        })
      } else if (e.data.result == "2") {
        utils.alertView("提示", "你已退出，请点击“确认”重新登录", function () {
          app.getLogin();
        })
      } else {
        utils.alertViewNosucces("提示", e.data.message + " ", false);
      }
    })
  },

  //获取获取开始日期
  bindMultiPickerChange1: function (e) {
    this.setData({
      starttimeIndex: e.detail.value
    })
    const index = this.data.starttimeIndex;
    const year = this.data.starttimeArray[0][index[0]];
    const month = this.data.starttimeArray[1][index[1]];
    const day = this.data.starttimeArray[2][index[2]];
    const hour = this.data.starttimeArray[3][index[3]];
    //const minute = this.data.starttimeArray[4][index[4]];
    this.setData({
      date1time: year + '-' + month + '-' + day + ' ' + hour + ':' + "00:00",
      date1timeview: year + '-' + month + '-' + day,
      starthour: hour
    });
    this.num_data(1);
    console.log(this.data.date1time, this.data.date1timeview);
    this.getNewPrice(this.data.net_house_id, this.data.date1time, this.data.date2time)
  },
  //监听获开始日期picker的滚动事件
  bindMultiPickerColumnChange1: function (e) {
    //获取年份
    if (e.detail.column == 0) {
      let choosestarttime = this.data.starttimeArray[e.detail.column][e.detail.value];
      console.log(choosestarttime)
      this.setData({
        choosestarttime
      })
    }
    //console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    if (e.detail.column == 1) {
      let num = parseInt(this.data.starttimeArray[e.detail.column][e.detail.value]);
      let temp = [];
      if (num == 1 || num == 3 || num == 5 || num == 7 || num == 8 || num == 10 || num == 12) { //判断31天的月份
        for (let i = 1; i <= 31; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          temp.push("" + i);
        }
        this.setData({
          ['starttimeArray[2]']: temp
        });
      } else if (num == 4 || num == 6 || num == 9 || num == 11) { //判断30天的月份
        for (let i = 1; i <= 30; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          temp.push("" + i);
        }
        this.setData({
          ['starttimeArray[2]']: temp
        });
      } else if (num == 2) { //判断2月份天数
        let year = parseInt(this.data.choosestarttime);
        console.log(year);
        if (((year % 400 == 0) || (year % 100 != 0)) && (year % 4 == 0)) {
          for (let i = 1; i <= 29; i++) {
            if (i < 10) {
              i = "0" + i;
            }
            temp.push("" + i);
          }
          this.setData({
            ['starttimeArray[2]']: temp
          });
        } else {
          for (let i = 1; i <= 28; i++) {
            if (i < 10) {
              i = "0" + i;
            }
            temp.push("" + i);
          }
          this.setData({
            ['starttimeArray[2]']: temp
          });
        }
      }
      console.log(this.data.starttimeArray[2]);
    }
    var data = {
      starttimeArray: this.data.starttimeArray,
      starttimeIndex: this.data.starttimeIndex
    };
    data.starttimeIndex[e.detail.column] = e.detail.value;
    this.setData(data);
  },
  //获取获取结束日期
  bindMultiPickerChange2: function (e) {
    this.setData({
      stoptimeIndex: e.detail.value
    })
    const index = this.data.stoptimeIndex;
    const year = this.data.stoptimeArray[0][index[0]];
    const month = this.data.stoptimeArray[1][index[1]];
    const day = this.data.stoptimeArray[2][index[2]];
    const hour = this.data.stoptimeArray[3][index[3]];
    //const minute = this.data.stoptimeArray[4][index[4]];
    this.setData({
      date2time: year + '-' + month + '-' + day + ' ' + hour + ':' + "00:00",
      date2timeview: year + '-' + month + '-' + day,
      stophour: hour
    });
    this.num_data(2);
    console.log(this.data.date2time, this.data.date2timeview);
    this.getNewPrice(this.data.net_house_id, this.data.date1time, this.data.date2time)
  },
  //监听获开始日期picker的滚动事件
  bindMultiPickerColumnChange2: function (e) {
    //获取年份
    if (e.detail.column == 0) {
      let choosestoptime = this.data.stoptimeArray[e.detail.column][e.detail.value];
      console.log(choosestoptime);
      this.setData({
        choosestoptime
      })
    }
    if (e.detail.column == 1) {
      let num = parseInt(this.data.stoptimeArray[e.detail.column][e.detail.value]);
      let temp = [];
      if (num == 1 || num == 3 || num == 5 || num == 7 || num == 8 || num == 10 || num == 12) { //判断31天的月份
        for (let i = 1; i <= 31; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          temp.push("" + i);
        }
        this.setData({
          ['stoptimeArray[2]']: temp
        });
      } else if (num == 4 || num == 6 || num == 9 || num == 11) { //判断30天的月份
        for (let i = 1; i <= 30; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          temp.push("" + i);
        }
        this.setData({
          ['stoptimeArray[2]']: temp
        });
      } else if (num == 2) { //判断2月份天数
        let year = parseInt(this.data.choosestoptime);
        console.log(year);
        if (((year % 400 == 0) || (year % 100 != 0)) && (year % 4 == 0)) {
          for (let i = 1; i <= 29; i++) {
            if (i < 10) {
              i = "0" + i;
            }
            temp.push("" + i);
          }
          this.setData({
            ['stoptimeArray[2]']: temp
          });
        } else {
          for (let i = 1; i <= 28; i++) {
            if (i < 10) {
              i = "0" + i;
            }
            temp.push("" + i);
          }
          this.setData({
            ['stoptimeArray[2]']: temp
          });
        }
      }
      console.log(this.data.stoptimeArray[2]);
    }
    var data = {
      stoptimeArray: this.data.stoptimeArray,
      stoptimeIndex: this.data.stoptimeIndex
    };
    data.stoptimeIndex[e.detail.column] = e.detail.value;
    this.setData(data);
  },
  //打开房源模态框
  openmodal: function () {
    this.setData({
      medalstate: "2"
    })
  },
  //选择房源
  chosemodal: function (e) {
    this.setData({
      net_house_id: e.currentTarget.dataset.nethouseid,
      net_house_name: e.currentTarget.dataset.nethousename,
      medalstate: "1",
      housenamestate:"2"
    })
    this.isWritePass(e.currentTarget.dataset.lockid, e.currentTarget.dataset.locktype);
    this.getNewPrice(e.currentTarget.dataset.nethouseid, this.data.date1time, this.data.date2time)
  },
  //关闭房源模态框
  closemedal: function () {
    this.setData({
      medalstate: "1"
    })
  },
  //获取门锁密码
  getuserroompassword: function (e) {
    this.setData({
      userroompassword: e.detail.value
    })
  },
  //获取价格
  getuserroomorice: function (e) {
    this.setData({
      userroomorice: e.detail.value
    })
  },
  //加入住人
  addpeople: function () {
    if (this.data.roompeoplelength < this.data.reside_num_max){
      var infomsg = this.data.infomsg;
      let infolength = this.data.infolength;
      infomsg.push({ "reside_name": "", "reside_id_num": "", "reside_phone": "" });
      infolength.push(1);
      this.setData({
        roompeoplelength: this.data.roompeoplelength + 1,
        infolength: infolength
      })
    }else{
      utils.alertViewNosucces("提示", "已达到房间的最大入住人数，不能添加入住人", false);
    }
  },
  //减入住人
  minuspeople: function () {
    if (this.data.roompeoplelength == 1) {
      utils.alertViewNosucces("提示", "至少有一条入住人信息", false);
      return;
    }
    var oldInputVal = this.data.infomsg;
    var oldarr = this.data.infolength;
    oldarr.pop();
    oldInputVal.pop();
    if (this.data.roompeoplelength == 0) {
      this.setData({
        roompeoplelength: this.data.roompeoplelength
      })
    } else {
      this.setData({
        roompeoplelength: this.data.roompeoplelength - 1,
        infolength: oldarr,
        infomsg: oldInputVal
      })
    }
    console.log(this.data.infomsg)
  },
  //删除入住人
  deletepmsg: function (e) {
    if (this.data.roompeoplelength == 1) {
      utils.alertViewNosucces("提示", "至少有一条入住人信息", false);
      return;
    }
    var nowidx = e.currentTarget.dataset.idx;//当前索引
    var oldInputVal = this.data.infomsg;//所有的input值
    var oldarr = this.data.infolength;//循环内容
    oldarr.splice(nowidx, 1);    //删除当前索引的内容，这样就能删除view了
    oldInputVal.splice(nowidx, 1);//view删除了对应的input值也要删掉
    // if (oldarr.length < 1) {
    //   oldarr = [0]  //如果循环内容长度为0即删完了，必须要留一个默认的。这里oldarr只要是数组并且长度为1，里面的值随便是什么
    // }
    if (this.data.roompeoplelength == 0) {
      this.setData({
        roompeoplelength: this.data.roompeoplelength
      })
    } else {
      this.setData({
        roompeoplelength: this.data.roompeoplelength - 1,
        infolength: oldarr,
        infomsg: oldInputVal
      })
    }
    console.log(this.data.infomsg)
  },
  //比较时间的大小
  istimesize: function () {
    var issize = true;
    var start_date = new Date(this.data.date1timeview.replace(/-/g, "/"));
    var end_date = new Date(this.data.date2timeview.replace(/-/g, "/"));
    if (end_date.getTime() <= start_date.getTime()) {
      issize = false;
    }
    return issize
  },
  //时间段天数的计算
  num_data: function (index) {
    var start_date_time = moment(this.data.date1time);
    var start_date_date = moment(this.data.date1timeview);
    var end_date_time = moment(this.data.date2time);
    var end_date_date = moment(this.data.date2timeview);
    var now_date = moment(utils.formatTime(new Date()));
    var now_start_date = now_date.diff(start_date_date, 'days');
    var end_start_date = end_date_date.diff(start_date_date, 'days');
    var end_start_time = end_date_time.diff(start_date_time, 'hours');
    if (now_start_date>0) {
      this.setData({
        daycount: "0小时",
        istimesize: false,
        timestate: 1,
      })
      return;
    }
    if (end_start_date < 0) {
      this.setData({
        daycount: "0小时",
        istimesize: false,
        timestate: 2,
      })
      return;
    } else if (end_start_date == 0) {
      if (end_start_time > 0) {
        this.setData({
          daycount: end_start_time + "小时",
          istimesize: true,
          timestate: 0,
        })
      } else {
        this.setData({
          daycount: "0小时",
          istimesize: false,
          timestate: 2,
        })
      }
    } else {
      this.setData({
        daycount: end_start_date + "晚",
        istimesize: true,
        timestate: 0,
      })
    }
  },
  //姓名的输入
  setResideName: function (e) {
    var nowIdx = e.currentTarget.dataset.idx;//获取当前索引
    var val = e.detail.value;//获取输入的值
    var oldVal = this.data.infomsg;
    oldVal[nowIdx].reside_name = val;//修改对应索引值的内容
    this.setData({
      infomsg: oldVal
    });
    console.log(this.data.infomsg);
  },
  //身份证号的输入
  setResideIdNum: function (e) {
    var nowIdx = e.currentTarget.dataset.idx;//获取当前索引
    var val = e.detail.value;//获取输入的值
    var oldVal = this.data.infomsg;
    oldVal[nowIdx].reside_id_num = val;//修改对应索引值的内容
    this.setData({
      infomsg: oldVal
    });
    console.log(this.data.infomsg);
  },
  //手机号的输入
  setResidePhone: function (e) {
    var nowIdx = e.currentTarget.dataset.idx;//获取当前索引
    var val = e.detail.value;//获取输入的值
    var oldVal = this.data.infomsg;
    oldVal[nowIdx].reside_phone = val;//修改对应索引值的内容
    this.setData({
      infomsg: oldVal
    });
    console.log(this.data.infomsg);
  },
  //表单提交
  saverooms: function () {
    var athis = this;
    if (athis.data.istimesize == false) {
      if (athis.data.timestate == "1") {
        utils.alertViewNosucces("提示", "订单入住时间不能早于当天", false);
        return;
      }
      if (athis.data.timestate == "2") {
        utils.alertViewNosucces("提示", "离开时间不能早于入住时间", false);
        return;
      }
      wx.showToast({
        title: '请选择有效' + athis.data.istimetitle + '时间',
        icon: "none"
      })
      return;
    }
    if (athis.data.net_house_id == "") {
      utils.alertViewNosucces("提示", "请选择房源", false);
      return;
    }
    if (athis.data.userroompassword == "" && athis.data.isneedpwd=="1") {
      utils.alertViewNosucces("提示", "请输入门锁密码", false);
      return;
    }
    utils.showLoading("请稍等");
    const requestTask = utils.request1("/weboperate/createOrder", {
      "skey": app.globalData.skey,
      "net_house_id": athis.data.net_house_id,
      "net_house_name": athis.data.net_house_name,
      "order_house_password": athis.data.userroompassword,
      "money": athis.data.userroomorice,
      "reside_date": athis.data.date1time,
      "reside_retreat_date": athis.data.date2time,
      "reside_info": athis.data.infomsg
    }, function (respass) {
      wx.hideLoading();
      var ress = respass.data;
      if (ress.result == "0") {
        wx.navigateBack({
          delta: 1
        })
        // athis.setData({
        //   medalstate: "3",
        //   roomqrcode: ress.dataObject.base64img
        // })
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
  //保存二维码
  saveqrcode: function () {
    var athis = this;
    var aa = wx.getFileSystemManager();
    aa.writeFile({
      filePath: wx.env.USER_DATA_PATH + '/orderqrcode.png',
      data: athis.data.roomqrcode,
      encoding: 'base64',
      success: res => {
        wx.saveImageToPhotosAlbum({
          filePath: wx.env.USER_DATA_PATH + '/orderqrcode.png',
          success: function (res) {
            athis.setData({
              medalstate: "1",
              roomqrcode: ""
            })
            wx.showToast({
              title: '保存成功',
            })
          },
          fail: function (err) {
            console.log(err)
          }
        })
        console.log(res)
      }, fail: err => {
        console.log(err)
      }
    })
  },
  //分享二维码
  shareqrcode: function () {

  }
})