import { addRule, getRules, addFact, getFacts, addEpisode, getEpisodes, ensureMemoryDir, addHeartbeatTask, getHeartbeatTasks } from '../memory-store.ts';
import { formatPreferencesForPrompt } from '../preferences.ts';
import { extractAndStoreMemory } from '../../agent/memory-extraction.ts';
import type { RecoveryMessage } from '../../agent/core/index.ts';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Override CONFIG_DIR for tests
const testConfigDir = path.join(os.tmpdir(), `craft-test-memory-${Date.now()}`);
process.env.TWOPIXEL_CONFIG_DIR = testConfigDir;

console.log(`[Test] Using temp config dir: ${testConfigDir}`);

async function runTests() {
  console.log('--- Test 1: ensureMemoryDir & Store CRUD ---');
  ensureMemoryDir();
  
  const rule = addRule('Always use spaces instead of tabs');
  console.log('Added Rule:', rule);
  
  const fact = addFact('User is working on a React project');
  console.log('Added Fact:', fact);
  
  const episode = addEpisode('sess_123', 'Fixed a layout bug in the AppShell component.');
  console.log('Added Episode:', episode);
  
  const hbTask = addHeartbeatTask('Check project error logs every 30 minutes');
  console.log('Added Heartbeat Task:', hbTask);

  const rules = getRules();
  const facts = getFacts();
  const episodes = getEpisodes();
  const hbTasks = getHeartbeatTasks();
  
  console.assert(rules.length === 1, 'Should have 1 rule');
  console.assert(facts.length === 1, 'Should have 1 fact');
  console.assert(episodes.length === 1, 'Should have 1 episode');
  console.assert(hbTasks.length === 1, 'Should have 1 heartbeat task');
  console.log('Store CRUD OK.');

  console.log('\n--- Test 2: formatPreferencesForPrompt ---');
  const prompt = formatPreferencesForPrompt();
  console.log('Generated Prompt:\n', prompt);
  console.assert(prompt.includes('Always use spaces instead of tabs'), 'Prompt should include the rule');
  console.assert(prompt.includes('User is working on a React project'), 'Prompt should include the fact');
  console.assert(prompt.includes('Fixed a layout bug'), 'Prompt should include the episode');
  console.log('Format Prompt OK.');

  console.log('\n--- Test 3: extractAndStoreMemory (Mocked LLM) ---');
  const messages: RecoveryMessage[] = [
    { type: 'user', content: 'Remember that I prefer using Bun over NPM.' }
  ];
  
  const mockRunCompletion = async (prompt: string): Promise<string | null> => {
    // Return a mocked JSON response that the LLM would generate
    return JSON.stringify({
      rules: ["Prefer using Bun over NPM"],
      facts: [],
      episodeSummary: "User stated preference for Bun package manager."
    });
  };

  await extractAndStoreMemory('sess_456', messages, mockRunCompletion);
  
  const updatedRules = getRules();
  const updatedEpisodes = getEpisodes();
  
  console.log('Updated Rules:', updatedRules.map(r => r.content));
  console.log('Updated Episodes:', updatedEpisodes.map(e => e.summary));
  
  console.assert(updatedRules.length === 2, 'Should have 2 rules now');
  console.assert(updatedEpisodes.length === 2, 'Should have 2 episodes now');
  console.assert(updatedRules[1]?.content === 'Prefer using Bun over NPM', 'New rule should be added');
  console.log('Extract and Store OK.');

  // Cleanup
  console.log('\nCleaning up temp directory...');
  fs.rmSync(testConfigDir, { recursive: true, force: true });
  console.log('Tests Passed Successfully!');
}

runTests().catch(console.error);
