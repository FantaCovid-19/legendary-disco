import { ActionRow, ActionRowBuilder, ButtonBuilder, ComponentType, TimestampStylesString } from 'discord.js';
import { constants } from 'node:fs';
import { readdir, access } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

import { Logger } from './Logger';

const logger = new Logger('Util');

async function dynamicImport(filePath: string) {
  const module = await import(pathToFileURL(filePath).toString());
  return module.default || module;
}

export async function loadStructures(directory: string, props: Array<string> = []) {
  const fileData = [];

  const folders = await readdir(directory);

  for (const folder of folders) {
    const folderPath = join(directory, folder);
    const files = await readdir(folderPath).then((files) => files.filter((file) => file.endsWith('.js') || file.endsWith('.ts')));

    for (const file of files) {
      const filePath = join(folderPath, file);
      const structures = await dynamicImport(filePath);

      const data = new structures();

      if (props[0] in data && props[1] in data) {
        fileData.push(data);
      } else {
        logger.warn(`File ${filePath} does not have the required properties: ${props.join(', ')}`);
      }
    }
  }

  return fileData;
}

export function time(ms: number, style: TimestampStylesString) {
  return `<t:${Math.floor(Date.now() / 1000 + ms / 1000)}:${style}>`;
}

export function disableButtons(actionRow: ActionRowBuilder<ButtonBuilder>) {
  return new ActionRowBuilder().addComponents(actionRow.components.map((button: ButtonBuilder) => button.setDisabled(true)));
}

export function generateRandomHex(size: number = 6): string {
  const hex = [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  return hex;
}
