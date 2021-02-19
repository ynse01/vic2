import { ColorPalette } from "./color-palette";
import { CharacterModeRenderTarget } from "./character-mode-render-target";

function main() {
    const canvas = <HTMLCanvasElement>document.querySelector("#glCanvas");
    if (canvas != null) {
        const gl = canvas.getContext("webgl");
        if (gl == null) {
            throw new Error("Unable to initialize WebGL.")
        }
        const characterMode = new CharacterModeRenderTarget(gl, ColorPalette.lightBlue, ColorPalette.blue);
        characterMode.start();
    }
}
window.onload = main;