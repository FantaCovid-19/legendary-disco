import { EmbedBuilder, Events, Message, TextChannel } from 'discord.js';
import { t } from 'i18next';

import { Logger } from '#utils/Logger';
import Modmail from '#models/Modmail';
import ModmailConfig from '#models/ModmailConfig';

const logger = new Logger('ReplyModmail');

export default class DMModmail {
  name = Events.MessageCreate;
  once = false;

  async execute(message: Message) {
    const prefix = process.env.PREFIX || '!';
    if (message.content.startsWith(prefix) || message.author.bot || !message.guild) return;

    try {
      const modmailConfig: any = await ModmailConfig.findOne({ where: { guildId: message.guild.id } });
      if ((message.channel as TextChannel).parentId !== modmailConfig.categoryId) return;

      const thread: any = await Modmail.findOne({ where: { channelId: message.channel.id } });
      if (!thread) return;

      const user = await message.client.users.fetch(thread.userId);
      if (!user) return;

      const roles = message
        .member!.roles.cache.filter((role) => role.id !== message.guild!.id)
        .sort((a, b) => b.position - a.position)
        .first(2);

      const roleNames = roles.length > 0 ? roles.map((role) => role.name).join(', ') : t('messages:modmail.reply.fields.noRole');

      const embed = new EmbedBuilder()
        .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL()?.toString() })
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

      if (message.attachments.size > 0) embed.setImage(message.attachments.first()!.url);

      await user.send({ embeds: [embed] });
    } catch (err) {
      logger.error('Failed to reply modmail thread', err);
    }
  }
}
