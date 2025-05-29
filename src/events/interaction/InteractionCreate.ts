import { Events, Interaction, MessageFlags } from 'discord.js';

import { Logger } from '#utils/Logger.js';
import { ExtendedClient } from '#structures/ExtendedClient';

const logger = new Logger('InteractionCreate');

export default class InteractionCreate {
  name = Events.InteractionCreate;
  once = false;

  async execute(interaction: Interaction & { client: ExtendedClient }) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.slashCommands.get(interaction.commandName);
    if (!command) return await interaction.reply({ content: 'This command does not exist', flags: MessageFlags.Ephemeral });

    try {
      await command.execute(interaction);
    } catch (err) {
      await interaction.reply({ content: 'There was an error while executing this command', flags: MessageFlags.Ephemeral });
      logger.error(`Error executing command ${interaction.commandName}`, err, interaction.guildId);
    }
  }
}
