
export class Vertex {
    
    static from2d(x: number, y: number, u: number, v: number, c: Color): Vertex {
        let vertex = new Vertex();
        vertex.x = x;
        vertex.y = y;
        vertex.u = u;
        vertex.v = v;
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

    public u: number = 0;
    public v: number = 0;

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
    constructor(width: number, height: number, pixels: ArrayBuffer) {
        this.width = width;
        this.height = height;
        this.pixels = pixels;
    }

    public getPixel(x: number, y: number) : number {
        const index = 4 * (y * this.width + x);
        const uint8 = new Uint8Array(this.pixels!);
        return (
            (uint8[index + 0] << 24) |
            (uint8[index + 1] << 16) |
            (uint8[index + 2] << 8) |
            (uint8[index + 3] << 0));
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

    public width: number = 0;
    public height: number = 0;
    public pixels: ArrayBuffer | null = null;
}

// -------------------------------
