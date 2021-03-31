const {sequelizeDB} = require('../SequelizeDb');
const {Sequelize,DataTypes,Model,QueryTypes} = require('sequelize');

const licensePlate = sequelizeDB.define('licensePlate', {
  // 在这里定义模型属性
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  license_plate_name: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  is_del: {
    type: DataTypes.INTEGER
    // allowNull 默认为 true
  }
}, {
  // 这是其他模型参数
  freezeTableName: true, // 禁止模型名根据表名自动复数
  timestamps: true,

  // 不需要字段
  createdAt: false,
  updatedAt: false,
  tableName: 't_license_plate',
  sequelizeDB, // 我们需要传递连接实例
  modelName: 'licensePlate' // 我们需要选择模型名称
});

exports.licensePlateModel = licensePlate;
// Collect
