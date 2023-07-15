export enum HexDirection {
    Left,
    Right,
    UpLeft,
    UpRight,
    DownLeft,
    DownRight,
}

export interface ICoord {
    toCube(): CubeCoord;
    toOffset(): OffsetCoord;
    toAxial(): AxialCoord;
    neighbour(direction: HexDirection): Coord;
}

export abstract class Coord implements ICoord {
    abstract toCube(): CubeCoord;
    abstract toOffset(): OffsetCoord;
    abstract toAxial(): AxialCoord;
    abstract neighbour(direction: HexDirection): Coord;

    static parse(s: string): Coord {
        const matches = /(c|o|a)(-?\d+):(-?\d+):?(-?\d+)?/.exec(s);
        if (matches) {
            const type = matches[1];
            const x = parseInt(matches[2]);
            const y = parseInt(matches[3]);
            const z = parseInt(matches[4]);
            switch (type) {
                case 'c':
                    return Coord.c(x, y, z);
                case 'o':
                    return Coord.o(x, y);
                case 'a':
                    return Coord.a(x, y);
            }
        }
        throw new Error(`Invalid coord string: ${s}`);
    }
    
    static toString(c: Coord): string {
        if(c instanceof AxialCoord) {
            return `a${c.q}:${c.r}`;
        } else if(c instanceof OffsetCoord) {
            return `o${c.x}:${c.y}`;
        } else if(c instanceof CubeCoord) {
            return `c${c.q}:${c.r}:${c.s}`;
        }
        throw new Error(`Invalid coord type: ${c}`);
    }

    static c(x: number, y: number, z: number): CubeCoord {
        return new CubeCoord(x, y, z);
    }

    static o(x: number, y: number): OffsetCoord {
        return new OffsetCoord( x, y);
    }

    static a(q: number, r: number): AxialCoord {
        return new AxialCoord(q, r);
    }

    toString(): string {
        return Coord.toString(this);
    }
}

export class AxialCoord implements Coord {
    constructor(public readonly q: number, public readonly r: number) { }

    toCube(): CubeCoord {
        return Coord.c(this.q, this.r, -this.q - this.r);
    }

    toOffset(): OffsetCoord {       
        return Coord.o(this.q + (this.r - (this.r & 1)) / 2, this.r);
    }

    toAxial(): AxialCoord {
        return this;
    }

    neighbour(direction: HexDirection): Coord {
        switch (direction) {
            case HexDirection.Left:
                return Coord.a(this.q - 1, this.r);
            case HexDirection.Right:
                return Coord.a(this.q + 1, this.r);
            case HexDirection.UpLeft:
                return Coord.a(this.q, this.r - 1);
            case HexDirection.UpRight:
                return Coord.a(this.q + 1, this.r - 1);
            case HexDirection.DownLeft:
                return Coord.a(this.q - 1, this.r + 1);
            case HexDirection.DownRight:
                return Coord.a(this.q, this.r + 1);
        }
    }

    toString(): string {
        return Coord.toString(this);
    }
}

export class CubeCoord implements Coord {
    constructor(public readonly q: number, public readonly r: number, public readonly s: number) { }


    toCube(): CubeCoord {
        return this;
    }

    toOffset(): OffsetCoord {
        return Coord.o(this.q + (this.r - (this.r & 1)) / 2, this.r);
    }

    toAxial(): AxialCoord {
        return Coord.a(this.q, this.r);
    }

    neighbour(direction: HexDirection): Coord {
        switch (direction) {
            case HexDirection.Left:
                return Coord.c(this.q - 1, this.r, this.s + 1);
            case HexDirection.Right:
                return Coord.c(this.q + 1, this.r, this.s - 1);
            case HexDirection.UpLeft:
                return Coord.c(this.q, this.r - 1, this.s + 1);
            case HexDirection.UpRight:
                return Coord.c(this.q + 1, this.r - 1, this.s);
            case HexDirection.DownLeft:
                return Coord.c(this.q - 1, this.r + 1, this.s);
            case HexDirection.DownRight:
                return Coord.c(this.q, this.r + 1, this.s - 1);
        }
    }

    toString(): string {
        return Coord.toString(this);
    }
}

export class OffsetCoord implements Coord {
    constructor(public readonly x: number, public readonly y: number) { }

    toCube(): CubeCoord {
        const q = this.x - (this.y - (this.y & 1)) / 2;
        const r = this.y;
        return Coord.c(q, r, -q - r);
    }

    toOffset(): OffsetCoord {
        return this;
    }

    toAxial(): AxialCoord {
        return Coord.a(this.x - (this.y - (this.y & 1)) / 2, this.y);
    }

    neighbour(direction: HexDirection): Coord {
        switch (direction) {
            case HexDirection.Left:
                return Coord.o(this.x - 1, this.y);
            case HexDirection.Right:
                return Coord.o(this.x + 1, this.y);
            case HexDirection.UpLeft:
                return this.y % 2 === 1 ? Coord.o(this.x, this.y - 1) : Coord.o(this.x - 1, this.y - 1);
            case HexDirection.UpRight:
                return this.y % 2 === 1 ? Coord.o(this.x + 1, this.y - 1) : Coord.o(this.x, this.y - 1);
            case HexDirection.DownLeft:
                return this.y % 2 === 1 ? Coord.o(this.x, this.y + 1) : Coord.o(this.x - 1, this.y + 1);
            case HexDirection.DownRight:
                return this.y % 2 === 1 ? Coord.o(this.x + 1, this.y + 1) : Coord.o(this.x, this.y + 1);
        }
    }

    toString(): string {
        return Coord.toString(this);
    }

}