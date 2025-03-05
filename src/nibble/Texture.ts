
import * as log from "./Logging.js";
import * as c from "./Common.js";
import * as env from "./WebEnv.js";
import * as res from "./Resources.js";
import * as tp from "./TileProps.js";
import { FatalError } from "./Common.js";

export class Texture {

    // this string contains the file id of the texture image file
    private origin: string = "";
    private imageOrigin: string = "";

    // if the imageOrigon contains # then it is originated form a image file
    // but its pixels go through some preprocessing after the image is loaded
    // these are the arguments of these processing steps
    private argsMap = new Map<string, string>();

    // is this is not null, this texture is a procedural texture and
    // this is the bitmap of its texels
    private proceduralBitmap : c.BitmapRGBA | null = null;

    static constructFromFile(origin: string) : Texture {

        let instance: Texture = new Texture();

        if(origin.includes("#") == false) {
            instance.origin = origin;
        } else {
            let fileAndArgs = origin.split("#");
            instance.origin = fileAndArgs[0];
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
                        instance.argsMap.set(key, value);
                    }
                });
            }
        }

        return instance;
    }

    static constructFromBitmap(bitmap: c.BitmapRGBA) : Texture {
        let instance: Texture = new Texture();
        instance.proceduralBitmap = bitmap;
        return instance;
    }

    public dispose() {
        if(this.texture != null) {
            env.gl.deleteTexture(this.texture);
            this.texture = null;
        }
    }

    private recreate(): void {

        let imageToUse: c.BitmapRGBA | null = null;

        if(this.origin != "") {

            this.image = res.getImage(this.origin);
            if(this.image == null) {
                log.error("Failed to load image for texture: " + this.origin, "tech");
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

            imageToUse = this.image;
        }

        if(this.proceduralBitmap != null) {
            imageToUse = this.proceduralBitmap;
        }

        if(imageToUse == null) 
            throw new FatalError("Bitmap is null when texture is being created");

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
    
        let pixelArray = new Uint8Array(imageToUse!.pixels!);

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,                // level
            gl.RGBA,          // tex internal format
            imageToUse.width,
            imageToUse.height,
            0,                // border
            gl.RGBA,          // pixel data format
            gl.UNSIGNED_BYTE, 
            pixelArray
        );
        gl.bindTexture(gl.TEXTURE_2D, null);

        log.info("API Texture created: " + this.origin, "tech");

        this.width = imageToUse.width;
        this.height = imageToUse.height;
    }

    public getApiTexture() { 
        if(this.texture == null) this.recreate();
        if(this.texture == null) throw new FatalError(`No gl texture in texture [${this.origin}]`);
        return this.texture; 
    }

    private image: c.BitmapRGBA | null = null;
    private texture: WebGLTexture | null = null;
    public width: number = -1;
    public height: number = -1;
}

let textures: Map<string, Texture> = new Map();

export function getTexture(url: string): Texture {
    let texture: Texture | undefined = textures.get(url);
    if(texture == undefined) {
        texture = Texture.constructFromFile(url);
        textures.set(url, texture);
    }
    return texture;
}

export function createTexture(id: string, bitmap: c.BitmapRGBA): Texture {
    let texture: Texture = Texture.constructFromBitmap(bitmap);
    textures.set(id, texture);
    return texture;
}

export function releaseTexture(id: string) {
    let texture: Texture | undefined = textures.get(id);
    if(texture != undefined) {
        texture.dispose();
        textures.delete(id);
    }
}
