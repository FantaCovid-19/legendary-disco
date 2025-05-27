import { Events, MessageFlags } from 'discord.js';

import { Logger } from '#utils/Logger.js';
const logger = new Logger('InteractionCreate');

export default class InteractionCreate {
  name = Events.MessageCreate;
  once = false;

  /**
   * @param {import('discord.js').Message} message
   * @returns {Promise<void>}
   */
  async execute(message) {
    const prefix = process.env.PREFIX || '!';
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = message.client.commands.get(commandName);
    if (!command) return message.reply('No command found');

    try {
      await command.execute(message.client, message, args);
    } catch (err) {
      await message.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
      logger.error(`Error executing command ${commandName}`, err, message.guildId);
    }
  }
}
