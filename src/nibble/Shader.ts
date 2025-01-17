
import * as log from "./Logging.js";
import * as env from "./WebEnv.js";
import * as resources from "./Resources.js";
import { FatalError } from "./Common.js";

export enum ShaderType { Vertex, Fragment }

export class Shader {
    constructor(id: string, type: ShaderType, source: string) {
        this.id = id;
        this.type = type;
        this.source = source;
        this.recompile();
    }

    private recompile() {
        let gl: WebGLRenderingContext = env.gl;

        this.shader = gl.createShader(this.type == ShaderType.Vertex ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);
        if(this.shader == null) {
            throw new FatalError("Failed to create shader");
        }

        gl.shaderSource(this.shader, this.source);
        gl.compileShader(this.shader);
        if(!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
            throw new FatalError(`Failed to compile shader: ${gl.getShaderInfoLog(this.shader)}`);
        }
    }

    private type: ShaderType;
    private source: string;
    private id: string;
    public shader: WebGLShader | null = null;
}

let shaders: Map<string, Shader> = new Map<string, Shader>();

export function createShader(id: string, type: ShaderType, source: string) : Shader {
    let shader: Shader = new Shader(id, type, source);
    shaders.set(id, shader); 
    return shader;
}

export function getShader(id: string): Shader | null {
    if(shaders.has(id)) return shaders.get(id)!;

    let shaderSource: string | null = resources.getText(id);

    if(shaderSource != null) {
        if(id.endsWith(".vs")) return createShader(id, ShaderType.Vertex, shaderSource!);
        if(id.endsWith(".fs")) return createShader(id, ShaderType.Fragment, shaderSource!);
    }

    throw new FatalError(`Failed to get shader [${id}]`);
}

// ----------

export class Program {
    constructor(vertexShaderId: string, fragmenShaderId: string) {
        this.vertexShaderId = vertexShaderId;
        this.fragmentShaderId = fragmenShaderId;
        this.relink();
    } 

    private relink() {
        let gl: WebGLRenderingContext = env.gl;

        let vertexShader: Shader | null = getShader(this.vertexShaderId);
        if(vertexShader == null) { throw new FatalError(`Vertex shader [${this.vertexShaderId}] not found`); }
        let fragmentShader: Shader | null = getShader(this.fragmentShaderId);
        if(fragmentShader == null) { throw new FatalError(`Fragment shader [${this.fragmentShaderId}] not found`); }

        this.dispose();

        this.program = gl.createProgram();
        if(this.program == null) { throw new FatalError("Failed to create program"); }

        gl.attachShader(this.program, vertexShader.shader!);
        gl.attachShader(this.program, fragmentShader.shader!);
        gl.linkProgram(this.program);

        if(!gl.getProgramParameter(this.program, gl.LINK_STATUS)) 
            throw new FatalError(`Failed to link program: ${gl.getProgramInfoLog(this.program)}`);
        else
            log.info(`Program linked: ${this.vertexShaderId}+${this.fragmentShaderId}`, "tech");

        this.setup = new ShaderSetup(this.program);
    } 

    public use() {
        env.gl.useProgram(this.program);
    }

    public dispose() {
        if(this.program != null) {
            env.gl.deleteProgram(this.program);
            this.program = null;
        }
    }

    public getSetup(): ShaderSetup {
        if(this.setup == null) throw new FatalError(`No setup in program: ${this.vertexShaderId}+${this.fragmentShaderId}`);
        return this.setup;
    }

    public vertexShaderId: string;
    public fragmentShaderId: string;
    public program: WebGLProgram | null = null;
    private setup: ShaderSetup | null = null;

}

// ----------

let programs: Map<string, Program> = new Map<string, Program>();

export function getProgram(vertexId: string, fragmentId: string): Program {
    if(programs.has(vertexId + "+" + fragmentId)) {
        return programs.get(vertexId + "+" + fragmentId)!;
    }

    let program: Program = new Program(vertexId, fragmentId);
    programs.set(vertexId + "+" + fragmentId, program);
    return program;
}

// ----------

export class ShaderSetup {     
    constructor(program: WebGLProgram) {
        this.program = program;
        this.updateLocations();
    }

    private program: WebGLProgram;

    public set_u_texres0(width: number, height: number) { if(this.u_texres0 != null) env.gl.uniform2f(this.u_texres0, width, height); }
    public set_u_fbres(width: number, height: number) { if(this.u_fbres != null) env.gl.uniform2f(this.u_fbres, width, height); }
    public set_u_time(time: number) { if(this.u_time != null) env.gl.uniform1f(this.u_time, time); }

    public a_xy: number = -1;
    public a_uv0: number = -1;
    public a_rgba: number = -1;

    public u_texres0: WebGLUniformLocation | null = null;
    public u_fbres: WebGLUniformLocation | null = null;
    public u_time: WebGLUniformLocation | null = null;
    public u_tex0: WebGLUniformLocation | null = null;

    private updateLocations() {
        this.a_xy = env.gl.getAttribLocation(this.program, "a_xy");
        this.a_uv0 = env.gl.getAttribLocation(this.program, "a_uv0");
        this.a_rgba = env.gl.getAttribLocation(this.program, "a_rgba");
        
        this.u_texres0 = env.gl.getUniformLocation(this.program, "u_texres0");
        this.u_fbres = env.gl.getUniformLocation(this.program, "u_fbres");
        this.u_time = env.gl.getUniformLocation(this.program, "u_time");
        this.u_tex0 = env.gl.getUniformLocation(this.program, "u_tex0");
    }  
}

