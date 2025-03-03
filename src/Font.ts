import * as n from "./nibble/index.js";

export class Glyph {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public yOffset: number = 0;
    public topBearing: number = 0;
    public unicode: string = "";
    public map: string = "";

    public positionX: number = 0;
    public positionY: number = 0;
    public u0: number = 0;
    public v0: number = 0;
    public u1: number = 0;
    public v1: number = 0;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

export class Font {

    private glyphs = new Map<string, Glyph>();
    private kerning = new Map<string, number>();  
    private bitmapWidth: number = 0;
    private bitmapHeight: number = 0;

    public ascent: number = 0.0;
    public descent: number = 0.0;
    public lineHeight: number = 0.0;

    private fontTexture: n.Texture;
    private fontName: string;
 
    constructor(fontName: string, fileContent: string) {      
        this.fontName = fontName;

        const json = JSON.parse(fileContent);

        Object.entries(json.glyphs).forEach(([key, value] : any) => {
            const g = new Glyph(value.x, value.y, value.width, value.height);
            g.unicode = String(key);
            g.yOffset = value.yOffset;
            g.topBearing = value.topBearing;
            g.map = value.bitmap.join("");
            this.glyphs.set(key, g); 
        });

        this.ascent = Number(json.fontMetrics.ascent);
        this.descent = Number(json.fontMetrics.descent);
        this.lineHeight = Number(json.fontMetrics.lineHeight);

        Object.entries(json.kerning).forEach(([key, value] : any) => {
            this.kerning.set(key, value);
        });

        this.fontTexture = this.generateTexture();

        n.info(`Font [{fontName}] loaded with ${this.glyphs.size} glyphs and texture ${this.bitmapWidth}x${this.bitmapHeight}`, "tech");
    }

    public hasGlyph(unicode: string): boolean { return this.glyphs.has(unicode); }
    
    public getGlyph(unicode: string): Glyph | null { 
        if(!this.glyphs.has(unicode)) return null;
        return this.glyphs.get(unicode)!; 
    }

    public getBitmapWidth(): number { return this.bitmapWidth; }
    public getBitmapHeight(): number { return this.bitmapHeight; }
    public getTexture(): n.Texture { return this.fontTexture; }
    public getApiTexture(): WebGLTexture { return this.fontTexture.getApiTexture(); }
    
    private nextPowerOfTwo(n: number): number { return Math.pow(2, Math.ceil(Math.log2(n))); }

    private calculateTextureSize() {
        if (this.glyphs.size === 0) throw new Error("No glyphs in font");
    
        // Sort glyphs by height (descending) to optimize packing
        const sortedGlyphs = [...this.glyphs.values()].sort((a, b) => b.height - a.height);
    
        let totalArea = 0;
        let maxWidth = 0;
        let rowHeight = sortedGlyphs[0].height; // Use the tallest glyph as row height
    
        // Calculate total area and track max width
        for (const glyph of sortedGlyphs) {
            totalArea += glyph.width * glyph.height;
            maxWidth = Math.max(maxWidth, glyph.width);
        }
    
        // Start with a power-of-two width slightly larger than the largest glyph
        let width = this.nextPowerOfTwo(Math.max(128, maxWidth)); // Ensure minimum width
        let height = this.nextPowerOfTwo(Math.ceil(totalArea / width));
    
        // Place glyphs using row-based packing
        let currentX = 0;
        let currentY = 0;
    
        for (const glyph of sortedGlyphs) {
            // If the glyph doesn't fit in the current row, start a new row
            if (currentX + glyph.width > width) {
                currentX = 0;
                currentY += rowHeight; // Move to the next row
            }
    
            glyph.positionX = currentX;
            glyph.positionY = currentY;
    
            currentX += glyph.width;
        }
    
        // Adjust final height to fit all rows and round up to the nearest power of two
        height = this.nextPowerOfTwo(currentY + rowHeight);
    
        this.bitmapWidth = width;
        this.bitmapHeight = height;
    
        // Calculate UV coordinates
        const tw = 1.0 / this.bitmapWidth;
        const th = 1.0 / this.bitmapHeight;
        for (const glyph of this.glyphs.values()) {
            glyph.u0 = glyph.positionX * tw + tw / 2.0;
            glyph.v0 = glyph.positionY * th + th / 2.0;
            glyph.u1 = (glyph.positionX + glyph.width) * tw - tw / 2.0;
            glyph.v1 = (glyph.positionY + glyph.height) * th - th / 2.0;

            glyph.v0 = 1.0 - glyph.v0;
            glyph.v1 = 1.0 - glyph.v1;
        }
    }
     
    private calculateTextureSize_() {
        if (this.glyphs.size === 0) throw new n.FatalError("No glyphs in font");
    
        const sortedGlyphs = [...this.glyphs.values()].sort((a, b) => b.height - a.height);
    
        let totalArea = 0;
        let maxWidth = 0;
        let maxHeight = 0;
    
        for (const glyph of sortedGlyphs) {
            totalArea += glyph.width * glyph.height;
            maxWidth = Math.max(maxWidth, glyph.width);
            maxHeight = Math.max(maxHeight, glyph.height);
        }
    
        let width = this.nextPowerOfTwo(maxWidth);
        let height = this.nextPowerOfTwo(Math.ceil(totalArea / width));
    
        while (width * height < totalArea) {
            if (width <= height) {
                width = this.nextPowerOfTwo(width * 2);
            } else {
                height = this.nextPowerOfTwo(height * 2);
            }
        }
    
        let currentX = 0;
        let currentY = 0;
        let rowHeight = 0;
    
        for (const glyph of sortedGlyphs) {
            if (currentX + glyph.width > width) {
                currentX = 0;
                currentY += rowHeight;
                rowHeight = 0;
            }
    
            glyph.positionX = currentX;
            glyph.positionY = currentY;
    
            currentX += glyph.width;
    
            rowHeight = Math.max(rowHeight, glyph.height);
        }
    
        this.bitmapWidth = width;
        this.bitmapHeight = height;

        const tw = 1.0 / this.bitmapWidth;
        const th = 1.0 / this.bitmapHeight;
        for(const [key, value] of this.glyphs) {
            value.u0 = value.positionX * tw + tw / 2.0;
            value.v0 = value.positionY * th + th / 2.0;
            value.u1 = (value.positionX + value.width) * tw - tw / 2.0;
            value.v1 = (value.positionY + value.height) * th - th / 2.0;
        }        
    }

    private hexDumpToBuffer(hexDump: string): ArrayBuffer {
        const cleanedHex = hexDump.replace(/\s+/g, '').toLowerCase();
        console.log(cleanedHex);
        if (cleanedHex.length % 2 !== 0) {
            throw new Error("Invalid hex dump: must have an even number of characters.");
        }

        const buffer = new ArrayBuffer(cleanedHex.length / 2);
        const uint8Array = new Uint8Array(buffer);

        for (let i = 0; i < cleanedHex.length; i += 2) {
            const byteHex = cleanedHex.substring(i, i + 2);
            uint8Array[i / 2] = parseInt(byteHex, 16);
        }
        return buffer;
    }

    private generateTexture(): n.Texture {
        this.calculateTextureSize();

        let bitmap: n.BitmapRGBA = new n.BitmapRGBA(this.bitmapWidth, this.bitmapHeight);

        for(let y = 0; y < bitmap.height; y++) 
            for(let x = 0; x < bitmap.width; x++) 
                bitmap.setPixel(x, y, 0x12345678);

        for(const [codepoint, glyph] of this.glyphs) {
            const srcBin: ArrayBuffer = this.hexDumpToBuffer(glyph.map);
            const src = new Uint8Array(srcBin);

            for(let y = 0; y < glyph.height; y++) {
                for(let x = 0; x < glyph.width; x++) {
                    let alpha = src[y * glyph.width + x];
                    bitmap.setPixel(glyph.positionX + x, glyph.positionY + y, 0xffffff00 | alpha);               
                }
            }
        }

        return n.createTexture(this.fontName, bitmap);
    }

    private extractRGBA(canvas: HTMLCanvasElement): Uint8ClampedArray {
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("CanvasRenderingContext2D is not supported.");
        }
    
        const width = canvas.width;
        const height = canvas.height;
    
        const imageData = ctx.getImageData(0, 0, width, height);
        return imageData.data;
    }
    
    public getKerning(char0: string, char1: string): number {
        const key = char0 + char1;
        if(this.kerning.has(key)) return this.kerning.get(key)!;
        return 0;
    }
}


