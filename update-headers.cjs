const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OLD_HEADER = `/**
 * Note: This file has been modified by TwoPixel Team (2026).
 * Original project: Craft Agents OSS (https://github.com/craftdocs/craft-agents)
 * Licensed under the Apache License, Version 2.0.
 */`;

const NEW_HEADER = `/**
 * Note: This file has been modified by TwoPixel Team (2026).
 * (Not the official Craft version / 非 Craft 官方原版)
 * Original project: Craft Agents OSS (https://github.com/craftdocs/craft-agents)
 * Licensed under the Apache License, Version 2.0.
 */`;

function findFilesWithHeader(dir) {
    let results = [];
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'release') continue;
        
        if (fs.statSync(fullPath).isDirectory()) {
            results = results.concat(findFilesWithHeader(fullPath));
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(OLD_HEADER)) {
                results.push(fullPath);
            }
        }
    }
    return results;
}

const files = findFilesWithHeader('.');
console.log(`Found ${files.length} files to update.`);

for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const newContent = content.replace(OLD_HEADER, NEW_HEADER);
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated: ${file}`);
}
