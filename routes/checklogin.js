/**
 * @name checklogin
 * @description 检查用户是否登录的中间件
 * @author Sky
 */
var conf = require('../conf/conf');

 /*APP 登录中间件验证*/
  module.exports = function AuthMiddleware(req, res, next) {
    var token = req.body.token;
    var sql = `select nick_name from t_user where is_del = 0 and token = "${token}"`;
      conf.query(sql,function(err,result){
          if(!result.length||err){
            res.json({
              code: -1,
              msg: "请先登录"
            });
            return false;
          }
        next();
    })
 }