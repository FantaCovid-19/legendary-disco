import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  Events,
  Message,
  PermissionFlagsBits,
  TextChannel,
} from 'discord.js';
import { t } from 'i18next';

import { Logger } from '#utils/Logger';
import ModmailConfig from '#models/ModmailConfig';
import Modmail from '#models/Modmail';
import { getSelectedGuild } from '#utils/ModmailStore';

const logger = new Logger('DMModmail');

export default class DMModmail {
  name = Events.MessageCreate;
  once = false;

  async execute(message: Message) {
    const prefix = process.env.PREFIX || '!';
    if (message.content.startsWith(prefix) || message.author.bot || message.channel.type !== ChannelType.DM) return;

    try {
      const selectedGuildId = getSelectedGuild(message.author.id);
      if (!selectedGuildId) return await message.reply(t('messages:modmail.dm.noGuildsSelected'));

      const guild = await message.client.guilds.fetch(selectedGuildId);
      if (!guild) return await message.reply(t('messages:modmail.dm.guildNotFound'));

      const modmailConfig: any = await ModmailConfig.findOne({ where: { guildId: guild.id } });
      if (!modmailConfig) return await message.reply(t('messages:modmail.dm.noConfig', { guild: guild.name }));

      const member = await guild.members.fetch(message.author.id);
      if (!member) return await message.reply(t('messages:modmail.dm.memberNotFound'));

      if (member) {
        const activeThread: any = await Modmail.findOne({ where: { userId: message.author.id, guildId: guild.id } });

        if (activeThread) {
          const thread = await message.client.channels.fetch(activeThread.channelId);

          if (thread) {
            const embed = new EmbedBuilder()
              .setAuthor({ name: message.author.displayName, iconURL: message.author.displayAvatarURL() })
              .setTitle(t('messages:modmail.dm.threadTitle'))
              .setDescription(message.content)
              .setColor('Blurple')
              .setFooter({ text: t('messages:modmail.dm.footer', { userId: message.author.id }) })
              .setTimestamp();

            if (message.attachments.size > 0) embed.setImage(message.attachments.first()!.url);

            return await (thread as TextChannel).send({ embeds: [embed] });
          }
        }
      }

      const threadChannel = await guild.channels.create({
        name: `modmail-${message.author.username}`,
        type: ChannelType.GuildText,
        parent: modmailConfig.categoryId,
        permissionOverwrites: [
          {
            id: guild.roles.everyone,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: message.author.id,
            allow: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: modmailConfig.modRoleId,
            allow: [PermissionFlagsBits.ViewChannel],
          },
        ],
      });

      const controlPanelEmbed = new EmbedBuilder()
        .setTitle(t('messages:modmail.controlPanel.title'))
        .setDescription(t('messages:modmail.controlPanel.description'))
        .setColor('Blurple')
        .setTimestamp();

      const controlPanelRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('close_modmail')
          .setLabel(t('messages:modmail.controlPanel.close'))
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔒')
      );

      await threadChannel.send({
        content: t('messages:modmail.controlPanel.content', { user: message.author.username, userId: message.author.id }),
        embeds: [controlPanelEmbed],
        components: [controlPanelRow.toJSON()],
      });

      await Modmail.create({
        guildId: guild.id,
        userId: message.author.id,
        channelId: threadChannel.id,
      });

      const initialEmbed = new EmbedBuilder()
        .setAuthor({ name: message.author.displayName, iconURL: message.author.displayAvatarURL() })
        .setTitle(t('messages:modmail.dm.threadTitle'))
        .setDescription(message.content)
        .setColor('Blurple')
        .setFooter({ text: t('messages:modmail.dm.footer', { userId: message.author.id }) })
        .setTimestamp();

      if (message.attachments.size > 0) initialEmbed.setImage(message.attachments.first()!.url);

      await threadChannel.send({ embeds: [initialEmbed] });
      await message.reply(t('messages:modmail.dm.successfullySent', { user: message.author.username, guild: guild.name }));
    } catch (err) {
      logger.error('Failed to open modmail thread', err);
    }
  }
}
