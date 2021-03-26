/**
 * @name publicFn
 * @description 请求结束处理一些回调等 
 * @author Sky
 */

successResult = (res, data, msg, resFn) => {
  var msg = msg || '操作成功' 
  if(resFn){
    resFn()
  }else{
    res.status(200)
    res.json({ code: 200, msg , data: JSON.parse(JSON.stringify(data))});
  }
},
  setCatch = (res, errorMsg, resFn) => {
    var msg = '请稍后再试' 
    if(resFn){
      resFn()
    }else{
      res.status(500)
      res.json({ code: -1, msg });
    }
  },

module.exports = {successResult, setCatch};