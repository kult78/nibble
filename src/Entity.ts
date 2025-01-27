
import * as n from "./nibble/index.js";

export class EntityComponent { }

// ----------

export class CameraComponent extends EntityComponent {
    
    public constructor() {
        super();
    }

    public camera: n.Camera = new n.Camera();

}

// ----------

export class RenderComponent3d extends EntityComponent {

    public constructor() {
        super();
    }

    public render(camera: n.Camera, transformation: n.Matrix4x4) {
        if(!this.geometry) throw new n.FatalError("Geometry not set in RenderComponent3d");
        if(!this.material) throw new n.FatalError("Material not set in RenderComponent3d");
        if(!this.texture) throw new n.FatalError("Texture not set in RenderComponent3d");

        this.material.use(this.texture.getApiTexture());
        this.material.getProgram().getSetup().set_u_model(transformation.values);
        this.material.getProgram().getSetup().set_u_normal(n.Algebra.matrixTranspose(n.Algebra.matrixInverse(transformation)).values);
        this.material.getProgram().getSetup().set_u_projection(camera.projectionMatrix.values);
        this.material.getProgram().getSetup().set_u_view(camera.viewMatrix.values);
  
        this.geometry.render(this.material.getProgram());
    }

    public setTexture(name: string): RenderComponent3d {
        this.texture = n.getTexture(name);
        return this;
    }

    public setMaterial(name: string): RenderComponent3d {
        this.material = n.getMaterial(name);
        return this;
    }

    public setGeometry(geometry: n.Geometry): RenderComponent3d {
        this.geometry = geometry;
        return this;
    }

    private texture: n.Texture | null = null;
    private material: n.Material | null = null;
    private geometry: n.Geometry | null = null;

}

// ----------

export class TransformationComponent extends EntityComponent {

    public constructor() {
        super();
    }

    public position: n.Vector3 = new n.Vector3(0, 0, 0);
    public yawPithcRoll: n.Vector3 = new n.Vector3(0, 0, 0);
    public scale: n.Vector3 = new n.Vector3(1, 1, 1);

    public getMatrix(): n.Matrix4x4 {
        return n.Algebra.createTransformationMatrix(this.position, this.yawPithcRoll, this.scale);
    }

}

// ----------

export class Entity {

    constructor() {}

    public tick(time: number) {

    }

    public addComponent(component: EntityComponent) {
        this.components.push(component);
    }

    public addNewComponent<T extends EntityComponent>(ComponentType: new () => T): T {
        const component = new ComponentType();
        this.components.push(component);

        if(component instanceof RenderComponent3d) {
            this.renderable = component;
            console.log("Renderable component added");
        }

        return component;
    }
    
    public getComponent<T extends EntityComponent>(type: new (...args: any[]) => T): T | null {
        for (const component of this.components) {
            if (component instanceof type) {
                return component;
            }
        }
        return null;
    }

    public transformation: TransformationComponent = new TransformationComponent();
    public renderable: RenderComponent3d | null = null;
    public components: EntityComponent[] = [];

    public getId() { return this.id; }
    public setName(name: string): Entity { this.name = name; return this; }
    public getName() { return this.name; }

    // ----------

    private id: number = Entity.idCounter++;
    private static idCounter: number = 1;
    private name: string | null = null;

}
