/**
 * @name publicFn
 * @description 请求结束处理一些回调等 
 * @author Sky
 */

successResult = (res, msg, resFn) => {
  console.log('errorMsg',errorMsg);
  var msg = msg || '操作成功' 
  if(resFn){
    resFn()
  }else{
    res.json({ code: -1, msg });
  }
},

// const publicFn = {
  setCatch = (res, errorMsg, resFn) => {
    console.log('errorMsg',errorMsg);
    var msg = '请稍后再试' 
    if(resFn){
      resFn()
    }else{
      res.json({ code: -1, msg });
    }
  },
// }

module.exports = {successResult, setCatch};