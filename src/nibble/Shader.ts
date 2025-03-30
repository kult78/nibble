
import * as log from "./Logging.js";
import * as env from "./WebEnv.js";
import * as resources from "./Resources.js";
import { FatalError, Color, Vector3 } from "./Common.js";

export enum ShaderType { Vertex, Fragment }

export class Shader {
    constructor(id: string, type: ShaderType, source: string) {
        this.id = id;
        this.type = type;
        this.source = source;
        this.recompile();
    }

    private recompile() {
        let gl: WebGL2RenderingContext = env.gl;

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
        let gl: WebGL2RenderingContext = env.gl;

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

    // --- effect helpers

    public set_u_texres0(width: number, height: number) { if(this.u_texres0 != null) env.gl.uniform2f(this.u_texres0, width, height); }
    public set_u_fbres(width: number, height: number) { if(this.u_fbres != null) env.gl.uniform2f(this.u_fbres, width, height); }
    public set_u_time(time: number) { if(this.u_time != null) env.gl.uniform1f(this.u_time, time); }
 
    // --- transformation matrices

    public set_u_model(mtx: number[]) { if(this.u_model_mtx != null) env.gl.uniformMatrix4fv(this.u_model_mtx, false, mtx); }
    public set_u_view(mtx: number[]) { if(this.u_view_mtx != null) env.gl.uniformMatrix4fv(this.u_view_mtx, false, mtx); }
    public set_u_projection(mtx: number[]) { if(this.u_projection_mtx != null) env.gl.uniformMatrix4fv(this.u_projection_mtx, false, mtx); }
    public set_u_normal(mtx: number[]) { if(this.u_normal_mtx != null) env.gl.uniformMatrix4fv(this.u_normal_mtx, false, mtx); }
    public set_u_camera_near(value: number) { if(this.u_camera_near != null) env.gl.uniform1f(this.u_camera_near, value); }
    public set_u_camera_far(value: number) { if(this.u_camera_far != null) env.gl.uniform1f(this.u_camera_far, value); }

    // --- fog

    public set_u_fog_enable(enable: boolean) { 
        if(this.u_fog_enable != null) 
            if(enable) 
                env.gl.uniform1i(this.u_fog_enable, 1); 
            else
                env.gl.uniform1i(this.u_fog_enable, 0); 
    }
    public set_u_fog_color(color: Color) { if(this.u_fog_color != null) env.gl.uniform4fv(this.u_fog_color, [color.r, color.g, color.b, color.a]); }
    public set_u_fog_density(density: number) { if(this.u_fog_density != null) env.gl.uniform1f(this.u_fog_density, density); }

    // --- wind

    public set_u_wind_enable(enable: boolean) {
        if(this.u_wind_enable != null) 
            if(enable) 
                env.gl.uniform1i(this.u_wind_enable, 1); 
            else
                env.gl.uniform1i(this.u_wind_enable, 0); 
    } 
    public set_u_wind_strength(strength: number) { if(this.u_wind_strength != null) env.gl.uniform1f(this.u_wind_strength, strength); }

    // ---

    public set_u_scene_albedo(color: Color) { if(this.u_scene_albedo != null) env.gl.uniform4fv(this.u_scene_albedo, [color.r, color.g, color.b, color.a]); }
    public set_u_sun_direction(direction: Vector3) { if(this.u_sun_direction != null) env.gl.uniform3fv(this.u_sun_direction, [direction.x, direction.y, direction.z]); }
    public set_u_sun_color(color: Color) { if(this.u_sun_color != null) env.gl.uniform4fv(this.u_sun_color, [color.r, color.g, color.b, color.a]); }

    // ---

    public a_xy: number = -1;
    public a_xyz: number = -1;
    public a_nxnynz: number = -1;
    public a_uv0: number = -1;
    public a_rgba: number = -1;

    public u_texres0: WebGLUniformLocation | null = null;
    public u_fbres: WebGLUniformLocation | null = null;
    public u_time: WebGLUniformLocation | null = null;
    public u_tex0: WebGLUniformLocation | null = null;
    public u_model_mtx: WebGLUniformLocation | null = null;
    public u_view_mtx: WebGLUniformLocation | null = null;
    public u_projection_mtx: WebGLUniformLocation | null = null;
    public u_normal_mtx : WebGLUniformLocation | null = null;
    public u_camera_near: WebGLUniformLocation | null = null;
    public u_camera_far: WebGLUniformLocation | null = null;
    
    public u_fog_enable : WebGLUniformLocation | null = null;
    public u_fog_color : WebGLUniformLocation | null = null;
    public u_fog_density : WebGLUniformLocation | null = null;
    
    public u_wind_enable : WebGLUniformLocation | null = null;
    public u_wind_strength : WebGLUniformLocation | null = null;

    public u_scene_albedo : WebGLUniformLocation | null = null;
    public u_sun_direction : WebGLUniformLocation | null = null;
    public u_sun_color : WebGLUniformLocation | null = null;
 
    private updateLocations() {
        this.a_xy = env.gl.getAttribLocation(this.program, "a_xy");
        this.a_xyz = env.gl.getAttribLocation(this.program, "a_xyz");
        this.a_nxnynz = env.gl.getAttribLocation(this.program, "a_nxnynz");
        this.a_uv0 = env.gl.getAttribLocation(this.program, "a_uv0");
        this.a_rgba = env.gl.getAttribLocation(this.program, "a_rgba");
        
        this.u_texres0 = env.gl.getUniformLocation(this.program, "u_texres0");
        this.u_fbres = env.gl.getUniformLocation(this.program, "u_fbres");
        this.u_time = env.gl.getUniformLocation(this.program, "u_time");
        this.u_tex0 = env.gl.getUniformLocation(this.program, "u_tex0");
        this.u_model_mtx = env.gl.getUniformLocation(this.program, "u_model_mtx");
        this.u_view_mtx = env.gl.getUniformLocation(this.program, "u_view_mtx");
        this.u_projection_mtx = env.gl.getUniformLocation(this.program, "u_projection_mtx");
        this.u_normal_mtx = env.gl.getUniformLocation(this.program, "u_normal_mtx");
        this.u_camera_near = env.gl.getUniformLocation(this.program, "u_camera_near");
        this.u_camera_far = env.gl.getUniformLocation(this.program, "u_camera_far");

        this.u_fog_enable = env.gl.getUniformLocation(this.program, "u_fog_enable");
        this.u_fog_color = env.gl.getUniformLocation(this.program, "u_fog_color");
        this.u_fog_density = env.gl.getUniformLocation(this.program, "u_fog_density");

        this.u_wind_enable = env.gl.getUniformLocation(this.program, "u_wind_enable");
        this.u_wind_strength = env.gl.getUniformLocation(this.program, "u_wind_strength");

        this.u_scene_albedo = env.gl.getUniformLocation(this.program, "u_scene_albedo");
        this.u_sun_direction = env.gl.getUniformLocation(this.program, "u_sun_direction");
        this.u_sun_color = env.gl.getUniformLocation(this.program, "u_sun_color");
    }  
}

