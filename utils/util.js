const app = getApp();
var nowdate=new Date();
/*
  获取某个时间段的年、月、日、小时、分、秒
  type为获取的类型，参数为：year、month、day、hour、minute、second
  date为日期，为空则为当前时间，不为空则格式为：YYYY-MM-DD HH:mm:ss
  day为天数，如：传值为1，则为一天后
*/
function getDateWhereType(type, date, days) {
  var temp;
  if (date != "") {
    nowdate = new Date(date);
  }
  var newdate = new Date((Date.parse(nowdate) / 1000 + 24 * 60 * 60 * days) * 1000);
  if (type == "year") {
    temp = newdate.getFullYear();
  }
  if (type == "month"){
    temp = newdate.getMonth() + 1;
    if (temp < 10) {
      temp = "0" + temp
    }
  }
  if (type =="day"){
    temp = newdate.getDate();
    if (temp < 10) {
      temp = "0" + temp
    }
  }
  if (type == "hour") {
    temp = newdate.getHours();
    if (temp < 10) {
      temp = "0" + temp
    }
  }
  if (type == "minute") {
    temp = newdate.getMinutes();
    if (temp < 10) {
      temp = "0" + temp
    }
  }
  if (type == "second") {
    temp = newdate.getSeconds();
    if (temp < 10) {
      temp = "0" + temp
    }
  }
  return temp;
}
//获取某个日期的日期，格式为YYYY-MM-DD HH:mm:ss
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  // const minute = date.getMinutes()
  // const second = date.getSeconds()
  const minute = "00"
  const second = "00"
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
//获取当前时间n天后的日期，格式为：YYYY-MM-DD
const formatDateday = days => {
  var timestamp = Date.parse(new Date()) / 1000;
  var tomorrow_timetamp = timestamp + 24 * 60 * 60 * days;
  var tomorrow_date = new Date(tomorrow_timetamp * 1000);
  const year = tomorrow_date.getFullYear()
  const month = tomorrow_date.getMonth() + 1
  const day = tomorrow_date.getDate()
  return [year, month, day].map(formatNumber).join('-')
}
//获取某个时间n天后的日期，格式为：YYYY-MM-DD
function getAllDate(date, days) {
  var a = new Date(date);
  var timestamp = Date.parse(a) / 1000;
  var tomorrow_timetamp = timestamp + 24 * 60 * 60 * days;
  var tomorrow_date = new Date(tomorrow_timetamp * 1000);
  const year = tomorrow_date.getFullYear()
  const month = tomorrow_date.getMonth() + 1
  const day = tomorrow_date.getDate()
  return [year, month, day].map(formatNumber).join('-')
}
//获取某个时间n小时或n天后的日期，格式为：YYYY-MM-DD HH:mm:ss
function getAllDateTime(date, days,type) {
  var a = new Date(date);
  var timestamp = Date.parse(a) / 1000;
  if (type==0){
    var tomorrow_timetamp = timestamp + 24 * 60 * 60 * days;
  }else{
    var tomorrow_timetamp = timestamp + 60 * 60 * days;
  }
  var tomorrow_date = new Date(tomorrow_timetamp * 1000);
  const year = tomorrow_date.getFullYear()
  const month = tomorrow_date.getMonth() + 1
  const day = tomorrow_date.getDate()
  const hour = tomorrow_date.getHours()
  const minute = tomorrow_date.getMinutes()
  const second = tomorrow_date.getSeconds()
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
//将时间格式化展示，格式为：MM.DD HH:mm
const changeDate = date => {
  var date_year = date.substring(0, 4);
  var date_month = date.substring(4, 6);
  var date_day = date.substring(6, 8);
  var date_hour = date.substring(8, 10);
  var date_min = date.substring(10, 12);
  var date_second = date.substring(12);
  var order_time = date_month + "." + date_day + " " + date_hour + ":" + date_min;
  return order_time;
}
//将时间格式化展示，格式为：YYYY-MM-DD HH:mm:ss
const changeDate1 = date => {
  var date_year = date.substring(0, 4);
  var date_month = date.substring(4, 6);
  var date_day = date.substring(6, 8);
  var date_hour = date.substring(8, 10);
  var date_min = date.substring(10, 12);
  var date_second = date.substring(12);
  return [date_year, date_month, date_day].map(formatNumber).join('-') + ' ' + [date_hour, date_min, date_second].map(formatNumber).join(':')
}
function changeYearAndMonth(year, month, day){
  if (month<9){
    month = "0" + (month+1)
  }else{
    month = month + 1
  }
  if (day < 9) {
    day = "0" + day
  }
  return year + "-" + month + "-" + day
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/*
  网络请求
  parameters为传递的参数，
  若为get请求时，parameters的格式为key1=value1&key2=value2，
  若为post请求时，parameters的格式为{key1:value1,key2:value2}
*/
function request(url = "", parameters = "", success, method = "POST", header = {}) {
  var urls;
  var datas = {};
  if (method == "GET") {
    urls = app.globalData.urls + url + "?" + parameters;
  } else if (method == "POST") {
    urls = app.globalData.urls + url;
    datas = parameters
  }
  wx.request({
    url: urls,
    data: datas,
    method: method, // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    header: {
      'content-type': 'application/json'
    },
    success: function (res) {
      console.log("success-----" + url,res)
      success(res);
    },
    fail: function (res) {
      console.log("fail",res)
      var rstr = res.errMsg.substr(0, 1000);
      wx.hideLoading();
      if (rstr.indexOf("timeout") != -1) {
        wx.showModal({
          title: '提示',
          content: '请求超时，请重新操作',
          showCancel: false
        })
      }
    },
    // complete: function () {
    //   console.log("complete");
    // }
  })
}
function request1(url = "", parameters = "", success, method = "POST", header = {}) {
  var urls;
  var datas = {};
  if (method == "GET") {
    urls = app.globalData.urls1 + url + "?" + parameters;
  } else if (method == "POST") {
    urls = app.globalData.urls1 + url;
    datas = parameters
  }
  var headerjson={
    'content-type': 'application/json',
  }
  if (url == "/login/smsCode"){
    if (datas.type == "2") {
      headerjson.Authorization = "Bearer " + app.globalData.pcloginstate.token
    }
  }else{
    headerjson.Authorization = "Bearer " + app.globalData.pcloginstate.token
  }
  wx.request({
    url: urls,
    data: datas,
    method: method, // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    header: headerjson,
    success: function (res) {
      console.log("success-----" + url, res)
      success(res);
    },
    fail: function (res) {
      console.log("fail", res)
      var rstr = res.errMsg.substr(0, 1000);
      wx.hideLoading();
      if (rstr.indexOf("timeout") != -1) {
        wx.showModal({
          title: '提示',
          content: '请求超时，请重新操作',
          showCancel: false
        })
      }
    }
  })
}
function request2(url = "", parameters = "", success, method = "POST", header = {}) {
  var urls;
  var datas = {};
  if (method == "GET") {
    urls = app.globalData.urls1 + url + "?" + parameters;
  } else if (method == "POST") {
    urls = app.globalData.urls1 + url;
    datas = parameters
  }
  wx.request({
    url: urls,
    data: datas,
    method: method, // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    success: function (res) {
      console.log("success-----" + url, res)
      success(res);
    },
    fail: function (res) {
      console.log("fail", res)
      var rstr = res.errMsg.substr(0, 1000);
      wx.hideLoading();
      if (rstr.indexOf("timeout") != -1) {
        wx.showModal({
          title: '提示',
          content: '请求超时，请重新操作',
          showCancel: false
        })
      }
    },
    // complete: function () {
    //   console.log("complete");
    // }
  })
}

//成功提示
function showSuccess(title = "成功啦", duration = 2500, icontype ="success") {
  wx.showToast({
    title: title,
    icon: icontype,
    duration: (duration <= 0) ? 2500 : duration
  });
}
//loading提示
function showLoading(title = "请稍后", duration = 5000) {
  wx.showLoading({
    title: title,
    mask: true
  })
}
//隐藏提示框
function hideToast() {
  wx.hideToast();
}

//显示带取消按钮的消息提示框
function alertViewWithCancel(title = "提示", content = "消息提示", confirm, showCancel = "true") {
  wx.showModal({
    title: title,
    content: content,
    showCancel: showCancel,
    success: function (res) {
      if (res.confirm) {
        confirm();
      }
    }
  });
}
//显示不取消按钮的消息提示框
function alertView(title = "提示", content = "消息提示", confirm) {
  alertViewWithCancel(title, content, confirm, false);
}
//显示不带取消按钮和事件的消息提示框
function alertViewNosucces(title = "提示", content = "消息提示", showCancel = "false") {
  wx.showModal({
    title: title,
    content: content,
    showCancel: showCancel
  });
}




/**
  *
  * json转字符串
  */
function stringToJson(data) {
  return JSON.parse(data);
}
/**
*字符串转json
*/
function jsonToString(data) {
  return JSON.stringify(data);
}
/**
*map转换为json
*/
function mapToJson(map) {
  return JSON.stringify(strMapToObj(map));
}
/**
*json转换为map
*/
function jsonToMap(jsonStr) {
  return objToStrMap(JSON.parse(jsonStr));
}


/**
*map转化为对象（map所有键都是字符串，可以将其转换为对象）
*/
function strMapToObj(strMap) {
  let obj = Object.create(null);
  for (let [k, v] of strMap) {
    obj[k] = v;
  }
  return obj;
}

/**
*对象转换为Map
*/
function objToStrMap(obj) {
  let strMap = new Map();
  for (let k of Object.keys(obj)) {
    strMap.set(k, obj[k]);
  }
  return strMap;
}
//捕捉没有result的错误返回
function backcode1(title, content) {
  alertViewWithCancel(title, content, function () {
    if (app.globalData.minroute == "") {
      if (app.globalData.userState == null || app.globalData.userState == "" || app.globalData.userState == "logout") {
        wx.reLaunch({
          url: '../../pages/index/index'
        })
      } else if (app.globalData.userState == "thirdEleOk") {
        wx.reLaunch({
          url: '../../pages/qrcode/qrcode'
        })
      }
    } else {
      if (app.globalData.scene == "1037") {
        wx.navigateBackMiniProgram()
      }
      if (app.globalData.scene == "1069") {
        var jsonstr = {
          "result_detail": "9999999"
        }
        app.globalData.backappandiosmsg = JSON.stringify(jsonstr)
        wx.reLaunch({
          url: '../../pages/route/backappandios'
        })
      }
    }
  }, false);
}
function backcode2(title, content) {
  alertViewWithCancel(title, content, function () {
    wx.reLaunch({
      url: '../../pages/qrcode/qrcode'
    })
  }, false);
}
function MathRand() {
  var Num = "";
  for (var i = 0; i < 6; i++) {
    Num += Math.floor(Math.random() * 10);
  }
  return Num;
}

function uuid() {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "1";

  var uuid = s.join("");
  return uuid;
}
function compare(objA, objB) {
  if (!isObj(objA) || !isObj(objB)) return false; //判断类型是否正确
  if (getLength(objA) != getLength(objB)) return false; //判断长度是否一致
  return compareObj(objA, objB, true); //默认为true
}
function compareObj(objA, objB, flag) {
  for (var key in objA) {
    if (!flag) //跳出整个循环
      break;
    if (!objB.hasOwnProperty(key)) {
      flag = false;
      break;
    }
    if (!isArray(objA[key])) { //子级不是数组时,比较属性值
      if (objB[key] != objA[key]) {
        flag = false;
        break;
      }
    } else {
      if (!isArray(objB[key])) {
        flag = false;
        break;
      }
      var oA = objA[key],
        oB = objB[key];
      if (oA.length != oB.length) {
        flag = false;
        break;
      }
      for (var k in oA) {
        if (!flag) //这里跳出循环是为了不让递归继续
          break;
        flag = compareObj(oA[k], oB[k], flag);
      }
    }
  }
  return flag;
}
function isObj(object) {
  return object && typeof (object) == 'object' && Object.prototype.toString.call(object).toLowerCase() == "[object object]";
}

function isArray(object) {
  return object && typeof (object) == 'object' && object.constructor == Array;
}

function getLength(object) {
  var count = 0;
  for (var i in object) count++;
  return count;
}
function checkArray(newAry,oldAry){
  if (newAry.length != oldAry.length) return false;
  if (newAry.sort().toString() != oldAry.sort().toString()) return false;
  return true;
}
//身份证号的校验
function checkIdCard(val) {
  var p = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
  var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
  var code = val.substring(17);
  if (p.test(val)) {
    var sum = 0;
    for (var i = 0; i < 17; i++) {
      sum += val[i] * factor[i];
    }
    if (parity[sum % 11] == code.toUpperCase()) {
      return true;
    }
  }
  return false;
}
function checkPhone(val) {
  if (!(/^1[34578]\d{9}$/.test(val))) {
    return false;
  }else{
    return true;
  }
}
function checkEmial(val) {
  var reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$"); //正则表达式
  if (!reg.test(val)) { //正则验证不通过，格式不对
　　return false;
　} else {
　　return true;
　}
}


module.exports = {
  changeYearAndMonth: changeYearAndMonth,
  getDateWhereType: getDateWhereType,
  getAllDate: getAllDate,
  getAllDateTime: getAllDateTime,
  changeDate1: changeDate1,
  changeDate: changeDate,
  checkEmial: checkEmial,
  checkIdCard: checkIdCard,
  checkPhone: checkPhone,
  checkArray: checkArray,
  compare: compare,
  uuid: uuid,
  MathRand: MathRand,
  backcode1: backcode1,
  backcode2: backcode2,
  stringToJson: stringToJson,
  jsonToString: jsonToString,
  mapToJson: mapToJson,
  jsonToMap: jsonToMap,
  strMapToObj: strMapToObj,
  objToStrMap: objToStrMap,
  formatTime: formatTime,
  formatDateday: formatDateday,
  request: request,
  request1: request1,
  request2: request2,
  showSuccess: showSuccess,
  showLoading: showLoading,
  hideToast: hideToast,
  alertViewWithCancel: alertViewWithCancel,
  alertView: alertView,
  alertViewNosucces: alertViewNosucces
}