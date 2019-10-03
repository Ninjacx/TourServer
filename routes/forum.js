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
const checklogin = require('./checklogin');

const tools = require('../common/tools');

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

// 点赞功能 checklogin.AuthMiddlewareGet  要传入token
router.get('/support',(req, res, next)=>{
  // 传入groups = 1 则加条件，不然就查全部
    var {userId,isSupport,contentId} = req.query;
    // 验证是否有此条点赞
    var selectSQL = `select id from t_support where user_id = ${userId} and is_del = 0 and content_id=${contentId}`;
    var insertSupport = `insert into t_support(user_id,is_support,content_id)values("${userId}","${isSupport}","${contentId}")`;
    var updateSupport = `update t_support set is_support = ${isSupport} where user_id = ${userId} and content_id = "${contentId}"`;
      conf.query(selectSQL,function(err,result){
        if(result.length){
           // 已有则更新点赞状态
           conf.query(updateSupport,function(err,result){
            res.json({code: 200})
          })
        }else{
          // 没有记录则新增一条点赞记录
          conf.query(insertSupport,function(err,result){
            res.json({code: 200})
          })
        }
      });
});

// 帖子列表数据（和首页列表差不多） 
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
    checklogin.resultFn(res,result1,()=>{
			conf.query(contentImg,function(err,result2){
				checklogin.resultFn(res,result2,()=>{
            result1.map((item1)=>{
              item1.imgList = [];
              result2.map((item2)=>{
                if(item1.id == item2.content_id){
                  item1.imgList.push(item2.image_url);
                }
              })
            })
            res.json({
              code: 200,
              basicData: result1,
            });
        })
			})
    })
		
	 
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

// 搜索 用户、帖子
router.get('/search',(req, res, next)=>{
  var searchVal = req.query.searchVal?tools.trim(req.query.searchVal):null;
  var {page} = req.query;
  var offSets = ((!isNaN(page)&&page>0?page:1)- 1) * 10;
  var searchContentSQL = `
          select ${tools.setDateTime('t_content.create_time')} ,
            t_plate_second.plate_name,t_user.nick_name,t_content.title
            from t_content 
            left join t_user on t_content.user_id = t_user.id 
            left join t_plate_second on t_content.plateSeconde_id= t_plate_second.id 
            where title like  "%${searchVal}%" limit 5`;

    var searchUserSQL = `select id,nick_name,icon from t_user where nick_name like  "%${searchVal}%" limit 10`;
    var sqlContent = conf.quertPromise(searchContentSQL);
    var sqlUser = conf.quertPromise(searchUserSQL);
    var promise = Promise.all([sqlContent,sqlUser]);
          promise.then(function([resContent,resUser]) {
            if(!resContent.length&&!resUser.length) {
              res.json({
                code: -1,
                msg: "没有数据"
              })
            }else{
              res.json({
                code: 200,
                data: {
                  resContent: resContent,
                  resUser: resUser
                }
              });
            }
          }).catch(function(err) {
            //定义错误页面
            if(err){
              res.json({
                code: -1,
                data: []
              });
            }
          });
});

// 查出APP帖子详情
router.get('/getContentDetetail',(req, res, next)=>{
  // 传入groups = 1 则加条件，不然就查全部
    var {id,token} = req.query;
    id = id?id:null;
    token = token?token:null;
    // 评论
    // var selectComment = `select count(r.comment_id) as replyCount,a.*,b.comment as reply,t_user.icon,t_user.nick_name as commentNickName,u.nick_name as replyNickName from t_content_comment  as a 
    // left join t_user on a.user_id = t_user.id
    // left join t_content_comment as b on b.id = a.commentId_user 
    // left join t_user u on u.id = b.user_id 
    // left join t_content_reply  as r  on r.comment_id = a.id and r.is_del=0 where a.content_id= ${id} and a.is_del = 0  GROUP BY a.id`;
    // 帖子信息详情
    var selectForum = `select 
    (select count(content_id) from t_content_comment where content_id = ${id} and is_del = 0 GROUP BY content_id)as AllcommentCount,
        ${tools.setDateTime('t_content.create_time')}
        ,t_content.*,t_user.nick_name,t_user.icon ,t_plate_second.plate_name
      from t_content 
        left join t_plate_second on t_content.plateSeconde_id = t_plate_second.id
        left join t_user on t_user.id = t_content.user_id where t_content.id = ${id} and t_content.is_del = 0`;

    // 图片内容
    var selectText = `select id,image_content from t_content_text where  content_id = ${id} and is_del = 0 `;
    // 图片集合    
    var selectForumImg = `select image_url,content_text_id from t_content_image where content_id = ${id} and is_del = 0`;

    var selectSupport = `select t_user.nick_name from t_support left join t_content on t_support.content_id = t_content.id and t_support.is_del = 0 left join t_user on t_support.user_id = t_user.id where t_support.content_id = ${id} and t_support.is_support = 1 order by update_time desc`;
    var selectuserIsSupport = `select t_support.is_support from t_support left join t_user on t_support.user_id = t_user.id 
        where t_support.content_id = ${id} and t_user.token  = "${token}"`;
    // 查询此用户是否关注了此帖和此用户
    var selectIsFocus = `select t_content.user_id,t_focus.id,t_focus.focus_state,t_collect.collect_state from t_content 
     left join t_focus on t_content.user_id = t_focus.user_focus and t_focus.user_id = (select id from t_user where token = "${token}")
     left join t_collect on t_content.id = t_collect.type_id  and type_id = ${id} and t_collect.user_id = (select id from t_user where token = "${token}")
     where t_content.id = ${id} `;

    // 点赞用户显示
    var sqlforum = conf.quertPromise(selectForum);
    
    var sqlText = conf.quertPromise(selectText);
    var sqlforumImg = conf.quertPromise(selectForumImg);
    // var sqlComment = conf.quertPromise(selectComment);
    var sqlSupport = conf.quertPromise(selectSupport);
    var sqlUserIsSupport = conf.quertPromise(selectuserIsSupport);
    var sqlUserIsFocus = conf.quertPromise(selectIsFocus);

    var promise = Promise.all([sqlforum,sqlText,sqlforumImg,sqlSupport,sqlUserIsSupport,sqlUserIsFocus]);//sqlComment

    promise.then(function([resforum,resText,resforumImg,resSupport,resUserIsSupport,resUserIsFocus]) { //resComment

      // console.log(resText);

     // 内容中放入关联的图片
     resText.map((item,i)=>{
        resText[i].imageList = [];
          resforumImg.map((item2)=>{
            if(item.id == item2.content_text_id){
              resText[i].imageList.push(item2.image_url);
            }
          })
      });
      res.json({
            code: 200,
            data: {
              detail: resforum,
              // forumImg: resforumImg,
              resText: resText,
              support: resSupport,
              UserIsSupport: resUserIsSupport,
              UserIsFocus: resUserIsFocus
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

// 查出帖子详情的评论（上拉加载）
router.get('/getComment',(req, res, next)=>{
  // 传入groups = 1 则加条件，不然就查全部
    var {id,page,userId} = req.query;
    var whereStr = id?`a.content_id= ${id}`:`a.user_id=${userId}`;

    var offSets = ((!isNaN(page)&&page>0?page:1)- 1) * 10;
    id = id?id:0;
    sqlComment = `select count(r.comment_id) as replyCount,a.*,b.comment as reply,t_user.nick_name as commentNickName,u.nick_name as replyNickName,t_user.icon, 
      ${tools.setDateTime('a.create_time')}
      from t_content_comment  as a 
      left join t_user on a.user_id = t_user.id
      left join t_content_comment as b on b.id = a.commentId_user 
      left join t_user u on u.id = b.user_id 
      left join t_content_reply  as r  on r.comment_id = a.id and r.is_del=0 where ${whereStr} and a.is_del = 0  group by a.id order by a.create_time desc limit 10 offset ${offSets}`;
    // GROUP BY a.id order by a.create_time desc limit 10
    // console.log(sqlComment);
    // return flase;
    conf.query(sqlComment,(err,result)=>{
      checklogin.result(res,result,true);
    },res);
});

// 发表评论+回复通用 回复多commentId_user  checklogin.AuthMiddleware 要传入token
router.post('/addComment',(req, res, next)=>{
    var {userId,contentId,comment,commentIdUser} = req.body;
    commentIdUser?commentIdUser:null
    var sqlComment = `insert into t_content_comment(content_id,comment,user_id,commentId_user)values("${contentId}","${comment}","${userId}","${commentIdUser}")`;
    conf.query(sqlComment,function(err,result){
        if(commentIdUser){
          var sqlreply = `insert into t_content_reply(user_id,comment_id,reply)values("${userId}","${commentIdUser}","${comment}")`;
          // 插入reply表 
          conf.query(sqlreply,function(err,replyResult){
            checklogin.result(res,replyResult,false,"回复成功");
          })
        }else{
            checklogin.result(res,result,false,"评论成功");
        }
      });
});


// 用户发布的帖子（上拉加载）  要测试
router.get('/userContent',(req, res, next)=>{
  var {page,userKey}=req.query;
	// 1. token 查登录的自己的用户 2. userKey 查其它用户 
	var userParams = `and t_content.user_id = (select id from t_user where userKey = "${userKey}" )`;
	console.log(userParams);
	var offSets = ((!isNaN(page)&&page>0?page:1)- 1) * 10;
	// var offSets = ((page?page:1)- 1) * 10;
  var contentsql = `select t_plate.plate_name,t_plate_second.plate_name as secondPlate_name,t_content.*,
            ${tools.setDateTime('t_content.create_time')}
            ,t_user.nick_name,t_user.icon from t_content 
						left join t_plate_second on t_plate_second.id = t_content.plateSeconde_id
						left join t_plate on t_plate.id = t_plate_second.plate_id
						left join t_user on t_content.user_id = t_user.id where t_content.is_del = 0 ${userParams} order by t_content.create_time limit 10 offset ${offSets}`;
	// 查询10条数据第N页 这样不需要查询图片表中所有数据 则增加效率
	var contentImg = `select content_id,image_url from t_content_image LEFT JOIN (SELECT id from t_content where is_del = 0 ${userParams} order by create_time LIMIT 10 OFFSET ${offSets}) as t_content 
					  on t_content_image.content_id = t_content.id where t_content_image.is_del=0 `;
	conf.query(contentsql,function(err,result1){
		checklogin.resultFn(res,result1,()=>{
			conf.query(contentImg,(err,result2)=>{
				checklogin.resultFn(res,result2,()=>{
					result1.map((item1)=>{
						item1.imgList = [];
						result2.map((item2)=>{
							// 此处图片首页最多显示9张
							if(item1.id == item2.content_id&&item1.imgList.length<9){
								item1.imgList.push(item2.image_url);
							}
						})
					})
					res.json({
						code: 200,
						data: result1,
					});
				});
			},res)
		})
	},res)
});

// 

module.exports = router;
