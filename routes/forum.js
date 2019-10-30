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


/**---------------------------------1.获取---------------------------------------------*/

// 帖子列表数据（和首页列表差不多） 
router.get('/forumList',(req, res, next)=> {
	var {page,plateSecond_id}=req.query;
  var offSets = ((!isNaN(page)&&page>0?page:1)- 1) * 10;
  var plateSecond_id = plateSecond_id?`and t_content.plateSecond_id = ${plateSecond_id}`:"";
	// var offSets = ((page?page:1)- 1) * 10;
	var contentsql = `select t_plate.plate_name,t_plate_second.plate_name as secondPlate_name, t_content.*,${tools.setDateTime('t_content.create_time')} ,t_user.nick_name,t_user.userKey,t_user.icon from t_content 
        left join t_plate_second on t_plate_second.id = t_content.plateSecond_id
        left join t_plate on t_plate.id = t_plate_second.plate_id
        left join t_user on t_content.user_id = t_user.id where t_content.is_del=0  ${plateSecond_id} order by t_content.create_time desc limit 10 offset ${offSets}`;
	// 查询10条数据第N页 这样不需要查询图片表中所有数据 则增加效率
	var contentImg = `SELECT * from t_content_image left join (SELECT id from t_content where is_del=0 ${plateSecond_id} order by t_content.create_time desc limit 10 offset ${offSets}) as t_content 
					on t_content_image.content_id = t_content.id where t_content_image.is_del=0`;
	conf.query(contentsql,function(err,result1){
    checklogin.resultFn(res,result1,()=>{
			conf.query(contentImg,function(err,result2){
				checklogin.resultFn(res,result2,()=>{
            result1.map((item1)=>{
              item1.imgList = [];
              result2.map((item2)=>{
                if(item1.id == item2.content_id && item1.imgList.length<9){
                  item1.imgList.push(item2.image_url);
                }
              })
            })
            res.json({
              code: 200,
              data: result1,
            });
        })
			},res)
    })
	},res)
});

// 查出APP 展示的商家广告位 与 APP 其它展示图
router.get('/getBanner',(req, res, next)=>{
  // 传入groups = 1 则加条件，不然就查全部
    var type = req.query.type?`and type = ${req.query.type}`:"";
    var selectSQL = `select image,type from t_banner where is_del = 0 ${type}`;
      conf.query(selectSQL,function(err,result){
        var result=JSON.stringify(result);
        res.json(result);
      },res);
});

// 搜索 用户、帖子
router.get('/search',(req, res, next)=>{
  var {searchVal} = req.query;
       searchVal = searchVal?tools.trim(searchVal):null;
  
  // var offSets = ((!isNaN(page)&&page>0?page:1)- 1) * 10;
  var searchContentSQL = `
          select ${tools.setDateTime('t_content.create_time')} ,
            t_plate_second.plate_name,t_user.nick_name,t_content.title,t_content.id as contentId
            from t_content 
            left join t_user on t_content.user_id = t_user.id 
            left join t_plate_second on t_content.plateSecond_id= t_plate_second.id 
            where title like  "%${searchVal}%" limit 6`;

    var searchUserSQL = `select userKey,nick_name,icon from t_user where nick_name like  "%${searchVal}%" limit 11`;
    var sqlContent = conf.quertPromise(searchContentSQL,res);
    var sqlUser = conf.quertPromise(searchUserSQL,res);
    var promise = Promise.all([sqlContent,sqlUser]);
          promise.then(function([resContent,resUser]) {
            if(!resContent.length&&!resUser.length) {
              res.json({
                code: -1,
                msg: "没有数据",
                data: []
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
router.get('/getContentDetail',(req, res, next)=>{
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
        ,t_content.*,t_user.userKey,t_user.nick_name,t_user.icon ,t_plate_second.plate_name
      from t_content 
        left join t_plate_second on t_content.plateSecond_id = t_plate_second.id
        left join t_user on t_user.id = t_content.user_id where t_content.id = ${id} and t_content.is_del = 0`;

    // 帖子 一些菜单信息等 价格、联系微信、联系电话等
    var selectType = `select t_platesecond_type.title,t_content_type.content from  t_content_type
        left join t_platesecond_type on t_content_type.platesecond_type_id = t_platesecond_type.id
        where t_content_type.content_id =  313`;//${id}
    
    // 图片内容
    var selectText = `select id,image_content from t_content_text where  content_id = ${id} and is_del = 0 `;
    // 图片集合    
    var selectForumImg = `select image_url,content_text_id from t_content_image where content_id = ${id} and is_del = 0`;
    // 点赞用户列表
    var selectSupport = `select t_user.nick_name from t_support left join t_content on t_support.content_id = t_content.id and t_support.is_del = 0 
    left join t_user on t_support.user_id = t_user.id where t_support.content_id = ${id} and t_support.is_support = 1 order by t_support.update_time desc`;
    // 当前登录用户是否点赞过
    var selectuserIsSupport = `select t_support.is_support from t_support left join t_user on t_support.user_id = t_user.id 
        where t_support.content_id = ${id} and t_user.token  = "${token}"`;
    // 查询此用户是否关注了此帖和此用户
    var selectIsFocus = `select t_content.user_id,t_focus.id,t_focus.focus_state,t_collect.collect_state from t_content 
     left join t_focus on t_content.user_id = t_focus.user_focus and t_focus.user_id = (select id from t_user where token = "${token}")
     left join t_collect on t_content.id = t_collect.type_id  and type_id = ${id} and t_collect.user_id = (select id from t_user where token = "${token}")
     where t_content.id = ${id} `;

    // 点赞用户显示
    var sqlforum = conf.quertPromise(selectForum,res);
    
    var sqlText = conf.quertPromise(selectText,res);
    var sqlforumImg = conf.quertPromise(selectForumImg,res);
    // var sqlComment = conf.quertPromise(selectComment);
    var sqlSupport = conf.quertPromise(selectSupport,res);
    var sqlUserIsSupport = conf.quertPromise(selectuserIsSupport,res);
    var sqlUserIsFocus = conf.quertPromise(selectIsFocus,res);
    
    var sqlType = conf.quertPromise(selectType,res);
    var promise = Promise.all([sqlforum,sqlText,sqlforumImg,sqlSupport,sqlUserIsSupport,sqlUserIsFocus,sqlType]);//sqlComment

    promise.then(function([resforum,resText,resforumImg,resSupport,resUserIsSupport,resUserIsFocus,resType]) { //resComment

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
              typeList: resType,
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
    var {id,page,state,userKey} = req.query;
    var whereStr = "";
    // 1. 帖子下的评论 2. 用户下的评论
    if(state == 1){
      id = id?id:0;
      whereStr = `a.content_id = "${id}"`;
    }else{
      whereStr = `a.user_id = (select id from t_user where userKey = "${userKey}")`;
    }
    // console.log(whereStr);
    
    var offSets = ((!isNaN(page)&&page>0?page:1)- 1) * 10;
    //t_user.userKey, 
    sqlComment = `select t_content.title,count(r.comment_id) as replyCount,a.id as comment_id,a.comment,b.comment as reply,t_user.nick_name as commentNickName,u.nick_name as replyNickName,t_user.icon,t_user.userKey,
      ${tools.setDateTime('a.create_time')}
      from t_content_comment  as a 
      left join t_content on t_content.id = a.content_id
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
						left join t_plate_second on t_plate_second.id = t_content.plateSecond_id
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


/**---------------------------------2.操作---------------------------------------------*/

// 点赞功能 checklogin.AuthMiddlewareGet  要传入token
router.post('/support',checklogin.AuthMiddleware,(req, res, next)=>{
  // 传入groups = 1 则加条件，不然就查全部
    var {token,isSupport,contentId} = req.body;
    // 验证是否有此条点赞
    var selectSQL = `select id from t_support where user_id = (select id from t_user where token = "${token}") and is_del = 0 and content_id="${contentId}"`;
    var insertSupport = `insert into t_support(user_id,is_support,content_id) select id,"${isSupport}","${contentId}"from t_user where token = "${token}"`;
    var updateSupport = `update t_support set is_support = "${isSupport}" where user_id = (select id from t_user where token = "${token}") and content_id = "${contentId}"`;
      conf.query(selectSQL,function(err,result){
        if(result.length){
           // 已有则更新点赞状态
           conf.query(updateSupport,function(err,result){
             checklogin.result(res,result);
          },res)
        }else{
          // 没有记录则新增一条点赞记录
          conf.query(insertSupport,function(err,result){
            checklogin.result(res,result);
          },res)
        }
      },res);
});
// 收藏功能 type=1 帖子, type=2 板块
router.post('/collect',checklogin.AuthMiddleware,(req, res, next)=>{
  // 传入groups = 1 则加条件，不然就查全部
    var {token,type_id,type,collect_state} = req.body;
    // console.log({token,type_id,type,collect_state});
    // 验证是否有此条点赞
    var selectSQL = `select id from t_collect where user_id = (select id from t_user where token = "${token}") and type = ${type} and type_id="${type_id}"`;
    var insertCollect = `insert into t_collect(user_id,collect_state,type_id,type) select id,"${collect_state}","${type_id}","${type}" from t_user where token = "${token}"`;
    var updateCollect = `update t_collect set collect_state = "${collect_state}" where user_id = (select id from t_user where token = "${token}") and type="${type}" and type_id = "${type_id}"`;
      conf.query(selectSQL,function(err,result){
        if(result.length){
           // 已有则更新点赞状态
           conf.query(updateCollect,function(err,result){
             checklogin.result(res,result);
          },res)
        }else{
          // 没有记录则新增一条点赞记录
          conf.query(insertCollect,function(err,result){
            checklogin.result(res,result);
          },res)
        }
      },res);
});

// 发表评论+回复通用 回复多commentId_user  checklogin.AuthMiddleware 要传入token
router.post('/addComment',checklogin.AuthMiddleware,(req, res, next)=>{
    var {token,contentId,comment,commentIdUser} = req.body;
    commentIdUser?commentIdUser:null;
    var sqlComment = `insert into t_content_comment(content_id,comment,user_id,commentId_user) 
                      select "${contentId}","${comment}",id,"${commentIdUser}" from t_user where token = "${token}"`;
    conf.query(sqlComment,function(err,result){
        checklogin.resultFn(res,result,()=>{
          if(commentIdUser){// values("${token}","${commentIdUser}","${comment}");
            var sqlreply = `insert into t_content_reply(user_id,comment_id,reply) 
                            select id,"${result.insertId}","${comment}" from t_user where token = "${token}"`;
            // 插入reply表 
            conf.query(sqlreply,function(err,replyResult){
              checklogin.result(res,replyResult,false,"回复成功");
            },res)
          }else{
              checklogin.result(res,result,false,"评论成功");
          }
        });
     },res);
});



// 

module.exports = router;
