import { CDN_URL } from '@/config';
import SuperGif from 'libgif';
// import loadGifToCanvas, { SourceImgObj } from "./worker-libgif"
import { loadGifToCanvas, SourceImgObj } from "lhh-utils";

/** 加载图片 */
export function loadImage(imgUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    try {
      const tempImg = new Image();
      tempImg.src = imgUrl;
      tempImg.onload = function () {
        resolve(tempImg)
      };
    } catch (error) {
      console.log('error: ', error);
      reject(error)
    }
  })
}

 /** 单张gif转静态图片 */
export function gifToStaticImgLibGif(target: {type: string, imgSource: string}) {
  return new Promise<HTMLImageElement[]>(async (resolve, reject) => {
    try {
      const {type, imgSource} = target
      if(type !== 'gif') {
        const newImg = await loadImage(imgSource)
        resolve([newImg])
        return
      }
      const gifImg = document.createElement('img');
      gifImg.src = imgSource
      // 创建gif实例
      const rub = new SuperGif({ gif: gifImg } );
      rub.load(() => {
        const imgList = [];
        for (let i = 1; i <= rub.get_length(); i++) {
          // 遍历gif实例的每一帧
          rub.move_to(i);
          const imgUrl = rub.get_canvas()
          imgList.push(imgUrl)
        }
        resolve(imgList)
      });
    } catch (error) {
      console.log('error: ', error);
      reject(error)
    }
  })
}

/** CDN加载图片 */
export const requireCDN = (url: string, prefix: string = 'legendTD') => {
  return `${CDN_URL}/${prefix ? prefix + '/' : ''}${url}`
}

/** 加载图片 */
export const requireImg = (url: string) => new URL(`../assets/img/${url}`, import.meta.url).href

/** worker 加载图片 */
export function loadImageWorker(imgUrl: string) {
  return new Promise<ImageBitmap>((resolve, reject) => {
    try {
      fetch(imgUrl).then(response => response.blob())
      .then(blob => {
        createImageBitmap(blob).then(image => {
          resolve(image)
        })
      })
    } catch (error) {
      console.log('loadImageWorker-error: ', error);
      reject(error)
    }
  })
}

/** 单张gif转静态图片 */
export function gifToStaticImgList(url: string, isWorker = false) {
  return new Promise<(SourceImgObj)[]>((resolve, reject) => {
    loadGifToCanvas(url, isWorker).then((list) => {
      resolve(list)
    }).catch((error: any) => {
      console.log('gifToStaticImg-error: ', error);
      reject(error)
    })
  })
}