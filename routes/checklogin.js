/**
 * @name checklogin
 * @description 检查用户是否登录的中间件
 * @author Sky
 */
var conf = require('../conf/conf');

 /*APP 登录中间件验证*/
 
 const checklogin = {
      AuthMiddleware: function AuthMiddleware(req, res, next) {
          var token = req.body.token;
          console.log(`token=${token}`);
          var sql = `select nick_name from t_user where is_del = 0 and token = "${token}"`;
            conf.query(sql,function(err,result){
                if(!result.length||err){
                  res.json({
                    code: -2,
                    msg: "请先登录"
                  });
                  return false;
                }
              next();
          })
      },
      AuthMiddlewareGet: function AuthMiddlewareGet(req, res, next) {
        var token = req.query.token;
        console.log(`token=${token}`);
        var sql = `select nick_name from t_user where is_del = 0 and token = "${token}"`;
          conf.query(sql,function(err,result){
              if(!result.length||err){
                res.json({
                  code: -2,
                  msg: "请先登录"
                });
                return false;
              }
            next();
        })
    },
    // result,传入结果集，isRes 是否返回结果参数  指定提示文字
    result: function(resJson,result,isRes,successMsg,failMsg) {
      var successMsg = successMsg?successMsg: "操作成功";
      var failMsg = failMsg?failMsg: "请稍后再试";
      if(result.length||result.changedRows||result.insertId){
        var res = {code: 200,msg:successMsg};
        if(isRes){
          if(result.insertId){
            res.data = result.insertId;
          }else if(result.changedRows){
            res.data = changedRows;
          }else{
            res.data = result;
          }
        }
        resJson.json(res);
      }else{
        resJson.json({code: -1,msg: failMsg});
      }
    }
}

module.exports = checklogin;