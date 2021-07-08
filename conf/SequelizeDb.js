const {Sequelize,DataTypes,Model,QueryTypes} = require('sequelize');
// https://www.sequelize.com.cn/core-concepts/model-basics  文档
//Setting up a connection
const sequelize = new Sequelize('jdz','root','123',{
    logging: function (str) {
        console.log('str',str);
        // do your own logging
    },
    host:'139.224.131.217',
    port:3306,
    dialect:'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    // logging: true,
});
exports.sequelizeDB = sequelize