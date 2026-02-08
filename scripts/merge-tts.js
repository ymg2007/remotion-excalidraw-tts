#!/usr/bin/env node
/**
 * merge-tts.js - Merge audio with video using FFmpeg
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse arguments
const args = process.argv.slice(2);
let videoPath = '';
let audioPath = '';
let outputPath = '';
let audioVolume = 1.0;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--video' && args[i + 1]) {
    videoPath = args[++i];
  } else if (args[i] === '--audio' && args[i + 1]) {
    audioPath = args[++i];
  } else if (args[i] === '--output' && args[i + 1]) {
    outputPath = args[++i];
  } else if (args[i] === '--volume' && args[i + 1]) {
    audioVolume = parseFloat(args[++i]);
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
Usage: node merge-tts.js --video <path> --audio <path> --output <path> [options]

Arguments:
  --video       Input video file path (required)
  --audio        Audio file path (required)
  --output       Output video path (required)
  --volume       Audio volume 0.0-2.0 (default: 1.0)

Requirements:
  - FFmpeg must be installed and in PATH

Examples:
  node merge-tts.js \\
    --video ./video.mp4 \\
    --audio ./voiceover.mp3 \\
    --output ./final-video.mp4

  node merge-tts.js \\
    --video ./video.mp4 \\
    --audio ./narration.mp3 \\
    --output ./final-video.mp4 \\
    --volume 1.2
    `);
    process.exit(0);
  }
}

// Validate arguments
if (!videoPath || !audioPath || !outputPath) {
  console.error('Error: --video, --audio, and --output are required');
  process.exit(1);
}

// Validate volume
if (audioVolume < 0 || audioVolume > 2.0) {
  console.error('Error: Volume must be between 0.0 and 2.0');
  process.exit(1);
}

// Check FFmpeg
let ffmpegPath = 'ffmpeg';
try {
  execSync('which ffmpeg', { stdio: 'ignore' });
} catch (error) {
  // Try common paths
  const possiblePaths = [
    '/usr/bin/ffmpeg',
    '/usr/local/bin/ffmpeg',
    'C:\\Program Files\\FFmpeg\\bin\\ffmpeg.exe',
    'C:\\ffmpeg\\bin\\ffmpeg.exe',
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      ffmpegPath = p;
      break;
    }
  }
  if (ffmpegPath === 'ffmpeg') {
    console.error('Error: FFmpeg not found. Please install FFmpeg.');
    console.log('');
    console.log('Install on Ubuntu/Debian:');
    console.log('  sudo apt install ffmpeg');
    console.log('');
    console.log('Install on macOS:');
    console.log('  brew install ffmpeg');
    console.log('');
    console.log('Download from: https://ffmpeg.org/download.html');
    process.exit(1);
  }
}

console.log('🎬 Merging audio with video...');
console.log(`   Video: ${videoPath}`);
console.log(`   Audio: ${audioPath}`);
console.log(`   Output: ${outputPath}`);
console.log(`   Audio volume: ${audioVolume}x`);
console.log('');

// Check input files
if (!fs.existsSync(videoPath)) {
  console.error(`Error: Video file not found: ${videoPath}`);
  process.exit(1);
}

if (!fs.existsSync(audioPath)) {
  console.error(`Error: Audio file not found: ${audioPath}`);
  process.exit(1);
}

// Create output directory if needed
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

try {
  console.log('Merging using FFmpeg (this may take a while)...');
  console.log('');

  // FFmpeg command to merge audio with video
  const volumeFilter = audioVolume !== 1.0 ? `,volume=${audioVolume}` : '';

  const ffmpegCommand = `"${ffmpegPath}" \\
    -i "${videoPath}" \\
    -i "${audioPath}" \\
    -c:v copy \\
    -c:a aac \\
    -shortest \\
    -map 0:v:0 \\
    -map 1:a:0${volumeFilter ? ` -af "volume=${audioVolume}"` : ''} \\
    -y \\
    "${outputPath}"`;

  // Execute FFmpeg
  execSync(ffmpegCommand, {
    stdio: 'inherit',
    shell: true,
  });

  console.log('');
  console.log('✅ Audio merged successfully!');
  console.log(`MEDIA: ${outputPath}`);
  console.log('');

  // Print file info
  const stats = fs.statSync(outputPath);
  console.log(`   File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

  // Get video duration
  try {
    const ffprobeOutput = execSync(
      `"${ffmpegPath}" -i "${outputPath}" 2>&1 | grep Duration | cut -d ' ' -f 4 | cut -d ',' -f 1`,
      { shell: true, encoding: 'utf8' }
    );
    console.log(`   Duration: ${ffprobeOutput.trim()}`);
  } catch (error) {
    // Ignore ffprobe errors
  }

} catch (error) {
  console.error('Error merging audio:', error.message);
  process.exit(1);
}

console.log('');
console.log('Tips:');
console.log('  - Adjust --volume to control voiceover volume');
console.log('  - Use higher values for voiceover-heavy videos');
console.log('  - Use lower values for background music videos');
