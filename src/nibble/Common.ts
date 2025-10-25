

export const SYSTEM_EVENT_GL_UP = Symbol("glUp");
export const SYSTEM_EVENT_GL_DOWN = Symbol("glDown");

export type SystemEventType = typeof SYSTEM_EVENT_GL_UP | typeof SYSTEM_EVENT_GL_DOWN;

export class EventRegistry {
    private instances = new Set<WeakRef<{ handleEvent(eventType: symbol, ...args: any[]): void }>>();

    register(instance: { handleEvent(eventType: symbol, ...args: any[]): void }) {
        this.instances.add(new WeakRef(instance));
    }

    raise(eventType: symbol, ...args: any[]) {
        for (const ref of this.instances) {
            const instance = ref.deref();
            if (instance) { 
                instance.handleEvent(eventType, ...args);
            } else {
                this.instances.delete(ref);
            }
        }
    }
}

export function RegisterEventHandler(
    registry: EventRegistry
): <T extends new (...args: any[]) => { handleEvent(eventType: symbol, ...args: any[]): void }>(constructor: T) => T {
    return function <T extends new (...args: any[]) => { handleEvent(eventType: symbol, ...args: any[]): void }>(constructor: T): T {
        return class extends constructor {
            constructor(...args: any[]) {
                super(...args);
                registry.register(this);
            }
        };
    };
}

export const SystemEventRegistry = new EventRegistry();

// ----------------------------------------------------------------------

export class Vertex {
    
    static from2d(x: number, y: number, u: number, v: number, c: Color): Vertex {
        let vertex = new Vertex();
        vertex.x = x;
        vertex.y = y;
        vertex.u0 = u;
        vertex.v0 = v;
        vertex.r = c.r;
        vertex.g = c.g;
        vertex.b = c.b;
        vertex.a = c.a;
        return vertex;
    }

    public x: number = 0;
    public y: number = 0;
    public z: number = 0;
    
    public nx: number = 0;  
    public ny: number = 0;
    public nz: number = 0;

    public u0: number = 0;
    public v0: number = 0;

    public r: number = 0;
    public g: number = 0;
    public b: number = 0;
    public a: number = 0;
}

// -------------------------------

export class Vector2 {
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public x: number = 0.0;
    public y: number = 0.0;
}

// -------------------------------

export class Vector3 {
    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public x: number = 0.0;
    public y: number = 0.0;
    public z: number = 0.0;
}

// -------------------------------

export class Vector4 {
    constructor(x: number, y: number, z: number, w: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    public x: number = 0.0;
    public y: number = 0.0;
    public z: number = 0.0;
    public w: number = 0.0;
}

// -------------------------------

export class Matrix4x4 {
    constructor() {
    }

    public values = 
    [
        1, 0, 0, 0, 
        0, 1, 0, 0, 
        0, 0, 1, 0, 
        0, 0, 0, 1
    ];

    public set(values: number[]): Matrix4x4 {
        if(values.length != 16) throw new Error("Invalid number of values to set Matrix4x4");
        this.values = [...values];
        return this;
    }

    public setIdentity(): Matrix4x4 {
        this.values = 
        [
            1, 0, 0, 0, 
            0, 1, 0, 0, 
            0, 0, 1, 0, 
            0, 0, 0, 1
        ];
        return this;
    }
}

// -------------------------------

export class Algebra {

    public static lerp(v0: Vector3, v1: Vector3, t: number): Vector3 {
        return new Vector3(
            v0.x + t * (v1.x - v0.x),
            v0.y + t * (v1.y - v0.y),
            v0.z + t * (v1.z - v0.z));
    }

    public static normalize(v: Vector3): Vector3 {
        const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        return new Vector3(v.x / length, v.y / length, v.z / length);
    }

    public static getLength(v: Vector3): number {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }

    public static scale(v: Vector3, s: number): Vector3 {
        return new Vector3(v.x * s, v.y * s, v.z * s);
    }

    public static add(a: Vector3, b: Vector3): Vector3 {
        return new Vector3(a.x + b.x, a.y + b.y, a.z + b.z);
    }

    public static cross(a: Vector3, b: Vector3): Vector3 {
        return new Vector3(
            a.y * b.z - a.z * b.y,
            a.z * b.x - a.x * b.z,
            a.x * b.y - a.y * b.x
        );
    }

    public static negate(a: Vector3): Vector3 {
        return new Vector3(
            a.x * -1,
            a.y * -1,
            a.z * -1
        );
    }

    public static subtract(a: Vector3, b: Vector3): Vector3 {
        return new Vector3(
            a.x - b.x,
            a.y - b.y,
            a.z - b.z
        );
    }

    public static dot(a: Vector3, b: Vector3): number {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    public static transform(v: Vector3, m: Matrix4x4): Vector3 {
        const x = v.x * m.values[0] + v.y * m.values[4] + v.z * m.values[8] + m.values[12];
        const y = v.x * m.values[1] + v.y * m.values[5] + v.z * m.values[9] + m.values[13];
        const z = v.x * m.values[2] + v.y * m.values[6] + v.z * m.values[10] + m.values[14];
        return new Vector3(x, y, z);
    }

    public static matrixMultiply(a: Matrix4x4, b: Matrix4x4): Matrix4x4 {
        const result = new Matrix4x4();
        const out = result.values;
        const aVals = a.values;
        const bVals = b.values;

        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                out[row * 4 + col] =
                    aVals[row * 4 + 0] * bVals[0 * 4 + col] +
                    aVals[row * 4 + 1] * bVals[1 * 4 + col] +
                    aVals[row * 4 + 2] * bVals[2 * 4 + col] +
                    aVals[row * 4 + 3] * bVals[3 * 4 + col];
            }
        }
        return result;
    } 

    public static createTransformationMatrix(position: Vector3, yawPitchRoll: Vector3, scale: Vector3): Matrix4x4 {
        const [yaw, pitch, roll] = [yawPitchRoll.x, yawPitchRoll.y, yawPitchRoll.z];

        // scale matrix
        const scaleMatrix = new Matrix4x4();
        scaleMatrix.values[0] = scale.x;
        scaleMatrix.values[5] = scale.y;
        scaleMatrix.values[10] = scale.z;

        // rotation matrices
        const yawMatrix = new Matrix4x4();
        yawMatrix.values[0] = Math.cos(yaw);
        yawMatrix.values[2] = Math.sin(yaw);
        yawMatrix.values[8] = -Math.sin(yaw);
        yawMatrix.values[10] = Math.cos(yaw);

        const pitchMatrix = new Matrix4x4();
        pitchMatrix.values[5] = Math.cos(pitch);
        pitchMatrix.values[6] = Math.sin(pitch);
        pitchMatrix.values[9] = -Math.sin(pitch);
        pitchMatrix.values[10] = Math.cos(pitch);

        const rollMatrix = new Matrix4x4();
        rollMatrix.values[0] = Math.cos(roll);
        rollMatrix.values[1] = -Math.sin(roll);
        rollMatrix.values[4] = Math.sin(roll);
        rollMatrix.values[5] = Math.cos(roll);

        const rotationMatrix = 
            this.matrixMultiply(
                this.matrixMultiply(yawMatrix, pitchMatrix),
                rollMatrix
            );

        const translationMatrix = new Matrix4x4();
        translationMatrix.values[12] = position.x;
        translationMatrix.values[13] = position.y;
        translationMatrix.values[14] = position.z;

        return this.matrixMultiply(
            translationMatrix,
            this.matrixMultiply(rotationMatrix, scaleMatrix)
        );
    } 

    public static matrixTranspose(matrix: Matrix4x4): Matrix4x4 {
        const temp = [...matrix.values];
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                matrix.values[row * 4 + col] = temp[col * 4 + row];
            }
        }
        return new Matrix4x4().set(matrix.values);
    }

    public static matrixInverse(matrix: Matrix4x4): Matrix4x4 {
        let m = matrix.values;
        let det = 
            m[0] * (m[5] * m[10] - m[6] * m[9]) -
            m[1] * (m[4] * m[10] - m[6] * m[8]) +
            m[2] * (m[4] * m[9] - m[5] * m[8]);
        let invDet = 1 / det;
        let inv = new Matrix4x4().set
        ([
            (m[5] * m[10] - m[6] * m[9]) * invDet,
            (m[2] * m[9] - m[1] * m[10]) * invDet,
            (m[1] * m[6] - m[2] * m[5]) * invDet,
            0,
            (m[6] * m[8] - m[4] * m[10]) * invDet,
            (m[0] * m[10] - m[2] * m[8]) * invDet,
            (m[2] * m[4] - m[0] * m[6]) * invDet,
            0,
            (m[4] * m[9] - m[5] * m[8]) * invDet,
            (m[1] * m[8] - m[0] * m[9]) * invDet,
            (m[0] * m[5] - m[1] * m[4]) * invDet,
            0,
            0, 0, 0, 1
        ]);
        return inv;
    }

    public static deg2rad(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    public static rad2deg(radians: number): number {
        return radians * (180 / Math.PI);
    }   

    public static createViewMatrix(position: Vector3, forward: Vector3, up: Vector3): Matrix4x4 {
        const zAxis = Algebra.normalize(Algebra.negate(forward)); // Camera looks along -forward
        const xAxis = Algebra.normalize(Algebra.cross(up, zAxis)); // Right vector
        const yAxis = Algebra.cross(zAxis, xAxis); // Up vector (orthogonalized)
    
        const tx = -Algebra.dot(xAxis, position);
        const ty = -Algebra.dot(yAxis, position); 
        const tz = -Algebra.dot(zAxis, position);
    
        const matrix = new Matrix4x4().set([    
            xAxis.x, yAxis.x, zAxis.x, 0,        
            xAxis.y, yAxis.y, zAxis.y, 0,        
            xAxis.z, yAxis.z, zAxis.z, 0,       
            tx, ty, tz, 1 
        ]);
    
        return matrix;
    }  
    
    public static eulerToQuaternion(yaw: number, pitch: number, roll: number): Vector4 {
        let cy = Math.cos(yaw * 0.5);
        let sy = Math.sin(yaw * 0.5);
        let cp = Math.cos(pitch * 0.5);
        let sp = Math.sin(pitch * 0.5);
        let cr = Math.cos(roll * 0.5);
        let sr = Math.sin(roll * 0.5);
    
        return new Vector4(
            cr * cp * cy + sr * sp * sy,
            sr * cp * cy - cr * sp * sy,
            cr * sp * cy + sr * cp * sy,
            cr * cp * sy - sr * sp * cy
        );
    }
     
    public static rotateVectorByQuaternion(vector: Vector3, quat: Vector4): Vector3 {
        let qvec = new Vector4(vector.x, vector.y, vector.z, 0);
        let qconj = { x: -quat.x, y: -quat.y, z: -quat.z, w: quat.w };    
        let qv = Algebra.multiplyQuaternions(quat, qvec);
        let result = Algebra.multiplyQuaternions(qv, qconj);

        return new Vector3(result.x, result.y, result.z);
    }

    // Helper function to multiply two quaternions
    public static multiplyQuaternions(q1: Vector4, q2: Vector4): Vector4 {
        return new Vector4(
            q1.w * q2.w - q1.x * q2.x - q1.y * q2.y - q1.z * q2.z,
            q1.w * q2.x + q1.x * q2.w + q1.y * q2.z - q1.z * q2.y,
            q1.w * q2.y - q1.x * q2.z + q1.y * q2.w + q1.z * q2.x,
            q1.w * q2.z + q1.x * q2.y - q1.y * q2.x + q1.z * q2.w
        );
    }
    
    /*public static createProjectionMatrix(fov: number, aspect: number, near: number, far: number): Matrix4x4 {
        const fovRad = (fov * Math.PI) / 180;
        const f = 1 / Math.tan(fovRad / 2);
        const rangeInv = 1 / (near - far);
    
        return new Matrix4x4().set([ 
            f / aspect, 0,           0,                          0,
            0,          f,           0,                          0,
            0,          0,           (near + far) * rangeInv,   -1,
            0,          0,           (2 * near * far) * rangeInv, 0
        ]);
    }*/

        /*
        public static createProjectionMatrix(fov: number, aspect: number, near: number, far: number): Matrix4x4 {
            const fovRad = (fov * Math.PI) / 180; // Convert FOV to radians
            const f = 1 / Math.tan(fovRad / 2);  // Cotangent of half FOV
            const rangeInv = 1 / (far - near);   // Inverse depth range
        
            return new Matrix4x4().set([
                f / aspect,  0,   0,                                 0,
                0,           f,   0,                                 0,
                0,           0,   -(far + near) * rangeInv,         -1,
                0,           0,   -2 * near * far * rangeInv,        0
            ]);
        }*/
/*
            public static createProjectionMatrix(fov: number, aspect: number, near: number, far: number): Matrix4x4 {
                const fovRad = (fov * Math.PI) / 180; // Convert FOV to radians
                const f = 1 / Math.tan(fovRad / 2);  // Cotangent of half FOV
                const rangeInv = 1 / (far - near);   // Inverse of depth range
            
                return new Matrix4x4().set([
                    f / aspect,  0,               0,                       0,
                    0,            f,               0,                       0,
                    0,            0,        /       -(far + near) * rangeInv, -1,
                    0,            0,               -2 * near * far * rangeInv,  0
                ]);
            }
  
 
            public static createProjectionMatrix(fov: number, aspect: number, near: number, far: number): Matrix4x4 {
                const fovRad = (fov * Math.PI) / 180; // Convert FOV to radians
                const f = 1 / Math.tan(fovRad / 2);  // Cotangent of half FOV
                const rangeInv = 1 / (far - near);   // Inverse of depth range
            
                return new Matrix4x4().set([
                    f / aspect,  0,                       0,                          0,
                    0,            f,                       0,                          0,
                    0,            0,    -(far + near) * rangeInv,   -1,
                    0,            0,    -2 * near * far * rangeInv,  0
                ]);
            }
  */
             
                public static createProjectionMatrix(fov: number, aspect: number, near: number, far: number): Matrix4x4 {
                    const matrix = new Matrix4x4();
                    matrix.setIdentity();

                    const f = 1.0 / Math.tan((fov * Math.PI) / 360.0); // Convert fov to radians and calculate cotangent
                    const rangeInv = 1.0 / (near - far);
            
                    matrix.values[0] = f / aspect;
                    matrix.values[5] = f;
                    matrix.values[10] = (far + near) * rangeInv;
                    matrix.values[11] = -1.0;
                    matrix.values[14] = (2.0 * far * near) * rangeInv;
                    matrix.values[15] = 0.0;
            
                    return matrix;
                }
                        
        

}

// -------------------------------

export class Rgba {
    constructor(r: number, g: number, b: number, a: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    public r: number = 1.0;
    public g: number = 1.0;
    public b: number = 1.0;
    public a: number = 1.0;
}

// -------------------------------

export class UvRect {
    constructor(u0: number, v0: number, u1: number, v1: number) {
        this.u0 = u0;
        this.v0 = v0;
        this.u1 = u1;
        this.v1 = v1;
    }

    public u0: number = 0.0;
    public v0: number = 0.0;
    public u1: number = 0.0;
    public v1: number = 0.0;
}

// -------------------------------

export class FatalError extends Error {
    constructor(message: string) { 
        super(message);

        const error = new Error();
        this.callStack = error.stack || "No stack trace available";
    }
    public callStack = "";
}

// -------------------------------

export enum Align2d {
    Centre,
    BottomLeft,
    BottomCentre
}

// -------------------------------

export class Color {
    constructor(
        public r: number,
        public g: number,
        public b: number,
        public a: number = 1.0
    ) {}

    public clone(): Color {
        return new Color(this.r, this.g, this.b, this.a);
    }

    public multiple(other: Color): Color {
        return new Color(this.r * other.r,
            this.g * other.g,
            this.b * other.b,
            this.a * other.a
        );
    }
}

export function randomColor(): Color { return new Color(Math.random(), Math.random(), Math.random()); }
export function randomColor3(): Color { return new Color(Math.random(), Math.random(), Math.random()); }
export function randomColor4(): Color { return new Color(Math.random(), Math.random(), Math.random(), Math.random()); }

export class Colors {
    public static aliceblue = new Color(240 / 255, 248 / 255, 255 / 255);
    public static antiquewhite = new Color(250 / 255, 235 / 255, 215 / 255);
    public static aqua = new Color(0 / 255, 255 / 255, 255 / 255);
    public static aquamarine = new Color(127 / 255, 255 / 255, 212 / 255);
    public static azure = new Color(240 / 255, 255 / 255, 255 / 255);
    public static beige = new Color(245 / 255, 245 / 255, 220 / 255);
    public static bisque = new Color(255 / 255, 228 / 255, 196 / 255);
    public static black = new Color(0 / 255, 0 / 255, 0 / 255);
    public static blanchedalmond = new Color(255 / 255, 235 / 255, 205 / 255);
    public static blue = new Color(0 / 255, 0 / 255, 255 / 255);
    public static blueviolet = new Color(138 / 255, 43 / 255, 226 / 255);
    public static brown = new Color(165 / 255, 42 / 255, 42 / 255);
    public static burlywood = new Color(222 / 255, 184 / 255, 135 / 255);
    public static cadetblue = new Color(95 / 255, 158 / 255, 160 / 255);
    public static chartreuse = new Color(127 / 255, 255 / 255, 0 / 255);
    public static chocolate = new Color(210 / 255, 105 / 255, 30 / 255);
    public static coral = new Color(255 / 255, 127 / 255, 80 / 255);
    public static cornflowerblue = new Color(100 / 255, 149 / 255, 237 / 255);
    public static cornsilk = new Color(255 / 255, 248 / 255, 220 / 255);
    public static crimson = new Color(220 / 255, 20 / 255, 60 / 255);
    public static cyan = new Color(0 / 255, 255 / 255, 255 / 255);
    public static darkblue = new Color(0 / 255, 0 / 255, 139 / 255);
    public static darkcyan = new Color(0 / 255, 139 / 255, 139 / 255);
    public static darkgoldenrod = new Color(184 / 255, 134 / 255, 11 / 255);
    public static darkgray = new Color(169 / 255, 169 / 255, 169 / 255);
    public static darkgreen = new Color(0 / 255, 100 / 255, 0 / 255);
    public static darkkhaki = new Color(189 / 255, 183 / 255, 107 / 255);
    public static darkmagenta = new Color(139 / 255, 0 / 255, 139 / 255);
    public static darkolivegreen = new Color(85 / 255, 107 / 255, 47 / 255);
    public static darkorange = new Color(255 / 255, 140 / 255, 0 / 255);
    public static darkorchid = new Color(153 / 255, 50 / 255, 204 / 255);
    public static darkred = new Color(139 / 255, 0 / 255, 0 / 255);
    public static darksalmon = new Color(233 / 255, 150 / 255, 122 / 255);
    public static darkseagreen = new Color(143 / 255, 188 / 255, 143 / 255);
    public static darkslateblue = new Color(72 / 255, 61 / 255, 139 / 255);
    public static darkslategray = new Color(47 / 255, 79 / 255, 79 / 255);
    public static darkturquoise = new Color(0 / 255, 206 / 255, 209 / 255);
    public static darkviolet = new Color(148 / 255, 0 / 255, 211 / 255);
    public static deeppink = new Color(255 / 255, 20 / 255, 147 / 255);
    public static deepskyblue = new Color(0 / 255, 191 / 255, 255 / 255);
    public static dimgray = new Color(105 / 255, 105 / 255, 105 / 255);
    public static dodgerblue = new Color(30 / 255, 144 / 255, 255 / 255);
    public static firebrick = new Color(178 / 255, 34 / 255, 34 / 255);
    public static floralwhite = new Color(255 / 255, 250 / 255, 240 / 255);
    public static forestgreen = new Color(34 / 255, 139 / 255, 34 / 255);
    public static fuchsia = new Color(255 / 255, 0 / 255, 255 / 255);
    public static gainsboro = new Color(220 / 255, 220 / 255, 220 / 255);
    public static ghostwhite = new Color(248 / 255, 248 / 255, 255 / 255);
    public static gold = new Color(255 / 255, 215 / 255, 0 / 255);
    public static goldenrod = new Color(218 / 255, 165 / 255, 32 / 255);
    public static gray = new Color(128 / 255, 128 / 255, 128 / 255);
    public static green = new Color(0 / 255, 128 / 255, 0 / 255);
    public static greenyellow = new Color(173 / 255, 255 / 255, 47 / 255);
    public static honeydew = new Color(240 / 255, 255 / 255, 240 / 255);
    public static hotpink = new Color(255 / 255, 105 / 255, 180 / 255);
    public static indianred = new Color(205 / 255, 92 / 255, 92 / 255);
    public static indigo = new Color(75 / 255, 0 / 255, 130 / 255);
    public static ivory = new Color(255 / 255, 255 / 255, 240 / 255);
    public static khaki = new Color(240 / 255, 230 / 255, 140 / 255);
    public static lavender = new Color(230 / 255, 230 / 255, 250 / 255);
    public static lavenderblush = new Color(255 / 255, 240 / 255, 245 / 255);
    public static lawngreen = new Color(124 / 255, 252 / 255, 0 / 255);
    public static lemonchiffon = new Color(255 / 255, 250 / 255, 205 / 255);
    public static lightblue = new Color(173 / 255, 216 / 255, 230 / 255);
    public static lightcoral = new Color(240 / 255, 128 / 255, 128 / 255);
    public static lightcyan = new Color(224 / 255, 255 / 255, 255 / 255);
    public static lightgoldenrodyellow = new Color(250 / 255, 250 / 255, 210 / 255);
    public static lightgray = new Color(211 / 255, 211 / 255, 211 / 255);
    public static lightgreen = new Color(144 / 255, 238 / 255, 144 / 255);
    public static lightpink = new Color(255 / 255, 182 / 255, 193 / 255);
    public static lightsalmon = new Color(255 / 255, 160 / 255, 122 / 255);
    public static lightseagreen = new Color(32 / 255, 178 / 255, 170 / 255);
    public static lightskyblue = new Color(135 / 255, 206 / 255, 250 / 255);
    public static lightslategray = new Color(119 / 255, 136 / 255, 153 / 255);
    public static lightsteelblue = new Color(176 / 255, 196 / 255, 222 / 255);
    public static lightyellow = new Color(255 / 255, 255 / 255, 224 / 255);
    public static lime = new Color(0 / 255, 255 / 255, 0 / 255);
    public static limegreen = new Color(50 / 255, 205 / 255, 50 / 255);
    public static linen = new Color(250 / 255, 240 / 255, 230 / 255);
    public static magenta = new Color(255 / 255, 0 / 255, 255 / 255);
    public static maroon = new Color(128 / 255, 0 / 255, 0 / 255);
    public static mediumaquamarine = new Color(102 / 255, 205 / 255, 170 / 255);
    public static mediumblue = new Color(0 / 255, 0 / 255, 205 / 255);
    public static mediumorchid = new Color(186 / 255, 85 / 255, 211 / 255);
    public static mediumpurple = new Color(147 / 255, 112 / 255, 219 / 255);
    public static mediumseagreen = new Color(60 / 255, 179 / 255, 113 / 255);
    public static mediumslateblue = new Color(123 / 255, 104 / 255, 238 / 255);
    public static mediumspringgreen = new Color(0 / 255, 250 / 255, 154 / 255);
    public static mediumturquoise = new Color(72 / 255, 209 / 255, 204 / 255);
    public static mediumvioletred = new Color(199 / 255, 21 / 255, 133 / 255);
    public static midnightblue = new Color(25 / 255, 25 / 255, 112 / 255);
    public static mintcream = new Color(245 / 255, 255 / 255, 250 / 255);
    public static mistyrose = new Color(255 / 255, 228 / 255, 225 / 255);
    public static moccasin = new Color(255 / 255, 228 / 255, 181 / 255);
    public static navajowhite = new Color(255 / 255, 222 / 255, 173 / 255);
    public static navy = new Color(0 / 255, 0 / 255, 128 / 255);
    public static oldlace = new Color(253 / 255, 245 / 255, 230 / 255);
    public static olive = new Color(128 / 255, 128 / 255, 0 / 255);
    public static olivedrab = new Color(107 / 255, 142 / 255, 35 / 255);
    public static orange = new Color(255 / 255, 165 / 255, 0 / 255);
    public static orangered = new Color(255 / 255, 69 / 255, 0 / 255);
    public static orchid = new Color(218 / 255, 112 / 255, 214 / 255);
    public static palegoldenrod = new Color(238 / 255, 232 / 255, 170 / 255);
    public static palegreen = new Color(152 / 255, 251 / 255, 152 / 255);
    public static paleturquoise = new Color(175 / 255, 238 / 255, 238 / 255);
    public static palevioletred = new Color(219 / 255, 112 / 255, 147 / 255);
    public static papayawhip = new Color(255 / 255, 239 / 255, 213 / 255);
    public static peachpuff = new Color(255 / 255, 218 / 255, 185 / 255);
    public static peru = new Color(205 / 255, 133 / 255, 63 / 255);
    public static pink = new Color(255 / 255, 192 / 255, 203 / 255);
    public static plum = new Color(221 / 255, 160 / 255, 221 / 255);
    public static powderblue = new Color(176 / 255, 224 / 255, 230 / 255);
    public static purple = new Color(128 / 255, 0 / 255, 128 / 255);
    public static rebeccapurple = new Color(102 / 255, 51 / 255, 153 / 255);
    public static red = new Color(255 / 255, 0 / 255, 0 / 255);
    public static rosybrown = new Color(188 / 255, 143 / 255, 143 / 255);
    public static royalblue = new Color(65 / 255, 105 / 255, 225 / 255);
    public static saddlebrown = new Color(139 / 255, 69 / 255, 19 / 255);
    public static salmon = new Color(250 / 255, 128 / 255, 114 / 255);
    public static sandybrown = new Color(244 / 255, 164 / 255, 96 / 255);
    public static seagreen = new Color(46 / 255, 139 / 255, 87 / 255);
    public static seashell = new Color(255 / 255, 245 / 255, 238 / 255);
    public static sienna = new Color(160 / 255, 82 / 255, 45 / 255);
    public static silver = new Color(192 / 255, 192 / 255, 192 / 255);
    public static skyblue = new Color(135 / 255, 206 / 255, 235 / 255);
    public static slateblue = new Color(106 / 255, 90 / 255, 205 / 255);
    public static slategray = new Color(112 / 255, 128 / 255, 144 / 255);
    public static snow = new Color(255 / 255, 250 / 255, 250 / 255);
    public static springgreen = new Color(0 / 255, 255 / 255, 127 / 255);
    public static steelblue = new Color(70 / 255, 130 / 255, 180 / 255);
    public static tan = new Color(210 / 255, 180 / 255, 140 / 255);
    public static teal = new Color(0 / 255, 128 / 255, 128 / 255);
    public static thistle = new Color(216 / 255, 191 / 255, 216 / 255);
    public static tomato = new Color(255 / 255, 99 / 255, 71 / 255);
    public static turquoise = new Color(64 / 255, 224 / 255, 208 / 255);
    public static violet = new Color(238 / 255, 130 / 255, 238 / 255);
    public static wheat = new Color(245 / 255, 222 / 255, 179 / 255);
    public static white = new Color(255 / 255, 255 / 255, 255 / 255);
    public static whitesmoke = new Color(245 / 255, 245 / 255, 245 / 255);
    public static yellow = new Color(255 / 255, 255 / 255, 0 / 255);
    public static yellowgreen = new Color(154 / 255, 205 / 255, 50 / 255);
}

// -------------------------------

export function throwUninplemented(what: string = "") {
    throw new FatalError(`UNINPLEMENTED [${what}]`);
}

export function throwShouldNotRun(what: string = "") {
    throw new FatalError(`THIS SHOULD NOT RUN [${what}]`);
}

// -------------------------------

export class BitmapRGBA {
    constructor(width: number, height: number, pixels?: ArrayBufferLike) {
        this.width = width;
        this.height = height;
        
        if(pixels) {
            this.pixels = pixels;
        } else {
            this.pixels = new ArrayBuffer(width * height * 4);
        }        
    }

    public cloneFrom(bitmap: BitmapRGBA) {
        this.width = bitmap.width;
        this.height = bitmap.height;
        this.pixels = new ArrayBuffer(bitmap.pixels!.byteLength);
        new Uint8Array(this.pixels!).set(new Uint8Array(bitmap.pixels!));
    }

    public getPixel(x: number, y: number) : number {
        const index = 4 * (y * this.width + x);
        const uint8 = new Uint8Array(this.pixels!);
    
        return (
            (uint8[index + 0] << 24) |
            (uint8[index + 1] << 16) |
            (uint8[index + 2] << 8) |
            (uint8[index + 3] << 0)
        ) >>> 0;
    }

    public isBorder(x: number, y: number) : boolean {
        return x == 0 || x == this.width - 1 || y == 0 || y == this.height - 1;
    }

    public replace(from: number, to: number) {
        for(let y = 0; y < this.height; y++)
            for(let x = 0; x < this.width; x++)
                if(this.getPixel(x, y) == from) this.setPixel(x, y, to);
    }

    public setPixel(x: number, y: number, color: number) {
        const index = 4 * (y * this.width + x);
        const uint8 = new Uint8Array(this.pixels!);

        const r: number = (color >> 24) & 0xff;
        const g: number = (color >> 16) & 0xff;
        const b: number = (color >> 8) & 0xff;
        const a: number = color & 0xff;

        uint8[index + 0] = r;
        uint8[index + 1] = g;
        uint8[index + 2] = b;
        uint8[index + 3] = a;
    }

    public clear(color: number) {
    const uint8 = new Uint8Array(this.pixels!);
        for(let yy = 0; yy < this.height; yy++) {
            for(let xx = 0; xx < this.width; xx++) {
                this.setPixel(xx, yy, color);
            }
        }
    }   

    public clearRandom() {
        const uint8 = new Uint8Array(this.pixels!);
        for(let i = 0; i < this.width * this.height * 4; i++) {
            uint8[i] = Math.random() * 256;
        }
    }

    public fillRect(x: number, y: number, w: number, h: number, color: number) {
        for(let yy = y; yy < y + h; yy++) {
            for(let xx = x; xx < x + w; xx++) {
                this.setPixel(xx, yy, color);
            }
        }
    } 

    public drawRect(x: number, y: number, w: number, h: number, color: number) {
        for(let yy = y; yy < y + h; yy++) {
            for(let xx = x; xx < x + w; xx++)
                if(xx == 0 || yy == 0 || xx == x + w - 1 || yy == y + h - 1) 
                    this.setPixel(xx, yy, color);
        }
    } 

    public floodFill(x: number, y: number, color: number) {
        const target = this.getPixel(x, y);
        const stack: number[] = [];
        stack.push(x, y);
        while(stack.length > 0) {
            const y = stack.pop()!; 
            const x = stack.pop()!;
            if(x < 0 || x >= this.width || y < 0 || y >= this.height) continue;
            if(this.getPixel(x, y) != target) continue;
            this.setPixel(x, y, color);
            stack.push(x + 1, y);
            stack.push(x - 1, y);
            stack.push(x, y + 1);
            stack.push(x, y - 1);
        }
    }

    public width: number = 0;
    public height: number = 0;
    public pixels: ArrayBufferLike | null = null;
}

// -------------------------------
