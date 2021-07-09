/**
 * @name checklogin
 * @description 检查用户是否登录的一些中间件 等 
 * @author Sky
 */
// var conf = require('../conf/conf');
var {UserModel} = require('../conf/model/t_user');
// var {successResult, setCatch} = require('../common/publicFn');
const {resultError, paramsRule, paramsInit, setTimeStamp} = require('../common/tools');
/*APP 登录中间件验证*/
const checkLogin = {
  AuthMiddleware: (req, res, next) => {
    var uid = req.get("Authorization")
    UserModel.findOne({
      attributes: { exclude: ['id','open_id','is_valid'] }, // exclude: ['id','uid','is_valid']  include:[['apply_status','member_id']],
      where: {
        id: paramsRule(uid)
      },
    }).then((result)=>{
      if(result) {
          next();
      }else{
        res.json({
          code: -2,
          msg: "请先登录"
        });
      }
    })
  },
  AuthMiddlewareGet: function AuthMiddlewareGet(req, res, next) {
    var uid = req.get("Authorization")
    UserModel.findOne({
      attributes: { exclude: ['id','open_id','is_valid'] }, // exclude: ['id','uid','is_valid']  include:[['apply_status','member_id']],
      where: {
        id: paramsRule(uid)
      },
    }).then((result)=>{
      if(result) {
          next();
      }else{
        res.json({
          code: -2,
          msg: "请先登录"
        });
      }
    })
  }
}

module.exports = checkLogin;