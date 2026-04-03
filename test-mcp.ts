import { spawn } from 'child_process';
import { join } from 'path';

function testMcpServer(scriptPath: string, args: string[] = []) {
  return new Promise((resolve, reject) => {
    console.log(`Testing MCP Server: ${scriptPath}`);
    const child = spawn(args.includes('run') ? 'bun' : 'node', args.includes('run') ? args : [scriptPath, ...args], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdoutData = '';
    let stderrData = '';

    child.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    // Send a standard MCP init message to see if it responds correctly
    const initMessage = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "test-client", version: "1.0.0" }
      }
    }) + '\n';
    
    child.stdin.write(initMessage);

    setTimeout(() => {
      child.kill();
      if (stdoutData.includes('jsonrpc')) {
        console.log(`✅ Success: MCP Server responded with valid JSON-RPC`);
        resolve(true);
      } else {
        console.log(`❌ Failed: No JSON-RPC response.`);
        console.log(`Stdout: ${stdoutData}`);
        console.log(`Stderr: ${stderrData}`);
        resolve(false);
      }
    }, 2000);
  });
}

async function run() {
  // Test 1: Puppeteer
  const puppeteerPath = join(__dirname, 'packages/builtin-mcps/browser-agent/node_modules/.bin/mcp-server-puppeteer');
  await testMcpServer(puppeteerPath);

  // Test 2: Image Generator
  const imageGenPath = join(__dirname, 'packages/builtin-mcps/image-generator/src/index.ts');
  await testMcpServer(imageGenPath, ['run', imageGenPath]);

  // Test 3: CUA Agent
  const cuaPath = join(__dirname, 'packages/builtin-mcps/cua-agent/src/index.ts');
  await testMcpServer(cuaPath, ['run', cuaPath]);

  // Test 4: Office Suite
  const officePath = join(__dirname, 'packages/builtin-mcps/office-suite/src/index.ts');
  await testMcpServer(officePath, ['run', officePath]);

  // Test 5: Database Agent
  const dbPath = join(__dirname, 'packages/builtin-mcps/database-agent/src/index.ts');
  await testMcpServer(dbPath, ['run', dbPath]);

  // Test 6: RAG Agent
  const ragPath = join(__dirname, 'packages/builtin-mcps/rag-agent/src/index.ts');
  await testMcpServer(ragPath, ['run', ragPath]);

  // Test 7: System Agent
  const sysPath = join(__dirname, 'packages/builtin-mcps/system-agent/src/index.ts');
  await testMcpServer(sysPath, ['run', sysPath]);
}

run();
