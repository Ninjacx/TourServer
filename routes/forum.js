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

// 类目展示列表数据 
router.get('/forumList',(req, res, next)=> {
	var {page,plateSecond_id}=req.query;
  var offSets = ((!isNaN(page)&&page>0?page:1)- 1) * 10;
  
  var plateSeconde_id = req.query.plateSeconde_id?`and t_content.plateSeconde_id = ${req.query.plateSeconde_id}`:"";
	// var offSets = ((page?page:1)- 1) * 10;
	var contentsql = `select t_content.*,DATE_FORMAT(t_content.create_time,"%Y-%m-%d")as create_time,t_user.nick_name,icon from t_content 
					left join t_user on t_content.user_id = t_user.id where t_content.is_del=0  ${plateSeconde_id} limit 10 offset ${offSets}`;
	// 查询10条数据第N页 这样不需要查询图片表中所有数据 则增加效率
	var contentImg = `SELECT * from t_content_image left join (SELECT id from t_content where is_del=0 ${plateSeconde_id} limit 10 offset ${offSets}) as t_content 
					on t_content_image.content_id = t_content.id where t_content_image.is_del=0`;
	conf.query(contentsql,function(err,result1){
		if(result1.length>0){
			var list = [];
			conf.query(contentImg,function(err,result2){
				// console.log(result2);
				result1.map((item1)=>{
					item1.imgList = [];
					result2.map((item2)=>{
						if(item1.id == item2.content_id){
							item1.imgList.push(item2.image_url);
						}
					})
				})
				// return false;
				res.json({
					code: 200,
					basicData: result1,
				});
			})
		}else{
			res.json({
				code: -1,
				msg: "没有数据了"
			});
		}
	})
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

// 查出APP帖子详情
router.get('/getContentDetetail',(req, res, next)=>{
  // 传入groups = 1 则加条件，不然就查全部
    var id = req.query.id;
    id = id?id:0;
    selectComment = `select count(r.comment_id) as replyCount,a.*,b.comment as reply,t_user.nick_name as commentNickName,u.nick_name as replyNickName from t_content_comment  as a 
    left join t_user on a.user_id = t_user.id
    left join t_content_comment as b on b.id = a.commentId_user 
    left join t_user u on u.id = b.user_id 
    left join t_content_reply  as r  on r.comment_id = a.id and r.is_del=0 where a.content_id= ${id} and a.is_del = 0  GROUP BY a.id`;
    selectForum = `select 
    (select count(content_id) from t_content_comment where content_id = ${id} and is_del = 0 GROUP BY content_id)as AllcommentCount,
    t_content.*,t_user.nick_name,t_user.icon from t_content left join t_user on t_user.id = t_content.user_id where t_content.id = ${id} and t_content.is_del = 0`;
    selectForumImg = `select image_url from t_content_image where content_id = ${id} and is_del = 0`;

    var sqlforum = conf.quertPromise(selectForum);
    var sqlforumImg = conf.quertPromise(selectForumImg);
    var sqlComment = conf.quertPromise(selectComment);

    var promise = Promise.all([sqlComment,sqlforum,sqlforumImg]);

    promise.then(function([resComment,resforum,resforumImg]) {
      res.json({
            code: 200,
            data: {
              detail: resforum,
              forumImg: resforumImg,
              comment: resComment
            }
          });
    }).catch(function(err) {
      //定义错误页面
      console.log(err);
      if(err){
        res.json({
          code: -1,
          data: []
        });
      }
          
    });
});

module.exports = router;
