var express = require('express');
var conf = require('../conf/conf');
var url = require('url');
// const fs = require('fs');//文件
// const multer = require('multer')({ dest: 'www/upload' });
var bodyParser = require('body-parser');//post请求用
var staticPath = require('express-static');//post请求用
var router = express.Router();
var app = express();
var formidable = require("formidable");
var fs = require('fs');//文件
const uuidv5 = require('uuid/v5');
const uuidv1 = require('uuid/v1');

/*验证登录*/
const AuthMiddleware = require('./checklogin');

const common = require('./common');

/** Tour - API */
// 查出菜单 
router.get('/getMenu',(req, res, next)=>{
  // 传入groups = 1 则加条件，不然就查全部
    var groups = req.query.groups?`and groups = ${req.query.groups}`:"";
    var selectSQL = `select name,icon,groups from t_menu where is_del = 0 ${groups}`;
      conf.query(selectSQL,function(err,result){
        var result=JSON.stringify(result);
        res.json(result);
      });
});

// 查出APP 展示的商家广告位 与 APP 其它展示图
router.get('/getBanner',(req, res, next)=>{
  // 传入groups = 1 则加条件，不然就查全部
    var type = req.query.type?`and type = ${req.query.type}`:"";
    var selectSQL = `select image,type from t_banner where is_del = 0 ${type}`;
      conf.query(selectSQL,function(err,result){
        var result=JSON.stringify(result);
        res.json(result);
      });
});

// 查出APP 展示的商家广告位 与 APP 其它展示图
router.get('/getBanner',(req, res, next)=>{
  // 传入groups = 1 则加条件，不然就查全部
    var type = req.query.type?`and type = ${req.query.type}`:"";
    var selectSQL = `select image,type from t_banner where is_del = 0 ${type}`;
      conf.query(selectSQL,function(err,result){
        var result=JSON.stringify(result);
        res.json(result);
      });
}); 

// 查出APP帖子中一级的评论和回复与数量 
router.get('/getComment',(req, res, next)=>{
  // 传入groups = 1 则加条件，不然就查全部
    var id = req.query.id;
    id = id?id:0;
    var selectSQL = `select count(r.comment_id) as replyCount,a.*,b.comment as reply,t_user.nick_name as commentNickName,u.nick_name as replyNickName from t_content_comment  as a 
    left join t_user on a.user_id = t_user.id
    left join t_content_comment as b on b.id = a.commentId_user 
    left join t_user u on u.id = b.user_id 
    left join t_content_reply  as r  on r.comment_id = a.id and r.is_del=0 where a.content_id= ${id} and a.is_del = 0  GROUP BY a.id`;
      conf.query(selectSQL,function(err,result){
        // var result=JSON.stringify(result);
        res.json({
          code: 200,
          data: result
        });
      });
});

module.exports = router;
