var express = require('express');
var router = express.Router();
var conf = require('../conf/conf');
const uuidv1 = require('uuid/v1');
const uuidv5 = require('uuid/v5');

/*验证登录*/
const checklogin = require('./checklogin');

const serverIp = 'http://47.98.163.21/';
/**验证用户token是否登录 */
router.get('/isLogin', function(req, res, next) {
  var token = req.query.token;
  console.log(token);
  var sql = `select t_user.*,t_member.member_name,DATE_FORMAT(t_user.create_time,"%Y-%m-%d")as createTime from t_user left join t_member on t_user.member_id = t_member.id where t_user.is_del = 0 and token = "${token}"`;
        conf.query(sql,function(err,result){
        if(result.length) {
          // 重启APP的时候调用此处，返回最新用户信息，redux 重启就没信息了
          res.json({code: 200,data: result[0]});
        }else{
          res.json({code: -2,msg: "请重新登录"});
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
          // 查询短信表 是否对应手机
          sql = `select t_user.phone from t_icode left join t_user on t_icode.phone = t_user.phone where t_icode.phone = "${phone}" and  t_icode.code = "${code}"`;
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
        if(result.length) {
          // 手机短信登录
            if(state == 1) {
              var isCreateSql = '';
              var {phone} = req.body;
              // 判断user表中是否存此用户的手机账号，不存在则注册 ，存在则登录更新
              if(result[0].phone){
                isCreateSql= `update t_user set token = "${uuidv1()}" where phone = "${phone}"`;	//有账号则代表登录，生成新的token
              }else{
                isCreateSql= `insert into t_user(nick_name,signature,token,phone,icon)values("旅行的乌龟","一只喜欢慢悠悠旅行的乌龟","${uuidv1()}","${phone}","${serverIp}static/App/user/userIcon.png")`;
              }
              // console.log(isCreateSql);
              conf.query(isCreateSql,function(err,isCreateSqlRes){
                  if(err){
                    res.json({code: -1,msg: msg});
                  }
                // 如果是插入的数据则再次查询后返回
                   var userSql='';
                   if(isCreateSqlRes.insertId>0){
                      // 新增查询用户数据
                      userSql = `select t_user.*,t_member.member_name,DATE_FORMAT(t_user.create_time,"%Y-%m-%d")as createTime 
                      from t_user left join t_member on t_user.member_id = t_member.id where t_user.is_del = 0 and is_freeze = 0 and t_user.id = "${isCreateSqlRes.insertId}"`;
                    }else{
                      // 更新查询用户数据
                      userSql = `select t_user.*,t_member.member_name,DATE_FORMAT(t_user.create_time,"%Y-%m-%d")as createTime 
                      from t_user left join t_member on t_user.member_id = t_member.id where t_user.is_del = 0 and is_freeze = 0 and phone = "${req.body.phone}"`;
                    }
                   conf.query(userSql,function(err,NewResult){
                    console.log(NewResult);
                    res.json({code: 200,data: NewResult[0],msg: isCreateSqlRes.insertId>0?'注册成功':"登录成功"});
                  });
              })
          }else if(state == 2){
            //
          }else{
            // 其它登录方式
            res.json({code: -1,msg: "请稍后再试"});
          }
        }else{
          res.json({code: -1,msg: msg});
        }
    });
});


/**修改用户个人信息 */
router.post('/changeUserInfo',checklogin.AuthMiddleware, function(req, res, next) {
  var {token,type,value} = req.body;

  // 根据类型区分修改哪个字段
  var typeName = "";
  if(type == 1){ typeName = "nick_name";}
  if(type == 2){ typeName = "sex";}
  if(type == 3){ typeName = "signature";}
  
  var sql = `update t_user set ${typeName} = "${value}" where token = "${token}"`;
  // 更新完毕后 查询最新用户数据
  var sqlUser = `select t_user.*,t_member.member_name,DATE_FORMAT(t_user.create_time,"%Y-%m-%d")as createTime 
  from t_user left join t_member on t_user.member_id = t_member.id where t_user.is_del = 0 and is_freeze = 0 and token = "${token}"`;
        conf.query(sql,function(){
          conf.query(sqlUser,function(err,result){
            res.json({code: 200,data: result[0],msg: "修改成功"});
          });
       });
});

/** 用户粉丝列表 */
router.get('/fans',checklogin.AuthMiddlewareGet, function(req, res, next) {
  var {token,page} = req.query;
  var offSets = ((!isNaN(page)&&page>0?page:1)- 1) * 10;
  var sqlFans = `select t_fans.user_fans,t_focus.id,t_user.nick_name,t_user.signature,t_user.icon,t_focus.focus_state  from t_fans  
            left join t_user on t_fans.user_fans = t_user.id 
            left join t_focus on t_fans.user_fans = t_focus.user_focus
            and t_focus.user_id = (select id from t_user where token = "${token}") 
            where t_fans.user_id = (select id from t_user where token = "${token}") and t_fans.fans_state = 1
            order by t_fans.update_time desc limit 10 offset ${offSets}`;
            conf.query(sqlFans,function(err,result){
               checklogin.result(res,result,true);
            });
});

/** 用户关注列表 */
router.get('/focus',checklogin.AuthMiddlewareGet, function(req, res, next) {
  var {token,page} = req.query;
  var offSets = ((!isNaN(page)&&page>0?page:1)- 1) * 10;
  var sqlFocus = `select t_focus.id,t_user.nick_name,t_user.signature,t_user.icon,t_focus.focus_state  from t_focus left join t_user on t_focus.user_focus = t_user.id 
                    where t_focus.user_id = (select id from t_user where token = "${token}") 
                    and t_focus.focus_state = 1 order by t_focus.update_time desc limit 10 offset ${offSets}`;
            conf.query(sqlFocus,function(err,result){
              checklogin.result(res,result,true);
            });
});

// 更新用户关注的人
router.get('/changeFocusState',checklogin.AuthMiddlewareGet, function(req, res, next) {
        var {token,focusId,userFans,focusState,userId} = req.query;
        // 有关注人的数据则更新否则插入一条数据
        if(focusId){
          var updateFocus = `update t_focus  left join t_user  on t_focus.user_id = t_user.id SET t_focus.focus_state = ${focusState}
                          where  t_focus.id = ${focusId} and t_user.token = "${token}"`;
                          conf.query(updateFocus,function(err,result){
                            checklogin.result(res,result);
                          });
        }else{
              // userFans 关注人的ID
              var insertFocus = `insert into t_focus(user_id,user_focus)values(${userId},${userFans})`;
                          conf.query(insertFocus,function(err,result){
                            // console.log(result.insertId);
                            checklogin.result(res,result,true);
                          });
        }
       
});


/***********************************************TourEnd */

module.exports = router;
