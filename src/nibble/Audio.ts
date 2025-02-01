
import { Howl, Howler } from "./ext/howlerModule.js";


export function playMusic(file: string, loop: boolean, volume: number) {

    var sound = new Howl({
        src: [file],
        loop: loop,
        volume: volume,
        html5: true
    });
  
    sound.play();

}


