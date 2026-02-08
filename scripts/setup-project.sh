#!/bin/bash
# setup-project.sh - Initialize a new Remotion project with Excalidraw support

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_ROOT="$(dirname "$SCRIPT_DIR")"

# Parse arguments
PROJECT_NAME=""
TEMPLATE="simple-whiteboard"
PROJECT_PATH=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --name)
            PROJECT_NAME="$2"
            shift 2
            ;;
        --template)
            TEMPLATE="$2"
            shift 2
            ;;
        --path)
            PROJECT_PATH="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 --name <project-name> [--template <template>] [--path <path>]"
            echo ""
            echo "Arguments:"
            echo "  --name      Project name (required)"
            echo "  --template  Template to use (default: simple-whiteboard)"
            echo "  --path      Custom project path (default: projects/<name>)"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Validate arguments
if [[ -z "$PROJECT_NAME" ]]; then
    echo "Error: --name is required"
    exit 1
fi

# Set default project path
if [[ -z "$PROJECT_PATH" ]]; then
    PROJECT_PATH="$SKILL_ROOT/projects/$PROJECT_NAME"
fi

# Check if project already exists
if [[ -d "$PROJECT_PATH" ]]; then
    echo "Error: Project directory already exists: $PROJECT_PATH"
    exit 1
fi

echo "Setting up Remotion project..."
echo "  Name: $PROJECT_NAME"
echo "  Template: $TEMPLATE"
echo "  Path: $PROJECT_PATH"
echo ""

# Create project directory
mkdir -p "$PROJECT_PATH"

# Copy template files
TEMPLATE_DIR="$SKILL_ROOT/templates/$TEMPLATE"
if [[ ! -d "$TEMPLATE_DIR" ]]; then
    echo "Warning: Template not found: $TEMPLATE_DIR"
    echo "Creating basic project structure..."
    mkdir -p "$PROJECT_PATH/src"
else
    echo "Copying template files..."
    cp -r "$TEMPLATE_DIR"/* "$PROJECT_PATH/"
fi

# Initialize npm project
echo "Initializing npm project..."
cd "$PROJECT_PATH"
npm init -y > /dev/null 2>&1 || true

# Install dependencies
echo "Installing dependencies..."
npm install --silent remotion @remotion/cli react react-dom || {
    echo "Warning: Some packages failed to install"
}

# Create basic package.json scripts
if [[ -f "package.json" ]]; then
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    pkg.scripts = {
        start: 'remotion studio',
        build: 'remotion render HelloWorld out/video.mp4',
        ...pkg.scripts
    };
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    " 2>/dev/null || true
fi

# Create remotion config
if [[ ! -f "remotion.config.ts" ]]; then
    cat > remotion.config.ts << 'EOF'
import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
EOF
fi

# Create basic entry file
mkdir -p src
if [[ ! -f "src/Root.tsx" ]]; then
    cat > src/Root.tsx << 'EOF'
import React from 'react';
import { Composition } from 'remotion';
import { HelloWorld } from './HelloWorld';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
EOF
fi

if [[ ! -f "src/HelloWorld.tsx" ]]; then
    cat > src/HelloWorld.tsx << 'EOF'
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const HelloWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ fontSize: 120, color: '#000', opacity, fontFamily: 'Comic Sans MS, cursive' }}>
        Hello World!
      </h1>
    </AbsoluteFill>
  );
};
EOF
fi

# Create public directory for assets
mkdir -p public

# Create README
cat > README.md << EOF
# $PROJECT_NAME

A Remotion + Excalidraw project.

## Getting Started

\`\`\`bash
# Start the Remotion studio
npm start

# Render the video
npm run build
\`\`\`

## Project Structure

- \`src/\` - React components
- \`public/\` - Assets
- \`remotion.config.ts\` - Remotion configuration

## Resources

- [Remotion Docs](https://www.remotion.dev/docs)
- [Excalidraw](https://excalidraw.com/)
EOF

echo ""
echo "✅ Project created successfully!"
echo ""
echo "Next steps:"
echo "  1. cd $PROJECT_PATH"
echo "  2. npm install  # if dependencies weren't installed"
echo "  3. npm start    # open Remotion studio"
echo ""
