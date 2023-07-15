import { HexMap, Coord, HexUtils, HexDirection, UiUtils } from '../hexmap';
import { describe, expect, it } from 'vitest';

describe('Hexmap', () => {
    it('should create an instance', () => {
        const map = HexMap.import({
            "o0:0": "origin",
            "o9:9": "end",
            "o5:5": "middle"
        });
        expect(map).toBeTruthy();
        expect(map.getData(Coord.parse("o0:0"))).toBe("origin");
        expect(map.getData(Coord.parse("o9:9"))).toBe("end");
        expect(map.getData(Coord.parse("o5:5"))).toBe("middle");
    });

    it('sould export to json', () => {
        const map = HexMap.import({
            "a0:0": "origin",
            "a9:9": "end",
            "a5:5": "middle"
        });
        expect(map.export()).toEqual({
            "a0:0": "origin",
            "a9:9": "end",
            "a5:5": "middle"
        });
    });

    it('gets the same data from different coordinates', () => {
        const map = HexMap.import({
            "a0:0": "origin",
            "a9:9": "end",
            "a5:5": "middle"
        });
        expect(map.getData(Coord.parse("a0:0"))).toBe("origin");
        expect(map.getData(Coord.parse("a9:9"))).toBe("end");
        expect(map.getData(Coord.parse("a5:5"))).toBe("middle");
        expect(map.getData(Coord.parse("c0:0:0"))).toBe("origin");
        expect(map.getData(Coord.parse("c9:-18:9"))).toBe("end");
        expect(map.getData(Coord.parse("c5:-10:5"))).toBe("middle");
        expect(map.getData(Coord.parse("o0:0"))).toBe("origin");
        expect(map.getData(Coord.parse("o9:9"))).toBe("end");
        expect(map.getData(Coord.parse("o5:5"))).toBe("middle");
    });
});

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
        expect(path?.[0].coord.toCube()).toEqual(Coord.parse("c0:-0:0"));
        expect(path?.[1].coord.toCube()).toEqual(Coord.parse("c1:-1:0"));
        expect(path?.[2].coord.toCube()).toEqual(Coord.parse("c1:-2:1"));
        expect(path?.[3].coord.toCube()).toEqual(Coord.parse("c1:-3:2"));
        expect(path?.[4].coord.toCube()).toEqual(Coord.parse("c1:-4:3"));
        expect(path?.[4].coord.toAxial()).toEqual(Coord.parse("a1:3"));
    });

    it("should get the correct direction between two coordinates", () => {
        /* perfect directions */
        expect(HexUtils.aproximateDirection(Coord.parse("o5:5"), Coord.parse("o5:5"))).toBe(null);
        expect(HexUtils.aproximateDirection(Coord.parse("o5:5"), Coord.parse("o0:5"))).toBe(HexDirection.Left);
        expect(HexUtils.aproximateDirection(Coord.parse("o5:5"), Coord.parse("o10:5"))).toBe(HexDirection.Right);
        expect(HexUtils.aproximateDirection(Coord.parse("o5:5"), Coord.parse("o0:0"))).toBe(HexDirection.UpLeft);
        expect(HexUtils.aproximateDirection(Coord.parse("o5:5"), Coord.parse("o10:0"))).toBe(HexDirection.UpRight);
        expect(HexUtils.aproximateDirection(Coord.parse("o5:5"), Coord.parse("o0:10"))).toBe(HexDirection.DownLeft);
        expect(HexUtils.aproximateDirection(Coord.parse("o5:5"), Coord.parse("o10:10"))).toBe(HexDirection.DownRight);

        /* imperfect directions */
        expect(HexUtils.aproximateDirection(Coord.parse("o5:5"), Coord.parse("o10:7"))).toBe(HexDirection.Right);
        expect(HexUtils.aproximateDirection(Coord.parse("o5:5"), Coord.parse("o10:3"))).toBe(HexDirection.Right);
        expect(HexUtils.aproximateDirection(Coord.parse("o5:5"), Coord.parse("o0:7"))).toBe(HexDirection.Left);
        expect(HexUtils.aproximateDirection(Coord.parse("o5:5"), Coord.parse("o0:3"))).toBe(HexDirection.Left);
        expect(HexUtils.aproximateDirection(Coord.parse("o5:5"), Coord.parse("o10:8"))).toBe(HexDirection.DownRight);
        expect(HexUtils.aproximateDirection(Coord.parse("o5:5"), Coord.parse("o8:10"))).toBe(HexDirection.DownRight);
        expect(HexUtils.aproximateDirection(Coord.parse("o5:5"), Coord.parse("o2:0"))).toBe(HexDirection.UpLeft);
        expect(HexUtils.aproximateDirection(Coord.parse("o5:5"), Coord.parse("o0:2"))).toBe(HexDirection.UpLeft);
        expect(HexUtils.aproximateDirection(Coord.parse("o5:5"), Coord.parse("o2:10"))).toBe(HexDirection.DownLeft);
        expect(HexUtils.aproximateDirection(Coord.parse("o5:5"), Coord.parse("o0:8"))).toBe(HexDirection.DownLeft);
        expect(HexUtils.aproximateDirection(Coord.parse("o5:5"), Coord.parse("o8:0"))).toBe(HexDirection.UpRight);
        expect(HexUtils.aproximateDirection(Coord.parse("o5:5"), Coord.parse("o10:2"))).toBe(HexDirection.UpRight);
    });
});


describe("Coord", () => {
    it("Converts offset coordinates to cube", () => {
        expect(Coord.parse("o0:0").toCube()).toEqual({ x: 0, y: -0, z: 0 });
        expect(Coord.parse("o1:0").toCube()).toEqual({ x: 1, y: -1, z: 0 });
        expect(Coord.parse("o0:1").toCube()).toEqual({ x: 0, y: -1, z: 1 });
        expect(Coord.parse("o1:1").toCube()).toEqual({ x: 1, y: -2, z: 1 });
    });

    it("Converts cube coordinates to offset", () => {
        expect(Coord.parse("c0:0:0").toOffset()).toEqual({ x: 0, y: 0 });
        expect(Coord.parse("c1:-1:0").toOffset()).toEqual({ x: 1, y: 0 });
        expect(Coord.parse("c0:-1:1").toOffset()).toEqual({ x: 0, y: 1 });
        expect(Coord.parse("c1:-2:1").toOffset()).toEqual({ x: 1, y: 1 });
    });

    it("Converts axial coordinates to cube", () => {
        expect(Coord.parse("a0:0").toCube()).toEqual({ x: 0, y: -0, z: 0 });
        expect(Coord.parse("a1:0").toCube()).toEqual({ x: 1, y: -1, z: 0 });
        expect(Coord.parse("a0:1").toCube()).toEqual({ x: 0, y: -1, z: 1 });
        expect(Coord.parse("a1:1").toCube()).toEqual({ x: 1, y: -2, z: 1 });
    });

    it("Converts cube coordinates to axial", () => {
        expect(Coord.parse("c0:0:0").toAxial()).toEqual({ q: 0, r: 0 });
        expect(Coord.parse("c1:-1:0").toAxial()).toEqual({ q: 1, r: 0 });
        expect(Coord.parse("c0:-1:1").toAxial()).toEqual({ q: 0, r: 1 });
        expect(Coord.parse("c1:-2:1").toAxial()).toEqual({ q: 1, r: 1 });
    });

    it("Converts axial coordinates to offset", () => {
        expect(Coord.parse("a0:0").toOffset()).toEqual({ x: 0, y: 0 });
        expect(Coord.parse("a1:0").toOffset()).toEqual({ x: 1, y: 0 });
        expect(Coord.parse("a0:1").toOffset()).toEqual({ x: 0, y: 1 });
        expect(Coord.parse("a1:1").toOffset()).toEqual({ x: 1, y: 1 });
    });

    it("Converts offset coordinates to axial", () => {
        expect(Coord.parse("o0:0").toAxial()).toEqual({ q: 0, r: 0 });
        expect(Coord.parse("o1:0").toAxial()).toEqual({ q: 1, r: 0 });
        expect(Coord.parse("o0:1").toAxial()).toEqual({ q: 0, r: 1 });
        expect(Coord.parse("o1:1").toAxial()).toEqual({ q: 1, r: 1 });
    });

});

describe("Direction", () => {
    it("should give the oposite direction", () => {
        expect(HexUtils.opposite(HexDirection.Left)).toBe(HexDirection.Right);
        expect(HexUtils.opposite(HexDirection.Right)).toBe(HexDirection.Left);
        expect(HexUtils.opposite(HexDirection.UpLeft)).toBe(HexDirection.DownRight);
        expect(HexUtils.opposite(HexDirection.DownRight)).toBe(HexDirection.UpLeft);
        expect(HexUtils.opposite(HexDirection.UpRight)).toBe(HexDirection.DownLeft);
        expect(HexUtils.opposite(HexDirection.DownLeft)).toBe(HexDirection.UpRight);
    });
});

describe("UiUtils", () => {
    it("should compute the correct rect for a coordinate", () => {
        const rect = UiUtils.getRect(Coord.parse("o5:4"), 100); 
        expect(rect).toEqual({ x: 500, y: 400, width: 100, height: 100 }); 
    });

    it("should shift odd lines by size/2", () => {
        const rect = UiUtils.getRect(Coord.parse("o5:3"), 100); 
        expect(rect.x).toBe(550); 
    });

    it("should return the correct cell coord for even lines", () => {
        const coord = UiUtils.pointToCoord({x: 522, y: 462}, 100);
        expect(coord.toOffset()).toEqual(Coord.parse("o5:4"));
    });

    it("should return the correct cell coord for odd lines", () => {
        const coord = UiUtils.pointToCoord({x: 522, y: 362}, 100);
        expect(coord.toOffset()).toEqual(Coord.parse("o4:3"));
    });

});