const Sequelize = require('sequelize');

//Setting up a connection
const sequelize = new Sequelize('Tour','root','123',{
    host:'47.98.163.21',
    port:3306,
    dialect:'mysql',
});

function exportQuery(){
  sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
}

exports.exportQuery = exportQuery