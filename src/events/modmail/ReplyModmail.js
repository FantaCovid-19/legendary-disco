import { EmbedBuilder, Events } from 'discord.js';
import { t } from 'i18next';

import { Logger } from '#utils/Logger.js';
import Modmail from '#models/Modmail.js';
import ModmailConfig from '#models/ModmailConfig.js';

const logger = new Logger('ReplyModmail');

export default class DMModmail {
  name = Events.MessageCreate;
  once = false;

  /**
   * @param {import('discord.js').Message} message
   * @returns {Promise<void>}
   */
  async execute(message) {
    const prefix = process.env.PREFIX || '!';
    if (message.content.startsWith(prefix) || message.author.bot || !message.guild) return;

    try {
      const modmailConfig = await ModmailConfig.findOne({ where: { guildId: message.guild.id } });
      if (message.channel.parentId !== modmailConfig.categoryId) return;

      const thread = await Modmail.findOne({ where: { channelId: message.channel.id } });
      if (!thread) return;

      const user = await message.client.users.fetch(thread.userId);
      if (!user) return;

      const roles = message.member.roles.cache
        .filter((role) => role.id !== message.guild.id)
        .sort((a, b) => b.position - a.position)
        .first(2);

      const roleNames = roles.length > 0 ? roles.map((role) => role.name).join(', ') : t('messages:modmail.reply.fields.noRole');

      const embed = new EmbedBuilder()
        .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL() })
        .setTitle(t('messages:modmail.reply.title', { user: message.author.displayName }))
        .setDescription(message.content)
        .addFields([
          {
            name: t('messages:modmail.reply.fields.role'),
            value: `**${roleNames}**`,
          },
        ])
        .setColor('Blurple')
        .setFooter({ text: t('messages:modmail.reply.footer', { userId: message.author.id }) })
        .setTimestamp();

      if (message.attachments.size > 0) embed.setImage(message.attachments.first().url);

      await user.send({ embeds: [embed] });
    } catch (err) {
      logger.error('Failed to reply modmail thread', err);
    }
  }
}
