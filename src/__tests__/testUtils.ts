import { Coord } from "../coords";
import { HexCell, HexMap } from "../models";

export function matrixToHexmap(matrix: number[][]): HexMap<number> {
    return new HexMap<number>(
        matrix.length, 
        matrix[0].length, 
        (cell) => matrix[cell.toOffset().y][cell.toOffset().x]
    );
}
export function printPath<T>(matrix : number[][], path: HexCell<T>[]) {
    const pathMatrix = matrix.map((row) => row.map((cell) => cell + ""));
    path.forEach((cell, index) => {
        const coord = cell.coord.toOffset();
        pathMatrix[coord.y][coord.x] = index === 0 ? "S" : ( index === path.length-1 ? "E": "X");
    });
    pathMatrix.forEach((row, index) => {
        if (index % 2 === 1) {
            row.unshift("");
        }
    });
    return pathMatrix.map((row) => row.join(",")).join("\n");
}
export function printMap<T>(map: HexMap<T>) {
    const h = map.height;
    const w = map.width;
    let result = "";
    for(let i = 0; i < h; i++) {
        let row = i%2 === 0 ? "" : " ";
        for(let j = 0; j < w; j++) {
            row += map.getData(Coord.o(j, i)) + " ";
        }
        result += row + "\n";
    }
    return result;
}