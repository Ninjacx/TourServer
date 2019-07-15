/**
 * @name checklogin
 * @description 检查用户是否登录的中间件
 * @author Sky
 */

 /*验证*/
 let common = {
   isNull: function(data) {
      // instanceof Array
      //字符串是否为空
      if(typeof(data)==="string"){
         return Boolean(data.replace(/(^\s*)|(\s*$)/g, ""));
      }else{
        // 数组 循环是否有空值 空直接返回
      }
      // else if(){
      //
      // }
        // if(data.replace(/(^\s*)|(\s*$)/g, "")){
        //
        // }
    },
    // 向前台返回JSON方法的简单封装
        jsonWrite: function(res, ret) {
          if (typeof ret === 'undefined') {
              res.json({
                  code: '-1',
                  msg: '获取数据失败，请刷新重试!'
              });
          } else {
              res.json(ret);
          }
        }
 }


  module.exports = common;
