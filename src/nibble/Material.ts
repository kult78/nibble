
import * as log from "./Logging.js";
import * as res from "./Resources.js";
import * as env from "./WebEnv.js";
import * as sh from "./Shader.js";
import { FatalError } from "./Common.js";

export class Material {
    constructor(vertexId: string, fragmentId: string) {
        this.vertexId = vertexId; 
        this.fragmentId = fragmentId;
        this.id = vertexId + "+" + fragmentId;
        this.recreate();
    } 

    private recreate() {
        this.program = sh.getProgram(this.vertexId, this.fragmentId);
    }

    public use(
        tex0: WebGLTexture | null, 
        tex1: WebGLTexture | null = null, 
        tex2: WebGLTexture | null = null, 
        tex3: WebGLTexture | null = null) {
        let gl: WebGLRenderingContext = env.gl;
  
        if(!this.program || !this.program.getSetup() || !this.program.getSetup().u_tex0)
            throw new FatalError(`Invalid object state in [${this.id}] Material`);

        this.program.use();

        gl.uniform1i(this.program.getSetup().u_tex0, 0);
        gl.activeTexture(gl.TEXTURE0 + 0);
        gl.bindTexture(gl.TEXTURE_2D, tex0);
    
        if(this.zTest)
            gl.enable(gl.DEPTH_TEST);
        else
            gl.disable(gl.DEPTH_TEST);

        if(this.zWrite)
            gl.depthMask(true);
        else
            gl.depthMask(false);

        if(this.fbOp == "alpha") {
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.enable(gl.BLEND);
        } else if(this.fbOp == "add") {
            gl.blendFunc(gl.ONE, gl.ONE);
            gl.enable(gl.BLEND);
        } else if(this.fbOp == "put") { 
            gl.disable(gl.BLEND);
        }
 
        if(this.texFilter) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        }
    }

    public getProgram(): sh.Program {
        if(this.program == null) throw new FatalError(`No program in Material [${this.id}]`);
        return this.program;
    }

    private id: string;
    private vertexId: string
    private fragmentId: string
    private program: sh.Program | null = null;
    
    public zTest: boolean = true;
    public zWrite: boolean = true;
    public fbOp: string = "write";
    public texFilter: boolean = false;
}

let materials: Map<string, Material> = new Map<string, Material>();

export function getMaterial(id: string): Material {
    if(materials.has(id) == false) throw new FatalError(`No material called [${id}]`);
    return materials.get(id)!;
}

export function addMaterialsFromFile(url: string) {
    let text = res.getText(url);
    if(text == null) {
        throw new FatalError(`Failed to get material file [${url}]`);
        return;
    }

    let gl: WebGLRenderingContext = env.gl;
    const obj = JSON.parse(text);

    obj.materials.forEach((mo : any) => {
        const m: Material = new Material(mo.vs, mo.fs);
        if(mo.ztest != undefined) m.zTest = mo.ztest;
        if(mo.zwrite != undefined) m.zWrite = mo.zwrite;
        if(mo.fbop != undefined) m.fbOp = mo.fbop;
        if(mo.texfilter != undefined) m.texFilter = mo.tex;
        materials.set(mo.id, m);
        log.info(`Material [${mo.id}] created`, "tech");
    });
}