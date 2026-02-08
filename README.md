# Remotion + Excalidraw + TTS Video Generation

专业手绘风格视频生成工具，整合 Remotion、Excalidraw 和 TTS 功能。

## 🎬 功能特性

- **Remotion** - React 视频框架，编程式视频制作
- **Excalidraw** - 手绘风格图表生成
- **TTS** - 文本转语音，自动配音

适用于：
- 教程视频
- 白板式解说
- 教育内容
- 产品演示
- 概念可视化

## 📋 目录结构

```
remotion-excalidraw-tts/
├── SKILL.md                      # 技能说明（Clawdbot 使用）
├── README.md                     # 本文件
├── scripts/                      # 工具脚本
│   ├── setup-project.sh          # 初始化 Remotion 项目
│   ├── generate-video.js         # 从脚本生成视频
│   ├── create-excalidraw.js      # 创建 Excalidraw 场景
│   ├── generate-tts.js           # 生成语音
│   └── merge-tts.js              # 合并语音与视频
├── templates/                    # 项目模板
│   └── simple-whiteboard/        # 简单白板模板
│       ├── package.json
│       ├── remotion.config.ts
│       └── src/
│           ├── Root.tsx
│           ├── HelloWorld.tsx
│           └── WhiteboardScene.tsx
└── projects/                     # 用户项目（自动创建）
    └── example/
```

## 🚀 快速开始

### 1. 安装依赖

```bash
# 检查 Node.js（需要 v18+）
node --version

# 检查 FFmpeg
ffmpeg -version

# 安装 Remotion CLI
npm install -g remotion-cli
```

### 2. 创建新项目

```bash
node /root/clawd/skills/remotion-excalidraw-tts/scripts/setup-project.sh \
  --name "my-video" \
  --template "simple-whiteboard"
```

### 3. 生成视频

#### 方法 A：使用脚本 JSON

```json
{
  "title": "我的视频",
  "duration": 30,
  "scenes": [
    {
      "id": "scene1",
      "duration": 10,
      "title": "介绍",
      "elements": [
        {
          "type": "text",
          "content": "你好，世界！",
          "x": 100,
          "y": 100,
          "fontSize": 48
        },
        {
          "type": "rectangle",
          "x": 200,
          "y": 200,
          "width": 300,
          "height": 200
        }
      ]
    }
  ]
}
```

```bash
node /root/clawd/skills/remotion-excalidraw-tts/scripts/generate-video.js \
  --project "./projects/my-video" \
  --script "./script.json" \
  --output "./output/video.mp4"
```

#### 方法 B：使用 Remotion Studio

```bash
cd projects/my-video
npm start
```

在浏览器中打开 http://localhost:3000 进行可视化编辑。

## 🛠️ 工具说明

### setup-project.sh

初始化新的 Remotion 项目。

```bash
node scripts/setup-project.sh --name <项目名> --template <模板>
```

参数：
- `--name` - 项目名称（必需）
- `--template` - 模板名称（默认：simple-whiteboard）
- `--path` - 自定义路径（默认：projects/<名称>）

### generate-video.js

从脚本生成视频。

```bash
node scripts/generate-video.js --project <路径> --script <路径> [选项]
```

参数：
- `--project` - 项目路径（必需）
- `--script` - 脚本 JSON 路径（必需）
- `--output` - 输出视频路径（默认：output/video.mp4）
- `--resolution` - 分辨率（默认：1920x1080）
- `--fps` - 帧率（默认：30）

### create-excalidraw.js

从文本描述创建 Excalidraw 场景。

```bash
node scripts/create-excalidraw.js --description <描述> --output <路径>
```

参数：
- `--description` - 场景描述（必需）
- `--output` - 输出 JSON 路径（必需）
- `--style` - 绘图风格（默认：hand-drawn）

### generate-tts.js

从文本生成语音。

```bash
node scripts/generate-tts.js --text <文本> --output <路径> [选项]
```

参数：
- `--text` - 要转换的文本（必需）
- `--output` - 输出音频路径（必需）
- `--voice` - 声音 ID（默认：default）
- `--speed` - 语速 0.5-2.0（默认：1.0）
- `--engine` - TTS 引擎（默认：auto）

### merge-tts.js

合并音频与视频。

```bash
node scripts/merge-tts.js --video <视频> --audio <音频> --output <输出>
```

参数：
- `--video` - 视频文件路径（必需）
- `--audio` - 音频文件路径（必需）
- `--output` - 输出视频路径（必需）
- `--volume` - 音频音量 0.0-2.0（默认：1.0）

## 📝 脚本格式

### 简单场景（JSON）

```json
{
  "title": "示例视频",
  "duration": 30,
  "scenes": [
    {
      "id": "scene1",
      "duration": 10,
      "title": "场景标题",
      "elements": [
        {
          "type": "text",
          "content": "文本内容",
          "x": 50,
          "y": 50,
          "fontSize": 48,
          "color": "#000000"
        },
        {
          "type": "rectangle",
          "x": 100,
          "y": 100,
          "width": 200,
          "height": 150,
          "strokeColor": "#e03131"
        },
        {
          "type": "circle",
          "x": 400,
          "y": 200,
          "radius": 50
        },
        {
          "type": "arrow",
          "x1": 100,
          "y1": 100,
          "x2": 400,
          "y2": 200
        }
      ],
      "voiceover": "这是场景的旁白文本。"
    }
  ]
}
```

### 支持的元素类型

| 类型 | 说明 | 属性 |
|------|------|------|
| `text` | 文本 | content, x, y, fontSize, color |
| `rectangle` | 矩形 | x, y, width, height, strokeColor |
| `circle` | 圆形 | x, y, radius, strokeColor |
| `arrow` | 箭头 | x1, y1, x2, y2, strokeColor |
| `line` | 线条 | x1, y1, x2, y2, strokeColor |

## 🎙️ TTS 配置

在 `~/.clawdbot/tts-config.json` 配置 TTS：

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

支持的 TTS 引擎：
- **ElevenLabs** - 最佳质量（需要 API key）
- **Google TTS** - 免费层级
- **Azure Speech** - 多语言支持

## 💡 使用示例

### 示例 1：简单教程

```json
{
  "title": "如何烤蛋糕",
  "duration": 60,
  "scenes": [
    {
      "id": "scene1",
      "duration": 15,
      "title": "材料准备",
      "elements": [
        {"type": "text", "content": "面粉", "x": 100, "y": 100, "fontSize": 36},
        {"type": "text", "content": "糖", "x": 100, "y": 150, "fontSize": 36},
        {"type": "text", "content": "鸡蛋", "x": 100, "y": 200, "fontSize": 36}
      ],
      "voiceover": "首先，准备材料：面粉、糖和鸡蛋。"
    }
  ]
}
```

### 示例 2：概念图

```json
{
  "title": "系统架构",
  "duration": 45,
  "scenes": [
    {
      "id": "scene1",
      "duration": 20,
      "title": "组件",
      "elements": [
        {
          "type": "rectangle",
          "x": 100,
          "y": 100,
          "width": 150,
          "height": 100,
          "strokeColor": "#1e88e5",
          "label": "数据库"
        },
        {
          "type": "rectangle",
          "x": 400,
          "y": 100,
          "width": 150,
          "height": 100,
          "strokeColor": "#43a047",
          "label": "API"
        },
        {
          "type": "arrow",
          "x1": 250,
          "y1": 150,
          "x2": 400,
          "y2": 150
        }
      ],
      "voiceover": "系统由数据库和 API 两个主要组件组成。"
    }
  ]
}
```

## 🔧 故障排除

### Remotion CLI 未找到

```bash
npm install -g remotion-cli
```

### FFmpeg 未找到

**Ubuntu/Debian:**
```bash
sudo apt install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

### 视频生成失败

- 检查 Node.js 版本（需要 v18+）
- 确保所有依赖已安装：`npm install`
- 检查脚本 JSON 格式是否有效
- 验证输出目录存在且可写

### TTS 生成失败

- 检查 TTS API key 是否已配置
- 验证文本编码为 UTF-8
- 检查输出目录权限

## 💡 使用技巧

1. **从简单开始** - 先使用 simple-whiteboard 模板
2. **迭代测试** - 先生成短测试视频
3. **使用 Excalidraw** - 从 app.excalidraw.com 导出复杂场景
4. **先计时音频** - 在生成视频先生成 TTS 以便更好的时序控制
5. **批量场景** - 生成多个场景，然后组合

## 📚 相关资源

- Remotion: https://www.remotion.dev/
- Excalidraw: https://excalidraw.com/
- Excalidraw Export: https://github.com/excalidraw/excalidraw
- Remotion 文档: https://www.remotion.dev/docs

## 📄 许可

MIT License
