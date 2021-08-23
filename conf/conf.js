var mysql = require('mysql');

// 使用连接池，提升性能
// MySQL连接池数据库联接配置
var pool = mysql.createPool({
    host: '139.224.131.217',
    user: 'root',
    password: '123',
    database: 'modu_system',
    port: 3306,
    timezone: "08:00"
});

// function sql(sql){
function query(sql,callback,routerRes){
  pool.getConnection(function (err, connection){
      if (err) console.log("POOL ==> " + err);
      connection.query(sql,function(err,res){
          if (err){
            // err处理？
            // callback(err,{code: 0,msg: error});
            // next(err)
            console.log(err);
            routerRes.json({
              code: -1,
              msg: "请稍后再试"
            })
            // insert error log
            // connection.release();
            return false;
          } else{
            callback(err,res);
          }
          // connection.release();
      });
      connection.release();
  });
}

// function sql(sql){
  function queryPromise(sql,callback,routerRes){
    return new Promise((resolve, reject) => {
      pool.getConnection(function (err, connection){
          if (err) console.log("POOL ==> " + err);
          connection.query(sql,function(err,res){
              if (err){
                routerRes.json({
                  code: -1,
                  msg: err
                })
                connection.release();
                return false;
              } else{
                resolve(res);
              }
              connection.release();
          });
      });
    })
  }

//执行多条sql promise
function quertPromise(sql,routerRes){
  return new Promise((resolve, reject) => {
    // console.log(reject);
    query(sql,function(err,result){
          //  var result=JSON.stringify(result);
          //    result=JSON.parse(result);
           resolve(result);
    },routerRes);
  });
  // .then(返回值=>{
    //这里接着写
    // })
}
/*
var selectSQL = 'select * from t_goods limit 4';
var classifySQL = 'select * from t_classify limit 4';
 var sql1 = conf.quertPromise(selectSQL);
 var sql2 = conf.quertPromise(classifySQL);
  var p = Promise.all([sql1,sql2]);
  p.then(function([a,b]) {
    // ...
    console.log(a);
    console.log('`-----------------`');
    console.log(b);
  }).catch(function(err) {
    // ...
  });
*/

//module.
exports.query = query;
exports.quertPromise = quertPromise;
