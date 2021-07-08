const {sequelizeDB} = require('../SequelizeDb');
const {Sequelize,DataTypes,Model,QueryTypes} = require('sequelize');

const Integral = sequelizeDB.define('Integral', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true   
    // allowNull: false
  },
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
  tableName: 't_integral',
  sequelizeDB, // 我们需要传递连接实例
  modelName: 'Integral' // 我们需要选择模型名称
});
exports.IntegralModel = Integral;