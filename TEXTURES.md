# Adding New Textures from Kenney

This guide explains how to add new texture packs from [Kenney.nl](https://www.kenney.nl/) to IsoCity.

## ⚠️ IMPORTANTE: Formato Compatible

**El proyecto solo soporta sprite sheets con grid regular**, donde todos los tiles tienen el mismo tamaño y están organizados en filas y columnas.

### ✅ Formato Compatible (Grid Regular)
```
+-----+-----+-----+
| Img | Img | Img |  <- Todos los tiles del mismo tamaño
+-----+-----+-----+
| Img | Img | Img |  <- Organizados en grid
+-----+-----+-----+
```

### ❌ Formato NO Compatible (Atlas con XML)
Archivos como `buildingTiles_sheet.png` con `buildingTiles_sheet.xml` donde cada tile tiene posición y tamaño diferente NO funcionan con el sistema actual.

## Finding Textures

**Requisitos del sprite sheet:**
- ✅ Tiles organizados en grid regular (filas y columnas)
- ✅ Todos los tiles del mismo tamaño (ej: 130×230 pixels)
- ✅ Padding consistente entre tiles (opcional, ej: 2px)
- ❌ NO archivos XML de atlas
- ❌ NO tiles de tamaños variablesmismo tamaño en grid

## Recommended Texture Packs

Packs compatibles de Kenney:
- **Isometric Landscape** (pack actual) - Grid 12×6
- Busca packs antiguos que usen grid en lugar de atlas

**Cómo verificar**: Si el pack incluye un archivo `.xml`, probablemente usa atlas y NO es compatible.

## Adding a New Texture Pack

### 1. Prepare the Sprite Sheet

Ensure your sprite sheet follows this format:
- Tiles arranged in a grid (e.g., 12 columns × 6 rows)
- Consistent tile dimensions (e.g., 130×230 pixels)
- Optional border padding (2px recommended)

### 2. Add to Project

1. Place the sprite sheet in the `textures/` directory
2. Use a descriptive filename (e.g., `02_buildings_130x230.png`)

### 3. Update Configuration

Edit `js/config.js` to add the new texture pack:

```javascript
export const texturePacks = [
    {
        name: 'Landscape',
        path: 'textures/01_130x66_130x230.png',
        columns: 12,
        rows: 6,
        tileWidth: 130,
        tileHeight: 230
    },
    {
        name: 'Buildings',
        path: 'textures/02_buildings_130x230.png',
        columns: 10,  // Adjust based on your sheet
        rows: 8,      // Adjust based on your sheet
        tileWidth: 130,
        tileHeight: 230
    }
];
```

### 4. Update TextureManager

The `TextureManager` class will automatically load all configured texture packs. You can add multiple packs:

```javascript
// In app.js initialization
await this.textureManager.addTexture(
    'Buildings',
    'textures/02_buildings_130x230.png',
    10,  // columns
    8    // rows
);
```

### 5. UI Texture Switcher (Future Enhancement)

Currently, the app uses one texture pack at a time. To enable switching between packs, you'll need to:

1. Add a dropdown/selector in the controls panel
2. Call `textureManager.switchTexture(name)` on selection
3. Regenerate the tool palette with `ui.generateToolPalette()`
4. Redraw the map if needed

## Texture Pack Structure

Standard Kenney isometric tiles:
- **Size**: 130×230 pixels per tile
- **Projection**: Isometric (2:1 ratio)
- **Base footprint**: 128×64 pixels
- **Grid arrangement**: Left-to-right, top-to-bottom

## License

Kenney assets are typically CC0 (Public Domain). Always verify the license for each pack you download.

## Example Tile Index

For a 12×6 grid (72 tiles):
```
Tile 0:  Row 0, Col 0
Tile 1:  Row 0, Col 1
...
Tile 11: Row 0, Col 11
Tile 12: Row 1, Col 0
...
Tile 71: Row 5, Col 11
```

The app automatically generates selectable tools for all tiles in the configured grid.
