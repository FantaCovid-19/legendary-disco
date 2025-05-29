import { Partials, IntentsBitField, Client, ActivityType, Options, Collection, REST, Routes } from 'discord.js';
import { join } from 'node:path';

import { Logger } from '#utils/Logger';
import { loadStructures } from '#utils/Util';
import { SlashCommand } from './BaseCommand';

export interface ExtendedClient extends Client {
  slashCommands: Collection<string, SlashCommand>;
  commands: Collection<string, string>;
}

export class BotClient extends Client implements ExtendedClient {
  public slashCommands: Collection<string, SlashCommand>;
  public commands: Collection<string, string>;
  public log: Logger;

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

    this.slashCommands = new Collection<string, SlashCommand>();
    this.commands = new Collection<string, string>();
    this.log = new Logger('BotClient');
  }

  private async loadStructures() {
    const slashCommandFolderPath = join(__dirname, '../slashCommands');
    const slashCommandFiles = await loadStructures(slashCommandFolderPath, ['data', 'execute']);

    for (const command of slashCommandFiles) {
      this.slashCommands.set(command.data.name, command);
    }

    const commandFolderPath = join(__dirname, '../commands');
    const commandFiles = await loadStructures(commandFolderPath, ['data', 'execute']);

    for (const command of commandFiles) {
      this.commands.set(command.data.name, command);
    }

    const eventFolderPath = join(__dirname, '../events');
    const eventFiles = await loadStructures(eventFolderPath, ['name', 'execute']);

    for (const event of eventFiles) {
      this[event.once ? 'once' : 'on'](event.name, async (...args) => event.execute(...args));
    }
  }

  public async refreshSlashCommands() {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

    try {
      const data: any = await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!), {
        body: this.slashCommands.map((command) => command.data.toJSON()),
      });

      this.log.info(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
      this.log.error('Error reloading application (/) commands:', error);
    }
  }

  public async init() {
    try {
      this.log.info('Loading structures...');
      await this.loadStructures();
      this.log.info('Structures loaded successfully.');

      this.log.info('Refreshing slash commands...');
      await this.refreshSlashCommands();
      this.log.info('Slash commands refreshed successfully.');

      this.log.info('Connecting to Discord...');
      await this.login(process.env.DISCORD_TOKEN);
      this.log.info('Connected to Discord successfully.');
    } catch (error) {
      this.log.error('Error during initialization:', error);
    }
  }
}
