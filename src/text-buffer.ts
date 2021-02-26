import { CharacterCodes } from "./character-codes";

export class TextBuffer {
    private _data: number[];

    constructor() {
        this._data = [];
        for(let i = 0; i < (40 * 25); i++) {
            this._data[i] = 96;
        }
    }

    public get data(): number[] {
        return this._data;
    }

    public writeWelcomeMessage(): void {
        this.writeString(" ".repeat(40), 0, 0);
        this.writeString("    **** COMMODORE 64 BASIC V2 ****     ", 1, 0);
        this.writeString(" ".repeat(40), 2, 0);
        this.writeString(" 64K RAM SYSTEM  38911 BASIC BYTES FREE ", 3, 0);
        this.writeString(" ".repeat(40), 4, 0);
        this.writeString("READY.                                  ", 5, 0);
        // "Blinking" cursor
        this._data[6 * 40] = 96 + 128;
    }

    public getChar(row: number, column: number): string {
        const code = this._data[(row * 40) + column];
        return CharacterCodes.getChar(code);
    }

    public debug(): void {
        for (let y = 0; y < 25; y++) {
            console.log(
                `'${this.getChar(y, 0)}${this.getChar(y, 1)}${this.getChar(y, 2)}${this.getChar(y, 3)}` +
                `${this.getChar(y, 4)}${this.getChar(y, 5)}${this.getChar(y, 6)}${this.getChar(y, 7)}` +
                `${this.getChar(y, 8)}${this.getChar(y, 9)}${this.getChar(y, 10)}${this.getChar(y, 11)}` +
                `${this.getChar(y, 12)}${this.getChar(y, 13)}${this.getChar(y, 14)}${this.getChar(y, 15)}` +
                `${this.getChar(y, 16)}${this.getChar(y, 17)}${this.getChar(y, 18)}${this.getChar(y, 19)}` +
                `${this.getChar(y, 20)}${this.getChar(y, 21)}${this.getChar(y, 22)}${this.getChar(y, 23)}` +
                `${this.getChar(y, 24)}${this.getChar(y, 25)}${this.getChar(y, 26)}${this.getChar(y, 27)}` +
                `${this.getChar(y, 28)}${this.getChar(y, 29)}${this.getChar(y, 30)}${this.getChar(y, 31)}` +
                `${this.getChar(y, 32)}${this.getChar(y, 33)}${this.getChar(y, 34)}${this.getChar(y, 35)}` +
                `${this.getChar(y, 36)}${this.getChar(y, 37)}${this.getChar(y, 38)}${this.getChar(y, 39)}'`
            );
        }
    }

    private writeCode(code: number, row: number, column: number): void {
        this._data[(row * 40) + column] = code;
    }

    private writeString(str: string, row: number, column: number): void {
        let x = column;
        let y = row;
        for(let i = 0; i < str.length; i++) {
            const code = CharacterCodes.getCodeAt(str, i);
            this.writeCode(code, y, x);
            x++;
            if (x >= 40) {
                x -= 40;
                y++;
            }
        }
    }
}