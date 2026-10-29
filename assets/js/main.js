/* =========================================================
   邱盈金 · 生日纪念网站 —— 交互逻辑
   ========================================================= */
(function () {
  'use strict';

  var S = window.SITE;
  var F = S.facts;
  var PA = window.PixelArt;
  var TOTAL = S.scenes.length;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var state = {
    scene: 1,
    card: 0,
    answered: false,
    wishDone: false,
    hugging: false,
    letterSource: null
  };

  /* ---------------- 日期计算（只做四则运算，不猜内容） ---------------- */
  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

  function parseDate(str) {
    var p = str.split('-').map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }

  function daysToBirthday() {
    var today = startOfDay(new Date());
    var b = parseDate(F.birthday);
    return Math.round((b - today) / 86400000);
  }

  function togetherText() {
    var from = parseDate(F.togetherFrom);
    var now = startOfDay(new Date());
    var months = (now.getFullYear() - from.getFullYear()) * 12 + (now.getMonth() - from.getMonth());
    if (now.getDate() < from.getDate()) months -= 1;
    if (months < 0) months = 0;
    var y = Math.floor(months / 12);
    var m = months % 12;
    if (y <= 0) return m + ' 个月';
    return m > 0 ? (y + ' 年 ' + m + ' 个月') : (y + ' 年');
  }

  function countdownText() {
    var n = daysToBirthday();
    if (n > 0) return '再过 <b>' + n + '</b> 天，你就满 ' + F.birthdayAge + ' 岁了';
    if (n === 0) return '今天，你就满 ' + F.birthdayAge + ' 岁了';
    return F.birthdayAge + ' 岁生日快乐';
  }

  /* ---------------- 小工具 ---------------- */
  function pad2(n) { return n < 10 ? '0' + n : '' + n; }

  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2600);
  }

  function spawnSparks(host, count) {
    for (var i = 0; i < count; i++) {
      var s = document.createElement('i');
      s.className = 'spark';
      s.style.left = (20 + Math.random() * 60) + '%';
      s.style.top = (30 + Math.random() * 30) + '%';
      s.style.animationDelay = (Math.random() * 0.6) + 's';
      s.style.animationDuration = (1.6 + Math.random() * 1.2) + 's';
      s.style.background = ['#FFD9E6', '#F7D98B', '#FFF4E1', '#E8749F'][i % 4];
      host.appendChild(s);
      (function (node) {
        setTimeout(function () { node.remove(); }, 3400);
      })(s);
    }
  }

  function spawnHearts(count) {
    var host = $('#hugHearts');
    if (!host) return;
    for (var i = 0; i < count; i++) {
      var h = document.createElement('span');
      h.className = 'fheart';
      h.innerHTML = PA.svg('heart', 3);
      h.style.setProperty('--dx', (Math.random() * 190 - 95).toFixed(0) + 'px');
      h.style.setProperty('--dy', (-70 - Math.random() * 90).toFixed(0) + 'px');
      h.style.setProperty('--rot', (Math.random() * 40 - 20).toFixed(0) + 'deg');
      h.style.animationDelay = (Math.random() * 0.5) + 's';
      host.appendChild(h);
      (function (node) {
        setTimeout(function () { node.remove(); }, 2600);
      })(h);
    }
  }

  /* ---------------- 装饰：星空 / 月亮 / 云 / 气球 ---------------- */
  function buildSky() {
    $$('.sky').forEach(function (sky) {
      var n = parseInt(sky.dataset.stars || 0, 10);
      for (var i = 0; i < n; i++) {
        var s = document.createElement('span');
        var size = ['sm', 'sm', 'md', 'lg'][Math.floor(Math.random() * 4)];
        s.className = 'star star--' + size;
        s.style.left = (Math.random() * 98).toFixed(2) + '%';
        s.style.top = (Math.random() * 92).toFixed(2) + '%';
        s.style.animationDelay = (Math.random() * 4).toFixed(2) + 's';
        s.style.animationDuration = (2.6 + Math.random() * 3).toFixed(2) + 's';
        sky.appendChild(s);
      }

      if (sky.dataset.moon) {
        var moon = document.createElement('span');
        moon.className = 'moon';
        moon.innerHTML = PA.svg('moon', 9);
        sky.appendChild(moon);
      }

      var c = parseInt(sky.dataset.clouds || 0, 10);
      for (var j = 0; j < c; j++) {
        var cloud = document.createElement('span');
        cloud.className = 'cloud cloud--' + (j + 1);
        cloud.innerHTML = PA.svg('cloud', 8);
        sky.appendChild(cloud);
      }
    });

    $$('.balloons').forEach(function (host) {
      for (var k = 0; k < 3; k++) {
        var b = document.createElement('span');
        b.className = 'balloon balloon--' + (k + 1);
        b.innerHTML = PA.svg('balloon', 8);
        host.appendChild(b);
      }
    });
  }

  /* ---------------- 文案填充 ---------------- */
  function fillText() {
    var s1 = S.scenes[0], s2 = S.scenes[1], s3 = S.scenes[2];
    var s4 = S.scenes[3], s6 = S.scenes[5];

    $('#hudPlayer').textContent = S.hud.player;
    $('#hudName').textContent = S.her.nick;
    $('#hudTag').textContent = S.hud.tag;
    $('#barRight').textContent = S.bar.right;

    /* 场景 1 */
    $('#s1Eyebrow').textContent = s1.eyebrow;
    $('#s1Title').textContent = s1.title;
    $('#s1Sub').textContent = s1.sub;
    $('#giftTag').textContent = s1.giftTag;
    $('#s1Hint').textContent = s1.hint;

    /* 场景 2 */
    $('#s2Eyebrow').textContent = s2.eyebrow;
    $('#s2Title').textContent = s2.title;
    $('#s2Boom').textContent = s2.titleBoom || '！';
    $('#s2Sub').textContent = s2.titleSub;
    $('#s2Hint').textContent = s2.hint;
    $('#s2Stick1').textContent = s2.stickers[0];
    $('#s2Stick2').textContent = s2.stickers[1];
    $('#s2Chips').innerHTML =
      '<span class="chip">在一起 <b>' + togetherText() + '</b></span>' +
      '<span class="chip">' + countdownText() + '</span>';

    /* 场景 3 */
    $('#s3Eyebrow').textContent = s3.eyebrow;
    $('#s3Bubble').textContent = s3.bubble;
    $('#s3Question').innerHTML = s3.question.join('<br>');
    $('#s3Answers').innerHTML = s3.answers.map(function (a) {
      return '<button class="pixbtn' + (a.solid ? ' pixbtn--solid' : '') +
        '" type="button" data-answer="' + a.key + '">' + a.text + '</button>';
    }).join('');
    $('#s3Cta').textContent = s3.cta;

    /* 场景 4 */
    $('#s4Eyebrow').textContent = s4.eyebrow;
    $('#s4Title').textContent = s4.title;
    $('#s4Sub').textContent = s4.sub;
    $('#holdBtn').textContent = s4.button;
    $('#s4Hint').textContent = s4.hint;
    $('#s4Cta').textContent = s4.cta;

    /* 场景 6 */
    $('#s6Eyebrow').textContent = s6.eyebrow;
    $('#s6Title').textContent = s6.title;
    $('#s6Lines').innerHTML = s6.lines.join('<br>');
    $('#hugBtn').textContent = s6.button;
    $('#s6Hint').textContent = s6.hint;
    $('#readAgain').textContent = s6.link;

    /* 信 */
    $('#letterEyebrow').textContent = S.letter.eyebrow;
    $('#letterGreet').textContent = S.letter.greet;
    $('#letterBody').innerHTML = S.letter.paragraphs.map(function (p) {
      return '<p>' + p + '</p>';
    }).join('');
    $('#letterSign').innerHTML = S.letter.sign.join('<br>');

    /* 底栏章节名 */
    $('#barTitle').textContent = S.scenes[0].label;
  }

  /* ---------------- 卡片 ---------------- */
  function buildCards() {
    var scene = S.scenes[4];
    var host = $('#cards');
    host.innerHTML = scene.cards.map(function (c, i) {
      var meta = pad2(i + 1) + ' / ' + pad2(scene.cards.length) + ' · ' + scene.meta;
      var env = c.envelope ? '<span class="card__env">' + PA.svg('envelope', 8) + '</span>' : '';
      var body = (c.body && c.body.length)
        ? '<div class="card__body">' + c.body.map(function (p) { return '<p>' + p + '</p>'; }).join('') + '</div>'
        : '';
      var sub = c.sub ? '<p class="card__sub">' + c.sub + '</p>' : '';
      var btn = c.button ? '<button class="pixbtn card__btn" type="button" data-card-btn="' + i + '">' +
        c.button + '</button>' : '';
      return '<article class="card" data-card="' + i + '">' +
        '<p class="card__meta">' + meta + '</p>' +
        '<h3 class="card__title">' + c.title + '</h3>' +
        sub + body + env + btn +
        '</article>';
    }).join('');

    $$('[data-card-btn]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.dataset.cardBtn, 10);
        var card = scene.cards[idx];
        if (card.opensLetter) {
          openLetter('card');
        } else {
          showCard(idx + 1);
        }
      });
    });
  }

  function showCard(i) {
    var cards = $$('#cards .card');
    if (!cards.length) return;
    var last = cards.length - 1;
    if (i > last) i = last;
    if (i < 0) i = 0;
    state.card = i;
    cards.forEach(function (c, idx) {
      c.classList.toggle('is-current', idx === i);
    });
    var next = $('#cardNext');
    if (next) next.textContent = (i === last) ? '✉' : '▶';
    var prev = $('#cardPrev');
    if (prev) prev.style.opacity = (i === 0) ? '.4' : '1';
  }

  /* ---------------- 场景切换 ---------------- */
  function go(n) {
    n = Math.max(1, Math.min(TOTAL, n));
    state.scene = n;
    $$('.scene').forEach(function (sec) {
      sec.classList.toggle('is-active', parseInt(sec.dataset.scene, 10) === n);
    });
    var meta = S.scenes[n - 1];
    $('#barIndex').textContent = pad2(n);
    $('#barTitle').textContent = meta.label;
    $$('#dots .dot').forEach(function (d, idx) {
      d.classList.toggle('is-active', idx === n - 1);
      d.setAttribute('aria-current', idx === n - 1 ? 'true' : 'false');
    });
    if (n === 5) showCard(state.card);
  }

  /* ---------------- 提问场景 ---------------- */
  function initQuiz() {
    var scene = S.scenes[2];
    $$('#s3Answers [data-answer]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (state.answered) return;
        state.answered = true;
        var key = btn.dataset.answer;
        var ans = scene.answers.filter(function (a) { return a.key === key; })[0];

        $$('#s3Answers .pixbtn').forEach(function (b) {
          b.disabled = true;
          b.classList.toggle('is-chosen', b === btn);
          if (b === btn) b.classList.add('pixbtn--solid');
        });

        var bubble = $('#s3Bubble');
        bubble.textContent = ans.reply;
        bubble.classList.remove('is-pop');
        void bubble.offsetWidth;
        bubble.classList.add('is-pop');

        var bunny = $('#s3Bunny');
        bunny.classList.remove('is-tilt');
        void bunny.offsetWidth;
        bunny.classList.add('is-tilt');

        $('#s3Reply').textContent = ans.line;
        $('#s3Cta').hidden = false;
      });
    });

    $('#s3Cta').addEventListener('click', function () { go(4); });
  }

  /* ---------------- 许愿场景：按住 2 秒 ---------------- */
  function initWish() {
    var scene = S.scenes[3];
    var btn = $('#holdBtn');
    var fill = $('#holdFill');
    var bar = $('.holdbar');
    var flame = $('#flame');
    var smoke = $('#smoke');
    var cake = $('.cake');
    var hint = $('#s4Hint');
    var cta = $('#s4Cta');
    var stage = $('.cake-stage');

    var raf = 0;
    var startedAt = 0;
    var holding = false;
    var timeoutId = 0;
    var DURATION = 2000;


    function tick(now) {
      var p = Math.min(1, (now - startedAt) / DURATION);
      fill.style.width = (p * 100).toFixed(1) + '%';
      if (p >= 1) { finish(); return; }
      raf = requestAnimationFrame(tick);
    }

    function begin() {
      if (state.wishDone || holding) return;
      holding = true;
      startedAt = performance.now();
      btn.classList.add('is-down');
      btn.textContent = scene.holding;
      raf = requestAnimationFrame(tick);
      /* 计时兜底：即使动画被浏览器节流（切到后台），2 秒也照样算完成 */
      clearTimeout(timeoutId);
      timeoutId = setTimeout(function () {
        if (holding && !state.wishDone) { finish(); }
      }, DURATION + 120);
    }

    function abort() {
      if (!holding || state.wishDone) return;
      holding = false;
      cancelAnimationFrame(raf);
      clearTimeout(timeoutId);
      fill.style.width = '0%';
      btn.classList.remove('is-down');
      btn.textContent = scene.button;
      hint.textContent = scene.released;
    }

    function finish() {
      cancelAnimationFrame(raf);
      clearTimeout(timeoutId);
      holding = false;
      state.wishDone = true;
      bar.classList.add('is-done');
      btn.classList.remove('is-down');
      btn.textContent = scene.doneButton || scene.done;
      btn.disabled = true;
      flame.classList.add('is-out');
      cake.classList.add('is-flown');
      smoke.classList.remove('is-puff');
      void smoke.offsetWidth;
      smoke.classList.add('is-puff');
      spawnSparks(stage, 16);
      hint.textContent = scene.done;
      cta.hidden = false;
    }

    /* 鼠标 / 触摸 */
    btn.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      begin();
    });
    window.addEventListener('pointerup', abort);
    btn.addEventListener('pointercancel', abort);
    btn.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    cta.addEventListener('click', function () { go(5); });

    /* 空格键按住 */
    state.wishHoldBegin = begin;
    state.wishHoldAbort = abort;
  }

  /* ---------------- 拥抱场景 ---------------- */
  function initHug() {
    var btn = $('#hugBtn');
    var hug = $('#hug');
    var hint = $('#s6Hint');
    var scene = S.scenes[5];

    btn.addEventListener('click', function () {
      if (!state.hugging) {
        state.hugging = true;
        hug.classList.add('is-hugging');
        spawnHearts(10);
        hint.textContent = scene.hugLine;
        btn.textContent = '抱好了 ♡';
      } else {
        spawnHearts(8);
        hint.textContent = scene.hugLine;
      }
    });

    $('#readAgain').addEventListener('click', function () { openLetter('end'); });
  }

  /* ---------------- 信 ---------------- */
  function openLetter(source) {
    state.letterSource = source || null;
    var modal = $('#letterModal');
    modal.hidden = false;
    void modal.offsetWidth;
    modal.classList.add('is-open');
    $('#letterBody').scrollTop = 0;
    $('#letterClose').focus();
  }

  function closeLetter() {
    var modal = $('#letterModal');
    modal.classList.remove('is-open');
    setTimeout(function () {
      modal.hidden = true;
      if (state.letterSource === 'card' && state.scene === 5) {
        go(6);
      }
      state.letterSource = null;
    }, 260);
  }

  /* ---------------- 顶栏：全屏 / 音乐 ---------------- */
  function initHud() {
    var btnFull = $('#btnFull');
    var btnFullText = $('#btnFullText');
    var btnMusic = $('#btnMusic');
    var btnMusicText = $('#btnMusicText');
    var bgm = $('#bgm');

    btnFull.addEventListener('click', function () {
      if (!document.fullscreenElement) {
        var p = document.documentElement.requestFullscreen();
        if (p && p.catch) p.catch(function () { toast('这个浏览器不支持全屏'); });
      } else {
        document.exitFullscreen();
      }
    });

    document.addEventListener('fullscreenchange', function () {
      btnFullText.textContent = document.fullscreenElement ? S.hud.fullscreenOff : S.hud.fullscreenOn;
    });
    btnFullText.textContent = S.hud.fullscreenOn;

    function prepare() {
      if (!bgm.dataset.ready) {
        bgm.src = 'assets/music/bgm.mp3?v=20261029';
        bgm.dataset.ready = '1';
        bgm.volume = 0.55;
      }
    }

    /* 音乐状态实时反映到按钮文字上 */
    bgm.addEventListener('playing', function () {
      btnMusicText.textContent = S.hud.musicOn;
      hideTip();
    });
    bgm.addEventListener('pause', function () {
      btnMusicText.textContent = S.hud.musicOff;
    });

    /* 底部小提示：还没开始放音乐时提醒她点一下 */
    var tip = document.createElement('div');
    tip.className = 'music-tip';
    tip.innerHTML = '<span aria-hidden="true">♪</span> 点一下屏幕，音乐就来';
    document.body.appendChild(tip);
    function hideTip() { tip.classList.remove('is-show'); }
    setTimeout(function () { if (bgm.paused) tip.classList.add('is-show'); }, 2200);

    /* 她第一次点屏幕（或按键）就把音乐放起来；静音失败不打扰 */
    function autoStart() {
      prepare();
      if (!bgm.paused) { hideTip(); return; }
      var p = bgm.play();
      if (p && p.then) {
        p.then(function () { btnMusicText.textContent = S.hud.musicOn; hideTip(); })
          .catch(function () { /* 没放音乐文件时静默失败 */ });
      }
    }

    var armed = true;
    function onFirstTouch() {
      if (!armed) return;
      armed = false;
      document.removeEventListener('pointerdown', onFirstTouch);
      document.removeEventListener('keydown', onFirstTouch);
      autoStart();
    }
    document.addEventListener('pointerdown', onFirstTouch);
    document.addEventListener('keydown', onFirstTouch);
    document.addEventListener('touchstart', onFirstTouch, { passive: true });

    /* 页面一打开先试着放一次（有些浏览器/已授权站点会直接允许） */
    setTimeout(autoStart, 400);

    btnMusic.addEventListener('click', function () {
      prepare();
      if (bgm.paused) {
        var p = bgm.play();
        if (p && p.then) {
          p.then(function () { btnMusicText.textContent = S.hud.musicOn; })
            .catch(function () {
              btnMusicText.textContent = S.hud.musicMissing;
              toast('把喜欢的歌命名成 bgm.mp3，放进 assets/music/ 就能播放');
            });
        }
      } else {
        bgm.pause();
        btnMusicText.textContent = S.hud.musicOff;
      }
    });
    btnMusicText.textContent = S.hud.musicOff;
  }

  /* ---------------- 键盘 ---------------- */
  function initKeys() {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (!$('#letterModal').hidden) { closeLetter(); }
        return;
      }
      if (!$('#letterModal').hidden) return;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (state.scene === 4 && !state.wishDone) {
          if (state.wishHoldBegin) state.wishHoldBegin();
        } else if (state.scene !== 4) {
          go(state.scene + 1);
        }
        return;
      }

      if (e.key === 'ArrowRight') {
        if (state.scene === 5) {
          var cards = $$('#cards .card');
          if (state.card >= cards.length - 1) { openLetter('card'); }
          else { showCard(state.card + 1); }
        } else {
          go(state.scene + 1);
        }
      }

      if (e.key === 'ArrowLeft') {
        if (state.scene === 5) { showCard(state.card - 1); }
        else { go(state.scene - 1); }
      }
    });

    document.addEventListener('keyup', function (e) {
      if ((e.key === ' ' || e.code === 'Space') && state.wishHoldAbort) {
        state.wishHoldAbort();
      }
    });
  }

  /* ---------------- 启动 ---------------- */
  function init() {
    buildSky();
    fillText();

    /* 像素图注入 */
    $$('[data-sprite]').forEach(function (node) {
      node.innerHTML = PA.svg(node.dataset.sprite, parseInt(node.dataset.px, 10) || 10);
    });

    /* 底栏圆点 */
    $('#dots').innerHTML = S.scenes.map(function (s, i) {
      return '<button class="dot' + (i === 0 ? ' is-active' : '') + '" type="button" data-go="' +
        (i + 1) + '" aria-label="' + s.label + '"></button>';
    }).join('');

    $('#dots').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-go]');
      if (btn) go(parseInt(btn.dataset.go, 10));
    });

    buildCards();
    showCard(0);

    /* 卡片翻页（箭头 + 手机左右滑动） */
    function nextCard() {
      var cards = $$('#cards .card');
      if (state.card >= cards.length - 1) { openLetter('card'); }
      else { showCard(state.card + 1); }
    }
    function prevCard() { showCard(state.card - 1); }

    var sx = 0, sy = 0, tracking = false;
    var trackRoot = $('#cards');
    trackRoot.addEventListener('pointerdown', function (e) {
      sx = e.clientX; sy = e.clientY; tracking = true;
    });
    trackRoot.addEventListener('pointerup', function (e) {
      if (!tracking) return;
      tracking = false;
      var dx = e.clientX - sx;
      var dy = e.clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) nextCard(); else prevCard();
      }
    });
    trackRoot.addEventListener('pointercancel', function () { tracking = false; });

    initQuiz();
    initWish();
    initHug();
    initHud();
    initKeys();

    /* 场景 1 → 2 */
    $('#giftBtn').addEventListener('click', function () { go(2); });

    /* 场景 2：点一下继续 */
    $('.scene[data-scene="2"]').addEventListener('click', function () { go(3); });

    /* 卡片翻页按钮 */
    $('#cardPrev').addEventListener('click', function () { showCard(state.card - 1); });
    $('#cardNext').addEventListener('click', nextCard);

    /* 信 */
    $('#letterClose').addEventListener('click', closeLetter);
    $('#letterModal').addEventListener('click', function (e) {
      if (e.target === $('#letterModal')) closeLetter();
    });

    /* 支持 #2 ~ #6 / #5-3（第 5 幕第 3 张卡片）/ #letter 直接定位 */
    var hash = (location.hash || '').replace('#', '');
    if (hash === 'letter') {
      go(5);
      showCard(state.card);
      openLetter('end');
    } else if (/^5-[1-6]$/.test(hash)) {
      go(5);
      showCard(parseInt(hash.split('-')[1], 10) - 1);
    } else if (/^[1-6]$/.test(hash)) {
      go(parseInt(hash, 10));
    } else {
      go(1);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();