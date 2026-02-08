#!/usr/bin/env node
/**
 * batch-generate.js - Batch generate multiple videos from scripts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse arguments
const args = process.argv.slice(2);
let scriptDir = '';
let outputDir = './output';
let concurrency = 1;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--scripts' && args[i + 1]) {
    scriptDir = args[++i];
  } else if (args[i] === '--output' && args[i + 1]) {
    outputDir = args[++i];
  } else if (args[i] === '--concurrency' && args[i + 1]) {
    concurrency = parseInt(args[++i]);
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
Usage: node batch-generate.js --scripts <dir> --output <dir> [options]

Arguments:
  --scripts      Directory containing script JSON files (required)
  --output       Output directory (default: ./output)
  --concurrency  Number of parallel jobs (default: 1)

Example:
  node batch-generate.js \\
    --scripts ./scripts \\
    --output ./videos \\
    --concurrency 2
    `);
    process.exit(0);
  }
}

// Validate arguments
if (!scriptDir) {
  console.error('Error: --scripts is required');
  process.exit(1);
}

console.log('🎬 Batch video generation...');
console.log(`   Scripts: ${scriptDir}`);
console.log(`   Output: ${outputDir}`);
console.log(`   Concurrency: ${concurrency}`);
console.log('');

// Check if script directory exists
if (!fs.existsSync(scriptDir)) {
  console.error(`Error: Script directory not found: ${scriptDir}`);
  process.exit(1);
}

// Find all JSON files in script directory
const scriptFiles = fs.readdirSync(scriptDir)
  .filter(f => f.endsWith('.json') && f !== 'package.json');

if (scriptFiles.length === 0) {
  console.error('Error: No script JSON files found in directory');
  process.exit(1);
}

console.log(`   Found ${scriptFiles.length} script(s)`);
console.log('');

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate videos
const results = [];
let completed = 0;

const generateVideo = async (scriptFile, index) => {
  const scriptPath = path.join(scriptDir, scriptFile);
  const outputFile = path.join(outputDir, scriptFile.replace('.json', '.mp4'));

  console.log(`[${index + 1}/${scriptFiles.length}] Processing: ${scriptFile}`);

  try {
    execSync(
      `node /root/clawd/skills/remotion-excalidraw-tts/scripts/generate-video.js --project /tmp/batch-${index} --script "${scriptPath}" --output "${outputFile}"`,
      { stdio: 'inherit' }
    );

    const stats = fs.existsSync(outputFile) ? fs.statSync(outputFile) : null;
    const result = {
      script: scriptFile,
      output: outputFile,
      success: stats !== null,
      size: stats ? stats.size : 0,
    };

    console.log(`[${index + 1}/${scriptFiles.length}] ${result.success ? '✅' : '❌'} ${scriptFile}`);
    return result;
  } catch (error) {
    console.log(`[${index + 1}/${scriptFiles.length}] ❌ ${scriptFile} - ${error.message}`);
    return {
      script: scriptFile,
      output: outputFile,
      success: false,
      error: error.message,
    };
  }
};

// Process scripts sequentially for simplicity (parallel would require cluster)
async function processAll() {
  for (let i = 0; i < scriptFiles.length; i++) {
    const result = await generateVideo(scriptFiles[i], i);
    results.push(result);
  }
}

processAll().then(() => {
  console.log('');
  console.log('═════════════════════════════════════');
  console.log('Batch generation complete!');
  console.log('═════════════════════════════════════');
  console.log('');

  // Summary
  const success = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Success: ${success.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);

  if (success.length > 0) {
    const totalSize = success.reduce((sum, r) => sum + r.size, 0);
    console.log(`📊 Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  }

  // Failed list
  if (failed.length > 0) {
    console.log('');
    console.log('Failed scripts:');
    failed.forEach(f => {
      console.log(`  - ${f.script}: ${f.error || 'Unknown error'}`);
    });
  }

  // Save summary
  const summaryPath = path.join(outputDir, 'batch-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    total: results.length,
    success: success.length,
    failed: failed.length,
    results: results,
  }, null, 2));

  console.log('');
  console.log(`📋 Summary saved to: ${summaryPath}`);
}).catch(error => {
  console.error('Error during batch generation:', error);
  process.exit(1);
});
