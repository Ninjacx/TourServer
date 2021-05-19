/**
 * @name 
 * @description 页面的表单校验
 * @author Sky
 */


const validate = {
   // 校验参数接口传入参数第二个为设置默认参数
   paramsInit: function(str,initVal) {
      return str ? str : initVal
   },
   isNull: function(str,message,res) {
      /*验证字符串是否为空*/
      if(!Boolean(str.replace(/(^\s*)|(\s*$)/g, ""))){
         res.json({
            code: -1,
            msg: message,
         });
      }
    },
    isNull2: function(str,message,res) {
      /*验证字符串是否为空*/
      if(!Boolean(str.replace(/(^\s*)|(\s*$)/g, ""))){
         return true;
      }
    },
    resultError: function(data,message,res) {
      var msg = message || '参数为空'
      if(data== null || data== "null" || data== undefined || data== "undefined" || data == ''){
         res.json({
            code: -1,
            msg,
         });
         return false
      }
      return true
    },
    // 去除左右空格
    trim: function(str){
       return str.replace(/(^\s*)|(\s*$)/g, "");
    }
 }


  module.exports = validate;
