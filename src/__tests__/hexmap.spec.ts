import { HexMap, Coord, HexUtils, HexDirection } from '../hexmap';

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
        const start = map.getOrCreateHexCell(Coord.parse("a0:0"));
        const end = map.getOrCreateHexCell(Coord.parse("a1:3"));
        const path = HexUtils.path(start, end, 20);
        expect(path?.length).toBe(5);
        expect(path?.[0].coord.toCube()).toEqual(Coord.parse("c0:-0:0"));
        expect(path?.[1].coord.toCube()).toEqual(Coord.parse("c1:-1:0"));
        expect(path?.[2].coord.toCube()).toEqual(Coord.parse("c1:-2:1"));
        expect(path?.[3].coord.toCube()).toEqual(Coord.parse("c1:-3:2"));
        expect(path?.[4].coord.toCube()).toEqual(Coord.parse("c1:-4:3"));
        expect(path?.[4].coord.toAxial()).toEqual(Coord.parse("a1:3"));
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