
import { describe, it, expect } from "vitest";
import { Coord, HexDirection } from "../coords";
import { HexUtils } from "../utils";
import { HexMap } from "../models";
import { matrixToHexmap, printPath } from "./testUtils";


describe("HexUtils", () => {
    it("sould get the distance between two coordinates", () => {
        expect(HexUtils.distance(Coord.parse("a0:0"), Coord.parse("a0:0"))).toBe(0);
        expect(HexUtils.distance(Coord.parse("a0:0"), Coord.parse("a1:0"))).toBe(1);
        expect(HexUtils.distance(Coord.parse("a0:0"), Coord.parse("a0:1"))).toBe(1);
        expect(HexUtils.distance(Coord.parse("a0:0"), Coord.parse("a1:1"))).toBe(2);
    });

    it("sould get a path between two coordinates", () => {
        const map = HexMap.import({
            "a0:0": "origin",
            "a9:9": "end",
            "a5:5": "middle"
        });
        const start = Coord.parse("a0:0");
        const end = Coord.parse("a1:3");
        const path = HexUtils.path(map, start, end, 20);
        expect(path?.length).toBe(5);
        expect(path?.[0].coord.toCube()).toEqual(Coord.parse("c0:0:-0"));
        expect(path?.[1].coord.toCube()).toEqual(Coord.parse("c1:0:-1"));
        expect(path?.[2].coord.toCube()).toEqual(Coord.parse("c1:1:-2"));
        expect(path?.[3].coord.toCube()).toEqual(Coord.parse("c1:2:-3"));
        expect(path?.[4].coord.toCube()).toEqual(Coord.parse("c1:3:-4"));
        expect(path?.[4].coord.toAxial()).toEqual(Coord.parse("a1:3"));
    });

    it("should get the correct direction between two coordinates", () => {
        /* perfect directions */
        expect(HexUtils.aproximateDirection(Coord.parse("o1:1"), Coord.parse("o1:1"))).toBe(null);
        expect(HexUtils.aproximateDirection(Coord.parse("c0:0:0"), Coord.parse("c-1:0:1"))).toBe(HexDirection.Left);
        expect(HexUtils.aproximateDirection(Coord.parse("c0:0:0"), Coord.parse("c1:0:-1"))).toBe(HexDirection.Right);
        expect(HexUtils.aproximateDirection(Coord.parse("c0:0:0"), Coord.parse("c0:-1:1"))).toBe(HexDirection.UpLeft);
        expect(HexUtils.aproximateDirection(Coord.parse("c0:0:0"), Coord.parse("c0:1:-1"))).toBe(HexDirection.DownRight);
        expect(HexUtils.aproximateDirection(Coord.parse("c0:0:0"), Coord.parse("c1:-1:0"))).toBe(HexDirection.UpRight);
        expect(HexUtils.aproximateDirection(Coord.parse("c0:0:0"), Coord.parse("c-1:1:0"))).toBe(HexDirection.DownLeft);

        /* imperfect directions */
        expect(HexUtils.aproximateDirection(Coord.parse("c0:0:0"), Coord.parse("c-2:-1:3"))).toBe(HexDirection.Left);
        expect(HexUtils.aproximateDirection(Coord.parse("c0:0:0"), Coord.parse("c-3:1:2"))).toBe(HexDirection.Left);
        expect(HexUtils.aproximateDirection(Coord.parse("c0:0:0"), Coord.parse("c2:1:-3"))).toBe(HexDirection.Right);
        expect(HexUtils.aproximateDirection(Coord.parse("c0:0:0"), Coord.parse("c3:-1:-2"))).toBe(HexDirection.Right);
        expect(HexUtils.aproximateDirection(Coord.parse("c0:0:0"), Coord.parse("c-1:-2:3"))).toBe(HexDirection.UpLeft);
        expect(HexUtils.aproximateDirection(Coord.parse("c0:0:0"), Coord.parse("c1:-3:2"))).toBe(HexDirection.UpLeft);
        expect(HexUtils.aproximateDirection(Coord.parse("c0:0:0"), Coord.parse("c-1:2:-3"))).toBe(HexDirection.DownRight);
        expect(HexUtils.aproximateDirection(Coord.parse("c0:0:0"), Coord.parse("c1:3:-2"))).toBe(HexDirection.DownRight);
    });
});



describe("HexUtils.weightedPath()", () => {
    it("should find the shortest path", () => {
        const matrix = [
            [1,1,1,1,1,1],
             [1,1,5,1,1,1],
            [1,1,1,5,1,1],
             [1,1,1,5,1,1],
            [1,1,1,2,1,1],
        ];

        const map = matrixToHexmap(matrix);
        const start = Coord.parse("o0:0");
        const end = Coord.parse("o5:4");
        const path = HexUtils.dijstraPath(map, start, end, { maxDepth: 20, weightFn: (cell) => cell.data!});
        const result = printPath(matrix, path!);

        const expected = 
            "S,X,X,X,1,1\n" +
            ",1,1,5,X,1,1\n" +
            "1,1,1,5,X,1\n" +
            ",1,1,1,5,X,1\n" +
            "1,1,1,2,1,E";

        const message = "expected : \n" + expected + "\n\n" + "result : \n" + result;
        
        expect(result, message).toBe(expected);
        
        
    });
});