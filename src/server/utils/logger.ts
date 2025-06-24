/**
 * Simple logger utility for server-side logging
 * In a production environment, you might want to replace this
 * with a more robust logging solution like Winston or Pino
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: unknown;
}

const getPrefix = (level: LogLevel) => {
  switch (level) {
    case 'info':
      return '[INFO]';
    case 'warn':
      return '[WARN]';
    case 'error':
      return '[ERROR]';
    case 'debug':
      return '[DEBUG]';
    default:
      return '[LOG]';
  }
};

export const logger = {
  log: (level: LogLevel, message: string, data?: unknown) => {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data,
    };

    const prefix = getPrefix(level);
    const timestamp = entry.timestamp.toISOString();

    if (process.env.NODE_ENV === 'development' || level === 'error') {
      if (data) {
        console[level](`${prefix} ${timestamp} ${message}`, data);
      } else {
        console[level](`${prefix} ${timestamp} ${message}`);
      }
    }

    // In a production environment, you might want to send logs
    // to a logging service or database
    return entry;
  },

  info: (message: string, data?: unknown) => logger.log('info', message, data),
  warn: (message: string, data?: unknown) => logger.log('warn', message, data),
  error: (message: string, data?: unknown) => logger.log('error', message, data),
  debug: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      return logger.log('debug', message, data);
    }
    return null;
  },
};
