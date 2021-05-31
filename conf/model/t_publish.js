const {sequelizeDB} = require('../SequelizeDb');
const {Sequelize,DataTypes,Model,QueryTypes} = require('sequelize');

const Publish = sequelizeDB.define('Publish', {
  // 在这里定义模型属性
  id: {
    type: DataTypes.INTEGER,
    foreignKey: 'id' ,
    primaryKey: true
  },
  // 在这里定义模型属性
  motorcycle_name: {
    type: DataTypes.STRING,
    // allowNull: false,
    // validate: {
    //     customValidator(value) {
    //       if (value === null || !value) {
    //         throw new Error("not null");
    //       }
    //     // msg: '请填写车型名'
    //   }
    // }
  },
  license_plate_id: {
    type: DataTypes.INTEGER,
  },
  region_id: {
    type: DataTypes.INTEGER,
  },
  type_id: {
    type: DataTypes.INTEGER,
  },
  volume: {
    type: DataTypes.STRING,
  },
  rent_day: {
    type: DataTypes.STRING,
  },
  rent_month: {
    type: DataTypes.STRING,
  },
  rent_year: {
    type: DataTypes.STRING,
  },
  addr_detail: {
    type: DataTypes.STRING,
  },
  pic_url: {
    type: DataTypes.STRING,
  },
  create_time: {
    type: DataTypes.DATE,
  },
  uid: {
    type: DataTypes.STRING,
  },
  contact: {
    type: DataTypes.STRING,
  },
  contact_phone: {
    type: DataTypes.STRING,
  },
  deposit: {
    type: DataTypes.INTEGER,
  },
  is_valid: {
    type: DataTypes.STRING,
  },
  is_lease: {
    type: DataTypes.INTEGER,
  },
  create_time: {
    type: DataTypes.DATE,
  },
  description: {
    type: DataTypes.STRING,
  },
}, {
  // 这是其他模型参数
  freezeTableName: true, // 禁止模型名根据表名自动复数
  timestamps: true,

  // 不需要字段
  createdAt: false,
  updatedAt: false,
  tableName: 't_publish',
  sequelizeDB, // 我们需要传递连接实例
  modelName: 'Publish' // 我们需要选择模型名称
});
exports.PublishModel = Publish;