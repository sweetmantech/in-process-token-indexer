#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Recursively find all .ts files
function findTsFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (
      stat.isDirectory() &&
      !filePath.includes('node_modules') &&
      !filePath.includes('dist')
    ) {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const tsFiles = findTsFiles(projectRoot);
let totalFixed = 0;

for (const filePath of tsFiles) {
  let content = readFileSync(filePath, 'utf-8');
  let modified = false;

  // Match relative imports (starting with ./ or ../)
  // Skip if already has .js extension or is importing from node_modules
  const importRegex = /from\s+['"](\.\.?\/[^'"]+)['"]/g;

  content = content.replace(importRegex, (match, importPath) => {
    // Skip if already has .js extension
    if (importPath.endsWith('.js')) {
      return match;
    }

    // Skip if it's importing a type-only (we'll handle those separately if needed)
    // Add .js extension
    const newImportPath = importPath + '.js';
    modified = true;
    totalFixed++;
    return match.replace(importPath, newImportPath);
  });

  // Also handle dynamic imports
  const dynamicImportRegex = /import\s*\(\s*['"](\.\.?\/[^'"]+)['"]\s*\)/g;
  content = content.replace(dynamicImportRegex, (match, importPath) => {
    if (importPath.endsWith('.js')) {
      return match;
    }
    const newImportPath = importPath + '.js';
    modified = true;
    totalFixed++;
    return match.replace(importPath, newImportPath);
  });

  if (modified) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated: ${filePath.replace(projectRoot + '/', '')}`);
  }
}

console.log(`\nTotal imports updated: ${totalFixed}`);
