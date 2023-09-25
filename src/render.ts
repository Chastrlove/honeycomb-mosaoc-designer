import { Tile } from "./Tile";

function isPointInPolygon(
  point: {
    x: number;
    y: number;
  },
  vertices,
) {
  let crossings = 0;
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length;
    const xi = vertices[i].x,
      yi = vertices[i].y;
    const xj = vertices[j].x,
      yj = vertices[j].y;

    const isPointBelowLine = point.y < Math.max(yi, yj);
    const isPointAboveLine = point.y >= Math.min(yi, yj);
    const isPointToRightOfLine =
      point.x < ((point.y - yi) * (xj - xi)) / (yj - yi) + xi;

    if (isPointAboveLine && isPointBelowLine && isPointToRightOfLine) {
      crossings++;
    }
  }
  return crossings % 2 !== 0;
}

// 遍历蜂窝内所有像素
function iterateHexPixels(vertices, callback) {
  const xMin = Math.min(...vertices.map((v) => v.x));
  const xMax = Math.max(...vertices.map((v) => v.x));
  const yMin = Math.min(...vertices.map((v) => v.y));
  const yMax = Math.max(...vertices.map((v) => v.y));

  for (let px = Math.ceil(xMin); px <= Math.floor(xMax); px++) {
    for (let py = Math.ceil(yMin); py <= Math.floor(yMax); py++) {
      if (isPointInPolygon({ x: px, y: py }, vertices)) {
        callback(px, py, {
          xMin,
          xMax,
          yMin,
          yMax,
        });
      }
    }
  }
}
function calculateAverageColor(pixels) {
  let totalR = 0,
    totalG = 0,
    totalB = 0,
    totalA = 0,
    count = 0;

  for (const pixel of pixels) {
    totalR += pixel.r;
    totalG += pixel.g;
    totalB += pixel.b;
    totalA += pixel.a;
    count++;
  }

  const avgR = totalR / count;
  const avgG = totalG / count;
  const avgB = totalB / count;
  const avgA = totalA / count;

  return {
    r: avgR,
    g: avgG,
    b: avgB,
    a: avgA,
    rgba: `rgba(${avgR}, ${avgG}, ${avgB}, ${avgA / 255})`,
  };
}

export const renderCanvas = (
  ctx: CanvasRenderingContext2D,
  tile: Tile,
  getPixel,
  xRatio,
  yRatio,
) => {
  // 遍历蜂窝内的像素点（这里需要你自己定义具体算法）
  // 假设蜂窝内有一个像素点集合 points
  const corners = tile.corners;

  const pixels = [];

  iterateHexPixels(corners, (px, py) => {
    const color = getPixel(px * xRatio, py * yRatio); // dx, dy 是相对于蜂窝中心的偏移
    // ctx.fillStyle = color.rgba
    // ctx.fillRect(px, py, 1, 1);
    pixels.push(color);
  });

  const avg = calculateAverageColor(pixels);

  tile.render = (fillColor: string) => {
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    corners.forEach((corner) => ctx.lineTo(corner.x, corner.y));
    ctx.closePath();
    ctx.strokeStyle = "rgb(153, 153, 153)";
    ctx.stroke();
    // 红色填充
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.restore();
  };

  tile.color = avg;

  tile.render(avg.rgba);
};
