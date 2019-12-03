/**
 * Detail类 构造函数 13691422887
 * @param {string} placeName 途径地
 * @param {string} number 里程数
 */
function Detail(placeName, number) {
  this.placeName = placeName;
  this.number = number;
}
function Info() {
  this.details = [];
}

Page({
  data: {
    info: {}
  },
  init: function () {
    let that = this;
    this.setData({
      info: new Info(),
    });
  },
  onLoad: function (options) {
    this.init();
  },
  addItem: function (e) {
    let info = this.data.info;
    info.details.push(new Detail());
    this.setData({
      info: info
    });
  },
  removeItem: function (e) {
    let info = this.data.info;
    info.details.pop();
    this.setData({
      info: info
    });
  },
  deleteitem: function (e) {
    let info = this.data.info;
    info.details.splice(e.currentTarget.dataset.indexid, 1);
    this.setData({
      info: info
    });
  },

  setPlace: function (e) {
    let index = parseInt(e.currentTarget.id.replace("place-", ""));
    let place = e.detail.value;
    let info = this.data.info;
    info.details[index].placeName = place;
    this.setData({
      info: info
    });
  },

  setNumber: function (e) {
    let index = parseInt(e.currentTarget.id.replace("number-", ""));
    let number = e.detail.value;
    let info = this.data.info;
    info.details[index].number = number;
    this.setData({
      info: info
    });
  },

})