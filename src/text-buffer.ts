
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

    private writeString(str: string, row: number, column: number) {
        for(let i = 0; i < str.length; i++) {
            const code = str.charCodeAt(i);
            const val = this.convertCharCode(code);
            this._data[(row * 40) + column] = val;
            column++;
            if (column >= 40) {
                column -= 40;
                row++;
            }
        }
    }

    private convertCharCode(code: number): number {
        return code;
    }
}