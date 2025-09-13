
import * as mt from "./Material.js"
import * as tex from "./Texture.js"
import * as env from "./WebEnv.js"
import * as c from "./Common.js";
import { Program } from "./Shader.js";

export enum GeometryAlign {
    None = 0,
    Center = 1,
    Pivot = 2
}

export enum GeometryFormat {
    xyUvRgba,
    xyzNxnynzUvRgba
}

function getVertexFloatSize(format: GeometryFormat): number {
    if(format == GeometryFormat.xyUvRgba) return 8;
    if(format == GeometryFormat.xyzNxnynzUvRgba) return 12;
    throw new c.FatalError(`Unknown vertex format: ${format}`);
}

export class Geometry {
    constructor(format: GeometryFormat, data: number[]){ //, align: GeometryAlign = GeometryAlign.None) {
        this.format = format; 

        if(format == GeometryFormat.xyUvRgba) {
            this.data = new Float32Array(data);
        } else if(format == GeometryFormat.xyzNxnynzUvRgba) {
            this.computeDimensions(data);
            
            /*
            if(align != GeometryAlign.None) {
                this.alignGeometry(data, align);
                this.computeDimensions(data);
            }*/
            
            this.data = new Float32Array(data);
        } else {
            throw new c.FatalError(`Not proper Geometry constructor vertex format: ${format}`);
        }
    }

    private alignGeometry(vertices: number[], align: GeometryAlign) {
        let floatPerVertex = getVertexFloatSize(this.format);
        if(align == GeometryAlign.Center) {
            for(let i = 0; i < vertices.length; i += floatPerVertex) {
                vertices[i] -= this.centre.x;
                vertices[i + 1] -= this.centre.y;
                vertices[i + 2] -= this.centre.z;
            }
        } else if (align == GeometryAlign.Pivot) {
            for(let i = 0; i < vertices.length; i += floatPerVertex) {
                vertices[i] -= this.centre.x;
                vertices[i + 1] += this.minY;
                vertices[i + 2] -= this.centre.z;
            }
        }
    }

    private computeDimensions(vertices: number[]) {
        this.centre = new c.Vector3(0, 0, 0);
        let floatPerVertex = getVertexFloatSize(this.format);

        if(this.format == GeometryFormat.xyzNxnynzUvRgba) {

            this.minX = this.minY = this.minZ = Number.MAX_VALUE;
            this.maxX = this.maxY = this.maxZ = Number.MIN_VALUE;

            for(let i = 0; i < vertices.length; i += floatPerVertex) {
                this.centre.x += vertices[i];
                this.centre.y += vertices[i + 1];
                this.centre.z += vertices[i + 2];

                if(vertices[i] < this.minX) this.minX = vertices[i];
                if(vertices[i] > this.maxX) this.maxX = vertices[i];
                if(vertices[i + 1] < this.minY) this.minY = vertices[i + 1];
                if(vertices[i + 1] > this.maxY) this.maxY = vertices[i + 1];
                if(vertices[i + 2] < this.minZ) this.minZ = vertices[i + 2];
                if(vertices[i + 2] > this.maxZ) this.maxZ = vertices[i + 2];
            }
            this.centre.x /= vertices.length / floatPerVertex;
            this.centre.y /= vertices.length / floatPerVertex;
            this.centre.z /= vertices.length / floatPerVertex;
        } else {
            throw new c.FatalError(`Not proper Geometry center computation: ${this.format}`);
        }
    }

    public centre: c.Vector3 = new c.Vector3(0, 0, 0);
    public minX: number = 0;
    public minY: number = 0;
    public minZ: number = 0;
    public maxX: number = 0;
    public maxY: number = 0;
    public maxZ: number = 0;

    public render(program: Program) {
        let gl = env.gl;

        if(this.buffer == null) {            
            this.buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW);
        } else {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        }

        let shaderSetup = program.getSetup();
        let stride: number = 4 * getVertexFloatSize(this.format);

        if(this.format == GeometryFormat.xyUvRgba) {

            let xyLoc = shaderSetup.a_xy;
            gl.enableVertexAttribArray(xyLoc);
            gl.vertexAttribPointer(xyLoc, 2, gl.FLOAT, false, stride, 0);

            let uv0Loc = shaderSetup.a_uv0;
            gl.enableVertexAttribArray(uv0Loc);
            gl.vertexAttribPointer(uv0Loc, 2, gl.FLOAT, false, stride, 4 * 2);
    
            let rgbaLoc = shaderSetup.a_rgba;
            gl.enableVertexAttribArray(rgbaLoc);
            gl.vertexAttribPointer(rgbaLoc, 4, gl.FLOAT, false, stride, 4 * 2 + 4 * 2);
    
            let allVertices = this.data!.length / getVertexFloatSize(this.format);
            gl.drawArrays(gl.TRIANGLES, 0, allVertices);           
        }

        if(this.format == GeometryFormat.xyzNxnynzUvRgba) {

            let xyzLoc = shaderSetup.a_xyz;
            gl.enableVertexAttribArray(xyzLoc);
            gl.vertexAttribPointer(xyzLoc, 3, gl.FLOAT, false, stride, 0);

            let nxnynzLoc = shaderSetup.a_nxnynz;
            gl.enableVertexAttribArray(nxnynzLoc);
            gl.vertexAttribPointer(nxnynzLoc, 3, gl.FLOAT, false, stride, 4 * 3);

            let uv0Loc = shaderSetup.a_uv0;
            gl.enableVertexAttribArray(uv0Loc);
            gl.vertexAttribPointer(uv0Loc, 2, gl.FLOAT, false, stride, 4 * 3 + 4 * 3);
    
            let rgbaLoc = shaderSetup.a_rgba;
            gl.enableVertexAttribArray(rgbaLoc);
            gl.vertexAttribPointer(rgbaLoc, 4, gl.FLOAT, false, stride, 4 * 3 + 4 * 3 + 4 * 2);
    
            let allVertices = this.data!.length / getVertexFloatSize(this.format);
            gl.drawArrays(gl.TRIANGLES, 0, allVertices);           
        }
    }

    public dispose() {
        if(this.buffer) env.gl.deleteBuffer(this.buffer);
        this.buffer = null;
    }


    private format: GeometryFormat;
    private data: Float32Array | null = null;
    private buffer : WebGLBuffer | null = null; 
}

// ----------

export class GeometryBuilder {
    constructor(format: GeometryFormat) {
        this.format = format;
    }

    public current(): c.Vertex { return this.vertex; }

    public commitVertex() {
        if(this.format == GeometryFormat.xyUvRgba) {
            this.data.push(this.vertex.x);
            this.data.push(this.vertex.y);
            this.data.push(this.vertex.u0);
            this.data.push(this.vertex.v0);
            this.data.push(this.vertex.r);
            this.data.push(this.vertex.g);
            this.data.push(this.vertex.b); 
            this.data.push(this.vertex.a);
        } else if(this.format == GeometryFormat.xyzNxnynzUvRgba) {
            this.data.push(this.vertex.x);
            this.data.push(this.vertex.y);
            this.data.push(this.vertex.z);
            this.data.push(this.vertex.ny);
            this.data.push(this.vertex.ny); 
            this.data.push(this.vertex.nz);
            this.data.push(this.vertex.u0);
            this.data.push(this.vertex.v0);
            this.data.push(this.vertex.r);
            this.data.push(this.vertex.g); 
            this.data.push(this.vertex.b);
            this.data.push(this.vertex.a);
        } else {
            throw new c.FatalError(`Unknown vertex format in builder: ${this.format}`);
        }
    }

    public clear() { this.data = []; }

    public createGeometry(/*align: GeometryAlign = GeometryAlign.None*/) : Geometry {
        let geometry = new Geometry(this.format, this.data);//, align);
        return geometry;
    }

    private vertex = new c.Vertex();   
    private format: GeometryFormat;
    private data: number[] = [];
}

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

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.textureId = texture;
        this.materialId = material;
    }

    private x: number = 0;
    private y: number = 0;
    private w: number = 0;
    private h: number = 0;

    public checkXYWH(x: number, y: number, w: number, h: number): boolean {
        if(this.x != x) return false;
        if(this.y != y) return false;
        if(this.w != w) return false;
        if(this.h != h) return false;
        return true;
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
    public renderWithTexture(apiTexture: WebGLTexture) {
        if(this.material == null) this.material = mt.getMaterial(this.materialId);
        this.renderBuffer(this.material, apiTexture);
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

