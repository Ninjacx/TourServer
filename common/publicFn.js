/**
 * @name publicFn
 * @description 检查用户是否登录的一些中间件 等 
 * @author Sky
 */
var conf = require('../conf/conf');

/*APP 登录中间件验证*/

// const publicFn = {
  setCatch = (res, errorMsg, resFn) => {
    if(resFn){
      resFn()
    }else{
      // console.log('error',errorMsg);
      res.json({ code: -1, msg: '请稍后再试' });
    }
    
  },
// }

module.exports = {setCatch};