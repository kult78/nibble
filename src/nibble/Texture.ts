
import * as log from "./Logging.js";
import * as c from "./Common.js";
import * as env from "./WebEnv.js";
import * as res from "./Resources.js";
import * as tp from "./TileProps.js";
import { FatalError } from "./Common.js";
 
export class Texture {
    constructor(origin: string) {
        this.origin = origin;

        if(origin.includes("#") == false) {
            this.imageOrigin = origin;
        } else {
            let fileAndArgs = origin.split("#");
            this.imageOrigin = fileAndArgs[0];
            if(fileAndArgs.length >= 2) {
                const args = fileAndArgs[1];
                const argsSplit = args.split(";");
                argsSplit.forEach(s => {
                    if(s != "") {
                        let key = "";
                        let value = "";
                            if(s.includes("=")) {
                                key = s.split("=")[0];
                                value = s.split("=")[1];
                            } else {
                                key = s; 
                        }
                        this.argsMap.set(key, value);
                    }
                });
            }
        }

        this.recreate();
    }

    private imageOrigin: string = "";
    private argsMap = new Map<string, string>();

    public dispose() {
        if(this.texture != null) {
            env.gl.deleteTexture(this.texture);
            this.texture = null;
        }
    }

    private recreate(): void {
        this.image = res.getImage(this.origin);
        if(this.image == null) {
            log.error("Failed to load image for texture: " + this.imageOrigin, "tech");
            return;
        }

        // ----------

        if(this.argsMap.has("Key")) {
            try {
                const keyx = Number.parseInt(this.argsMap.get("Key")!.split(" ")[0]);
                const keyy = Number.parseInt(this.argsMap.get("Key")!.split(" ")[1]);

                let keyColor = this.image.getPixel(keyx, keyy);
                for(let y = 0; y < this.image.height; y++) {
                    for(let x = 0; x < this.image.width; x++) {
                        if(this.image.getPixel(x, y) == keyColor)
                            this.image.setPixel(x, y, 0);
                    }                    
                }
            }
            catch {
                throw new FatalError("Cannot apply Key to texture: " + this.origin);
            }
        }


        // ----------

        let gl: WebGL2RenderingContext = env.gl;

        this.dispose();
     
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        this.texture = gl.createTexture();
        if (!this.texture) {
            log.error('Failed to create WebGL texture', "tech");
            return;
        }
    
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    
        let pixelArray = new Uint8Array(this.image!.pixels!);

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,                // level
            gl.RGBA,          // tex internal format
            this.image.width,
            this.image.height,
            0,                // border
            gl.RGBA,          // pixel data format
            gl.UNSIGNED_BYTE, 
            pixelArray
        );
        gl.bindTexture(gl.TEXTURE_2D, null);

        log.info("Texture created: " + this.origin, "tech");

        this.width = this.image.width;
        this.height = this.image.height;
    }

    public getApiTexture() { 
        if(this.texture == null) throw new FatalError(`No gl texture in texture [${this.origin}]`);
        return this.texture; 
    }

    private origin: string;
    private image: c.BitmapRGBA | null = null;
    private texture: WebGLTexture | null = null;
    public width: number = -1;
    public height: number = -1;
}

let textures: Map<string, Texture> = new Map();

export function getTexture(url: string): Texture {
    let texture: Texture | undefined = textures.get(url);
    if(texture == undefined) {
        texture = new Texture(url);
        textures.set(origin, texture);
    }
    return texture;
}

