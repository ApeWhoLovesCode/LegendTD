// import SuperGif from './libgif.js'
import SuperGif from 'libgif'

// CanvasImageSource
/** 加载图片 imgUrl: 图片地址,   */
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
