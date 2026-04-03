import fs from 'fs';
import path from 'path';
import os from 'os';

function fix(filePath) {
  try {
    let c = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    if (c.includes('.craft-agent')) {
      c = c.replace(/\.craft-agent/g, '.twopixel');
      changed = true;
    }
    if (changed) {
      fs.writeFileSync(filePath, c);
      console.log('Fixed config:', filePath);
    }
  } catch (e) {
  }
}

const configPath = path.join(os.homedir(), '.twopixel', 'config.json');
if (fs.existsSync(configPath)) {
  fix(configPath);
}
