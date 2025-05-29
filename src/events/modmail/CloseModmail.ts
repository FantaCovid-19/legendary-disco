import { EmbedBuilder, Events, Interaction, MessageFlags } from 'discord.js';
import { t } from 'i18next';

import { Logger } from '#utils/Logger';
import Modmail from '#models/Modmail';

const logger = new Logger('CloseModmail');

export default class CloseModmail {
  name = Events.InteractionCreate;
  once = false;

  async execute(interaction: Interaction) {
    if (!interaction.isButton() || interaction.customId !== 'close_modmail') return;

    try {
      const thread: any = await Modmail.findOne({ where: { channelId: interaction.channel!.id } });
      if (!thread) return await interaction.reply({ content: t('messages:modmail.close.notFound'), flags: MessageFlags.Ephemeral });

      const user = await interaction.client.users.fetch(thread.userId);

      if (user) {
        const closeEmbed = new EmbedBuilder()
          .setTitle(t('messages:modmail.close.title'))
          .setDescription(t('messages:modmail.close.description', { user: interaction.user.displayName, guild: interaction.guild!.name }))
          .addFields([
            {
              name: t('messages:modmail.close.fields.staff'),
              value: `**${interaction.user.displayName}** (${interaction.user.id})`,
              inline: true,
            },
            {
              name: t('messages:modmail.close.fields.guild'),
              value: `**${interaction.guild!.name}** (${interaction.guild!.id})`,
              inline: true,
            },
            {
              name: t('messages:modmail.close.fields.date'),
              value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
              inline: false,
            },
          ])
          .setColor('Blurple')
          .setFooter({
            text: t('messages:modmail.close.footer', { guild: interaction.guild!.name }) || t('messages:modmail.close.uknownGuild'),
            iconURL: interaction.guild!.iconURL() || undefined,
          })
          .setTimestamp();

        await user.send({ embeds: [closeEmbed] });
        await Modmail.destroy({ where: { channelId: interaction.channel!.id } });
        await interaction.reply({ content: t('messages:modmail.close.threadClose'), flags: MessageFlags.Ephemeral });

        setTimeout(async () => {
          try {
            await interaction.channel!.delete();
          } catch (err) {
            logger.fatal('Failed to delete modmail thread', err);
          }
        }, 5000);
      }
    } catch (err) {
      logger.error('Failed to close modmail thread', err);
    }
  }
}
