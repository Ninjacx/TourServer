var express = require('express');
var conf = require('../conf/conf');
var url = require('url');
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

const common = require('./common');
const serverIp = 'http://192.168.1.33/';


/** Tour - API */
// 首页展示的数据 
router.get('/homeData',(req, res, next)=>{
	// 显示发帖时间例子
	/**select CASE (DATE_FORMAT(now(),"%y%m%d")-DATE_FORMAT(t_content.create_time,"%y%m%d"))
WHEN 0 THEN '今天' WHEN 1 then '昨天' WHEN 2 then '前天' ELSE DATE_FORMAT(t_content.create_time,"20%y-%m-%d") END as dataTime from t_content 
 */
	var {page,userId}=req.query;
	// 查看用户详情中帖子传入用户ID 需要用到
	var userId = userId?`and t_content.user_id = ${userId}`: "";
	console.log(userId);
	var offSets = ((!isNaN(page)&&page>0?page:1)- 1) * 10;
	// var offSets = ((page?page:1)- 1) * 10;
	var contentsql = `select t_content.*,DATE_FORMAT(t_content.create_time,"%Y-%m-%d")as create_time,t_user.nick_name,icon from t_content 
					  left join t_user on t_content.user_id = t_user.id where t_content.is_del = 0 ${userId} order by create_time limit 10 offset ${offSets}`;
	console.log(contentsql);		
	// 查询10条数据第N页 这样不需要查询图片表中所有数据 则增加效率
	var contentImg = `SELECT * from t_content_image LEFT JOIN (SELECT id from t_content where is_del = 0 ${userId} order by create_time LIMIT 10 OFFSET ${offSets}) as t_content 
					  on t_content_image.content_id = t_content.id where t_content_image.is_del=0`;
	conf.query(contentsql,function(err,result1){
		if(result1.length>0){
			// var list = [];
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
					data: result1,
				});
			},res)
		}else{
			res.json({
				code: -1,
				msg: "没有数据了"
			});
		}
	},res)
});


// 获取两个类目菜单的接口数据
router.get('/getPlateAll',(req, res, next)=>{
	  var token = req.query.token;
	  var selectPlate = `select * from t_plate`;
	  var selectPlate2 = `select t_plate_second.*,t_collect.collect_state from t_plate_second 
	  left join t_collect  on t_plate_second.id = t_collect.type_id 
	  and t_collect.user_id = (select id from t_user where token = "${token}" ) and type = 1 
	  order by t_plate_second.id`;
	  var oPlate = conf.quertPromise(selectPlate);
	  var oPlate2 = conf.quertPromise(selectPlate2);
		var promise = Promise.all([oPlate,oPlate2]);//oList:res1,oDetailList:res2
			promise.then(function([resPlate1,resPlate2]) {
			res.json({code: 200,resPlate1,resPlate2});
		}).catch(function(err) {
				res.json({code: -1,msg: "您的网络好像有点问题"});
				 //定义错误页面
		});
});


//获取七牛云凭证
router.get('/qnyToken', function(req, res, next) {
	var accessKey = 'E8sxauX_j1uhsQrJOIPI7JXqhLv5ysUxjaQcr7g_';
	var secretKey = 'cRdesdlbE78qTlmwwdE0joQO-MViCgsVeccH2-7D';
	var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);	 
	var options = {
		scope: "tourimg",
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

// 上传文件至千牛云
router.post('/uploadQNY', function(req, res, next) {
	console.log(123);
	
	// var uploadToken = req.body.uploadToken;
	var form = new formidable.IncomingForm();
	form.multiples=true;
	var files=[];
    //文件都将保存在files数组中
    form.on('file', function (filed,file) {
        files.push([filed,file]);
	})
	console.log(files);
	form.parse(req, function(err, params, files) {
		console.log(files);
		// console.log(files);
		// return false;
		// for(var k=0;k<files.length;k++){
		// 	console.log(files[k]);
            // var fileName=files.uuu[k].name;
            // var fileUrl="./public/download/"+fileName.split('.')[0]+new Date().getTime()+'.'+fileName.split('.')[1];
            // var useUrl="../../download/"+fileName.split('.')[0]+new Date().getTime()+'.'+fileName.split('.')[1];
            // fs.renameSync(files.myfile.path,fileUrl);
        // }
		// return false;
		// console.log(files.file.path);
		var {uploadToken} = params;
		var config = new qiniu.conf.Config();
		// 空间对应的机房
		config.zone = qiniu.zone.Zone_z0;
		// 是否使用https域名
		//config.useHttpsDomain = true;
		// 上传是否使用cdn加速
		//config.useCdnDomain = true;
		// var uploadToken = 'E8sxauX_j1uhsQrJOIPI7JXqhLv5ysUxjaQcr7g_:OoUJEk7esHu4CH3igdIRZut34wg=:eyJjYWxsYmFja1VybCI6Imh0dHA6Ly8xOTIuMTY4LjEuMzkvUU5ZY2FsbGJhY2siLCJzY29wZSI6InRvdXJpbWciLCJkZWFkbGluZSI6MTU2ODY5Mjg5OH0=';
		var formUploader = new qiniu.form_up.FormUploader(config);
		var putExtra = new qiniu.form_up.PutExtra();
		// var key='test.txt';
		// files.file.name
		console.log(uploadToken);
		for(var fileObj in files){
			// console.log(files[fileObj].name);
			// files.file.name, uuidv5.DNS),files.file.path
			formUploader.putFile(uploadToken, uuidv5(files[fileObj].name, uuidv5.DNS),files[fileObj].path, putExtra, function(respErr, respBody, respInfo) {
				if (respErr) {
					throw respErr;
				}
				if (respInfo.statusCode == 200) {
					console.log(2000);
					console.log(respBody);
				} else {
					console.log(respInfo.statusCode);
					console.log(respBody);
				}
			});
		}
	 
		
	});
});

// 上传完成回调
router.get('/QNYcallback', function(req, res, next) {
	res.json({
		code: 200,
		data: req.query
	})
});


//通用图片上传
router.post('/upload', function(req, res, next) {
	var form = new formidable.IncomingForm();
	var token = req.body.token;
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
						 if(!error){
							conf.query(userSql,function(err,result){
								if(!err){
									res.json({code:200,data: result[0]});
								}
							 });
						 }else{
							 res.json({code: -1,msg: "请稍后再试"});
						 }
						
					 });
					
                    // res.json({code:200,data: '/upload/'+extname}) //返回图片路径，让前端展示
				}
            });
    });
});

router.get('/register', function(req, res, next) {
	res.render('pc/register',{ hidden: 1});
});
// 用户登录接口 保存进session 前台获取保存 对比
router.post('/login', function(req, res, next) {
  var {account,password}=req.body;
  var psw = uuidv5(password, uuidv5.DNS);
  var selectSQL = `select * from t_user where account = '${account}' and pwd = '${psw}' limit 1`;


  // var answer = -1;
  conf.query(selectSQL,function(err,result){
			if(result!=''&&result){
				var token = uuidv1(); // 登录成功token
				req.session.token = token;
				req.session.nickName = result[0].nick_name;
				var page = req.session.page; // 记录上次点击的页面登录成功后跳转
				// 将token 保存到表中，以便之后验证
				var InsertToken = `INSERT INTO t_token_log(uid,token,createtime)VALUES(${result[0].id},"${token}",now())`;
				conf.query(InsertToken,function(){});
				// console.log(page);
				res.json({code: 200,msg: "登录成功",page: page==undefined?'/':page});
			}else{
				res.json({code:-1,msg: "账号或密码错误"});
			}
    });
});

// 退出
router.post('/logout', function(req, res, next) {
	req.session.token = null;

	// location.reload();
	res.redirect(req.session.page);
})
//获取订单信息
router.get('/GetOrder',(req, res, next)=>{

	var {id} = req.query;
	// 提交订单
	var Order = `select t_goods.title,t_size_accessories.size_name,t_goodssize_price.url,t_order.amount,t_order.createtime,t_goodssize_price.price,t_order_details.count from t_order
						left join t_order_details on t_order.id = t_order_details.order_id
						left join t_goodssize_price on t_goodssize_price.id = t_order_details.SizePrice_id
						left join t_goods on t_goods.id = t_goodssize_price.goods_id
						left join t_size_accessories on t_size_accessories.id = t_goodssize_price.size_id
						where t_order.id in(${id})`;
		 conf.query(Order,function(err,result){
			if(result!=''&&result){
				 res.json(result);
			}
		});

});
//获取订单列表
router.get('/GetOrderList',(req, res, next)=>{
	var  {uid,status} = req.query;
	if(uid!=undefined&&status!=undefined){
		var orderList = `SELECT * from t_order WHERE uid = ${uid}  and status = ${status}`;

	// 提交订单
	var orderDetailList = `select t_goods.title,t_size_accessories.size_name,t_goodssize_price.url,t_order.amount,t_order.createtime,t_goodssize_price.price,t_order_details.count,t_order_details.order_id from t_order
						left join t_order_details on t_order.id = t_order_details.order_id
						left join t_goodssize_price on t_goodssize_price.id = t_order_details.SizePrice_id
						left join t_goods on t_goods.id = t_goodssize_price.goods_id
						left join t_size_accessories on t_size_accessories.id = t_goodssize_price.size_id
						where t_order.uid = ${uid} and status = ${status} order by t_order.createtime desc`;

			   let oList = conf.quertPromise(orderList);
			   let oDetailList = conf.quertPromise(orderDetailList);

				var promise = Promise.all([oList,oDetailList]);//oList:res1,oDetailList:res2
					promise.then(function([resOrder,resDetailOrder]) {
						res.json({oList:resOrder,oDetailList:resDetailOrder});
				}).catch(function(err) {
					res.json(err);
				  // ...
				  //定义错误页面
				});
	}else{
		res.json(-1);
	}


		/*conf.query(InsertOrder,function(err,result){
			if(result!=''&&result){
					res.json(result)
			}
      });*/
});

//提交订单
router.get('/SetOrder',(req, res, next)=>{
	var orderList = '';
	if(req.query.orderList!=undefined&&req.query.orderList!=''){
		 orderList = JSON.parse(req.query.orderList);
	}
	var {uid,count,id,amount} = req.query; //count,id,
	// 是否添加过此商品到购物车 if(result!=''&&result){
	//var isHave_Size=`select *from t_shop_car where uid = ${uid} and SizePrice_id = ${id} limit 1`;
	// 提交订单
	var InsertOrder = `INSERT INTO t_order(uid,amount,createtime)VALUES(${uid},${amount},now())`;
		conf.query(InsertOrder,function(err,result){
		 if(result!=''&&result){
		   // 提交为购物车
		   if(orderList.length){
			orderList.forEach(function(item){
			 let removeCarList = `UPDATE t_shop_car SET status = 1 WHERE id = ${item.car_id}`;	//清除购物车
			 let InsertOrderList = `INSERT INTO t_order_details(SizePrice_id,order_id,count)VALUES(${item.id},${result.insertId},${item.count})`;
			 let remove_CarList = conf.quertPromise(removeCarList);
			 let Insert_OrderList = conf.quertPromise(InsertOrderList);

				//var promise =
				Promise.all([remove_CarList,Insert_OrderList]);
				/*conf.query(InsertOrderList,function(err,resDs){
					if(err){
						res.json(err)
					}
				})*/
			})
				res.json(result);
			}else{
				// 单个产品
				var InsertOrderDs = `INSERT INTO t_order_details(SizePrice_id,order_id,count)VALUES(${id},${result.insertId},${count})`;
				conf.query(InsertOrderDs,function(err,resDs){
					res.json(result);
				})
			}

		 }
      });
});

router.get('/pay', function(req, res, next) {
    var url=  ali.webPay({
        body: "ttt",
        subject: "ttt1",
        outTradeId: "201503200101010222",
        timeout: '90m',
        amount: "0.1",
        sellerId: '',
        product_code: 'FAST_INSTANT_TRADE_PAY',
        goods_type: "1",
        return_url:"127.0.0.1:300",
    })

    var url_API = 'https://openapi.alipay.com/gateway.do?'+url;
    res.json({url:url_API})
});

 

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
