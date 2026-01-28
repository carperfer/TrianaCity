// Texture management module
import { config } from './config.js';

export class TextureManager {
    constructor() {
        this.textures = [];
        this.currentTexture = null;
        this.loadedCount = 0;
    }

    addTexture(name, path, columns, rows) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const texture = {
                name,
                path,
                image: img,
                columns,
                rows,
                tileWidth: config.texture.tileWidth,
                tileHeight: config.texture.tileHeight
            };
            
            img.onload = () => {
                this.textures.push(texture);
                this.loadedCount++;
                if (!this.currentTexture) {
                    this.currentTexture = texture;
                }
                resolve(texture);
            };
            
            img.onerror = () => {
                reject(new Error(`Failed to load texture: ${path}`));
            };
            
            img.src = path;
        });
    }

    async loadDefaultTextures() {
        try {
            await this.addTexture(
                'Kenney Isometric',
                config.texture.path,
                config.texture.columns,
                config.texture.rows
            );
        } catch (error) {
            console.error('Error loading default texture:', error);
            throw error;
        }
    }

    getCurrentTexture() {
        return this.currentTexture;
    }

    switchTexture(name) {
        const texture = this.textures.find(t => t.name === name);
        if (texture) {
            this.currentTexture = texture;
            return true;
        }
        return false;
    }

    getAllTextures() {
        return this.textures;
    }
}
