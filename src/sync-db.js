import { sequelize } from '#utils/Database.js';
import { Logger } from '#utils/Logger.js';

import ModmailConfig from '#models/ModmailConfig.js';
import Modmail from '#models/Modmail.js';
import Warns from '#models/Warns.js';

const logger = new Logger('SyncDB');
/**
 * Sync the database with the models
 * @returns {Promise<void>}
 */
async function syncDB() {
  try {
    await sequelize.sync({ alter: true });
    logger.info('Database synced successfully');
  } catch (err) {
    logger.error('Error syncing database', err);
  }

  try {
    await ModmailConfig.sync({ alter: true });
    logger.info('ModmailConfig table synced successfully');
  } catch (err) {
    logger.error('Error syncing modmailConfig table', err);
    console.error(err);
  }

  try {
    await Modmail.sync({ alter: true });
    logger.info('Modmail table synced successfully');
  } catch (err) {
    logger.error('Error syncing modmail table', err);
  }

  try {
    await Warns.sync({ alter: true });
    logger.info('Warns table synced successfully');
  } catch (err) {
    logger.error('Error syncing warns table', err);
  }
}

syncDB();
