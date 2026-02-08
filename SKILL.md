---
name: remotion-excalidraw-tts
description: Generate hand-drawn style animated videos using Remotion + Excalidraw + TTS. Create professional whiteboard-style videos with voiceover.
read_when:
  - User wants to create a video with hand-drawn animation style
  - User asks to create whiteboard-style explainer videos
  - User wants to combine diagrams with voiceover
metadata: {"clawdbot":{"emoji":"🎬","requires":{"bins":["node","ffmpeg"],"npm":["remotion-cli"]}}}
---

# Remotion + Excalidraw + TTS Video Generation

Generate professional hand-drawn style animated videos using the power of:
- **Remotion** - React-based video framework
- **Excalidraw** - Hand-drawn style diagramming
- **TTS** - Text-to-speech voiceover

Perfect for creating:
- Tutorial and explainer videos
- Whiteboard-style presentations
- Educational content
- Product demos
- Concept visualizations

## Prerequisites

### Node.js & npm
```bash
node --version  # v18+ recommended
npm --version
```

### FFMPEG
```bash
ffmpeg -version
```

### Required npm packages
```bash
npm install -g remotion-cli
```

### Project Setup (First Time)
```bash
cd /root/clawd/skills/remotion-excalidraw-tts
npm install
```

## Directory Structure

```
remotion-excalidraw-tts/
├── SKILL.md                      # This file
├── README.md                     # Usage documentation
├── scripts/                      # Utility scripts
│   ├── setup-project.sh          # Initialize a Remotion project
│   ├── generate-video.js         # Generate video from config
│   ├── create-excalidraw.js      # Create Excalidraw scenes
│   ├── generate-tts.js           # Generate audio from text
│   └── merge-tts.js              # Merge audio with video
├── templates/                    # Project templates
│   ├── simple-whiteboard/        # Simple whiteboard template
│   └── diagram-animation/        # Diagram animation template
└── projects/                     # User projects (auto-created)
    └── example/
        ├── src/
        │   ├── Root.tsx
        │   ├── Scene1.tsx
        │   └── ...
        ├── package.json
        ├── remotion.config.ts
        └── public/
```

## Quick Start

### 1. Create a New Project
```bash
node /root/clawd/skills/remotion-excalidraw-tts/scripts/setup-project.sh \
  --name "my-video" \
  --template "simple-whiteboard"
```

### 2. Generate Video from Script
```bash
node /root/clawd/skills/remotion-excalidraw-tts/scripts/generate-video.js \
  --project "/root/clawd/skills/remotion-excalidraw-tts/projects/my-video" \
  --script /path/to/script.json
```

### 3. Generate Video with Voiceover
```bash
# First generate TTS audio
node /root/clawd/skills/remotion-excalidraw-tts/scripts/generate-tts.js \
  --text "This is the voiceover text..." \
  --output /tmp/voiceover.mp3

# Then generate video
node /root/clawd/skills/remotion-excalidraw-tts/scripts/merge-tts.js \
  --video /tmp/video.mp4 \
  --audio /tmp/voiceover.mp3 \
  --output /tmp/final-video.mp4
```

## Script Format

### Simple Script (JSON)
```json
{
  "title": "My Video",
  "duration": 30,
  "scenes": [
    {
      "id": "scene1",
      "duration": 10,
      "title": "Introduction",
      "elements": [
        {
          "type": "text",
          "content": "Hello World!",
          "x": 50,
          "y": 50,
          "fontSize": 48,
          "strokeStyle": "#000000"
        },
        {
          "type": "rectangle",
          "x": 100,
          "y": 100,
          "width": 200,
          "height": 150,
          "strokeStyle": "#e03131"
        }
      ],
      "voiceover": "Welcome to my video. This is the introduction."
    }
  ]
}
```

### Excalidraw Format
You can also use Excalidraw's native JSON export format for more complex diagrams.

## Available Tools

### 1. setup-project.sh
Initialize a new Remotion project with Excalidraw support.

```bash
node scripts/setup-project.sh --name <project-name> --template <template>
```

**Arguments:**
- `--name` (Required): Project name
- `--template` (Optional): Template to use (default: simple-whiteboard)
- `--path` (Optional): Custom path (default: projects/<name>)

### 2. generate-video.js
Generate a video from a script.

```bash
node scripts/generate-video.js --project <path> --script <path> [options]
```

**Arguments:**
- `--project` (Required): Path to the Remotion project
- `--script` (Required): Path to the script JSON file
- `--output` (Optional): Output video path (default: output/video.mp4)
- `--resolution` (Optional): Resolution (default: 1920x1080)
- `--fps` (Optional): Frames per second (default: 30)

### 3. create-excalidraw.js
Create Excalidraw scenes from text description.

```bash
node scripts/create-excalidraw.js --description <text> --output <path>
```

**Arguments:**
- `--description` (Required): Text description of the scene
- `--output` (Required): Output JSON path
- `--style` (Optional): Drawing style (default: hand-drawn)

### 4. generate-tts.js
Generate audio from text using TTS.

```bash
node scripts/generate-tts.js --text <text> --output <path> [options]
```

**Arguments:**
- `--text` (Required): Text to convert to speech
- `--output` (Required): Output audio path
- `--voice` (Optional): Voice ID (default: default)
- `--speed` (Optional): Speed (0.5-2.0, default: 1.0)

### 5. merge-tts.js
Merge audio with video.

```bash
node scripts/merge-tts.js --video <path> --audio <path> --output <path>
```

**Arguments:**
- `--video` (Required): Video file path
- `--audio` (Required): Audio file path
- `--output` (Required): Output video path

## Templates

### Simple Whiteboard
Clean, minimal whiteboard style with hand-drawn elements.
- Smooth drawing animations
- Simple text and shapes
- Perfect for tutorials

### Diagram Animation
Animated diagrams with Excalidraw elements.
- Complex diagram structures
- Animated stroke drawing
- Multiple element types

## TTS Configuration

Configure TTS in `~/.clawdbot/tts-config.json`:

```json
{
  "engine": "elevenlabs",
  "apiKey": "your-api-key",
  "defaultVoice": "your-voice-id",
  "voices": {
    "male1": "voice-id-1",
    "female1": "voice-id-2"
  }
}
```

Supported TTS engines:
- ElevenLabs (best quality)
- Google TTS (free tier)
- Azure Speech (multi-language)

## Examples

### Example 1: Simple Tutorial
```json
{
  "title": "How to Bake a Cake",
  "duration": 60,
  "scenes": [
    {
      "id": "scene1",
      "duration": 15,
      "title": "Ingredients",
      "elements": [
        {"type": "text", "content": "Flour", "x": 100, "y": 100},
        {"type": "text", "content": "Sugar", "x": 100, "y": 150},
        {"type": "text", "content": "Eggs", "x": 100, "y": 200}
      ],
      "voiceover": "First, gather your ingredients: flour, sugar, and eggs."
    }
  ]
}
```

### Example 2: Concept Diagram
```json
{
  "title": "System Architecture",
  "duration": 45,
  "style": "diagram",
  "scenes": [
    {
      "id": "scene1",
      "duration": 20,
      "title": "Components",
      "elements": [
        {"type": "rectangle", "x": 100, "y": 100, "width": 150, "height": 100, "label": "Database"},
        {"type": "rectangle", "x": 400, "y": 100, "width": 150, "height": 100, "label": "API"},
        {"type": "arrow", "from": [250, 150], "to": [400, 150]}
      ]
    }
  ]
}
```

## Troubleshooting

### Remotion CLI not found
```bash
npm install -g remotion-cli
```

### FFMPEG not found
```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg
```

### Video generation fails
- Check Node.js version (v18+ required)
- Ensure all dependencies are installed: `npm install`
- Check script JSON format is valid
- Verify output directory exists and is writable

### TTS generation fails
- Check TTS API key is configured
- Verify text encoding is UTF-8
- Check output directory permissions

## Tips

1. **Start simple**: Begin with the simple-whiteboard template
2. **Iterate**: Generate short test videos first
3. **Use Excalidraw**: Export from app.excalidraw.com for complex scenes
4. **Time audio first**: Generate TTS before video for better timing
5. **Batch scenes**: Generate multiple scenes, then combine

## Output

The generated video will be output as MP4 with:
- H.264 video codec
- AAC audio codec (if TTS is merged)
- Specified resolution (default: 1920x1080)
- Specified FPS (default: 30)

The script prints `MEDIA: <path>` to stdout for automatic display.

## Resources

- Remotion: https://www.remotion.dev/
- Excalidraw: https://excalidraw.com/
- Excalidraw Export: https://github.com/excalidraw/excalidraw
