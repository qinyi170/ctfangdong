var utils = require("../../utils/util.js");
Page({
  data: {
    my: {
      name: "xuyang",
      age: 21
    }
  },
  onLoad() {
    utils.setWatcher(this.data, this.watch);
    this.data.my.name = 'xuyang';
    this.data.my.age = 21;
    this.setData({
      my: this.data.my
    })
  },
  watch: {
    'my.name': function (newValue,) {
      console.log(newValue);
    },
    'my.age': function (newValue) {
      console.log(newValue);
    }
  }
})