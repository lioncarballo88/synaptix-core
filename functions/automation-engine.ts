export interface AutomationTask {
  name: string;
  schedule?: string;
  action: () => Promise<void>;
}

export class AutomationEngine {
  private tasks: Map<string, AutomationTask> = new Map();

  register(task: AutomationTask): void {
    this.tasks.set(task.name, task);
    console.log(`[Automation] Registered task: ${task.name}`);
  }

  async execute(taskName: string): Promise<void> {
    const task = this.tasks.get(taskName);
    if (!task) {
      throw new Error(`Task ${taskName} not found`);
    }

    console.log(`[Automation] Executing: ${taskName}`);
    await task.action();
    console.log(`[Automation] Completed: ${taskName}`);
  }

  list(): string[] {
    return Array.from(this.tasks.keys());
  }
}
