var express = require('express');
var conf = require('../conf/conf');
var {successResult, setCatch} = require('../common/publicFn');
const axios = require('axios');
var wxBizDataCrypt = require('../common/WXBizDataCrypt');
var {MenuModel} = require('../conf/model/t_menu');
var {UserModel} = require('../conf/model/t_user');
var {PublishModel} = require('../conf/model/t_publish');
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
const uuid_v5 = require('uuid/v5');
const uuid_v4 = require('uuid/v4');
const serverIp = 'http://172.16.19.133/';

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
  }).catch((error)=>{
    setCatch(res, error)
  })
});
router.get('/getUserPhoneStepTwo',(req, res, next)=>{
  const { sessionKey, encryptedData, iv } = req.query
  const appid = "wx54dea766ca936f0d"
  var bizDataCrypt = new wxBizDataCrypt(appid, sessionKey)
  const data = bizDataCrypt.decryptData(encryptedData, iv)
  successResult(res,data)
});

// 登录
router.post('/login',async (req, res, next) => {
  var {openId, phoneNumber} = req.body
  // 此方法查到数据则取出，否则直接添加
  const [user, isNewUser] = await UserModel.findOrCreate({
    attributes: { exclude: ['id'] },
    where: { phone: phoneNumber },
    defaults: {
      id: uuid_v4(),
      open_id: openId,
      phone: phoneNumber
    }
  })
  var msg = isNewUser?'注册成功': '登录成功'
  successResult(res, user.dataValues, msg)
})

// 商户发布车型
router.post('/publish',function(req, res, next) {
	var form = new formidable.IncomingForm();
    //设置文件上传存放地址（需要先把这个文件夹，在项目中建好）
	form.uploadDir = "./public/upload";
    //执行里面的回调函数的时候，表单已经全部接收完毕了。
    form.parse(req,function(err, params, files) {
            var old_path = files.file.path; //myFileName就是我们刚在前台模板里面配置的后台接受的名称；
            var extname = uuid_v5(files.file.name, uuid_v5.DNS); //因为formidable这个时候存在我们刚路径上的，只是一个path，还没有具体的扩展名，如：2.png这样的
            // //新的路径由组成：原父路径 + 拓展名
            var new_path = "./public/upload/" + extname;
             //改名
            fs.rename(old_path, new_path,async function(err) { //把之前存的图片换成真的图片的完整路径
              var paramsObj = Object.assign(params,{pic_url: `/upload/${extname}`})
              await PublishModel.create(paramsObj).then((result)=>{
                successResult(res, result._options, '发布成功')
              }).catch((error)=>{
                  setCatch(res, error.errors[0].message)
              })
            });
    });
});


// 查出APP 展示的商家广告位 与 APP 其它展示图
router.get('/getBanner',(req, res, next)=>{
  // BannerModel.findAll({
  //   attributes: ['title', 'url','image','type'],
  //   where: {
  //     is_del: 0,
  //     type: req.query.type
  //   }
  // }).then((resultList)=>{
  //   checklogin.resultSuccess(res, resultList);
  // }).catch((error)=>{
  //   setCatch(res, error)
  // })
  // 传入groups = 1 则加条件，不然就查全部
    // var type = req.query.type?`and type = ${req.query.type}`:"";
    // var selectSQL = `select title,url,image,type from t_banner where is_del = 0 ${type}`;
    //   conf.query(selectSQL,function(err,result){
    //     checklogin.result(res,result,true);
    //   },res);
});

module.exports = router;
