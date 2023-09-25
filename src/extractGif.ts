import { createFFmpeg, fetchFile, FSMethodNames } from "@ffmpeg/ffmpeg";
import { createHoneycombCanvas } from "./createHoneycombCanvas";

const ffmpeg = createFFmpeg({ log: false });

document
  .getElementById("fileInput")
  .addEventListener("change", async function (event) {
    // 清空之前的图片
    document.getElementById("imageContainer").innerHTML = "";

    // 1. 获取文件
    // 1. 获取文件
    const inputElement = event.target as HTMLInputElement; // 类型转换
    const file = inputElement.files ? inputElement.files[0] : null; // 从 event 获取文件

    // 2. 加载 FFmpeg
    await ffmpeg.load();

    // 3. 读取文件到 FFmpeg
    ffmpeg.FS("writeFile", file.name, await fetchFile(file));

    // 4. 执行转换
    const outputPattern = file.name.endsWith(".gif")
      ? "output_%03d.png"
      : "output_%03d.jpg";
    await ffmpeg.run("-i", file.name, "-vf", "fps=1", outputPattern);

    // 5. 读取输出并添加到网页
    const matchPattern = new RegExp(
      "^" + outputPattern.replace("%03d", "\\d+"),
    );
    const readDirResult = ffmpeg.FS("readdir" as FSMethodNames, "/");

    if (Array.isArray(readDirResult)) {
      const files = readDirResult.filter((fileName) =>
        matchPattern.test(fileName),
      );

      for (const name of files) {
        const data = ffmpeg.FS("readFile", name);
        if (data && data.buffer) {
          // 确保data是Uint8Array
          const blob = new Blob([data.buffer], { type: "image/png" });
          const url = URL.createObjectURL(blob);

          const [canvas, grid] = createHoneycombCanvas(url);

          canvas.addEventListener("click", ({ offsetX, offsetY }) => {
            const hex = grid.pointToHex(
              { x: offsetX, y: offsetY },
              { allowOutside: false },
            );
            //ToDo 这里用用户选择的颜色替换
            hex.render("#fff");
          });

          document.body.appendChild(canvas);
        }
      }
    } else {
      console.error("Failed to read the directory");
    }
  });
