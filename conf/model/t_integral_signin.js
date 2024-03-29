const {sequelizeDB} = require('../SequelizeDb');
const {Sequelize,DataTypes,Model,QueryTypes} = require('sequelize');

const IntegralSignIn = sequelizeDB.define('IntegralSignIn', {
  uid: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  create_time: {
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
  tableName: 't_integral_signin',
  sequelizeDB, // 我们需要传递连接实例
  modelName: 'IntegralSignIn' // 我们需要选择模型名称
});
exports.IntegralSignInModel = IntegralSignIn;