import WeCropper from '../we-cropper/we-cropper.js'
const device = wx.getSystemInfoSync() // 获取设备信息
const width = device.windowWidth // 示例为一个与屏幕等宽的正方形裁剪框
const devicePixelRatio = device.pixelRatio
const height = device.windowHeight - 70
const fs = width / 750 * 2
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;

const app = getApp()
var utils = require("../../utils/util.js");
var datajson = require("../../utils/datas.js");
var formvalue;
Page({
  data: {
    scrollheight: "height:" + (app.globalData.pheight - app.globalData.pwidth/750*(180+70+60)) + "px",
    currentTopItem:0,
    roomItem0: false,
    roomItem1: true,
    roomItem2: true,
    roomItem3: true,
    picmadel:true,
    imgSrc: '',//确定裁剪后的图片
    cropperOpt: {
      id: 'cropper',
      width: width, // 画布宽度
      height: height, // 画布高度
      scale: 2.5, // 最大缩放倍数
      zoom: 8, // 缩放系数
      cut: {
        x: (width - 250) / 2, // 裁剪框x轴起点(width * fs * 0.128) / 2
        y: (height * 0.5 - 180 * 0.5), // 裁剪框y轴期起点
        width: 250, // 裁剪框宽度
        height: 150// 裁剪框高度
      }
    },
    roomimaegsarray: [],//房屋图片
    houseProvincesIndex:[],
    houseProvincesValue:"",
    roomimaegstitle: 1,
    addrmsg: {},//选择地址
    addrstate: 1,
    houseRentoutTypeIndex:"",
    houseTypeArr: ["请选择","普通公寓", "酒店式公寓", "精品客栈", "乡间名宿", "别墅", "loft复式", "房车", "四合院"],
    houseTypeIndex:"",
    houseLayoutArr: ["卧室", "客厅", "卫生间", "厨房", "书房", "阳台"],
    houseLayoutIndexArr: ["0", "0", "0", "0", "0", "0"],
    houseBedArr: ["大型双人床", "标准双人床", "单人床", "上下铺", "沙发床", "榻榻米", "其他"],
    houseBedIndexArr: ["0", "0", "0", "0", "0", "0", "0"],
    houseNumIndex:"0",
    houseFacilityArr: [],
    houseFacilityIndexArr: [],
    houseFacilityState:1,
    houseSourceArr: ["转租", "自营"],
    houseSourceIndex: "1",
    propertyTypeArr: ["自然人", "企业"],
    propertyTypeIndex: "1",
    checkid: "01",
    checkname: "汉族",
    propertyIdTypeArr: ["身份证", "港澳通行证", "护照","其他"],
    propertyIdTypeValue: ["111", "513", "414","990"],
    propertyIdTypeIndex: "0",
    propertyIdType:"111",
    cardimaegsarray:[],//不动产证照片
    cardimagestitle:1,
    nethouseid:"",
    roomInfo:{},
    type:"",//数据提交类型，空为添加，非空为修改
    ischeck:false,
    oldroomInfo:{
      net_house_name: "",
      house_basic_declare: "",
      head_pic:"",
      net_house_provinces:"",
      net_house_addr:"",
      house_latitude:"",
      house_longitude:"",
      room_id:"",
      house_rentout_type:"",
      house_type:"",
      house_layout:"",
      house_acreage:"",
      house_bed:"",
      reside_num_max:"",
      house_facility:"",
      price_common:"",
      price_holiday:"",
      house_source:"1",
      house_property_type:"1",
      house_property_nation:"01",
      house_property_name:"",
      house_property_id_type:"111",
      house_property_id_num:"",
      house_property_phone:"",
      no_property_credentice_id:"",
      house_property_unit_name:"",
      house_property_legal_person_id:"",
    },
    oldroomimaegsarray:[],
    oldcardimaegsarray:[]
  },
  onLoad: function (e) {
    qqmapsdk = new QQMapWX({
      //此key需要用户自己申请
      key: 'MNXBZ-G5TWD-GYF42-HHZJL-2W2J3-PVBX4'
    });

    const { cropperOpt } = this.data
    this.cropper = new WeCropper(cropperOpt)
      .on('ready', (ctx) => {
        console.log(`wecropper is ready for work!`)
      })
      .on('beforeImageLoad', (ctx) => {
        wx.showToast({
          title: '上传中',
          icon: 'loading',
          duration: 20000
        })
      })
      .on('imageLoad', (ctx) => {
        wx.hideToast()
      })
    //刷新画面
    this.wecropper.updateCanvas()
    
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
      console.log(e)
      wx.hideLoading();
      if (e.data.result == "0") {
        var rooms = e.data.dataObject;
        athis.setData({
          roomInfo: rooms,
          imgSrc: rooms.head_pic,
          addrmsg: {
            address: rooms.net_house_addr,
            name: rooms.room_id,
            latitude: rooms.house_latitude,
            longitude: rooms.house_longitude
          },
          houseProvincesValue: rooms.net_house_provinces,
          houseRentoutTypeIndex: rooms.house_rentout_type,
          houseTypeIndex: rooms.house_type,
          houseNumIndex: rooms.reside_num_max,
          houseSourceIndex: rooms.house_source,
          propertyTypeIndex: rooms.house_property_type,
          checkid: rooms.house_property_nation,
          propertyIdType: rooms.house_property_id_type,
          oldroomInfo: {
            net_house_name: rooms.net_house_name,
            house_basic_declare: rooms.house_basic_declare,
            head_pic: rooms.head_pic,
            net_house_provinces: rooms.net_house_provinces,
            net_house_addr: rooms.net_house_addr,
            house_latitude: rooms.house_latitude,
            house_longitude: rooms.house_longitude,
            room_id: rooms.room_id,
            house_rentout_type: rooms.house_rentout_type,
            house_type: rooms.house_type,
            house_acreage: rooms.house_acreage,
            reside_num_max: rooms.reside_num_max,
            price_common: rooms.price_common,
            price_holiday: rooms.price_holiday,
            house_source: rooms.house_source,
            house_property_type: rooms.house_property_type,
            house_property_nation: rooms.house_property_nation,
            house_property_name: rooms.house_property_name,
            house_property_id_type: rooms.house_property_id_type,
            house_property_id_num: rooms.house_property_id_num,
            house_property_phone: rooms.house_property_phone,
            no_property_credentice_id: rooms.no_property_credentice_id,
            house_property_unit_name: rooms.house_property_unit_name,
            house_property_legal_person_id: rooms.house_property_legal_person_id
          }
        })
        if (rooms.net_house_provinces == "") {
          athis.setData({
            addrstate: 1,
          })
        } else {
          athis.setData({
            addrstate: 2,
          })
        }
        //房屋图片  
        if (rooms.house_photo.length >= 9) {
          athis.setData({
            roomimaegstitle: 2
          })
        }
        for (var i = 0; i < rooms.house_photo.length; i++) {
          var attrr = ['a', "b", "c", "d", "e", "f", "g", "h", "i"];
          athis.addallimg(rooms.house_photo[i].house_photo, attrr[i]);
        }
        //房源户型
        if (rooms.house_layout != null) {
          var house_layout = rooms.house_layout.split(",");
          var tempHouseLayoutIndexArr=[]
          for (var i in house_layout) {
            tempHouseLayoutIndexArr.push(house_layout[i])
          }
          athis.setData({
            houseLayoutIndexArr: tempHouseLayoutIndexArr
          })
        }
        //选择床型
        if (rooms.house_bed != null) {
          var house_bed = rooms.house_bed.split(",");
          var tempHouseBedIndexArr = []
          for (var i in house_bed) {
            tempHouseBedIndexArr.push(house_bed[i])
          }
          athis.setData({
            houseBedIndexArr: tempHouseBedIndexArr
          })
        }
        //设置便利设施
        if (rooms.house_facility != null) {
          var houseFacilityIndexArr = athis.data.houseFacilityIndexArr
          if (rooms.house_facility.length==1){
            houseFacilityIndexArr.push(rooms.house_facility)
          }else{
            var house_facility = rooms.house_facility.split(",")
            for (var i in house_facility) {
              houseFacilityIndexArr.push(house_facility[i])
            }
          }
          athis.setData({
            houseFacilityIndexArr: houseFacilityIndexArr
          })
        }
        var tempoldroomInfo = athis.data.oldroomInfo;
        if (rooms.house_type.length>2){
          athis.setData({
            houseTypeIndex: "",
          })
          tempoldroomInfo.house_type="";
        }
        tempoldroomInfo.house_layout = athis.data.houseLayoutIndexArr;
        tempoldroomInfo.house_bed = athis.data.houseBedIndexArr;
        tempoldroomInfo.house_facility = athis.data.houseFacilityIndexArr;
        athis.setData({
          oldroomInfo: tempoldroomInfo
        })
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
        for (var i = 0; i < athis.data.propertyIdTypeValue.length; i++) {
          if (athis.data.propertyIdTypeValue[i] == rooms.house_property_id_type) {
            athis.setData({
              propertyIdTypeIndex: i
            })
            break;
          }
        }
        //不动产证照片
        if (rooms.house_property_photo !== "") {
          var aa = wx.getFileSystemManager();
          aa.writeFile({
            filePath: wx.env.USER_DATA_PATH + '/orderqrcode.png',
            data: rooms.house_property_photo,
            encoding: 'base64',
            success: res => {
              athis.setData({
                cardimaegsarray: athis.data.cardimaegsarray.concat(wx.env.USER_DATA_PATH + '/orderqrcode.png'),
                oldcardimaegsarray: athis.data.oldcardimaegsarray.concat(wx.env.USER_DATA_PATH + '/orderqrcode.png'),
                cardimagestitle: "2"
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
  addallimg: function (images, strindex) {
    var athis = this;
    var aa = wx.getFileSystemManager();
    var attrimg = ""
    attrimg = wx.env.USER_DATA_PATH + '/' + strindex + '.png'
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
  //上传封面图片 --begin
  touchStart(e) {
    this.cropper.touchStart(e)
  },
  touchMove(e) {
    this.cropper.touchMove(e)
  },
  touchEnd(e) {
    this.cropper.touchEnd(e)
  },
  uploadTap() {
    const self = this
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success(res) {
        self.setData({
          picmadel: false
        })
        console.log(res)
        wx.compressImage({
          src: res.tempFilePaths[0], // 图片路径
          quality: 10, // 压缩质量
          success:function(ress){
            console.log(ress)
            self.wecropper.pushOrign(ress.tempFilePath);
          }
        })      
      }
    })
  },
  getCropperImage() {
    let that = this;
    wx.showLoading({
      title: '请稍等',
    })
    // 如果有需要两层画布处理模糊，实际画的是放大的那个画布
    this.wecropper.getCropperImage((src) => {
      if (src) {
        var FSM = wx.getFileSystemManager();
        FSM.readFile({
          filePath: src,
          encoding: "base64",
          success: function (data) {   
            that.setData({
              imgSrc: data.data,
              picmadel: true
            })
            wx.hideLoading();
          }
        });
      } else {
        console.log('获取图片地址失败，请稍后重试')
      }
    })
  },
  closeCropperImage(){
    this.setData({
      picmadel: true
    })
  },
  //上传封面图片 --end

  //选择添加房屋图片的方式
  addroomimages: function () {
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
  delederoomimages: function (e) {
    var imageindex = e.currentTarget.dataset.imageindex;
    var roomimaegsarray = this.data.roomimaegsarray;
    roomimaegsarray.splice(imageindex, 1);
    this.setData({
      roomimaegsarray: roomimaegsarray,
      roomimaegstitle: 1
    })
  },

  //地址--begin
  //省市县选择
  changeHouseProvinces(e) {
    var tempval = e.detail.value;
    var temparr = ""
    if (tempval[0] == tempval[1]) {
      temparr = tempval[0] + tempval[2]
    } else {
      temparr = tempval[0] + tempval[1] + tempval[2]
    }
    this.setData({
      houseProvincesIndex: tempval,
      houseProvincesValue: temparr
    })
    this.getMsgByAddr(tempval[0] + tempval[1] + tempval[2])
  },
  choosemap: function (e) {
    var athis = this
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success(e) {
              athis.chooseLocation();
            }, fail(e) {
              if (e.errMsg == "authorize:fail:auth deny" || e.errMsg == "authorize:fail auth deny") {
                utils.alertViewNosucces("权限申请", "请在我的-授权设置中开启位置信息权限，以正常使用地址选择功能", false);
              }
            }
          })
        } else {
          athis.chooseLocation();
        }
      }
    })
  },
  //获取当前位置
  getLocation() {
    var athis = this
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success(e) {
              wx.getLocation({
                type: 'gcj02',
                success(res) {
                  athis.getMsgByLngLat(res.latitude, res.longitude, 1)
                }
              })
            }, fail(e) {
              if (e.errMsg == "authorize:fail:auth deny" || e.errMsg == "authorize:fail auth deny") {
                utils.alertViewNosucces("权限申请", "请在我的-授权设置中开启位置信息权限，以正常使用地址选择功能", false);
              }
            }
          })
        } else {
          wx.getLocation({
            type: 'gcj02',
            success(res) {
              athis.getMsgByLngLat(res.latitude, res.longitude)
            }
          })
        }
      }
    })
  },
  //打开地图选择地址
  chooseLocation(){
    var athis=this;
    wx.chooseLocation({
      success: function (res) {
        console.log(res)
        athis.getMsgByLngLat(res.latitude, res.longitude)
        athis.setData({
          addrstate: 2,
          addrmsg: res
        })
      },
    })
  },
  //通过详细地址获取信息
  getMsgByAddr(address) {
    var athis=this;
    qqmapsdk.geocoder({
      address: address,
      success: function (res) {
        athis.setData({
          locationlatandlng: res.result.location
        })
      }
    })
  },
  //通过经纬度获取信息
  getMsgByLngLat: function (latitude, longitude) {
    var athis = this;
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function (e) {
        console.log(e)
        var address_component = e.result.address_component;
        var tempaddrmsg = athis.data.addrmsg;
        if (address_component.province == address_component.city){
          athis.setData({
            houseProvincesValue: address_component.province + address_component.district
          })
        }else{
          athis.setData({
            houseProvincesValue: address_component.province + address_component.city+address_component.district
          })
        }
        tempaddrmsg.address = athis.data.houseProvincesValue + "-" + tempaddrmsg.address.substring(athis.data.houseProvincesValue.length)
        athis.setData({
          addrmsg: tempaddrmsg
        })
      }
    })
  },
  //地址--end

  //出租类型
  tapRentoutType:function(e){
    var rentouttypeid = e.currentTarget.dataset.rentouttypeid;
    this.setData({
      houseRentoutTypeIndex: rentouttypeid
    })
  },

  //房源类型
  changeHouseType(e){
    var tempval = e.detail.value
    if (tempval==0){
      tempval=""
    }
    this.setData({
      houseTypeIndex: tempval
    })
  },

  //房源户型--减数量
  tapHouseLayoutPlus(e) {
    var houselayoutindex = e.currentTarget.dataset.houselayoutindex;
    var houseLayoutIndexArr = this.data.houseLayoutIndexArr;
    houseLayoutIndexArr[houselayoutindex] = houseLayoutIndexArr[houselayoutindex]*1-1;
    if (houseLayoutIndexArr[houselayoutindex] < 0) {
      houseLayoutIndexArr[houselayoutindex] = 0
    }
    this.setData({
      houseLayoutIndexArr: houseLayoutIndexArr
    })
  },
  //房源户型--加数量
  topHouseLayoutAdd(e) {
    var houselayoutindex = e.currentTarget.dataset.houselayoutindex;
    var houseLayoutIndexArr = this.data.houseLayoutIndexArr;
    houseLayoutIndexArr[houselayoutindex] = houseLayoutIndexArr[houselayoutindex] * 1+1;
    this.setData({
      houseLayoutIndexArr: houseLayoutIndexArr
    })
  },

  //选择床型--减数量
  tapHouseBedPlus(e) {
    var housebedindex = e.currentTarget.dataset.housebedindex;
    var houseBedIndexArr = this.data.houseBedIndexArr;
    houseBedIndexArr[housebedindex] = houseBedIndexArr[housebedindex] * 1 - 1;
    if (houseBedIndexArr[housebedindex] < 0) {
      houseBedIndexArr[housebedindex] = 0
    }
    this.setData({
      houseBedIndexArr: houseBedIndexArr
    })
  },
  //选择床型--加数量
  topHouseBedAdd(e) {
    var housebedindex = e.currentTarget.dataset.housebedindex;
    var houseBedIndexArr = this.data.houseBedIndexArr;
    houseBedIndexArr[housebedindex] = houseBedIndexArr[housebedindex] * 1 + 1;
    this.setData({
      houseBedIndexArr: houseBedIndexArr
    })
  },

  //可住人数--减数量
  tapHouseNumPlus(e) {
    var houseNumIndex = this.data.houseNumIndex;
    houseNumIndex = houseNumIndex * 1 - 1;
    if (houseNumIndex < 0) {
      houseNumIndex = 0
    }
    this.setData({
      houseNumIndex: houseNumIndex
    })
  },
  //可住人数--输入数量
  blurHouseNum(e){
    this.setData({
      houseNumIndex: e.detail.value
    })
  },
  //可住人数--加数量
  topHouseNumAdd(e) {
    var houseNumIndex = this.data.houseNumIndex;
    houseNumIndex = houseNumIndex * 1 + 1;
    this.setData({
      houseNumIndex: houseNumIndex
    })
  },

  //便利设施--加载所有便利设施
  getHouseFacility(){
    var athis = this;
    utils.showLoading("请稍等")
    utils.request1("/weboperate/queryFacility", {
      "skey": app.globalData.skey
    }, function (e) {
      wx.hideLoading();
      if (e.data.result == "0") {
        var tempdata = e.data.dataObject;
        var houseFacilityIndexArr = athis.data.houseFacilityIndexArr;
        for (var i = 0; i < tempdata.length;i++){
          if (houseFacilityIndexArr.indexOf(tempdata[i].id)==-1){
            tempdata[i].checked = false;
          }else{
            tempdata[i].checked = true;
          }
        }
        athis.setData({
          houseFacilityArr: tempdata
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
  //便利设施--点击选择
  tapHouseFacility(e){
    var facilitystate = e.currentTarget.dataset.facilitystate;
    var idx = e.currentTarget.dataset.idx;
    var houseFacilityArr = this.data.houseFacilityArr;
    var houseFacilityIndexArr = this.data.houseFacilityIndexArr;
    if (facilitystate==true){
      houseFacilityArr[idx].checked = false
    }else{
      houseFacilityArr[idx].checked = true
    }
    houseFacilityIndexArr=[];
    for (var i = 0; i < houseFacilityArr.length;i++){
      if (houseFacilityArr[i].checked==true){
        houseFacilityIndexArr.push(houseFacilityArr[i].id)
      }
    }
    this.setData({
      houseFacilityArr: houseFacilityArr,
      houseFacilityIndexArr: houseFacilityIndexArr,
    })
  },

  //房屋来源
  changeHouseSource(e) {
    var tempval = e.detail.value;
    if (tempval==0){
      this.setData({
        houseSourceIndex: 1
      })
    }else{
      this.setData({
        houseSourceIndex: 2
      })
    }
  },

  //产权人类型
  changePropertyType(e) {
    var tempval = e.detail.value;
    if (tempval == 0) {
      this.setData({
        propertyTypeIndex: 1
      })
    } else {
      this.setData({
        propertyTypeIndex: 2
      })
    }
  },

  //产权人民族--begin
  openmodal: function () {
    this.setData({
      medalstate: "2"
    })
  },
  chosemodal: function (e) {
    this.setData({
      medalstate: "1",
      checkid: e.currentTarget.dataset.nationid,
      checkname: e.currentTarget.dataset.nationname
    })
  },
  closemedal: function () {
    this.setData({
      medalstate: "1"
    })
  },
  //产权人民族--end

  //产权人证件种类
  changePropertyIdType(e) {
    this.setData({
      propertyIdTypeIndex: e.detail.value,
      propertyIdType: this.data.propertyIdTypeValue[e.detail.value]
    })
  },

  //不动产证照片--begin
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
  choosecardimages: function (type) {
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
  deledecardimages: function (e) {
    var imageindex = e.currentTarget.dataset.imageindex;
    var cardimaegsarray = this.data.cardimaegsarray;
    cardimaegsarray.splice(imageindex, 1);
    this.setData({
      cardimaegsarray: cardimaegsarray
    })
    if (this.data.cardimaegsarray.length == 0) {
      this.setData({
        cardimagestitle: 1
      })
    }
  },
  //不动产证照片--end

  //最大化显示图片
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: [e.currentTarget.dataset.src]
    })
  },
  
  //跳页及表单提交
  formSubmit:function(e){
    console.log(e)
    formvalue = e.detail.value;
    formvalue.head_pic = athis.data.imgSrc
    var btns = e.detail.target.dataset
    var athis=this;
    if (btns.btntype==1){
      if (athis.data.currentTopItem==0){
        if (formvalue.net_house_name == "") {
          utils.alertViewNosucces("提示", "请输入房源名称", false);
          return;
        }
      }
      if (athis.data.currentTopItem == 1) {
        if (formvalue.room_id != "" && formvalue.room_id != athis.data.addrmsg.name) {
          qqmapsdk.geocoder({
            address: athis.data.addrmsg.address + formvalue.room_id,
            success: function (res) {
              var tempaddrmsg = athis.data.addrmsg;
              tempaddrmsg.name = formvalue.room_id;
              tempaddrmsg.latitude = res.result.location.lat;
              tempaddrmsg.longitude = res.result.location.lng;
              athis.setData({
                addrmsg: tempaddrmsg
              })
              formvalue.house_latitude = res.result.location.lat;
              formvalue.house_longitude = res.result.location.lng
            }
          })
        }
      }
      if (athis.data.currentTopItem == 3) {
        if (formvalue.house_property_id_num != '' && !utils.checkIdCard(formvalue.house_property_id_num)) {
          utils.alertViewNosucces("提示", "请输入正确格式的产权人证件号码", false);
          return;
        }
        if (formvalue.house_property_phone != '' && !utils.checkPhone(formvalue.house_property_phone)) {
          utils.alertViewNosucces("提示", "请输入正确格式的产权人联系电话", false);
          return;
        }
      }
      athis.setData({
        currentTopItem: btns.navid,
        roomItem0: true,
        roomItem1: true,
        roomItem2: true,
        roomItem3: true,
      })
      if (btns.navid == 0) {
        athis.setData({
          roomItem0: false
        })
      } else if (btns.navid == 1) {
        athis.setData({
          roomItem1: false
        })
      } else if (btns.navid == 2) {
        athis.setData({
          roomItem2: false
        })
        if (athis.data.houseFacilityState == "1") {
          athis.setData({
            houseFacilityState: 2
          })
          athis.getHouseFacility();
        }
      } else if (btns.navid == 3) {
        athis.setData({
          roomItem3: false
        })
      }
    }else{
      if (btns.btnindex == "0") {
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
      } else if (btns.btnindex == "1") {
        if (formvalue.net_house_name == "") {
          utils.alertViewNosucces("提示", "请输入房源名称", false);
          return;
        }
        athis.setData({
          currentTopItem:"1",
          roomItem0: true,
          roomItem1: false,
          roomItem2: true,
          roomItem3: true,
        })
      } else if (btns.btnindex == "2") {
        if (formvalue.room_id != "" && formvalue.room_id != athis.data.addrmsg.name) {
          qqmapsdk.geocoder({
            address: athis.data.addrmsg.address + formvalue.room_id,
            success: function (res) {
              var tempaddrmsg = athis.data.addrmsg;
              tempaddrmsg.name = formvalue.room_id;
              tempaddrmsg.latitude = res.result.location.lat;
              tempaddrmsg.longitude = res.result.location.lng;
              athis.setData({
                addrmsg: tempaddrmsg
              })
              formvalue.house_latitude = res.result.location.lat;
              formvalue.house_longitude = res.result.location.lng
            }
          })
        }
        athis.setData({
          currentTopItem: "2",
          roomItem0: true,
          roomItem1: true,
          roomItem2: false,
          roomItem3: true,
        })
        if (athis.data.houseFacilityState == "1") {
          athis.setData({
            houseFacilityState: 2
          })
          athis.getHouseFacility();
        }
      } else if (btns.btnindex == "3") {
        athis.setData({
          currentTopItem: "3",
          roomItem0: true,
          roomItem1: true,
          roomItem2: true,
          roomItem3: false,
        })
      } else if (btns.btnindex == "4") {
        if (formvalue.house_property_id_num != '' && !utils.checkIdCard(formvalue.house_property_id_num)) {
          utils.alertViewNosucces("提示", "请输入正确格式的产权人证件号码", false);
          return;
        }
        if (formvalue.house_property_phone != '' && !utils.checkPhone(formvalue.house_property_phone)) {
          utils.alertViewNosucces("提示", "请输入正确格式的产权人联系电话", false);
          return;
        }
        utils.showLoading("请稍等")
        var uuid = utils.uuid();
        formvalue.skey = app.globalData.skey;
        if (athis.data.nethouseid == '') {
          formvalue.net_house_id = uuid;
        } else {
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
    if (imgPaths.length==0){
      if (imgPaths2.length == 0) {
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
      } else {
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
    }else{
      wx.showLoading({
        title: '正在上传第' + (count + 1) + '张',
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
            if (imgPaths2.length == 0) {
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
            } else {
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
  }
})