// UI management module
import { config, $, $c } from './config.js';

export class UIManager {
    constructor(toolsContainer) {
        this.toolsContainer = toolsContainer;
        this.onToolSelect = null;
        this.allTools = [];
    }

    generateToolPalette(texture, rows, columns) {
        // Create search and filter section
        const toolsWrapper = $c('div');
        toolsWrapper.className = 'tools-wrapper';
        
        const searchBar = $c('div');
        searchBar.className = 'search-bar';
        searchBar.innerHTML = `
            <input type="text" id="tileSearch" placeholder="Search tiles...">
            <button id="clearSearch" title="Clear search">×</button>
        `;
        
        const toolsGrid = $c('div');
        toolsGrid.id = 'tools-grid';
        
        this.toolsContainer.innerHTML = '';
        toolsWrapper.appendChild(searchBar);
        toolsWrapper.appendChild(toolsGrid);
        this.toolsContainer.appendChild(toolsWrapper);
        
        // Generate tools
        this.allTools = [];
        let toolCount = 0;
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                const div = $c('div');
                div.id = `tool_${toolCount++}`;
                div.className = 'tool-item';
                div.dataset.row = i;
                div.dataset.col = j;
                div.dataset.index = toolCount - 1;
                // Scale positions proportionally: 90/130 ≈ 0.692, 160/230 ≈ 0.696
                const bgPosX = Math.round(j * 90 + 1.4);
                const bgPosY = Math.round(i * 160);
                div.style.backgroundPosition = `-${bgPosX}px -${bgPosY}px`;
                div.style.backgroundImage = `url('${texture.src}')`;
                
                div.addEventListener('click', (e) => {
                    this.selectTool(e.target);
                });
                
                toolsGrid.appendChild(div);
                this.allTools.push(div);
            }
        }
        
        // Setup search
        $('#tileSearch').addEventListener('input', (e) => this.filterTools(e.target.value));
        $('#clearSearch').addEventListener('click', () => {
            $('#tileSearch').value = '';
            this.filterTools('');
        });
    }

    filterTools(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) {
            this.allTools.forEach(tool => tool.style.display = 'block');
            return;
        }
        
        this.allTools.forEach((tool, index) => {
            const matches = index.toString().includes(searchTerm);
            tool.style.display = matches ? 'block' : 'none';
        });
    }

    selectTool(element) {
        const activeTools = this.toolsContainer.querySelectorAll('.selected');
        activeTools.forEach(t => t.classList.remove('selected'));
        
        element.classList.add('selected');
        
        // Scroll to selected tool
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        const row = parseInt(element.dataset.row);
        const col = parseInt(element.dataset.col);
        
        if (this.onToolSelect) {
            this.onToolSelect(row, col);
        }
    }

    createControls() {
        const controls = $c('div');
        controls.id = 'controls';
        controls.innerHTML = `
            <h3>IsoCity</h3>
            <div class="control-group">
                <label for="gridSize">Grid:</label>
                <input type="number" id="gridSize" min="${config.grid.minSize}" max="${config.grid.maxSize}" value="${config.grid.defaultSize}">
                <button id="applyGridSize">Apply</button>
            </div>
            <div class="control-group">
                <label for="textureSelect">Tiles:</label>
                <select id="textureSelect">
                    <option value="0">Loading...</option>
                </select>
            </div>
            <div class="control-group">
                <label>Zoom:</label>
                <button id="zoomOut" title="Zoom out">−</button>
                <span id="zoomLevel">100%</span>
                <button id="zoomIn" title="Zoom in">+</button>
                <button id="zoomReset" title="Reset zoom">⟲</button>
            </div>
            <div class="control-group">
                <button id="saveCity">💾 Save</button>
                <button id="loadCity">📂 Load</button>
                <input type="file" id="fileInput" accept=".json" style="display:none">
            </div>
            <div class="control-group">
                <button id="clearMap">🗑️ Clear</button>
            </div>
        `;
        return controls;
    }

    updateTextureSelector(textures, currentIndex) {
        const selector = $('#textureSelect');
        if (!selector) return;
        
        selector.innerHTML = textures.map((tex, idx) => 
            `<option value="${idx}" ${idx === currentIndex ? 'selected' : ''}>${tex.name}</option>`
        ).join('');
    }

    updateZoomDisplay(zoomLevel) {
        const display = $('#zoomLevel');
        if (display) {
            display.textContent = `${Math.round(zoomLevel * 100)}%`;
        }
    }

    showNotification(message, type = 'info') {
        const notification = $c('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}
