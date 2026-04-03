const fs = require('fs');
const path = require('path');
const os = require('os');

function fix(filePath) {
  try {
    let c = fs.readFileSync(filePath, 'utf8');
    if (c.includes('.craft-agent')) {
      c = c.replace(/\.craft-agent/g, '.twopixel');
      fs.writeFileSync(filePath, c);
      console.log('Fixed:', filePath);
    }
  } catch (e) {}
}

function walk(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (f.endsWith('.json') || f.endsWith('.jsonl') || f.endsWith('.md')) fix(p);
    }
  } catch (e) {}
}

walk(path.join(os.homedir(), '.twopixel', 'workspaces'));
