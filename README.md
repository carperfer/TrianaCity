# IsoCity

An isometric city builder in JavaScript

![screenshot](screenshot.png)

[Live version](https://victorribeiro.com/isocity)

[Alternative link](https://victorqribeiro.github.io/isocity/)

## About

A simple JavaScript city builder with no simulation at all. No budget, no goals. Just build your tiny city. This project now features a modern ES6 architecture with save/load functionality and configurable grid sizes.

## Features

- 🏗️ **Configurable Grid**: Choose grid sizes from 5×5 to 20×20
- 💾 **Save/Load Cities**: Export and import your cities as JSON files
- 🔗 **URL Sharing**: Share cities via URL hash (backward compatible)
- 🎨 **72 Building Tiles**: Isometric buildings, trees, and landscape elements
- 🖱️ **Intuitive Controls**: Left-click to place, right-click to erase, drag to paint
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔍 **Tile Search**: Quickly find tiles by index number

## How to Use

1. **Select a Tile**: Click on any building/object in the right panel
2. **Place Tiles**: Left-click on the canvas to place the selected tile
3. **Erase Tiles**: Right-click to remove tiles
4. **Paint Mode**: Hold down mouse button and drag to continuously place tiles
5. **Save Your City**: Click "💾 Save City" to download as JSON
6. **Load a City**: Click "📂 Load City" to import a saved JSON file
7. **Adjust Grid**: Change grid size (5-20) and click "Apply"
8. **Share**: Copy the URL to share your city with others

## Technical Details

### Architecture

The project uses modern ES6 modules with a clean separation of concerns:

- **config.js**: Configuration and constants
- **state.js**: Game state management and serialization
- **renderer.js**: Canvas rendering and isometric projection
- **ui.js**: User interface and controls
- **fileManager.js**: JSON save/load operations
- **textureManager.js**: Sprite sheet management
- **app.js**: Main application controller

### Technologies

- Pure vanilla JavaScript (ES6+)
- HTML5 Canvas API
- CSS3 with Flexbox
- No external dependencies

### File Format

Cities are saved in JSON format:
```json
{
  "version": "2.0",
  "gridSize": 7,
  "map": [[...], [...]],
  "timestamp": "2026-01-28T..."
}
```

## Adding More Textures

See [TEXTURES.md](TEXTURES.md) for instructions on adding new Kenney sprite sheets to the project.

## Development

### Running Locally

```bash
# Serve the directory with any static file server
python3 -m http.server 8000
# or
npx serve
```

Then open `http://localhost:8000` in your browser.

### Project Structure

```
TrianaCity/
├── index.html          # Main HTML page
├── css/
│   └── main.css       # Styles and responsive design
├── js/
│   ├── app.js         # Main application
│   ├── config.js      # Configuration
│   ├── state.js       # State management
│   ├── renderer.js    # Canvas rendering
│   ├── ui.js          # UI components
│   ├── fileManager.js # Save/load
│   └── textureManager.js # Texture loading
├── textures/
│   └── 01_*.png       # Kenney sprite sheet
└── README.md
```

## Texture Credits

Textures from - [Kenney.nl](https://opengameart.org/users/kenney)

Original isometric landscape pack: http://www.kenney.nl

## License

This project builds upon the original IsoCity. Kenney assets are CC0 (Public Domain).

## Contributing

Contributions are welcome! Some ideas for enhancements:

- Multiple texture pack switching
- Undo/redo history UI
- Keyboard shortcuts
- Zoom and pan
- Export as PNG image
- Building categories and tags
- Randomize tool
- Copy/paste areas
