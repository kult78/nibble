
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

    private renderEntities(camera: n.Camera, time: number) {
        this.entities.forEach(e => {
            if(e.renderable) {
                e.renderable.useMaterial();
 
                let shader = e.renderable.material!.getProgram().getSetup(); 
                
                shader.set_u_time(time / 1000); 
                shader.set_u_fbres(n.renderWidth, n.renderHeight);

                shader.set_u_model(e.transformation!.getMatrix().values);
                shader.set_u_normal(n.Algebra.matrixTranspose(n.Algebra.matrixInverse(e.transformation!.getMatrix())).values);
                shader.set_u_projection(camera.projectionMatrix.values);
                shader.set_u_view(camera.viewMatrix.values);

                e.renderable.render();
           }
        });
    } 
 
    public fogColor: n.Color = n.Colors.darkcyan.clone(); 
      
    public render(cameraId: string, time: number, fbo: n.RenderTarget | null) {
        let camera: n.Camera | undefined = this.getEntityByName(cameraId)?.getComponent(CameraComponent)?.camera;
        if(!camera) throw new n.FatalError(`Camera [${cameraId}] not found in Scene3d`);

        n.setRenderTarget(fbo);

        camera.update(); 
        n.gl.depthMask(true); 
        n.gl.clearColor(this.fogColor.r, this.fogColor.g, this.fogColor.b, 1.0); 
        n.gl.clearDepth(1.0);
        n.gl.clear(n.gl.DEPTH_BUFFER_BIT | n.gl.COLOR_BUFFER_BIT);

        this.renderEntities(camera, time);
    }
 
}