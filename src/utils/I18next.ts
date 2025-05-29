import i18next from 'i18next';
import I18NextFsBackend from 'i18next-fs-backend';

import { Logger } from './Logger';

const logger = new Logger('I18next');

export async function initI18n(): Promise<void> {
  await i18next.use(I18NextFsBackend).init({
    debug: process.argv.includes('--debug-lang') ? true : false,
    defaultNS: 'messages',
    ns: ['messages', 'commands'],
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: 'locales/{{lng}}/{{ns}}.json',
    },
    missingKeyHandler: (lng, ns, key) => {
      logger.warn(`Missing translation for key: ${key} in language: ${lng} and namespace: ${ns}`);
    },
  });
}
