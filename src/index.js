import 'dotenv/config';
import ExtendedClient from '#structures/ExtendedClient.js';
import { initI18n } from '#utils/I18next.js';
import { Logger } from '#utils/Logger.js';

const logger = new Logger('Main');

// Initialize i18n
try {
  logger.info('Initializing i18n...');
  await initI18n();
  logger.info('i18n initialized');
} catch (error) {
  logger.error('Error initializing i18n', error);
}

const client = new ExtendedClient();

client.start();
