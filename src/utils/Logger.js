const LogLevel = {
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  fatal: 5,
};

const Colors = {
  blue: '\x1b[34m',
  white: '\x1b[37m',
  red: '\x1b[31m',
  bold_red: '\x1b[31;1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  purple: '\x1b[35m',
  reset: '\x1b[0m',
};

const colorMap = {
  [LogLevel.debug]: Colors.white,
  [LogLevel.info]: Colors.blue,
  [LogLevel.warn]: Colors.yellow,
  [LogLevel.error]: Colors.red,
  [LogLevel.fatal]: Colors.bold_red,
};

const labelMap = {
  [LogLevel.debug]: 'DEBUG',
  [LogLevel.info]: 'INFO',
  [LogLevel.warn]: 'WARN',
  [LogLevel.error]: 'ERROR',
  [LogLevel.fatal]: 'FATAL',
};

export class Logger {
  /**
   * @param {string} prefix
   */
  constructor(prefix) {
    this.prefix = `[ ${prefix} ]`;
  }

  /**
   * Logs a message to the console with a specific log level and optional guild ID.
   *
   * @param {LogLevel} level
   * @param {string} content
   * @param {string} [guildId]
   * @private
   */
  log(level, content, guildId = null) {
    const logFormat = `${colorMap[level]}[ ${labelMap[level]} - ${new Date().toLocaleString()} ]${Colors.reset}`;
    const logGuild = guildId ? ` [ Guild Id: ${guildId} ]` : '-';
    const logContent = `${logGuild} ${this.prefix} ${content}`;

    console.log(`${logFormat} ${logContent}`);
  }

  /**
   * Logs a debug message to the console with a specific log level and optional guild ID.
   *
   * @param {string} content - The content of the debug message.
   * @param {string} [guildId] - The ID of the guild (optional).
   */
  debug(content, guildId = null) {
    this.log(LogLevel.debug, content, guildId);
  }

  /**
   * Logs an informational message to the console with a specific log level and optional guild ID.
   *
   * @param {string} content - The content of the informational message.
   * @param {string} [guildId] - The ID of the guild (optional).
   */
  info(content, guildId = null) {
    this.log(LogLevel.info, content, guildId);
  }

  /**
   * Logs a warning message to the console with a specific log level and optional guild ID.
   *
   * @param {string} content - The content of the warning message.
   * @param {Error} [err] - The error object.
   * @param {string} [guildId] - The ID of the guild (optional).
   */
  warn(content, err, guildId = null) {
    this.log(LogLevel.warn, err ? `${content}\n - ${err.message}` : content, guildId);
  }

  /**
   * Logs an error message to the console with a specific log level and optional guild ID.
   *
   * @param {string} content - The content of the error message.
   * @param {Error} [err] - The error object.
   * @param {string} [guildId] - The ID of the guild (optional).
   */
  error(content, err, guildId = null) {
    this.log(LogLevel.error, err ? `${content}\n - ${err.message}` : content, guildId);
  }

  /**
   * Logs a fatal error message to the console with a specific log level and optional guild ID.
   *
   * @param {string} content - The content of the error message.
   * @param {Error} [err] - The error object.
   * @param {string} [guildId] - The ID of the guild (optional).
   */
  fatal(content, err, guildId = null) {
    this.log(LogLevel.fatal, err ? `${content}\n - ${err.message}` : content, guildId);
  }
}
