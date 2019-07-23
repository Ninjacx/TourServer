var express = require('express');
var router = express.Router();
var conf = require('../conf/conf');
const uuidv1 = require('uuid/v1');
const uuidv5 = require('uuid/v5');

/**验证用户token是否登录 */
router.get('/isLogin', function(req, res, next) {
  var token = req.query.token;
  console.log(token);
  var sql = `select * from t_user where is_del = 0 and token = "${token}"`;
        conf.query(sql,function(err,result){
        if(result.length) {
          res.json({code: 200,data: result[0]});
        }else{
          res.json({code: -1,msg: "请先登录"});
        }
    });
});

/**用户账号登录*/
router.post('/login', function(req, res, next) {
        // 1.手机登录 2.账号密码登录  3 微信第三方登录
        var sql,msg= "";
        var state = req.body.state;
        if(state==1){
          var {phone,code} = req.body;
          // 此处要修改，不能关联user表，单查短信表，user表如果没有就增加一条代表是注册过来的??
          sql = `select t_user.phone,t_user.nick_name,t_user.token,t_user.icon,t_user.icon,t_user.member_id,t_user.signature,t_user.is_freeze from t_icode left join t_user on t_icode.phone = t_user.phone where t_icode.phone = "${phone}" and  t_icode.code = "${code}"`;
          msg = "验证码错误";
        }else if(state==2){
          var {account,password} = req.body;
          var password = uuidv5(password, uuidv5.DNS);
          msg = "账号或密码错误";
          sql = `select id from t_user where account = "${account}" and password = "${password}"`;
        }else if(state==3){
              var {wechat_id} = req.body;
            // 微信登录 生成一个账号 类似和微信绑定的id
            sql = `select id from t_user where wechat_id = "${wechat_id}"`;
        }else{
          res.json({code: -1,msg: "登录失败，请再次尝试"});
          return false;
        }
        // console.log(sql);
        conf.query(sql,function(err,result){
        //有的话代表有此验证码与手机能对应 登录成功
        if(result.length){
          var isCreateSql = '';
          // console.log(result[0].phone);
          var {phone} = req.body;
          if(result[0].phone){
            isCreateSql= `update t_user set token = "${uuidv1()}" where phone = "${phone}"`;	//有账号则代表登录，生成新的token
          }else{
            isCreateSql= `insert into t_user(nick_name,signature,token,phone)values("旅行的乌龟","一只喜欢慢悠悠旅行的乌龟","${uuidv1()}","${phone}")`;
          }
          // 手机短信登录
            if(state == 1) {
              console.log(isCreateSql);
              conf.query(isCreateSql,function(err,isCreateSqlRes){
                  if(err){
                    res.json({code: -1,msg: msg});
                  }
                // 如果是插入的数据则再次查询后返回
                   var userSql='';
                   if(isCreateSqlRes.insertId>0){
                      // 新增
                      userSql = `select * from t_user where id = ${isCreateSqlRes.insertId}`
                    }else{
                      // 更新
                      userSql = `select * from t_user where phone = "${req.body.phone}"`
                    }
                   conf.query(userSql,function(err,NewResult){
                    console.log(NewResult);
                    res.json({code: 200,data: NewResult[0],msg: isCreateSqlRes.insertId>0?'注册成功':"登录成功"});
                  });
              })
          }else{
            res.json({code: 200,data: result[0],msg: "登录成功"});
          }
        }else{
          res.json({code: -1,msg: msg});
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
