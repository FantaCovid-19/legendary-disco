import { Events } from 'discord.js';

import { Logger } from '#utils/Logger.js';

const logger = new Logger('Ready');

export default class Ready {
  name = Events.ClientReady;
  once = true;

  /**
   * @param {import('discord.js').Client} client
   * @returns {Promise<void>}
   */
  async execute(client) {
    logger.info(`Logged in as "${client.user.displayName}" (${client.user.id})`);
    logger.info(`Guilds: ${client.guilds.cache.size}`);
    logger.info(`Slash Commands: ${client.slashCommands.size}`);
    logger.info(`Commands: ${client.commands.size}`);
  }
}
