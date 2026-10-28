/* =========================================================
   像素美术：用字符网格绘制 SVG 像素图
   . = 透明   K = 描边   C = 奶油白   P = 浅粉   R = 玫瑰粉
   D = 深玫瑰  G = 暖金   H = 深粉
   ========================================================= */
(function () {
  'use strict';

  var PAL = {
    K: '#6B3B4E',
    C: '#FFF4E1',
    P: '#F6AFCB',
    R: '#E8749F',
    D: '#C9557F',
    G: '#F7D98B',
    H: '#C9557F'
  };

  var MAPS = {
    /* 小兔子 18 x 18 */
    bunny: [
      '...KKK......KKK...',
      '..KCPK......KCPK..',
      '..KCPK......KCPK..',
      '..KCPK......KCPK..',
      '..KCPK......KCPK..',
      '..KCCK......KCCK..',
      '..KCCCCCCCCCCCCK..',
      '.KCCCCCCCCCCCCCCK.',
      '.KCCCCCCCCCCCCCCK.',
      '.KCCCCCCCCCCCCCCK.',
      '.KCCCCCCCCCCCCCCK.',
      '.KCCCKKCCCCKKCCCK.',
      '.KCCCKKCCCCKKCCCK.',
      '.KCPCCCCRRCCCCPCK.',
      '.KCCCCCRRRRCCCCCK.',
      '.KCCCCCCRRCCCCCCK.',
      '.KCCCCCCCCCCCCCCK.',
      '..KKKKKKKKKKKKKK..'
    ],

    /* 礼物盒 16 x 14 */
    gift: [
      '..KKKK....KKKK..',
      '.KRRRRKKKKRRRRK.',
      '.KRRRRKCCKRRRRK.',
      '..KKKKKCCKKKKK..',
      '.KKKKKKKKKKKKKK.',
      '.KRRRRRCCRRRRRK.',
      '.KRRRRRCCRRRRRK.',
      '.KKKKKKKKKKKKKK.',
      '..KRRRRCCRRRRK..',
      '..KRRRRCCRRRRK..',
      '..KRRRRCCRRRRK..',
      '..KRRRRCCRRRRK..',
      '..KDDDDDDDDDDK..',
      '..KKKKKKKKKKKK..'
    ],

    /* 蛋糕 20 x 16（蜡烛在上，火焰单独绘制） */
    cake: [
      '.........KK.........',
      '.........CC.........',
      '.........CC.........',
      '.........CC.........',
      '.........KK.........',
      '....KKKKKKKKKKKK....',
      '....KCCCCCCCCCCK....',
      '....KRCCCCCCCCRK....',
      '..KKKKKKKKKKKKKKKK..',
      '..KCCCCCCCCCCCCCCK..',
      '..KRRRRRRRRRRRRRRK..',
      '..KRRRRRRRRRRRRRRK..',
      '..KRRRRRRRRRRRRRRK..',
      '..KKKKKKKKKKKKKKKK..',
      '.KCCCCCCCCCCCCCCCCK.',
      '..KKKKKKKKKKKKKKKK..'
    ],

    /* 信封 14 x 10 */
    envelope: [
      'KKKKKKKKKKKKKK',
      'KCCCCCCCCCCCCK',
      'KKCCCCCCCCCCKK',
      'KCCKCCCCCCKCCK',
      'KCCCKCCCCKCCCK',
      'KCCCCKCCKCCCCK',
      'KCCCCCKKCCCCCK',
      'KCCCCCHHCCCCCK',
      'KCCCCCCCCCCCCK',
      'KKKKKKKKKKKKKK'
    ],

    /* 心 8 x 7 */
    heart: [
      '.KK..KK.',
      'KRRKKRRK',
      'KRRRRRRK',
      'KRRRRRRK',
      '.KRRRRK.',
      '..KRRK..',
      '...KK...'
    ],

    /* 云 16 x 6 */
    cloud: [
      '...KKK....KKK...',
      '..KCCCKKKKCCCK..',
      '.KCCCCCCCCCCCCK.',
      'KCCCCCCCCCCCCCCK',
      'KCCCCCCCCCCCCCCK',
      'KKKKKKKKKKKKKKKK'
    ],

    /* 月亮 12 x 12 */
    moon: [
      '....KKKK....',
      '..KKCCCCKK..',
      '.KCCCCCCCCK.',
      '.KCCCCCCCCK.',
      'KCCCCCCCCCCK',
      'KCCCCCCCCCCK',
      'KCCCCCCCCCCK',
      'KCCCCCCCCCCK',
      '.KCCCCCCCCK.',
      '.KCCCCCCCCK.',
      '..KKCCCCKK..',
      '....KKKK....'
    ],

    /* 十字星 5 x 5 */
    sparkle: [
      '..C..',
      '..C..',
      'CCCCC',
      '..C..',
      '..C..'
    ],

    /* 气球 7 x 12 */
    balloon: [
      '..KKK..',
      '.KRRRK.',
      'KRRRRRK',
      'KRRRRRK',
      'KRRRRRK',
      'KRRRRRK',
      '.KRRRK.',
      '..KKK..',
      '...K...',
      '...K...',
      '..K.K..',
      '.......'
    ],

    /* 蜡烛火焰 7 x 7 */
    flame: [
      '...G...',
      '..GGG..',
      '..GGG..',
      '.GGGGG.',
      '.GGGGG.',
      '..GGG..',
      '...R...'
    ]
  };

  function svg(name, px) {
    var map = MAPS[name];
    if (!map) return '';
    px = px || 10;
    var h = map.length;
    var w = 0;
    var i;
    for (i = 0; i < map.length; i++) {
      if (map[i].length > w) w = map[i].length;
    }
    var rows = [];
    for (i = 0; i < map.length; i++) {
      var r = map[i];
      while (r.length < w) r += '.';
      rows.push(r);
    }
    var rects = '';
    for (var y = 0; y < h; y++) {
      var x = 0;
      while (x < w) {
        var ch = rows[y].charAt(x);
        if (ch === '.') { x++; continue; }
        var run = 1;
        while (x + run < w && rows[y].charAt(x + run) === ch) run++;
        rects += '<rect x="' + x + '" y="' + y + '" width="' + run + '" height="1" fill="' +
          (PAL[ch] || '#000') + '"/>';
        x += run;
      }
    }
    return '<svg class="sprite sprite--' + name + '" viewBox="0 0 ' + w + ' ' + h +
      '" width="' + (w * px) + '" height="' + (h * px) +
      '" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' + rects + '</svg>';
  }

  window.PixelArt = { svg: svg, maps: MAPS, palette: PAL };
})();