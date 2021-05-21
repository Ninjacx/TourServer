const {sequelizeDB} = require('../SequelizeDb');
const {Sequelize,DataTypes,Model,QueryTypes} = require('sequelize');

const User = sequelizeDB.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true   
    // allowNull: false
  },
  real_name: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  emergency_contact: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  emergency_phone: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  sex: {
    type: DataTypes.INTEGER,
  },
  // 驾驶证号码
  drive_licence: {
    type: DataTypes.INTEGER,
  },
  // 租借人身份证照片（正面）
  lease_cardA: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  // 租借人身份证照片（反面）
  lease_cardB: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  // 租借人手机
  lease_contact_phone: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  // 租借人姓名
  lease_contact: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  // 租借人类型
  lease_user_type: {
    type: DataTypes.INTEGER,
  },
  member_id: {
    type: DataTypes.INTEGER,
    // allowNull: false
  },
  lease_region_id: {
    type: DataTypes.INTEGER,
    // allowNull: false
  },
  apply_status: {
    type: DataTypes.INTEGER,
    // allowNull: false
  },
  apply_member_id: {
    type: DataTypes.INTEGER,
    // allowNull: false
  },
  open_id: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  account: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  contact_phone: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  token: {
    type: DataTypes.STRING
    // allowNull 默认为 true
  },
  
  lease_emergency_contact: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  lease_emergency_phone: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  // 驾驶证照片 （正面）
  drive_cardA: {
    type: DataTypes.STRING
    // allowNull 默认为 true
  },
  // 驾驶证照片 （反面）
  drive_cardB: {
    type: DataTypes.STRING
    // allowNull 默认为 true
  },
  // 租借人车辆所在地址
  lease_addr: {
    type: DataTypes.STRING
    // allowNull 默认为 true
  },
  // 租借人店面地址照片
  lease_addr_photo: {
    type: DataTypes.STRING
    // allowNull 默认为 true
  },
  create_time: {
    type: DataTypes.DATE,
    // allowNull: false
  },
  update_time: {
    type: DataTypes.DATE,
    // allowNull: false
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
