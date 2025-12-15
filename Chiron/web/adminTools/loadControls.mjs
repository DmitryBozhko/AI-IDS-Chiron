#!/usr/bin/env node
import { readFile } from 'fs/promises';

// Read the JSON file in the same folder and export a `controls` variable.

const path = new URL('./cmmc-l2.controls.json', import.meta.url);
const text = await readFile(path, 'utf-8');
export const controls = JSON.parse(text);

console.log(`Loaded ${Array.isArray(controls) ? controls.length : Object.keys(controls).length} controls`);

// Keep a small interactive helper when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // show first control id/title if present
  if (Array.isArray(controls) && controls.length > 0) {
    console.log('First control:', controls[0].id ?? controls[0].code ?? controls[0].title ?? controls[0]);
  }
}
