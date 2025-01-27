
import * as env from "./WebEnv.js";
import * as c from "./Common.js";
import { Texture, getTexture } from "./Texture.js"
import { Material, getMaterial } from "./Material.js"
import { FatalError } from "./Common.js";

export class SpriteBatch {
    constructor() {
    }

    public addVertex(v: c.Vertex) {
        this.data.push(v.x);
        this.data.push(v.y);
        this.data.push(v.u0);
        this.data.push(v.v0);
        this.data.push(v.r);
        this.data.push(v.g);
        this.data.push(v.b);
        this.data.push(v.a);
    }

    public begin() { this.clear(); }
    public end(texture: Texture | null) { this.render(texture); }
    
    public sprite(
        x: number, y: number, w: number, h: number, 
        align: c.Align2d, uv: c.UvRect, color: c.Color, 
        flipX: boolean, flipY: boolean,
        scale: number, rotate: number, 
        renderAspect: number) {

        w *= scale;
        h *= scale;
        w *= renderAspect;

        let ox0 = -1.0 * (w / 2.0);
        let oy0 = -1.0 * (h / 2.0);
        let ox1 = w / 2.0;
        let oy1 = h / 2.0;

        let x0 = ox0 * Math.cos(rotate) - oy0 * Math.sin(rotate) + x;
        let y0 = oy0 * Math.cos(rotate) + ox0 * Math.sin(rotate) + y;
        let x1 = ox1 * Math.cos(rotate) - oy0 * Math.sin(rotate) + x;
        let y1 = oy0 * Math.cos(rotate) + ox1 * Math.sin(rotate) + y;
        let x2 = ox0 * Math.cos(rotate) - oy1 * Math.sin(rotate) + x;
        let y2 = oy1 * Math.cos(rotate) + ox0 * Math.sin(rotate) + y;
        let x3 = ox1 * Math.cos(rotate) - oy0 * Math.sin(rotate) + x;
        let y3 = oy0 * Math.cos(rotate) + ox1 * Math.sin(rotate) + y;
        let x4 = ox1 * Math.cos(rotate) - oy1 * Math.sin(rotate) + x;
        let y4 = oy1 * Math.cos(rotate) + ox1 * Math.sin(rotate) + y;
        let x5 = ox0 * Math.cos(rotate) - oy1 * Math.sin(rotate) + x;
        let y5 = oy1 * Math.cos(rotate) + ox0 * Math.sin(rotate) + y;

        let trX: number = w / 2;
        let trY: number = h / 2;

        if(align == c.Align2d.Centre) {
            trX = 0;
            trY = 0;
        } else if(align == c.Align2d.BottomLeft) {

        } else if(align == c.Align2d.BottomCentre) {
            trX = 0;            
        }

        let u0: number = uv.u0;
        let v0: number = uv.v0;
        let u1: number = uv.u1;
        let v1: number = uv.v1;

        if(flipX) { const temp = u1; u1 = u0; u0 = temp; }
        if(flipY == false) { const temp = v1; v1 = v0; v0 = temp; }

        const vx0 = c.Vertex.from2d(x0, y0, u0, v0, color);
        const vx1 = c.Vertex.from2d(x1, y1, u1, v0, color);
        const vx2 = c.Vertex.from2d(x2, y2, u0, v1, color);
        const vx3 = c.Vertex.from2d(x3, y3, u1, v0, color);
        const vx4 = c.Vertex.from2d(x4, y4, u1, v1, color);
        const vx5 = c.Vertex.from2d(x5, y5, u0, v1, color);

        this.addVertex(vx0);
        this.addVertex(vx1);
        this.addVertex(vx2);

        this.addVertex(vx3);
        this.addVertex(vx4);
        this.addVertex(vx5);
    }

    public clear() {
        this.data = [];
    }

    public setMaterial(id: string) {
        if(id === "") {
            this.material = null;
            return;
        }
        this.material = getMaterial(id);
    }

    public setTexture(id: string) {
        if(id === "") {
            this.texture = null;
            return;
        }
        this.texture = getTexture(id);
    }

    public render(texture : Texture | null = null) {

        if(this.data.length == 0)
            return;

        if(this.material == null) throw new FatalError("No material in SpriteBatch to render with");
        if(texture == null && this.texture == null) throw new FatalError("No texture in SpriteBatch to render with");

        let useTexture = this.texture;
        if(texture) useTexture = texture;
        
        let gl = env.gl;

        if(this.buffer == null) {            
            this.buffer = gl.createBuffer();
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.data), gl.DYNAMIC_DRAW);

        let shaderSetup = this.material.getProgram().getSetup();

        let xyLoc = shaderSetup.a_xy;
        gl.enableVertexAttribArray(xyLoc);
        gl.vertexAttribPointer(xyLoc, 2, gl.FLOAT, false, 8 * 4, 0);

        let uv0Loc = shaderSetup.a_uv0;
        gl.enableVertexAttribArray(uv0Loc);
        gl.vertexAttribPointer(uv0Loc, 2, gl.FLOAT, false, 8 * 4, 2 * 4);

        let rgbaLoc = shaderSetup.a_rgba;
        gl.enableVertexAttribArray(rgbaLoc);
        gl.vertexAttribPointer(rgbaLoc, 4, gl.FLOAT, false, 8 * 4, 2 * 4 + 2 * 4);

        if(texture)
            this.material!.use(texture.getApiTexture());
        else
            this.material!.use(useTexture!.getApiTexture());

        gl.drawArrays(gl.TRIANGLES, 0, this.data.length / 8);        
       
    }


    private material: Material | null = null;
    private texture: Texture | null = null;

    private buffer: WebGLBuffer | null = null;
    private data: number[] = [];

}


