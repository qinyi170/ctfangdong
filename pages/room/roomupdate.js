const app = getApp()
var utils = require("../../utils/util.js");
var datajson = require("../../utils/datas.js");
var formvalue;
Page({
  data: {
    roompage1: false,
    roompage2: true,
    roompage3: true,
    scrollheight: "height:" + (app.globalData.pheight-85) + "px",
    addrmsg:{},//选择地址
    addrstate:1,
    roomoriginarray:["转租","自营"],
    roomoriginindex:0,
    roomorigin: 1,//房屋来源
    lendtypearray: ["整租", "分租", "其他"],
    lendtypeindex: 0,
    lendtype: 1,//出租类型
    roomtypearray: ["一室零厅一卫", "一室一厅一卫", "二室一厅一卫", "二室一厅二卫", "二室二厅一卫", "三室一厅一卫", "三室一厅二卫", "三室二厅一卫", "三室二厅二卫", "四室一厅二卫", "四室二厅二卫", "复式", "别墅", "其他"],
    roomtypeindex: 0,
    roomtype: "一室一厅一卫",//房屋类型
    bednum:"",//床位数
    roomimaegsarray:[],//房屋图片
    roomimaegstitle: 1,
    idcardarray: ["身份证", "港澳通行证", "护照", "其他"],
    idcardarrayindex: ["111", "513", "414", '990'],
    idcardindex:0,
    idcard:"111",//证件类型
    cardimaegsarray:[],//不动产证照片
    cardimagestitle:1,
    propertytypearray: ["自然人", "企业"],
    propertytypeindex: 0,
    propertytype: 1,//产权人类型
    checkid: "01",
    checkname: "汉族",
    moreview:true,
    moreshow:"1",
    nethouseid:"",
    roomInfo:{},
    type:"",
    ischeck:false,
    oldroomInfo:{
      house_acreage:"",
      house_bed_num:"",
      house_latitude:"",
      house_longitude:"",
      house_num: "",
      house_property_id_num: "",
      house_property_id_type: "111",
      house_property_legal_person_id:"",
      house_property_name: "",
      house_property_nation: "01",
      house_property_phone: "",
      house_property_type: "1",
      house_property_unit_name:"",
      house_rentout_type: "1",
      house_source: "1",
      house_type: "一室一厅一卫",
      net_house_addr_id: "",
      net_house_name: "",
      net_house_provinces: "-",
      no_property_credentice_id:"",
      room_id:""
    },
    oldroomimaegsarray:[],
    oldcardimaegsarray:[]
  },
  onLoad: function (e) {
    this.setData({
      nationarray: datajson.getNationData()
    })
    if (e.nethouseid != undefined) {
      this.setData({
        nethouseid: e.nethouseid,
        type:"update"
      })
      if (e.ischeck == 0){
        this.setData({
          ischeck: true
        })
      }
      this.roommsg(e.nethouseid)
    }
  },
  //修改时，获取房源列表
  roommsg: function (data) {
    var athis = this;
    utils.showLoading("请稍等")
    utils.request1("/weboperate/queryNetHouseById", {
      "skey": app.globalData.skey,
      "net_house_id": data
    }, function (e) {
      wx.hideLoading();
      if (e.data.result == "0") {
        var rooms = e.data.dataObject;
        if (rooms.no_property_credentice_id != '' || rooms.house_property_unit_name != '' || rooms.house_property_legal_person_id != '' || rooms.house_property_photo != "") {
          athis.setData({
            moreview: false,
            moreshow: "2"
          })
        }
        athis.setData({
          roomInfo: rooms,
          addrstate: 2,
          addrmsg:{
            address: rooms.net_house_provinces,
            name: rooms.net_house_addr_name,
            latitude: rooms.house_latitude,
            longitude: rooms.house_longitude
          },
          roomorigin: rooms.house_source,
          lendtype: rooms.house_rentout_type,
          roomtype: rooms.house_type,
          propertytype: rooms.house_property_type,
          checkid: rooms.house_property_nation,
          idcard: rooms.house_property_id_type,
          oldroomInfo: {
            house_acreage: rooms.house_acreage,
            house_bed_num: rooms.house_bed_num,
            house_latitude: "",
            house_longitude: "",
            house_num: rooms.house_num,
            house_property_id_num: rooms.house_property_id_num,
            house_property_id_type: rooms.house_property_id_type,
            house_property_legal_person_id: rooms.house_property_legal_person_id,
            house_property_name: rooms.house_property_name,
            house_property_nation: rooms.house_property_nation,
            house_property_phone: rooms.house_property_phone,
            house_property_type: rooms.house_property_type,
            house_property_unit_name: rooms.house_property_unit_name,
            house_rentout_type: rooms.house_rentout_type,
            house_source: rooms.house_source,
            house_type: rooms.house_type,
            net_house_addr_id: rooms.net_house_addr_id,
            net_house_name: rooms.net_house_name,
            net_house_provinces: rooms.net_house_provinces + '-' + rooms.net_house_addr_name,
            no_property_credentice_id: rooms.no_property_credentice_id,
            room_id: rooms.room_id
          }
        })
        //房屋来源
        if (rooms.house_source==1) {
          athis.setData({
            roomoriginindex: 0
          })
        }else{
          athis.setData({
            roomoriginindex: 1
          })
        }
        //出租类型
        if (rooms.house_rentout_type==1){
          athis.setData({
            lendtypeindex: 0
          })
        } else if (rooms.house_rentout_type == 2) {
          athis.setData({
            lendtypeindex: 1
          })
        } else{
          athis.setData({
            lendtypeindex: 2
          })
        }
        //房屋类型
        for (var i = 0; i < athis.data.roomtypearray.length;i++){
          if (athis.data.roomtypearray[i] == rooms.house_type){
            athis.setData({
              roomtypeindex: i
            })
            break;
          }
        }
        //房屋图片  
        if (rooms.house_photo.length==9){
          athis.setData({
            roomimaegstitle:2
          })
        }
        for (var i = 0; i < rooms.house_photo.length;i++){
          var attrr = ['a', "b", "c", "d", "e", "f", "g", "h", "i"];
          athis.addallimg(rooms.house_photo[i].house_photo, attrr[i]);
        }
        //产权人类型
        if (rooms.house_property_type == 1) {
          athis.setData({
            propertytypeindex: 0
          })
        } else {
          athis.setData({
            propertytypeindex: 1
          })
        }
        //产权人民族
        for (var i = 0; i < athis.data.nationarray.length; i++) {
          if (athis.data.nationarray[i].id == rooms.house_property_nation) {
            athis.setData({
              checkname: athis.data.nationarray[i].name
            })
            break;
          }
        }
        //产权人证件种类
        for (var i = 0; i < athis.data.idcardarrayindex.length; i++) {
          if (athis.data.idcardarrayindex[i] == rooms.house_property_id_type) {
            athis.setData({
              idcardindex: i
            })
            break;
          }
        }
        //不动产证照片
        if (rooms.house_property_photo !== ""){
          var aa = wx.getFileSystemManager();
          aa.writeFile({
            filePath: wx.env.USER_DATA_PATH + '/orderqrcode.png',
            data: rooms.house_property_photo,
            encoding: 'base64',
            success: res => {
              athis.setData({
                cardimaegsarray: athis.data.cardimaegsarray.concat(wx.env.USER_DATA_PATH + '/orderqrcode.png'),
                oldcardimaegsarray: athis.data.oldcardimaegsarray.concat(wx.env.USER_DATA_PATH + '/orderqrcode.png'),
                cardimagestitle:"2"
              })
            }, fail: err => {
              console.log(err)
            }
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
  //修改时，添加房屋图片
  addallimg:function(images,strindex){
    var athis=this;
    var aa = wx.getFileSystemManager();
    var attrimg = ""
    attrimg = wx.env.USER_DATA_PATH +'/'+ strindex + '.png'
    aa.writeFile({
      filePath: attrimg,
      data: images,
      encoding: 'base64',
      success: res => {
        athis.setData({
          roomimaegsarray: athis.data.roomimaegsarray.concat(attrimg),
          oldroomimaegsarray: athis.data.oldroomimaegsarray.concat(attrimg)
        })
      }, fail: err => {
        console.log(err)
      }
    })
  },
  //选择地址
  choosemap:function(e){
    var athis = this
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success(e) {
              wx.chooseLocation({
                success: function (res) {
                  athis.setData({
                    addrstate: 2,
                    addrmsg: res
                  })
                },
              })
            },fail(e){
              if (e.errMsg == "authorize:fail:auth deny" || e.errMsg == "authorize:fail auth deny"){
                utils.alertViewNosucces("权限申请", "请在我的-授权设置中开启位置信息权限，以正常使用地址选择功能", false);
              }
            }
          })
        }else{
          wx.chooseLocation({
            success: function (res) {
              athis.setData({
                addrstate: 2,
                addrmsg: res
              })
            },
          })
        }
      }
    })
  },
  //房间来源
  bindPickerChange(e) {
    this.setData({
      roomoriginindex: e.detail.value
    })
    if (e.detail.value == 0) {
      this.setData({
        roomorigin: 1
      })
    } else {
      this.setData({
        roomorigin: 2
      })
    }
  },
  //出租类型
  bindPickerChange1(e) {
    this.setData({
      lendtypeindex: e.detail.value,
    })
    if (e.detail.value == 0) {
      this.setData({
        lendtype: 1
      })
    } else if (e.detail.value == 1) {
      this.setData({
        lendtype: 2
      })
    } else {
      this.setData({
        lendtype: 9
      })
    }
  },
  //房屋类型
  bindPickerChange2(e) {
    this.setData({
      roomtypeindex: e.detail.value,
      roomtype: this.data.roomtypearray[e.detail.value]
    })
  },
  //选择添加房屋图片的方式
  addroomimages:function(){
    var athis = this;
    wx.showActionSheet({
      itemList: ['从相册中选择', '拍照'],
      itemColor: "#f7982a",
      success: function (res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) {
            athis.chooseroomimages('album')
          } else if (res.tapIndex == 1) {
            athis.chooseroomimages('camera')
          }
        }
      }
    })
  }, 
  //添加房屋图片
  chooseroomimages: function (type) {
    var athis = this;
    var chooseImageNum = 9 - athis.data.roomimaegsarray.length * 1;
    wx.chooseImage({
      count: chooseImageNum,
      sizeType: ['compressed'],
      sourceType: [type],
      success(res) {
        athis.setData({
          roomimaegsarray: athis.data.roomimaegsarray.concat(res.tempFilePaths)
        })
        if (athis.data.roomimaegsarray.length == 9) {
          athis.setData({
            roomimaegstitle: 2
          })
        }
      }
    })
  },
  //删除添加的图片
  delederoomimages:function(e){
    var imageindex = e.currentTarget.dataset.imageindex;
    var roomimaegsarray = this.data.roomimaegsarray;
    roomimaegsarray.splice(imageindex,1);
    this.setData({
      roomimaegsarray: roomimaegsarray,
      roomimaegstitle:1
    })
  },
  //返回page1
  back_page1: function () {
    this.setData({
      roompage1: false,
      roompage2: true,
      roompage3: true
    })
  },
  //产权人类型
  bindPickerChange4(e) {
    this.setData({
      propertytypeindex: e.detail.value
    })
    if (e.detail.value == 0) {
      this.setData({
        propertytype: 1
      })
    } else {
      this.setData({
        propertytype: 2
      })
    }
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
      medalstate: "1",
      checkid: e.currentTarget.dataset.nationid,
      checkname: e.currentTarget.dataset.nationname
    })
  },
  //关闭房源模态框
  closemedal: function () {
    this.setData({
      medalstate: "1"
    })
  },
  //产权人证件类型
  bindPickerChange3(e) {
    this.setData({
      idcardindex: e.detail.value,
      idcard: this.data.idcardarrayindex[e.detail.value]
    })
  },
  //添加不动产证照片的方式
  addcardimages: function () {
    var athis = this;
    wx.showActionSheet({
      itemList: ['从相册中选择', '拍照'],
      itemColor: "#f7982a",
      success: function (res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) {
            athis.choosecardimages('album')
          } else if (res.tapIndex == 1) {
            athis.choosecardimages('camera')
          }
        }
      }
    })
  },
  //添加不动产证照片
  choosecardimages:function(type){
    var athis = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: [type],
      success(res) {
        athis.setData({
          cardimaegsarray: athis.data.cardimaegsarray.concat(res.tempFilePaths),
          cardimagestitle: 2
        })
      }
    })
  },
  //删除不动产证照片
  deledecardimages: function (e) {
    var imageindex = e.currentTarget.dataset.imageindex;
    var cardimaegsarray = this.data.cardimaegsarray;
    cardimaegsarray.splice(imageindex, 1);
    this.setData({
      cardimaegsarray: cardimaegsarray
    })
    if (this.data.cardimaegsarray.length==0){
      this.setData({
        cardimagestitle:1
      })
    }
  },
  //最大化显示图片
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: [e.currentTarget.dataset.src]
    })
  },
  //返回page2
  back_page2: function () {
    this.setData({
      roompage1: true,
      roompage2: false,
      roompage3: true
    })
  },
  //显示更多内容
  showmoreview:function(){
    this.setData({
      moreview:false,
      moreshow:"2"
    })
  },
  //隐藏更多内容
  hidemoreview: function () {
    this.setData({
      moreview: true,
      moreshow: "1"
    })
  },
  //跳页及表单提交
  formSubmit:function(e){
    formvalue = e.detail.value;
    var athis=this;
    if (e.detail.target.dataset.btnindex == "0"){
      if (utils.compare(formvalue, athis.data.oldroomInfo) == false) {
        wx.showModal({
          title: '提示',
          content: '您更新了数据，是否放弃保存？',
          cancelText: "否",
          confirmText: "是",
          success(res) {
            if (res.confirm) {
              wx.switchTab({
                url: '../room/roomlist',
              })
            }
          }
        })
      } else if (utils.checkArray(athis.data.roomimaegsarray, athis.data.oldroomimaegsarray) == false) {
        wx.showModal({
          title: '提示',
          content: '您更新了房屋图片，是否放弃保存？',
          cancelText: "否",
          confirmText: "是",
          success(res) {
            if (res.confirm) {
              wx.switchTab({
                url: '../room/roomlist',
              })
            }
          }
        })
      } else if (utils.checkArray(athis.data.cardimaegsarray, athis.data.oldcardimaegsarray) == false) {
        wx.showModal({
          title: '提示',
          content: '您更新了不动产证照片，是否放弃保存？',
          cancelText: "否",
          confirmText: "是",
          success(res) {
            if (res.confirm) {
              wx.switchTab({
                url: '../room/roomlist',
              })
            }
          }
        })
      } else {
        wx.switchTab({
          url: '../room/roomlist',
        })
      }
    } else if (e.detail.target.dataset.btnindex == "1"){
      if (formvalue.net_house_name==""){
        utils.alertViewNosucces("提示", "请输入网约房名称信息", false);
        return;
      }
      if (formvalue.net_house_provinces.length == 1){
        utils.alertViewNosucces("提示", "请选择网约房地址", false);
        return;
      }
      if (formvalue.room_id == "") {
        utils.alertViewNosucces("提示", "请输入详细地址", false);
        return;
      }
      var houseIsExistjson={
        "skey": app.globalData.skey,
        "net_house_provinces": formvalue.net_house_provinces,
        "room_id": formvalue.room_id
      }
      if (athis.data.nethouseid != '') {
        houseIsExistjson.net_house_id = athis.data.nethouseid;
      }
      utils.showLoading("请稍等")
      utils.request1("/weboperate/houseIsExist", houseIsExistjson, function (e) {
        wx.hideLoading();
        if (e.data.result == "0") {
          athis.setData({
            roompage1: true,
            roompage2: false,
            roompage3: true
          })
        } else if (e.data.result == "2") {
          utils.alertView("提示", "你已退出，请点击“确认”重新登录", function () {
            app.getLogin();
          })
        } else {
          utils.alertViewNosucces("提示", e.data.message + " ", false);
        }
      })  
    } else if (e.detail.target.dataset.btnindex == "2"){
      if (formvalue.house_num == "" || formvalue.house_num=="0"){
        utils.alertViewNosucces("提示", "请添加最少为1的房屋间数", false);
        return;
      }
      if (formvalue.reside_num_max == "" || formvalue.reside_num_max == "0") {
        utils.alertViewNosucces("提示", "请添加最少为1的最大入住人数", false);
        return;
      }
      if (formvalue.house_acreage == "" || formvalue.house_acreage == "0") {
        utils.alertViewNosucces("提示", "请添加最少为1的房屋面积", false);
        return;
      }
      if (formvalue.house_bed_num == "" || formvalue.house_bed_num == "0") {
        utils.alertViewNosucces("提示", "请添加至少为1的床位数", false);
        return;
      }
      if (athis.data.roomimaegsarray.length==0){
        utils.alertViewNosucces("提示", "请至少添加一张房屋图片", false);
        return;
      }
      athis.setData({
        roompage1: true,
        roompage2: true,
        roompage3: false
      })
    } else {
      if (formvalue.house_property_type==""){
        utils.alertViewNosucces("提示", "请输入产权人类型信息", false);
        return;
      }
      if (formvalue.house_property_name == "") {
        utils.alertViewNosucces("提示", "请输入产权人/法人姓名信息", false);
        return;
      }
      if (formvalue.house_property_id_num == "") {
        utils.alertViewNosucces("提示", "请输入产权人证件号码信息", false);
        return;
      }
      if (!utils.checkIdCard(formvalue.house_property_id_num)) {
        utils.alertViewNosucces("提示", "请输入正确格式的产权人证件号码", false);
        return;
      }
      if (formvalue.house_property_phone == "") {
        utils.alertViewNosucces("提示", "请输入产权人联系电话信息", false);
        return;
      }
      if (!utils.checkPhone(formvalue.house_property_phone)) {
        utils.alertViewNosucces("提示", "请输入正确格式的产权人联系电话", false);
        return;
      }
      utils.showLoading("请稍等")
      var uuid = utils.uuid();
      formvalue.skey = app.globalData.skey;
      if (athis.data.nethouseid==''){
        formvalue.net_house_id = uuid;
      }else{
        formvalue.net_house_id = athis.data.nethouseid
      }
      formvalue.type = athis.data.type
      var roomimaegsarray = athis.data.roomimaegsarray;
      var cardimaegsarray = athis.data.cardimaegsarray;
      var successUp = 0; //成功
      var failUp = 0; //失败
      var count = 0; //第几张
      athis.uploadOneByOne(roomimaegsarray, cardimaegsarray, successUp, failUp, count, roomimaegsarray.length, uuid);
    }
  },
  //采用递归的方式上传多张
  uploadOneByOne(imgPaths, imgPaths2, successUp, failUp, count, length, uuid) {
    var that = this;
    var net_house_id=""
    if (that.data.nethouseid == '') {
      net_house_id = uuid;
    } else {
      net_house_id = that.data.nethouseid
    }
    wx.showLoading({
      title: '正在上传第' + (count+1) + '张',
    })
    wx.uploadFile({
      url: app.globalData.urls + '/saveHousePhoto',
      filePath: imgPaths[count],
      name: "houseImg",
      header: {
        "Authorization": "Bearer " + app.globalData.pcloginstate.token
      },
      formData: {
        "skey": app.globalData.skey,
        "net_house_id": net_house_id,
        "type": that.data.type
      },
      success: function (e) {
        successUp++;//成功+1
      },
      fail: function (e) {
        failUp++;//失败+1
      },
      complete: function (e) {
        count++;//下一张
        if (count == length) {
          if (imgPaths2.length==0){
            utils.showLoading("请稍等")
            utils.request1("/weboperate/saveHouseInfoNoFile", formvalue, function (res) {
              wx.hideLoading();
              if (res.data.result == "0") {
                if (that.data.nethouseid == '') {
                  wx.showModal({
                    title: '提示',
                    content: '房源添加成功，是否要绑定锁？',
                    success(res) {
                      if (res.confirm) {
                        wx.redirectTo({
                          url: '../room/bindlock?nethouseid=' + net_house_id + "&locktype=0"
                        })
                      } else if (res.cancel) {
                        wx.switchTab({
                          url: '../room/roomlist',
                        })
                      }
                    }
                  })
                } else {
                  utils.showSuccess("房源修改成功", 1500, "success");
                  setTimeout(function () {
                    wx.switchTab({
                      url: '../room/roomlist',
                    })
                  }, 1500)            
                }
              } else if (res.data.result == "2") {
                utils.alertView("提示", "你已退出，请点击“确认”重新登录", function () {
                  app.getLogin();
                })
              } else {
                if (!res.data.result) {
                  utils.alertViewNosucces("提示", "服务未响应，请稍后再试", false);
                  return;
                }
                utils.alertViewNosucces("提示", res.data.message + " ", false);
              }
            })
          }else{
            wx.showLoading({
              title: '正在上传不动产证照片',
            })
            wx.uploadFile({
              url: app.globalData.urls + '/saveHouseInfo',
              filePath: imgPaths2[0],
              name: 'housePropertyPhoto',
              header: {
                "Authorization": "Bearer " + app.globalData.pcloginstate.token
              },
              formData: formvalue,
              success(res) {
                wx.hideLoading();
                var ress = JSON.parse(res.data);
                if (ress.result == "0") {
                  if (that.data.nethouseid == '') {
                    wx.showModal({
                      title: '提示',
                      content: '房源添加成功，是否要绑定锁？',
                      success(res) {
                        if (res.confirm) {
                          wx.redirectTo({
                            url: '../room/bindlock?nethouseid=' + net_house_id + "&locktype=0"
                          })
                        } else if (res.cancel) {
                          wx.switchTab({
                            url: '../room/roomlist',
                          })
                        }
                      }
                    })
                  } else {
                    utils.showSuccess("房源修改成功", 1500, "success");
                    setTimeout(function () {
                      wx.switchTab({
                        url: '../room/roomlist',
                      })
                    }, 1500)   
                  }
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
              }
            })
          }
        } else {
          //递归调用，上传下一张
          that.uploadOneByOne(imgPaths, imgPaths2, successUp, failUp, count, length, uuid);
          console.log('正在上传第' + count + '张');
        }
      }
    })
  }
})