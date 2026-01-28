// Canvas rendering module
import { config } from './config.js';

export class Renderer {
    constructor(bgCanvas, fgCanvas, texture) {
        this.bgCanvas = bgCanvas;
        this.fgCanvas = fgCanvas;
        this.texture = texture;
        
        this.bgCtx = bgCanvas.getContext('2d');
        this.fgCtx = fgCanvas.getContext('2d');
        
        this.currentGridSize = config.grid.defaultSize;
        this.zoomLevel = 1.0;
        this.minZoom = 0.5;
        this.maxZoom = 2.0;
        this.resizeCanvas(this.currentGridSize);
    }

    resizeCanvas(gridSize) {
        // Calculate needed canvas size based on grid
        const minWidth = 910;
        const minHeight = 666;
        
        // Isometric projection needs more space for larger grids
        const neededWidth = Math.max(minWidth, gridSize * config.canvas.tileWidth + 200);
        const neededHeight = Math.max(minHeight, gridSize * config.canvas.tileHeight + 300);
        
        this.bgCanvas.width = neededWidth;
        this.bgCanvas.height = neededHeight;
        this.fgCanvas.width = neededWidth;
        this.fgCanvas.height = neededHeight;
        
        this.currentGridSize = gridSize;
        
        // Reset and reapply transform
        this.bgCtx.setTransform(1, 0, 0, 1, 0, 0);
        this.fgCtx.setTransform(1, 0, 0, 1, 0, 0);
        
        this.setupTransform(this.bgCtx, neededWidth);
        this.setupTransform(this.fgCtx, neededWidth);
    }

    setupTransform(ctx, width) {
        const w = width || config.canvas.width;
        ctx.translate(
            w / 2, 
            config.canvas.tileHeight * 2
        );
        ctx.scale(this.zoomLevel, this.zoomLevel);
    }

    setZoom(delta) {
        const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel + delta));
        if (newZoom !== this.zoomLevel) {
            this.zoomLevel = newZoom;
            this.resizeCanvas(this.currentGridSize);
            return true;
        }
        return false;
    }

    getZoomLevel() {
        return this.zoomLevel;
    }

    drawMap(gameState, textureManager) {
        // Update canvas size if grid changed
        if (gameState.gridSize !== this.currentGridSize) {
            this.resizeCanvas(gameState.gridSize);
        }
        
        const w = this.bgCanvas.width;
        const h = this.bgCanvas.height - 204;
        this.bgCtx.clearRect(-w, -h, w * 2, h * 2);
        
        for (let i = 0; i < gameState.gridSize; i++) {
            for (let j = 0; j < gameState.gridSize; j++) {
                const tile = gameState.getTile(i, j);
                const [textureId, texRow, texCol] = tile.length === 3 ? tile : [0, tile[0], tile[1]];
                this.drawImageTile(this.bgCtx, i, j, textureId, texRow, texCol, textureManager);
            }
        }
    }

    drawImageTile(ctx, x, y, textureId, texRow, texCol, textureManager) {
        ctx.save();
        ctx.translate(
            (y - x) * config.canvas.tileWidth / 2,
            (x + y) * config.canvas.tileHeight / 2
        );
        
        // Get the specific texture for this tile
        const textures = textureManager.getAllTextures();
        const tileTexture = textures[textureId] || textures[0];
        
        if (tileTexture && tileTexture.isAtlas && tileTexture.sprites) {
            // Calculate sprite index from row/col
            const spriteIndex = texRow * tileTexture.columns + texCol;
            const sprite = tileTexture.sprites[spriteIndex];
            
            if (sprite) {
                // Use sprite dimensions from XML directly
                // Center horizontally and anchor at bottom of isometric tile
                const offsetX = -sprite.width / 2;
                const offsetY = -sprite.height + config.canvas.tileHeight;
                
                ctx.drawImage(
                    tileTexture.image,
                    sprite.x, sprite.y, sprite.width, sprite.height,
                    offsetX, offsetY, sprite.width, sprite.height
                );
            }
        } else if (tileTexture) {
            // Regular grid-based texture
            const srcX = texCol * config.texture.tileWidth;
            const srcY = texRow * config.texture.tileHeight;
            
            ctx.drawImage(
                tileTexture.image,
                srcX, srcY,
                config.texture.tileWidth, config.texture.tileHeight,
                -65, -130,
                config.texture.tileWidth, config.texture.tileHeight
            );
        }
        ctx.restore();
    }
    
    getCurrentTextureInfo() {
        return this.textureInfo || null;
    }
    
    setTextureInfo(textureInfo) {
        this.textureInfo = textureInfo;
    }

    drawTilePreview(x, y, color = 'rgba(0,0,0,0.2)') {
        const w = this.fgCanvas.width;
        const h = this.fgCanvas.height - 204;
        this.fgCtx.clearRect(-w, -h, w * 2, h * 2);
        
        this.fgCtx.save();
        this.fgCtx.translate(
            (y - x) * config.canvas.tileWidth / 2,
            (x + y) * config.canvas.tileHeight / 2
        );
        
        this.fgCtx.beginPath();
        this.fgCtx.moveTo(0, 0);
        this.fgCtx.lineTo(config.canvas.tileWidth / 2, config.canvas.tileHeight / 2);
        this.fgCtx.lineTo(0, config.canvas.tileHeight);
        this.fgCtx.lineTo(-config.canvas.tileWidth / 2, config.canvas.tileHeight / 2);
        this.fgCtx.closePath();
        this.fgCtx.fillStyle = color;
        this.fgCtx.fill();
        this.fgCtx.restore();
    }

    clearPreview() {
        const w = this.fgCanvas.width;
        const h = this.fgCanvas.height - 204;
        this.fgCtx.clearRect(-w, -h, w * 2, h * 2);
    }

    getGridPosition(offsetX, offsetY, gridSize) {
        // Use current canvas dimensions and zoom level
        const canvasWidth = this.fgCanvas.width;
        const pivotX = canvasWidth / 2;
        const pivotY = config.canvas.tileHeight * 2;
        
        // Adjust for zoom
        const adjustedOffsetX = (offsetX - pivotX) / this.zoomLevel;
        const adjustedOffsetY = (offsetY - pivotY) / this.zoomLevel;
        
        const _y = adjustedOffsetY / config.canvas.tileHeight;
        const _x = adjustedOffsetX / config.canvas.tileWidth;
        const x = Math.floor(_y - _x);
        const y = Math.floor(_x + _y);
        return { x, y };
    }
}
