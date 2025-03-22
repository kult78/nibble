
import * as n from "./nibble/index.js";

export class Kreator {
   
    public static unit = 10.0;

    public static getCentreOfWordBlock(blockPos: n.Vector3): n.Vector3 {
        return new n.Vector3(
            blockPos.x * this.unit + this.unit / 2,
            blockPos.z * this.unit + this.unit / 2,
            blockPos.y * this.unit + this.unit / 2
        );
    }

    public static floorSlabs(blockX0: number, tileY0: number, tileCountX: number, tileCountY: number) {
        for(let x = 0; x < tileCountX; x++) {
            for(let y = 0; y < tileCountY; y++) {
            }
        }
    }
     
    public static loadObj(obj: string, align: n.GeometryAlign = n.GeometryAlign.None): n.Geometry {

        let builder: n.GeometryBuilder = new n.GeometryBuilder(n.GeometryFormat.xyzNxnynzUvRgba);
        
        let obj2 = obj.replace(new RegExp("\r", "g"), "");
        let lines = obj2.split("\n");

        let positions: number[] = [];
        let uv0s: number[] = [];
        let normals: number[] = [];

        for(let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let parts = line.split(" ");
            if(parts[0] == "v") {
                positions.push(parseFloat(parts[1]));
                positions.push(parseFloat(parts[2]));
                positions.push(parseFloat(parts[3]));
            } else if(parts[0] == "vt") {
                uv0s.push(parseFloat(parts[1]));
                uv0s.push(parseFloat(parts[2]));
            } else if(parts[0] == "vn") {
                normals.push(parseFloat(parts[1]));
                normals.push(parseFloat(parts[2]));
                normals.push(parseFloat(parts[3]));
            } else if(parts[0] == "f") {
                let indices = [1, 2, 3];
                if(parts.length == 5) indices = [1, 2, 3, 3, 4, 1];                
                for(let j = 0; j < indices.length; j++) {
                    let faceParts = parts[indices[j]].split("/");
                    let positionIndex = (parseInt(faceParts[0]) - 1) * 3;
                    let uv0Index = (parseInt(faceParts[1]) - 1) * 2;
                    let normalIndex = (parseInt(faceParts[2]) - 1) * 3;
 
                    builder.current().x = positions[positionIndex + 0];
                    builder.current().y = positions[positionIndex + 1];
                    builder.current().z = positions[positionIndex + 2];
                    builder.current().u0 = uv0s[uv0Index + 0];
                    builder.current().v0 = uv0s[uv0Index + 1];
                    builder.current().nx = normals[normalIndex + 0];
                    builder.current().ny = normals[normalIndex + 1];
                    builder.current().nz = normals[normalIndex + 2];
                    builder.current().r = 1;
                    builder.current().g = 1;
                    builder.current().b = 1;
                    builder.current().a = 1;
                    builder.commitVertex();
                }
            }
        }

        return builder.createGeometry(align);
    }

    public static randomBlockTris(blockPos: n.Vector3, triCount: number): n.Geometry {
        let builder: n.GeometryBuilder = new n.GeometryBuilder(n.GeometryFormat.xyzNxnynzUvRgba);
        let centre = this.getCentreOfWordBlock(blockPos);

        for(let i = 0; i < triCount; i++) {
            for(let j = 0; j < 3; j++) {
                let x = centre.x + (Math.random() - 0.5) * this.unit;
                let y = centre.y + (Math.random() - 0.5) * this.unit;
                let z = centre.z + (Math.random() - 0.5) * this.unit;
                builder.current().x = x;
                builder.current().y = y;
                builder.current().z = z;
                builder.current().u0 = Math.random();
                builder.current().v0 = Math.random();
                builder.current().r = Math.random();
                builder.current().g = Math.random();
                builder.current().b = Math.random();
                builder.current().a = 1;
                builder.commitVertex(); 
            }
        }

        return builder.createGeometry();
    }
 
    // -------------------------------
    
    private static dungeonUnit: number = 1.0;

    public static beginDungeonWall(geom: n.GeometryBuilder, uvIndex: number, normal: n.Vector3, color: n.Color) {
        if(uvIndex == 0) { geom.current().u0 = 0.0; geom.current().v0 = 0.0; }
        if(uvIndex == 1) { geom.current().u0 = 1.0; geom.current().v0 = 0.0; }
        if(uvIndex == 2) { geom.current().u0 = 1.0; geom.current().v0 = 1.0; }
        if(uvIndex == 3) { geom.current().u0 = 0.0; geom.current().v0 = 1.0; }
        geom.current().nx = normal.x; geom.current().ny = normal.y; geom.current().nz = normal.z;
        geom.current().r = color.r; geom.current().g = color.g; geom.current().b = color.b; geom.current().a = color.a;
}

    public static createDungeonWall(color: n.Color, blockPos: n.Vector3, direction: string, geom: n.GeometryBuilder) {
        
        const u = this.dungeonUnit;
        const origoX = blockPos.x * u;
        const origoY = blockPos.y * u;
        const origoZ = blockPos.z * u;

        if(direction == "down") {
            this.beginDungeonWall(geom, 0, new n.Vector3(0, 1, 0), color);
            geom.current().x = origoX; geom.current().y = origoY; geom.current().z = origoZ;
            geom.commitVertex(); 

            this.beginDungeonWall(geom, 1, new n.Vector3(0, 1, 0), color);
            geom.current().x = origoX + u; geom.current().y = origoY; geom.current().z = origoZ;
            geom.commitVertex();

            this.beginDungeonWall(geom, 3, new n.Vector3(0, 1, 0), color);
            geom.current().x = origoX; geom.current().y = origoY; geom.current().z = origoZ - u;
            geom.commitVertex();

            this.beginDungeonWall(geom, 1, new n.Vector3(0, 1, 0), color);
            geom.current().x = origoX + u; geom.current().y = origoY; geom.current().z = origoZ;
            geom.commitVertex(); 
 
            this.beginDungeonWall(geom, 2, new n.Vector3(0, 1, 0), color);
            geom.current().x = origoX + u; geom.current().y = origoY; geom.current().z = origoZ - u;
            geom.commitVertex();
   
            this.beginDungeonWall(geom, 3, new n.Vector3(0, 1, 0), color);
            geom.current().x = origoX; geom.current().y = origoY; geom.current().z = origoZ - u;
            geom.commitVertex();
        }

        if(direction == "up") {
            this.beginDungeonWall(geom, 0, new n.Vector3(0, 1, 0), color);
            geom.current().x = origoX; geom.current().y = origoY + u; geom.current().z = origoZ;
            geom.commitVertex(); 

            this.beginDungeonWall(geom, 3, new n.Vector3(0, 1, 0), color);
            geom.current().x = origoX; geom.current().y = origoY + u; geom.current().z = origoZ - u;
            geom.commitVertex();

            this.beginDungeonWall(geom, 1, new n.Vector3(0, 1, 0), color);
            geom.current().x = origoX + u; geom.current().y = origoY + u; geom.current().z = origoZ;
            geom.commitVertex();

            this.beginDungeonWall(geom, 1, new n.Vector3(0, 1, 0), color);
            geom.current().x = origoX + u; geom.current().y = origoY + u; geom.current().z = origoZ;
            geom.commitVertex(); 
   
            this.beginDungeonWall(geom, 3, new n.Vector3(0, 1, 0), color);
            geom.current().x = origoX; geom.current().y = origoY + u; geom.current().z = origoZ - u;
            geom.commitVertex();

            this.beginDungeonWall(geom, 2, new n.Vector3(0, 1, 0), color);
            geom.current().x = origoX + u; geom.current().y = origoY + u; geom.current().z = origoZ - u;
            geom.commitVertex();
        }

        if(direction == "south") {
            this.beginDungeonWall(geom, 0, new n.Vector3(0, 0, 1), color);
            geom.current().x = origoX; geom.current().y = origoY; geom.current().z = origoZ;
            geom.commitVertex();

            this.beginDungeonWall(geom, 1, new n.Vector3(0, 0, 1), color);
            geom.current().x = origoX + u; geom.current().y = origoY; geom.current().z = origoZ;
            geom.commitVertex();

            this.beginDungeonWall(geom, 3, new n.Vector3(0, 0, 1), color);
            geom.current().x = origoX; geom.current().y = origoY + u; geom.current().z = origoZ;
            geom.commitVertex();

            this.beginDungeonWall(geom, 1, new n.Vector3(0, 0, 1), color);
            geom.current().x = origoX + u; geom.current().y = origoY; geom.current().z = origoZ;
            geom.commitVertex(); 
 
            this.beginDungeonWall(geom, 2, new n.Vector3(0, 0, 1), color);
            geom.current().x = origoX + u; geom.current().y = origoY + u; geom.current().z = origoZ;
            geom.commitVertex();
      
            this.beginDungeonWall(geom, 3, new n.Vector3(0, 0, 1), color);
            geom.current().x = origoX; geom.current().y = origoY + u; geom.current().z = origoZ;
            geom.commitVertex();
        }

        if(direction == "east") {
            this.beginDungeonWall(geom, 0, new n.Vector3(1, 0, 0), color);
            geom.current().x = origoX + u; geom.current().y = origoY; geom.current().z = origoZ;
            geom.commitVertex();

            this.beginDungeonWall(geom, 1, new n.Vector3(1, 0, 0), color);
            geom.current().x = origoX + u; geom.current().y = origoY; geom.current().z = origoZ - u;
            geom.commitVertex();

            this.beginDungeonWall(geom, 3, new n.Vector3(1, 0, 0), color);
            geom.current().x = origoX + u; geom.current().y = origoY + u; geom.current().z = origoZ;
            geom.commitVertex();

            this.beginDungeonWall(geom, 1, new n.Vector3(1, 0, 0), color);
            geom.current().x = origoX + u; geom.current().y = origoY; geom.current().z = origoZ - u;
            geom.commitVertex(); 
 
            this.beginDungeonWall(geom, 2, new n.Vector3(1, 0, 0), color);
            geom.current().x = origoX + u; geom.current().y = origoY + u; geom.current().z = origoZ - u;
            geom.commitVertex();
      
            this.beginDungeonWall(geom, 3, new n.Vector3(1, 0, 0), color);
            geom.current().x = origoX + u; geom.current().y = origoY + u; geom.current().z = origoZ;
            geom.commitVertex();
        }

        if(direction == "west") {
            this.beginDungeonWall(geom, 0, new n.Vector3(-1, 0, 0), color);
            geom.current().x = origoX; geom.current().y = origoY; geom.current().z = origoZ - u;
            geom.commitVertex();

            this.beginDungeonWall(geom, 1, new n.Vector3(-1, 0, 0), color);
            geom.current().x = origoX; geom.current().y = origoY; geom.current().z = origoZ;
            geom.commitVertex();

            this.beginDungeonWall(geom, 3, new n.Vector3(-1, 0, 0), color);
            geom.current().x = origoX; geom.current().y = origoY + u; geom.current().z = origoZ - u;
            geom.commitVertex();

            this.beginDungeonWall(geom, 1, new n.Vector3(-1, 0, 0), color);
            geom.current().x = origoX; geom.current().y = origoY; geom.current().z = origoZ;
            geom.commitVertex();

            this.beginDungeonWall(geom, 2, new n.Vector3(-1, 0, 0), color);
            geom.current().x = origoX; geom.current().y = origoY + u; geom.current().z = origoZ;
            geom.commitVertex();

            this.beginDungeonWall(geom, 3, new n.Vector3(-1, 0, 0), color);
            geom.current().x = origoX; geom.current().y = origoY + u; geom.current().z = origoZ - u;
            geom.commitVertex();
        }

        if(direction == "north") {
            this.beginDungeonWall(geom, 0, new n.Vector3(0, 0, -1), color);
            geom.current().x = origoX + u; geom.current().y = origoY; geom.current().z = origoZ - u;
            geom.commitVertex();

            this.beginDungeonWall(geom, 1, new n.Vector3(0, 0, -1), color);
            geom.current().x = origoX; geom.current().y = origoY; geom.current().z = origoZ - u;
            geom.commitVertex();

            this.beginDungeonWall(geom, 3, new n.Vector3(0, 0, -1), color);
            geom.current().x = origoX + u; geom.current().y = origoY + u; geom.current().z = origoZ - u;
            geom.commitVertex();

            this.beginDungeonWall(geom, 1, new n.Vector3(0, 0, -1), color);
            geom.current().x = origoX; geom.current().y = origoY; geom.current().z = origoZ - u;
            geom.commitVertex();

            this.beginDungeonWall(geom, 2, new n.Vector3(0, 0, -1), color);
            geom.current().x = origoX; geom.current().y = origoY + u; geom.current().z = origoZ - u;
            geom.commitVertex();

            this.beginDungeonWall(geom, 3, new n.Vector3(0, 0, -1), color);
            geom.current().x = origoX + u; geom.current().y = origoY + u; geom.current().z = origoZ - u;
            geom.commitVertex();
        }
    }
 
    public static labyrinthToGeometry(map: n.BitmapRGBA): n.Geometry {
        let geom = new n.GeometryBuilder(n.GeometryFormat.xyzNxnynzUvRgba);

        for(let y = 0; y < map.height; y++) { 
            for(let x = 0; x < map.width; x++) {
                let pixel = map.getPixel(x, y);

                if(pixel == 0x00000000) {
                    this.createDungeonWall(n.Colors.darkgray, new n.Vector3(x, 0, -y), "down", geom);
                    this.createDungeonWall(n.Colors.green, new n.Vector3(x, 0, -y), "up", geom);
                } else if(pixel == 0xffffffff) {
                    if(y > 0  && map.getPixel(x, y - 1) == 0x00000000) {
                        this.createDungeonWall(n.Colors.white, new n.Vector3(x, 0, -y), "south", geom);
                    }
                    if(x < map.width - 1 && map.getPixel(x + 1, y) == 0x00000000) {
                        this.createDungeonWall(n.Colors.blue, new n.Vector3(x, 0, -y), "east", geom);
                    } 
                    if(x > 0 && map.getPixel(x - 1, y) == 0x00000000) {
                        this.createDungeonWall(n.Colors.red, new n.Vector3(x, 0, -y), "west", geom);
                    } 
                    if(y < map.height - 1 && map.getPixel(x, y + 1) == 0x00000000) {
                        this.createDungeonWall(n.Colors.yellow, new n.Vector3(x, 0, -y), "north", geom);
                    } 
                }
            }
        }

        return geom.createGeometry();
    }

    public static getDungeonRandomEmptyBlockCenter(map: n.BitmapRGBA): n.Vector3 {
        let x = 0, y = 0;
        while(true) {
            x = Math.floor(Math.random() * map.width);
            y = Math.floor(Math.random() * map.height);
            if(map.getPixel(x, y) == 0x00000000) break;
        }  

        //map.setPixel(x, y, 0xff8811ff);

        return new n.Vector3(  
            x * this.dungeonUnit + this.dungeonUnit / 2, 
            this.dungeonUnit * 0.5,  
            -y * this.dungeonUnit + this.dungeonUnit / 2);
    }
}
