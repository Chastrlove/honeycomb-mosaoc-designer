import { Grid, rectangle } from "honeycomb-grid";
import { renderCanvas } from "./render";
import { Dimensions, GRID_HEIGHT, GRID_WIDTH } from "./settings";
import { Tile } from "./Tile";

export const createHoneycombCanvas = (
  imageUrl: string,
  opts?: {
    cols: number;
    rows: number;
  },
) => {
  const { cols = GRID_WIDTH, rows = GRID_HEIGHT } = opts || {};

  const colCount = Math.ceil(cols / 2);

  const nextColCount = cols / 2 === colCount ? colCount : colCount - 1;

  const canvas = document.createElement("canvas") as HTMLCanvasElement;

  const ctx = canvas?.getContext("2d");

  const width = Dimensions * (2 * colCount + nextColCount);

  const height = Dimensions * Math.sqrt(3) * rows;

  const canvasWidth = width;
  const canvasHeight = Math.ceil(height);

  canvas.width = canvasWidth * window.devicePixelRatio;
  canvas.height = canvasHeight * window.devicePixelRatio;
  canvas.style.width = canvasWidth + "px";
  canvas.style.height = canvasHeight + "px";

  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const grid = new Grid(Tile, rectangle({ width: cols, height: rows }));
  const img = new Image();
  img.src = imageUrl; // 替换成你自己的图片路径
  img.onload = function () {
    // 创建一个临时canvas来获取图片的像素数据
    const tempCanvas = document.createElement("canvas");

    // 定义比例
    const xRatio = img.width / canvas.width;
    const yRatio = img.height / canvas.height;

    tempCanvas.width = img.width;
    tempCanvas.height = img.height;

    const tempCtx = tempCanvas.getContext("2d");

    tempCtx.drawImage(img, 0, 0);

    const imgData = tempCtx.getImageData(0, 0, img.width, img.height).data;

    function getPixel(x, y) {
      const index = (Math.floor(y) * img.width + Math.floor(x)) * 4;
      const r = imgData[index];
      const g = imgData[index + 1];
      const b = imgData[index + 2];
      const a = imgData[index + 3];
      const rgba = `rgba(${imgData[index]}, ${imgData[index + 1]}, ${
        imgData[index + 2]
      }, ${imgData[index + 3] / 255})`;
      return {
        r,
        g,
        b,
        a,
        rgba,
      };
    }

    grid.forEach((tile) => {
      if (tile.row === rows - 1 && tile.col % 2 === 1) {
        return;
      }
      renderCanvas(
        ctx,
        tile,
        getPixel,
        xRatio * window.devicePixelRatio,
        yRatio * window.devicePixelRatio,
      );
    });
  };

  return [canvas, grid] as const;
};
