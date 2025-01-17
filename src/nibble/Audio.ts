
import { Howl, Howler } from "./ext/howlerModule.js";


export function playMusic(file: string) {

    var sound = new Howl({
        src: [file],
        html5: true
    });
  
    sound.play();

}


