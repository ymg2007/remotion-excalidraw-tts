#!/usr/bin/env node
/**
 * merge-videos.js - Merge multiple videos into one
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse arguments
const args = process.argv.slice(2);
let videos = [];
let outputFile = '';
let transition = '0';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--videos' && args[i + 1]) {
    videos = args[++i].split(',');
  } else if (args[i] === '--output' && args[i + 1]) {
    outputFile = args[++i];
  } else if (args[i] === '--transition' && args[i + 1]) {
    transition = args[++i];
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
Usage: node merge-videos.js --videos <file1,file2,...> --output <path> [options]

Arguments:
  --videos      Comma-separated list of video files (required)
  --output       Output video path (required)
  --transition    Transition duration in seconds (default: 0)

Example:
  node merge-videos.js \\
    --videos scene1.mp4,scene2.mp4,scene3.mp4 \\
    --output final.mp4 \\
    --transition 1
    `);
    process.exit(0);
  }
}

// Validate arguments
if (!videos.length || !outputFile) {
  console.error('Error: --videos and --output are required');
  process.exit(1);
}

console.log('🎬 Merging videos...');
console.log(`   Input: ${videos.length} video(s)`);
console.log(`   Output: ${outputFile}`);
console.log(`   Transition: ${transition}s`);
console.log('');

// Check FFmpeg
let ffmpegPath = 'ffmpeg';
try {
  execSync('which ffmpeg', { stdio: 'ignore' });
} catch (error) {
  ffmpegPath = '/usr/bin/ffmpeg';
  if (!fs.existsSync(ffmpegPath)) {
    console.error('Error: FFmpeg not found. Please install FFmpeg.');
    console.log('Install: sudo apt install ffmpeg');
    process.exit(1);
  }
}

// Check all input videos exist
for (const video of videos) {
  if (!fs.existsSync(video)) {
    console.error(`Error: Video file not found: ${video}`);
    process.exit(1);
  }
}

// Create output directory
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

try {
  console.log('Merging using FFmpeg...');
  console.log('');

  // Build FFmpeg concat command
  const concatListPath = '/tmp/ffmpeg-concat.txt';
  const concatList = videos.map(v => `file '${path.resolve(v)}'`).join('\n');
  fs.writeFileSync(concatListPath, concatList);

  // Build filter complex for transitions
  let filterComplex = '';
  if (parseFloat(transition) > 0) {
    const transitionFrames = Math.floor(parseFloat(transition) * 30);
    for (let i = 0; i < videos.length - 1; i++) {
      filterComplex += `[${i}:v]xfade=transition=fade:duration=${transitionFrames}:offset=0[v${i}];`;
    }
  }

  // Execute FFmpeg
  const ffmpegCommand = `"${ffmpegPath}" \\
    -f concat -safe 0 -i ${concatListPath} \\
    -c:v copy \\
    -c:a copy \\
    -y \\
    "${outputFile}"`;

  execSync(ffmpegCommand, { stdio: 'inherit', shell: true });

  console.log('');
  console.log('✅ Videos merged successfully!');
  console.log(`MEDIA: ${outputFile}`);
  console.log('');

  // Print file info
  const stats = fs.statSync(outputFile);
  console.log(`   File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

  // Get video duration
  try {
    const ffprobeOutput = execSync(
      `"${ffmpegPath}" -i "${outputFile}" 2>&1 | grep Duration | cut -d ' ' -f 4 | cut -d ',' -f 1`,
      { shell: true, encoding: 'utf8' }
    );
    console.log(`   Duration: ${ffprobeOutput.trim()}`);
  } catch (error) {
    // Ignore ffprobe errors
  }

} catch (error) {
  console.error('Error merging videos:', error.message);
  process.exit(1);
}

// Clean up
try {
  fs.unlinkSync('/tmp/ffmpeg-concat.txt');
} catch (error) {
  // Ignore
}
