import { Coord, HexDirection, ICoord } from "./coords";
import { HexCell, HexMap, oppositeDirection } from "./models";

export const HexUtils = {
    opposite: oppositeDirection,
    distance(start: ICoord, end: ICoord): number {
        const cubeA = start.toCube();
        const cubeB = end.toCube();
        return (Math.abs(cubeA.q - cubeB.q) + Math.abs(cubeA.r - cubeB.r) + Math.abs(cubeA.s - cubeB.s)) / 2;
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
    aproximateDirection(start: ICoord, end: ICoord): HexDirection | null {
        // if the coordinates are the same, there is no direction
        if (start.toCube().toString() === end.toCube().toString()) {
            return null;
        }
        
        // first we translate the end as if the start was at 0,0
        const cubeA = start.toCube();
        const cubeB = end.toCube();
        const offsetEnd = Coord.c(cubeB.q - cubeA.q, cubeB.r - cubeA.r, cubeB.s - cubeA.s).toOffset();
        // we convert the end point to polar coordinates
        const theta = Math.atan2(offsetEnd.y, offsetEnd.x);
        // we convert the angle to a direction
        const direction = (Math.round(theta / 1.05) + 6) % 6;
        // we convert the direction to a hex direction
        switch (direction) {
            case 0:
                return HexDirection.Right;
            case 1:
                return HexDirection.DownRight;
            case 2:
                return HexDirection.DownLeft;
            case 3:
                return HexDirection.Left;
            case 4:
                return HexDirection.UpLeft;
            case 5:
                return HexDirection.UpRight;
            default:
                throw new Error(`Invalid direction: ${direction}`);
        }
    },
    neighbors<T>(coord: HexCell<T>): HexCell<T>[] {
        const neighbors: HexCell<T>[] = [];
        for (let i = 0; i < 6; i++) {
            const cell = coord.neighbourCell(i);
            if(cell) {
                neighbors.push(coord.neighbourCell(i));
            }
        }
        return neighbors;
    },
    
    fastPath<T>(start: HexCell<T>, end: HexCell<T>, maxLen = 100): HexCell<T>[] | null {
        const path: HexCell<T>[] = [start];
        let current = start;
        while (current !== end && maxLen-- > 0) {
            const direction = HexUtils.aproximateDirection(current, end);
            if (direction !== null) {
                const next = current.neighbourCell(direction);
                if (next) {
                    path.push(next);
                    current = next;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }
        return path;
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
    },
    dijstraPath<T>(map: HexMap<T>, start: Coord, end: Coord, opts: { weightFn?: (cell: HexCell<T>) => number, maxDepth?: number} = {}): HexCell<T>[] | null {
        const OPTS = { weightFn: () => 1, maxDepth: 10000, ...opts };

        // dijstra's algorithm

        // 1. Create a graph with: nodes are the hexcells, edges are the neighbours and weights are the weightFn of the neighbour
        type Node = { cell: HexCell<T>, distance: number, previous: Node | null, edges: Edge[] };
        type Edge = { source: Node, target: Node, weight: number };
        const nodes: Node[] = map.cells().map((cell) => ({ 
            cell, 
            distance: Infinity, 
            previous: null,
            edges: []
        }));
        nodes.forEach((node) => {
            node.edges = HexUtils.neighbors(node.cell).map((neighbor) => ({
                source: node,
                target: nodes.find((n) => n.cell === neighbor)!,
                weight: OPTS.weightFn!(neighbor)
            }));
        });

        // 2. Set the distance of the start node to 0
        const startNode = nodes.find((node) => node.cell.coord.toOffset().toString() === start.toOffset().toString());
        if(!startNode) throw new Error(`Start node not found: ${start}`);
        startNode.distance = 0;

        // 3. walk the graph to find the shortest path
        let Q = [...nodes];
        while(Q.length > 0) {
            // 3.1 find the node with the shortest distance
            const currentNode = Q.reduce((acc, node) => node.distance < acc.distance ? node : acc, Q[0]);
            Q.splice(Q.indexOf(currentNode), 1);
            // 3.2 update the distance of the neighbours
            currentNode.edges.forEach((edge) => {
                const distance = currentNode.distance + edge.weight;
                if(distance < edge.target.distance) {
                    edge.target.distance = distance;
                    edge.target.previous = currentNode;
                }
            });
        }

        // 4. build the path
        const path: HexCell<T>[] = [];
        let current = nodes.find((node) => node.cell.coord.toOffset().toString() === end.toOffset().toString()) || null;
        while(current && current !== startNode && OPTS.maxDepth-- > 0) {
            path.unshift(current.cell);
            current = current.previous;
        }
        path.unshift(startNode.cell);
        return path;
    }
}

export const UiUtils = {
    getRect(coord: ICoord, cellSize: number): { x: number, y: number, width: number, height: number } {
        const offset = coord.toOffset();
        const x = offset.x * cellSize + (offset.y % 2 === 0 ? 0 : cellSize / 2);
        const y = offset.y * cellSize;
        return { x, y, width: cellSize, height: cellSize };
    },
    pointToCoord(point: {x: number, y: number}, cellSize: number): Coord {
        const x = Math.floor(point.x / cellSize) - (Math.floor(point.y / cellSize) % 2 === 0 ? 0 : 1);
        const y = Math.floor(point.y / cellSize);
        return Coord.o(x, y);
    }
}

