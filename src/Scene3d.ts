
import * as n from "./nibble/index.js";
import { CameraComponent, Entity } from "./Entity.js";

export class Scene3d {

    public constructor() {
    }

    private entities: Entity[] = [];

    public addEntity(entity: Entity): Entity {
        this.entities.push(entity);
        return entity;
    }

    public getEntityByName(entityId: string): Entity | null {
        return this.entities.find(e => e.getName() === entityId) || null;
    }

    private renderEntities(camera: n.Camera) {
        this.entities.forEach(e => {
            if(e.renderable) {
                e.renderable.render(camera, new n.Matrix4x4);
           }
        });
    }
    
    public render(cameraId: string, fbo: n.RenderTarget | null) {
        let camera: n.Camera | undefined = this.getEntityByName(cameraId)?.getComponent(CameraComponent)?.camera;
        if(!camera) throw new n.FatalError(`Camera [${cameraId}] not found in Scene3d`);

        camera.update();

        n.setRenderTarget(fbo);

        n.gl.clearColor(0.7, 0.7, 0.7, 1.0);
        n.gl.clearDepth(1.0);
        n.gl.clear(n.gl.COLOR_BUFFER_BIT | n.gl.DEPTH_BUFFER_BIT);

        this.renderEntities(camera);
    }

}