/**
 * @name 
 * @description 工具类
 * @author Sky
 */


const tools = {
   // 深拷贝一下 
   deepJson: function(obj){
      return JSON.parse(JSON.stringify(obj))
   },
   // where条件默认参数
   initWhereParams: function(obj) {
      return Object.assign({is_del: 0},obj)
   },
   // 校验参数接口传入参数
   paramsRule: function(str) {
      return str ? str : ''
   },
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
    },
    setDateTime: function(time){
       return `CASE (DATE_FORMAT(now(),"%y%m%d")-DATE_FORMAT(${time},"%y%m%d"))
       WHEN 0 THEN  CONCAT('今天 ',DATE_FORMAT(${time},'%T')) 
       WHEN 1 then CONCAT('昨天 ',DATE_FORMAT(${time},'%T'))
       WHEN 2 then CONCAT('前天 ',DATE_FORMAT(${time},'%T'))
       ELSE DATE_FORMAT(${time},"20%y-%m-%d") END as dateTime`;
    },

   //  关于时间处理
   // 时间转成时间戳
   setTimeStamp(dateStr){
      var date = dateStr.substring(0,19);    
      date = date.replace(/-/g,'/'); //必须把日期'-'转为'/'
      return new Date(date).getTime()/1000;
   },
   getNowDate(){
      var nowDate = new Date();
      var year = nowDate.getFullYear();
      var month = nowDate.getMonth() + 1 < 10 ? "0" + (nowDate.getMonth() + 1) : nowDate.getMonth() + 1;
      var day = nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate.getDate();
      
      return year + "-" + month + "-" + day;
   }
 }


  module.exports = tools;
