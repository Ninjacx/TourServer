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

// 临时接口
// 获取两个类目菜单的接口数据
router.get('/getUserList',(req, res, next)=>{
	var token = req.query.token;
	var selectList = `select id,card,userName,build,area,price,is_car from t_rc`;

	 conf.query(selectList,function(error,result){
					checklogin.resultFn(res,result,()=>{
						res.json({
							code: 200,
							data: result,
						});
					 },res);
	 })
});

router.get('/updataInfo',(req, res, next)=>{
	var {id,build,area,price,is_car} = req.query;
	if(id){
		var updateIconSQL = `update t_rc set build = "${build}",area="${area}",price="${price}",is_car="${is_car}" where id = "${id}"`;
		 conf.query(updateIconSQL,function(error,result){
						checklogin.resultFn(res,result,()=>{
							res.json({
								code: 200
							});
						 },res);
		 },res);
	}
});

router.get('/addInfo',(req, res, next)=>{
 var {userName,phone,card,build,area,price,is_car} = req.query;
 var isHave = `select id from t_rc where phone = "${phone}"`;
 conf.query(isHave,function(error,result){
	 if(result.length>0){
		res.json({
		  code: -1
		});
	 }else{
		 var addselect = `INSERT INTO t_rc (userName,phone,card,build,area,price,is_car) VALUES ("${userName}","${phone}","${card}","${build}","${area}","${price}","${is_car}")`
		 conf.query(addselect,function(error,result){
						checklogin.resultFn(res,result,()=>{
							res.json({
								code: 200
							});
						 },res);
		 },res);
		 
	 }
 },res)
});

module.exports = router;
