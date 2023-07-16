import { describe, it , expect } from "vitest";
import { UiUtils } from "../utils";
import { printMap } from "./testUtils";
import { Coord } from "../coords";

describe("UiUtils.generateBumbmap()", () => {
    it("1*1 should generate a random number", () => {
        const map = UiUtils.generateBumbmap(1,1, 0);
        map.cells().forEach((cell) => cell.data = Math.floor(cell.data!*10));
        expect(map.height).toBe(1);
        expect(map.width).toBe(1);
        expect(map.getData(Coord.o(0,0))).toBeGreaterThanOrEqual(0);
        expect(map.getData(Coord.o(0,0))).toBeLessThanOrEqual(9);
    });
    it("3*3 with no detail should be flat", () => {
        const map = UiUtils.generateBumbmap(3,3, 0);
        map.cells().forEach((cell) => cell.data = Math.floor(cell.data!*10));
        expect(map.height).toBe(3);
        expect(map.width).toBe(3);
        const originCell = map.getData(Coord.o(0,0));
        expect(map.getData(Coord.o(0,0))).toBe(originCell);
        expect(map.getData(Coord.o(0,1))).toBe(originCell);
        expect(map.getData(Coord.o(0,2))).toBe(originCell);
        expect(map.getData(Coord.o(1,0))).toBe(originCell);
        expect(map.getData(Coord.o(1,1))).toBe(originCell);
        expect(map.getData(Coord.o(1,2))).toBe(originCell);
        expect(map.getData(Coord.o(2,0))).toBe(originCell);
        expect(map.getData(Coord.o(2,1))).toBe(originCell);
        expect(map.getData(Coord.o(2,2))).toBe(originCell);

    });
});