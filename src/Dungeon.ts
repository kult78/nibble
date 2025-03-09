
import * as n from "./nibble/index.js";
import * as global from "./Global.js"

import { Scene3d } from "./Scene3d.js";
import { Entity, RenderComponent3d, CameraComponent, TransformationComponent } from "./Entity.js";
import { Kreator } from "./Kreator.js"
import { EventAware } from "./Events.js";

export class Dungeon extends EventAware {

    constructor() {
        super();
    }

    private scene: Scene3d | null = null;

}