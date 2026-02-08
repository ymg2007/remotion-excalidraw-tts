# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-02-08

### Added

- **Core Tools (5)**
  - `setup-project.sh` - Initialize Remotion projects with templates
  - `generate-video.js` - Generate videos from JSON scripts
  - `create-excalidraw.js` - Create Excalidraw scenes from text descriptions
  - `generate-tts.js` - Generate audio from text using TTS engines
  - `merge-tts.js` - Merge audio with video using FFmpeg

- **Templates (1)**
  - `simple-whiteboard` - Clean whiteboard-style template with hand-drawn elements

- **Production Features (3)**
  - `merge-videos.js` - Merge multiple videos into one
  - `generate-subtitles.js` - Create subtitle files (SRT format) from scripts
  - `batch-generate.js` - Batch generate multiple videos from script directory

- **Documentation**
  - Comprehensive README with usage examples
  - Quick-start guide (`quick-start.sh`)
  - Example scripts and templates

### Changed

- Enhanced README with complete documentation
- Added structured examples directory
- Improved script format with voiceover support

### Features

- ✅ Hand-drawn style animations using Comic Sans MS font
- ✅ Support for text, rectangles, circles, arrows, and lines
- ✅ Smooth spring-based animations
- ✅ TTS integration (ElevenLabs, Google, Azure)
- ✅ Multiple TTS engine support
- ✅ Subtitle generation in SRT format
- ✅ Video merging capabilities
- ✅ Batch processing support

### Tested

- ✅ All 5 core tools tested
- ✅ Simple whiteboard template verified
- ✅ Video generation with chromium-browser
- ✅ Sample videos generated (intro, what-is, features, use-cases)

---

## [1.0.0] - Initial Release

### Added

- Initial skill creation
- Core tool framework
- Basic template structure
- Documentation skeleton

---

## Upcoming Features

- [ ] Custom animation presets
- [ ] Advanced Excalidraw import/export
- [ ] Multiple video export formats (WebM, GIF)
- [ ] Interactive preview mode
- [ ] GPU-accelerated rendering
- [ ] Cloud deployment support
