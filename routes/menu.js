var express = require('express');
var conf = require('../conf/conf');
var {setCatch} = require('../common/publicFn');
var {MenuModel} = require('../conf/model/t_menu');
var {BannerModel} = require('../conf/model/t_banner');
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
// const AuthMiddleware = require('./checklogin');
const checklogin = require('./checklogin');
const tools = require('../common/tools');

/**---------------------------------1.获取---------------------------------------------*/
// 查出菜单 
router.get('/getMenu',(req, res, next)=>{
  MenuModel.findAll({
    where: {
      is_del: 0,
      groups: req.query.groups
    }
  }).then((resultList)=>{
    checklogin.resultSuccess(res, resultList);
  }).catch((error)=>{
    setCatch(res, error)
  })
});

// 查出APP 展示的商家广告位 与 APP 其它展示图
router.get('/getBanner',(req, res, next)=>{
  BannerModel.findAll({
    attributes: ['title', 'url','image','type'],
    where: {
      is_del: 0,
      type: req.query.type
    }
  }).then((resultList)=>{
    checklogin.resultSuccess(res, resultList);
  }).catch((error)=>{
    setCatch(res, error)
  })
  // 传入groups = 1 则加条件，不然就查全部
    // var type = req.query.type?`and type = ${req.query.type}`:"";
    // var selectSQL = `select title,url,image,type from t_banner where is_del = 0 ${type}`;
    //   conf.query(selectSQL,function(err,result){
    //     checklogin.result(res,result,true);
    //   },res);
});

module.exports = router;
