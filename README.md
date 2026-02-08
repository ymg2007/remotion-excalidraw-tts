# Remotion + Excalidraw + TTS

🎬 Professional Hand-Drawn Style Video Generation

**GitHub:** https://github.com/ymg2007/remotion-excalidraw-tts

---

## ✨ Features

- **Remotion** - React-based video framework for programmatic video creation
- **Excalidraw** - Hand-drawn style diagramming and animations
- **TTS** - Text-to-speech for automatic voiceover
- **One-Click Generation** - Generate complete videos from JSON scripts

---

## 🎯 Use Cases

- 📚 Tutorial and explainer videos
- 🎨 Whiteboard-style presentations
- 🏫 Educational content
- 💼 Product demos
- 💡 Concept visualizations

---

## 🚀 Quick Start

### Prerequisites

```bash
# Node.js v18+
node --version

# FFmpeg (for video rendering)
ffmpeg -version

# Remotion CLI
npm install -g remotion-cli
```

### Create a New Project

```bash
node /root/clawd/skills/remotion-excalidraw-tts/scripts/setup-project.sh \
  --name "my-video" \
  --template "simple-whiteboard"
```

### Generate Video from Script

Create a `script.json`:

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
          "fontSize": 48
        }
      ],
      "voiceover": "Welcome to my video."
    }
  ]
}
```

Generate the video:

```bash
node /root/clawd/skills/remotion-excalidraw-tts/scripts/generate-video.js \
  --project "./my-video" \
  --script "./script.json" \
  --output "./video.mp4"
```

---

## 🛠️ Tools

| Tool | Description |
|------|-------------|
| `setup-project.sh` | Initialize a new Remotion project |
| `generate-video.js` | Generate video from JSON script |
| `create-excalidraw.js` | Create Excalidraw scenes from text |
| `generate-tts.js` | Generate audio from text |
| `merge-tts.js` | Merge audio with video |

---

## 🎨 Templates

### Simple Whiteboard

Clean, minimal whiteboard style with hand-drawn elements.

- Smooth drawing animations
- Simple text and shapes
- Perfect for tutorials

**Template Usage:**
```bash
node scripts/setup-project.sh --name my-video --template simple-whiteboard
```

---

## 📝 Script Format

### Element Types

| Type | Properties |
|------|------------|
| `text` | content, x, y, fontSize, color |
| `rectangle` | x, y, width, height, strokeColor, strokeWidth |
| `circle` | x, y, radius, strokeColor, strokeWidth |
| `arrow` | x1, y1, x2, y2, strokeColor, strokeWidth |
| `line` | x1, y1, x2, y2, strokeColor, strokeWidth |

---

## 🎙️ TTS Configuration

Create `~/.clawdbot/tts-config.json`:

```json
{
  "engine": "elevenlabs",
  "apiKey": "your-api-key",
  "defaultVoice": "your-voice-id"
}
```

**Supported Engines:**
- ElevenLabs (best quality)
- Google TTS (free tier)
- Azure Speech (multi-language)

---

## 📊 Examples

### Generated Videos

| Video | Description | Duration |
|--------|-------------|----------|
| Scene 1: Welcome | Introduction to Claude Code Agent Teams | 12s |
| Scene 2: What Is | Explains Agent Teams concept | 15s |
| Scene 3: Features | Core features overview | 18s |
| Scene 4: Use Cases | Practical applications | 15s |

See `examples/` directory for sample scripts.

---

## 🔧 Configuration

### Remotion Config (`remotion.config.ts`)

```typescript
import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
```

### Custom Resolution

```bash
node scripts/generate-video.js \
  --project ./my-video \
  --script ./script.json \
  --output ./video.mp4 \
  --resolution 1280x720 \
  --fps 30
```

---

## 💡 Tips

1. **Start Simple** - Begin with simple-whiteboard template
2. **Iterate** - Generate short test videos first
3. **Time Audio First** - Generate TTS before video for better timing
4. **Batch Scenes** - Generate multiple scenes, then combine

---

## 🔗 Resources

- [Remotion Docs](https://www.remotion.dev/docs)
- [Excalidraw](https://excalidraw.com/)
- [ElevenLabs](https://elevenlabs.io/)
- [FFmpeg](https://ffmpeg.org/)

---

## 📄 License

MIT License

---

**Made with ❤️ for Clawdbot**
