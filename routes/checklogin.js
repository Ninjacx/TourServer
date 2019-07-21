/**
 * @name checklogin
 * @description 检查用户是否登录的中间件
 * @author Sky
 */
var conf = require('../conf/conf');

 /*验证*/
  module.exports = function AuthMiddleware(req, res, next) {
    var token = req.query.token;
    var sql = `select * from t_user where is_del = 0 and token = ${token}`;
    
    conf.query(sql,function(err,result){
        console.log(result);
        return false;
    })
    //  var token = req.session.token;
    //    if (!token) {
    //      req.session.page = req.url;
    //      return res.redirect('/login');
    //    }else{
    //  		return next();
    //  	}
 }
 
