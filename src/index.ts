import { Command } from 'commander';
import { OptimizerAgent } from './agents/optimizer';
import { ResearcherAgent } from './agents/researcher';
import { Provider } from './core/agent-orchestrator';
import { AutomationEngine } from './functions/automation-engine';

// Public API surface for external consumers (UI, services, integrations).
export {
  AgentOrchestrator,
  AgentType,
  Provider as ProviderType,
  type AgentResponse,
  type AgentTask,
  type Context,
  type ToolName
} from './core/agent-orchestrator';
export { LLMProvider, type LLMRequest, type LLMResponse } from './core/llm-provider';
export { ResearcherAgent } from './agents/researcher';
export { OptimizerAgent } from './agents/optimizer';
export { MemoryManager } from './database/memory-manager';
export { Logger, LogLevel } from './logs/logger';
export { AutomationEngine, type AutomationTask } from './functions/automation-engine';

/**
 * Runs the demo orchestrations.
 * @param example Which example to run: "openai", "anthropic" or "all" (default).
 */
export async function runDemo(example: 'openai' | 'anthropic' | 'all' = 'all') {
  console.log('🚀 Synaptix Core - AI Orchestration Framework\n');

  const researcher = new ResearcherAgent();
  const optimizer = new OptimizerAgent();
  const automation = new AutomationEngine();

  const runOpenAI = async () => {
    console.log('📝 Example: Using OpenAI (gpt-4o-mini)');
    const output = await researcher.research(
      'Explica las mejores prácticas de arquitectura de microservicios en 3 puntos clave',
      Provider.OpenAI
    );
    console.log('\n✅ Response:', output);
  };

  const runAnthropic = async () => {
    console.log('📝 Example: Using Anthropic (Claude)');
    const output = await optimizer.optimize(
      'Optimiza este patrón: usar múltiples if-else anidados vs switch vs object lookup',
      Provider.Anthropic
    );
    console.log('\n✅ Response:', output);
  };

  automation.register({ name: 'openai-demo', action: runOpenAI });
  automation.register({ name: 'anthropic-demo', action: runAnthropic });

  try {
    if (example === 'openai') {
      await automation.execute('openai-demo');
    } else if (example === 'anthropic') {
      await automation.execute('anthropic-demo');
    } else {
      await automation.execute('openai-demo');
      console.log('\n' + '='.repeat(80) + '\n');
      await automation.execute('anthropic-demo');
    }
  } catch (err) {
    // Structured error handling – log stack and exit with non‑zero code for CI.
    console.error('❌ Demo failed:', err instanceof Error ? err.message : err);
    if (err instanceof Error && err.stack) console.error(err.stack);
    process.exit(1);
  }
}

// CLI entry point – allows `npm run dev -- --example openai`
if (require.main === module) {
  const program = new Command();
  program
    .name('synaptix-demo')
    .description('Run demo orchestrations with optional example selection')
    .option('-e, --example <type>', 'example to run (openai|anthropic|all)', 'all')
    .action(async (opts) => {
      const ex = opts.example as 'openai' | 'anthropic' | 'all';
      await runDemo(ex);
    });

  program.parseAsync(process.argv).catch((e) => {
    console.error('CLI error:', e);
    process.exit(1);
  });
}
