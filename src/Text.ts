
import * as n from "./nibble/index.js";
import { Font, Glyph } from "./Font.js";

export class Text {

    constructor(font: Font, text: string) {
        this.font = font;
        this.text = text;
        this.geometry = new n.Geometry(n.GeometryFormat.xyUvRgba, this.buildGeometry());

        this.material = n.getMaterial("basic2d_pix")!;
    }

    public render() {
        this.material.use(this.font.getApiTexture());
        this.geometry.render(this.material.getProgram());
    }

    private buildGeometry(): number[] {
        let buffer: number[] = [];

        let baseX = 200.0;
        let baseY = 200.0;

        let prevChar = "";
        this.text.split("").forEach(char => {
            if(this.font.hasGlyph(char)) {
                let g: Glyph = this.font.getGlyph(char)!;

                let x = baseX;
                //let y = baseY - g.yOffset;
                console.log("" + this.font.ascent + " " + g.height + " " + g.topBearing);
                let y = baseY + (this.font.ascent - g.height - g.topBearing);

                let kerning = this.font.getKerning(prevChar, char);
                x = x - kerning;
                prevChar = char;
 
                buffer.push(x); buffer.push(y); buffer.push(g.u0); buffer.push(g.v1); buffer.push(1.0); buffer.push(1.0); buffer.push(1.0); buffer.push(1.0);
                buffer.push(x + g.width); buffer.push(y); buffer.push(g.u1); buffer.push(g.v1); buffer.push(1.0); buffer.push(1.0); buffer.push(1.0); buffer.push(1.0);
                buffer.push(x); buffer.push(y + g.height); buffer.push(g.u0); buffer.push(g.v0); buffer.push(1.0); buffer.push(1.0); buffer.push(1.0); buffer.push(1.0);

                buffer.push(x + g.width); buffer.push(y); buffer.push(g.u1); buffer.push(g.v1); buffer.push(1.0); buffer.push(1.0); buffer.push(1.0); buffer.push(1.0);
                buffer.push(x + g.width); buffer.push(y + g.height); buffer.push(g.u1); buffer.push(g.v0); buffer.push(1.0); buffer.push(1.0); buffer.push(1.0); buffer.push(1.0);
                buffer.push(x); buffer.push(y + g.height); buffer.push(g.u0); buffer.push(g.v0); buffer.push(1.0); buffer.push(1.0); buffer.push(1.0); buffer.push(1.0);
                
                baseX = baseX + g.width;  
            }
        });

        return buffer;
    }   

    private material: n.Material;
    private geometry: n.Geometry;
    private font: Font;
    private text: string;

}



