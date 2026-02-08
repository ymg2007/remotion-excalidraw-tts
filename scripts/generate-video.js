#!/usr/bin/env node
/**
 * generate-video.js - Generate a video from a script
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse arguments
const args = process.argv.slice(2);
let projectPath = '';
let scriptPath = '';
let outputPath = 'output/video.mp4';
let resolution = '1920x1080';
let fps = 30;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--project' && args[i + 1]) {
    projectPath = args[++i];
  } else if (args[i] === '--script' && args[i + 1]) {
    scriptPath = args[++i];
  } else if (args[i] === '--output' && args[i + 1]) {
    outputPath = args[++i];
  } else if (args[i] === '--resolution' && args[i + 1]) {
    resolution = args[++i];
  } else if (args[i] === '--fps' && args[i + 1]) {
    fps = parseInt(args[++i]);
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
Usage: node generate-video.js --project <path> --script <path> [options]

Arguments:
  --project       Path to the Remotion project (required)
  --script        Path to the script JSON file (required)
  --output        Output video path (default: output/video.mp4)
  --resolution    Resolution (default: 1920x1080)
  --fps           Frames per second (default: 30)

Example:
  node generate-video.js \\
    --project ./my-video \\
    --script ./script.json \\
    --output ./final-video.mp4
    `);
    process.exit(0);
  }
}

// Validate arguments
if (!projectPath || !scriptPath) {
  console.error('Error: --project and --script are required');
  process.exit(1);
}

if (!fs.existsSync(projectPath)) {
  console.error(`Error: Project directory not found: ${projectPath}`);
  process.exit(1);
}

if (!fs.existsSync(scriptPath)) {
  console.error(`Error: Script file not found: ${scriptPath}`);
  process.exit(1);
}

console.log('🎬 Generating video from script...');
console.log(`   Project: ${projectPath}`);
console.log(`   Script: ${scriptPath}`);
console.log(`   Output: ${outputPath}`);
console.log(`   Resolution: ${resolution}`);
console.log(`   FPS: ${fps}`);
console.log('');

// Load and parse script
let script;
try {
  const scriptContent = fs.readFileSync(scriptPath, 'utf8');
  script = JSON.parse(scriptContent);
  console.log('✅ Script loaded');
} catch (error) {
  console.error('Error: Failed to parse script:', error.message);
  process.exit(1);
}

// Create output directory
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('✅ Output directory created');
}

// Generate video from script
console.log('');
console.log('Generating video...');

try {
  // Create Remotion scenes from script
  const scenes = script.scenes || [];
  if (scenes.length === 0) {
    console.error('Error: No scenes found in script');
    process.exit(1);
  }

  console.log(`   Found ${scenes.length} scene(s)`);

  // Create scene files
  const srcDir = path.join(projectPath, 'src');
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }

  // Save script to project
  const scriptCopyPath = path.join(projectPath, 'script.json');
  fs.writeFileSync(scriptCopyPath, JSON.stringify(script, null, 2));
  console.log('✅ Script copied to project');

  // Generate Root.tsx
  generateRootTsx(projectPath, script, resolution, fps);
  console.log('✅ Root.tsx generated');

  // Generate scene components
  scenes.forEach((scene, index) => {
    generateSceneComponent(projectPath, scene, index);
  });
  console.log(`✅ ${scenes.length} scene component(s) generated`);

  // Create package.json if it doesn't exist
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    const packageJson = {
      name: path.basename(projectPath),
      version: '1.0.0',
      scripts: {
        start: 'remotion studio',
        build: `remotion render RemotionRoot "${outputPath}"`,
      },
      dependencies: {
        remotion: '^4.0.0',
        '@remotion/cli': '^4.0.0',
        react: '^18.2.0',
        'react-dom': '^18.2.0',
      },
    };
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ package.json created');
  }

  // Check if dependencies are installed
  const nodeModulesPath = path.join(projectPath, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('');
    console.log('Installing dependencies...');
    try {
      execSync('npm install --silent', { cwd: projectPath, stdio: 'inherit' });
      console.log('✅ Dependencies installed');
    } catch (error) {
      console.warn('Warning: Failed to install some dependencies');
    }
  }

  // Render video
  console.log('');
  console.log('Rendering video (this may take a while)...');

  try {
    // Try to use remotion-cli
    execSync(`npx remotion render RemotionRoot "${outputPath}"`, {
      cwd: projectPath,
      stdio: 'inherit',
      env: { ...process.env, REMOTION_OUTPUT: outputPath },
    });

    if (fs.existsSync(outputPath)) {
      console.log('');
      console.log('✅ Video generated successfully!');
      console.log(`MEDIA: ${outputPath}`);
    } else {
      console.warn('Warning: Video file not found, check for errors above');
    }
  } catch (error) {
    console.error('Error during video rendering:', error.message);
    console.log('');
    console.log('Note: You can also render manually:');
    console.log(`  cd ${projectPath}`);
    console.log(`  npm run build`);
    process.exit(1);
  }

} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

// Generate Root.tsx
function generateRootTsx(projectPath, script, resolution, fps) {
  const [width, height] = resolution.split('x').map(Number);
  const scenes = script.scenes || [];
  let totalFrames = 0;

  const imports = [`import React from 'react';`, `import { Composition } from 'remotion';`];
  const sceneImports = [];
  const compositionElements = [];

  scenes.forEach((scene, index) => {
    const sceneName = `Scene${index + 1}`;
    const sceneFileName = `Scene${index + 1}`;
    const duration = scene.duration || 5;
    const frames = duration * fps;
    totalFrames += frames;

    sceneImports.push(`import { ${sceneName} } from './${sceneFileName}';`);

    compositionElements.push(`      <Composition
        id="${scene.id || 'scene' + (index + 1)}"
        component={${sceneName}}
        durationInFrames={${frames}}
        fps={${fps}}
        width={${width}}
        height={${height}}
        defaultProps={{
          title: "${scene.title || ''}",
          elements: ${JSON.stringify(scene.elements || [])}
        }}
      />`);
  });

  const content = `${imports.join('\n')}${sceneImports.length > 0 ? '\n' + sceneImports.join('\n') : ''}

export const RemotionRoot: React.FC = () => {
  return (
    <>
${compositionElements.join('\n')}
    </>
  );
};
`;

  fs.writeFileSync(path.join(projectPath, 'src/Root.tsx'), content);
}

// Generate scene component
function generateSceneComponent(projectPath, scene, index) {
  const sceneName = `Scene${index + 1}`;
  const title = scene.title || `Scene ${index + 1}`;
  const elements = scene.elements || [];
  const voiceover = scene.voiceover || '';

  const content = `import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import styled from 'styled-components';

interface ${sceneName}Props {
  title: string;
  elements: any[];
}

export const ${sceneName}: React.FC<${sceneName}Props> = ({ title, elements }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const scale = spring({ frame, fps: 30, config: { damping: 10 } });

  return (
    <Container style={{ opacity }}>
      <Title>{title}</Title>
      <ElementsContainer style={{ transform: \`scale(\${scale})\` }}>
        {elements.map((el, i) => renderElement(el, i, frame))}
      </ElementsContainer>
      ${voiceover ? `<VoiceoverIndicator>{voiceover}</VoiceoverIndicator>` : ''}
    </Container>
  );
};

function renderElement(element: any, index: number, frame: number) {
  const delay = index * 5;
  const elementOpacity = interpolate(
    frame,
    [delay, delay + 20],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  const elementScale = spring({
    frame: frame - delay,
    fps: 30,
    config: { damping: 15 }
  });

  const style = {
    position: 'absolute' as const,
    left: element.x || 0,
    top: element.y || 0,
    opacity: elementOpacity,
    transform: \`scale(\${elementScale})\`,
    color: element.color || '#000000',
    fontSize: element.fontSize || 24,
    fontFamily: 'Comic Sans MS, cursive',
    strokeStyle: element.strokeStyle || '#000000',
    strokeWidth: element.strokeWidth || 2,
  };

  switch (element.type) {
    case 'text':
      return <Text key={index} style={style}>{element.content}</Text>;
    case 'rectangle':
      return (
        <Rectangle key={index} style={style} width={element.width || 100} height={element.height || 100} />
      );
    case 'circle':
      return <Circle key={index} style={style} radius={element.radius || 50} />;
    case 'line':
      return (
        <Line key={index}
          x1={element.x1 || element.x || 0}
          y1={element.y1 || element.y || 0}
          x2={element.x2 || (element.x || 0) + 100}
          y2={element.y2 || (element.y || 0) + 100}
          style={style}
        />
      );
    default:
      return null;
  }
}

const Container = styled(AbsoluteFill)\`
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
\`;

const Title = styled.h2\`
  font-size: 72px;
  color: #000;
  margin-bottom: 40px;
  font-family: 'Comic Sans MS', cursive;
\`;

const ElementsContainer = styled.div\`
  position: relative;
  width: 100%;
  height: 100%;
\`;

const Text = styled.span\`
  font-family: inherit;
\`;

const Rectangle = styled.div<{ width: number; height: number }>\`
  width: \${props => props.width}px;
  height: \${props => props.height}px;
  border: 2px solid;
\`;

const Circle = styled.div<{ radius: number }>\`
  width: \${props => props.radius * 2}px;
  height: \${props => props.radius * 2}px;
  border: 2px solid;
  border-radius: 50%;
\`;

const Line = styled.svg\`
  position: absolute;
  line {\`
    stroke-width: 2;
  \`}
\`;

const VoiceoverIndicator = styled.div\`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
\`;
`;

  fs.writeFileSync(path.join(projectPath, `src/Scene${index + 1}.tsx`), content);
}
