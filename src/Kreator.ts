
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
}

class UnitTileUv {    
    public id: string = "";
    public weight: number = 1.0;
    
    public u0: number = 0.0;
    public v0: number = 0.0;
    public u1: number = 1.0;
    public v1: number = 1.0;
}

export class KreatorOfDungeon {

    private dungeonUnit: number = 1.0;

    //public  

    public beginDungeonWall(geom: n.GeometryBuilder, uv: n.Vector4, uvIndex: number, normal: n.Vector3, color: n.Color) {
        //if(uvIndex == 0) { geom.current().u0 = 0.0; geom.current().v0 = 0.0; }
        //if(uvIndex == 1) { geom.current().u0 = 1.0; geom.current().v0 = 0.0; }
        //if(uvIndex == 2) { geom.current().u0 = 1.0; geom.current().v0 = 1.0; }
        //if(uvIndex == 3) { geom.current().u0 = 0.0; geom.current().v0 = 1.0; }
        if(uvIndex == 0) { geom.current().u0 = uv.x; geom.current().v0 = uv.y; }
        if(uvIndex == 1) { geom.current().u0 = uv.z; geom.current().v0 = uv.y; } 
        if(uvIndex == 2) { geom.current().u0 = uv.z; geom.current().v0 = uv.w; }
        if(uvIndex == 3) { geom.current().u0 = uv.x; geom.current().v0 = uv.w; }
        geom.current().nx = normal.x; geom.current().ny = normal.y; geom.current().nz = normal.z;
        geom.current().r = color.r; geom.current().g = color.g; geom.current().b = color.b; geom.current().a = color.a;
    }
 
    public commitVertex(geom: n.GeometryBuilder) {
        //geom.current().x += Math.sin(geom.current().x) * 0.1;
        geom.current().y += Math.sin(geom.current().x + geom.current().x) * 0.05;
        geom.current().x += Math.cos(geom.current().x + geom.current().x) * 0.05;
        geom.current().z += Math.cos(2 * geom.current().x + geom.current().x) * 0.05;
        //geom.current().z += Math.sin(geom.current().x * 100) * 0.1;
        //geom.current().z += Math.sin(geom.current().y * 100) * 0.1;
        geom.commitVertex();
    }
 
    public createDungeonWall(color: n.Color, blockPos: n.Vector3, direction: string, geom: n.GeometryBuilder) {
        
        const u = this.dungeonUnit;
        const origoX = blockPos.x * u;
        const origoY = blockPos.y * u;
        const origoZ = blockPos.z * u; 

        let uv: n.Vector4 = new n.Vector4(0.25, 1 - 0.125, 0.25 + 0.125, 1 - 0);
   
        if(direction == "down") {
            this.beginDungeonWall(geom, uv, 0, new n.Vector3(0, 1, 0), color);
            geom.current().x = origoX; geom.current().y = origoY; geom.current().z = origoZ;
            this.commitVertex(geom); 

            this.beginDungeonWall(geom, uv, 1, new n.Vector3(0, 1, 0), color);
            geom.current().x = origoX + u; geom.current().y = origoY; geom.current().z = origoZ;
            this.commitVertex(geom); 

            this.beginDungeonWall(geom, uv, 3, new n.Vector3(0, 1, 0), color);
            geom.current().x = origoX; geom.current().y = origoY; geom.current().z = origoZ - u;
            this.commitVertex(geom); 

            this.beginDungeonWall(geom, uv, 1, new n.Vector3(0, 1, 0), color);
            geom.current().x = origoX + u; geom.current().y = origoY; geom.current().z = origoZ;
            this.commitVertex(geom); 
 
            this.beginDungeonWall(geom, uv, 2, new n.Vector3(0, 1, 0), color);
            geom.current().x = origoX + u; geom.current().y = origoY; geom.current().z = origoZ - u;
            this.commitVertex(geom); 
   
            this.beginDungeonWall(geom, uv, 3, new n.Vector3(0, 1, 0), color);
            geom.current().x = origoX; geom.current().y = origoY; geom.current().z = origoZ - u;
            this.commitVertex(geom); 
        }

        if(direction == "up") {
            this.beginDungeonWall(geom, uv, 0, new n.Vector3(0, 1, 0), color);
            geom.current().x = origoX; geom.current().y = origoY + u; geom.current().z = origoZ;
            this.commitVertex(geom); 

            this.beginDungeonWall(geom, uv, 3, new n.Vector3(0, 1, 0), color);
            geom.current().x = origoX; geom.current().y = origoY + u; geom.current().z = origoZ - u;
            this.commitVertex(geom); 

            this.beginDungeonWall(geom, uv, 1, new n.Vector3(0, 1, 0), color);
            geom.current().x = origoX + u; geom.current().y = origoY + u; geom.current().z = origoZ;
            this.commitVertex(geom); 

            this.beginDungeonWall(geom, uv, 1, new n.Vector3(0, 1, 0), color);
            geom.current().x = origoX + u; geom.current().y = origoY + u; geom.current().z = origoZ;
            this.commitVertex(geom); 
   
            this.beginDungeonWall(geom, uv, 3, new n.Vector3(0, 1, 0), color);
            geom.current().x = origoX; geom.current().y = origoY + u; geom.current().z = origoZ - u;
            this.commitVertex(geom); 

            this.beginDungeonWall(geom, uv, 2, new n.Vector3(0, 1, 0), color);
            geom.current().x = origoX + u; geom.current().y = origoY + u; geom.current().z = origoZ - u;
            this.commitVertex(geom); 
        }

        if(direction == "south") {
            this.beginDungeonWall(geom, uv, 0, new n.Vector3(0, 0, 1), color);
            geom.current().x = origoX; geom.current().y = origoY; geom.current().z = origoZ;
            this.commitVertex(geom); 

            this.beginDungeonWall(geom, uv, 1, new n.Vector3(0, 0, 1), color);
            geom.current().x = origoX + u; geom.current().y = origoY; geom.current().z = origoZ;
            this.commitVertex(geom); 

            this.beginDungeonWall(geom, uv, 3, new n.Vector3(0, 0, 1), color);
            geom.current().x = origoX; geom.current().y = origoY + u; geom.current().z = origoZ;
            this.commitVertex(geom); 

            this.beginDungeonWall(geom, uv, 1, new n.Vector3(0, 0, 1), color);
            geom.current().x = origoX + u; geom.current().y = origoY; geom.current().z = origoZ;
            this.commitVertex(geom); 
 
            this.beginDungeonWall(geom, uv, 2, new n.Vector3(0, 0, 1), color);
            geom.current().x = origoX + u; geom.current().y = origoY + u; geom.current().z = origoZ;
            this.commitVertex(geom); 
      
            this.beginDungeonWall(geom, uv, 3, new n.Vector3(0, 0, 1), color);
            geom.current().x = origoX; geom.current().y = origoY + u; geom.current().z = origoZ;
            this.commitVertex(geom); 
        }

        if(direction == "east") {
            this.beginDungeonWall(geom, uv, 0, new n.Vector3(1, 0, 0), color);
            geom.current().x = origoX + u; geom.current().y = origoY; geom.current().z = origoZ;
            this.commitVertex(geom); 

            this.beginDungeonWall(geom, uv, 1, new n.Vector3(1, 0, 0), color);
            geom.current().x = origoX + u; geom.current().y = origoY; geom.current().z = origoZ - u;
            this.commitVertex(geom); 

            this.beginDungeonWall(geom, uv, 3, new n.Vector3(1, 0, 0), color);
            geom.current().x = origoX + u; geom.current().y = origoY + u; geom.current().z = origoZ;
            this.commitVertex(geom); 

            this.beginDungeonWall(geom, uv, 1, new n.Vector3(1, 0, 0), color);
            geom.current().x = origoX + u; geom.current().y = origoY; geom.current().z = origoZ - u;
            this.commitVertex(geom); 
 
            this.beginDungeonWall(geom, uv, 2, new n.Vector3(1, 0, 0), color);
            geom.current().x = origoX + u; geom.current().y = origoY + u; geom.current().z = origoZ - u;
            this.commitVertex(geom); 
      
            this.beginDungeonWall(geom, uv, 3, new n.Vector3(1, 0, 0), color);
            geom.current().x = origoX + u; geom.current().y = origoY + u; geom.current().z = origoZ;
            this.commitVertex(geom); 
        }

        if(direction == "west") {
            this.beginDungeonWall(geom, uv, 0, new n.Vector3(-1, 0, 0), color);
            geom.current().x = origoX; geom.current().y = origoY; geom.current().z = origoZ - u;
            this.commitVertex(geom); 

            this.beginDungeonWall(geom, uv, 1, new n.Vector3(-1, 0, 0), color);
            geom.current().x = origoX; geom.current().y = origoY; geom.current().z = origoZ;
            this.commitVertex(geom); 

            this.beginDungeonWall(geom, uv, 3, new n.Vector3(-1, 0, 0), color);
            geom.current().x = origoX; geom.current().y = origoY + u; geom.current().z = origoZ - u;
            this.commitVertex(geom); 

            this.beginDungeonWall(geom, uv, 1, new n.Vector3(-1, 0, 0), color);
            geom.current().x = origoX; geom.current().y = origoY; geom.current().z = origoZ;
            this.commitVertex(geom); 
  
            this.beginDungeonWall(geom, uv, 2, new n.Vector3(-1, 0, 0), color);
            geom.current().x = origoX; geom.current().y = origoY + u; geom.current().z = origoZ;
            this.commitVertex(geom); 

            this.beginDungeonWall(geom, uv, 3, new n.Vector3(-1, 0, 0), color);
            geom.current().x = origoX; geom.current().y = origoY + u; geom.current().z = origoZ - u;
            this.commitVertex(geom); 
        }

        if(direction == "north") {
            this.beginDungeonWall(geom, uv, 0, new n.Vector3(0, 0, -1), color);
            geom.current().x = origoX + u; geom.current().y = origoY; geom.current().z = origoZ - u;
            this.commitVertex(geom); 

            this.beginDungeonWall(geom, uv, 1, new n.Vector3(0, 0, -1), color);
            geom.current().x = origoX; geom.current().y = origoY; geom.current().z = origoZ - u;
            this.commitVertex(geom); 

            this.beginDungeonWall(geom, uv, 3, new n.Vector3(0, 0, -1), color);
            geom.current().x = origoX + u; geom.current().y = origoY + u; geom.current().z = origoZ - u;
            this.commitVertex(geom); 

            this.beginDungeonWall(geom, uv, 1, new n.Vector3(0, 0, -1), color);
            geom.current().x = origoX; geom.current().y = origoY; geom.current().z = origoZ - u;
            this.commitVertex(geom); 

            this.beginDungeonWall(geom, uv, 2, new n.Vector3(0, 0, -1), color);
            geom.current().x = origoX; geom.current().y = origoY + u; geom.current().z = origoZ - u;
            this.commitVertex(geom); 

            this.beginDungeonWall(geom, uv, 3, new n.Vector3(0, 0, -1), color);
            geom.current().x = origoX + u; geom.current().y = origoY + u; geom.current().z = origoZ - u;
            this.commitVertex(geom); 
        }
    }
 
    public labyrinthToGeometry(map: n.BitmapRGBA): n.Geometry {
        let geom = new n.GeometryBuilder(n.GeometryFormat.xyzNxnynzUvRgba);

        for(let y = 0; y < map.height; y++) { 
            for(let x = 0; x < map.width; x++) {
                let pixel = map.getPixel(x, y);

                if(pixel == 0x00000000) {
                    this.createDungeonWall(n.Colors.darkgray, new n.Vector3(x, 0, -y), "down", geom);
                    this.createDungeonWall(n.Colors.cyan, new n.Vector3(x, 0, -y), "up", geom);
                } else if(pixel == 0xffffffff) {
                    if(y > 0  && map.getPixel(x, y - 1) == 0x00000000) {
                        this.createDungeonWall(n.Colors.white, new n.Vector3(x, 0, -y), "south", geom);
                    }
                    if(x < map.width - 1 && map.getPixel(x + 1, y) == 0x00000000) {
                        this.createDungeonWall(n.Colors.bisque, new n.Vector3(x, 0, -y), "east", geom);
                    } 
                    if(x > 0 && map.getPixel(x - 1, y) == 0x00000000) {
                        this.createDungeonWall(n.Colors.khaki, new n.Vector3(x, 0, -y), "west", geom);
                    } 
                    if(y < map.height - 1 && map.getPixel(x, y + 1) == 0x00000000) {
                        this.createDungeonWall(n.Colors.wheat, new n.Vector3(x, 0, -y), "north", geom);
                    } 
                }
            }
        }

        return geom.createGeometry();
    }

    public getDungeonBlockCenter(x: number, y: number): n.Vector3 {
        return new n.Vector3(  
            x * this.dungeonUnit + this.dungeonUnit / 2, 
            this.dungeonUnit * 0.5,  
            -y * this.dungeonUnit - this.dungeonUnit / 2); 
    }

    public getDungeonRandomEmptyBlock(map: n.BitmapRGBA): n.Vector2 {
        let x = 0, y = 0;
        while(true) {
            x = Math.floor(Math.random() * map.width);
            y = Math.floor(Math.random() * map.height);
            if(map.getPixel(x, y) == 0x00000000) break;
        }  
        return new n.Vector2(x, y);
    }

}
