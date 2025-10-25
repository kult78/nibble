
import * as n from "./nibble/index.js";

// ----------------------------------------------------------------------

export type SystemEventHandlerCapable = {
    systemEvent: (eventType: string, ...args: any) => void;
};

export class SystemEventHandlerRegistry {

    private static instances = new Set<WeakRef<SystemEventHandlerCapable>>();

    static register(instance: SystemEventHandlerCapable) {
        this.instances.add(new WeakRef(instance));
    }

    static raiseSystemEvent(eventType: string, ...args: any) {
        let cleanup = false;
        for (const ref of this.instances) {
            const instance = ref.deref();
            if (instance) {
                instance.systemEvent(eventType, ...args);
            } else {
                cleanup = true;
            }
        }

        if (cleanup)
            this.instances = new Set([...this.instances].filter(ref => ref.deref() !== undefined));
        }
}

export function SystemEventHandler<T extends new (...args: any[]) => SystemEventHandlerCapable>(constructor: T): T {
    return class extends constructor {
        constructor(...args: any[]) {
            super(...args);
            SystemEventHandlerRegistry.register(this); // TS knows 'this' is Disposable
        }
    };
}

// -------------------------------

export class EntityComponent { }

// ---------- ---------- ---------- ---------- ---------- ---------- ----------

export class CameraComponent extends EntityComponent {
    
    public constructor() {
        super();
    }

    public camera: n.Camera = new n.Camera();

}

// ---------- ---------- ---------- ---------- ---------- ---------- ----------

export class RenderComponent3d extends EntityComponent {

    public constructor() {
        super();
    }

    public useMaterial() {
        if(!this.material) throw new n.FatalError("Material not set in RenderComponent3d");
        if(!this.texture) throw new n.FatalError("Texture not set in RenderComponent3d");
        this.material.use(this.texture.getApiTexture());
    }

    public render() {
        if(!this.geometry) throw new n.FatalError("Geometry not set in RenderComponent3d");
        this.geometry.render(this.material!.getProgram());
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

    public texture: n.Texture | null = null;
    public material: n.Material | null = null;
    public geometry: n.Geometry | null = null;

}

// ---------- ---------- ---------- ---------- ---------- ---------- ----------

export class TransformationComponent extends EntityComponent {

    public constructor() {
        super();
    }

    public position: n.Vector3 = new n.Vector3(0, 0, 0);
    public yawPithcRoll: n.Vector3 = new n.Vector3(0, 0, 0);
    public scale: n.Vector3 = new n.Vector3(1, 1, 1);

    public setPosition(x: number, y: number, z: number): TransformationComponent {
        this.position = new n.Vector3(x, y, z);
        return this;
    }

    public setYawPitchRoll(yaw: number, pitch: number, roll: number): TransformationComponent {
        this.yawPithcRoll = new n.Vector3(yaw, pitch, roll);
        return this;
    }

    public setScale(x: number, y: number, z: number): TransformationComponent {
        this.scale = new n.Vector3(x, y, z);
        return this;
    }

    public getMatrix(): n.Matrix4x4 {
        return n.Algebra.createTransformationMatrix(this.position, this.yawPithcRoll, this.scale);
    }

}

// ---------- ---------- ---------- ---------- ---------- ---------- ----------

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
            this.renderable = component as RenderComponent3d;
        }

        if(component instanceof TransformationComponent) {
            this.transformation = component as TransformationComponent;
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

    public transformation: TransformationComponent | null = null;
    public renderable: RenderComponent3d | null = null;
    public components: EntityComponent[] = [];

    public getId() { return this.id; }
    public setName(name: string): Entity { this.name = name; return this; }
    public getName() { return this.name; }

    // ----------

    private static idCounter: number = 1;
    private id: number = Entity.idCounter++;

    private name: string | null = null;

}
