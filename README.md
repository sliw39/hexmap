# Hexmap 

A base structure to manipulate 2D honeycomb map in javascript/typescript

# Map Usage

```js
import { HexMap, Coord, HexUtils, HexDirection } from 'hexmap';

class MyStruct {
    /* custom cell content */
}

// instanciate a 100*100 map
const hexmap = new HexMap<MyStruct>(100, 100);

// set data at coordinates line 3, column 5
hexmap.setData(Coord.parse("o5:3"), new MyStruct());

// retreive data as stream, starting from line 3, column 5, in direction downleft
const hexmap = new HexMap<String>(100, 100);
const steam = hexmap.stream(Coord.parse("o5:3"), HexDirection.DownLeft);
for (const cell of steam) {
    console.log(cell.coord.toString());
}

// hexmap allows 3 coordinate systems: offset(x,y), axial(q,r) and cube(x,y,z)
// you can convert from one to another 
const offsetCoord = Coord.parse("o5:5"); // offsetCoord = { x: 5, y: 5 }
const axialCoord = offsetCoord.toAxial(); // axialCoord = { q: 5, r: 5 }
const cubeCoord = axialCoord.toCube(); // cubeCoord = { x: 5, y: 5, z: -10 }
```

# HexUtils Usage

```js
import { HexUtils, Coord, HexDirection } from 'hexmap';

// get the distance between 2 coordinates
const coord1 = Coord.parse("o5:5");
const coord2 = Coord.parse("o5:10");
const distance = HexUtils.distance(coord1, coord2); // distance = 5

// get the opoosite direction of a direction
const opposite = HexUtils.opposite(HexDirection.DownLeft); // opposite = HexDirection.UpRight

// get the closest cell matching a predicate
const hexmap = new HexMap<String>(100, 100);
const cellOrNull = HexUtils.closest(hexmap, Coord.parse("o5:5"), (cell) => cell.data === "my data");

// get a valid path between 2 coordinates
const hexmap = new HexMap<String>(100, 100);
const path = HexUtils.path(hexmap, Coord.parse("o5:5"), Coord.parse("o5:10"));
```



