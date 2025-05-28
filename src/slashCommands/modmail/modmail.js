import { MessageFlags, SlashCommandBuilder } from 'discord.js';

import { getPage } from '#utils/ModmailStore.js';
import { Logger } from '#utils/Logger.js';

const logger = new Logger('ModmailCommand');

export default class ModmailCommand {
  data = new SlashCommandBuilder()
    .setName('modmail')
    .setDescription('Modmail command')
    .addSubcommand((group) => group.setName('guilds').setDescription('Select a guild to send a modmail message'));

  /**
   * @param {import('discord.js').CommandInteraction} interaction
   */
  async execute(interaction) {
    try {
      const row = await getPage(interaction, interaction.user.id);
      return await interaction.reply({ components: [row], flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2 });
    } catch (err) {
      logger.error('Error executing modmail command', err, interaction.guildId);
    }
  }
}
