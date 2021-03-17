var express = require('express');
var conf = require('../conf/conf');
var {setCatch} = require('../common/publicFn');
const axios = require('axios');
var wxBizDataCrypt = require('../common/WXBizDataCrypt');
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
// 小程序测试号信息
// AppID wx54dea766ca936f0d
// AppSecret 76f6f9bfb275c6d55244c538f7f12f6e
router.get('/getUserPhoneStepOne',(req, res, next)=>{
  const { code } = req.query
  const appid = "wx54dea766ca936f0d"
  const secret = "76f6f9bfb275c6d55244c538f7f12f6e"
  console.log('code',code);
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
  axios({
    url
  }).then((resCode) => {
    console.log('resCode',resCode.data);
    if (resCode.status === 200) {
      res.status(200)
      res.send({
        data: resCode.data,
        status: 200
      })
    }
  })
});
router.get('/getUserPhoneStepTwo',(req, res, next)=>{
  const { sessionKey, encryptedData, iv } = req.query
  console.log('sessionKey',sessionKey);
  console.log('encryptedData',encryptedData);
  console.log('iv',iv);
  const appid = "wx54dea766ca936f0d"
  var bizDataCrypt = new wxBizDataCrypt(appid, sessionKey)
  
  const data = bizDataCrypt.decryptData(encryptedData, iv)
  console.log('data',data);
  if (Object.keys(data).length > 0) {
    res.status(200)
    res.send({
      status: 200,
      data,
      msg: '获取手机号码成功'
    })
  } else {
    res.status(400)
    res.send({
      status: 400,
      msg: '获取失败,请重新授权'
    })
  }

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
