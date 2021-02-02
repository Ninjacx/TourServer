/**
 * @name publicFn
 * @description 请求结束处理一些回调等 
 * @author Sky
 */

// const publicFn = {
  setCatch = (res, errorMsg, resFn) => {
    var msg = errorMsg || '请稍后再试' 
    if(resFn){
      resFn()
    }else{
      res.json({ code: -1, msg });
    }
    
  },
// }

module.exports = {setCatch};