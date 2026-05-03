import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AutomationEngine, AutomationTask } from '../src/functions/automation-engine';

describe('AutomationEngine', () => {
  let engine: AutomationEngine;

  beforeEach(() => {
    engine = new AutomationEngine();
  });

  it('should be instantiated', () => {
    expect(engine).toBeInstanceOf(AutomationEngine);
  });

  it('should register a task', () => {
    const task: AutomationTask = {
      name: 'test-task',
      action: vi.fn().mockResolvedValue(undefined),
    };

    engine.register(task);

    const registered = engine.list();
    expect(registered).toContain('test-task');
    expect(engine.tasks.size).toBe(1);
  });

  it('should throw when executing a non‑existent task', async () => {
    await expect(engine.execute('missing-task')).rejects.toThrow(
      /Task missing-task not found/
    );
  });

  it('should execute a registered task', async () => {
    const task: AutomationTask = {
      name: 'exec-task',
      action: vi.fn().mockResolvedValue(undefined),
    };

    engine.register(task);
    await engine.execute('exec-task');

    expect(task.action).toHaveBeenCalledTimes(1);
  });

  it('should list all registered task names', () => {
    const task1: AutomationTask = { name: 'first', action: vi.fn() };
    const task2: AutomationTask = { name: 'second', action: vi.fn() };

    engine.register(task1);
    engine.register(task2);

    const list = engine.list();
    expect(list).toContain('first');
    expect(list).toContain('second');
    expect(list.length).toBe(2);
  });
});