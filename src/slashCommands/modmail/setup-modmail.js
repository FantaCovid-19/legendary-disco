import { ChannelType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { t } from 'i18next';

import { Logger } from '#utils/Logger.js';
import ModmailConfig from '#models/ModmailConfig.js';

const logger = new Logger('SetupModmailCommand');

export default class SetupModmailCommand {
  data = new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Setup modmail for the server')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('modmail')
        .setDescription('Setup modmail for the server')
        .addRoleOption((option) => option.setName('role').setDescription('The role to ping when a new modmail thread is created').setRequired(true))
    );

  /**
   * @param {import('discord.js').CommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const role = interaction.options.getRole('role');

    try {
      let config = await ModmailConfig.findOne({ where: { guildId: interaction.guild.id } });

      if (config) return await interaction.editReply({ content: t('commands:modmailSetup.modmailSetupExists'), flags: MessageFlags.Ephemeral });

      await interaction.editReply({
        content: t('commands:modmailSetup.modmailSetupInProgress'),
        flags: MessageFlags.Ephemeral,
      });

      const category = await interaction.guild.channels.create({
        name: 'Modmail',
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: role.id,
            allow: [PermissionFlagsBits.ViewChannel],
          },
        ],
      });

      const logsChannel = await interaction.guild.channels.create({
        name: 'modmail-logs',
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: role.id,
            allow: [PermissionFlagsBits.ViewChannel],
          },
        ],
      });

      config = await ModmailConfig.create({
        guildId: interaction.guild.id,
        categoryId: category.id,
        logChannelId: logsChannel.id,
        modRoleId: role.id,
      });

      await interaction.editReply({
        content: t('commands:modmailSetup.modmailSetupSuccess', {
          supportCategory: `<#${category.id}>`,
          modmailLogsChannel: `<#${logsChannel.id}>`,
          supportRole: `<@&${role.id}>`,
        }),
        flags: MessageFlags.Ephemeral,
      });
    } catch (err) {
      logger.error('Error while setting up modmail', err);
    }
  }
}
