const {sequelizeDB} = require('../SequelizeDb');
const {Sequelize,DataTypes,Model,QueryTypes} = require('sequelize');

const Publish = sequelizeDB.define('Publish', {
  // id: {
  //   type: DataTypes.INTEGER,
  //   primaryKey: true
  //   // allowNull: false
  // },
  // id
  // motorcycle_name
  // license_plate_id
  // volume
  // rent_day
  // region_id
  // rent_month
  // addr_detail
  // contact
  // photo
  // contact_phone
  // createtime
  // uid
  // is_valid
  // // 在这里定义模型属性
  motorcycle_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
        customValidator(value) {
          if (value === null || !value) {
            throw new Error("not null");
          }
        // msg: '请填写车型名'
      }
    }
  },
  license_plate_id: {
    type: DataTypes.INTEGER,
  },
  region_id: {
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
  addr_detail: {
    type: DataTypes.STRING,
  },
  contact: {
    type: DataTypes.STRING,
  },
  contact_phone: {
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
  is_valid: {
    type: DataTypes.STRING,
  },
  open_id: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  account: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  token: {
    type: DataTypes.STRING
    // allowNull 默认为 true
  },
  create_time: {
    type: DataTypes.DATE,
    // allowNull: false
  },
  // signature: {
  //   type: DataTypes.STRING
  //   // allowNull 默认为 true
  // }
}, {
  // 这是其他模型参数
  freezeTableName: true, // 禁止模型名根据表名自动复数
  timestamps: true,

  // // 不需要字段
  createdAt: false,
  updatedAt: false,
  tableName: 't_publish',
  sequelizeDB, // 我们需要传递连接实例
  modelName: 'Publish' // 我们需要选择模型名称
});
exports.PublishModel = Publish;