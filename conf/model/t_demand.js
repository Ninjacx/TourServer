// 需求表
const {sequelizeDB} = require('../SequelizeDb');
const {Sequelize,DataTypes,Model,QueryTypes} = require('sequelize');

const Demand = sequelizeDB.define('Demand', {
  // 在这里定义模型属性
  content: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  uid: {
    type: DataTypes.STRING
    // allowNull 默认为 true
  },
  create_time: {
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
  tableName: 't_demand',
  sequelizeDB, // 我们需要传递连接实例
  modelName: 'Demand' // 我们需要选择模型名称
});

exports.DemandModel = Demand;
// Collect
