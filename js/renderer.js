// Canvas rendering module
import { config } from './config.js';

export class Renderer {
    constructor(bgCanvas, fgCanvas, texture) {
        this.bgCanvas = bgCanvas;
        this.fgCanvas = fgCanvas;
        this.texture = texture;
        
        this.bgCanvas.width = config.canvas.width;
        this.bgCanvas.height = config.canvas.height;
        this.fgCanvas.width = config.canvas.width;
        this.fgCanvas.height = config.canvas.height;
        
        this.bgCtx = bgCanvas.getContext('2d');
        this.fgCtx = fgCanvas.getContext('2d');
        
        this.setupTransform(this.bgCtx);
        this.setupTransform(this.fgCtx);
    }

    setupTransform(ctx) {
        ctx.translate(
            config.canvas.width / 2, 
            config.canvas.tileHeight * 2
        );
    }

    drawMap(gameState) {
        const w = config.canvas.width;
        const h = config.canvas.height - 204;
        this.bgCtx.clearRect(-w, -h, w * 2, h * 2);
        
        for (let i = 0; i < gameState.gridSize; i++) {
            for (let j = 0; j < gameState.gridSize; j++) {
                const tile = gameState.getTile(i, j);
                this.drawImageTile(this.bgCtx, i, j, tile[0], tile[1]);
            }
        }
    }

    drawImageTile(ctx, x, y, texRow, texCol) {
        ctx.save();
        ctx.translate(
            (y - x) * config.canvas.tileWidth / 2,
            (x + y) * config.canvas.tileHeight / 2
        );
        
        const srcX = texCol * config.texture.tileWidth;
        const srcY = texRow * config.texture.tileHeight;
        
        ctx.drawImage(
            this.texture,
            srcX, srcY,
            config.texture.tileWidth, config.texture.tileHeight,
            -65, -130,
            config.texture.tileWidth, config.texture.tileHeight
        );
        ctx.restore();
    }

    drawTilePreview(x, y, color = 'rgba(0,0,0,0.2)') {
        const w = config.canvas.width;
        const h = config.canvas.height - 204;
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
        const w = config.canvas.width;
        const h = config.canvas.height - 204;
        this.fgCtx.clearRect(-w, -h, w * 2, h * 2);
    }

    getGridPosition(offsetX, offsetY, gridSize) {
        const _y = (offsetY - config.canvas.tileHeight * 2) / config.canvas.tileHeight;
        const _x = offsetX / config.canvas.tileWidth - gridSize / 2;
        const x = Math.floor(_y - _x);
        const y = Math.floor(_x + _y);
        return { x, y };
    }
}
