# Guía de Combinación de Texturas

## ✨ Nueva Funcionalidad

IsoCity ahora soporta **combinación de texturas múltiples en el mismo mapa**. Puedes mezclar tiles de diferentes sprite sheets para crear ciudades más variadas y detalladas.

## 🎨 Cómo Funciona

### Selección de Texturas
1. Usa el dropdown **"Texture:"** en los controles superiores para cambiar entre texturas disponibles:
   - **Original** - Textura base de IsoCity (12×6 grid)
   - **Buildings** - Edificios de Kenney (atlas XML)
   - **City** - Elementos urbanos de Kenney (atlas XML)

2. Cada vez que seleccionas una nueva textura, la paleta de herramientas se actualiza mostrando los tiles disponibles.

### Colocación de Tiles Mixtos
1. **Selecciona una textura** del dropdown
2. **Elige un tile** de la paleta de herramientas inferior
3. **Haz clic en el mapa** para colocar el tile
4. **Cambia a otra textura** y repite el proceso
5. Los tiles de diferentes texturas coexistirán en el mapa

### Ejemplo de Uso
```
1. Seleccionar "Original" → Colocar césped base
2. Seleccionar "Buildings" → Añadir edificios
3. Seleccionar "City" → Agregar calles y detalles
4. Resultado: Mapa con tiles de las 3 texturas
```

## 💾 Formato de Datos

### Nuevo Formato de Tiles
Cada tile ahora se guarda con 3 valores:
```javascript
[textureId, texRow, texCol]
```

- **textureId**: Índice de la textura (0 = Original, 1 = Buildings, 2 = City)
- **texRow**: Fila del sprite en la textura
- **texCol**: Columna del sprite en la textura

### Ejemplo de Mapa
```javascript
{
  "version": "2.0",
  "gridSize": 7,
  "map": [
    [[0, 1, 2], [1, 3, 4], [2, 0, 1]], // Fila 1: Original, Buildings, City
    [[0, 0, 0], [0, 2, 3], [1, 1, 1]], // Fila 2: vacío, Original, Buildings
    // ...
  ],
  "timestamp": "2026-01-28T..."
}
```

## 🔄 Compatibilidad

### Retrocompatibilidad
El sistema mantiene compatibilidad con mapas antiguos:

- **Archivos antiguos**: Formato `[texRow, texCol]` se convierte automáticamente a `[0, texRow, texCol]`
- **URL hash antiguos**: Se detecta y convierte el formato binario legacy
- **Sin pérdida de datos**: Todos los mapas existentes funcionarán sin cambios

### Formato de Guardado
- **JSON files** (.json): Incluyen textureId explícitamente
- **URL hash**: Nuevo formato `textureId:row:col` separado por comas
- **Detección automática**: El sistema reconoce formato antiguo vs nuevo

## 🎯 Ventajas

### Creatividad
- **Variedad visual**: Combina estilos de múltiples packs
- **Detalle fino**: Usa texturas especializadas para elementos específicos
- **Capas temáticas**: Base + Edificios + Decoración

### Flexibilidad
- **Sin limitaciones**: No hay restricción de cuántas texturas usar
- **Cambio dinámico**: Cambia de textura sin perder trabajo previo
- **Atlas + Grid**: Soporta ambos formatos simultáneamente

### Organización
- **Texturas por categoría**: Edificios, naturaleza, infraestructura separados
- **Fácil expansión**: Añade nuevas texturas sin modificar mapas existentes
- **Identificación clara**: Cada tile "recuerda" su textura de origen

## 🛠️ Implementación Técnica

### Cambios en el Estado
```javascript
// Antes
setTile(x, y, texRow, texCol)

// Ahora  
setTile(x, y, textureId, texRow, texCol)
```

### Renderizado Multi-Textura
El renderer ahora:
1. Lee el `textureId` de cada tile
2. Obtiene la textura correspondiente del TextureManager
3. Dibuja usando coordenadas específicas (grid o atlas)
4. Soporta mezcla de texturas grid y atlas en el mismo mapa

### Serialización
```javascript
// Nuevo formato hash
textureId:row:col,textureId:row:col,...

// Ejemplo
0:1:2,1:3:4,2:0:1
// = Original tile (1,2), Buildings (3,4), City (0,1)
```

## 📌 Notas Importantes

- **Selección automática**: Al seleccionar un tile, se guarda su textureId
- **Click derecho**: Siempre limpia a `[0,0,0]` (tile vacío de Original)
- **Zoom y grid**: Funcionan igual independiente de la mezcla de texturas
- **Performance**: Sin impacto, cada tile dibuja desde su textura específica

## 🚀 Próximos Pasos

Posibles mejoras futuras:
- Indicador visual de qué textura está activa
- Filtro para ver solo tiles de una textura específica
- Estadísticas de uso por textura
- Importar/exportar por capas (una textura a la vez)
