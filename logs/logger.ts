import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG'
}

export class Logger {
  private logDir: string;

  constructor(logDir: string = './logs') {
    this.logDir = logDir;
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...metadata
    };

    const logLine = JSON.stringify(logEntry) + '\n';
    const logFile = path.join(this.logDir, `${this.getDateString()}.log`);

    fs.appendFileSync(logFile, logLine);
    console.log(`[${level}] ${message}`);
  }

  private getDateString(): string {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
