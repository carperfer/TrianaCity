// File save/load management
export class FileManager {
    static saveToFile(gameState, filename = 'city.json') {
        const data = gameState.exportToJSON();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    static loadFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    resolve(data);
                } catch (error) {
                    reject(new Error('Invalid JSON file'));
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    static generateFilename() {
        const date = new Date();
        const timestamp = date.toISOString().replace(/[:.]/g, '-').slice(0, -5);
        return `isocity-${timestamp}.json`;
    }
}
