import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Logger, LogLevel } from '../src/logs/logger';
import * as fs from 'fs';
import * as path from 'path';

// Mock the filesystem to avoid actual file writes
const appendFileSyncMock = vi.spyOn(fs, 'appendFileSync').mockImplementation(() => {});

describe('Logger', () => {
  const logDir = path.join(process.cwd(), 'test', 'unit', 'logs');
  let logger: Logger;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    // Ensure the log directory does not exist before each test
    const fullPath = path.join(logDir);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
    logger = new Logger(logDir);
  });

  it('should be instantiated with a given log directory', () => {
    expect(logger).toBeInstanceOf(Logger);
    expect(logger['logDir']).toBe(logDir);
  });

  it('should create the log directory if it does not exist', () => {
    expect(fs.existsSync(logDir)).toBe(true);
  });

  it('should log a message at INFO level', () => {
    logger.log(LogLevel.INFO, 'Test info message');
    const expectedLog = {
      timestamp: expect.any(String),
      level: 'INFO',
      message: 'Test info message',
    };
    expect(appendFileSyncMock).toHaveBeenCalledTimes(1);
    const call = appendFileSyncMock.mock.calls[0];
    const [filePath, content] = call ?? [];
    expect(filePath).toBe(path.join(logDir, `${logger.getDateString()}.log`));
    expect(content).toBe(JSON.stringify(expectedLog) + '\n');
  });

  it('should log a message at WARN level and include metadata', () => {
    const meta = { userId: 123, action: 'test' };
    logger.log(LogLevel.WARN, 'Test warning', meta);
    const expectedLog = {
      timestamp: expect.any(String),
      level: 'WARN',
      message: 'Test warning',
      ...meta,
    };
    expect(appendFileSyncMock).toHaveBeenCalledTimes(1);
    const [, content] = appendFileSyncMock.mock.calls[0];
    const parsed = JSON.parse(content.trim());
    expect(parsed).toEqual(expectedLog);
  });

  it('should output to console with correct level prefix', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.log(LogLevel.ERROR, 'Test error');
    expect(consoleLogSpy).toHaveBeenCalledWith('[ERROR] Test error');
    consoleLogSpy.mockRestore();
  });

  it('should format date correctly in file name', () => {
    // Mock new Date to control the output
    const mockDate = new Date('2023-07-04T12:00:00Z');
    vi.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as Date);
    const loggerWithFixedDate = new Logger(logDir);
    expect(loggerWithFixedDate.getDateString()).toBe('2023-07-04');
    // Restore original Date constructor
    vi.restoreAllMocks();
  });
});