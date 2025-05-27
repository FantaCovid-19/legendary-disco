import { Events, MessageFlags } from 'discord.js';

export default class InteractionCreate {
  name = Events.InteractionCreate;
  once = false;

  /**
   * @param {import('discord.js').Interaction} interaction
   * @returns {Promise<void>}
   */
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.slashCommands.get(interaction.commandName);
    if (!command) return await interaction.reply({ content: 'This command does not exist', flags: MessageFlags.Ephemeral });

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command', flags: MessageFlags.Ephemeral });
    }
  }
}
