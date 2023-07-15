import { describe, it, expect } from "vitest";
import { Coord, HexDirection } from "../coords";
import { HexUtils } from "../utils";

describe("Coord", () => {
    it("Converts offset coordinates to cube", () => {
        expect(Coord.parse("o0:0").toCube()).toEqual({ q: 0, r: 0, s: -0 });
        expect(Coord.parse("o1:0").toCube()).toEqual({ q: 1, r: 0, s: -1 });
        expect(Coord.parse("o0:1").toCube()).toEqual({ q: 0, r: 1, s: -1 });
        expect(Coord.parse("o1:1").toCube()).toEqual({ q: 1, r: 1, s: -2 });
    });

    it("Converts cube coordinates to offset", () => {
        expect(Coord.parse("c0:0:0").toOffset()).toEqual({ x: 0, y: 0 });
        expect(Coord.parse("c1:-1:0").toOffset()).toEqual({ x: 0, y: -1 });
        expect(Coord.parse("c0:-1:1").toOffset()).toEqual({ x: -1, y: -1 });
        expect(Coord.parse("c1:-2:1").toOffset()).toEqual({ x: 0, y: -2 });
    });

    it("Converts axial coordinates to cube", () => {
        expect(Coord.parse("a0:0").toCube()).toEqual({ q: 0, r: 0, s: -0 });
        expect(Coord.parse("a1:0").toCube()).toEqual({ q: 1, r: 0, s: -1 });
        expect(Coord.parse("a0:1").toCube()).toEqual({ q: 0, r: 1, s: -1 });
        expect(Coord.parse("a1:1").toCube()).toEqual({ q: 1, r: 1, s: -2 });
    });

    it("Converts cube coordinates to axial", () => {
        expect(Coord.parse("c0:0:0").toAxial()).toEqual({ q: 0, r: 0 });
        expect(Coord.parse("c1:-1:0").toAxial()).toEqual({ q: 1, r: -1 });
        expect(Coord.parse("c0:-1:1").toAxial()).toEqual({ q: 0, r: -1 });
        expect(Coord.parse("c1:-2:1").toAxial()).toEqual({ q: 1, r: -2 });
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

describe("OffsetCoords", () => {
    it("should get the correct neighbour (odd)", () => {
        expect(Coord.parse("o1:1").neighbour(HexDirection.Left).toOffset()).toEqual({ x: 0, y: 1 });
        expect(Coord.parse("o1:1").neighbour(HexDirection.Right).toOffset()).toEqual({ x: 2, y: 1 });
        expect(Coord.parse("o1:1").neighbour(HexDirection.UpLeft).toOffset()).toEqual({ x: 1, y: 0 });
        expect(Coord.parse("o1:1").neighbour(HexDirection.UpRight).toOffset()).toEqual({ x: 2, y: 0 });
        expect(Coord.parse("o1:1").neighbour(HexDirection.DownLeft).toOffset()).toEqual({ x: 1, y: 2 });
        expect(Coord.parse("o1:1").neighbour(HexDirection.DownRight).toOffset()).toEqual({ x: 2, y: 2 });
    });

    it("should get the correct neighbour (even)", () => {
        expect(Coord.parse("o2:2").neighbour(HexDirection.Left).toOffset()).toEqual({ x: 1, y: 2 });
        expect(Coord.parse("o2:2").neighbour(HexDirection.Right).toOffset()).toEqual({ x: 3, y: 2 });
        expect(Coord.parse("o2:2").neighbour(HexDirection.UpLeft).toOffset()).toEqual({ x: 1, y: 1 });
        expect(Coord.parse("o2:2").neighbour(HexDirection.UpRight).toOffset()).toEqual({ x: 2, y: 1 });
        expect(Coord.parse("o2:2").neighbour(HexDirection.DownLeft).toOffset()).toEqual({ x: 1, y: 3 });
        expect(Coord.parse("o2:2").neighbour(HexDirection.DownRight).toOffset()).toEqual({ x: 2, y: 3 });
    });
});

describe("CubeCoords", () => {
    it("should get the correct neighbour", () => {
        expect(Coord.parse("c0:0:0").neighbour(HexDirection.Left).toCube()).toEqual({ q: -1, r: 0, s: 1 });
        expect(Coord.parse("c0:0:0").neighbour(HexDirection.Right).toCube()).toEqual({ q: 1, r: 0, s: -1 });
        expect(Coord.parse("c0:0:0").neighbour(HexDirection.UpLeft).toCube()).toEqual({ q: 0, r: -1, s: 1 });
        expect(Coord.parse("c0:0:0").neighbour(HexDirection.UpRight).toCube()).toEqual({ q: 1, r: -1, s: 0 });
        expect(Coord.parse("c0:0:0").neighbour(HexDirection.DownLeft).toCube()).toEqual({ q: -1, r: 1, s: 0 });
        expect(Coord.parse("c0:0:0").neighbour(HexDirection.DownRight).toCube()).toEqual({ q: 0, r: 1, s: -1 });
    });
});

describe("AxialCoords", () => {
    it("should get the correct neighbour", () => {
        expect(Coord.parse("a0:0").neighbour(HexDirection.Left).toAxial()).toEqual({ q: -1, r: 0 });
        expect(Coord.parse("a0:0").neighbour(HexDirection.Right).toAxial()).toEqual({ q: 1, r: 0 });
        expect(Coord.parse("a0:0").neighbour(HexDirection.UpLeft).toAxial()).toEqual({ q: 0, r: -1 });
        expect(Coord.parse("a0:0").neighbour(HexDirection.UpRight).toAxial()).toEqual({ q: 1, r: -1 });
        expect(Coord.parse("a0:0").neighbour(HexDirection.DownLeft).toAxial()).toEqual({ q: -1, r: 1 });
        expect(Coord.parse("a0:0").neighbour(HexDirection.DownRight).toAxial()).toEqual({ q: 0, r: 1 });
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
