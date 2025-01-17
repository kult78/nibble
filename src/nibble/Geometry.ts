
import * as mt from "./Material.js"
import * as tex from "./Texture.js"
import * as env from "./WebEnv.js"

/*

export enum Format {
    xyUvRgba,
    xyzNxnynzUvRgba
}

function getVertexFloatSize(format: Format): number {
    if(format == Format.xyUvRgba) return 8;
    if(format == Format.xyzNxnynzUvRgba) return 15;
    throw new FatalError(`Unknown vertex format: ${format}`);
}

export class Geometry {
    constructor(format: Format) {
        this.format = format;
    }

    private format: Format;
}

export class Builder {
    constructor(format: Format) {
        this.format = format;
    }

    public current(): u.MetaVertex { return this.vertex; }

    public commitVertex() {
        if(this.format == Format.xyUvRgba) {
            this.data.push(this.vertex.x);
            this.data.push(this.vertex.y);
            this.data.push(this.vertex.u);
            this.data.push(this.vertex.v);
            this.data.push(this.vertex.r);
            this.data.push(this.vertex.g);
            this.data.push(this.vertex.b); 
            this.data.push(this.vertex.a);
        }
        if(this.format == Format.xyzNxnynzUvRgba) {
            this.data.push(this.vertex.x);
            this.data.push(this.vertex.y);
            this.data.push(this.vertex.z);
            this.data.push(this.vertex.ny);
            this.data.push(this.vertex.ny); 
            this.data.push(this.vertex.nz);
            this.data.push(this.vertex.u);
            this.data.push(this.vertex.v);
            this.data.push(this.vertex.r);
            this.data.push(this.vertex.g);
            this.data.push(this.vertex.b);
            this.data.push(this.vertex.a);
        }
        throw new FatalError(`Unknown vertex format in builder: ${this.format}`);
    }

    public clear() { this.data = []; }

    public createGeometry() : Geometry {
        let geometry = new Geometry(this.format);
        return geometry;
    }

    private vertex = new u.MetaVertex();   
    private format: Format;
    private data: number[] = [];
}
*/
// -----------------------------------------------------------------------------

export class Box {
    constructor(x: number, y: number, w: number, h: number, 
        u0: number, v0: number, u1: number, v1: number,
        r: number, g: number, b: number, a: number,
        texture: string = "", material: string = "") {

        this.data = new Float32Array(
        [
            x,     y,     u0, v0, r, g, b, a,
            x + w, y,     u1, v0, r, g, b, a,
            x,     y + h, u0, v1, r, g, b, a,
            
            x + w, y,     u1, v0, r, g, b, a,
            x + w, y + h, u1, v1, r, g, b, a,
            x,     y + h, u0, v1, r, g, b, a,
        ]);

        this.textureId = texture;
        this.materialId = material;
    }

    public dispose() {
        if(this.buffer)
            env.gl.deleteBuffer(this.buffer);

        this.buffer = null;
        this.texture = null;
        this.material = null;
    }

    public render() {
        if(this.material == null) this.material = mt.getMaterial(this.materialId);
        if(this.texture == null) this.texture = tex.getTexture(this.textureId);
        this.renderBuffer(this.material, this.texture.getApiTexture());
    }

    public renderWith(material: mt.Material, apiTexture: WebGLTexture) {
        this.renderBuffer(material, apiTexture);
    }

    private renderBuffer(material: mt.Material, apiTexture: WebGLTexture) {
        let gl = env.gl;

        if(this.buffer == null) {            
            this.buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW);
        } else {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        }

        let shaderSetup = material.getProgram().getSetup();

        let xyLoc = shaderSetup.a_xy;
        gl.enableVertexAttribArray(xyLoc);
        gl.vertexAttribPointer(xyLoc, 2, gl.FLOAT, false, 8 * 4, 0);

        let uv0Loc = shaderSetup.a_uv0;
        gl.enableVertexAttribArray(uv0Loc);
        gl.vertexAttribPointer(uv0Loc, 2, gl.FLOAT, false, 8 * 4, 2 * 4);

        let rgbaLoc = shaderSetup.a_rgba;
        gl.enableVertexAttribArray(rgbaLoc);
        gl.vertexAttribPointer(rgbaLoc, 4, gl.FLOAT, false, 8 * 4, 2 * 4 + 2 * 4);

        material!.use(apiTexture);

        gl.drawArrays(gl.TRIANGLES, 0, 6);        
    }

    public textureId : string = "";
    public materialId : string = "";
    public buffer : WebGLBuffer | null = null; 
    public texture : tex.Texture | null = null;
    public material : mt.Material | null = null;

    private data: Float32Array;
}

