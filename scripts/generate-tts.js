#!/usr/bin/env node
/**
 * generate-tts.js - Generate audio from text using TTS
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse arguments
const args = process.argv.slice(2);
let text = '';
let outputPath = '';
let voice = 'default';
let speed = 1.0;
let engine = 'auto';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--text' && args[i + 1]) {
    text = args[++i];
  } else if (args[i] === '--output' && args[i + 1]) {
    outputPath = args[++i];
  } else if (args[i] === '--voice' && args[i + 1]) {
    voice = args[++i];
  } else if (args[i] === '--speed' && args[i + 1]) {
    speed = parseFloat(args[++i]);
  } else if (args[i] === '--engine' && args[i + 1]) {
    engine = args[++i];
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
Usage: node generate-tts.js --text <text> --output <path> [options]

Arguments:
  --text        Text to convert to speech (required)
  --output       Output audio path (required)
  --voice        Voice ID or name (default: default)
  --speed        Speech speed 0.5-2.0 (default: 1.0)
  --engine       TTS engine: auto, elevenlabs, google, azure (default: auto)

Supported TTS engines:
  - elevenlabs: Best quality (requires API key)
  - google: Free tier available
  - azure: Multi-language support
  - auto: Automatically select available engine

Examples:
  node generate-tts.js \\
    --text "Hello, welcome to my video" \\
    --output ./voiceover.mp3

  node generate-tts.js \\
    --text "This is a longer script..." \\
    --output ./narration.mp3 \\
    --voice female1 \\
    --speed 1.1
    `);
    process.exit(0);
  }
}

// Validate arguments
if (!text || !outputPath) {
  console.error('Error: --text and --output are required');
  process.exit(1);
}

// Validate speed
if (speed < 0.5 || speed > 2.0) {
  console.error('Error: Speed must be between 0.5 and 2.0');
  process.exit(1);
}

console.log('🎙️  Generating TTS audio...');
console.log(`   Text length: ${text.length} characters`);
console.log(`   Output: ${outputPath}`);
console.log(`   Voice: ${voice}`);
console.log(`   Speed: ${speed}x`);
console.log(`   Engine: ${engine}`);
console.log('');

// Load TTS config
const configPath = path.join(process.env.HOME || process.env.USERPROFILE, '.clawdbot', 'tts-config.json');
let ttsConfig = {};

if (fs.existsSync(configPath)) {
  try {
    ttsConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('✅ TTS config loaded');
  } catch (error) {
    console.warn('Warning: Failed to load TTS config');
  }
}

// Determine TTS engine
const selectedEngine = engine === 'auto' ? autoDetectEngine(ttsConfig) : engine;
console.log(`   Using engine: ${selectedEngine}`);
console.log('');

// Generate audio
try {
  let audioBuffer;

  switch (selectedEngine) {
    case 'elevenlabs':
      audioBuffer = await generateWithElevenLabs(text, voice, speed, ttsConfig);
      break;
    case 'google':
      audioBuffer = await generateWithGoogle(text, voice, speed, ttsConfig);
      break;
    case 'azure':
      audioBuffer = await generateWithAzure(text, voice, speed, ttsConfig);
      break;
    default:
      // Use sag (ElevenLabs TTS) if available
      audioBuffer = await generateWithSag(text, voice, speed);
      break;
  }

  // Create output directory if needed
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write audio file
  fs.writeFileSync(outputPath, audioBuffer);

  console.log('');
  console.log('✅ Audio generated successfully!');
  console.log(`MEDIA: ${outputPath}`);
  console.log('');

  // Print audio info
  const stats = fs.statSync(outputPath);
  console.log(`   File size: ${(stats.size / 1024).toFixed(2)} KB`);

} catch (error) {
  console.error('Error generating TTS:', error.message);
  process.exit(1);
}

// Auto-detect best available TTS engine
function autoDetectEngine(config) {
  if (config.engine === 'elevenlabs' && config.apiKey) {
    return 'elevenlabs';
  }
  if (config.engine === 'azure' && config.apiKey) {
    return 'azure';
  }
  if (config.engine === 'google') {
    return 'google';
  }
  return 'sag';
}

// Generate with ElevenLabs
async function generateWithElevenLabs(text, voice, speed, config) {
  console.log('Generating with ElevenLabs...');

  if (!config.apiKey) {
    throw new Error('ElevenLabs API key not configured in tts-config.json');
  }

  const voiceId = config.voices?.[voice] || config.defaultVoice || voice;

  const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
    method: 'POST',
    headers: {
      'xi-api-key': config.apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.5,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

// Generate with Google TTS
async function generateWithGoogle(text, voice, speed, config) {
  console.log('Generating with Google TTS...');

  // Use gtts (Python) or browser TTS
  try {
    // Try using Python gtts
    const tempPythonScript = `
from gtts import gTTS
import sys

text = """${text.replace(/"/g, '\\"')}"""
tts = gTTS(text=text, lang='en', slow=False)
tts.save('${outputPath.replace(/'/g, "\\'")}')
`;
    const tempPath = '/tmp/tts_temp.py';
    fs.writeFileSync(tempPath, tempPythonScript);
    execSync(`python3 ${tempPath}`, { stdio: 'inherit' });
    fs.unlinkSync(tempPath);
    return fs.readFileSync(outputPath);
  } catch (error) {
    throw new Error('Google TTS requires Python gtts library');
  }
}

// Generate with Azure Speech
async function generateWithAzure(text, voice, speed, config) {
  console.log('Generating with Azure Speech...');

  if (!config.apiKey) {
    throw new Error('Azure API key not configured in tts-config.json');
  }

  // Implementation would use azure-cognitiveservices-speech-sdk
  throw new Error('Azure Speech TTS requires azure-cognitiveservices-speech-sdk');
}

// Generate with sag (internal ElevenLabs TTS)
async function generateWithSag(text, voice, speed) {
  console.log('Generating with sag (ElevenLabs TTS)...');

  // Check if sag is available via Clawdbot
  try {
    const sagPath = path.join(process.env.HOME || process.env.USERPROFILE, '.local', 'bin', 'sag');
    if (fs.existsSync(sagPath)) {
      // Use sag CLI
      const tempOutput = '/tmp/sag_tts.mp3';
      const command = `"${sagPath}" "${text}" --output "${tempOutput}"`;
      execSync(command, { stdio: 'inherit' });
      return fs.readFileSync(tempOutput);
    }
  } catch (error) {
    // Fall through to error
  }

  throw new Error('No TTS engine available. Please configure tts-config.json or install sag.');
}
