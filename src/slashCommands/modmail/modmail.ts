import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';

import { getPage } from '#utils/ModmailStore';
import { Logger } from '#utils/Logger';

const logger = new Logger('ModmailCommand');

export default class ModmailCommand {
  data = new SlashCommandBuilder()
    .setName('modmail')
    .setDescription('Modmail command')
    .addSubcommand((group) => group.setName('guilds').setDescription('Select a guild to send a modmail message'));

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const row = await getPage(interaction, interaction.user.id);
      return await interaction.reply({ components: [row], flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2 });
    } catch (err) {
      logger.error('Error executing modmail command', err, interaction.guildId);
    }
  }
}
