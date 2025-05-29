enum LogLevel {
  debug = 0,
  info = 1,
  warn = 2,
  error = 3,
  fatal = 4,
}

enum Colors {
  blue = '\x1b[34m',
  white = '\x1b[37m',
  red = '\x1b[31m',
  bold_red = '\x1b[1;31m',
  green = '\x1b[32m',
  yellow = '\x1b[33m',
  purple = '\x1b[35m',
  reset = '\x1b[0m',
}

const colorMap: Record<LogLevel, string> = {
  [LogLevel.debug]: Colors.white,
  [LogLevel.info]: Colors.blue,
  [LogLevel.warn]: Colors.yellow,
  [LogLevel.error]: Colors.red,
  [LogLevel.fatal]: Colors.bold_red,
};

const labelMap: Record<LogLevel, string> = {
  [LogLevel.debug]: 'DEBUG',
  [LogLevel.info]: 'INFO',
  [LogLevel.warn]: 'WARN',
  [LogLevel.error]: 'ERROR',
  [LogLevel.fatal]: 'FATAL',
};

export class Logger {
  public prefix: string;

  constructor(prefix: string) {
    this.prefix = `[ ${prefix} ]`;
  }

  private log(level: LogLevel, content: string, guildId?: string | null): void {
    const logTime = new Date().toISOString();
    const logFormat = `${colorMap[level]}[ ${labelMap[level]} - ${logTime} ] ${Colors.reset}`;
    const logGuild = guildId ? ` [ Guild: ${guildId} ]` : '-';
    const logMessage = `${logFormat} ${logGuild} ${this.prefix} ${content}`;

    console.log(logMessage);
  }

  public debug(content: string, guildId?: string | null): void {
    this.log(LogLevel.debug, content, guildId);
  }

  public info(content: string, guildId?: string | null): void {
    this.log(LogLevel.info, content, guildId);
  }

  public warn(content: string, guildId?: string | null): void {
    this.log(LogLevel.warn, content, guildId);
  }

  public error(content: string, error: Error | unknown, guildId?: string | null): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? `\nStack: ${error.stack}` : '';

    this.log(LogLevel.error, `${content} - ${errorMessage} ${errorStack}`, guildId);
  }

  public fatal(content: string, error: Error | unknown, guildId?: string | null): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? `\nStack: ${error.stack}` : '';

    this.log(LogLevel.fatal, `${content} - ${errorMessage} ${errorStack}`, guildId);
  }
}
