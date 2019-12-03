Page({
  data: {
    array: [],//默认显示一个
    inputVal: []//所有input的内容
  },
  //获取input的值
  getNameVal: function (e) {
    var nowIdx = e.currentTarget.dataset.idx;//获取当前索引
    var val = e.detail.value;//获取输入的值
    var oldVal = this.data.inputVal;
    oldVal[nowIdx].name = val;//修改对应索引值的内容
    this.setData({
      inputVal: oldVal
    });
    console.log(this.data.inputVal)
  },
  //获取input的值
  getAgeVal: function (e) {
    var nowIdx = e.currentTarget.dataset.idx;//获取当前索引
    var val = e.detail.value;//获取输入的值
    var oldVal = this.data.inputVal;
    oldVal[nowIdx].age = val;//修改对应索引值的内容
    this.setData({
      inputVal: oldVal
    });
    console.log(this.data.inputVal)
  },
  //添加input
  addInput: function () {
    var old = this.data.array;
    var old2 = this.data.inputVal;
    old.push(1);//这里不管push什么，只要数组长度增加1就行
    old2.push({"name":"","age":""})
    this.setData({
      array: old
    })
    console.log(this.data.array)
  },
  //删除input
  delInput: function (e) {
    var nowidx = e.currentTarget.dataset.idx;//当前索引
    var oldInputVal = this.data.inputVal;//所有的input值
    var oldarr = this.data.array;//循环内容
    oldarr.splice(nowidx, 1);    //删除当前索引的内容，这样就能删除view了
    oldInputVal.splice(nowidx, 1);//view删除了对应的input值也要删掉
    if (oldarr.length < 1) {
      oldarr = [0]  //如果循环内容长度为0即删完了，必须要留一个默认的。这里oldarr只要是数组并且长度为1，里面的值随便是什么
    }
    this.setData({
      array: oldarr,
      inputVal: oldInputVal
    })
    console.log(this.data.inputVal)
  }
})

