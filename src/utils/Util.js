import { constants } from 'node:fs';
import { readdir, access } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

import { Logger } from './Logger.js';
import { ActionRowBuilder } from 'discord.js';

const logger = new Logger('Util');

/**
 * Dynamically import a module
 *
 * @param {string} path - The path to the module
 * @return {Promise<unknown>} - The imported module
 * */
async function dynamicImport(path) {
  const module = await import(pathToFileURL(path));
  return module.default || module;
}

/**
 * Load structures from a given path
 *
 * @param {string} path - The path to the structures
 * @param {Array<string>} props - The properties to check for
 * @returns {Promise<Array<unknown>>} - An array of loaded structures
 */
async function loadStructures(path, props) {
  const fileData = [];

  try {
    await access(path, constants.F_OK);
  } catch (err) {
    logger.warn(`- [ loadStructure ] ${path} does not exist.`, err);
    return fileData;
  }

  const folders = await readdir(path);

  for (const folder of folders) {
    const folderPath = join(path, folder);
    const files = await readdir(folderPath).then((f) => f.filter((file) => file.endsWith('.js')));

    for (const file of files) {
      const filePath = join(folderPath, file);
      const structure = await dynamicImport(filePath);

      if (structure && typeof structure !== 'function') {
        logger.warn(`- [ loadStructure ] ${filePath} is not a valid structure.`);
        continue;
      }

      const data = new structure();

      if (props[0] in data && props[1] in data) {
        fileData.push(data);
      } else {
        logger.warn(`- [ loadStructure ] ${filePath} does not have the required properties.`);
      }
    }
  }

  return fileData;
}

/**
 * Get the current time in seconds
 *
 * @param {number} ms
 * @param {import('discord.js').TimestampStylesString} style
 * @returns {string}
 */
async function time(ms, style) {
  return `<t:${Math.floor(Date.now() / 1000 + ms / 1000)}:${style}>`;
}

/**
 * Disable buttons in an action row
 *
 * @param {ActionRowBuilder} acctionRow
 * @returns {ActionRowBuilder}
 */
function disableButtons(acctionRow) {
  return new ActionRowBuilder().addComponents(acctionRow.components.map((button) => button.setDisabled(true)));
}

/**
 * Generate a random hexadecimal string of a given size
 *
 * @param {number} size - The size of the hexadecimal string to generate
 * @returns {string|null} - The generated hexadecimal string or null if size is not a number
 */
function generateRandomHex(size) {
  if (isNaN(Number(size))) return null;
  const gex = [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  return gex;
}

export { loadStructures, time, disableButtons, generateRandomHex };
