#!/usr/bin/env bash
# Generates the seven disc photos with POCKET-Zimage-CPU (Z-Image-Turbo on CPU).
# https://huggingface.co/FINAL-Bench/POCKET-Zimage-CPU
#
# Needs a stable-diffusion.cpp `sd-cli` binary and three model files in $MODELS:
#   z_image_turbo-Q4_0-pocket.gguf          FINAL-Bench/POCKET-Zimage-CPU
#   Qwen3-4B-Instruct-2507-Q4_K_M.gguf      lmstudio-community/Qwen3-4B-Instruct-2507-GGUF
#   ae.safetensors                          the Z-Image-Turbo VAE
#
# Usage: MODELS=~/models SD_CLI=sd-cli THREADS=8 SIZE=512 scripts/generate-labels.sh
set -euo pipefail

cd "$(dirname "$0")/.."
MODELS="${MODELS:-./models}"
SD_CLI="${SD_CLI:-sd-cli}"
THREADS="${THREADS:-$(nproc)}"   # physical cores, not hyper-threads
SIZE="${SIZE:-512}"
OUT="public/records"
mkdir -p "$OUT"

seed=11
while IFS=$'\t' read -r slug prompt; do
  [ -z "$slug" ] && continue
  if [ -f "$OUT/$slug.png" ]; then echo "skip $slug (exists)"; continue; fi
  echo "==> $slug"
  "$SD_CLI" \
    --diffusion-model "$MODELS/z_image_turbo-Q4_0-pocket.gguf" \
    --vae "$MODELS/ae.safetensors" \
    --llm "$MODELS/Qwen3-4B-Instruct-2507-Q4_K_M.gguf" \
    -p "$prompt" \
    --cfg-scale 1.0 --steps 3 --fa --vae-tiling \
    -t "$THREADS" -H "$SIZE" -W "$SIZE" -s "$seed" \
    -o "$OUT/$slug.png"
  seed=$((seed + 1))
done < scripts/label-prompts.tsv
