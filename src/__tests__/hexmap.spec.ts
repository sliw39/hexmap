import { describe, expect, it } from 'vitest';
import { HexCell, HexMap } from "../models";
import { Coord, HexDirection } from '../coords';
import { HexUtils } from '../utils';

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

describe('HexCell', () => {
    it('should have the correct neighbors', () => {
        const map = new HexMap<number>(5, 5, (cell) => 0);

        const cell = map.getOrCreateHexCell(Coord.parse("o1:1"));
        expect(cell.neighbourCell(HexDirection.Left).toOffset()).toEqual({ x: 0, y: 1 });
        expect(cell.neighbourCell(HexDirection.Right).toOffset()).toEqual({ x: 2, y: 1 });
        expect(cell.neighbourCell(HexDirection.UpLeft).toOffset()).toEqual({ x: 1, y: 0 });
        expect(cell.neighbourCell(HexDirection.UpRight).toOffset()).toEqual({ x: 2, y: 0 });
        expect(cell.neighbourCell(HexDirection.DownLeft).toOffset()).toEqual({ x: 1, y: 2 });
        expect(cell.neighbourCell(HexDirection.DownRight).toOffset()).toEqual({ x: 2, y: 2 });
    });
});

