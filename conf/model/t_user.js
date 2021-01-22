const {sequelizeDB} = require('../SequelizeDb');
const {Sequelize,DataTypes,Model,QueryTypes} = require('sequelize');

const User = sequelizeDB.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey:true
    // allowNull: false
  },
  // 在这里定义模型属性
  nick_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  token: {
    type: DataTypes.STRING
    // allowNull 默认为 true
  },
  signature: {
    type: DataTypes.STRING
    // allowNull 默认为 true
  }
}, {
  // 这是其他模型参数
  freezeTableName: true, // 禁止模型名根据表名自动复数
  timestamps: true,

  // 不需要字段
  createdAt: false,
  updatedAt: false,
  tableName: 't_user',
  sequelizeDB, // 我们需要传递连接实例
  modelName: 'User' // 我们需要选择模型名称
});
exports.UserModel = User;

// class User extends Model {}

// User.init({
//   // 在这里定义模型属性
//   // nick_name: {
//   //   type: DataTypes.STRING,
//   //   allowNull: false
//   // },
//   // lastName: {
//   //   type: DataTypes.STRING
//   //   // allowNull 默认为 true
//   // }
// }, {
//   // 这是其他模型参数
//   timestamps: true,

//   // 不想要 createdAt
//   createdAt: false,
//   updatedAt: false,
//   tableName: 't_user',
//   sequelizeDB, // 我们需要传递连接实例
//   modelName: 'User' // 我们需要选择模型名称
// });
// async function aa (){
//   const records = await sequelize.query('select * from t_user', {
//     nest: true,
//     type: QueryTypes.SELECT
//   });
//   console.log(records.length);
// }
// aa()

//  async function bb (){
//   var res = await User.findOne({attributes: ['id'], where: { nick_name: '旅行的乌龟12' } })
//    .then(function(res){
//     console.log('res',JSON.parse(JSON.stringify(res)).length );
//     JSON.parse(JSON.stringify(res)).map((item)=>{
//       console.log('item.nick_name',item.nick_name);
//     })
//   });
//   const records = await sequelize.query('select * from t_user', {
//     nest: true,
//     type: QueryTypes.SELECT
//   });
//   console.log(records.length);
// }
// bb()
