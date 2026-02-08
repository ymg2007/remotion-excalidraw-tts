#!/usr/bin/env node
/**
 * generate-subtitles.js - Generate subtitle file from video script
 */

const fs = require('fs');

// Parse arguments
const args = process.argv.slice(2);
let scriptFile = '';
let outputFile = '';
let format = 'srt';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--script' && args[i + 1]) {
    scriptFile = args[++i];
  } else if (args[i] === '--output' && args[i + 1]) {
    outputFile = args[++i];
  } else if (args[i] === '--format' && args[i + 1]) {
    format = args[++i];
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
Usage: node generate-subtitles.js --script <path> --output <path> [options]

Arguments:
  --script      Script JSON file (required)
  --output       Output subtitle file (required)
  --format       Subtitle format: srt, vtt, ass (default: srt)

Example:
  node generate-subtitles.js \\
    --script ./script.json \\
    --output ./subtitles.srt

    `);
    process.exit(0);
  }
}

// Validate arguments
if (!scriptFile || !outputFile) {
  console.error('Error: --script and --output are required');
  process.exit(1);
}

console.log('📝 Generating subtitles...');
console.log(`   Script: ${scriptFile}`);
console.log(`   Output: ${outputFile}`);
console.log(`   Format: ${format}`);
console.log('');

// Load and parse script
let script;
try {
  const scriptContent = fs.readFileSync(scriptFile, 'utf8');
  script = JSON.parse(scriptContent);
  console.log('✅ Script loaded');
} catch (error) {
  console.error('Error: Failed to parse script:', error.message);
  process.exit(1);
}

// Generate subtitles
const scenes = script.scenes || [];
if (scenes.length === 0) {
  console.error('Error: No scenes found in script');
  process.exit(1);
}

let subtitleContent = '';
let currentTime = 0;

scenes.forEach((scene, index) => {
  const sceneStart = currentTime;
  const duration = scene.duration || 5;
  const sceneEnd = currentTime + duration;

  // Scene title
  subtitleContent += `${index + 1}\n`;
  subtitleContent += `00:00:${formatTime(sceneStart)} --> 00:00:${formatTime(sceneEnd)}\n`;
  subtitleContent += `${scene.title || 'Scene ' + (index + 1)}\n\n`;

  // Voiceover
  if (scene.voiceover) {
    // Split voiceover into chunks for better readability
    const words = scene.voiceover.split(' ');
    let chunk = '';
    let chunkTime = sceneStart;
    const timePerChunk = duration / Math.max(1, words.length);

    for (let i = 0; i < words.length; i++) {
      chunk += words[i] + ' ';
      if (chunk.length >= 30 || i === words.length - 1) {
        const chunkEnd = Math.min(chunkTime + timePerChunk * chunk.split(' ').length, sceneEnd);
        subtitleContent += `00:00:${formatTime(chunkTime)} --> 00:00:${formatTime(chunkEnd)}\n`;
        subtitleContent += `${chunk.trim()}\n\n`;
        chunk = '';
        chunkTime = chunkEnd;
      }
    }
  }

  currentTime = sceneEnd;
});

// Add format-specific headers
if (format === 'srt') {
  subtitleContent = `WEBVTT\n\n${subtitleContent}`;
}

// Write output
try {
  const outputDir = require('path').dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(outputFile, subtitleContent, 'utf8');

  console.log('');
  console.log('✅ Subtitles generated successfully!');
  console.log(`MEDIA: ${outputFile}`);
  console.log('');
  console.log(`   Scenes: ${scenes.length}`);
  console.log(`   Format: ${format}`);
} catch (error) {
  console.error('Error writing subtitle file:', error.message);
  process.exit(1);
}

// Format time helper (SS to MM:SS:MM)
function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}
