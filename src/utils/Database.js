import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  logging: false,

  storage: './db/database.sqlite',
});

export { sequelize };
