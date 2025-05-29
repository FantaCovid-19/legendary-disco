import 'dotenv/config';

import { BotClient } from '#structures/ExtendedClient';
import { initI18n } from '#utils/I18next';
import { Logger } from '#utils/Logger';

const logger = new Logger('Main');

try {
  logger.info('Initializing i18n...');
  initI18n();
  logger.info('i18n initialized successfully.');
} catch (err) {
  logger.error('Failed to initialize i18n:', err);
  process.exit(1);
}

const client = new BotClient();
client.init();
