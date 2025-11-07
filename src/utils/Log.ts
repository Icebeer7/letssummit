import { safeStringify } from './StringUtils';

export enum LogLevel {
  VERBOSE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
}

export interface LogPrinter {
  print: (level: LogLevel, message: unknown, ...optionalParams: unknown[]) => void;
}

let alternatePrinter: LogPrinter | undefined;
const TraceSymbol = Symbol('tracelog');

export function setAlternateLogPrinter(printer: LogPrinter | undefined) {
  alternatePrinter = printer;
}
export class Logger {
  level: LogLevel = __DEV__ ? LogLevel.DEBUG : LogLevel.ERROR;

  print(level: LogLevel, message: unknown, ...optionalParams: unknown[]) {
    if (this.level > level) {
      return;
    }

    const callerContext = this.getCallerContextDesc(level);
    let logMessage = `${callerContext}${this.getMessageString(message)}`;

    switch (level) {
      case LogLevel.VERBOSE:
        console.log(logMessage, ...optionalParams);
        break;
      case LogLevel.DEBUG:
        console.debug(logMessage, ...optionalParams);
        break;
      case LogLevel.INFO:
        console.info(logMessage, ...optionalParams);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, ...optionalParams);
        break;
      case LogLevel.ERROR: {
        let logTraces: boolean = false;
        if (
          message &&
          typeof message === 'object' &&
          'content' in message &&
          'type' in message &&
          message.type === TraceSymbol
        ) {
          logTraces = true;
          message = message.content;
        }
        logMessage = `${callerContext}${this.getMessageString(message)}`;

        if (logTraces) {
          console.trace(logMessage, ...optionalParams);
        } else {
          console.error(logMessage, ...optionalParams);
        }
        break;
      }
    }

    alternatePrinter?.print(level, logMessage, ...optionalParams);
  }

  v(message: unknown, ...optionalParams: unknown[]) {
    this.print(LogLevel.VERBOSE, message, ...optionalParams);
  }

  i(message: unknown, ...optionalParams: unknown[]) {
    this.print(LogLevel.INFO, message, ...optionalParams);
  }

  d(message: unknown, ...optionalParams: unknown[]) {
    this.print(LogLevel.DEBUG, message, ...optionalParams);
  }

  w(message: unknown, ...optionalParams: unknown[]) {
    this.print(LogLevel.WARN, message, ...optionalParams);
  }

  e(message: unknown, ...optionalParams: unknown[]) {
    this.print(LogLevel.ERROR, message, ...optionalParams);
  }

  trace(message: unknown, ...optionalParams: unknown[]) {
    this.print(LogLevel.ERROR, { type: TraceSymbol, content: message }, ...optionalParams);
  }

  getCallerContextDesc(level: LogLevel, tags: string[] = []) {
    const timestamp = new Date().toISOString().replace('T', ' ').replace('Z', '');

    return `[${Logger.levelSymbol(level)}] ${timestamp}${tags.length > 0 ? `tags: ${tags.toString()} ` : ' '}: `;
  }

  groupCollapsed(level: LogLevel, message: unknown, ...optionalParams: unknown[]) {
    if (this.level <= level) {
      const callerContext = this.getCallerContextDesc(level);
      const logMessage = `${callerContext}${this.getMessageString(message)}`;
      console.groupCollapsed(logMessage, ...optionalParams);
      alternatePrinter?.print(level, '▼' + logMessage, ...optionalParams);
    }
  }

  groupEnd(level: LogLevel) {
    if (this.level <= level) {
      console.groupEnd();
      alternatePrinter?.print(level, '▲');
    }
  }

  getMessageString(message: unknown): string {
    if (!message) {
      return '';
    } else if (typeof message === 'function') {
      return this.getMessageString(message());
    } else if (typeof message === 'object') {
      return safeStringify(message);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      return message.toString();
    }
  }

  static getLevelForDescription(levelStr: string): LogLevel | undefined {
    switch (levelStr) {
      case 'VERBOSE':
        return LogLevel.VERBOSE;
      case 'DEBUG':
        return LogLevel.DEBUG;
      case 'INFO':
        return LogLevel.INFO;
      case 'WARN':
        return LogLevel.WARN;
      case 'ERROR':
        return LogLevel.ERROR;
    }
  }

  static levelDescription(logLevel: LogLevel) {
    switch (logLevel) {
      case LogLevel.VERBOSE:
        return 'VERBOSE';
      case LogLevel.DEBUG:
        return 'DEBUG';
      case LogLevel.INFO:
        return 'INFO';
      case LogLevel.WARN:
        return 'WARN';
      case LogLevel.ERROR:
        return 'ERROR';
    }
  }

  static levelSymbol(logLevel: LogLevel) {
    switch (logLevel) {
      case LogLevel.VERBOSE:
        return ' 🔉 ';
      case LogLevel.DEBUG:
        return ' 🛠 ';
      case LogLevel.INFO:
        return ' ℹ️ ';
      case LogLevel.WARN:
        return ' ⚠️ ';
      case LogLevel.ERROR:
        return ' ❌ ';
    }
  }

  static getLogLevelFromSymbol(symbol: string): LogLevel | undefined {
    switch (symbol.trim()) {
      case '🔉':
        return LogLevel.VERBOSE;
      case '🛠':
        return LogLevel.DEBUG;
      case 'ℹ️':
        return LogLevel.INFO;
      case '⚠️':
        return LogLevel.WARN;
      case '❌':
        return LogLevel.ERROR;
      default:
        return undefined;
    }
  }
}

export const Log = new Logger();
