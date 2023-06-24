export enum HexDirection {
    Left,
    Right,
    UpLeft,
    UpRight,
    DownLeft,
    DownRight,
}
export const HexUtils = {
    opposite(direction: HexDirection): HexDirection {
        switch (direction) {
            case HexDirection.Left:
                return HexDirection.Right;
            case HexDirection.Right:
                return HexDirection.Left;
            case HexDirection.UpLeft:
                return HexDirection.DownRight;
            case HexDirection.UpRight:
                return HexDirection.DownLeft;
            case HexDirection.DownLeft:
                return HexDirection.UpRight;
            case HexDirection.DownRight:
                return HexDirection.UpLeft;
        } 
    },
    distance(start: ICoord, end: ICoord): number {
        const cubeA = start.toCube();
        const cubeB = end.toCube();
        return (Math.abs(cubeA.x - cubeB.x) + Math.abs(cubeA.y - cubeB.y) + Math.abs(cubeA.z - cubeB.z)) / 2;
    },
    closest<T>(hexmap: HexMap<T>, start: Coord, match: (data: T | null) => boolean, maxLen = 100): HexCell<T> | null {
        const startCell = hexmap.getOrCreateHexCell(start);

        const visited: { [key: string]: boolean } = {};
        const queue: { cell: HexCell<T>, distance: number }[] = [{ cell: startCell, distance: 0 }];
        while (queue.length > 0) {
            const current = queue.shift();
            if (current) {
                if (match(current.cell.data)) {
                    return current.cell;
                }
                if (current.distance < maxLen) {
                    for (let i = 0; i < 6; i++) {
                        const neighbor = current.cell.neighbourCell(i);
                        if (neighbor && !visited[neighbor.coord.toString()]) {
                            visited[neighbor.coord.toString()] = true;
                            queue.push({ cell: neighbor, distance: current.distance + 1 });
                        }
                    }
                }
            }
        }
        return null;
    },
    path<T>(hexmap: HexMap<T>, start: Coord, end: Coord, maxLen = 100): HexCell<T>[] | null {
        const startCell = hexmap.getOrCreateHexCell(start);
        const endCell = hexmap.getOrCreateHexCell(end);

        const visited: { [key: string]: boolean } = {};
        const queue: { cell: HexCell<T>, distance: number, path: HexCell<T>[] }[] = [{ cell: startCell, distance: 0, path: [] }];
        while (queue.length > 0) {
            const current = queue.shift();
            if (current) {
                if (current.cell === endCell) {
                    current.path.push(endCell);
                    return current.path;
                }
                if (current.distance < maxLen) {
                    for (let i = 0; i < 6; i++) {
                        const neighbor = current.cell.neighbourCell(i);
                        if (neighbor && !visited[neighbor.coord.toString()]) {
                            visited[neighbor.coord.toString()] = true;
                            queue.push({ cell: neighbor, distance: current.distance + 1, path: [...current.path, current.cell] });
                        }
                    }
                }
            }
        }
        return null;
    }
}

export const UiUtils = {
    getRect(coord: ICoord, cellSize: number): { x: number, y: number, width: number, height: number } {
        const cube = coord.toCube();
        const x = (cube.x + cube.z / 2) * cellSize;
        const y = cube.z * cellSize * 0.75;
        return { x, y, width: cellSize, height: cellSize };
    },
    pointToCoord(x: number, y: number, cellSize: number): Coord {
        const q = (x * Math.sqrt(3) / 3 - y / 3) / cellSize;
        const r = y * 2 / 3 / cellSize;
        return Coord.a(q, r);
    }
}


export class HexCell<T> implements ICoord {
    #data: T | null;
    #neighbors: HexCell<T>[];

    constructor(public readonly coord: Coord, neighbors: HexCell<T>[], data: T | null) {
        this.#neighbors = neighbors;
        this.#data = data;
     }

    get data(): T | null {
        return this.#data;
    }

    set data(value: T | null) {
        this.#data = value;
    }

    neighbourCell(direction: HexDirection): HexCell<T> {
        return this.#neighbors[direction];
    }

    linkNeighbor(direction: HexDirection, cell: HexCell<T>): void {
        this.#neighbors[direction] = cell;
        cell.#neighbors[HexUtils.opposite(direction)] = this;
    }

    toCube(): CubeCoord {
        return this.coord.toCube();
    }

    toOffset(): OffsetCoord {
        return this.coord.toOffset();
    }
    
    toAxial(): AxialCoord {
        return this.coord.toAxial();
    }

    neighbour(direction: HexDirection): Coord {
        return this.coord.neighbour(direction);
    }
    
}

export class HexMap<T> {
    #acells: { [key: string]: HexCell<T> } = {};
    #ocells: { [key: string]: HexCell<T> } = {};
    #ccells: { [key: string]: HexCell<T> } = {};

    constructor(height: number, width: number) {
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const c = Coord.o(x, y);
                this.makeCell(c, null);
            }
        }
    }

    static import<T>(data: { [key: string]: T }): HexMap<T> {
        // get max height and width of the dataset
        let height = 0;
        let width = 0;
        for (const key in data) {
            const c = Coord.parse(key);
            height = Math.max(height, c.toOffset().y);
            width = Math.max(width, c.toOffset().x);
        }
        const map = new HexMap<T>(height+1, width+1);
        for (const key in data) {
            const c = Coord.parse(key);
            map.setData(c, data[key]);
        }
        return map;
    }

    export(): { [key: string]: T } {
        const result: { [key: string]: T } = {};
        for (const key in this.#acells) {
            const cell = this.#acells[key];
            if (cell.data) {
                result[key] = cell.data;
            }
        }
        return result;
    }

    cells(): HexCell<T>[] {
        return Object.values(this.#ocells);
    }

    getOrCreateHexCell(c: Coord): HexCell<T> {
        let exists = this.get(c);
        if (!exists) {
            exists = this.makeCell(c, null);
        }
        return exists;
    }

    private get(c: Coord): HexCell<T> | null {
        const key = c.toString();
        return c instanceof AxialCoord ? this.#acells[key] : c instanceof OffsetCoord ? this.#ocells[key] : this.#ccells[key];
    }

    private makeCell(c: Coord, data: T | null): HexCell<T> {
        const cell = new HexCell(c, [], data);
        this.#acells[c.toAxial().toString()] = cell;
        this.#ocells[c.toOffset().toString()] = cell;
        this.#ccells[c.toCube().toString()] = cell;
        for(let i = 0; i < 6; i++) {
            const neighbor = c.neighbour(i);
            const neighborCell = this.get(neighbor);
            if(neighborCell) {
                cell.linkNeighbor(i, neighborCell);
            }
        }
        return cell;

    }

    getData(c: Coord): T | null {
        if(c instanceof AxialCoord) {
            return this.#acells[c.toString()]?.data;
        } else if(c instanceof OffsetCoord) {
            return this.#ocells[c.toString()]?.data;
        } else if(c instanceof CubeCoord) {
            return this.#ccells[c.toString()]?.data;
        }
        throw new Error(`Invalid coord type: ${c.toString()}`);
    }

    setData(c: Coord, data: T | null): void {
        if(c instanceof AxialCoord) {
            this.#acells[c.toString()].data = data;
        } else if(c instanceof OffsetCoord) {
            this.#ocells[c.toString()].data = data;
        } else if(c instanceof CubeCoord) {
            this.#ccells[c.toString()].data = data;
        } else {
            throw new Error(`Invalid coord type: ${c.toString()}`);
        }
    }

    stream(start: Coord, direction: HexDirection): IterableIterator<HexCell<T>> {
        const self = this;
        return function* () {
            let current = self.get(start);
            while (current) {
                yield current;
                current = current.neighbourCell(direction);
            }
        }.call(this);
    }
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
            return `c${c.x}:${c.y}:${c.z}`;
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
        return Coord.c(this.q, -this.q - this.r, this.r);
    }

    toOffset(): OffsetCoord {
        return Coord.o(this.q, this.r);
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
    constructor(public readonly x: number, public readonly y: number, public readonly z: number) { }


    toCube(): CubeCoord {
        return this;
    }

    toOffset(): OffsetCoord {
        return Coord.o(this.x, this.z);
    }

    toAxial(): AxialCoord {
        return Coord.a(this.x, this.z);
    }

    neighbour(direction: HexDirection): Coord {
        switch (direction) {
            case HexDirection.Left:
                return Coord.c(this.x - 1, this.y + 1, this.z);
            case HexDirection.Right:
                return Coord.c(this.x + 1, this.y - 1, this.z);
            case HexDirection.UpLeft:
                return Coord.c(this.x, this.y + 1, this.z - 1);
            case HexDirection.UpRight:
                return Coord.c(this.x + 1, this.y, this.z - 1);
            case HexDirection.DownLeft:
                return Coord.c(this.x - 1, this.y, this.z + 1);
            case HexDirection.DownRight:
                return Coord.c(this.x, this.y - 1, this.z + 1);
        }
    }

    toString(): string {
        return Coord.toString(this);
    }
}

export class OffsetCoord implements Coord {
    constructor(public readonly x: number, public readonly y: number) { }

    toCube(): CubeCoord {
        return Coord.c(this.x, -this.x - this.y, this.y);
    }

    toOffset(): OffsetCoord {
        return this;
    }

    toAxial(): AxialCoord {
        return Coord.a(this.x, this.y);
    }

    neighbour(direction: HexDirection): Coord {
        switch (direction) {
            case HexDirection.Left:
                return Coord.o(this.x - 1, this.y);
            case HexDirection.Right:
                return Coord.o(this.x + 1, this.y);
            case HexDirection.UpLeft:
                return Coord.o(this.x, this.y - 1);
            case HexDirection.UpRight:
                return Coord.o(this.x + 1, this.y - 1);
            case HexDirection.DownLeft:
                return Coord.o(this.x - 1, this.y + 1);
            case HexDirection.DownRight:
                return Coord.o(this.x, this.y + 1);
        }
    }

    toString(): string {
        return Coord.toString(this);
    }

}