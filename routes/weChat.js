var express = require('express');
// DATE_FORMAT(t_user.create_time,"%Y-%m-%d")as createTime
var conf = require('../conf/conf');
var {successResult, setCatch} = require('../common/publicFn');
const {sequelizeDB} = require('../conf/SequelizeDb');
const {Sequelize,DataTypes,Model,QueryTypes} = require('sequelize');
const axios = require('axios');
var wxBizDataCrypt = require('../common/WXBizDataCrypt');
// var {MenuModel} = require('../conf/model/t_menu');
var {UserModel} = require('../conf/model/t_user');
var {OrderModel} = require('../conf/model/t_order');
var {V_PublishModel} = require('../conf/model/v_publish');
var {licensePlateModel} = require('../conf/model/t_license_plate');
var {TypeModel} = require('../conf/model/t_type');
var {PublishModel} = require('../conf/model/t_publish');
var {BannerModel} = require('../conf/model/t_banner');
var {AdviceModel} = require('../conf/model/t_advice');

var {RegionModel} = require('../conf/model/t_region');

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
const {resultError, paramsRule} = require('../common/tools');

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
    // attributes: { exclude: ['id'] },
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

// 牌照类型
router.get('/getLicensePlate',(req, res, next)=>{
  licensePlateModel.findAll({
    attributes: ['id', 'license_plate_name']
  }).then((result)=>{
    successResult(res, result)
  }).catch((error)=>{
      setCatch(res, error)
  })
});
// 出租类目菜单
router.get('/getType',(req, res, next)=>{
   TypeModel.findAll({
    attributes: ['id', 'type_name']
  }).then((result)=>{
    successResult(res, result)
  }).catch((error)=>{
      setCatch(res, error)
  })
});

// 发布的列表
router.get('/publishDataList',(req, res, next)=>{
  const { typeId } = req.query
  V_PublishModel.findAll({
    attributes: { exclude: ['uid','is_lease'] },
    where: {
      type_id: paramsRule(typeId)
    },
  }).then((result)=>{
		successResult(res, result)
	}).catch((error)=>{
     setCatch(res, error)
  })
});
// 用户发布详情
router.get('/publishDetailOne',(req, res, next)=>{
  const { publishId } = req.query
  V_PublishModel.findOne({
    attributes: { include:[['id','publishId']], exclude: ['id','uid','is_valid'] },
    where: {
      id: paramsRule(publishId)
    },
  }).then((result)=>{
		successResult(res, result)
	})
});
// 用户发布的列表
router.get('/userPublishDataList',(req, res, next)=>{
  
  var uid = req.get("Authorization")
  const { lease } = req.query
  
  OrderModel.hasOne(V_PublishModel,{foreignKey: 'id'}) 
  V_PublishModel.belongsTo(OrderModel, {foreignKey: 'id'}) // , {foreignKey: 'id'}

  V_PublishModel.findAll({
    attributes: {
      include:[
        [Sequelize.fn('date_format', Sequelize.col('start_time'),'%Y-%m-%d %H:%i:%s'), 'start_time'],
        [Sequelize.fn('date_format', Sequelize.col('end_time'),'%Y-%m-%d %H:%i:%s'), 'end_time']
      ],
      exclude: ['uid','is_valid'] 
    }, 
      where: {uid, is_lease: paramsRule(lease)}, 
      include: [
                { model: OrderModel,
                  attributes: [],
                  required: false,
                },
                
      ], raw: true}).then((result)=>{
        successResult(res, result)
      })
  // V_PublishModel.findAll({
  //   attributes: { exclude: ['uid','is_lease'] },
  //   where: {
  //     uid,
  //     is_lease: paramsRule(lease)
  //   },
  // }).then((result)=>{
	// 	successResult(res, result)
	// }).catch((error)=>{
  //    setCatch(res, error)
  // })
});
// 用户我的订单列表
router.get('/getUserOrderList',(req, res, next)=>{
  // whereIn  历史，已完成，进行中
  const { status } = req.query
  var uid = req.get("Authorization")
  console.log('uid', uid);
  // https://www.cnblogs.com/hss-blog/articles/10220267.html
  V_PublishModel.hasOne(OrderModel, {foreignKey: 'id'})
  OrderModel.belongsTo(V_PublishModel, {foreignKey: 'publish_id'}) // , attributes: { exclude: ['uid','is_valid'] }

  OrderModel.findAll({
    attributes: {
      include:[ //  
        Sequelize.col('v_publish.addr_detail'),
        Sequelize.col('v_publish.motorcycle_name'),
        Sequelize.col('v_publish.region_name'),
        Sequelize.col('v_publish.license_plate_name'),
        Sequelize.col('v_publish.pic_url'),
        [Sequelize.fn('date_format', Sequelize.col('start_time'),'%Y-%m-%d %H:%i:%s'), 'start_time'],
        [Sequelize.fn('date_format', Sequelize.col('end_time'),'%Y-%m-%d %H:%i:%s'), 'end_time']
      ],
      exclude: ['uid','is_valid'] 
    }, 
      where: {status: paramsRule(status)}, 
      include: [
                { model: V_PublishModel,
                  attributes: [],
                  required: false,
                },
                
      ], raw: true}).then((result)=>{
        successResult(res, result)
      })
});
// 支付成功生成订单 订单生成后需要把t_publish 表中的is_active 改成活动状态
router.post('/addOrder',(req, res, next) => {
  var uid = req.get("Authorization")
  
  var {publishId, countDay, startDate, startTime} = req.body
  console.log('startDate + startTime,',startDate + ' ' +startTime);
  // return false
  // console.log('startDate',startDate);
  // console.log('startDate',startTime);
  // return false;
  // 查出当前产品的单价 并且后台计算
  PublishModel.findOne({
    attributes: { include:['rent_day','rent_month']},
    where: {
      id: paramsRule(publishId)
    },
  }).then(async (result)=>{
    var {rent_day, rent_month} = result 
    var payMent = countDay * rent_day // 按照天数的金额
    // 统一前端传时间戳过来会方便
    // 生成订单 创建订单，并且改变产品的状态，已被使用
    // console.log('=========',{
    //   amount: payMent,
    //   uid: uid,
    //   publish_id: publishId,
    //   end_time: '' // 根据用户初始时间+天数 = 结束时间
    // });
    try {
      // const result = await sequelizeDB.transaction(async t => {
        OrderModel.create({
          amount: payMent,
          uid: uid,
          publish_id: publishId,
          start_time: '2021-04-07 22:34:35', //startDate + ' 0' +startTime,
          end_time: '2021-04-07 22:34:35' // 根据用户初始时间+天数 = 结束时间
        }) // , { transaction: t }

         var resUpdate = await PublishModel.update({is_lease: 1}, {where: { id: publishId }}) // , { transaction: t }
         successResult(res, resUpdate)
      // })
    // console.log('result',result);
      // 如果执行到此，则表示事务已成功提交，result 是事务返回的结果，在这种情况下为 `user`
    } catch (error) {
      console.log('-------------------');
      console.log(error);
      console.log('-------------------');
      // 如果执行到此，则发生错误，该事务已由 Sequelize 自动回滚。
    }




		// successResult(res, result)
	}).catch((error)=>{
     setCatch(res, error)
  })
  // console.log('publishId',publishId);
  // 此方法查到数据则取出，否则直接添加
  // const [user, isNewUser] = await UserModel.findOrCreate({
  //   attributes: { exclude: ['id'] },
  //   where: { phone: phoneNumber },
  //   defaults: {
  //     id: uuid_v4(),
  //     open_id: openId,
  //     phone: phoneNumber
  //   }
  // })
  // var msg = isNewUser?'注册成功': '登录成功'
  // successResult(res, user.dataValues, msg)
})

// 发布牌照
router.post('/publishLicensePlate',function(req, res, next) {
  var uid = req.get("Authorization")
  var params = req.body
  // 
  PublishModel.create(Object.assign(params, uid)).then((result)=>{
    successResult(res, result._options, '发布成功')
  }).catch((error)=>{
    console.log('error',error);
      setCatch(res, error)
  })
})

// 商户发布车型 (需优化一个人一天最多只能加50条？)
router.post('/publish',function(req, res, next) {
  var uid = req.get("Authorization")
  // 当类型为牌照的时候则不调用上传图片的接口
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
              var paramsObj = Object.assign(params,{pic_url: `/upload/${extname}`, uid})
              console.log('paramsObj',paramsObj);
              await PublishModel.create(paramsObj).then((result)=>{
                successResult(res, result._options, '发布成功')
              }).catch((error)=>{
                console.log('error',error);
                  setCatch(res, error)
              })
            });
    });
});


// 查出APP 展示的商家广告位 与 APP 其它展示图
router.get('/getBanner',(req, res, next)=>{
  BannerModel.findAll({
    attributes: ['banner_name', 'url','image','type'],
    where: {
      is_del: 0
      // type: req.query.type
    }
  }).then((result)=>{
    successResult(res, result)
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

// 意见反馈添加
router.post('/addAdvice',(req, res, next) => {
  var {content, phone, uid} = req.body
  AdviceModel.create({
    content: paramsRule(content),
    phone: paramsRule(phone),
    uid
  }).then((result)=>{
    successResult(res, result, '反馈成功')
  }).catch((error)=>{
    setCatch(res, error)
  })
})

module.exports = router;
