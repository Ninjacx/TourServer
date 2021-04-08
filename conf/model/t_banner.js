const {sequelizeDB} = require('../SequelizeDb');
const {Sequelize,DataTypes,Model,QueryTypes} = require('sequelize');

const Banner = sequelizeDB.define('Banner', {
  // 在这里定义模型属性
  banner_name: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  image: {
    type: DataTypes.STRING
    // allowNull 默认为 true
  },
  type: {
    type: DataTypes.STRING
    // allowNull 默认为 true
  },
  url: {
    type: DataTypes.STRING
    // allowNull 默认为 true
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
  tableName: 't_banner',
  sequelizeDB, // 我们需要传递连接实例
  modelName: 'Banner' // 我们需要选择模型名称
});

exports.BannerModel = Banner;
// Collect
