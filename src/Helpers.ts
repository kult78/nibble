 
 import * as n from "./nibble/index.js";
 
 export class ProceduralTextureImage {
     
     private box: n.Box | null = null;
     private bitmap: n.BitmapRGBA = new n.BitmapRGBA(256, 256);
     private texture: n.Texture | null = null;
     private textureUid: string = crypto.randomUUID();
     
     private x: number = 0;
     private y: number = 0;
     private scale: number = 1;
 
     public constructor(x: number, y: number, scale: number) {
         this.setPosition(x, y, scale);
         this.setBitmapSize(64, 64);
     }
 
     public setPosition(x: number, y: number, scale: number = 1.0) {
         this.x = x;
         this.y = y;
         this.scale = scale;
         this.setDirty();
     }
 
     public getBitmap(): n.BitmapRGBA {
         this.setDirty();
         return this.bitmap;
     }
 
     public setBitmapSize(w: number, h: number) {
         this.bitmap = new n.BitmapRGBA(w, h);
         this.setDirty(); 
     }
 
     public setDirty() {
         this.box = null;
         if(this.texture != null) {
             n.releaseTexture(this.textureUid);
             this.texture = null;
         }
     }
          
     public render() {
         if(this.texture == null) {
             this.texture = n.createTexture(this.textureUid, this.bitmap);
         }
 
         if(this.box == null) {
         this.box = new n.Box(
             this.x, this.y, this.bitmap.width * this.scale, this.bitmap.height * this.scale,
             0, 0, 1, 1,
             //1.0 / this.bitmap.width, 1.0 / this.bitmap.height, 1.0 - 1.0 / this.bitmap.width, 1.0 - 1.0 / this.bitmap.height,
             //0, 0, this.bitmap.width, this.bitmap.height,
             1.0, 1.0, 1.0, 1.0, undefined, "basic2d_pix");
         }
 
         this.box!.renderWithTexture(this.texture.getApiTexture());
     }
 }
 