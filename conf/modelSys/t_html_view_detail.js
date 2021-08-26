const {sequelizeDB} = require('../SequelizeSystemDb');
const {Sequelize,DataTypes,Model,QueryTypes} = require('sequelize');

const HtmlViewDetail = sequelizeDB.define('HtmlViewDetail', {
  type_name: {
    type: DataTypes.STRING,
  },
  details: {
    type: DataTypes.TEXT,
  }
}, {
  // 这是其他模型参数
  freezeTableName: true, // 禁止模型名根据表名自动复数
  timestamps: true,

  // 不需要字段
  createdAt: false,
  updatedAt: false,
  tableName: 't_html_view_detail',
  sequelizeDB, // 我们需要传递连接实例
  modelName: 'HtmlViewDetail' // 我们需要选择模型名称
});
exports.HtmlViewDetailModel = HtmlViewDetail;