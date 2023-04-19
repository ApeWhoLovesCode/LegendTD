/** 
 * 将gif图片转可供canvas绘画的数组
 * @param url: 图片地址
 * @param isWorker: 是否是worker环境下 默认为false
 */
export default function loadGifToCanvas(url, isWorker = false) {
  // console.log(self instanceof WorkerGlobalScope);
  var FRAME_LIST = []; // 存放每一帧数据以及对应的延时
  // var TEMP_CANVAS = document.createElement("canvas");
  var TEMP_CANVAS;
  if(isWorker) {
    TEMP_CANVAS = new OffscreenCanvas(100, 100);
  } else {
    TEMP_CANVAS = document.createElement("canvas");
  }
  var TEMP_CANVAS_CTX = null;
  var GIF_INFO = {};
  var STREAM = null;
  var LAST_DISPOSA_METHOD = null;
  var CURRENT_FRAME_INDEX = -1; //当前帧的下标
  var TRANSPARENCY = null;
  var DELAY = 0; // 当前帧的时间

  class Stream {
    constructor(data) {
      this.data = data;
      this.len = data.length;
      this.pos = 0;
    }

    readByte() {
      if (this.pos >= this.data.length) {
        throw new Error('Attempted to read past end of stream.');
      }
      if (this.data instanceof Uint8Array)
        return this.data[this.pos++];
      else
        return this.data.charCodeAt(this.pos++) & 0xFF;
    };

    readBytes(n) {
      let bytes = [];
      for (let i = 0; i < n; i++) {
        bytes.push(this.readByte());
      }
      return bytes;
    };

    read(n) {
      let chars = '';
      for (let i = 0; i < n; i++) {
        chars += String.fromCharCode(this.readByte());
      }
      return chars;
    };

    readUnsigned() { // Little-endian.
      let unsigned = this.readBytes(2);
      return (unsigned[1] << 8) + unsigned[0];
    };
  };

  // 转流数组
  function byteToBitArr(bite) {
    let byteArr = [];
    for (let i = 7; i >= 0; i--) {
      byteArr.push(!!(bite & (1 << i)));
    }
    return byteArr;
  };

  // Generic functions
  function bitsToNum(ba) {
    return ba.reduce(function (s, n) {
      return s * 2 + n;
    }, 0);
  };

  function lzwDecode(minCodeSize, data) {
    // TODO: Now that the GIF parser is a bit different, maybe this should get an array of bytes instead of a String?
    let pos = 0; // Maybe this streaming thing should be merged with the Stream?
    function readCode(size) {
      let code = 0;
      for (let i = 0; i < size; i++) {
        if (data.charCodeAt(pos >> 3) & (1 << (pos & 7))) {
          code |= 1 << i;
        }
        pos++;
      }
      return code;
    };

    let output = [],
      clearCode = 1 << minCodeSize,
      eoiCode = clearCode + 1,
      codeSize = minCodeSize + 1,
      dict = [];

    function clear() {
      dict = [];
      codeSize = minCodeSize + 1;
      for (let i = 0; i < clearCode; i++) {
        dict[i] = [i];
      }
      dict[clearCode] = [];
      dict[eoiCode] = null;

    };

    let code = null, last = null;
    while (true) {
      last = code;
      code = readCode(codeSize);

      if (code === clearCode) {
        clear();
        continue;
      }
      if (code === eoiCode) {
        break
      };
      if (code < dict.length) {
        if (last !== clearCode) {
          dict.push(dict[last].concat(dict[code][0]));
        }
      }
      else {
        if (code !== dict.length) {
          throw new Error('Invalid LZW code.');
        }
        dict.push(dict[last].concat(dict[last][0]));
      }
      output.push.apply(output, dict[code]);

      if (dict.length === (1 << codeSize) && codeSize < 12) {
        // If we're at the last code and codeSize is 12, the next code will be a clearCode, and it'll be 12 bits long.
        codeSize++;
      }
    }
    return output;
  };

  function readSubBlocks() {
    let size = null, data = '';
    do {
      size = STREAM.readByte();
      data += STREAM.read(size);
    } while (size !== 0);
    return data;
  };

  function doImg(img) {
    if (!TEMP_CANVAS_CTX) {
      // 没有就创建
      TEMP_CANVAS_CTX = TEMP_CANVAS.getContext('2d');
    }

    const currIdx = FRAME_LIST.length,
      ct = img.lctFlag ? img.lct : GIF_INFO.gct;
    /*
    LAST_DISPOSA_METHOD indicates the way in which the graphic is to
    be treated after being displayed.
    Values :    0 - No disposal specified. The decoder is
                    not required to take any action.
                1 - Do not dispose. The graphic is to be left
                    in place.
                2 - Restore to background color. The area used by the
                    graphic must be restored to the background color.
                3 - Restore to previous. The decoder is required to
                    restore the area overwritten by the graphic with
                    what was there prior to rendering the graphic.
                    Importantly, "previous" means the frame state
                    after the last disposal of method 0, 1, or 2.
    */
    if (currIdx > 0) {
      // 这块不要动
      if (LAST_DISPOSA_METHOD === 3) {
        // Restore to previous
        // If we disposed every TEMP_CANVAS_CTX including first TEMP_CANVAS_CTX up to this point, then we have
        // no composited TEMP_CANVAS_CTX to restore to. In this case, restore to background instead.
        if (CURRENT_FRAME_INDEX !== null && CURRENT_FRAME_INDEX > -1) {
          TEMP_CANVAS_CTX.putImageData(FRAME_LIST[CURRENT_FRAME_INDEX].data, 0, 0);
        } else {
          TEMP_CANVAS_CTX.clearRect(0, 0, TEMP_CANVAS.width, TEMP_CANVAS.height);
        }
      } else {
        CURRENT_FRAME_INDEX = currIdx - 1;
      }

      if (LAST_DISPOSA_METHOD === 2) {
        // Restore to background color
        // Browser implementations historically restore to transparent; we do the same.
        // http://www.wizards-toolkit.org/discourse-server/viewtopic.php?f=1&t=21172#p86079
        TEMP_CANVAS_CTX.clearRect(0, 0, TEMP_CANVAS.width, TEMP_CANVAS.height);
      }
    }
    let imgData = TEMP_CANVAS_CTX.getImageData(img.leftPos, img.topPos, img.width, img.height);
    img.pixels.forEach(function (pixel, i) {
      if (pixel !== TRANSPARENCY) {
        imgData.data[i * 4 + 0] = ct[pixel][0];
        imgData.data[i * 4 + 1] = ct[pixel][1];
        imgData.data[i * 4 + 2] = ct[pixel][2];
        imgData.data[i * 4 + 3] = 255; // Opaque.
      }
    });
    TEMP_CANVAS_CTX.putImageData(imgData, img.leftPos, img.topPos);
    // 补充第1帧
    // if(currIdx == 0){
    //     pushFrame(DELAY);
    // }
  };

  /** 处理返回的列表数据 */
  function pushFrame(delay) {
    if (!TEMP_CANVAS_CTX) {
      return
    };
    // FRAME_LIST.push({ delay, data: TEMP_CANVAS_CTX.getImageData(0, 0, GIF_INFO.width, GIF_INFO.height) });
    var canvas
    if(isWorker) {
      canvas = new OffscreenCanvas(GIF_INFO.width, GIF_INFO.height)
    } else {
      canvas = document.createElement("canvas");
    }
    var ctx = canvas.getContext('2d')
    const data = TEMP_CANVAS_CTX.getImageData(0, 0, GIF_INFO.width, GIF_INFO.height)
    ctx.putImageData(data, 0, 0)
    FRAME_LIST.push({ delay, img: canvas });
  };

  // 解析
  function parseExt(block) {

    function parseGCExt(block) {
      STREAM.readByte(); // Always 4 
      var bits = byteToBitArr(STREAM.readByte());
      block.reserved = bits.splice(0, 3); // Reserved; should be 000.

      block.disposalMethod = bitsToNum(bits.splice(0, 3));

      LAST_DISPOSA_METHOD = block.disposalMethod

      block.userInput = bits.shift();
      block.transparencyGiven = bits.shift();
      block.delayTime = STREAM.readUnsigned();
      DELAY = block.delayTime;
      block.transparencyIndex = STREAM.readByte();
      block.terminator = STREAM.readByte();
      pushFrame(block.delayTime);
      TRANSPARENCY = block.transparencyGiven ? block.transparencyIndex : null;
    };

    function parseComExt(block) {
      block.comment = readSubBlocks();
    };

    function parsePTExt(block) {
      // No one *ever* uses this. If you use it, deal with parsing it yourself.
      STREAM.readByte(); // Always 12 这个必须得这样执行一次
      block.ptHeader = STREAM.readBytes(12);
      block.ptData = readSubBlocks();
    };

    function parseAppExt(block) {
      var parseNetscapeExt = function (block) {
        STREAM.readByte(); // Always 3 这个必须得这样执行一次
        block.unknown = STREAM.readByte(); // ??? Always 1? What is this?
        block.iterations = STREAM.readUnsigned();
        block.terminator = STREAM.readByte();
      };

      function parseUnknownAppExt(block) {
        block.appData = readSubBlocks();
        // FIXME: This won't work if a handler wants to match on any identifier.
        // handler.app && handler.app[block.identifier] && handler.app[block.identifier](block);
      };

      STREAM.readByte(); // Always 11 这个必须得这样执行一次
      block.identifier = STREAM.read(8);
      block.authCode = STREAM.read(3);
      switch (block.identifier) {
        case 'NETSCAPE':
          parseNetscapeExt(block);
          break;
        default:
          parseUnknownAppExt(block);
          break;
      }
    };

    function parseUnknownExt(block) {
      block.data = readSubBlocks();
    };

    block.label = STREAM.readByte();
    switch (block.label) {
      case 0xF9:
        block.extType = 'gce';
        parseGCExt(block);
        break;
      case 0xFE:
        block.extType = 'com';
        parseComExt(block);
        break;
      case 0x01:
        block.extType = 'pte';
        parsePTExt(block);
        break;
      case 0xFF:
        block.extType = 'app';
        parseAppExt(block);
        break;
      default:
        block.extType = 'unknown';
        parseUnknownExt(block);
        break;
    }
  };

  function parseImg(img) {
    function deinterlace(pixels, width) {
      // Of course this defeats the purpose of interlacing. And it's *probably*
      // the least efficient way it's ever been implemented. But nevertheless...
      let newPixels = new Array(pixels.length);
      const rows = pixels.length / width;

      function cpRow(toRow, fromRow) {
        const fromPixels = pixels.slice(fromRow * width, (fromRow + 1) * width);
        newPixels.splice.apply(newPixels, [toRow * width, width].concat(fromPixels));
      };

      // See appendix E.
      const offsets = [0, 4, 2, 1],
        steps = [8, 8, 4, 2];

      let fromRow = 0;
      for (var pass = 0; pass < 4; pass++) {
        for (var toRow = offsets[pass]; toRow < rows; toRow += steps[pass]) {
          cpRow(toRow, fromRow)
          fromRow++;
        }
      }

      return newPixels;
    };

    img.leftPos = STREAM.readUnsigned();
    img.topPos = STREAM.readUnsigned();
    img.width = STREAM.readUnsigned();
    img.height = STREAM.readUnsigned();

    let bits = byteToBitArr(STREAM.readByte());
    img.lctFlag = bits.shift();
    img.interlaced = bits.shift();
    img.sorted = bits.shift();
    img.reserved = bits.splice(0, 2);
    img.lctSize = bitsToNum(bits.splice(0, 3));

    if (img.lctFlag) {
      img.lct = parseCT(1 << (img.lctSize + 1));
    }

    img.lzwMinCodeSize = STREAM.readByte();

    const lzwData = readSubBlocks();

    img.pixels = lzwDecode(img.lzwMinCodeSize, lzwData);

    if (img.interlaced) { // Move
      img.pixels = deinterlace(img.pixels, img.width);
    }
    doImg(img);
  };

  // LZW (GIF-specific)
  function parseCT(entries) { // Each entry is 3 bytes, for RGB.
    let ct = [];
    for (let i = 0; i < entries; i++) {
      ct.push(STREAM.readBytes(3));
    }
    return ct;
  };

  function parseHeader() {
    GIF_INFO.sig = STREAM.read(3);
    GIF_INFO.ver = STREAM.read(3);
    if (GIF_INFO.sig !== 'GIF') throw new Error('Not a GIF file.'); // XXX: This should probably be handled more nicely.
    GIF_INFO.width = STREAM.readUnsigned();
    GIF_INFO.height = STREAM.readUnsigned();

    let bits = byteToBitArr(STREAM.readByte());
    GIF_INFO.gctFlag = bits.shift();
    GIF_INFO.colorRes = bitsToNum(bits.splice(0, 3));
    GIF_INFO.sorted = bits.shift();
    GIF_INFO.gctSize = bitsToNum(bits.splice(0, 3));

    GIF_INFO.bgColor = STREAM.readByte();
    GIF_INFO.pixelAspectRatio = STREAM.readByte(); // if not 0, aspectRatio = (pixelAspectRatio + 15) / 64
    if (GIF_INFO.gctFlag) {
      GIF_INFO.gct = parseCT(1 << (GIF_INFO.gctSize + 1));
    }
    // 给 TEMP_CANVAS 设置大小
    TEMP_CANVAS.width = GIF_INFO.width;
    TEMP_CANVAS.height = GIF_INFO.height;
    TEMP_CANVAS_CTX = TEMP_CANVAS.getContext('2d');
    if(!isWorker) {
      TEMP_CANVAS.style.width = GIF_INFO.width + 'px';
      TEMP_CANVAS.style.height = GIF_INFO.height + 'px';
    }
    TEMP_CANVAS_CTX.setTransform(1, 0, 0, 1, 0, 0);
  };

  function parseBlockWrap() {
    return new Promise((resolve) => {
      parseBlock()
      function parseBlock() {
        let block = {};
        block.sentinel = STREAM.readByte();
        switch (String.fromCharCode(block.sentinel)) { // For ease of matching
          case '!':
            block.type = 'ext';
            parseExt(block);
            break;
          case ',':
            block.type = 'img';
            parseImg(block);
            break;
          case ';':
            block.type = 'eof';
            pushFrame(DELAY);
            // 结束递归，截去第一帧，第一帧是空白的。
            resolve(FRAME_LIST.slice(1, FRAME_LIST.length))
            break;
          default:
            throw new Error('Unknown block: 0x' + block.sentinel.toString(16)); // TODO: Pad this with a 0.
        }
        // 递归
        if (block.type !== 'eof') {
          setTimeout(parseBlock, 0);
        }
      };
    })
  }

  // 1.起步
  return new Promise((resolve, reject) => {
    const h = new XMLHttpRequest();
    h.open('GET', url, true);
    // 浏览器兼容处理
    if ('overrideMimeType' in h) {
      h.overrideMimeType('text/plain; charset=x-user-defined');
    }
    // old browsers (XMLHttpRequest-compliant)
    else if ('responseType' in h) {
      h.responseType = 'arraybuffer';
    }
    // IE9 (Microsoft.XMLHTTP-compliant)
    else {
      h.setRequestHeader('Accept-Charset', 'x-user-defined');
    }
  
    h.onload = function (e) {
      if (this.status != 200) {
        doLoadError('xhr - response');
      }
      // emulating response field for IE9
      if (!('response' in this)) {
        this.response = new VBArray(this.responseText).toArray().map(String.fromCharCode).join('');
      }
      let data = this.response;
      if (data.toString().indexOf("ArrayBuffer") > 0) {
        data = new Uint8Array(data);
      }
  
      STREAM = new Stream(data);
      parseHeader();
      parseBlockWrap().then((list) => {
        resolve(list)
      });
    };
  
    h.onerror = function (e) {
      console.log("摆烂 error", e)
    };
  
    h.send();
  })
}