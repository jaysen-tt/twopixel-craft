import fs from 'fs';

const enPath = 'apps/electron/src/renderer/i18n/locales/en-US.json';
const zhPath = 'apps/electron/src/renderer/i18n/locales/zh-CN.json';

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const zh = JSON.parse(fs.readFileSync(zhPath, 'utf8'));

function compareKeys(obj1: any, obj2: any, path = '') {
  for (const key in obj1) {
    const currentPath = path ? `${path}.${key}` : key;
    if (obj2[key] === undefined) {
      console.log(`Missing in ZH: ${currentPath}`);
    } else if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
      compareKeys(obj1[key], obj2[key], currentPath);
    }
  }
}

console.log('--- Keys in EN but missing in ZH ---');
compareKeys(en, zh);
