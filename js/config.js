// Configuration module
export const config = {
    canvas: {
        width: 910,
        height: 666,
        tileWidth: 128,
        tileHeight: 64
    },
    
    grid: {
        defaultSize: 7,
        minSize: 5,
        maxSize: 20
    },
    
    texture: {
        path: "textures/01_130x66_130x230.png",
        tileWidth: 130,
        tileHeight: 230,
        columns: 12,
        rows: 6,
        borderPadding: 2
    }
};

export const $ = _ => document.querySelector(_);
export const $c = _ => document.createElement(_);
