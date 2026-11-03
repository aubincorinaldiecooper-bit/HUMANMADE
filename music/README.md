# Funk and soul instrumentals with YuE

`music/YuE` is [YuE](https://github.com/multimodal-art-projection/YuE) (now YuE2), added as a git
submodule pinned to `1116bea`. It turns a short style description into a full piece of music.
Its instrumental workflow writes a score, moves the melody into the instruments, and renders
audio with no vocals.

## What you need

- Linux, Python 3.10 or newer (3.12 is what the authors test), an NVIDIA GPU with BF16 support
  and **24 GB of VRAM**, and at least 24 GB of system RAM. Other GPUs and 8 GB cards are
  experimental: see `YuE/docs/hardware.md`.
- About 7.8 GB of disk for the model files, downloaded from Hugging Face during setup.
- FFmpeg, optional, for MP3 previews. Without it you still get lossless FLAC.
- No GPU? The authors host a free browser demo at https://yue.noizai.net/.

## Set up (once)

```bash
git submodule update --init music/YuE
cd music/YuE/skills/yue2-music/instrumental
python3 scripts/setup_runtime.py install --venv .venv
.venv/bin/python scripts/setup_runtime.py models --output models
.venv/bin/python scripts/setup_runtime.py doctor --require-gpu --models-root models
```

The last command checks the GPU, so run it on the machine that will generate. More detail:
`YuE/skills/yue2-music/instrumental/references/setup.md`.

## Make an instrumental

From `music/YuE/skills/yue2-music/instrumental`:

```bash
.venv/bin/python scripts/instrumental.py run \
  --style "Instrumental, 70s funk, tight drums, slap bass, wah-wah guitar, Rhodes, horn section, groovy, no vocals" \
  --models-root models --offline \
  --output work/funk-01
```

Each run writes to a new folder. Open `work/funk-01/listen/index.html` to play the result,
or take `listen/listening.mp3` / `listen/audio.flac` directly.

Styles to start from:

| Feel | `--style` |
| --- | --- |
| 70s funk | `Instrumental, 70s funk, tight drums, slap bass, wah-wah guitar, Rhodes, horn section, groovy, no vocals` |
| Classic soul | `Instrumental, classic soul, Hammond organ, clean electric guitar, warm bass and drums, string section, mellow, no vocals` |
| Neo-soul | `Instrumental, neo-soul, Rhodes, laid-back swung drums, deep bass, jazzy extended chords, no vocals` |
| Disco-funk | `Instrumental, disco funk, four-on-the-floor drums, octave bass, funky rhythm guitar, brass stabs, upbeat, no vocals` |
| Slow jam | `Instrumental, 70s slow soul ballad, electric piano, soft brushed drums, bass, lush strings, romantic, no vocals` |

To keep a melody you already have, pass an ABC score with `--abc`. To cover a recording,
see `YuE/skills/yue2-music/instrumental/references/cover.md`.

## Licence

YuE's code is Apache 2.0. Its model weights are CC BY-NC 4.0 with an added creator
permission: individual creators and musicians may sell and license what they make, with no
fees or royalties. Companies using the weights commercially need a separate licence from the
authors. Full terms: `YuE/MODEL_LICENSE`.
