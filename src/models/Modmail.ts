import { DataTypes } from 'sequelize';
import { sequelize } from '#utils/Database';

const Modmail = sequelize.define(
  'modmail',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    guildId: {
      type: DataTypes.STRING,
    },
    userId: {
      type: DataTypes.STRING,
    },
    channelId: {
      type: DataTypes.STRING,
    },
  },
  {}
);

export default Modmail;
