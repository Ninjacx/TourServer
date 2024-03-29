const {sequelizeDB} = require('../SequelizeDb');
const {Sequelize,DataTypes,Model,QueryTypes} = require('sequelize');

const Order = sequelizeDB.define('Order', {
  amount: {
    type: DataTypes.STRING,
  },
  uid: {
    type: DataTypes.STRING,
  },
  status:{
    type: DataTypes.INTEGER,
  },
  publish_id:{
    type: DataTypes.INTEGER,
    primaryKey: true, // 设置关联的外键
  },
  start_time: {
    type: DataTypes.STRING,
  },
  create_time: {
    type: DataTypes.DATE,
  },
  end_time: {
    type: DataTypes.STRING,
  },
}, {
  // 这是其他模型参数
  freezeTableName: true, // 禁止模型名根据表名自动复数
  timestamps: true,

  // 不需要字段
  createdAt: false,
  updatedAt: false,
  tableName: 't_order',
  sequelizeDB, // 我们需要传递连接实例
  modelName: 'Order' // 我们需要选择模型名称
});
exports.OrderModel = Order;