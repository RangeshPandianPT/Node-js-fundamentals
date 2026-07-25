/**
 * Section 14: Modern ECMAScript Modules (ESM) in Node.js
 * ----------------------------------------------------
 * Demonstrates:
 * 1. Using 'import' instead of 'require()'.
 * 2. Top-level 'await' without needing an async wrapper function.
 * 3. Recreating __dirname and __filename in ESM using 'import.meta.url'.
 * 4. Dynamic imports for conditional/lazy module loading.
 */

// 1. Import named and default exports (file extension .js is required in ESM!)
import AdvancedCalculator, { add, multiply, divide } from './mathUtils.js';

// 2. Recreating __dirname and __filename in ES Modules
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('--- 🌐 Node.js ES Modules (ESM) Demonstration ---');
console.log(`Current File: ${__filename}`);
console.log(`Current Directory: ${__dirname}\n`);

// 3. Using imported utilities
console.log('📊 Basic Math Operations:');
console.log(`add(15, 27) = ${add(15, 27)}`);
console.log(`multiply(8, 9) = ${multiply(8, 9)}`);
console.log(`divide(100, 4) = ${divide(100, 4)}\n`);

console.log('🧮 Using Default Export (AdvancedCalculator):');
const calc = new AdvancedCalculator(4);
const result = calc.power(3).sqrt().getResult(); // (4^3) = 64 -> sqrt(64) = 8
console.log(`(4 ^ 3) -> sqrt() = ${result}\n`);

// 4. Top-level Await & Dynamic Imports
console.log('⏳ Demonstrating Top-Level Await with Dynamic Import...');

try {
  // Dynamically import built-in fs/promises module using await at the top level
  const { readFile } = await import('fs/promises');
  const pkgContent = await readFile(join(__dirname, 'package.json'), 'utf-8');
  const pkgJson = JSON.parse(pkgContent);
  
  console.log(`✅ Successfully loaded package "${pkgJson.name}" dynamically via top-level await!`);
  console.log(`📦 Type configured as: "${pkgJson.type}"\n`);
} catch (err) {
  console.error('Error in dynamic import:', err);
}

console.log('✨ ESM demonstration finished successfully!');
