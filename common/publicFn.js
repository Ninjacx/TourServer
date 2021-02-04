/**
 * @name publicFn
 * @description 请求结束处理一些回调等 
 * @author Sky
 */

successResult = (res, data, msg, resFn) => {
<<<<<<< HEAD
=======
  console.log('errorMsg',errorMsg);
>>>>>>> 696785e0af4845ea5d3ca6b5b35b7995496c5abb
  var msg = msg || '操作成功' 
  if(resFn){
    resFn()
  }else{
<<<<<<< HEAD
    res.json({ code: -1, msg , data: JSON.parse(JSON.stringify(data))});
=======
    res.json({ code: 200, data, msg});
>>>>>>> 696785e0af4845ea5d3ca6b5b35b7995496c5abb
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

module.exports = {successResult, setCatch};