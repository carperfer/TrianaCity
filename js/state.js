// State management module
import { config } from './config.js';

export class GameState {
    constructor() {
        this.gridSize = config.grid.defaultSize;
        this.map = this.createEmptyMap(this.gridSize);
        this.selectedTool = [0, 0, 0]; // [textureId, row, col]
        this.activeTool = null;
        this.isPlacing = false;
        this.previousState = null;
    }

    createEmptyMap(size) {
        return Array(size).fill(null).map(() => 
            Array(size).fill(null).map(() => [0, 0, 0])
        );
    }

    setGridSize(size) {
        if (size < config.grid.minSize || size > config.grid.maxSize) {
            throw new Error(`Grid size must be between ${config.grid.minSize} and ${config.grid.maxSize}`);
        }
        
        const oldMap = this.map;
        const oldSize = this.gridSize;
        this.gridSize = size;
        this.map = this.createEmptyMap(size);
        
        // Copy old map data (top-left corner)
        const copySize = Math.min(oldSize, size);
        for (let i = 0; i < copySize; i++) {
            for (let j = 0; j < copySize; j++) {
                const tile = oldMap[i][j];
                // Convert old format [row, col] to new [textureId, row, col]
                this.map[i][j] = tile.length === 2 ? [0, tile[0], tile[1]] : tile;
            }
        }
    }

    setTile(x, y, textureId, texX, texY) {
        if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
            this.map[x][y] = [textureId, texX, texY];
            return true;
        }
        return false;
    }

    getTile(x, y) {
        if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
            return this.map[x][y];
        }
        return null;
    }

    // Export state as JSON
    exportToJSON() {
        return {
            version: "2.0",
            gridSize: this.gridSize,
            map: this.map,
            timestamp: new Date().toISOString()
        };
    }

    // Import state from JSON
    importFromJSON(data) {
        if (!data || !data.version) {
            throw new Error('Invalid save file format');
        }
        
        this.gridSize = data.gridSize || config.grid.defaultSize;
        this.map = data.map || this.createEmptyMap(this.gridSize);
        
        // Convert old format to new if needed
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.map[i][j].length === 2) {
                    this.map[i][j] = [0, this.map[i][j][0], this.map[i][j][1]];
                }
            }
        }
    }

    // URL hash serialization (backward compatible)
    toHashState() {
        const tiles = [];
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const [textureId, texRow, texCol] = this.map[i][j];
                tiles.push(`${textureId}:${texRow}:${texCol}`);
            }
        }
        return btoa(`${this.gridSize}|${tiles.join(',')}`);
    }

    fromHashState(state) {
        if (!state) return;
        
        try {
            const decoded = atob(state);
            const parts = decoded.split('|');
            
            if (parts.length >= 2) {
                // New format: gridSize|textureId:row:col,...
                this.gridSize = parseInt(parts[0]);
                const tiles = parts[1].split(',');
                this.map = this.createEmptyMap(this.gridSize);
                
                let idx = 0;
                for (let i = 0; i < this.gridSize; i++) {
                    for (let j = 0; j < this.gridSize; j++) {
                        if (idx < tiles.length && tiles[idx]) {
                            const tileData = tiles[idx].split(':');
                            if (tileData.length === 3) {
                                this.map[i][j] = [
                                    parseInt(tileData[0]),
                                    parseInt(tileData[1]),
                                    parseInt(tileData[2])
                                ];
                            }
                        }
                        idx++;
                    }
                }
            } else {
                // Old format: binary encoding
                const u8 = this.fromBase64(state);
                let c = 0;
                
                for (let i = 0; i < this.gridSize; i++) {
                    for (let j = 0; j < this.gridSize; j++) {
                        const t = u8[c++] || 0;
                        const x = Math.trunc(t / config.texture.columns);
                        const y = Math.trunc(t % config.texture.columns);
                        this.map[i][j] = [0, x, y];
                    }
                }
            }
        } catch (e) {
            console.error('Error loading hash state:', e);
        }
    }

    toBase64(u8) {
        return btoa(String.fromCharCode.apply(null, u8));
    }

    fromBase64(str) {
        return atob(str).split('').map(c => c.charCodeAt(0));
    }
}
