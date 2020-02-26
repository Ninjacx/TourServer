var express = require('express');
var conf = require('../conf/conf');
var url = require('url');
var path=require('path'); 
// const fs = require('fs');//文件
// const multer = require('multer')({ dest: 'www/upload' });
var bodyParser = require('body-parser');//post请求用
var staticPath = require('express-static');//post请求用
var router = express.Router();
var app = express();
// const bodyParser = require('body-parser');
app.use(bodyParser.json());//数据JSON类型
app.use(bodyParser.urlencoded({ extended: false }));//解析post请求数据

var qiniu = require("qiniu");
var formidable = require("formidable");
var fs = require('fs');//文件
const uuidv5 = require('uuid/v5');
const uuidv1 = require('uuid/v1');


const checklogin = require('./checklogin');

const tools = require('../common/tools');
const serverIp = 'http://192.168.1.33/';//'http://192.168.1.33/';


/**---------------------------------1.获取---------------------------------------------*/
// 首页展示的数据 
router.get('/homeData',(req, res, next)=>{
	var {page}=req.query;
	
	var offSets = ((!isNaN(page)&&page>0?page:1)- 1) * 10;
	// var offSets = ((page?page:1)- 1) * 10;
	var contentsql = `select t_plate.plate_name,t_plate_second.plate_name as secondPlate_name,t_content.*,
						${tools.setDateTime('t_content.create_time')}
						,t_user.nick_name,t_user.icon,t_user.userKey from t_content
						left join t_plate_second on t_plate_second.id = t_content.plateSecond_id
						left join t_plate on t_plate.id = t_plate_second.plate_id
						left join t_user on t_content.user_id = t_user.id where t_content.is_del = 0  order by t_content.create_time desc limit 10 offset ${offSets}`;
	// 查询10条数据第N页 这样不需要查询图片表中所有数据 则增加效率
	var contentImg = `select content_id,image_url,is_video from t_content_image LEFT JOIN (SELECT id from t_content where is_del = 0  order by create_time desc LIMIT 10 OFFSET ${offSets}) as t_content 
					  on t_content_image.content_id = t_content.id where t_content_image.is_del=0 `;
	conf.query(contentsql,function(err,result1){
		checklogin.resultFn(res,result1,()=>{
			conf.query(contentImg,(err,result2)=>{
				checklogin.resultFn(res,result2,()=>{
					result1.map((item1)=>{
						item1.imgList = [];
						result2.map((item2)=>{
							// 此处图片首页最多显示9张
							if(item1.id == item2.content_id && item1.imgList.length<9 && item2.is_video !=1){
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


// 获取两个类目菜单的接口数据
router.get('/getPlateAll',(req, res, next)=>{
	  var token = req.query.token;
	  var selectPlate = `select * from t_plate`;
	  var selectPlate2 = `select t_plate_second.*,t_collect.collect_state from t_plate_second 
	  left join t_collect  on t_plate_second.id = t_collect.type_id 
	  and t_collect.user_id = (select id from t_user where token = "${token}" ) and type = 2 
	  order by t_plate_second.id`;
	  console.log(selectPlate2);
	  var oPlate = conf.quertPromise(selectPlate,res);
	  var oPlate2 = conf.quertPromise(selectPlate2,res);
		var promise = Promise.all([oPlate,oPlate2]);//oList:res1,oDetailList:res2
			promise.then(function([resPlate1,resPlate2]) {
			res.json({code: 200,resPlate1,resPlate2});
		}).catch(function(err) {
				res.json({code: -1,msg: "请稍后再试"});
				 //定义错误页面
		});
});


//获取七牛云凭证
router.get('/qnyToken', function(req, res, next) {
	var accessKey = 'E8sxauX_j1uhsQrJOIPI7JXqhLv5ysUxjaQcr7g_';
	var secretKey = 'cRdesdlbE78qTlmwwdE0joQO-MViCgsVeccH2-7D';
	var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);	 
	var options = {
		scope: "tour20200226",
		// callbackUrl: 'http://192.168.1.39/QNYcallback',
		// callbackBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}',
	  };
	  var putPolicy = new qiniu.rs.PutPolicy(options);
	  var uploadToken=putPolicy.uploadToken(mac);
	  res.json({
		code: 200,
		data: uploadToken
	})
});


/**---------------------------------2.操作---------------------------------------------*/
// 上传文件至千牛云 https://segmentfault.com/a/1190000005364299 base64 checklogin.AuthMiddleware, 
router.post('/uploadQNY',function(req, res, next) {
		// console.log(req.body);
		// return false;
		// 思路： 1.插入帖子表，2.插入内容表后把ID 返回原数据集合中的内容，3. 上传图片回调的时候 找出对应内容相等的key 后 取出内容ID 保存进表
		// var uploadToken = req.body.uploadToken;
		var form = new formidable.IncomingForm();
		form.multiples=true;
		form.uploadDir = "./public/upload/content";
	form.parse(req, function(err, params, files) {
		// console.log(params);
		// return false;
		// fileArr
		var {uploadToken,title,TextArr,typeList,ImgTextId,plateSecond_id,token} = params;
		
		var TextArr = JSON.parse(TextArr);
		var ImgTextId = JSON.parse(ImgTextId);
		var typeList = JSON.parse(typeList);
		
		// user_id 发帖用户 ${title}","${plateSecond_id}
		var addContentSql = `insert into t_content(title,plateSecond_id,user_id) select "${title}","${plateSecond_id}",id from t_user where token = "${token}"`;
		console.log(addContentSql);
		// return false;
		 // 1.先插入一条帖子表数据返回帖子ID
		 new Promise((resolve, reject)=>{
			conf.query(addContentSql,function(error,result){
				// 只有执行成功添加返回ID 才继续执行，否则直接返回错误
				checklogin.resultFn(res,result,()=>{
					resolve(result.insertId);
				})
			},res);
		 }).then(async (contentId)=>{
			console.log(`contentId${contentId}`);
			// 插入帖子类型数据 ，微信，手机，价格等
			console.log(`------------`);
			// 类型有数据才加
			if(typeList.length) {
				var TypeListStr = "";
	            for (let index = 0; index < typeList.length; index++) {
	                TypeListStr+=`("${contentId}","${typeList[index].id}","${typeList[index].content}"),`;
	            }
	            TypeListStr = TypeListStr.slice(0,TypeListStr.length-1);
				console.log(TypeListStr);
	            var addTypeList = `insert into t_content_platesecond_type(content_id,plateSecondType_id,type_content)values${TypeListStr}`;//"insert into t_content_platesecond_type(content_id,plateSecondType_id,type_content)values$"+TypeListStr;
	            conf.query(addTypeList,function(error,result){
					checklogin.resultFn(res,result,false);
	            },res);
			}
            
			// 执行插入 内容数据至表并返回内容ID 
			for (let index = 0; index < TextArr.length; index++) {
				TextArr[index].txtImgId =  await InsertId(TextArr[index].content,contentId);
			}
			// 内容对应 数据库内容ID
			var config = new qiniu.conf.Config();
			// 空间对应的机房
			config.zone = qiniu.zone.Zone_z0;
			// 是否使用https域名
			//config.useHttpsDomain = true;
			// 上传是否使用cdn加速
			//config.useCdnDomain = true;
			var formUploader = new qiniu.form_up.FormUploader(config);
			var putExtra = new qiniu.form_up.PutExtra();
			// 循环上传图片  
			// 不为空才走上传！！！！！！！！！！！！！files.file
			var insertStr = '';
			for (let index = 0; index < files.file.length; index++) {
				var imagePath = path.extname(files.file[index].name);	 
				var fileName = uuidv1();
				//  关联图片是属于哪条内容的ID
					for (let j = 0; j < TextArr.length; j++) {
						if(ImgTextId[index] == j){
							console.log(TextArr[j].txtImgId);
							insertStr+=`("http://q6aivyr7l.bkt.clouddn.com/${fileName}${imagePath}","${TextArr[j].txtImgId}","${contentId}"),`;
						}
					}
					// 上传到七牛云
					formUploader.putFile(uploadToken, fileName+imagePath, files.file[index].path, putExtra, function(respErr, respBody, respInfo) {
						if (respErr) {
							throw respErr;
						}
						if (respInfo.statusCode == 200) {
							console.log(2000);
							console.log(respBody);
						} else {
							// 设置日志表
							console.log(respInfo.statusCode);
							console.log(respBody);
						}
					});
				// 放开 end
				}
				// 去除拼接字符串最后一个逗号 执行insert
				insertStr = insertStr.slice(0,insertStr.length-1);
				var insetImg = `insert into t_content_image(image_url,content_text_id,content_id)values${insertStr}`;
				conf.query(insetImg,function(error,result){
					checklogin.result(res,result,false,"发布成功");
				},res);
		 })
		// 内容List
		 const InsertId = (data,contentId) => new Promise((resolve, reject) => {
				var textImageSql = `insert into t_content_text(image_content,content_id)values("${data}","${contentId}")`;
				conf.query(textImageSql,function(error,result){
					resolve(result.insertId);
				},res);
		 });
	});
});

// 上传完成回调
// router.get('/QNYcallback', function(req, res, next) {
// 	res.json({
// 		code: 200,
// 		data: req.query
// 	})
// });

//上传用户头像
router.post('/upload', function(req, res, next) {
	var form = new formidable.IncomingForm();
	// var token = req.body.token;
	// console.log(req.body);
	// console.log(`token=${token}`);
    //设置文件上传存放地址（需要先把这个文件夹，在项目中建好）
	form.uploadDir = "./public/upload";
    //执行里面的回调函数的时候，表单已经全部接收完毕了。
    form.parse(req, function(err, params, files) {
			var {token} = params; // 获取到formdata用户的token
            var oldpath = files.file.path; //myFileName就是我们刚在前台模板里面配置的后台接受的名称；
            var extname = uuidv5(files.file.name, uuidv5.DNS); //因为formidable这个时候存在我们刚路径上的，只是一个path，还没有具体的扩展名，如：2.png这样的
            // //新的路径由组成：原父路径 + 拓展名
            var newpath = "./public/upload/" + extname;
             //改名
            fs.rename(oldpath, newpath, function(err) { //把之前存的图片换成真的图片的完整路径
                if(err) {
                    res.json({code: -1,data: err});
                }else{
					// 1.入库 2.查询用户表最新数据
					 var updateIconSQL = `update t_user set icon = "${serverIp}upload/${extname}" where token = "${token}"`;
					 var userSql = `select t_user.*,t_member.member_name,DATE_FORMAT(t_user.create_time,"%Y-%m-%d")as createTime 
					 from t_user left join t_member on t_user.member_id = t_member.id where t_user.is_del = 0 and is_freeze = 0 and token = "${token}"`
					 conf.query(updateIconSQL,function(error,updateResult){
						checklogin.resultFn(res,updateResult,()=>{
							// console.log(updateResult);
							conf.query(userSql,function(err,result){
								checklogin.result(res,result,true,"上传成功");
							 },res);
						})
					 },res);
                    // res.json({code:200,data: '/upload/'+extname}) //返回图片路径，让前端展示
				}
            });
    });
});

// 用户登录接口 保存进session 前台获取保存 对比
// router.post('/login', function(req, res, next) {
//   var {account,password}=req.body;
//   var psw = uuidv5(password, uuidv5.DNS);
//   var selectSQL = `select * from t_user where account = '${account}' and pwd = '${psw}' limit 1`;
//   // var answer = -1;
//   conf.query(selectSQL,function(err,result){
// 			if(result!=''&&result){
// 				var token = uuidv1(); // 登录成功token
// 				req.session.token = token;
// 				req.session.nickName = result[0].nick_name;
// 				var page = req.session.page; // 记录上次点击的页面登录成功后跳转
// 				// 将token 保存到表中，以便之后验证
// 				var InsertToken = `INSERT INTO t_token_log(uid,token,createtime)VALUES(${result[0].id},"${token}",now())`;
// 				conf.query(InsertToken,function(){});
// 				// console.log(page);
// 				res.json({code: 200,msg: "登录成功",page: page==undefined?'/':page});
// 			}else{
// 				res.json({code:-1,msg: "账号或密码错误"});
// 			}
//     },res);
// });

// 退出
// router.post('/logout', function(req, res, next) {
// 	req.session.token = null;
// 	// location.reload();
// 	res.redirect(req.session.page);
// })


router.get('/', function(req, res, next) {
	var deviceAgent = req.headers["user-agent"].toLowerCase();
    var agentID = deviceAgent.match(/(iphone|ipod|ipad|android)/);
    if(agentID){
        res.sendFile(`${process.cwd()}/public/index.html`, {title:''});
    }else{
		req.session.page = '/';
        res.render('pc/index', { hidden: 1});
    }
});


module.exports = router;
