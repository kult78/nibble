import { Texture } from "./nibble/index.js";

type GlyphData = {
    width: number;
    height: number;
    bitmap: string[];
};

type FontData = {
    glyphs: Record<string, GlyphData>;
    kerning: Record<string, number>;
};

type GlyphMeta = { 
    x: number;
    y: number;
    width: number;
    height: number;
    kerning: Record<string, number>;
};

type FontTexture = {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    glyphs: Record<string, GlyphMeta>;
};

export class Font {
    private fontTexture: FontTexture;
    private fontData: FontData;

    constructor(fileContent: string) {
        this.fontData = loadFontData(fileContent);
        this.fontTexture = createFontTexture(this.fontData);
    }

    //public getTexture(): Texture {
    //  return this.fontTexture.canvas;
    //}

    public getGlyph(char: string): GlyphMeta | undefined {
        return this.fontTexture.glyphs[char];
    }

    public getKerning(char1: string, char2: string): number {
        const glyph1 = this.getGlyph(char1);
        if (!glyph1) return 0;
        return glyph1.kerning[char2] || 0;
    }

}

function loadFontData(fileContent: string): FontData {
    return JSON.parse(fileContent);
}

function nextPowerOfTwo(n: number): number {
    return Math.pow(2, Math.ceil(Math.log2(n)));
}

function calculateTextureSize(fontData: FontData): number {
    let totalArea = 0;
    for (const glyph of Object.values(fontData.glyphs)) {
        totalArea += glyph.width * glyph.height;
    }
    const estimatedSize = Math.sqrt(totalArea) * 1.5;
    return nextPowerOfTwo(estimatedSize);
}

function createFontTexture(fontData: FontData): FontTexture {
    const textureSize = calculateTextureSize(fontData);
    const canvas = document.createElement('canvas');
    canvas.width = textureSize;
    canvas.height = textureSize;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, textureSize, textureSize);

    let x = 0, y = 0, maxRowHeight = 0;
    const glyphs: Record<string, GlyphMeta> = {};

    for (const [char, glyph] of Object.entries(fontData.glyphs)) {
        if (x + glyph.width > textureSize) {
            x = 0;
            y += maxRowHeight + 2;
            maxRowHeight = 0;
        }

        const imageData = ctx.createImageData(glyph.width, glyph.height);
        for (let row = 0; row < glyph.height; row++) {
            for (let col = 0; col < glyph.width; col++) {
                const alpha = parseInt(glyph.bitmap[row].substring(col * 2, col * 2 + 2), 16);
                const index = (row * glyph.width + col) * 4;
                imageData.data[index] = 255;
                imageData.data[index + 1] = 255;
                imageData.data[index + 2] = 255;
                imageData.data[index + 3] = alpha;
            }
        }
        ctx.putImageData(imageData, x, y);

        glyphs[char] = { 
            x, 
            y, 
            width: glyph.width, 
            height: glyph.height, 
            kerning: (typeof fontData.kerning[char] === 'number') 
                ? { [char]: fontData.kerning[char] }
                : (fontData.kerning[char] || {}) as Record<string, number>
        };
                
        x += glyph.width + 2;
        maxRowHeight = Math.max(maxRowHeight, glyph.height);
    }

    return { canvas, context: ctx, glyphs };
}

/*
function saveTexture(texture: FontTexture, outputPath: string) {
    const dataURL = texture.canvas.toDataURL('image/png');
    const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(outputPath, buffer);
}

function saveGlyphData(glyphs: Record<string, GlyphMeta>, outputPath: string) {
    fs.writeFileSync(outputPath, JSON.stringify(glyphs, null, 4));
}

// Example usage (Note: running this in the browser context):
const fontData = loadFontData('font.json');
const texture = createFontTexture(fontData);
saveTexture(texture, 'font_texture.png');
saveGlyphData(texture.glyphs, 'font_glyphs.json');
*/