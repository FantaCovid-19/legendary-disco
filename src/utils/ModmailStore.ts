import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  Interaction,
  MediaGalleryBuilder,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
} from 'discord.js';
import { t } from 'i18next';

const selectedGuilds = new Map();
const pages = new Map();

export function setSelectedGuild(userId: string, guildId: string) {
  if (!guildId) {
    selectedGuilds.delete(userId);
    pages.delete(userId);
  } else {
    selectedGuilds.set(userId, guildId);
  }
}

export function getSelectedGuild(userId: string) {
  return selectedGuilds.get(userId);
}

export function changePage(userId: string, page: number) {
  const currentPage = pages.get(userId) || 0;
  pages.set(userId, Math.max(0, currentPage + page));
}

export async function getPage(source: Interaction, userId: string) {
  const page = pages.get(userId) || 0;
  const guilds = [];

  for (const guild of source.client.guilds.cache.values()) {
    const member = guild.members.cache.get(userId) || (await guild.members.fetch(userId).catch(() => null));

    if (member) guilds.push(guild);
  }

  const pageSize = 3;
  const paginated = guilds.slice(page * pageSize, (page + 1) * pageSize);

  const container = new ContainerBuilder();
  const separator = new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small);

  const media = new MediaGalleryBuilder().addItems([
    {
      media: {
        url: 'https://cdn.discordapp.com/attachments/1352392973366857837/1377039218697834557/tumblr_87c587ad6b0e4307afe50b2457454a46_6c7581a1_1280.png',
      },
    },
  ]);

  container.addMediaGalleryComponents(media);

  const guildName = source.client.guilds.cache.get(getSelectedGuild(userId))?.name || t('messages:modmail.seletedGuilds.notGuildSelected');

  const textTop = new TextDisplayBuilder().setContent(
    t('messages:modmail.seletedGuilds.content', {
      guilds: guildName,
      page: page + 1,
      totalPages: Math.ceil(guilds.length / pageSize),
    })
  );

  container.addTextDisplayComponents(textTop).addSeparatorComponents(separator);

  const sections = paginated.map((guild) => {
    const text = new TextDisplayBuilder().setContent(`**${guild.name}** (${guild.id})`);

    const button = new ButtonBuilder()
      .setCustomId(`modmail_select_${guild.id}`)
      .setLabel(t('messages:modmail.seletedGuilds.selectButton'))
      .setStyle(ButtonStyle.Primary)
      .setEmoji('📬');

    return new SectionBuilder().addTextDisplayComponents(text).setButtonAccessory(button);
  });

  container.addSectionComponents(sections);

  const totalPages = Math.ceil(guilds.length / pageSize);
  const navButtons = [];

  if (totalPages > 1) {
    navButtons.push(
      new ButtonBuilder()
        .setCustomId('modmail_prev')
        .setLabel(t('messages:modmail.seletedGuilds.previousPage'))
        .setStyle(ButtonStyle.Primary)
        .setEmoji('◀️')
        .setDisabled(page === 0)
    );

    navButtons.push(
      new ButtonBuilder()
        .setCustomId('modmail_next')
        .setLabel(t('messages:modmail.seletedGuilds.nextPage'))
        .setStyle(ButtonStyle.Primary)
        .setEmoji('▶️')
        .setDisabled(page + 1 >= totalPages)
    );

    const navRow: any = new ActionRowBuilder().addComponents(navButtons);
    container.addSeparatorComponents(separator).addActionRowComponents(navRow);
  }

  const footerText = new TextDisplayBuilder().setContent(t('messages:modmail.seletedGuilds.footerContent'));
  container.addSeparatorComponents(separator).addTextDisplayComponents(footerText);

  return container;
}
