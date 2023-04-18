declare module "./worker-libgif" {
  export function loadWorkerGIF(url: string): Promise<{delay: number, data: OffscreenCanvas}[]>;
}