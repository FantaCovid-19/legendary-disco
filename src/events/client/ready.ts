import { Client, Events } from 'discord.js';

import { Logger } from '#utils/Logger';
import { ExtendedClient } from '#structures/ExtendedClient';

const logger = new Logger('Ready');

export default class Ready {
  name = Events.ClientReady;
  once = true;

  async execute(client: Client<true> & ExtendedClient) {
    logger.info(`Logged in as "${client.user.displayName}" (${client.user.id})`);
    logger.info(`Guilds: ${client.guilds.cache.size}`);
    logger.info(`Slash Commands: ${client.slashCommands.size}`);
    logger.info(`Commands: ${client.commands.size}`);
  }
}
