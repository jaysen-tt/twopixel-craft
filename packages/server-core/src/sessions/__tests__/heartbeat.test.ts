import { SessionManager } from '../SessionManager.ts';
import { ManagedSession } from '../types.ts';
import type { AgentEvent } from '@craft-agent/shared/agent';
import * as os from 'os';
import * as path from 'path';

// Mock dependencies
const testConfigDir = path.join(os.tmpdir(), `craft-test-heartbeat-${Date.now()}`);
process.env.TWOPIXEL_CONFIG_DIR = testConfigDir;

async function runTests() {
  console.log('--- Test 1: Intercept HEARTBEAT_OK ---');
  
  // We don't need a full real SessionManager, we just test the handleSessionEvent logic
  const sm = new SessionManager(testConfigDir);
  
  const mockManaged: any = {
    id: 'test-session',
    messages: [],
    streamingText: '',
    messageQueue: [],
    sessionStatus: 'processing',
    workspace: { id: 'ws1', rootPath: '/tmp/ws1' }
  };
  
  sm['sessions'].set('test-session', mockManaged as any);
  
  // Override sendEvent to track what gets sent
  const eventsSent: any[] = [];
  sm['sendEvent'] = (event: any) => eventsSent.push(event);
  
  // 1. Send text_delta for HEARTBEAT_OK
  sm['processEvent'](mockManaged, { type: 'text_delta', text: 'HEARTBEAT_' } as AgentEvent);
  console.assert(eventsSent.length === 0, 'Should suppress HEARTBEAT_ prefix delta');
  
  sm['processEvent'](mockManaged, { type: 'text_delta', text: 'OK' } as AgentEvent);
  console.assert(eventsSent.length === 0, 'Should suppress HEARTBEAT_OK delta');
  
  // 2. Send text_complete for HEARTBEAT_OK
  sm['processEvent'](mockManaged, { type: 'text_complete', text: 'HEARTBEAT_OK' } as AgentEvent);
  console.assert(eventsSent.length === 0, 'Should suppress text_complete event for HEARTBEAT_OK');
  console.assert(mockManaged.messages.length === 0, 'Should not add HEARTBEAT_OK to messages array');
  
  console.log('Heartbeat Interception OK.');
  
  console.log('\n--- Test 2: Normal Message Pass-through ---');
  mockManaged.streamingText = '';
  
  sm['processEvent'](mockManaged, { type: 'text_delta', text: 'Hello' } as AgentEvent);
  // queueDelta will batch it, we manually flush
  sm['flushDelta']('test-session', 'ws1');
  console.assert(eventsSent.some(e => e.type === 'text_delta' && e.delta === 'Hello'), 'Normal delta should pass through');
  
  sm['processEvent'](mockManaged, { type: 'text_complete', text: 'Hello' } as AgentEvent);
  console.assert(mockManaged.messages.length === 1, 'Normal message should be saved to history');
  console.assert(mockManaged.messages[0].content === 'Hello', 'Message content matches');
  
  console.log('Normal Message OK.');
  
  console.log('Tests Passed!');
}

runTests().catch(console.error);
