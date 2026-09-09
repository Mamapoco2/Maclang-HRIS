/**
 * Trims transparent padding around a signature drawing and re-renders it
 * onto a standard-sized canvas so all uploaded signatures come out a
 * consistent, legible size regardless of how small/large the original
 * drawing was.
 *
 * @param {File} file - the original PNG file selected by the user
 * @param {Object} [options]
 * @param {number} [options.canvasWidth=600]
 * @param {number} [options.canvasHeight=240]
 * @param {number} [options.fillRatio=0.8] - how much of the canvas height
 *   the trimmed signature should occupy (0-1). Leaves a small margin.
 * @param {number} [options.alphaThreshold=10] - pixels with alpha above
 *   this are considered "ink" when trimming.
 * @returns {Promise<File>} a new PNG File, same name, normalized.
 */
export async function normalizeSignatureImage(
  file,
  {
    canvasWidth = 1000,
    canvasHeight = 360,
    fillRatio = 0.9,
    alphaThreshold = 10,
  } = {},
) {
  const imageBitmap = await loadImage(file);

  // 1. Draw the original image onto an off-screen canvas so we can read pixels.
  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = imageBitmap.width;
  srcCanvas.height = imageBitmap.height;
  const srcCtx = srcCanvas.getContext("2d");
  srcCtx.drawImage(imageBitmap, 0, 0);

  const { data } = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);

  // 2. Find the bounding box of non-transparent ("inked") pixels.
  let minX = srcCanvas.width;
  let minY = srcCanvas.height;
  let maxX = 0;
  let maxY = 0;
  let hasInk = false;

  for (let y = 0; y < srcCanvas.height; y++) {
    for (let x = 0; x < srcCanvas.width; x++) {
      const alpha = data[(y * srcCanvas.width + x) * 4 + 3];
      if (alpha > alphaThreshold) {
        hasInk = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Fallback: if we somehow found no ink (e.g. fully opaque background
  // image, not transparent), just use the whole image as-is.
  if (!hasInk) {
    minX = 0;
    minY = 0;
    maxX = srcCanvas.width - 1;
    maxY = srcCanvas.height - 1;
  }

  const trimmedWidth = maxX - minX + 1;
  const trimmedHeight = maxY - minY + 1;

  // 3. Scale the trimmed signature to fill `fillRatio` of the target
  // canvas height (or width, whichever is the limiting dimension),
  // preserving aspect ratio, then center it on the standard canvas.
  const targetH = canvasHeight * fillRatio;
  const targetW = canvasWidth * fillRatio;
  const scale = Math.min(targetW / trimmedWidth, targetH / trimmedHeight);

  const drawWidth = trimmedWidth * scale;
  const drawHeight = trimmedHeight * scale;
  const offsetX = (canvasWidth - drawWidth) / 2;
  const offsetY = (canvasHeight - drawHeight) / 2;

  const outCanvas = document.createElement("canvas");
  outCanvas.width = canvasWidth;
  outCanvas.height = canvasHeight;
  const outCtx = outCanvas.getContext("2d");
  // Keep background transparent (don't fill it).
  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = "high";

  outCtx.drawImage(
    srcCanvas,
    minX,
    minY,
    trimmedWidth,
    trimmedHeight,
    offsetX,
    offsetY,
    drawWidth,
    drawHeight,
  );

  const blob = await new Promise((resolve) =>
    outCanvas.toBlob(resolve, "image/png"),
  );

  return new File([blob], file.name, {
    type: "image/png",
    lastModified: Date.now(),
  });
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}
