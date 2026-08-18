import type { Area } from 'react-easy-crop';

/**
 * Slices the exact pixel region described by `pixelCrop` from `imageSrc`
 * and returns it as a JPEG blob at the given quality.
 *
 * Canvas dimensions are set to the exact crop dimensions so no stretching
 * or downscaling occurs. The drawImage call maps the source region 1-to-1
 * onto the canvas origin.
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputType: 'image/jpeg' | 'image/webp' = 'image/jpeg',
  quality = 0.95,
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // Canvas is exactly the size of the cropped region — no scaling
  canvas.width  = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    // Source: exact pixel region selected by the user
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    // Destination: full canvas, 1-to-1
    0, 0, pixelCrop.width, pixelCrop.height,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('Canvas produced empty blob'))),
      outputType,
      quality,
    );
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', () =>
      reject(new Error(`Failed to load image: ${url}`)),
    );
    // Cache-bust only for remote URLs; blob: URLs must not be modified
    img.src = url.startsWith('blob:') ? url : `${url}${url.includes('?') ? '&' : '?'}_cb=${Date.now()}`;
  });
}
