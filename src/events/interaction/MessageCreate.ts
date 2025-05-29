import { Events, Message } from 'discord.js';

import { Logger } from '#utils/Logger';
import { ExtendedClient } from '#structures/ExtendedClient';

const logger = new Logger('InteractionCreate');

export default class InteractionCreate {
  name = Events.MessageCreate;
  once = false;

  async execute(message: Message & { client: ExtendedClient }) {
    const prefix = process.env.PREFIX || '!';
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift()!.toLowerCase();
    const command: any = message.client.commands.get(commandName);
    if (!command) return message.reply('No command found');

    try {
      await command.execute(message.client, message, args);
    } catch (err) {
      logger.error(`Error executing command ${commandName}`, err, message.guildId);
      await message.reply({ content: 'There was an error while executing this command!' });
    }
  }
}
