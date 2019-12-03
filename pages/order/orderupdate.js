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
    choosestoptime: "",
    userroompassword: "",//门锁密码
    money:"",
    roompeoplelength: 0,//入住人数
    reside_num_max:"",//最大入住人数
    infomsg: [],
    infolength: [],
    net_house_id: "",
    net_house_name: "",
    order_id: "",
    check_state: "",//订单状态
    timestate: "0"
  },
  onLoad: function (e) {
    if (e.orderid != undefined) {
      this.setData({
        order_id: e.orderid,
      })
    }
    this.getrooms();
  },
  //获取某个订单的详细信息
  getrooms: function () {
    var athis = this;
    utils.request1("/weboperate/queryOrderById", {
      "skey": app.globalData.skey,
      "order_id": athis.data.order_id
    }, function (e) {
      console.log(e)
      wx.hideLoading();
      if (e.data.result == "0") {
        var roominfo = e.data.dataObject;
        athis.setData({
          net_house_id: roominfo.net_house_id,
          net_house_name: roominfo.net_house_name,
          daycount: roominfo.total,
          userroompassword: roominfo.order_house_password,
          money: roominfo.money,
          infomsg: roominfo.reside_info,
          roompeoplelength: roominfo.reside_info.length,
          check_state: roominfo.check_state
        })
        var starttimeArray = athis.getNowDateDay(athis.data.starttimeArray, roominfo.reside_date.substring(0, 4), roominfo.reside_date.substring(4, 6));
        var stoptimeArray = athis.getNowDateDay(athis.data.stoptimeArray, roominfo.reside_retreat_date.substring(0, 4), roominfo.reside_retreat_date.substring(4, 6));
        athis.setData({
          starttimeArray: starttimeArray,
          stoptimeArray: stoptimeArray
        })
        athis.getNowDate(athis.data.starttimeArray,roominfo.reside_date, 1);
        athis.getNowDate(athis.data.stoptimeArray,roominfo.reside_retreat_date, 2);
        for (var i = 0; i < roominfo.reside_info.length; i++) {
          var infolength = athis.data.infolength;
          infolength.push(1);
          athis.setData({
            infolength: infolength
          })
        }
        athis.getNewPrice(athis.data.net_house_id, athis.data.date1time, athis.data.date2time,1)
      } else if (e.data.result == "2") {
        utils.alertView("提示", "你已退出，请点击“确认”重新登录", function () {
          app.getLogin();
        })
      } else {
        utils.alertViewNosucces("提示", e.data.message + " ", false);
      }
    })
  },
  //获取订单的开始时间和结束时间
  getNowDate: function (timeArray, e, index) {
    var nowyear = e.substring(0, 4);
    var nowmonth = e.substring(4, 6);
    var nowday = e.substring(6, 8);
    var nowhour = e.substring(8, 10);
    var nowyearindex, nowmonthindex, nowdayindex, nowhourindex;
    for (var i = 0; i < timeArray[0].length; i++) {
      if (timeArray[0][i] == nowyear) {
        nowyearindex = i;
        break
      }
    }
    for (var i = 0; i < timeArray[1].length; i++) {
      if (timeArray[1][i] == nowmonth) {
        nowmonthindex = i;
        break
      }
    }
    for (var i = 0; i < timeArray[2].length; i++) {
      if (timeArray[2][i] == nowday) {
        nowdayindex = i;
        break
      }
    }
    for (var i = 0; i < timeArray[3].length; i++) {
      if (timeArray[3][i] == nowhour) {
        nowhourindex = i;
        break
      }
    }
    if (index == 1) {
      this.setData({
        date1time: nowyear + '-' + nowmonth + '-' + nowday + ' ' + nowhour + ':' + '00:00',
        olddate1time: nowyear + '-' + nowmonth + '-' + nowday + ' ' + nowhour + ':' + '00:00',
        date1timeview: nowyear + '-' + nowmonth + '-' + nowday,
        starttimeIndex: [nowyearindex, nowmonthindex, nowdayindex, nowhourindex],
        starthour: nowhour
      })
    } else {
      this.setData({
        date2time: nowyear + '-' + nowmonth + '-' + nowday + ' ' + nowhour + ':' + '00:00',
        date2timeview: nowyear + '-' + nowmonth + '-' + nowday,
        stoptimeIndex: [nowyearindex, nowmonthindex, nowdayindex, nowhourindex],
        stophour: nowhour
      })
    }
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
      console.log(year);
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
  //获取价格
  getNewPrice: function (nethouseid, startdate, stopdate,type) {
    var athis = this;
    utils.request1("/weboperate/getDayPrice", {
      "skey": app.globalData.skey,
      net_house_id: nethouseid,
      startDate: startdate,
      endDate: stopdate
    }, function (e) {
      wx.hideLoading();
      if (e.data.result == "0") {
        if (type==1){
          athis.setData({
            reside_num_max: e.data.dataObject.reside_num_max
          })
        }else{
          athis.setData({
            money: e.data.dataObject.totalPrice,
            reside_num_max: e.data.dataObject.reside_num_max
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
    this.setData({
      date1time: year + '-' + month + '-' + day + ' ' + hour + ':' + "00:00",
      date1timeview: year + '-' + month + '-' + day,
      starthour: hour
    });
    this.num_data(1);
    console.log(this.data.date1time, this.data.date1timeview)
    this.getNewPrice(this.data.net_house_id, this.data.date1time, this.data.date2time,2)
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
    this.setData({
      date2time: year + '-' + month + '-' + day + ' ' + hour + ':' + "00:00",
      date2timeview: year + '-' + month + '-' + day,
      stophour: hour
    });
    this.num_data(2);
    console.log(this.data.date2time, this.data.date2timeview);
    this.getNewPrice(this.data.net_house_id, this.data.date1time, this.data.date2time,2)
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
  //获取价格
  getuserroomorice: function (e) {
    this.setData({
      money: e.detail.value
    })
  },
  //加入住人
  addpeople: function () {
    if (this.data.roompeoplelength < this.data.reside_num_max) {
      var infomsg = this.data.infomsg;
      let infolength = this.data.infolength;
      infomsg.push({ "reside_name": "", "reside_id_num": "", "reside_phone": "" });
      infolength.push(1);
      this.setData({
        roompeoplelength: this.data.roompeoplelength + 1,
        infolength: infolength
      })
    } else {
      utils.alertViewNosucces("提示", "已达到房间的最大入住人数，不能添加入住人", false);
    }
    
  },
  //减入住人
  minuspeople: function () {
    var oldInputVal = this.data.infomsg;
    var oldarr = this.data.infolength;
    var check_state = oldInputVal[oldarr.length - 1].check_state;
    var reside_name = oldInputVal[oldarr.length - 1].reside_name;
    if (check_state == 'check') {
      utils.alertViewNosucces("提示", "入住人" + reside_name + "已入住，不能删除", false);
      return;
    }
    if (this.data.roompeoplelength == 1) {
      utils.alertViewNosucces("提示", "至少有一条入住人信息", false);
      return;
    }
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
    if (now_start_date > 0) {
      if (this.data.olddate1time == this.data.date1time) {
        console.log(11111111111)
        console.log(end_start_time)
      } else {
        this.setData({
          daycount: "0小时",
          istimesize: false,
          timestate: 1,
        })
        return;
      }
    }
    console.log(123)
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
    utils.showLoading("请稍等");
    const requestTask = utils.request1("/weboperate/updateOrder", {
      "skey": app.globalData.skey,
      "net_house_id": athis.data.net_house_id,
      "net_house_name": athis.data.net_house_name,
      "order_house_password": athis.data.userroompassword,
      "money": athis.data.money,
      "reside_date": athis.data.date1time,
      "reside_retreat_date": athis.data.date2time,
      "reside_info": athis.data.infomsg,
      "order_id": athis.data.order_id,
      "type": "update"
    }, function (respass) {
      wx.hideLoading();
      var ress = respass.data;
      if (ress.result == "0") {
        utils.showSuccess("订单修改成功", 1500, "success");
        setTimeout(function () {
          wx.navigateBack({
            delta: 2
          })
        }, 1500)
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
  }
})