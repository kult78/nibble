
import * as n from "./nibble/index.js";
import { Entity } from "./Entity.js";

export class Scene3d {

    private fbo: n.RenderTarget | null = null;
    private entities: Entity[] = [];
    private cameras: Map<string, n.Camera> = new Map<string, n.Camera>();
    
}