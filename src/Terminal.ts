import * as n from "./nibble/index.js";
import { Font } from "./Font";

export class TerminalSetup {

  public fonts: { [key: string]: string } = {};
  public materialName: string = "";
  public canvasPixelWidth: number = 128;
  public canvasPixelHeight: number = 128;
}

export class Terminal { 
    
    public constructor(setup: TerminalSetup) {

      this.materialName = setup.materialName;
      this.setCanvasPixelSize(setup.canvasPixelWidth, setup.canvasPixelHeight);

      for (const [key, fontFile] of Object.entries(setup.fonts)) {
        let text: string | null = n.getText(fontFile);

        if(text === null) {
          throw new n.FatalError(`Font file ${fontFile} not found.`);
        }

        let f: Font = new Font(key, text);
        this.fonts[key] = f;
      }

        //const input = "Open {red yellow}the door{} with {armour0} {green white}sword{}.";
        //const output = this.parseText(input);
        //console.log(output);
 
    }

    private materialName: string = "";    
    private pixelWidth : number = 128;
    private pixelHeight : number = 128;
    private fonts: { [key: string]: Font } = {};

    public setCanvasPixelSize(width: number, height: number): void {
        this.pixelWidth = width;
        this.pixelHeight = height;
    }

//    public setTexture(name: string, characterPixelWidth: number, characterPixelHeight: number): void {
//        this.textureName = name;
//        this.characterPixelWidth = characterPixelWidth;
//        this.characterPixelHeight = characterPixelHeight;
//    }

    private parseText(text: string): string[] {
        const result: string[] = [];
        let i = 0;
      
        while (i < text.length) {
          if (text[i] === '{') {
            let end = text.indexOf('}', i);
            if (end === -1) {
              // unmatched brace, treat as normal character
              result.push(text[i]);
              i++;
            } else {
              const content = text.slice(i + 1, end).trim();
              if (content.length > 0) {
                const words = content.split(/\s+/); // split by one or more spaces
                result.push(...words);
              } else {
                result.push(''); // handle empty switch
              }
              i = end + 1;
            }
          } else {
            result.push(text[i]);
            i++;
          }
        }
      
        return result;
      }
}
 

