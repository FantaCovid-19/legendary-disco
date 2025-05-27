import { Partials, IntentsBitField, Client, ActivityType, Options, Collection, REST, Routes } from 'discord.js';
import { fileURLToPath, URL } from 'node:url';

import { Logger } from '#utils/Logger.js';
import { loadStructures } from '#utils/Util.js';

export default class ExtendedClient extends Client {
  constructor() {
    super({
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildWebhooks,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.DirectMessages,
      ],
      partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.GuildScheduledEvent,
        Partials.Message,
        Partials.Reaction,
        Partials.User,
        Partials.ThreadMember,
      ],
      allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
      rest: { retries: 3, timeout: 30000 },
      failIfNotExists: false,
      presence: {
        activities: [{ name: 'DM | para abrir un ticket', type: ActivityType.Playing }],
        status: 'dnd',
      },
      makeCache: Options.cacheWithLimits({
        MessageManager: 1024,
        GuildMessageManager: 1024,
      }),
    });

    this.slashCommands = new Collection();
    this.commands = new Collection();

    this.log = new Logger('ExtendedClient');
  }

  /**
   * Load all structures (commands and events) from the specified folder.
   * @returns {Promise<void>}
   * @private
   */
  async loadStructures() {
    const slashCommandFolderPath = fileURLToPath(new URL('../slashCommands', import.meta.url));
    const slashCommandsFiles = await loadStructures(slashCommandFolderPath, ['data', 'execute']);

    for (const command of slashCommandsFiles) {
      this.slashCommands.set(command.data.name, command);
    }

    const commandFolderPath = fileURLToPath(new URL('../commands', import.meta.url));
    const commandFiles = await loadStructures(commandFolderPath, ['name', 'execute']);

    for (const command of commandFiles) {
      this.commands.set(command.name, command);
    }

    const eventFolderPath = fileURLToPath(new URL('../events', import.meta.url));
    const eventFiles = await loadStructures(eventFolderPath, ['name', 'execute']);

    for (const event of eventFiles) {
      this[event.once ? 'once' : 'on'](event.name, async (...args) => event.execute(...args));
    }
  }

  /**
   * Refresh slash commands in the guild.
   * @returns {Promise<void>}
   */
  async refreshSlashCommands() {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
      const data = await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), {
        body: this.slashCommands.map((command) => command.data.toJSON()),
      });

      this.log.info(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (err) {
      this.log.error('Failed to refresh slash commands', err);
    }
  }

  /**
   * Start the bot by loading modules, refreshing slash commands, and logging in to Discord.
   * @returns {Promise<void>}
   */
  async start() {
    try {
      this.log.info('Loading modules...');
      await this.loadStructures();
      this.log.info('Modules loaded!');

      this.log.info('Refreshing slash commands...');
      await this.refreshSlashCommands();
      this.log.info('Slash commands refreshed!');

      this.log.info('Connecting to Discord...');
      await this.login(process.env.DISCORD_TOKEN).catch(() => this.log.fatal('Failed to login'));
      this.log.info('Connected to Discord!');
    } catch (err) {
      this.log.fatal('An error occurred while starting the bot:', err);
    }
  }
}
