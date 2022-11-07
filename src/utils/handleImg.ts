// import SuperGif from './libgif.js'
import { ImgLoadType } from '@/type';
import SuperGif from 'libgif'

/** 加载图片 imgUrl: 图片数组, objKey: 在数组中的key值  */
export function loadImage(imgUrl: any, objKey?: string) {
  return new Promise<ImgLoadType>((resolve, reject) => {
    try {
      const imgObj: {[key: string]: HTMLImageElement} = {}; // 保存图片资源
      let tempImg, imgLength = 0, loaded = 0;
      for (let key in imgUrl) {
        imgLength++; // 初始化要加载图片的总数
        tempImg = new Image();
        tempImg.src = !objKey ? imgUrl[key] : imgUrl[key][objKey];
        imgObj[key] = tempImg;
        tempImg.onload = function () {
          loaded++; // 统计已经加载完毕的图像
          // 所有的图片都加载完毕
          if (loaded >= imgLength) {
            resolve(imgObj)
          }
        };
      }
    } catch (error) {
      console.log('error: ', error);
      reject(error)
    }
  })
}

 /** 单张gif转静态图片 */
export function gifToStaticImg(target: {type: string, imgSource: string}) {
  return new Promise<HTMLImageElement[]>((resolve, reject) => {
    try {
      const {type, imgSource} = target
      if(type !== 'gif') {
        const newImg = new Image();
        newImg.src = imgSource
        resolve([newImg])
      }
      const gifImg = document.createElement('img');
      gifImg.src = imgSource
      // gifImg.style.transform = 'rotate(90deg)';
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

export function importUrl(url: string) {
  return new URL(url, import.meta.url).href
}