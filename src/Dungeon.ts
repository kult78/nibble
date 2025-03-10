
import * as n from "./nibble/index.js";
import * as global from "./Global.js"

import { Scene3d } from "./Scene3d.js";
import { Entity, RenderComponent3d, CameraComponent, TransformationComponent } from "./Entity.js";
import { Kreator } from "./Kreator.js"
import { EventAware } from "./Events.js";

export class DungeonMap {
    
    constructor(w: number, h: number) {
        this.map = new n.BitmapRGBA(w, h);
        this.generateStandard();
    }

    private map: n.BitmapRGBA;

    public getBitmap(): n.BitmapRGBA { return this.map; }

    private generateStandard() {
        this.map.clear(0xff0000ff);
        this.buildSpace(this.map.width / 2, this.map.height / 2);
    }

    private buildSpace(x: number, y: number) {
        this.map.setPixel(x, y, 0xffffffff);
        
        let spot: n.Vector2[] = [];
        spot.push(new n.Vector2(x, y));

            

    }
}

export class Dungeon extends EventAware {

    constructor() {
        super();
    }

    private scene: Scene3d | null = null;

}