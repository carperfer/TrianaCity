# IsoCity - Copilot Instructions

## Project Overview

**IsoCity** is an interactive isometric city builder web application with no simulation mechanics. Users place isometric building tiles on a configurable grid (5x5 to 20x20) without budget, goals, or scoring. The application uses Canvas for rendering, ES6 modules for architecture, and supports JSON save/load functionality with URL hash encoding for sharing.

## Architecture & Data Model

### Module Structure (ES6)
- **config.js**: Configuration constants and DOM helper functions
- **state.js**: GameState class managing map data and serialization
- **renderer.js**: Renderer class handling Canvas drawing operations
- **ui.js**: UIManager class for controls, tool palette, and notifications
- **fileManager.js**: Static methods for JSON save/load operations
- **textureManager.js**: TextureManager class for multi-spritesheet support
- **app.js**: IsoCityApp main application controller

### Core Data Structure
- **GameState.map**: Dynamic 2D array `map[i][j] = [texRow, texCol]` representing grid tiles
- **Grid size**: Configurable from 5×5 to 20×20 (default: 7×7)
- Each tile references coordinates in sprite sheet (12×6 = 72 tiles by default)
- State serializable to **JSON** (with metadata) or **Base64** (URL hash, backward compatible)

### Rendering Pipeline
- **Dual Canvas Setup**: 
  - `#bg` (background): Static isometric grid, redrawn on tile placement
  - `#fg` (foreground): Real-time preview/hover overlay, cleared continuously
- **Isometric Projection**: Canvas transform with pivot at `(width/2, tileHeight*2)`
  - Tile position: `translate((y-x)*64, (x+y)*32)` where tile dimensions are 128×64px
  - Texture coordinates: Row offset by 230px, column offset by 130px

## Key Workflows

### Application Initialization
1. `TextureManager.loadDefaultTextures()` loads sprite sheet(s) asynchronously
2. `Renderer` initializes dual canvas with transforms
3. `UIManager.generateToolPalette()` creates clickable tile selector grid
4. Load state from URL hash or start with empty map
5. Setup event handlers for canvas interactions and controls

### Tile Placement
1. User clicks foreground canvas → `Renderer.getGridPosition()` converts mouse to grid coords
2. Left-click: Place selected tool tile; Right-click: Clear tile (set to [0,0])
3. `GameState.setTile()` updates map array
4. `Renderer.drawMap()` redraws entire background canvas
5. `updateHashState()` encodes map into URL hash via `history.pushState()`

### Save/Load System
- **Save**: `FileManager.saveToFile()` exports `GameState.exportToJSON()` with timestamp
- **Load**: `FileManager.loadFromFile()` reads JSON, validates, calls `GameState.importFromJSON()`
- **JSON format**: `{version, gridSize, map, timestamp}`
- Files downloaded as `isocity-YYYY-MM-DD.json`

### Grid Resizing
- User changes grid size input → `GameState.setGridSize()` creates new map
- Old map data copied to top-left corner (preserves existing work)
- Canvas redrawn with new dimensions, hash updated

## Project Conventions

### JavaScript Style
- **ES6 modules**: `import`/`export` syntax throughout
- **Class-based OOP**: GameState, Renderer, UIManager, TextureManager
- **Static utilities**: FileManager methods, config helpers `$()`, `$c()`
- **Async/await**: Texture loading and file operations
- **No external frameworks**: Pure vanilla JS with Canvas API

### Responsive Design
CSS breakpoints adjust tool panel width:
- 1700px: 580px → 440px
- 1540px: 440px → 300px  
- 1380px: 300px → 160px
- 966px: Column layout (mobile) with horizontal tool scroll

### Texture Asset Format
- Default sprite sheet: `textures/01_130x66_130x230.png` (1560×1380px)
- Grid: 12 columns × 6 rows = 72 tile variations
- Each tile: 130px wide × 230px tall (with 2px border padding)
- See [TEXTURES.md](TEXTURES.md) for adding new Kenney sprite sheets

## Input Handling

- **Mouse Events**: `mousedown`, `mouseup`, `mousemove` on #fg canvas
- **Touch/Pointer Events**: `touchend`, `pointerup` for mobile support
- **Context Menu**: Prevented via `preventDefault()` to enable right-click clearing
- **Tool Selection**: Click tool-item div, updates `GameState.selectedTool`
- **Continuous Painting**: `isPlacing` flag enables drag-to-place

## Integration Points & Dependencies

- **External Textures**: Kenney.nl sprite sheets (CC0, attribution in README)
- **No external libraries**: HTML5 Canvas and native Browser APIs only
- **Browser APIs**: 
  - `history.pushState/popState()` for hash-based undo/redo
  - `FileReader`/`Blob`/`URL.createObjectURL()` for save/load
  - `btoa()/atob()` for Base64 URL encoding (backward compatibility)

## Common Development Tasks

### Adding New Tile Sprite Sheets
1. Place sprite sheet in `textures/` directory
2. Call `textureManager.addTexture(name, path, columns, rows)` in `app.js`
3. Optionally add UI switcher to change active texture
4. See [TEXTURES.md](TEXTURES.md) for detailed guide

### Expanding Grid Size Limits
- Update `config.grid.minSize` / `maxSize` in [config.js](js/config.js)
- Adjust canvas dimensions in `config.canvas` if needed for larger grids
- Consider performance implications for grids > 25×25

### Debugging Canvas Issues
- Canvas contexts: `bgCtx` for persistent grid, `fgCtx` for temporary overlays
- Transform origin at `(width/2, tileHeight*2)` - all coordinates relative to this pivot
- Isometric math: `getGridPosition()` uses `_y - _x` and `_x + _y` conversion

### State Serialization Formats
- **JSON**: Human-readable, includes metadata, preferred for save files
- **Base64 hash**: Compact, URL-safe, backward compatible with v1.0
- Conversion: `tile_index = texRow * texWidth + texCol` for encoding

### Adding UI Controls
1. Update `UIManager.createControls()` HTML template
2. Add event listener in `IsoCityApp.setupEventHandlers()`
3. Implement handler method in app class
4. Use `ui.showNotification(message, type)` for user feedback

## Error Handling

- Texture loading failures trigger alert and console error
- Invalid JSON files rejected with user notification
- Grid size validation prevents out-of-bounds values
- File operations wrapped in try-catch with error notifications
