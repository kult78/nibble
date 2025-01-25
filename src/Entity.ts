
import * as n from "./nibble/index.js";

export class RenderComponent {

    constructor() {}

    public material: n.Material | null = null;
    public geometry: n.Geometry | null = null;

}

export class Transformation {

    public position: n.Vector3 = new n.Vector3(0, 0, 0);
    public yawPithcRoll: n.Vector3 = new n.Vector3(0, 0, 0);
    public scale: n.Vector3 = new n.Vector3(1, 1, 1);

    public getMatrix(): n.Matrix4x4 {
        return n.Algebra.createTransformationMatrix(this.position, this.yawPithcRoll, this.scale);
    }

}

export class Entity {

    public tick(time: number) {

    }

    public addComponent(component: any) {
        this.components.push(component);
    }

    public getComponent<T>(type: new (...args: any[]) => T): T | null {
        for (const component of this.components) {
            if (component instanceof type) {
                return component;
            }
        }
        return null;
    }

    public transformation: Transformation | null = null;
    public renderComponents: RenderComponent[] = [];
    public components: any[] = [];

    public getId() { return this.id; }
    public setName(name: string) { this.name = name; }
    public getName() { return this.name; }

    // ----------

    private id: number = Entity.idCounter++;
    private static idCounter: number = 1;
    private name: string | null = null;

    constructor() {}
}
