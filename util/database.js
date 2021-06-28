const {Sequelize} = require('sequelize');


const sequelize = new Sequelize('store', 'root', '', {
  dialect: 'mysql',
  host: 'localhost'
});

module.exports = sequelize;
