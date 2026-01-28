// State management module
import { config } from './config.js';

export class GameState {
    constructor() {
        this.gridSize = config.grid.defaultSize;
        this.map = this.createEmptyMap(this.gridSize);
        this.selectedTool = [0, 0];
        this.activeTool = null;
        this.isPlacing = false;
        this.previousState = null;
    }

    createEmptyMap(size) {
        return Array(size).fill(null).map(() => 
            Array(size).fill(null).map(() => [0, 0])
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
                this.map[i][j] = oldMap[i][j];
            }
        }
    }

    setTile(x, y, texX, texY) {
        if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
            this.map[x][y] = [texX, texY];
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
    }

    // URL hash serialization (backward compatible)
    toHashState() {
        const u8 = new Uint8Array(this.gridSize * this.gridSize);
        let c = 0;
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                u8[c++] = this.map[i][j][0] * config.texture.columns + this.map[i][j][1];
            }
        }
        return this.toBase64(u8);
    }

    fromHashState(state) {
        if (!state) return;
        
        const u8 = this.fromBase64(state);
        let c = 0;
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const t = u8[c++] || 0;
                const x = Math.trunc(t / config.texture.columns);
                const y = Math.trunc(t % config.texture.columns);
                this.map[i][j] = [x, y];
            }
        }
    }

    toBase64(u8) {
        return btoa(String.fromCharCode.apply(null, u8));
    }

    fromBase64(str) {
        return atob(str).split('').map(c => c.charCodeAt(0));
    }
}
