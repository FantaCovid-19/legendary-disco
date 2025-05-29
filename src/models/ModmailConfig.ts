import { DataTypes } from 'sequelize';
import { sequelize } from '#utils/Database.js';

const ModmailConfig = sequelize.define(
  'modmail_config',
  {
    guildId: {
      type: DataTypes.STRING,
      primaryKey: true,
      unique: true,
    },
    categoryId: {
      type: DataTypes.STRING,
    },
    logChannelId: {
      type: DataTypes.STRING,
    },
    modRoleId: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  },
  {}
);

export default ModmailConfig;
