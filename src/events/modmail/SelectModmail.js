import { ContainerBuilder, Events, MessageFlags, TextDisplayBuilder } from 'discord.js';
import { t } from 'i18next';

import { changePage, getPage, setSelectedGuild } from '#utils/ModmailStore.js';
import { Logger } from '#utils/Logger.js';

const logger = new Logger('SelectModmail');

export default class SelectModmail {
  name = Events.InteractionCreate;
  once = false;

  /**
   * @param {import('discord.js').Interaction} interaction
   * @returns {Promise<void>}
   */
  async execute(interaction) {
    if (!interaction.isButton()) return;

    try {
      if (interaction.customId.startsWith('modmail_select_')) {
        const guildId = interaction.customId.split('_')[2];
        setSelectedGuild(interaction.user.id, guildId);
        const selectedGuild = interaction.client.guilds.cache.get(guildId);

        const container = new ContainerBuilder();
        const text = new TextDisplayBuilder().setContent(t('messages:modmail.selectGuildMessage', { guildId, guild: selectedGuild.name }));

        container.addTextDisplayComponents(text);

        return await interaction.reply({ components: [container], flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2 });
      }

      if (interaction.customId === 'modmail_prev') {
        changePage(interaction.user.id, -1);
        const row = await getPage(interaction, interaction.user.id);

        return await interaction.update({ components: [row], flags: MessageFlags.IsComponentsV2 });
      } else if (interaction.customId === 'modmail_next') {
        changePage(interaction.user.id, 1);
        const row = await getPage(interaction, interaction.user.id);

        return await interaction.update({ components: [row], flags: MessageFlags.IsComponentsV2 });
      }
    } catch (err) {
      logger.error('Error handling modmail selection interaction', err, interaction.guildId);
    }
  }
}
