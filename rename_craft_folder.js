const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Also replace mcp.craft.do just in case
    const newContent = content
      .replace(/\.craft-agent/g, '.twopixel')
      .replace(/agents\.craft\.do/g, 'agents.2pixel.cn')
      .replace(/mcp\.craft\.do/g, 'mcp.2pixel.cn');
      
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent);
      console.log(`Updated ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
  }
}

function processDirectory(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    
    // Skip build folders
    if (['node_modules', '.git', 'dist', 'const fs = require('"fs"');
const path = require('"  const path = require('pathsD
function replaceInFile(filePath) {
(fu  try {
    const content = fs.reil    co (    // Also replace mcp.craft.do just in case
    const newCosx    const newContent = content
      .replac |      .replace(/\.craft-agent      .replace(/agents\.craft\.do/g, 'agen }
}

co      .replace(/mcp\.craft\.do/g, 'mcp.2pixel.cn');
   pr      
    if (content !== newContent) {
      fs.writeFile_    i_folder.js