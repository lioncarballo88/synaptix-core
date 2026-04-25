import { AgentOrchestrator } from './core/agent-orchestrator';
import { ResearcherAgent } from './agents/researcher';
import { OptimizerAgent } from './agents/optimizer';

async function main() {
  console.log('🚀 Synaptix Core - AI Orchestration Framework\n');

  // Ejemplo 1: Uso directo del orquestador
  const orchestrator = new AgentOrchestrator();
  
  const response = await orchestrator.process({
    input: 'Explica las mejores prácticas de arquitectura de microservicios',
    agentType: 'researcher'
  });

  console.log('📊 Response:', response.output);
  console.log('🔧 Tools used:', response.toolsUsed);
  console.log('✅ Confidence:', response.confidence);
  console.log('\n---\n');

  // Ejemplo 2: Uso de agente especializado
  const researcher = new ResearcherAgent();
  const researchResult = await researcher.research('AI Agents en producción');
  
  console.log('🔍 Research Result:', researchResult);
}

main().catch(console.error);
