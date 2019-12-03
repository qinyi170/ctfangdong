const app = getApp()
var utils = require("../../../utils/util.js");
Page({
  data: {
    selectedFlag: [],
    allDataList:[],
    net_house_idList:[],
    operatorid:"",
  },
  onLoad(e){
    this.setData({
      operatorid: e.operatorid
    })
  },
  onShow(){
    this.active();
  },
  active(){
    var athis = this
    utils.showLoading("请稍等")
    utils.request1("/house/selectGroupHouseList", {
      "skey": app.globalData.skey,
      "operator_id": athis.data.operatorid
    }, function (res1) {
      wx.hideLoading()
      if (res1.data.result == "0") {
        var templist = res1.data.dataObject;
        var tempnewlist=[];
        var temparry=[];
        var checkedarry=[]
        for (var i = 0; i < templist.length;i++){
          if (templist[i].children.length!=0){
            for (var j = 0; j < templist[i].children.length;j++){
              templist[i].checked = false;
              if (templist[i].children[j].checked==true){
                templist[i].checked=true;
                checkedarry.push(templist[i].children[j].id)
              }
            }
            tempnewlist.push(templist[i]);
            temparry.push(false)
          }
        }
        athis.setData({
          selectedFlag: temparry,
          allDataList: tempnewlist,
          net_house_idList: checkedarry
        })
      } else {
        if (!res1.data.result) {
          utils.alertViewNosucces("提示", "服务未响应，请稍后再试", false);
          return;
        }
        utils.alertViewNosucces("提示", res1.data.message + "", false);
      }
    })
  },
  // 展开折叠选择  
  changeToggle: function (e) {
    var index = e.currentTarget.dataset.index;
    if (this.data.selectedFlag[index]) {
      this.data.selectedFlag[index] = false;
    } else {
      this.data.selectedFlag[index] = true;
    }
    this.setData({
      selectedFlag: this.data.selectedFlag
    })
  },
  checkboxChange: function (e) {
    console.log(e)
    this.setData({
      net_house_idList: e.detail.value
    })
  },
  checkboxtap(e){
    var pid = e.currentTarget.dataset.pid;
    var uid = e.currentTarget.dataset.uid;
    var uchecked = e.currentTarget.dataset.uchecked;
    var allDataList = this.data.allDataList;
    var net_house_idList = this.data.net_house_idList;
    var tempchecked=true;
    if (uchecked == true) {//点击使未选中
      tempchecked = false
    } else {//点击使选中
      tempchecked = true
    }
    allDataList[pid].children[uid].checked = tempchecked;
    var tempid = allDataList[pid].children[uid].id;
    for (var i = 0; i < allDataList.length; i++) {
      for (var j = 0; j < allDataList[i].children.length; j++) {
        if (allDataList[i].children[j].id == tempid) {
          allDataList[i].children[j].checked = tempchecked;
        }
      }
    }
    if (tempchecked == false){
      for (var ii = 0; ii < net_house_idList.length; ii++) {
        if (net_house_idList[ii] == tempid) {
          net_house_idList.splice(ii, 1)
        }
      }
    }
    this.setData({
      allDataList: allDataList,
      net_house_idList: net_house_idList
    })
    console.log(this.data.allDataList)
    console.log(this.data.net_house_idList)
    // if (pid==""){//父节点的点击
    //   if (uchecked == true) {//点击使未选中
        
    //   } else {//点击使选中

    //   }
    // }else{//子节点的点击
    //   if (uchecked == true) {//点击使未选中

    //   } else {//点击使选中

    //   }
    // }
  },
  saverole(){
    var athis=this
    var net_house_idList = athis.data.net_house_idList;
    var new_net_house_idList=[];
    var new_net_house_id_str="";
    for (var i = 0; i < net_house_idList.length; i++) {
      if (new_net_house_idList.indexOf(net_house_idList[i]) === -1) {
        new_net_house_idList.push(net_house_idList[i])
        if (i == net_house_idList.length-1){
          new_net_house_id_str += net_house_idList[i];
        }else{
          new_net_house_id_str += net_house_idList[i] + ",";
        }    
      }
    }
    utils.showLoading("请稍等")
    utils.request1("/house/insertHouse", {
      "skey": app.globalData.skey,
      "operator_id": athis.data.operatorid,
      "net_house_idList": new_net_house_id_str
    }, function (res1) {
      wx.hideLoading()
      if (res1.data.result == "0") {
        utils.showSuccess("分配房源成功", 1500, "success");
        setTimeout(function () {
          if (athis.data.net_house_idList.length==0){
            wx.navigateBack({
              delta: 1
            })
            return;
          }
          wx.redirectTo({
            url: 'userhouselist?operatorid=' + athis.data.operatorid,
          })
        }, 1500)
      } else {
        if (!res1.data.result) {
          utils.alertViewNosucces("提示", "服务未响应，请稍后再试", false);
          return;
        }
        utils.alertViewNosucces("提示", res1.data.message + "", false);
      }
    })
  }
})