import { AxialCoord, Coord, CubeCoord, HexDirection, ICoord, OffsetCoord } from "./coords";

export function oppositeDirection(direction: HexDirection): HexDirection {
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
}

export class HexCell<T> implements ICoord {
    #data: T | null;
    #neighbors: HexCell<T>[];

    constructor(public parent: HexMap<T>, public readonly coord: Coord, neighbors: HexCell<T>[], data: T | null) {
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
        cell.#neighbors[oppositeDirection(direction)] = this;
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

    constructor(public readonly height: number, public readonly width: number, dataFactory: (c: Coord) => T | null = () => null) {
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const c = Coord.o(x, y);
                this.makeCell(c, dataFactory(c));
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
        const cell = new HexCell(this, c, [], data);
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

