import { defineHex, Orientation } from "honeycomb-grid";
import { Dimensions } from "./settings";

const HEX = defineHex({
  dimensions: Dimensions,
  origin: "topLeft",
  orientation: Orientation.FLAT,
});

export class Tile extends HEX {
  color: {
    r: number;
    g: number;
    b: number;
    a: number;
    rgba: string;
  };
  render: (fillColor: string) => void;
}
