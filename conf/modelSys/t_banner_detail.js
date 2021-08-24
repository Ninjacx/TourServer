const {sequelizeDB} = require('../SequelizeSystemDb');
const {Sequelize,DataTypes,Model,QueryTypes} = require('sequelize');

const BannerDetail = sequelizeDB.define('BannerDetail', {
  banner_url: {
    type: DataTypes.STRING,
  },
  details: {
    type: DataTypes.TEXT,
  },
  type:{
    type: DataTypes.INTEGER,
  },                                                                                                                                                                                                                                                                                                                                                                                                                                    
  start_time: {
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
  tableName: 't_banner_detail',
  sequelizeDB, // 我们需要传递连接实例
  modelName: 'BannerDetail' // 我们需要选择模型名称
});
exports.BannerDetailModel = BannerDetail;