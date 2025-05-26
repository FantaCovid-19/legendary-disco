import { DataTypes } from 'sequelize';
import { sequelize } from '#utils/Database.js';

const Warns = sequelize.define(
  'warns',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.STRING,
    },
    guildId: {
      type: DataTypes.STRING,
    },
    totalWarns: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    warns: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  },
  {}
);

export default Warns;
