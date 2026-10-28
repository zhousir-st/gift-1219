# -*- coding: utf-8 -*-
"""
生成网站背景音乐：雨夜钢琴（原创，免版权，可自由使用）
- 调性：D 大调，63 BPM，I–V–vi–IV 循环
- 左手：根音 + 五度，右手：缓慢琶音 + 稀疏旋律
- 环境：细雨声 + 偶尔的水滴
- 输出：bgm.wav（再用 ffmpeg 压成 bgm.mp3）

用法：python make_bgm.py
"""
import numpy as np
import wave

SR = 44100
BPM = 63.0
BEAT = 60.0 / BPM
BAR = BEAT * 4
REPEATS = 4

# 四个和弦（根音, 三音, 五音）单位 Hz
CHORDS = [
    (146.83, 185.00, 220.00),   # D  : D3 F#3 A3
    (130.81, 164.81, 220.00),   # A/C#: C#3 E3 A3
    (123.47, 146.83, 185.00),   # Bm : B2 D3 F#3
    (98.00, 123.47, 146.83),    # G  : G2 B2 D3
]
ROOTS = [73.42, 65.41, 61.74, 49.00]   # D2 A2 B1 G1

TOTAL = BAR * 4 * REPEATS + 2.0
N = int(TOTAL * SR)
buf = np.zeros((N, 2), dtype=np.float64)


def env_ad(t, attack, decay):
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-decay * t)


def piano(freq, dur, amp, bright=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    harm = [1.0, 0.42 * bright, 0.2 * bright, 0.09 * bright]
    sig = np.zeros(n)
    for i, h in enumerate(harm, start=1):
        sig += h * np.sin(2 * np.pi * freq * i * t + i * 0.3)
    sig *= env_ad(t, 0.008, 1.5)
    # 极轻的起音噪声，像琴槌
    sig[:220] += np.random.randn(220) * 0.012 * np.linspace(1, 0, 220)
    return sig * amp


def bell(freq, dur, amp):
    n = int(dur * SR)
    t = np.arange(n) / SR
    sig = (np.sin(2 * np.pi * freq * t) +
           0.5 * np.sin(2 * np.pi * freq * 2.01 * t) +
           0.22 * np.sin(2 * np.pi * freq * 3.02 * t))
    sig *= env_ad(t, 0.004, 2.6)
    return sig * amp


def add(sig, at, pan=0.0):
    """把一段音频叠加进总线，pan: -1 左 1 右"""
    i = int(at * SR)
    j = min(N, i + len(sig))
    if j <= i:
        return
    seg = sig[: j - i]
    l = np.sqrt(0.5 * (1 - pan))
    r = np.sqrt(0.5 * (1 + pan))
    buf[i:j, 0] += seg * l * 1.414
    buf[i:j, 1] += seg * r * 1.414


rng = np.random.default_rng(20261219)

# ---------- 左手：根音 + 五度 ----------
for rep in range(REPEATS):
    for ci, (chord, root) in enumerate(zip(CHORDS, ROOTS)):
        t0 = (rep * 4 + ci) * BAR
        add(piano(root, BAR * 1.15, 0.17, bright=0.7), t0, pan=-0.12)
        add(piano(root * 1.5, BAR * 1.05, 0.095, bright=0.6), t0 + BEAT * 0.06, pan=-0.1)
        # 第二拍补一个轻的根音
        add(piano(root, BAR * 0.9, 0.075, bright=0.55), t0 + BEAT * 2, pan=-0.08)

# ---------- 右手：琶音 ----------
for rep in range(REPEATS):
    for ci, chord in enumerate(CHORDS):
        t0 = (rep * 4 + ci) * BAR
        pattern = [0, 1, 2, 1, 0, 2, 1, 2]
        for k, idx in enumerate(pattern):
            f = chord[idx] * 2
            at = t0 + k * BEAT * 0.5 + rng.normal(0, 0.012)
            add(piano(f, 1.9, 0.066 + rng.normal(0, 0.01), bright=1.1), max(0, at), pan=0.16)
        # 高八度的弱装饰音
        add(piano(chord[2] * 4, 1.6, 0.035), t0 + BEAT * 2.5, pan=0.35)

# ---------- 旋律（稀疏，像音乐盒） ----------
MELODY = [
    (0, 1.5, 440.00),   # A4
    (2.0, 1.5, 369.99),  # F#4
    (4.0, 1.5, 329.63),  # E4
    (6.0, 1.5, 277.18),  # C#4
    (8.0, 1.5, 293.66),  # D4
    (10.0, 1.5, 369.99), # F#4
    (12.0, 1.5, 493.88), # B4
    (14.0, 2.0, 440.00), # A4
]
for rep in range(REPEATS):
    for beat, dur, f in MELODY:
        add(bell(f, dur * BEAT * 1.6, 0.045), rep * BAR * 4 + beat * BEAT + 0.02, pan=0.05)

# ---------- 细雨 ----------
noise = rng.normal(0, 1, N)
spec = np.fft.rfft(noise)
freqs = np.fft.rfftfreq(N, 1 / SR)
# 带通 + 高频缓降，做出“沙沙”的雨
shape = np.exp(-((np.log(np.clip(freqs, 20, None)) - np.log(2600)) ** 2) / (2 * 0.9 ** 2))
shape *= 1.0 / (1.0 + (freqs / 9000.0) ** 2)
rain = np.fft.irfft(spec * shape, N)
rain /= np.max(np.abs(rain)) + 1e-9
lfo = 0.75 + 0.25 * np.sin(2 * np.pi * 0.037 * np.arange(N) / SR)
rain *= lfo * 0.075
buf[:, 0] += rain
buf[:, 1] += rain * 0.92

# ---------- 偶尔的水滴 ----------
for _ in range(26):
    at = rng.uniform(1.0, TOTAL - 2.0)
    f = rng.uniform(1150, 2600)
    add(bell(f, 0.5, 0.03), at, pan=rng.uniform(-0.6, 0.6))

# ---------- 混响 ----------
ir_len = int(1.5 * SR)
ir_t = np.arange(ir_len) / SR
ir = rng.normal(0, 1, ir_len) * np.exp(-ir_t / 0.45)
ir[: int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))
ir /= np.max(np.abs(ir))

for ch in range(2):
    x = buf[:, ch]
    n_fft = 1 << int(np.ceil(np.log2(len(x) + ir_len)))
    wet = np.fft.irfft(np.fft.rfft(x, n_fft) * np.fft.rfft(ir, n_fft), n_fft)[: len(x)]
    buf[:, ch] = x * 0.86 + wet * 0.28

# ---------- 高通，去掉低频浑浊 ----------\nfor ch in range(2):\n    x = buf[:, ch]\n    sp = np.fft.rfft(x)\n    fr = np.fft.rfftfreq(len(x), 1 / SR)\n    sp *= 1.0 / (1.0 + (55.0 / np.clip(fr, 1e-6, None)) ** 4)\n    buf[:, ch] = np.fft.irfft(sp, len(x))\n\n# ---------- 收尾 ----------
fade_in = int(0.35 * SR)
buf[:fade_in] *= np.linspace(0, 1, fade_in)[:, None]
fade_out = int(0.9 * SR)
buf[-fade_out:] *= np.linspace(1, 0, fade_out)[:, None] ** 1.5

peak = np.max(np.abs(buf))
buf = buf / peak * 0.89
buf = np.tanh(buf * 1.05) * 0.92

pcm = (np.clip(buf, -1, 1) * 32767).astype('<i2')
with wave.open('bgm.wav', 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())

print('ok bgm.wav', round(len(pcm) / SR, 2), 's')