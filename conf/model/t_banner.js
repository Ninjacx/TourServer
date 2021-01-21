const {sequelizeDB} = require('../SequelizeDb');
const {Sequelize,DataTypes,Model,QueryTypes} = require('sequelize');

const Banner = sequelizeDB.define('Banner', {
  // 在这里定义模型属性
  name: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  menu_key: {
    type: DataTypes.STRING
    // allowNull 默认为 true
  },
  icon: {
    type: DataTypes.STRING
    // allowNull 默认为 true
  },
  
  groups: {
    type: DataTypes.INTEGER
    // allowNull 默认为 true
  },
  menu_id: {
    type: DataTypes.INTEGER
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
