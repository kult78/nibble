
import * as tex from "./Texture.js";
import * as c from "./Common.js"

export class TileProps {

    public tileList: Map<string, c.UvRect> = new Map<string, c.UvRect>();
    public texture: tex.Texture;

    public tileCountX: number;
    public tileCountY: number;

    public tilePixelSizeX: number;
    public tilePixelSizeY: number;

    public pixelSizeX: number;
    public pixelSizeY: number;

    constructor(texture: string,
        tileCountX: number, tileCountY: number,
        tileList: Map<string, c.Vector2>) {
        this.texture = tex.getTexture(texture);
        if(this.texture != null) { 
            this.tileCountX = tileCountX;
            this.tileCountY = tileCountY;
            this.tilePixelSizeX = Math.floor(this.texture.width / this.tileCountX);
            this.tilePixelSizeY = Math.floor(this.texture.height / this.tileCountY);
            this.pixelSizeX = 1.0 / (this.texture.width);
            this.pixelSizeY = 1.0 / (this.texture.height);
        } else {
            throw new c.FatalError(`No texture for tilemap [${texture}]`);
        }

        tileList.forEach((v, k) => {
            this.tileList.set(k, this.GetTileUv(v.x, v.y))
        });
    }

    public GetNamedTileUv(name: string): c.UvRect {
        let ret = new c.UvRect(0, 0, 1, 1);
        if(this.tileList.has(name)) {
            return this.tileList.get(name)!;
        }
        return ret;
    }

    public GetTileUv(x: number, y: number): c.UvRect {
        let ret = new c.UvRect(0, 0, 1, 1);

        ret.u0 = (x * this.tilePixelSizeX * this.pixelSizeX);
        ret.v0 = (y * this.tilePixelSizeY * this.pixelSizeY);
        ret.u0 += this.pixelSizeX / 2;
        ret.v0 += this.pixelSizeY / 2;

        ret.u1 = ret.u0 + (this.tilePixelSizeX - 1) * this.pixelSizeX;
        ret.v1 = ret.v0 + (this.tilePixelSizeY - 1) * this.pixelSizeY;
        ret.u1 -= this.pixelSizeX / 2;
        ret.v1 -= this.pixelSizeY / 2;

        ret.v0 = 1.0 - ret.v0;
        ret.v1 = 1.0 - ret.v1;

        return ret;
    }
}
