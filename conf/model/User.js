// var sequelize = require('../SequelizeDb');
const Sequelize = require('../SequelizeDb');

// console.log('Sequelize',Sequelize.define);

// const User = Sequelize.define('User', {
//   // 在这里定义模型属性
//   firstName: {
//     nick_name: DataTypes.STRING,
//     allowNull: false
//   },
//   token: {
//     type: DataTypes.STRING
//     // allowNull 默认为 true
//   },
//   signature: {
//     type: DataTypes.STRING
//     // allowNull 默认为 true
//   }
// }, {
//   // 这是其他模型参数
//   freezeTableName: true // 禁止模型名根据表名自动复数
// });

// // class User extends Model {}

// User.init({
//   // 在这里定义模型属性
//   // nick_name: {
//   //   type: DataTypes.STRING,
//   //   allowNull: false
//   // },
//   // lastName: {
//   //   type: DataTypes.STRING
//   //   // allowNull 默认为 true
//   // }
// }, {
//   // 这是其他模型参数
//   tableName: 't_user',
//   SequelizeDb, // 我们需要传递连接实例
//   modelName: 'User' // 我们需要选择模型名称
// });

// exports.User = User