const {Sequelize,DataTypes,Model,QueryTypes} = require('sequelize');
// https://www.sequelize.com.cn/core-concepts/model-basics  文档
//Setting up a connection
const sequelize = new Sequelize('Tour','root','123',{
    host:'47.98.163.21',
    port:3306,
    dialect:'mysql',
});


exports.sequelizeDB = sequelize