/**
 * @name 
 * @description 工具类
 * @author Sky
 */


const tools = {
   // 校验参数接口传入参数
   paramsRule: function(str,message,res) {
      return str ? str : ''
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
    },
    setDateTime: function(time){
       return `CASE (DATE_FORMAT(now(),"%y%m%d")-DATE_FORMAT(${time},"%y%m%d"))
       WHEN 0 THEN  CONCAT('今天 ',DATE_FORMAT(${time},'%T')) 
       WHEN 1 then CONCAT('昨天 ',DATE_FORMAT(${time},'%T'))
       WHEN 2 then CONCAT('前天 ',DATE_FORMAT(${time},'%T'))
       ELSE DATE_FORMAT(${time},"20%y-%m-%d") END as dateTime`;
    }
 }


  module.exports = tools;
