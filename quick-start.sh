#!/bin/bash
# quick-start.sh - Quick start guide for Remotion + Excalidraw + TTS skill

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="/tmp/remotion-demo"
SCRIPT_FILE="$SCRIPT_DIR/examples/example-script.json"
OUTPUT_FILE="/tmp/remotion-demo.mp4"

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║           Remotion + Excalidraw + TTS - Quick Start            ║"
echo "╚═════════════════════════════════════════════════════════════════════╝"
echo ""

echo "🎬 Creating a demo video..."
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."
command -v node >/dev/null 2>&1 && echo "  ✅ Node.js: $(node --version)" || echo "  ❌ Node.js not found"
command -v npm >/dev/null 2>&1 && echo "  ✅ npm: $(npm --version)" || echo "  ❌ npm not found"
command -v chromium-browser >/dev/null 2>&1 && echo "  ✅ Chromium: installed" || echo "  ⚠️  Chromium not found (install for faster rendering)"
echo ""

# Create project
echo "1️⃣  Creating Remotion project..."
node "$SCRIPT_DIR/scripts/setup-project.sh" \
    --name "remotion-demo" \
    --path "$PROJECT_DIR" \
    --template "simple-whiteboard" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "   ✅ Project created: $PROJECT_DIR"
else
    echo "   ❌ Project creation failed"
    exit 1
fi
echo ""

# Generate video
echo "2️⃣  Generating video from example script..."
echo "   Script: $SCRIPT_FILE"
echo "   Output: $OUTPUT_FILE"
echo ""

cd "$PROJECT_DIR"
npm run build > /dev/null 2>&1

if [ -f "$OUTPUT_FILE" ]; then
    echo ""
    echo "   ✅ Video generated successfully!"
    echo "   📁 File: $OUTPUT_FILE"
    echo "   📊 Size: $(du -h "$OUTPUT_FILE" | cut -f1)"
    echo ""
    echo "🎉 Done! You can now:"
    echo "   1. Play the video: xdg-open \"$OUTPUT_FILE\""
    echo "   2. Create your own: node $SCRIPT_DIR/scripts/generate-video.js --help"
    echo "   3. Open Remotion Studio: cd $PROJECT_DIR && npm start"
else
    echo ""
    echo "   ⚠️  Video file not found"
    echo "   Check the error messages above"
    exit 1
fi
