// Main application module
import { config, $ } from './config.js';
import { GameState } from './state.js';
import { Renderer } from './renderer.js';
import { UIManager } from './ui.js';
import { FileManager } from './fileManager.js';
import { TextureManager } from './textureManager.js';

class IsoCityApp {
    constructor() {
        this.state = new GameState();
        this.textureManager = new TextureManager();
        this.init();
    }

    async init() {
        try {
            // Load textures
            await this.textureManager.loadDefaultTextures();
            
            // Add Kenney atlas-based texture packs
            await this.textureManager.addTexture(
                'Buildings',
                'textures/buildingTiles_sheet.png',
                0, 0,  // Will be calculated from XML
                'textures/buildingTiles_sheet.xml'
            );
            
            await this.textureManager.addTexture(
                'City',
                'textures/cityTiles_sheet.png',
                0, 0,  // Will be calculated from XML
                'textures/cityTiles_sheet.xml'
            );
            
            const texture = this.textureManager.getCurrentTexture();
            
            // Setup canvas
            const bgCanvas = $('#bg');
            const fgCanvas = $('#fg');
            this.renderer = new Renderer(bgCanvas, fgCanvas, texture.image);

            // Setup UI
            const toolsContainer = $('#tools');
            this.ui = new UIManager(toolsContainer);
            this.ui.generateToolPalette(
                texture.image, 
                texture.rows, 
                texture.columns,
                texture.isAtlas,
                texture.sprites
            );
            
            // Store texture info in renderer
            this.renderer.setTextureInfo(texture);
            
            // Insert controls
            const mainSection = $('#main');
            const controls = this.ui.createControls();
            mainSection.insertBefore(controls, mainSection.firstChild);
            
            // Update texture selector
            this.ui.updateTextureSelector(this.textureManager.getAllTextures(), 0);

            // Load state from URL hash
            this.loadHashState();
            this.renderer.drawMap(this.state, this.textureManager);

            // Setup event handlers
            this.setupEventHandlers();
        } catch (error) {
            console.error('Failed to initialize app:', error);
            alert('Failed to load textures. Please refresh the page.');
        }
    }

    setupEventHandlers() {
        const fgCanvas = $('#fg');
        
        // Canvas events
        fgCanvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        fgCanvas.addEventListener('contextmenu', (e) => e.preventDefault());
        fgCanvas.addEventListener('mouseup', () => this.handleMouseUp());
        fgCanvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        fgCanvas.addEventListener('touchend', (e) => this.handleMouseDown(e));
        fgCanvas.addEventListener('pointerup', (e) => this.handleMouseDown(e));

        // Tool selection
        this.ui.onToolSelect = (row, col) => {
            const currentTexture = this.textureManager.currentTexture;
            const textureIndex = this.textureManager.getAllTextures().indexOf(currentTexture);
            this.state.selectedTool = [textureIndex, row, col];
        };

        // Control buttons
        $('#applyGridSize').addEventListener('click', () => this.changeGridSize());
        $('#textureSelect').addEventListener('change', (e) => this.changeTexture(e));
        $('#zoomIn').addEventListener('click', () => this.handleZoom(0.1));
        $('#zoomOut').addEventListener('click', () => this.handleZoom(-0.1));
        $('#zoomReset').addEventListener('click', () => this.handleZoomReset());
        $('#saveCity').addEventListener('click', () => this.saveCity());
        $('#loadCity').addEventListener('click', () => $('#fileInput').click());
        $('#clearMap').addEventListener('click', () => this.clearMap());
        $('#fileInput').addEventListener('change', (e) => this.loadCity(e));

        // Browser navigation
        window.addEventListener('popstate', () => {
            this.loadHashState();
            this.renderer.drawMap(this.state, this.textureManager);
        });
    }

    handleMouseMove(e) {
        if (this.state.isPlacing) {
            this.handleMouseDown(e);
        }
        
        const pos = this.renderer.getGridPosition(e.offsetX, e.offsetY, this.state.gridSize);
        
        if (pos.x >= 0 && pos.x < this.state.gridSize && 
            pos.y >= 0 && pos.y < this.state.gridSize) {
            this.renderer.drawTilePreview(pos.x, pos.y);
        } else {
            this.renderer.clearPreview();
        }
    }

    handleMouseDown(e) {
        const pos = this.renderer.getGridPosition(e.offsetX, e.offsetY, this.state.gridSize);
        
        if (pos.x >= 0 && pos.x < this.state.gridSize && 
            pos.y >= 0 && pos.y < this.state.gridSize) {
            
            let textureId, texRow, texCol;
            if (e.which === 3) {
                // Right click - clear
                textureId = 0;
                texRow = 0;
                texCol = 0;
            } else {
                [textureId, texRow, texCol] = this.state.selectedTool;
            }
            
            this.state.setTile(pos.x, pos.y, textureId, texRow, texCol);
            this.state.isPlacing = true;
            this.renderer.drawMap(this.state, this.textureManager);
            this.renderer.clearPreview();
            this.updateHashState();
        }
    }

    handleMouseUp() {
        if (this.state.isPlacing) {
            this.state.isPlacing = false;
        }
    }

    updateHashState() {
        const state = this.state.toHashState();
        if (!this.state.previousState || this.state.previousState !== state) {
            history.pushState(undefined, undefined, `#${state}`);
            this.state.previousState = state;
        }
    }

    loadHashState() {
        const hash = document.location.hash.substring(1);
        if (hash) {
            this.state.fromHashState(hash);
        }
    }

    changeGridSize() {
        const newSize = parseInt($('#gridSize').value);
        
        try {
            this.state.setGridSize(newSize);
            this.renderer.drawMap(this.state, this.textureManager);
            this.updateHashState();
            this.ui.showNotification(`Grid size changed to ${newSize}x${newSize}`, 'success');
        } catch (error) {
            this.ui.showNotification(error.message, 'error');
        }
    }

    saveCity() {
        const filename = FileManager.generateFilename();
        FileManager.saveToFile(this.state, filename);
        this.ui.showNotification(`City saved as ${filename}`, 'success');
    }

    async loadCity(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const data = await FileManager.loadFromFile(file);
            this.state.importFromJSON(data);
            
            // Update UI
            $('#gridSize').value = this.state.gridSize;
            this.renderer.drawMap(this.state, this.textureManager);
            this.updateHashState();
            
            this.ui.showNotification('City loaded successfully!', 'success');
        } catch (error) {
            this.ui.showNotification(`Error loading city: ${error.message}`, 'error');
        }
        
        // Reset file input
        e.target.value = '';
    }

    clearMap() {
        if (confirm('Are you sure you want to clear the map?')) {
            this.state.map = this.state.createEmptyMap(this.state.gridSize);
            this.renderer.drawMap(this.state, this.textureManager);
            this.updateHashState();
            this.ui.showNotification('Map cleared', 'info');
        }
    }

    handleZoom(delta) {
        if (this.renderer.setZoom(delta)) {
            this.renderer.drawMap(this.state, this.textureManager);
            this.ui.updateZoomDisplay(this.renderer.getZoomLevel());
        }
    }

    handleZoomReset() {
        this.renderer.zoomLevel = 1.0;
        this.renderer.resizeCanvas(this.state.gridSize);
        this.renderer.drawMap(this.state, this.textureManager);
        this.ui.updateZoomDisplay(1.0);
    }

    handleWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        this.handleZoom(delta);
    }

    changeTexture(e) {
        const textureIndex = parseInt(e.target.value);
        const textures = this.textureManager.getAllTextures();
        
        if (textureIndex >= 0 && textureIndex < textures.length) {
            const texture = textures[textureIndex];
            this.textureManager.currentTexture = texture;
            
            // Update renderer
            this.renderer.texture = texture.image;
            this.renderer.setTextureInfo(texture);
            
            // Regenerate tool palette
            this.ui.generateToolPalette(
                texture.image, 
                texture.rows, 
                texture.columns,
                texture.isAtlas,
                texture.sprites
            );
            
            // Redraw map
            this.renderer.drawMap(this.state, this.textureManager);
            
            this.ui.showNotification(`Switched to ${texture.name}`, 'info');
        }
    }
}

// Start the application
new IsoCityApp();
