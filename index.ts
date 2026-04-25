import { AgentOrchestrator } from './core/agent-orchestrator';
import { ResearcherAgent } from './agents/researcher';

async function main() {
  console.log('🚀 Synaptix Core - AI Orchestration Framework\n');

  const orchestrator = new AgentOrchestrator();
  
  console.log('📝 Example 1: Using OpenAI (gpt-4o-mini)');
  const response1 = await orchestrator.process({
    input: 'Explica las mejores prácticas de arquitectura de microservicios en 3 puntos clave',
    agentType: 'researcher',
    provider: 'openai'
  });

  console.log('\n✅ Response:', response1.output);
  console.log('🔧 Tools used:', response1.toolsUsed);
  console.log('📊 Metadata:', response1.metadata);
  console.log('\n' + '='.repeat(80) + '\n');

  console.log('📝 Example 2: Using Anthropic (Claude)');
  const response2 = await orchestrator.process({
    input: 'Optimiza este patrón: usar múltiples if-else anidados vs switch vs object lookup',
    agentType: 'optimizer',
    provider: 'anthropic'
  });

  console.log('\n✅ Response:', response2.output);
  console.log('🔧 Tools used:', response2.toolsUsed);
  console.log('📊 Metadata:', response2.metadata);
}

main().catch(console.error);
