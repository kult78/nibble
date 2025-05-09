
import * as log from "./Logging.js";
import * as env from "./WebEnv.js";
import { Material, getMaterial } from "./Material.js"
import { Box } from "./Geometry.js"
import { FatalError, UvRect } from "./Common.js";

export class RenderTarget {
    constructor(width: number, height: number, useTextureForDepth: boolean = false) {
        this.width = width;
        this.height = height;
        this.useTextureForDepth = useTextureForDepth;
        this.construct();
    }

    private construct() {
        let gl = env.gl;

        this.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.texImage2D(
            gl.TEXTURE_2D, 
            0, 
            gl.RGBA, 
            this.width, 
            this.height, 
            0, 
            gl.RGBA, 
            gl.UNSIGNED_BYTE, 
            null
        );

        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            this.texture,
            0 // mipmap level
        );
        
        if(this.useTextureForDepth == false) {
            this.renderbuffer = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
    
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
            gl.framebufferRenderbuffer(
                gl.FRAMEBUFFER,
                gl.DEPTH_ATTACHMENT,
                gl.RENDERBUFFER,
                this.renderbuffer
            );
        }
        else {
            // depth texture instead of renderbuffer (to sample Z values)
            this.depth = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.depth);
            
            gl.texImage2D(
                gl.TEXTURE_2D, 
                0, 
                gl.DEPTH24_STENCIL8,
                this.width, 
                this.height, 
                0, 
                gl.DEPTH_STENCIL,
                gl.UNSIGNED_INT_24_8,
                null
            );
            
            // Texture Parameters
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
            // Attach depth texture to FBO
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.TEXTURE_2D, this.depth, 0);            
        }
                  
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            throw new FatalError(`Failed to create ${this.width}x${this.height} Framebuffer`);
        } else {
            log.info(`Framebuffer ${this.width}x${this.height} is ready to use`, "tech");
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }
 
    public dispose() {

        let gl = env.gl;
         
        if(this.framebuffer) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, null);
        
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        
            if (this.texture) {
                gl.deleteTexture(this.texture);
            }
            if (this.renderbuffer) {
                gl.deleteRenderbuffer(this.renderbuffer);
            }
        
            if (this.framebuffer) {
                gl.deleteFramebuffer(this.framebuffer);
            }
        }

        this.framebuffer = null;
        this.renderbuffer = null;
        this.texture = null;
    }

    public getApiFramebuffer() {
        if(this.texture == null) throw new FatalError(`No framebuffer in framebuffer to use`);       
        return this.framebuffer; 
    }

    public getApiTexture(): WebGLTexture { 
        if(this.texture == null) throw new FatalError(`No gl texture in texture framebuffer to use`);       
        return this.texture; 
    }

    public width: number;
    public height: number;
    public useTextureForDepth: boolean = false;

    public renderbuffer : WebGLRenderbuffer | null = null;
    private texture: WebGLTexture | null = null;
    private depth: WebGLTexture | null = null;
    private framebuffer: WebGLFramebuffer | null = null;
}

// ----------

// class that renders an FBO to other (or to the screen)

export class Blitter {

    private pixelX: number = 0;
    private pixelY: number = 0;
    private pixelWidth: number = -1;
    private pixelHeight: number = -1;

    public setViewport(pixelX: number, pixelY: number, pixelWidth: number, pixelHeight: number) {
        this.pixelX = pixelX;
        this.pixelY = pixelY;
        this.pixelWidth = pixelWidth;
        this.pixelHeight = pixelHeight;
    }

    public setPosition(pixelX: number, pixelY: number) {
        this.pixelX = pixelX;
        this.pixelY = pixelY;
        this.pixelWidth = -1;
        this.pixelHeight = -1;
    }

    public blit(source: RenderTarget, destination: RenderTarget | null) {                     
        if(this.material == null) {
            if(this.materialId == "") throw new FatalError("No material is set to blit with Blitter");
            this.material = getMaterial(this.materialId);
        }

        let x = this.pixelX;
        let y = this.pixelY;
        let width = this.pixelWidth;
        let height = this.pixelHeight; 
        if(width == -1) width = source.width;
        if(height == -1) height = source.height;

        if(this.targetBox == null || this.targetBox.checkXYWH(x, y, width, height) == false) {

            this.targetBox = new Box(
                x, y, width, height,
                0.0, 0.0, 1.0, 1.0,
                1.0, 1.0 ,1.0, 1.0
            );            
        }

        env.setRenderTarget(destination);

        this.targetBox.renderWith(this.material, source.getApiTexture());
    }

    public dispose() {
        if(this.targetBox != null) {
            this.targetBox.dispose();
            this.targetBox = null;
        }
    }

    public setMaterial(id: string) {
        this.materialId = id;
        this.material = null;
    }

    private material: Material | null = null;
    private materialId: string = "";
    private targetBox: Box | null = null;
}

