
import { describe, expect, it } from "vitest";
import { Coord } from "../coords";
import { UiUtils } from "../utils";

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