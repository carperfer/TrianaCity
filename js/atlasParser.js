// XML Atlas Parser for Kenney sprite sheets
export class AtlasParser {
    static async parseXML(xmlPath) {
        try {
            const response = await fetch(xmlPath);
            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            const sprites = [];
            const subtextures = xmlDoc.getElementsByTagName('SubTexture');
            
            for (let i = 0; i < subtextures.length; i++) {
                const st = subtextures[i];
                sprites.push({
                    name: st.getAttribute('name'),
                    x: parseInt(st.getAttribute('x')),
                    y: parseInt(st.getAttribute('y')),
                    width: parseInt(st.getAttribute('width')),
                    height: parseInt(st.getAttribute('height'))
                });
            }
            
            return sprites;
        } catch (error) {
            console.error('Error parsing atlas XML:', error);
            return null;
        }
    }
}
