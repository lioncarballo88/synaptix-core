import { AgentOrchestrator, AgentType, Provider } from './src/core/agent-orchestrator';

async function quickTest() {
  console.log('🧪 Quick Test - Synaptix Core\n');

  const orchestrator = new AgentOrchestrator();
  
  try {
    const response = await orchestrator.process({
      input: 'Hola, explica qué es un AI Agent en 2 líneas',
      agentType: AgentType.General,
      provider: Provider.Anthropic
    });

    console.log('\n✅ Success!');
    console.log('Response:', response.output);
    console.log('\nMetadata:', JSON.stringify(response.metadata, null, 2));
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('\n💡 Tip: Make sure you have set up your .env file with API keys');
  }
}

quickTest();
