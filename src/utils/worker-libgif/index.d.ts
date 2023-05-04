export type SourceImgObj = {
  delay: number
  img: OffscreenCanvas | CanvasImageSource
}

export default function loadGifToCanvas(url: string, isWorker: boolean): Promise<SourceImgObj[]>;