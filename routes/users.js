var express = require('express');
var router = express.Router();
var conf = require('../conf/conf');
const uuidv5 = require('uuid/v5');

/**验证用户token是否登录 */
router.get('/isLogin', function(req, res, next) {
  var token = req.query.token;
  var sql = `select * from t_user where is_del = 0 and token = "${token}"`;
        conf.query(sql,function(err,result){
        if(result.length){
          res.json(result[0]);
        }else{
          res.json({code:-1,msg:"请先登录"});
        }
        return false;
        if(result!=''&&result){
          res.json(result);
        }
    });
});

/**用户账号登录*/
router.get('/login', function(req, res, next) {
        // 1.手机登录 2.账号密码登录  3 微信第三方登录 
        var sql,msg= "";
        var state = req.query.state;
        if(state==1){
          var {phone,code} = req.query;
          sql = `select t_user.nick_name,t_user.icon,t_user.icon,t_user.member_id,t_user.signature,t_user.is_freeze from t_icode left join t_user on t_icode.phone = t_user.phone where t_icode.phone = "${phone}" and  t_icode.code = "${code}"`;
          msg = "验证码错误";
        }else if(state==2){
          var {account,password} = req.query;
          var password = uuidv5(password, uuidv5.DNS);
          msg = "账号或密码错误";
          sql = `select id from t_user where account = "${account}" and password = "${password}"`;
        }else if(state==3){
            // 微信登录
        }else{
          return false;
        }
        console.log(sql);
        conf.query(sql,function(err,result){
        if(result.length){
          res.json({code:200,data:result[0]});
        }else{
          res.json({code:-1,msg: msg});
        }
    });
});


/* 获取用户收货地址 */
router.get('/GetConsignee', function(req, res, next) {
  var uid = req.query.uid;
  var Addr = `select  t_shipping_addr.* from t_user left join t_shipping_addr on t_user.addr_id = t_shipping_addr.id where t_user.id = ${uid} and t_shipping_addr.is_del = 0 limit 1`;
  conf.query(Addr,function(err,result){
	  console.log(result);
		if(result!=''&&result){
			res.json(result);
		}
    });
});

/* 获取用户地址列表 */
router.get('/GetAddressList', function(req, res, next) {
  var uid = req.query.uid;
  var selectSQL = `SELECT * from t_shipping_addr where uid = ${uid} and is_del = 0`;
  conf.query(selectSQL,function(err,result){
	  console.log(result);
		if(result!=''&&result){
			res.json({result:result});
		}
	
    });
});

/* GET users listing. */
router.get('/a', function(req, res, next) {
  res.send('respond with a resourceaa');
});

/* GET users listing. */
router.get('/b', function(req, res, next) {
  res.send('respond with a resourceaa');
});

module.exports = router;
