#!/usr/bin/env node
/**
 * create-excalidraw.js - Create Excalidraw scenes from text description
 */

const fs = require('fs');
const path = require('path');

// Parse arguments
const args = process.argv.slice(2);
let description = '';
let outputPath = '';
let style = 'hand-drawn';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--description' && args[i + 1]) {
    description = args[++i];
  } else if (args[i] === '--output' && args[i + 1]) {
    outputPath = args[++i];
  } else if (args[i] === '--style' && args[i + 1]) {
    style = args[++i];
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
Usage: node create-excalidraw.js --description <text> --output <path> [options]

Arguments:
  --description   Text description of the scene (required)
  --output        Output JSON path (required)
  --style         Drawing style (default: hand-drawn)

Example:
  node create-excalidraw.js \\
    --description "A simple flowchart with three boxes connected by arrows" \\
    --output ./scene.json
    `);
    process.exit(0);
  }
}

// Validate arguments
if (!description || !outputPath) {
  console.error('Error: --description and --output are required');
  process.exit(1);
}

console.log('🎨 Creating Excalidraw scene...');
console.log(`   Description: ${description}`);
console.log(`   Output: ${outputPath}`);
console.log(`   Style: ${style}`);
console.log('');

// Create Excalidraw data from description
const excalidrawData = generateExcalidrawFromDescription(description, style);

// Write output
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(excalidrawData, null, 2));

console.log('✅ Excalidraw scene created successfully!');
console.log(`   Output: ${outputPath}`);
console.log('');
console.log('You can now use this file with the generate-video script or');
console.log('import it directly into app.excalidraw.com for editing.');
console.log('');

// Generate Excalidraw data from text description
function generateExcalidrawFromDescription(description, style) {
  const elements = [];
  const appId = crypto.randomUUID?.() || generateId();
  const now = Date.now();

  // Parse description to create elements
  const descLower = description.toLowerCase();
  const centerX = 960;
  const centerY = 540;
  let currentY = 200;
  let elementId = 1;

  // Simple keyword-based element generation
  if (descLower.includes('rectangle') || descLower.includes('box') || descLower.includes('container')) {
    const count = countMatches(descLower, /rectangle|box|container/g) || 1;
    for (let i = 0; i < count; i++) {
      elements.push(createRectangle(
        centerX - 150 + (i % 3) * 200,
        currentY + Math.floor(i / 3) * 150,
        150,
        100,
        elementId++,
        style
      ));
    }
  }

  if (descLower.includes('circle') || descLower.includes('round')) {
    const count = countMatches(descLower, /circle|round/g) || 1;
    for (let i = 0; i < count; i++) {
      elements.push(createEllipse(
        centerX - 100 + (i % 4) * 150,
        currentY + Math.floor(i / 4) * 150,
        50,
        50,
        elementId++,
        style
      ));
    }
  }

  if (descLower.includes('arrow') || descLower.includes('line') || descLower.includes('connect')) {
    const count = countMatches(descLower, /arrow|line|connect/g) || 1;
    for (let i = 0; i < count; i++) {
      elements.push(createArrow(
        centerX - 200 + i * 150,
        currentY + 50,
        centerX - 100 + i * 150,
        currentY + 50,
        elementId++,
        style
      ));
    }
  }

  if (descLower.includes('text') || descLower.includes('label')) {
    const matches = description.match(/text[:\s]+"([^"]+)"/gi) ||
                    description.match(/label[:\s]+"([^"]+)"/gi) ||
                    description.match(/["']([^"']+)["']/g);

    if (matches) {
      matches.slice(0, 5).forEach((match, i) => {
        const text = match.replace(/["']/g, '').replace(/^(text|label)[:\s]*/i, '');
        elements.push(createText(
          centerX - 200 + i * 150,
          currentY,
          text,
          elementId++,
          style
        ));
      });
    }
  }

  // If no elements were generated, create a default scene
  if (elements.length === 0) {
    elements.push(createRectangle(centerX - 200, centerY - 100, 150, 100, elementId++, style));
    elements.push(createRectangle(centerX + 50, centerY - 100, 150, 100, elementId++, style));
    elements.push(createArrow(centerX - 50, centerY - 50, centerX + 50, centerY - 50, elementId++, style));
    elements.push(createText(centerX - 125, centerY - 150, 'Start', elementId++, style));
    elements.push(createText(centerX + 125, centerY - 150, 'End', elementId++, style));
  }

  // Return Excalidraw format
  return {
    type: 'excalidraw',
    version: 2,
    source: 'https://github.com/zsviczian/obsidian-excalidraw-plugin/releases/tag/2.6.0',
    elements: elements,
    appState: {
      gridSize: 20,
      viewBackgroundColor: '#ffffff',
      currentItemFontFamily: 1,
      currentItemStrokeColor: '#1e1e1e',
      currentItemBackgroundColor: 'transparent',
      currentItemStartArrowhead: null,
      currentItemEndArrowhead: 'arrow',
      currentLinearStrokeSharpness: 'sharp',
      gridModeEnabled: true,
      zoom: 1,
    },
    files: {},
  };
}

// Helper functions to create elements
function createRectangle(x, y, width, height, id, style) {
  const roughness = style === 'hand-drawn' ? 2 : 0;
  return {
    id: generateId(),
    type: 'rectangle',
    x: x + (Math.random() - 0.5) * roughness,
    y: y + (Math.random() - 0.5) * roughness,
    width: width,
    height: height,
    angle: 0,
    strokeColor: '#000000',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: roughness,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: { type: 3 },
    seed: Math.floor(Math.random() * 1000),
    versionNonce: generateId(),
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
  };
}

function createEllipse(x, y, width, height, id, style) {
  const roughness = style === 'hand-drawn' ? 2 : 0;
  return {
    id: generateId(),
    type: 'ellipse',
    x: x + (Math.random() - 0.5) * roughness,
    y: y + (Math.random() - 0.5) * roughness,
    width: width,
    height: height,
    angle: 0,
    strokeColor: '#000000',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: roughness,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: { type: 3 },
    seed: Math.floor(Math.random() * 1000),
    versionNonce: generateId(),
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
  };
}

function createArrow(x1, y1, x2, y2, id, style) {
  const roughness = style === 'hand-drawn' ? 2 : 0;
  return {
    id: generateId(),
    type: 'arrow',
    x: x1 + (Math.random() - 0.5) * roughness,
    y: y1 + (Math.random() - 0.5) * roughness,
    width: x2 - x1,
    height: y2 - y1,
    angle: 0,
    strokeColor: '#000000',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: roughness,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: { type: 3 },
    seed: Math.floor(Math.random() * 1000),
    versionNonce: generateId(),
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
    startBinding: null,
    endBinding: null,
    lastCommittedPoint: null,
    startArrowhead: null,
    endArrowhead: 'arrow',
    points: [[0, 0], [x2 - x1, y2 - y1]],
  };
}

function createText(x, y, content, id, style) {
  const roughness = style === 'hand-drawn' ? 1 : 0;
  return {
    id: generateId(),
    type: 'text',
    x: x,
    y: y,
    width: 100,
    height: 20,
    angle: 0,
    strokeColor: '#000000',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: roughness,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: Math.floor(Math.random() * 1000),
    versionNonce: generateId(),
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
    text: content,
    fontSize: 20,
    fontFamily: 1,
    textAlign: 'left',
    verticalAlign: 'top',
  };
}

// Utility functions
function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

function countMatches(str, regex) {
  const matches = str.match(regex);
  return matches ? matches.length : 0;
}

// Polyfill for crypto.randomUUID
if (!crypto.randomUUID) {
  crypto.randomUUID = () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };
}
