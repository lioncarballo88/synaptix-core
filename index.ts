import { AgentOrchestrator } from './core/agent-orchestrator';
// The ResearcherAgent import was unused; removed to keep the module clean.
// import { ResearcherAgent } from './agents/researcher';
import { Command } from 'commander';

/**
 * Runs the demo orchestrations.
 * @param example Which example to run: "openai", "anthropic" or "all" (default).
 */
export async function runDemo(example: 'openai' | 'anthropic' | 'all' = 'all') {
  console.log('🚀 Synaptix Core - AI Orchestration Framework\n');

  const orchestrator = new AgentOrchestrator();

  const runOpenAI = async () => {
    console.log('📝 Example: Using OpenAI (gpt-4o-mini)');
    const response = await orchestrator.process({
      input: 'Explica las mejores prácticas de arquitectura de microservicios en 3 puntos clave',
      agentType: 'researcher',
      provider: 'openai',
    });
    console.log('\n✅ Response:', response.output);
    console.log('🔧 Tools used:', response.toolsUsed);
    console.log('📊 Metadata:', response.metadata);
  };

  const runAnthropic = async () => {
    console.log('📝 Example: Using Anthropic (Claude)');
    const response = await orchestrator.process({
      input: 'Optimiza este patrón: usar múltiples if-else anidados vs switch vs object lookup',
      agentType: 'optimizer',
      provider: 'anthropic',
    });
    console.log('\n✅ Response:', response.output);
    console.log('🔧 Tools used:', response.toolsUsed);
    console.log('📊 Metadata:', response.metadata);
  };

  try {
    if (example === 'openai') {
      await runOpenAI();
    } else if (example === 'anthropic') {
      await runAnthropic();
    } else {
      await runOpenAI();
      console.log('\n' + '='.repeat(80) + '\n');
      await runAnthropic();
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
